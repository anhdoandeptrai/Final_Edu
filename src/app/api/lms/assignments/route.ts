import { NextRequest, NextResponse } from 'next/server'
import {
  createAssignment,
  hasClassAccess,
  isTeacherOfClass,
  listAssignmentsByClass,
} from '../../../../features/lms/server/store'
import { getAuthUserFromRequest } from '../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const classId = req.nextUrl.searchParams.get('classId') || ''
  if (!classId) {
    return NextResponse.json({ error: 'Missing classId' }, { status: 400 })
  }

  const allowed = await hasClassAccess(user.id, user.role, classId)
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const assignments = await listAssignmentsByClass(classId)
  return NextResponse.json({ assignments })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can create assignments' }, { status: 403 })
  }

  const body = await req.json()
  const classId = String(body?.classId || '').trim()
  const title = String(body?.title || '').trim()
  const instructions = String(body?.instructions || '').trim()
  const dueAt = Number(body?.dueAt || 0)
  const maxScore = Number(body?.maxScore || 0)

  if (!classId || !title || !instructions || !dueAt || !maxScore) {
    return NextResponse.json({ error: 'Missing required assignment fields' }, { status: 400 })
  }

  const ownsClass = await isTeacherOfClass(user.id, classId)
  if (!ownsClass) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const assignment = await createAssignment({
    classId,
    title,
    instructions,
    dueAt,
    maxScore,
    createdBy: user.id,
  })
  return NextResponse.json({ assignment })
}
