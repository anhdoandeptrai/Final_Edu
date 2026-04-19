'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import DashboardLayout from '../../shared/components/DashboardLayout'

export default function MeetingPage() {
    const router = useRouter()
    const [meetingCode, setMeetingCode] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const createMeeting = async () => {
        setIsCreating(true)
        const code = nanoid(10)
        router.push(`/meet/${code}`)
    }

    const joinMeeting = () => {
        if (meetingCode.trim()) {
            router.push(`/meet/${meetingCode.trim()}`)
        }
    }

    return (
        <DashboardLayout>
            <div className="container" style={{ maxWidth: '600px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="title" style={{ fontSize: '1.75rem', textAlign: 'left', marginBottom: '0.5rem' }}>
                        📹 Cuộc họp
                    </h1>
                    <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                        Bắt đầu hoặc tham gia cuộc họp video
                    </p>
                </div>

                {/* Create Meeting */}
                <div className="card animate-fadeIn">
                    <h2 className="section-title">🚀 Tạo cuộc họp mới</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Tạo phòng họp ngay lập tức với mã duy nhất
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={createMeeting}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <>
                                <span className="animate-pulse">⏳</span>
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <span>➕</span>
                                Tạo cuộc họp
                            </>
                        )}
                    </button>
                </div>

                {/* Join Meeting */}
                <div className="card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <h2 className="section-title">🔗 Tham gia cuộc họp</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Nhập mã phòng để tham gia cuộc họp hiện có
                    </p>
                    <input
                        type="text"
                        className="input"
                        placeholder="Nhập mã cuộc họp..."
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && joinMeeting()}
                    />
                    <button
                        className="btn btn-secondary"
                        onClick={joinMeeting}
                        disabled={!meetingCode.trim()}
                    >
                        <span>🚪</span>
                        Tham gia
                    </button>
                </div>

                {/* Recent Meetings Placeholder */}
                <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <h2 className="section-title">🕒 Cuộc họp gần đây</h2>
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem 1rem',
                        color: 'var(--text-muted)'
                    }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
                        <p style={{ fontSize: '0.875rem' }}>Chưa có cuộc họp nào</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
