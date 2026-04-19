import { LmsAssignment, LmsClass, LmsLesson, LmsRole, LmsSubmission } from './types'

const BASE = '/api/lms'

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || 'Yeu cau that bai')
  }
  return data as T
}

export async function listClassesForUser(userId: string, role: LmsRole): Promise<LmsClass[]> {
  const params = new URLSearchParams({ userId, role })
  const response = await fetch(`${BASE}/classes?${params.toString()}`, { cache: 'no-store' })
  const data = await parseResponse<{ classes: LmsClass[] }>(response)
  return data.classes
}

export async function createClass(payload: {
  name: string
  description: string
  teacherId: string
  teacherName: string
}): Promise<LmsClass> {
  const response = await fetch(`${BASE}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse<{ class: LmsClass }>(response)
  return data.class
}

export async function joinClassByCode(joinCode: string, studentId: string): Promise<{ ok: boolean; message: string }> {
  const response = await fetch(`${BASE}/classes/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ joinCode, studentId }),
  })

  if (response.status === 404) {
    const data = await response.json()
    return { ok: false, message: data?.message || 'Khong tim thay lop hoc voi ma nay' }
  }

  return parseResponse<{ ok: boolean; message: string }>(response)
}

export async function listLessonsByClass(classId: string): Promise<LmsLesson[]> {
  const params = new URLSearchParams({ classId })
  const response = await fetch(`${BASE}/lessons?${params.toString()}`, { cache: 'no-store' })
  const data = await parseResponse<{ lessons: LmsLesson[] }>(response)
  return data.lessons
}

export async function createLesson(payload: {
  classId: string
  title: string
  description: string
  content: string
  resourceUrl?: string
  createdBy: string
}): Promise<LmsLesson> {
  const response = await fetch(`${BASE}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse<{ lesson: LmsLesson }>(response)
  return data.lesson
}

export async function listAssignmentsByClass(classId: string): Promise<LmsAssignment[]> {
  const params = new URLSearchParams({ classId })
  const response = await fetch(`${BASE}/assignments?${params.toString()}`, { cache: 'no-store' })
  const data = await parseResponse<{ assignments: LmsAssignment[] }>(response)
  return data.assignments
}

export async function createAssignment(payload: {
  classId: string
  title: string
  instructions: string
  dueAt: number
  maxScore: number
  createdBy: string
}): Promise<LmsAssignment> {
  const response = await fetch(`${BASE}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse<{ assignment: LmsAssignment }>(response)
  return data.assignment
}

export async function listSubmissionsByAssignment(assignmentId: string): Promise<LmsSubmission[]> {
  const params = new URLSearchParams({ assignmentId })
  const response = await fetch(`${BASE}/submissions?${params.toString()}`, { cache: 'no-store' })
  const data = await parseResponse<{ submissions?: LmsSubmission[]; submission?: LmsSubmission | null }>(response)

  if (Array.isArray(data.submissions)) {
    return data.submissions
  }

  if (data.submission) {
    return [data.submission]
  }

  return []
}

export async function submitAssignment(payload: {
  assignmentId: string
  classId: string
  studentId: string
  studentName: string
  content: string
}): Promise<LmsSubmission> {
  const response = await fetch(`${BASE}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse<{ submission: LmsSubmission }>(response)
  return data.submission
}

export async function gradeSubmission(payload: {
  submissionId: string
  score: number
  maxScore: number
  feedback: string
}): Promise<{ ok: boolean; message: string }> {
  const response = await fetch(`${BASE}/submissions/grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (response.status === 404) {
    const data = await response.json()
    return { ok: false, message: data?.message || 'Khong tim thay bai nop' }
  }

  return parseResponse<{ ok: boolean; message: string }>(response)
}
