import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { LmsAssignment, LmsClass, LmsLesson, LmsRole, LmsSubmission } from '../types'

const JOIN_CODE_MAX_RETRIES = 5

function createJoinCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function mapClass(item: {
  id: string
  name: string
  description: string
  teacherId: string
  teacherName: string
  joinCode: string
  createdAt: Date
  enrollments?: Array<{ studentId: string }>
}): LmsClass {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    teacherId: item.teacherId,
    teacherName: item.teacherName,
    joinCode: item.joinCode,
    studentIds: item.enrollments?.map((enrollment) => enrollment.studentId) || [],
    createdAt: item.createdAt.getTime(),
  }
}

function mapLesson(item: {
  id: string
  classId: string
  title: string
  description: string
  content: string
  resourceUrl: string | null
  createdBy: string
  createdAt: Date
}): LmsLesson {
  return {
    id: item.id,
    classId: item.classId,
    title: item.title,
    description: item.description,
    content: item.content,
    resourceUrl: item.resourceUrl || undefined,
    createdBy: item.createdBy,
    createdAt: item.createdAt.getTime(),
  }
}

function mapAssignment(item: {
  id: string
  classId: string
  title: string
  instructions: string
  dueAt: Date
  maxScore: number
  createdBy: string
  createdAt: Date
}): LmsAssignment {
  return {
    id: item.id,
    classId: item.classId,
    title: item.title,
    instructions: item.instructions,
    dueAt: item.dueAt.getTime(),
    maxScore: item.maxScore,
    createdBy: item.createdBy,
    createdAt: item.createdAt.getTime(),
  }
}

function mapSubmission(item: {
  id: string
  assignmentId: string
  classId: string
  studentId: string
  studentName: string
  content: string
  submittedAt: Date
  status: 'submitted' | 'reviewed'
  reviewedAt: Date | null
  score: number | null
  feedback: string | null
}): LmsSubmission {
  return {
    id: item.id,
    assignmentId: item.assignmentId,
    classId: item.classId,
    studentId: item.studentId,
    studentName: item.studentName,
    content: item.content,
    submittedAt: item.submittedAt.getTime(),
    status: item.status,
    reviewedAt: item.reviewedAt ? item.reviewedAt.getTime() : undefined,
    score: item.score ?? undefined,
    feedback: item.feedback ?? undefined,
  }
}

export async function listClassesForUser(userId: string, role: LmsRole): Promise<LmsClass[]> {
  if (role === 'teacher') {
    const classes = await prisma.lmsClass.findMany({
      where: { teacherId: userId },
      include: { enrollments: { select: { studentId: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return classes.map(mapClass)
  }

  const classes = await prisma.lmsClass.findMany({
    where: { enrollments: { some: { studentId: userId } } },
    include: { enrollments: { select: { studentId: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return classes.map(mapClass)
}

export async function createClass(payload: {
  name: string
  description: string
  teacherId: string
  teacherName: string
}): Promise<LmsClass> {
  for (let attempt = 0; attempt < JOIN_CODE_MAX_RETRIES; attempt += 1) {
    try {
      const created = await prisma.lmsClass.create({
        data: {
          name: payload.name,
          description: payload.description,
          teacherId: payload.teacherId,
          teacherName: payload.teacherName,
          joinCode: createJoinCode(),
        },
        include: { enrollments: { select: { studentId: true } } },
      })

      return mapClass(created)
    } catch (error) {
      // Retry if joinCode hits the unique constraint; throw for other errors.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
        throw error
      }
    }
  }

  throw new Error('Failed to generate a unique join code. Please try again.')
}

export async function joinClassByCode(joinCode: string, studentId: string): Promise<{ ok: boolean; message: string }> {
  const normalized = joinCode.trim().toUpperCase()
  const target = await prisma.lmsClass.findUnique({ where: { joinCode: normalized } })

  if (!target) {
    return { ok: false, message: 'Không tìm thấy lớp học với mã này' }
  }

  await prisma.lmsClassEnrollment.upsert({
    where: {
      classId_studentId: {
        classId: target.id,
        studentId,
      },
    },
    update: {},
    create: {
      classId: target.id,
      studentId,
    },
  })

  return { ok: true, message: 'Tham gia lớp học thành công' }
}

export async function listLessonsByClass(classId: string): Promise<LmsLesson[]> {
  const lessons = await prisma.lmsLesson.findMany({
    where: { classId },
    orderBy: { createdAt: 'desc' },
  })

  return lessons.map(mapLesson)
}

export async function createLesson(payload: {
  classId: string
  title: string
  description: string
  content: string
  resourceUrl?: string
  createdBy: string
}): Promise<LmsLesson> {
  const lesson = await prisma.lmsLesson.create({
    data: {
      classId: payload.classId,
      title: payload.title,
      description: payload.description,
      content: payload.content,
      resourceUrl: payload.resourceUrl,
      createdBy: payload.createdBy,
    },
  })

  return mapLesson(lesson)
}

export async function listAssignmentsByClass(classId: string): Promise<LmsAssignment[]> {
  const assignments = await prisma.lmsAssignment.findMany({
    where: { classId },
    orderBy: { createdAt: 'desc' },
  })

  return assignments.map(mapAssignment)
}

export async function createAssignment(payload: {
  classId: string
  title: string
  instructions: string
  dueAt: number
  maxScore: number
  createdBy: string
}): Promise<LmsAssignment> {
  const assignment = await prisma.lmsAssignment.create({
    data: {
      classId: payload.classId,
      title: payload.title,
      instructions: payload.instructions,
      dueAt: new Date(payload.dueAt),
      maxScore: payload.maxScore,
      createdBy: payload.createdBy,
    },
  })

  return mapAssignment(assignment)
}

export async function listSubmissionsByAssignment(assignmentId: string): Promise<LmsSubmission[]> {
  const submissions = await prisma.lmsSubmission.findMany({
    where: { assignmentId },
    orderBy: { submittedAt: 'desc' },
  })

  return submissions.map(mapSubmission)
}

export async function getSubmissionForStudent(assignmentId: string, studentId: string): Promise<LmsSubmission | null> {
  const submission = await prisma.lmsSubmission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId,
      },
    },
  })

  return submission ? mapSubmission(submission) : null
}

export async function submitAssignment(payload: {
  assignmentId: string
  classId: string
  studentId: string
  studentName: string
  content: string
}): Promise<LmsSubmission> {
  const submission = await prisma.lmsSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: payload.assignmentId,
        studentId: payload.studentId,
      },
    },
    create: {
      assignmentId: payload.assignmentId,
      classId: payload.classId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      content: payload.content,
      status: 'submitted',
    },
    update: {
      content: payload.content,
      submittedAt: new Date(),
      status: 'submitted',
      score: null,
      feedback: null,
      reviewedAt: null,
    },
  })

  return mapSubmission(submission)
}

export async function gradeSubmission(payload: {
  submissionId: string
  score: number
  maxScore: number
  feedback: string
}): Promise<{ ok: boolean; message: string; submission?: LmsSubmission }> {
  const target = await prisma.lmsSubmission.findUnique({ where: { id: payload.submissionId } })

  if (!target) {
    return { ok: false, message: 'Không tìm thấy bài nộp để chấm điểm' }
  }

  const boundedScore = Math.max(0, Math.min(payload.maxScore, payload.score))

  const updated = await prisma.lmsSubmission.update({
    where: { id: payload.submissionId },
    data: {
      score: boundedScore,
      feedback: payload.feedback.trim(),
      status: 'reviewed',
      reviewedAt: new Date(),
    },
  })

  return { ok: true, message: `Đã lưu điểm ${boundedScore}/${payload.maxScore}`, submission: mapSubmission(updated) }
}

export async function isTeacherOfClass(userId: string, classId: string): Promise<boolean> {
  const cls = await prisma.lmsClass.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  })

  return cls?.teacherId === userId
}

export async function isStudentInClass(userId: string, classId: string): Promise<boolean> {
  const enrollment = await prisma.lmsClassEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId: userId,
      },
    },
    select: { classId: true },
  })

  return !!enrollment
}

export async function hasClassAccess(userId: string, role: LmsRole, classId: string): Promise<boolean> {
  if (role === 'teacher') {
    return isTeacherOfClass(userId, classId)
  }

  return isStudentInClass(userId, classId)
}

export async function getAssignmentAccessInfo(assignmentId: string): Promise<{
  id: string
  classId: string
  dueAt: Date
  maxScore: number
} | null> {
  return prisma.lmsAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      classId: true,
      dueAt: true,
      maxScore: true,
    },
  })
}

export async function getSubmissionAccessInfo(submissionId: string): Promise<{
  id: string
  assignmentId: string
  classId: string
  studentId: string
} | null> {
  return prisma.lmsSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      assignmentId: true,
      classId: true,
      studentId: true,
    },
  })
}
