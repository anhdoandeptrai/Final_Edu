'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useMeeting } from '../../contexts/MeetingContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { createMeeting } = useMeeting()
  const [meetingCode, setMeetingCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  if (!user) {
    router.push('/auth')
    return null
  }

  const handleCreateMeeting = async () => {
    setIsCreating(true)
    const code = nanoid(10)
    
    // Create meeting in context
    createMeeting(code, user.id, user.name, user.role)
    
    router.push(`/meet/${code}`)
  }

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      router.push(`/meet/${meetingCode.trim()}`)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  return (
    <DashboardLayout children={
      <div className="container" style={{ paddingTop: '1rem', maxWidth: '540px' }}>
        {/* User Info */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                {user.role === 'teacher' ? '👨‍🏫 Giáo viên' : '👨‍🎓 Học sinh'}
              </p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {user.name}
              </h2>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Welcome Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Chào mừng trở lại! 👋
          </h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Bắt đầu hoặc tham gia cuộc họp video với AI tracking
          </p>
        </div>

        {/* Create Meeting - Only for teachers or all users */}
        <div className="card animate-fadeIn">
          <h2 className="section-title">🚀 Tạo cuộc họp mới</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {user.role === 'teacher' 
              ? 'Tạo phòng học và mời học sinh tham gia' 
              : 'Tạo phòng họp và mời người khác tham gia'}
          </p>
          <button
            className="btn btn-primary"
            onClick={handleCreateMeeting}
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
            onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
          />
          <button
            className="btn btn-secondary"
            onClick={handleJoinMeeting}
            disabled={!meetingCode.trim()}
          >
            <span>🚪</span>
            Tham gia
          </button>
        </div>

        {/* Features */}
        <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title">✨ Tính năng</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div className="feature-item">
              <div className="feature-icon">🎥</div>
              <span>Video call HD real-time</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <span>
                {user.role === 'teacher' 
                  ? 'AI phân tích hành vi tất cả học sinh' 
                  : 'AI phát hiện hành vi học tập'}
              </span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <span>
                {user.role === 'teacher'
                  ? 'Dashboard tổng quan lớp học'
                  : 'Theo dõi tiến độ học tập'}
              </span>
            </div>
          </div>
        </div>
      </div>
    } />
  )
}
