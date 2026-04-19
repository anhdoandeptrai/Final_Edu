'use client'

import { useEffect, useMemo, useState } from 'react'
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
}

export default function LmsWorkspace({ user }: Props) {
    const [classes, setClasses] = useState<LmsClass[]>([])
    const [activeClassId, setActiveClassId] = useState('')
    const [lessons, setLessons] = useState<LmsLesson[]>([])
    const [assignments, setAssignments] = useState<LmsAssignment[]>([])
    const [submissionsByAssignment, setSubmissionsByAssignment] = useState<Record<string, LmsSubmission[]>>({})
    const [toast, setToast] = useState('')

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
    const [gradingState, setGradingState] = useState<Record<string, { score: string; feedback: string }>>({})

    const isTeacher = user.role === 'teacher'

    const activeClass = useMemo(
        () => classes.find((item) => item.id === activeClassId) || null,
        [classes, activeClassId]
    )

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
        void reloadClasses()
    }, [user.id, user.role])

    useEffect(() => {
        void refreshClassDetails(activeClassId)
    }, [activeClassId])

    function showToast(message: string): void {
        setToast(message)
        setTimeout(() => setToast(''), 2000)
    }

    async function reloadClasses(preferredId?: string): Promise<void> {
        const result = await listClassesForUser(user.id, user.role)
        setClasses(result)

        if (result.length === 0) {
            setActiveClassId('')
            return
        }

        if (preferredId && result.some((item) => item.id === preferredId)) {
            setActiveClassId(preferredId)
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
            await reloadClasses()
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
        const content = (studentResponses[assignment.id] || '').trim()
        if (!content) {
            showToast('Vui lòng nhập nội dung bài nộp')
            return
        }

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
        showToast('Nộp bài thành công')
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

    return (
        <div className="container" style={{ maxWidth: '1100px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 className="title" style={{ textAlign: 'left', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                    📚 LMS Mini
                </h1>
                <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                    Quản lý lớp học, bài học và bài tập theo thời gian thực nội bộ.
                </p>
            </div>

            {toast && (
                <div className="card" style={{ borderColor: 'var(--accent-secondary)', marginBottom: '1rem' }}>
                    {toast}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', alignItems: 'start' }}>
                <div>
                    <div className="card">
                        <h2 className="section-title">👥 Lớp học của bạn</h2>
                        {classes.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có lớp học nào.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {classes.map((item) => (
                                    <button
                                        key={item.id}
                                        className="btn btn-secondary"
                                        style={{
                                            justifyContent: 'space-between',
                                            textAlign: 'left',
                                            background: item.id === activeClassId ? 'var(--accent-light)' : undefined,
                                        }}
                                        onClick={() => setActiveClassId(item.id)}
                                    >
                                        <span>
                                            <strong>{item.name}</strong>
                                            <span style={{ marginLeft: '0.35rem', color: 'var(--text-muted)' }}>
                                                ({item.studentIds.length} HS)
                                            </span>
                                        </span>
                                        {isTeacher ? <span style={{ fontSize: '0.75rem' }}>Code: {item.joinCode}</span> : null}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isTeacher ? (
                        <div className="card">
                            <h2 className="section-title">➕ Tạo lớp mới</h2>
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
                            <button className="btn btn-primary" onClick={handleCreateClass}>
                                Tạo lớp
                            </button>
                        </div>
                    ) : (
                        <div className="card">
                            <h2 className="section-title">🔑 Tham gia lớp</h2>
                            <input
                                className="input"
                                placeholder="Nhập mã lớp (VD: ABC123)"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleJoinClass}>
                                Tham gia
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    {!activeClass ? (
                        <div className="card">
                            <p style={{ color: 'var(--text-muted)' }}>Chọn lớp học để bắt đầu.</p>
                        </div>
                    ) : (
                        <>
                            <div className="card" style={{ marginBottom: '1rem' }}>
                                <h2 className="section-title">🏫 {activeClass.name}</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    {activeClass.description || 'Chưa có mô tả'}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Giáo viên: {activeClass.teacherName} | Mã lớp: {activeClass.joinCode}
                                </p>
                            </div>

                            {isTeacher ? (
                                <div className="card">
                                    <h2 className="section-title">📝 Thêm bài học</h2>
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
                                    <button className="btn btn-primary" onClick={handleCreateLesson}>
                                        Lưu bài học
                                    </button>
                                </div>
                            ) : null}

                            {isTeacher ? (
                                <div className="card">
                                    <h2 className="section-title">📌 Tạo bài tập</h2>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: '0.75rem' }}>
                                        <input
                                            type="datetime-local"
                                            className="input"
                                            value={assignmentDueAt}
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
                                    <button className="btn btn-primary" onClick={handleCreateAssignment}>
                                        Lưu bài tập
                                    </button>
                                </div>
                            ) : null}

                            <div className="card">
                                <h2 className="section-title">📖 Danh sách bài học ({lessons.length})</h2>
                                {lessons.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có bài học.</p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        {lessons.map((lesson) => (
                                            <div key={lesson.id} style={{ padding: '0.875rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                                                <h3 style={{ marginBottom: '0.35rem' }}>{lesson.title}</h3>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>{lesson.description}</p>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{lesson.content}</p>
                                                {lesson.resourceUrl ? (
                                                    <a href={lesson.resourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem' }}>
                                                        Tài liệu đính kèm
                                                    </a>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="card">
                                <h2 className="section-title">🧪 Bài tập ({assignments.length})</h2>
                                {assignments.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có bài tập.</p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {assignments.map((assignment) => {
                                            const submissions = submissionsByAssignment[assignment.id] || []
                                            const mySubmission = submissions.find((item) => item.studentId === user.id) || null

                                            return (
                                                <div key={assignment.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.875rem' }}>
                                                    <h3 style={{ marginBottom: '0.35rem' }}>{assignment.title}</h3>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                                        {assignment.instructions}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        Hạn nộp: {new Date(assignment.dueAt).toLocaleString('vi-VN')} | Thang điểm: {assignment.maxScore}
                                                    </p>

                                                    {!isTeacher ? (
                                                        <div style={{ marginTop: '0.75rem' }}>
                                                            <textarea
                                                                className="input"
                                                                rows={3}
                                                                placeholder="Nhập nội dung bài nộp"
                                                                value={studentResponses[assignment.id] ?? mySubmission?.content ?? ''}
                                                                onChange={(e) =>
                                                                    setStudentResponses((prev) => ({ ...prev, [assignment.id]: e.target.value }))
                                                                }
                                                            />
                                                            <button className="btn btn-primary" onClick={() => handleSubmitAssignment(assignment)}>
                                                                Nộp bài
                                                            </button>
                                                            {mySubmission ? (
                                                                <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'grid', gap: '0.35rem' }}>
                                                                    <p>
                                                                        Đã nộp lúc: {new Date(mySubmission.submittedAt).toLocaleString('vi-VN')}
                                                                    </p>
                                                                    {mySubmission.status === 'reviewed' && typeof mySubmission.score === 'number' ? (
                                                                        <p style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                                            Kết quả: {mySubmission.score}/{assignment.maxScore}
                                                                        </p>
                                                                    ) : (
                                                                        <p>Trạng thái: Chờ giáo viên chấm điểm</p>
                                                                    )}
                                                                    {mySubmission.feedback ? (
                                                                        <p style={{ color: 'var(--text-secondary)' }}>
                                                                            Nhận xét: {mySubmission.feedback}
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <div style={{ marginTop: '0.75rem' }}>
                                                            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                                                Bài nộp: {submissions.length}
                                                            </p>
                                                            {submissions.map((submission) => (
                                                                <div key={submission.id} style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.5rem' }}>
                                                                    <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                                                        <strong>{submission.studentName}</strong> - {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                                                                    </p>
                                                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                                                        {submission.content}
                                                                    </p>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '0.5rem', marginTop: '0.5rem' }}>
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
                                                                        <button className="btn btn-secondary" onClick={() => handleGradeSubmission(submission.id, assignment.maxScore)}>
                                                                            Lưu
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 980px) {
          .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    )
}
