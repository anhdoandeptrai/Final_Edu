import { NextRequest, NextResponse } from 'next/server'
import {
  getAssignmentAccessInfo,
  getSubmissionAccessInfo,
  gradeSubmission,
  isTeacherOfClass,
} from '../../../../../features/lms/server/store'
import { getAuthUserFromRequest } from '../../../../../features/auth/server/session'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can grade submissions' }, { status: 403 })
  }

  const body = await req.json()
  const submissionId = String(body?.submissionId || '').trim()
  const score = Number(body?.score)
  const feedback = String(body?.feedback || '')

  if (!submissionId || Number.isNaN(score)) {
    return NextResponse.json({ error: 'Missing or invalid grading fields' }, { status: 400 })
  }

  const submissionInfo = await getSubmissionAccessInfo(submissionId)
  if (!submissionInfo) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const assignmentInfo = await getAssignmentAccessInfo(submissionInfo.assignmentId)
  if (!assignmentInfo) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const ownsClass = await isTeacherOfClass(user.id, assignmentInfo.classId)
  if (!ownsClass) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await gradeSubmission({
    submissionId,
    score,
    maxScore: assignmentInfo.maxScore,
    feedback,
  })
  return NextResponse.json(result, { status: result.ok ? 200 : 404 })
}
