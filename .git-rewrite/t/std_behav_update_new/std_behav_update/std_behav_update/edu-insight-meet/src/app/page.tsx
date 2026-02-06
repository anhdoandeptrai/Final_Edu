'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import DashboardLayout from '../components/DashboardLayout'

export default function HomePage() {
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
      <div className="container" style={{ paddingTop: '1rem', maxWidth: '540px' }}>
        {/* Welcome Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Chào mừng trở lại! 👋
          </h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Bắt đầu hoặc tham gia cuộc họp video với AI tracking
          </p>
        </div>

        {/* Create Meeting */}
        <div className="card animate-fadeIn">
          <h2 className="section-title">🚀 Tạo cuộc họp mới</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Tạo phòng họp và mời người khác tham gia
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
            Nhập mã phòng để tham gia
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

        {/* Features */}
        <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title">✨ Tính năng nổi bật</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div className="feature-item">
              <div className="feature-icon">🎥</div>
              <span>Video call HD 1-1 real-time</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <span>AI phát hiện hành vi học tập</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌐</div>
              <span>Hoạt động mọi nơi (WiFi, 4G)</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <span>Bảo mật end-to-end</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
