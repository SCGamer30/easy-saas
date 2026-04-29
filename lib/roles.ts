import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

/**
 * Returns the role stored in the current user's Clerk publicMetadata.
 * Set a user's role in the Clerk dashboard:
 *   Users → [user] → Metadata → Public → { "role": "admin" }
 *
 * Or via the Clerk Backend API / SDK when you want to do it programmatically.
 */
export async function getRole(): Promise<string | null> {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as { role?: string } | undefined
  return metadata?.role ?? null
}

/**
 * Returns true when the signed-in user has the given role.
 * Always returns false for unauthenticated requests.
 */
export async function hasRole(role: string): Promise<boolean> {
  return (await getRole()) === role
}

/**
 * Throws a redirect to /dashboard if the user does not have the given role.
 * Use at the top of admin Server Components / Route Handlers.
 *
 * import { requireRole } from '@/lib/roles'
 * export default async function AdminPage() {
 *   await requireRole('admin')
 *   ...
 * }
 */
/**
 * Throws a redirect to /dashboard if the user does not have the given role.
 * Use at the top of admin **Server Components / Pages** only.
 *
 * For Route Handlers, use requireRoleApi() instead — redirect() inside a
 * Route Handler returns a 307, not a 401, which confuses API clients.
 */
export async function requireRole(role: string): Promise<void> {
  const { redirect } = await import('next/navigation')
  const ok = await hasRole(role)
  if (!ok) redirect('/dashboard')
}

/**
 * Returns a 403 NextResponse if the user does not have the given role.
 * Use at the top of admin **Route Handlers**.
 *
 * import { requireRoleApi } from '@/lib/roles'
 * export async function GET() {
 *   const denied = await requireRoleApi('admin')
 *   if (denied) return denied
 *   ...
 * }
 */
export async function requireRoleApi(role: string): Promise<NextResponse | null> {
  const ok = await hasRole(role)
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}
