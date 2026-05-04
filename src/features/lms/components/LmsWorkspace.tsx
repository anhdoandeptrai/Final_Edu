'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '../../../shared/contexts/AuthContext'
import {
    createAssignment,
    createClass,
    createLesson,
    gradeSubmission,
    joinClassByCode,
    listAssignmentsByClass,
    listClassesForUser,
    listLessonsByClass,
    listSubmissionsByAssignment,
    submitAssignment,
} from '../service'
import { LmsAssignment, LmsClass, LmsLesson, LmsSubmission } from '../types'

interface Props {
    user: User
    section: 'classes' | 'lessons' | 'assignments' | 'grading' | 'submissions'
    classId?: string
}

type GradingDraft = {
    score: string
    feedback: string
}

type AssignmentFilter = 'all' | 'active' | 'overdue' | 'graded'
type GradingFilter = 'all' | 'pending' | 'reviewed'

const LMS_NAV = [
    { href: '/lms/classes', label: 'Lớp học' },
    { href: '/lms/lessons', label: 'Bài học' },
    { href: '/lms/assignments', label: 'Bài tập' },
    { href: '/lms/submissions', label: 'Bài nộp' },
    { href: '/lms/grading', label: 'Chấm bài' },
] as const

function formatDateTime(value: number | Date): string {
    return new Date(value).toLocaleString('vi-VN')
}

function toLocalDateTimeInputValue(value: string): string {
    return value
}

export default function LmsWorkspace({ user, section, classId }: Props) {
    const router = useRouter()
    const [classes, setClasses] = useState<LmsClass[]>([])
    const [activeClassId, setActiveClassId] = useState('')
    const [lessons, setLessons] = useState<LmsLesson[]>([])
    const [assignments, setAssignments] = useState<LmsAssignment[]>([])
    const [submissionsByAssignment, setSubmissionsByAssignment] = useState<Record<string, LmsSubmission[]>>({})
    const [toast, setToast] = useState('')
    const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('all')
    const [gradingFilter, setGradingFilter] = useState<GradingFilter>('all')
    const [gradingSearch, setGradingSearch] = useState('')
    const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'reviewed'>('all')
    const [submissionSearch, setSubmissionSearch] = useState('')

    const [newClassName, setNewClassName] = useState('')
    const [newClassDescription, setNewClassDescription] = useState('')
    const [joinCode, setJoinCode] = useState('')

    const [lessonTitle, setLessonTitle] = useState('')
    const [lessonDescription, setLessonDescription] = useState('')
    const [lessonContent, setLessonContent] = useState('')
    const [lessonResource, setLessonResource] = useState('')

    const [assignmentTitle, setAssignmentTitle] = useState('')
    const [assignmentInstructions, setAssignmentInstructions] = useState('')
    const [assignmentDueAt, setAssignmentDueAt] = useState('')
    const [assignmentMaxScore, setAssignmentMaxScore] = useState('10')

    const [studentResponses, setStudentResponses] = useState<Record<string, string>>({})
    const [gradingState, setGradingState] = useState<Record<string, GradingDraft>>({})

    const isTeacher = user.role === 'teacher'

    const activeClass = useMemo(
        () => classes.find((item) => item.id === activeClassId) || null,
        [classes, activeClassId]
    )

    const activeLessons = lessons
    const activeAssignments = assignments

    const studentPendingCount = useMemo(() => {
        if (isTeacher) {
            return 0
        }

        return activeAssignments.filter((assignment) => {
            const submission = (submissionsByAssignment[assignment.id] || []).find((item) => item.studentId === user.id)
            return !submission || submission.status !== 'reviewed'
        }).length
    }, [activeAssignments, submissionsByAssignment, user.id, isTeacher])

    const teacherPendingSubmissions = useMemo(() => {
        if (!isTeacher) {
            return 0
        }

        return activeAssignments.reduce((count, assignment) => {
            const submissions = submissionsByAssignment[assignment.id] || []
            return count + submissions.filter((submission) => submission.status !== 'reviewed').length
        }, 0)
    }, [activeAssignments, submissionsByAssignment, isTeacher])

    const filteredAssignments = useMemo(() => {
        return activeAssignments.filter((assignment) => {
            const dueTime = new Date(assignment.dueAt).getTime()
            const submissions = submissionsByAssignment[assignment.id] || []
            const mySubmission = submissions.find((item) => item.studentId === user.id) || null

            if (assignmentFilter === 'active' && Date.now() > dueTime) {
                return false
            }

            if (assignmentFilter === 'overdue' && Date.now() <= dueTime) {
                return false
            }

            if (assignmentFilter === 'graded' && mySubmission?.status !== 'reviewed') {
                return false
            }

            return true
        })
    }, [activeAssignments, assignmentFilter, submissionsByAssignment, user.id])

    const filteredGradingAssignments = useMemo(() => {
        const keyword = gradingSearch.trim().toLowerCase()

        return activeAssignments
            .map((assignment) => {
                const submissions = submissionsByAssignment[assignment.id] || []
                const filteredSubmissions = submissions.filter((submission) => {
                    if (gradingFilter === 'pending' && submission.status === 'reviewed') {
                        return false
                    }

                    if (gradingFilter === 'reviewed' && submission.status !== 'reviewed') {
                        return false
                    }


                    if (!keyword) {
                        return true
                    }

                    return (
                        submission.studentName.toLowerCase().includes(keyword) ||
                        submission.content.toLowerCase().includes(keyword) ||
                        assignment.title.toLowerCase().includes(keyword)
                    )
                })

                return {
                    assignment,
                    submissions: filteredSubmissions,
                }
            })
            .filter((item) => item.submissions.length > 0 || gradingFilter === 'all' || gradingSearch.trim().length > 0)
    }, [activeAssignments, gradingFilter, gradingSearch, submissionsByAssignment])

    const allSubmissions = useMemo(() => {
        return activeAssignments.flatMap((assignment) => {
            const submissions = submissionsByAssignment[assignment.id] || []
            return submissions.map((submission) => ({
                assignment,
                submission,
            }))
        })
    }, [activeAssignments, submissionsByAssignment])

    const filteredSubmissions = useMemo(() => {
        const keyword = submissionSearch.trim().toLowerCase()

        return allSubmissions.filter(({ assignment, submission }) => {
            if (submissionFilter === 'pending' && submission.status === 'reviewed') {
                return false
            }

            if (submissionFilter === 'reviewed' && submission.status !== 'reviewed') {
                return false
            }

            if (!keyword) {
                return true
            }

            return (
                assignment.title.toLowerCase().includes(keyword) ||
                submission.studentName.toLowerCase().includes(keyword) ||
                submission.content.toLowerCase().includes(keyword)
            )
        })
    }, [allSubmissions, submissionFilter, submissionSearch])

    async function refreshClassDetails(classId: string): Promise<void> {
        if (!classId) {
            setLessons([])
            setAssignments([])
            setSubmissionsByAssignment({})
            return
        }

        const classLessons = await listLessonsByClass(classId)
        const classAssignments = await listAssignmentsByClass(classId)
        const nextSubmissionMap: Record<string, LmsSubmission[]> = {}

        await Promise.all(
            classAssignments.map(async (assignment) => {
                nextSubmissionMap[assignment.id] = await listSubmissionsByAssignment(assignment.id)
            })
        )

        setLessons(classLessons)
        setAssignments(classAssignments)
        setSubmissionsByAssignment(nextSubmissionMap)
    }

    useEffect(() => {
        void reloadClasses(classId)
    }, [user.id, user.role, classId])

    useEffect(() => {
        void refreshClassDetails(activeClassId)
    }, [activeClassId])

    function showToast(message: string): void {
        setToast(message)
        window.setTimeout(() => setToast(''), 2500)
    }

    async function reloadClasses(preferredId?: string): Promise<void> {
        const result = await listClassesForUser(user.id, user.role)
        setClasses(result)

        if (result.length === 0) {
            setActiveClassId('')
            return
        }

        if (preferredId) {
            if (result.some((item) => item.id === preferredId)) {
                setActiveClassId(preferredId)
            } else {
                setActiveClassId('')
            }

            return
        }

        if (result.some((item) => item.id === activeClassId)) {
            return
        }

        setActiveClassId(result[0].id)
    }

    async function handleCreateClass(): Promise<void> {
        if (!newClassName.trim()) {
            showToast('Vui lòng nhập tên lớp học')
            return
        }

        const created = await createClass({
            name: newClassName.trim(),
            description: newClassDescription.trim(),
            teacherId: user.id,
            teacherName: user.name,
        })

        setNewClassName('')
        setNewClassDescription('')
        await reloadClasses(created.id)
        showToast('Đã tạo lớp học mới')
    }

    async function handleJoinClass(): Promise<void> {
        if (!joinCode.trim()) {
            showToast('Vui lòng nhập mã lớp')
            return
        }

        const result = await joinClassByCode(joinCode, user.id)
        showToast(result.message)

        if (result.ok) {
            setJoinCode('')
            await reloadClasses(classId)
        }
    }

    async function handleCreateLesson(): Promise<void> {
        if (!activeClassId || !lessonTitle.trim() || !lessonContent.trim()) {
            showToast('Nhập đủ tiêu đề và nội dung bài học')
            return
        }

        await createLesson({
            classId: activeClassId,
            title: lessonTitle.trim(),
            description: lessonDescription.trim(),
            content: lessonContent.trim(),
            resourceUrl: lessonResource.trim() || undefined,
            createdBy: user.id,
        })

        setLessonTitle('')
        setLessonDescription('')
        setLessonContent('')
        setLessonResource('')
        setLessons(await listLessonsByClass(activeClassId))
        showToast('Đã thêm bài học')
    }

    async function handleCreateAssignment(): Promise<void> {
        if (!activeClassId || !assignmentTitle.trim() || !assignmentInstructions.trim() || !assignmentDueAt) {
            showToast('Nhập đủ thông tin bài tập')
            return
        }

        await createAssignment({
            classId: activeClassId,
            title: assignmentTitle.trim(),
            instructions: assignmentInstructions.trim(),
            dueAt: new Date(assignmentDueAt).getTime(),
            maxScore: Number(assignmentMaxScore) || 10,
            createdBy: user.id,
        })

        setAssignmentTitle('')
        setAssignmentInstructions('')
        setAssignmentDueAt('')
        setAssignmentMaxScore('10')

        const nextAssignments = await listAssignmentsByClass(activeClassId)
        const nextSubmissionMap: Record<string, LmsSubmission[]> = {}

        await Promise.all(
            nextAssignments.map(async (assignment) => {
                nextSubmissionMap[assignment.id] = await listSubmissionsByAssignment(assignment.id)
            })
        )

        setAssignments(nextAssignments)
        setSubmissionsByAssignment(nextSubmissionMap)
        showToast('Đã tạo bài tập')
    }

    async function handleSubmitAssignment(assignment: LmsAssignment): Promise<void> {
        const submission = (submissionsByAssignment[assignment.id] || []).find((item) => item.studentId === user.id) || null
        const dueTime = new Date(assignment.dueAt).getTime()

        if (submission?.status === 'reviewed') {
            showToast('Bài đã được chấm, không thể chỉnh sửa nữa')
            return
        }

        if (Date.now() > dueTime) {
            showToast('Đã hết hạn nộp bài')
            return
        }

        const content = (studentResponses[assignment.id] || submission?.content || '').trim()
        if (!content) {
            showToast('Vui lòng nhập nội dung bài nộp')
            return
        }

        try {
            await submitAssignment({
                assignmentId: assignment.id,
                classId: assignment.classId,
                studentId: user.id,
                studentName: user.name,
                content,
            })

            const nextSubmissions = await listSubmissionsByAssignment(assignment.id)
            setSubmissionsByAssignment((prev) => ({ ...prev, [assignment.id]: nextSubmissions }))
            setStudentResponses((prev) => ({ ...prev, [assignment.id]: content }))
            showToast(submission ? 'Đã cập nhật bài nộp' : 'Nộp bài thành công')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể nộp bài'
            showToast(message)
        }
    }

    async function handleGradeSubmission(submissionId: string, maxScore: number): Promise<void> {
        const state = gradingState[submissionId]
        const score = Number(state?.score || 0)

        if (!state || Number.isNaN(score) || score < 0 || score > maxScore) {
            showToast('Điểm không hợp lệ')
            return
        }

        const result = await gradeSubmission({
            submissionId,
            score,
            maxScore,
            feedback: state.feedback || '',
        })

        showToast(result.message)

        if (result.ok && activeClassId) {
            const nextSubmissionMap: Record<string, LmsSubmission[]> = {}
            await Promise.all(
                assignments.map(async (assignment) => {
                    nextSubmissionMap[assignment.id] = await listSubmissionsByAssignment(assignment.id)
                })
            )
            setSubmissionsByAssignment(nextSubmissionMap)
        }
    }

    function renderClassSidebar(): JSX.Element {
        return (
            <aside className="card sidebar-panel">
                <div className="panel-heading">
                    <div>
                        <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>📚 Lớp học</h2>
                        <p className="panel-subtitle">Chọn lớp để quản lý bài học và bài tập</p>
                    </div>
                </div>

                {classes.length === 0 ? (
                    <div className="empty-state">
                        <p>Chưa có lớp học nào.</p>
                        <p className="panel-subtitle">Tạo lớp mới hoặc tham gia bằng mã lớp.</p>
                    </div>
                ) : (
                    <div className="class-list">
                        {classes.map((item) => {
                            const isActive = item.id === activeClassId
                            const classHref = `/lms/classes/${item.id}`
                            return (
                                <button
                                    key={item.id}
                                    className={`class-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        // Always set the active class locally so panels update
                                        // immediately. When viewing the classes section we
                                        // also navigate to the class detail route.
                                        setActiveClassId(item.id)

                                        if (section === 'classes') {
                                            router.push(classHref)
                                            return
                                        }
                                    }}
                                >
                                    <div>
                                        <strong>{item.name}</strong>
                                        <p>{item.description || 'Không có mô tả'}</p>
                                    </div>
                                    <div className="class-meta">
                                        <span>{item.studentIds.length} học sinh</span>
                                        {isTeacher ? <span>Mã: {item.joinCode}</span> : null}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}

                <div className="split-card">
                    <h3>{isTeacher ? '➕ Tạo lớp mới' : '🔑 Tham gia lớp'}</h3>
                    {isTeacher ? (
                        <>
                            <input
                                className="input"
                                placeholder="Tên lớp"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                            />
                            <textarea
                                className="input"
                                placeholder="Mô tả ngắn"
                                value={newClassDescription}
                                onChange={(e) => setNewClassDescription(e.target.value)}
                                rows={3}
                            />
                            <button className="btn btn-primary" onClick={handleCreateClass}>Tạo lớp</button>
                        </>
                    ) : (
                        <>
                            <input
                                className="input"
                                placeholder="Nhập mã lớp (VD: ABC123)"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleJoinClass}>Tham gia</button>
                        </>
                    )}
                </div>
            </aside>
        )
    }

    function renderOverviewPanel(): JSX.Element {
        const totalSubmissions = activeAssignments.reduce((count, assignment) => count + (submissionsByAssignment[assignment.id]?.length || 0), 0)

        return (
            <div className="panel-stack">
                <section className="card hero-card">
                    <div>
                        <p className="eyebrow">Tổng quan lớp học</p>
                        <h2>{activeClass.name}</h2>
                        <p className="panel-subtitle">{activeClass.description || 'Chưa có mô tả cho lớp này.'}</p>
                    </div>
                    <div className="hero-badges">
                        <span>Giáo viên: {activeClass.teacherName}</span>
                        <span>Mã lớp: {activeClass.joinCode}</span>
                        <span>Bài học: {activeLessons.length}</span>
                        <span>Bài tập: {activeAssignments.length}</span>
                        <span>Bài nộp: {totalSubmissions}</span>
                    </div>
                </section>

                <section className="stats-grid">
                    <div className="stat-card">
                        <span>{activeLessons.length}</span>
                        <p>Bài học</p>
                    </div>
                    <div className="stat-card">
                        <span>{activeAssignments.length}</span>
                        <p>Bài tập</p>
                    </div>
                    <div className="stat-card">
                        <span>{isTeacher ? teacherPendingSubmissions : studentPendingCount}</span>
                        <p>{isTeacher ? 'Bài chờ chấm' : 'Bài đang chờ kết quả'}</p>
                    </div>
                </section>

                <section className="card split-card">
                    <h3>Quy trình nộp bài</h3>
                    <ol className="guide-list">
                        <li>Học sinh mở tab Bài tập, nhập đáp án và nộp trước hạn.</li>
                        <li>Nếu chưa quá hạn và chưa được chấm, đáp án có thể gửi lại để cập nhật.</li>
                        <li>Khi giáo viên chấm điểm, bài nộp sẽ bị khóa và không thể thay đổi nữa.</li>
                    </ol>
                </section>
            </div>
        )
    }

    function renderLessonsPanel(): JSX.Element {
        return (
            <div className="panel-stack">
                <section className="card split-card">
                    <div className="panel-heading">
                        <div>
                            <h3>📖 Bài học</h3>
                            <p className="panel-subtitle">Mọi bài học đều được gom theo lớp đang chọn</p>
                        </div>
                    </div>
                    {isTeacher ? (
                        <div className="form-stack">
                            <input
                                className="input"
                                placeholder="Tiêu đề bài học"
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                            />
                            <input
                                className="input"
                                placeholder="Mô tả ngắn"
                                value={lessonDescription}
                                onChange={(e) => setLessonDescription(e.target.value)}
                            />
                            <textarea
                                className="input"
                                placeholder="Nội dung chính"
                                value={lessonContent}
                                onChange={(e) => setLessonContent(e.target.value)}
                                rows={4}
                            />
                            <input
                                className="input"
                                placeholder="Link tài liệu (tuỳ chọn)"
                                value={lessonResource}
                                onChange={(e) => setLessonResource(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleCreateLesson}>Lưu bài học</button>
                        </div>
                    ) : (
                        <p className="panel-subtitle">Học sinh chỉ xem bài học ở đây, không cần thao tác tạo.</p>
                    )}
                </section>

                <section className="card split-card">
                    {activeLessons.length === 0 ? (
                        <div className="empty-state">
                            <p>Chưa có bài học.</p>
                        </div>
                    ) : (
                        <div className="list-grid">
                            {activeLessons.map((lesson) => (
                                <article key={lesson.id} className="item-card">
                                    <div className="item-header">
                                        <h4>{lesson.title}</h4>
                                        <span>{formatDateTime(lesson.createdAt)}</span>
                                    </div>
                                    <p className="item-copy">{lesson.description || 'Không có mô tả'}</p>
                                    <p className="item-body">{lesson.content}</p>
                                    {lesson.resourceUrl ? (
                                        <a href={lesson.resourceUrl} target="_blank" rel="noreferrer">Tài liệu đính kèm</a>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        )
    }

    function renderAssignmentsPanel(): JSX.Element {
        return (
            <div className="panel-stack">
                {isTeacher ? (
                    <section className="card split-card">
                        <div className="panel-heading">
                            <div>
                                <h3>📌 Tạo bài tập</h3>
                                <p className="panel-subtitle">Đặt hạn nộp rõ ràng để học sinh có thể chỉnh sửa trước deadline</p>
                            </div>
                        </div>
                        <div className="form-stack">
                            <input
                                className="input"
                                placeholder="Tên bài tập"
                                value={assignmentTitle}
                                onChange={(e) => setAssignmentTitle(e.target.value)}
                            />
                            <textarea
                                className="input"
                                placeholder="Yêu cầu bài tập"
                                value={assignmentInstructions}
                                onChange={(e) => setAssignmentInstructions(e.target.value)}
                                rows={3}
                            />
                            <div className="two-column-inputs">
                                <input
                                    type="datetime-local"
                                    className="input"
                                    value={toLocalDateTimeInputValue(assignmentDueAt)}
                                    onChange={(e) => setAssignmentDueAt(e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="input"
                                    min={1}
                                    max={100}
                                    value={assignmentMaxScore}
                                    onChange={(e) => setAssignmentMaxScore(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary" onClick={handleCreateAssignment}>Lưu bài tập</button>
                        </div>
                    </section>
                ) : (
                    <section className="card split-card">
                        <h3>🧠 Quy trình làm bài</h3>
                        <p className="panel-subtitle">Bạn có thể sửa đáp án trước khi hết hạn. Sau khi giáo viên chấm, bài sẽ bị khóa.</p>
                    </section>
                )}

                <section className="card split-card">
                    <div className="panel-heading" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <h3>📌 Danh sách bài tập</h3>
                            <p className="panel-subtitle">Lọc theo trạng thái để tìm nhanh bài cần xử lý.</p>
                        </div>
                        <div className="filter-row">
                            {([
                                ['all', 'Tất cả'],
                                ['active', 'Còn hạn'],
                                ['overdue', 'Quá hạn'],
                                ['graded', 'Đã chấm'],
                            ] as Array<[AssignmentFilter, string]>).map(([value, label]) => (
                                <button
                                    key={value}
                                    className={`filter-chip ${assignmentFilter === value ? 'active' : ''}`}
                                    onClick={() => setAssignmentFilter(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredAssignments.length === 0 ? (
                        <div className="empty-state">
                            <p>Không có bài tập phù hợp bộ lọc hiện tại.</p>
                        </div>
                    ) : (
                        <div className="list-grid">
                            {filteredAssignments.map((assignment) => {
                                const submissions = submissionsByAssignment[assignment.id] || []
                                const mySubmission = submissions.find((item) => item.studentId === user.id) || null
                                const dueTime = new Date(assignment.dueAt).getTime()
                                const isPastDue = Date.now() > dueTime
                                const isLocked = isPastDue || mySubmission?.status === 'reviewed'
                                const draftValue = studentResponses[assignment.id] ?? mySubmission?.content ?? ''

                                return (
                                    <article key={assignment.id} className="item-card assignment-card">
                                        <div className="item-header">
                                            <div>
                                                <h4>{assignment.title}</h4>
                                                <p className="item-copy">{assignment.instructions}</p>
                                            </div>
                                            <span>Điểm tối đa: {assignment.maxScore}</span>
                                        </div>
                                        <div className="assignment-meta">
                                            <span>Hạn nộp: {formatDateTime(assignment.dueAt)}</span>
                                            {isPastDue ? <span className="lock-pill danger">Đã quá hạn</span> : null}
                                            {mySubmission?.status === 'reviewed' ? <span className="lock-pill success">Đã được chấm</span> : null}
                                        </div>

                                        {!isTeacher ? (
                                            <div className="submission-box">
                                                <textarea
                                                    className="input"
                                                    rows={4}
                                                    placeholder="Nhập hoặc cập nhật đáp án"
                                                    value={draftValue}
                                                    onChange={(e) =>
                                                        setStudentResponses((prev) => ({ ...prev, [assignment.id]: e.target.value }))
                                                    }
                                                    disabled={isLocked}
                                                />
                                                <div className="action-row">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => void handleSubmitAssignment(assignment)}
                                                        disabled={isLocked}
                                                    >
                                                        {mySubmission ? 'Cập nhật bài nộp' : 'Nộp bài'}
                                                    </button>
                                                    <span className="panel-subtitle">
                                                        {isLocked
                                                            ? 'Bài đã bị khóa do quá hạn hoặc đã chấm.'
                                                            : 'Có thể sửa nội dung trước khi đến hạn nộp.'}
                                                    </span>
                                                </div>

                                                {mySubmission ? (
                                                    <div className="submission-status">
                                                        <p>Đã nộp lúc: {formatDateTime(mySubmission.submittedAt)}</p>
                                                        {mySubmission.status === 'reviewed' && typeof mySubmission.score === 'number' ? (
                                                            <p className="score-line">Kết quả: {mySubmission.score}/{assignment.maxScore}</p>
                                                        ) : (
                                                            <p>Trạng thái: Chờ giáo viên chấm điểm</p>
                                                        )}
                                                        {mySubmission.feedback ? <p>Nhận xét: {mySubmission.feedback}</p> : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        )
    }

    function renderGradingPanel(): JSX.Element {
        if (!isTeacher) {
            return (
                <div className="card split-card">
                    <h3>📬 Bài nộp của tôi</h3>
                    <p className="panel-subtitle">Chọn mục Bài tập để xem, cập nhật trước hạn, và xem trạng thái bài nộp của bạn.</p>
                </div>
            )
        }

        return (
            <div className="panel-stack">
                <section className="card split-card">
                    <h3>🧾 Chấm bài</h3>
                    <p className="panel-subtitle">Xem từng bài nộp theo bài tập để chấm và nhận xét nhanh hơn.</p>
                    <p className="panel-subtitle">Bài đã chấm sẽ bị khóa phía học sinh, không thể nộp lại.</p>
                </section>

                <section className="card split-card">
                    <div className="panel-heading" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <h3>🗂 Bộ lọc bài nộp</h3>
                            <p className="panel-subtitle">Tìm bài cần chấm theo trạng thái hoặc từ khóa học sinh.</p>
                        </div>
                        <div className="filter-stack">
                            <div className="filter-row">
                                {([
                                    ['all', 'Tất cả'],
                                    ['pending', 'Chờ chấm'],
                                    ['reviewed', 'Đã chấm'],
                                ] as Array<[GradingFilter, string]>).map(([value, label]) => (
                                    <button
                                        key={value}
                                        className={`filter-chip ${gradingFilter === value ? 'active' : ''}`}
                                        onClick={() => setGradingFilter(value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <input
                                className="input"
                                placeholder="Tìm theo tên học sinh, nội dung, tên bài..."
                                value={gradingSearch}
                                onChange={(e) => setGradingSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredGradingAssignments.length === 0 ? (
                        <div className="empty-state">
                            <p>Không có bài nộp phù hợp bộ lọc hiện tại.</p>
                        </div>
                    ) : (
                        <div className="list-grid">
                            {filteredGradingAssignments.map(({ assignment, submissions }) => {

                                return (
                                    <article key={assignment.id} className="item-card">
                                        <div className="item-header">
                                            <div>
                                                <h4>{assignment.title}</h4>
                                                <p className="item-copy">{assignment.instructions}</p>
                                            </div>
                                            <span>{submissions.length} bài nộp</span>
                                        </div>

                                        {submissions.length === 0 ? (
                                            <p className="panel-subtitle">Chưa có bài nộp.</p>
                                        ) : (
                                            <div className="submission-list">
                                                {submissions.map((submission) => (
                                                    <div key={submission.id} className="submission-item">
                                                        <div className="item-header compact">
                                                            <div>
                                                                <strong>{submission.studentName}</strong>
                                                                <p>{formatDateTime(submission.submittedAt)}</p>
                                                            </div>
                                                            {submission.status === 'reviewed' ? (
                                                                <span className="lock-pill success">Đã chấm</span>
                                                            ) : (
                                                                <span className="lock-pill">Chờ chấm</span>
                                                            )}
                                                        </div>

                                                        <p className="item-body">{submission.content}</p>

                                                        <div className="grading-grid">
                                                            <input
                                                                type="number"
                                                                className="input"
                                                                min={0}
                                                                max={assignment.maxScore}
                                                                value={gradingState[submission.id]?.score ?? submission.score ?? ''}
                                                                onChange={(e) =>
                                                                    setGradingState((prev) => ({
                                                                        ...prev,
                                                                        [submission.id]: {
                                                                            score: e.target.value,
                                                                            feedback: prev[submission.id]?.feedback ?? submission.feedback ?? '',
                                                                        },
                                                                    }))
                                                                }
                                                            />
                                                            <input
                                                                className="input"
                                                                placeholder="Nhận xét"
                                                                value={gradingState[submission.id]?.feedback ?? submission.feedback ?? ''}
                                                                onChange={(e) =>
                                                                    setGradingState((prev) => ({
                                                                        ...prev,
                                                                        [submission.id]: {
                                                                            score: prev[submission.id]?.score ?? String(submission.score ?? ''),
                                                                            feedback: e.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                            />
                                                            <button className="btn btn-secondary" onClick={() => void handleGradeSubmission(submission.id, assignment.maxScore)}>
                                                                Lưu điểm
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        )
    }

    function renderSubmissionsPanel(): JSX.Element {
        if (!isTeacher) {
            return (
                <div className="card split-card">
                    <h3>📨 Bài nộp</h3>
                    <p className="panel-subtitle">Mục này chỉ dành cho giáo viên.</p>
                </div>
            )
        }

        return (
            <div className="panel-stack">
                <section className="card split-card">
                    <div className="panel-heading">
                        <div>
                            <h3>📨 Danh sách bài nộp</h3>
                            <p className="panel-subtitle">Tổng hợp tất cả bài nộp của lớp đang chọn.</p>
                        </div>
                        <div className="filter-stack">
                            <div className="filter-row">
                                {([
                                    ['all', 'Tất cả'],
                                    ['pending', 'Chờ chấm'],
                                    ['reviewed', 'Đã chấm'],
                                ] as Array<[typeof submissionFilter, string]>).map(([value, label]) => (
                                    <button
                                        key={value}
                                        className={`filter-chip ${submissionFilter === value ? 'active' : ''}`}
                                        onClick={() => setSubmissionFilter(value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <input
                                className="input"
                                placeholder="Tìm theo học sinh, bài tập hoặc nội dung..."
                                value={submissionSearch}
                                onChange={(e) => setSubmissionSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="card split-card">
                    {filteredSubmissions.length === 0 ? (
                        <div className="empty-state">
                            <p>Không có bài nộp phù hợp bộ lọc hiện tại.</p>
                        </div>
                    ) : (
                        <div className="list-grid">
                            {filteredSubmissions.map(({ assignment, submission }) => (
                                <article key={submission.id} className="submission-item">
                                    <div className="item-header compact">
                                        <div>
                                            <strong>{submission.studentName}</strong>
                                            <p>{assignment.title}</p>
                                        </div>
                                        {submission.status === 'reviewed' ? (
                                            <span className="lock-pill success">Đã chấm</span>
                                        ) : (
                                            <span className="lock-pill">Chờ chấm</span>
                                        )}
                                    </div>
                                    <p className="item-body">{submission.content}</p>
                                    <div className="assignment-meta">
                                        <span>Nộp lúc: {formatDateTime(submission.submittedAt)}</span>
                                        <span>Điểm tối đa: {assignment.maxScore}</span>
                                        {typeof submission.score === 'number' ? <span>Kết quả: {submission.score}</span> : null}
                                    </div>
                                    {submission.feedback ? <p className="panel-subtitle">Nhận xét: {submission.feedback}</p> : null}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        )
    }

    if (!activeClass && classes.length === 0) {
        return (
            <div className="container lms-shell">
                <header className="page-hero card">
                    <div>
                        <p className="eyebrow">LMS Mini</p>
                        <h1 className="title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Quản lý lớp học theo từng khu vực</h1>
                        <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>Tạo lớp, thêm bài học, tạo bài tập và chấm bài trong một luồng rõ ràng.</p>
                    </div>
                </header>
                <div className="card empty-state" style={{ marginTop: '1rem' }}>
                    <p>Chưa có lớp học để hiển thị.</p>
                    <p className="panel-subtitle">Tạo lớp hoặc tham gia bằng mã lớp ở khối bên trái.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container lms-shell">
            <header className="page-hero card">
                <div>
                    <p className="eyebrow">LMS Mini</p>
                    <h1 className="title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Quản lý lớp học theo từng khu vực</h1>
                    <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>Tách riêng lớp học, bài học, bài tập và chấm điểm để thao tác nhanh hơn.</p>
                </div>
                <div className="page-badges">
                    <span>{isTeacher ? 'Chế độ giáo viên' : 'Chế độ học sinh'}</span>
                    <span>{classes.length} lớp</span>
                    <span>{activeClass ? activeClass.name : 'Chưa chọn lớp'}</span>
                </div>
            </header>

            {toast ? (
                <div className="card toast-card">{toast}</div>
            ) : null}

            <div className="workspace-layout">
                {renderClassSidebar()}

                <main className="workspace-main">
                    <div className="section-tabs card">
                        {(isTeacher ? LMS_NAV : LMS_NAV.filter((item) => item.href !== '/lms/submissions')).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`tab-button ${item.href === `/lms/${section}` ? 'active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {!activeClass ? (
                        <div className="card empty-state">
                            <p>Chọn lớp học để bắt đầu.</p>
                        </div>
                    ) : (
                        <>
                            {section === 'classes' ? renderOverviewPanel() : null}
                            {section === 'lessons' ? renderLessonsPanel() : null}
                            {section === 'assignments' ? renderAssignmentsPanel() : null}
                            {section === 'submissions' ? renderSubmissionsPanel() : null}
                            {section === 'grading' ? renderGradingPanel() : null}
                        </>
                    )}
                </main>
            </div>

            <style jsx global>{`
                .lms-shell {
                    max-width: 1240px;
                }

                .page-hero {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    align-items: start;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, rgba(91,140,255,0.12), rgba(102,214,255,0.06));
                    border-radius: calc(var(--card-radius, 18px) + 10px);
                    padding: 1.2rem 1.3rem;
                    box-shadow: var(--shadow-lg);
                    backdrop-filter: blur(10px) saturate(120%);
                    border: 1px solid rgba(255, 255, 255, 0.28);
                }

                .eyebrow {
                    font-size: 0.75rem;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: var(--accent-primary);
                    margin-bottom: 0.5rem;
                }

                .page-badges,
                .hero-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .page-badges span,
                .hero-badges span,
                .lock-pill {
                    padding: 0.5rem 0.8rem;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.58);
                    color: var(--text-secondary);
                    font-size: 0.8125rem;
                    border: 1px solid rgba(255, 255, 255, 0.35);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
                }

                .lock-pill.success {
                    background: rgba(16, 185, 129, 0.12);
                    color: #047857;
                }

                .lock-pill.danger {
                    background: rgba(239, 68, 68, 0.12);
                    color: #b91c1c;
                }

                .workspace-layout {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 1.25rem;
                    align-items: start;
                }

                .workspace-main,
                .sidebar-panel {
                    display: grid;
                    gap: 1rem;
                }

                .sidebar-panel {
                    position: sticky;
                    top: 1rem;
                    padding: 0.35rem;
                    border-radius: calc(var(--card-radius) + 8px);
                    background: linear-gradient(180deg, rgba(255,255,255,0.58), rgba(248,250,252,0.34));
                    box-shadow: var(--shadow-lg);
                }

                .panel-stack {
                    display: grid;
                    gap: 1rem;
                }

                .panel-heading {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    align-items: start;
                }

                .panel-subtitle {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }

                .section-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.6rem;
                    padding: 0.35rem;
                    border-radius: calc(var(--card-radius) + 4px);
                    background: rgba(255,255,255,0.55);
                    backdrop-filter: blur(12px) saturate(130%);
                }

                .tab-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 0;
                    border-radius: 999px;
                    padding: 0.7rem 1rem;
                    background: transparent;
                    color: var(--text-secondary);
                    text-decoration: none;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease;
                }

                .tab-button.active {
                    background: linear-gradient(135deg, rgba(91,140,255,0.96), rgba(102,214,255,0.9));
                    color: white;
                    box-shadow: 0 10px 20px rgba(91,140,255,0.18);
                    border-color: rgba(255,255,255,0.1);
                }

                .tab-button:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.7);
                    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
                }

                .filter-row,
                .filter-stack {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .filter-stack {
                    align-items: stretch;
                    justify-content: flex-end;
                }

                .filter-chip {
                    border: 1px solid rgba(255,255,255,0.35);
                    background: rgba(255,255,255,0.58);
                    color: var(--text-secondary);
                    padding: 0.55rem 0.9rem;
                    border-radius: 999px;
                    cursor: pointer;
                    font-size: 0.8125rem;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
                    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
                }

                .filter-chip.active {
                    background: var(--accent-primary);
                    color: white;
                    border-color: var(--accent-primary);
                }

                .submission-list {
                    display: grid;
                    gap: 0.75rem;
                }

                .class-list,
                .list-grid,
                .form-stack {
                    display: grid;
                    gap: 0.75rem;
                }

                .class-item,
                .item-card,
                .split-card,
                .stat-card,
                .submission-item {
                    border: 1px solid rgba(255,255,255,0.36);
                    border-radius: calc(var(--card-radius) + 2px);
                    background: rgba(255,255,255,0.6);
                    box-shadow: 0 10px 28px rgba(15,23,42,0.05);
                    backdrop-filter: blur(10px) saturate(125%);
                }

                .class-item {
                    width: 100%;
                    text-align: left;
                    padding: 1rem;
                    cursor: pointer;
                    display: grid;
                    gap: 0.5rem;
                }

                .class-item.active {
                    border-color: rgba(91,140,255,0.45);
                    box-shadow: 0 16px 30px rgba(91,140,255,0.12);
                    background: linear-gradient(135deg, rgba(91,140,255,0.12), rgba(255,255,255,0.7));
                }

                .class-item strong {
                    display: block;
                    font-size: 0.98rem;
                    margin-bottom: 0.2rem;
                }

                .class-item p {
                    line-height: 1.45;
                }

                .class-item p,
                .item-copy,
                .item-body,
                .class-meta,
                .submission-status p,
                .item-header span {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .class-meta {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .split-card,
                .hero-card {
                    padding: 1.1rem;
                }

                .hero-card {
                    display: grid;
                    gap: 0.9rem;
                }

                .hero-card h2 {
                    font-size: 1.55rem;
                    line-height: 1.15;
                    margin: 0.1rem 0 0.35rem;
                }

                .hero-badges {
                    justify-content: flex-start;
                }

                .hero-badges span {
                    white-space: nowrap;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 0.85rem;
                }

                .stat-card {
                    padding: 1rem;
                    position: relative;
                    overflow: hidden;
                }

                .stat-card::after {
                    content: '';
                    position: absolute;
                    inset: auto -20px -18px auto;
                    width: 88px;
                    height: 88px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(91,140,255,0.15), transparent 70%);
                }

                .stat-card span {
                    display: block;
                    font-size: 1.7rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .empty-state {
                    color: var(--text-muted);
                    display: grid;
                    gap: 0.35rem;
                    padding: 0.2rem 0;
                }

                .guide-list {
                    margin: 0;
                    padding-left: 1.2rem;
                    color: var(--text-secondary);
                    display: grid;
                    gap: 0.5rem;
                    line-height: 1.6;
                }

                .item-card {
                    padding: 1.05rem;
                    display: grid;
                    gap: 0.85rem;
                }

                .item-card:hover,
                .submission-item:hover,
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-md);
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    align-items: start;
                }

                .item-header.compact {
                    margin-bottom: 0.5rem;
                }

                .assignment-meta,
                .action-row,
                .two-column-inputs,
                .grading-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 0.75rem;
                    align-items: center;
                }

                .assignment-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    line-height: 1.45;
                }

                .submission-box,
                .submission-status,
                .submission-item {
                    display: grid;
                    gap: 0.75rem;
                }

                .submission-item {
                    padding: 0.95rem;
                    background: linear-gradient(180deg, rgba(255,255,255,0.68), rgba(247,250,252,0.58));
                }

                .input {
                    background: rgba(255,255,255,0.74);
                    border-color: rgba(148,163,184,0.22);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
                }

                .input:focus {
                    box-shadow: 0 0 0 4px rgba(91,140,255,0.12);
                }

                .btn {
                    border-radius: 14px;
                    box-shadow: 0 10px 20px rgba(15,23,42,0.08);
                    transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    filter: saturate(1.03);
                }

                .btn-secondary {
                    background: rgba(255,255,255,0.72);
                }

                .score-line {
                    color: var(--success);
                    font-weight: 700;
                }

                .toast-card {
                    margin-bottom: 1rem;
                    border-color: var(--accent-primary);
                }

                @media (max-width: 1024px) {
                    .workspace-layout {
                        grid-template-columns: 1fr;
                    }

                    .sidebar-panel {
                        position: static;
                        padding: 0.5rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .page-hero {
                        flex-direction: column;
                    }

                    .panel-heading,
                    .action-row,
                    .grading-grid,
                    .assignment-meta {
                        grid-template-columns: 1fr;
                    }

                    .panel-heading {
                        align-items: stretch;
                    }

                    .filter-stack {
                        justify-content: flex-start;
                    }

                    .section-tabs {
                        flex-direction: column;
                    }

                    .tab-button {
                        width: 100%;
                    }

                    .page-badges,
                    .hero-badges {
                        justify-content: flex-start;
                    }

                    .class-meta {
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </div>
    )
}
