import { NextRequest, NextResponse } from 'next/server'
import {
  getAssignmentAccessInfo,
  getSubmissionForStudent,
  isStudentInClass,
  isTeacherOfClass,
  listSubmissionsByAssignment,
  submitAssignment,
} from '../../../../features/lms/server/store'
import { getAuthUserFromRequest } from '../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assignmentId = req.nextUrl.searchParams.get('assignmentId') || ''

  if (!assignmentId) {
    return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 })
  }

  const assignment = await getAssignmentAccessInfo(assignmentId)
  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  if (user.role === 'teacher') {
    const ownsClass = await isTeacherOfClass(user.id, assignment.classId)
    if (!ownsClass) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const submissions = await listSubmissionsByAssignment(assignmentId)
    return NextResponse.json({ submissions })
  }

  const isEnrolled = await isStudentInClass(user.id, assignment.classId)
  if (!isEnrolled) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const submission = await getSubmissionForStudent(assignmentId, user.id)
  return NextResponse.json({ submission })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'student') {
    return NextResponse.json({ error: 'Only students can submit assignments' }, { status: 403 })
  }

  const body = await req.json()
  const assignmentId = String(body?.assignmentId || '').trim()
  const content = String(body?.content || '').trim()

  if (!assignmentId || !content) {
    return NextResponse.json({ error: 'Missing required submission fields' }, { status: 400 })
  }

  const assignment = await getAssignmentAccessInfo(assignmentId)
  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const isEnrolled = await isStudentInClass(user.id, assignment.classId)
  if (!isEnrolled) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const submission = await submitAssignment({
    assignmentId,
    classId: assignment.classId,
    studentId: user.id,
    studentName: user.name,
    content,
  })
  return NextResponse.json({ submission })
}
