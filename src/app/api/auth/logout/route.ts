import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, deleteSessionFromRequest } from '../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  await deleteSessionFromRequest(req)

  const response = NextResponse.json({ ok: true })
  clearSessionCookie(response)
  return response
}
