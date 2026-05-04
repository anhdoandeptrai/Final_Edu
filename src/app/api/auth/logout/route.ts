import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, deleteSessionFromRequest } from '../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    await deleteSessionFromRequest(req)

    const response = NextResponse.json({ ok: true })
    clearSessionCookie(response)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
