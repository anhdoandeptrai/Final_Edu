export type LmsRole = 'teacher' | 'student'

export interface LmsClass {
  id: string
  name: string
  description: string
  teacherId: string
  teacherName: string
  joinCode: string
  studentIds: string[]
  createdAt: number
}

export interface LmsLesson {
  id: string
  classId: string
  title: string
  description: string
  content: string
  resourceUrl?: string
  createdBy: string
  createdAt: number
}

export interface LmsAssignment {
  id: string
  classId: string
  title: string
  instructions: string
  dueAt: number
  maxScore: number
  createdBy: string
  createdAt: number
}

export interface LmsSubmission {
  id: string
  assignmentId: string
  classId: string
  studentId: string
  studentName: string
  content: string
  submittedAt: number
  status: 'submitted' | 'reviewed'
  reviewedAt?: number
  score?: number
  feedback?: string
}

export interface LmsDataStore {
  classes: LmsClass[]
  lessons: LmsLesson[]
  assignments: LmsAssignment[]
  submissions: LmsSubmission[]
}
