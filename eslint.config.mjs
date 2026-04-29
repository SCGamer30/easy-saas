import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'convex/_generated/**', 'graphify-out/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // These fire on legitimate hydration / mount-detection patterns
      // (e.g. theme toggle "mounted" guards, localStorage reads). The
      // recommended useSyncExternalStore migration is a larger refactor;
      // demote to warning until then.
      'react-hooks/set-state-in-effect': 'warn',
      'import/no-anonymous-default-export': 'warn',
    },
  },
]

export default eslintConfig
