import { NextRequest, NextResponse } from 'next/server'
import { createClass, listClassesForUser } from '../../../../features/lms/server/store'
import { getAuthUserFromRequest } from '../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const classes = await listClassesForUser(user.id, user.role)
  return NextResponse.json({ classes })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const name = String(body?.name || '').trim()
  const description = String(body?.description || '').trim()

  if (!name) {
    return NextResponse.json({ error: 'Missing required class fields' }, { status: 400 })
  }

  const created = await createClass({
    name,
    description,
    teacherId: user.id,
    teacherName: user.name,
  })
  return NextResponse.json({ class: created })
}
