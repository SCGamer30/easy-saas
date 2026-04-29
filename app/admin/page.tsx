import { requireRole } from '@/lib/roles'
import { generateMeta } from '@/lib/metadata'
import { AdminDashboard } from './admin-dashboard'

export const metadata = generateMeta({
  title: 'Admin',
  description: 'Admin dashboard.',
  path: '/admin',
  noIndex: true,
})

/**
 * Admin panel — only accessible to users with role: 'admin' in Clerk publicMetadata.
 *
 * To grant access:
 *   Clerk dashboard → Users → [user] → Metadata → Public → { "role": "admin" }
 *
 * Or programmatically via the Clerk Backend SDK:
 *   await clerkClient.users.updateUserMetadata(userId, {
 *     publicMetadata: { role: 'admin' },
 *   })
 */
export default async function AdminPage() {
  // Redirects to /dashboard if not admin
  await requireRole('admin')

  return <AdminDashboard />
}
