'use client'

import { useFeatureFlagEnabled, useFeatureFlagVariantKey } from 'posthog-js/react'

/**
 * Returns true when a boolean PostHog feature flag is enabled for the current user.
 * Falls back to `defaultValue` when PostHog is not configured or the flag is unknown.
 *
 * Usage:
 *   const showBetaNav = useFeatureFlag('beta-nav')
 *   if (showBetaNav) return <NewNav />
 */
export function useFeatureFlag(flag: string, defaultValue = false): boolean {
  // useFeatureFlagEnabled returns undefined while loading, true/false once resolved.
  const enabled = useFeatureFlagEnabled(flag)
  if (enabled === undefined) return defaultValue
  return enabled
}

/**
 * Returns the active variant key for a multivariate PostHog feature flag.
 * Falls back to `defaultVariant` when PostHog is not configured or the flag is unknown.
 *
 * Usage:
 *   const variant = useFeatureFlagVariant('pricing-experiment')
 *   // variant === 'control' | 'variant-a' | 'variant-b' | null
 */
export function useFeatureFlagVariant(
  flag: string,
  defaultVariant: string | null = null,
): string | null {
  const variant = useFeatureFlagVariantKey(flag)
  if (variant === undefined || variant === false) return defaultVariant
  return variant as string
}
