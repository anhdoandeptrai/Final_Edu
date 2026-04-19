import { NextRequest, NextResponse } from 'next/server'
import { joinClassByCode } from '../../../../../features/lms/server/store'
import { getAuthUserFromRequest } from '../../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'student') {
    return NextResponse.json({ error: 'Only students can join classes' }, { status: 403 })
  }

  const body = await req.json()
  const joinCode = String(body?.joinCode || '').trim()

  if (!joinCode) {
    return NextResponse.json({ error: 'Missing joinCode' }, { status: 400 })
  }

  const result = await joinClassByCode(joinCode, user.id)
  return NextResponse.json(result, { status: result.ok ? 200 : 404 })
}
