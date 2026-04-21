'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function useUser() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser()
  const clerkId = clerkUser?.id

  const convexUser = useQuery(api.users.getUser, clerkId ? { clerkId } : 'skip')

  const subscription = useQuery(
    api.subscriptions.getSubscriptionByClerkId,
    clerkId ? { clerkId } : 'skip',
  )

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const plan = subscription?.plan ?? null
  const isPro = isActive && plan === 'pro'
  const isStudio = isActive && plan === 'studio'

  return {
    clerkUser,
    user: convexUser ?? null,
    subscription: subscription ?? null,
    plan,
    isPro,
    isStudio,
    isPaid: isActive,
    isSignedIn,
    isLoaded: clerkLoaded && (!clerkId || (convexUser !== undefined && subscription !== undefined)),
  }
}
