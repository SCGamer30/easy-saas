import { NextResponse } from 'next/server'

/**
 * Health check endpoint for uptime monitors (Betterstack, UptimeRobot, etc.).
 *
 * Returns 200 { status: 'ok' } when the process is alive.
 * Point your monitor at: GET /api/health
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
