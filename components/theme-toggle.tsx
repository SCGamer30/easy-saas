'use client'

// Light/dark/system theme toggle. Uses next-themes (wired in
// components/providers.tsx) to flip the `data-theme` attribute on <html>,
// which the CSS variables in app/globals.css respond to.
//
// Drop into a header or settings panel:
//   import { ThemeToggle } from '@/components/theme-toggle'
//   <ThemeToggle />

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render the active state after mount
  useEffect(() => setMounted(true), [])

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        'inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
              active
                ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            <Icon size={14} weight={active ? 'fill' : 'regular'} />
          </button>
        )
      })}
    </div>
  )
}
