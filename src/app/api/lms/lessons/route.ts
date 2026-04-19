import { NextRequest, NextResponse } from 'next/server'
import {
  createLesson,
  hasClassAccess,
  isTeacherOfClass,
  listLessonsByClass,
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

  const lessons = await listLessonsByClass(classId)
  return NextResponse.json({ lessons })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can create lessons' }, { status: 403 })
  }

  const body = await req.json()
  const classId = String(body?.classId || '').trim()
  const title = String(body?.title || '').trim()
  const description = String(body?.description || '').trim()
  const content = String(body?.content || '').trim()
  const resourceUrl = String(body?.resourceUrl || '').trim() || undefined

  if (!classId || !title || !content) {
    return NextResponse.json({ error: 'Missing required lesson fields' }, { status: 400 })
  }

  const ownsClass = await isTeacherOfClass(user.id, classId)
  if (!ownsClass) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await createLesson({
    classId,
    title,
    description,
    content,
    resourceUrl,
    createdBy: user.id,
  })
  return NextResponse.json({ lesson })
}
