#!/usr/bin/env node

// easy-saas CLI
//
// Bootstrap the easy-saas boilerplate into the current directory.
// Designed to be run inside an empty git repo (e.g. one you just cloned
// from a fresh GitHub project).
//
// Usage:
//   npx easy-saas init [--force] [--no-skills] [--no-install] [--ref <branch>]
//   npx easy-saas help
//
// Flow:
//   1. Verify the current directory is empty-ish (only .git/README/LICENSE allowed)
//   2. Fetch the boilerplate from GitHub via shallow clone into a temp dir
//   3. Copy files into cwd (skipping CLI internals + generated artifacts)
//   4. Rename package.json to match the directory name
//   5. cp .env.example .env.local
//   6. npm install
//   7. ./setup-skills.sh --full  (non-interactive)
//   8. Print "now run /setup in Claude Code"

import { execSync, spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_URL = 'https://github.com/SCGamer30/easy-saas.git'

// Files allowed to exist in cwd before init — anything else triggers a refusal
// unless --force is passed. Lowercase + uppercase variants are normalised.
const ALLOWED_EXISTING = new Set([
  '.git',
  '.gitignore',
  '.gitattributes',
  'readme.md',
  'license',
  'license.md',
  'license.txt',
  '.ds_store',
])

// Paths from the boilerplate repo we DON'T want to copy into the user's project.
// Anything CLI-only or auto-generated.
const SKIP_FROM_TEMPLATE = new Set([
  '.git',
  'cli',
  'node_modules',
  '.next',
  'graphify-out',
  'convex/_generated',
  '.env.local',
  '.vercel',
])

const args = process.argv.slice(2)
const cmd = args[0] ?? 'init'

if (cmd === '-h' || cmd === '--help' || cmd === 'help') {
  printHelp()
  process.exit(0)
}

if (cmd === '-v' || cmd === '--version') {
  printVersion()
  process.exit(0)
}

if (cmd !== 'init') {
  console.error(`Unknown command: ${cmd}`)
  printHelp()
  process.exit(1)
}

const flags = parseFlags(args.slice(1))

try {
  await init(flags)
} catch (err) {
  console.error('')
  console.error(`Error: ${err.message}`)
  process.exit(1)
}

// -----------------------------------------------------------------------------

async function init({ force, skills, install, ref }) {
  const cwd = process.cwd()
  const projectName = sanitizeProjectName(basename(cwd))

  log(`Bootstrapping easy-saas into ${cwd}`)
  log(`Project name: ${projectName}`)

  // 1. Empty-ish directory check
  const offending = readdirSync(cwd).filter(
    (entry) => !ALLOWED_EXISTING.has(entry.toLowerCase()),
  )
  if (offending.length > 0 && !force) {
    console.error('')
    console.error('Refusing to initialise — current directory is not empty.')
    console.error('Unexpected entries:')
    offending.forEach((f) => console.error(`  ${f}`))
    console.error('')
    console.error('Run inside an empty directory, or pass --force to bootstrap anyway.')
    console.error('(--force will write boilerplate files alongside existing ones; use with care.)')
    process.exit(1)
  }

  // 2. Required CLIs
  ensureBin('git', 'Install git from https://git-scm.com/')
  ensureBin('node', 'Install Node.js 20+ from https://nodejs.org/')
  ensureBin('npm', 'Comes with Node.js')

  // 3. Fetch boilerplate via shallow clone into tmp
  const tmp = mkdtempSync(join(tmpdir(), 'easy-saas-'))
  log(`Fetching boilerplate (ref: ${ref}) into temp dir`)
  const cloneArgs = ['clone', '--depth', '1']
  if (ref && ref !== 'master' && ref !== 'main') {
    cloneArgs.push('--branch', ref)
  }
  cloneArgs.push(REPO_URL, tmp)
  const clone = spawnSync('git', cloneArgs, { stdio: 'inherit' })
  if (clone.status !== 0) {
    rmSync(tmp, { recursive: true, force: true })
    throw new Error('git clone failed')
  }

  // 4. Copy files from tmp → cwd, skipping CLI internals + generated dirs
  log('Copying boilerplate files into current directory')
  copyTemplate(tmp, cwd)

  // 5. Rename package.json
  log('Updating package.json name')
  const pkgPath = join(cwd, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    pkg.name = projectName
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  // 6. AGENTS.md / CLAUDE.md title rename
  for (const file of ['AGENTS.md', 'CLAUDE.md']) {
    const path = join(cwd, file)
    if (!existsSync(path)) continue
    const body = readFileSync(path, 'utf8').replace(
      /^# Project Context for AI Agents/m,
      `# ${projectName} - Project Context for AI Agents`,
    )
    writeFileSync(path, body)
  }

  // 7. .env.local from .env.example
  const envExample = join(cwd, '.env.example')
  const envLocal = join(cwd, '.env.local')
  if (existsSync(envExample) && !existsSync(envLocal)) {
    log('Creating .env.local from .env.example')
    cpSync(envExample, envLocal)
  }

  // 8. npm install
  if (install) {
    log('Installing dependencies (this can take a couple of minutes)')
    runStreamed('npm', ['install'], { cwd })
  } else {
    warn('Skipping npm install (--no-install). Run `npm install` before starting.')
  }

  // 9. Skills install
  if (skills) {
    const setupSkills = join(cwd, 'setup-skills.sh')
    if (existsSync(setupSkills)) {
      log('Installing agent skills (non-interactive)')
      // CI=1 + npm_config_yes=true makes npx and most CLIs skip prompts.
      const env = { ...process.env, CI: '1', npm_config_yes: 'true' }
      const result = spawnSync('bash', [setupSkills, '--full'], {
        cwd,
        stdio: 'inherit',
        env,
      })
      if (result.status !== 0) {
        warn('Some skills failed to install. Re-run `./setup-skills.sh --full` later.')
      }
    } else {
      warn('setup-skills.sh missing; skipping skill install.')
    }
  } else {
    warn('Skipping skill install (--no-skills). Run `./setup-skills.sh --full` later.')
  }

  // 10. graphify — auto-install via pip3 if missing, then build the graph
  if (commandExists('python3')) {
    const probe = spawnSync('python3', ['-c', 'import graphify'], { stdio: 'pipe' })
    if (probe.status !== 0) {
      log('Installing graphify (pip3)')
      const pip = commandExists('pip3') ? 'pip3' : 'pip'
      spawnSync(pip, ['install', '--quiet', '--user', 'graphify'], { stdio: 'inherit' })
    }
    log('Building graphify knowledge graph')
    const build = spawnSync(
      'python3',
      ['-m', 'graphify', '.', '--output', 'graphify-out/'],
      { cwd, stdio: 'pipe' },
    )
    if (build.status !== 0) {
      warn('graphify build failed — run `python3 -m graphify . --output graphify-out/` later.')
    }
  } else {
    warn('python3 not found — skipping graphify. Install Python 3 and rerun later.')
  }

  // 11. Cleanup
  rmSync(tmp, { recursive: true, force: true })

  // 12. Done
  console.log('')
  console.log('============================================================')
  console.log(`  ${projectName} is ready`)
  console.log('============================================================')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Open Claude Code in this directory')
  console.log('  2. Run  /setup')
  console.log('')
  console.log('Claude Code will provision Convex, Vercel, Sentry, Cloudflare,')
  console.log('and walk you through every remaining manual step.')
  console.log('')
}

function copyTemplate(srcRoot, destRoot) {
  for (const entry of readdirSync(srcRoot, { withFileTypes: true })) {
    if (SKIP_FROM_TEMPLATE.has(entry.name)) continue
    const src = join(srcRoot, entry.name)
    const dest = join(destRoot, entry.name)
    cpSync(src, dest, {
      recursive: entry.isDirectory(),
      force: true,
      preserveTimestamps: true,
      filter: (s) => {
        const rel = s.slice(srcRoot.length + 1)
        for (const skipped of SKIP_FROM_TEMPLATE) {
          if (rel === skipped || rel.startsWith(skipped + '/')) return false
        }
        return true
      },
    })
  }
}

function sanitizeProjectName(raw) {
  // Match npm naming rules: lowercase, no spaces, no leading dot/underscore
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9_\-]/g, '-')
      .replace(/^[._-]+/, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'easy-saas-app'
  )
}

function parseFlags(rest) {
  let force = false
  let skills = true
  let install = true
  let ref = 'master'
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--force' || a === '-f') force = true
    else if (a === '--no-skills') skills = false
    else if (a === '--no-install') install = false
    else if (a === '--ref') ref = rest[++i]
    else if (a.startsWith('--ref=')) ref = a.slice(6)
    else {
      console.error(`Unknown flag: ${a}`)
      printHelp()
      process.exit(1)
    }
  }
  return { force, skills, install, ref }
}

function ensureBin(name, hint) {
  if (!commandExists(name)) {
    throw new Error(`Missing required CLI: ${name}\n  → ${hint}`)
  }
}

function commandExists(name) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], {
    stdio: 'pipe',
  })
  return r.status === 0
}

function runStreamed(bin, argv, opts) {
  const r = spawnSync(bin, argv, { stdio: 'inherit', ...opts })
  if (r.status !== 0) {
    throw new Error(`${bin} ${argv.join(' ')} exited with code ${r.status}`)
  }
}

function log(msg) {
  console.log(`==> ${msg}`)
}

function warn(msg) {
  console.warn(`Warning: ${msg}`)
}

function printVersion() {
  const here = fileURLToPath(new URL('./package.json', import.meta.url))
  const pkg = JSON.parse(readFileSync(here, 'utf8'))
  console.log(pkg.version)
}

function printHelp() {
  console.log(`easy-saas — bootstrap a production Next.js SaaS starter

Usage:
  npx easy-saas init [options]
  npx easy-saas help

Options:
  --force          Bootstrap into a non-empty directory (use with care)
  --no-skills     Skip the agent-skills install step
  --no-install    Skip 'npm install'
  --ref <branch>  Pull the boilerplate from a non-default branch (default: master)
  -h, --help      Show this help
  -v, --version   Show version

Recommended flow:
  1. Create a fresh GitHub repo via the browser
  2. Clone it locally and 'cd' in
  3. Run: npx easy-saas init
  4. Open Claude Code and run /setup
`)
}
