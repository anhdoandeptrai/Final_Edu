import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ user })
}
