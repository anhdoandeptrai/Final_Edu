'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { useMeeting } from '../../../contexts/MeetingContext'

interface DeviceStatus {
  camera: 'checking' | 'ok' | 'error'
  microphone: 'checking' | 'ok' | 'error'
}

interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error' | 'warn'
}

export default function PreJoinPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const { user } = useAuth()
  const { joinMeeting, getMeeting } = useMeeting()

  const [userName, setUserName] = useState('')
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    camera: 'checking',
    microphone: 'checking'
  })
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isJoining, setIsJoining] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth')
    } else {
      setUserName(user.name)
    }
  }, [user, router])

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-50), { time, message, type }])
    console.log(`[${type.toUpperCase()}] ${message}`)
  }, [])

  useEffect(() => {
    checkDevices()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const checkDevices = async () => {
    addLog('Đang kiểm tra thiết bị...', 'info')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setDeviceStatus({ camera: 'ok', microphone: 'ok' })
      addLog('✓ Camera OK', 'success')
      addLog('✓ Microphone OK', 'success')

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      const audioDevices = devices.filter(d => d.kind === 'audioinput')
      addLog(`Tìm thấy ${videoDevices.length} camera, ${audioDevices.length} mic`, 'info')

    } catch (err: any) {
      addLog(`Lỗi: ${err.message}`, 'error')

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        streamRef.current = videoStream
        if (videoRef.current) videoRef.current.srcObject = videoStream
        setDeviceStatus(prev => ({ ...prev, camera: 'ok' }))
        addLog('✓ Camera OK (không có mic)', 'warn')
      } catch {
        setDeviceStatus(prev => ({ ...prev, camera: 'error' }))
        addLog('✗ Camera không khả dụng', 'error')
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setDeviceStatus(prev => ({ ...prev, microphone: 'ok' }))
      } catch {
        setDeviceStatus(prev => ({ ...prev, microphone: 'error' }))
        addLog('✗ Microphone không khả dụng', 'error')
      }
    }
  }

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCameraEnabled(videoTrack.enabled)
        addLog(`Camera ${videoTrack.enabled ? 'bật' : 'tắt'}`, 'info')
      }
    }
  }

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setMicEnabled(audioTrack.enabled)
        addLog(`Mic ${audioTrack.enabled ? 'bật' : 'tắt'}`, 'info')
      }
    }
  }

  const joinRoom = async () => {
    if (!userName.trim() || !user) {
      addLog('Vui lòng nhập tên', 'error')
      return
    }

    setIsJoining(true)
    addLog('Đang tham gia phòng...', 'info')

    // Join meeting in context - will auto-create if doesn't exist
    joinMeeting(code, user.id, user.name, user.role)
    addLog('✓ Đã tham gia phòng', 'success')

    // Don't stop the stream here - just release the reference
    // The browser will clean up when we navigate away
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Store settings with role and userId
    sessionStorage.setItem('meetSettings', JSON.stringify({
      userName: user.name,
      cameraEnabled,
      micEnabled,
      userRole: user.role,
      userId: user.id
    }))

    addLog('Chuyển đến phòng họp...', 'success')
    
    // Small delay to ensure settings are saved
    await new Promise(resolve => setTimeout(resolve, 50))
    
    router.push(`/meet/${code}/room`)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    addLog('Đã copy mã phòng', 'success')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '2rem 1rem'
    }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 className="title" style={{ fontSize: '1.75rem' }}>Chuẩn bị tham gia</h1>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Mã phòng: </span>
            <span className="room-code" onClick={copyCode} style={{ cursor: 'pointer' }} title="Click để copy">
              {code}
            </span>
          </div>
          {user && (
            <div style={{ 
              marginTop: '0.75rem',
              padding: '0.5rem 1rem',
              background: user.role === 'teacher' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              borderRadius: '0.5rem',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {user.role === 'teacher' ? '👨‍🏫 Giáo viên' : '👨‍🎓 Học sinh'}: {user.name}
              </span>
            </div>
          )}
        </div>

        <div className="card">
          {/* Video Preview */}
          <div style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="preview-video"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!cameraEnabled && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(31, 41, 55, 0.9)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af'
              }}>
                <span style={{ fontSize: '3rem' }}>📷</span>
              </div>
            )}
          </div>

          {/* Device Status */}
          <div className="device-status">
            <div className="status-item">
              <span className={`status-dot ${deviceStatus.camera === 'ok' ? 'ok' : deviceStatus.camera === 'error' ? 'error' : ''}`} />
              <span>Camera</span>
            </div>
            <div className="status-item">
              <span className={`status-dot ${deviceStatus.microphone === 'ok' ? 'ok' : deviceStatus.microphone === 'error' ? 'error' : ''}`} />
              <span>Mic</span>
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="controls-row">
            <button
              className={`control-btn ${cameraEnabled ? 'active' : 'muted'}`}
              onClick={toggleCamera}
              title={cameraEnabled ? 'Tắt camera' : 'Bật camera'}
            >
              {cameraEnabled ? '📹' : '🚫'}
            </button>
            <button
              className={`control-btn ${micEnabled ? 'active' : 'muted'}`}
              onClick={toggleMic}
              title={micEnabled ? 'Tắt mic' : 'Bật mic'}
            >
              {micEnabled ? '🎤' : '🔇'}
            </button>
          </div>

          {/* User Name Input - Read-only since it's from auth */}
          <input
            type="text"
            className="input"
            placeholder="Nhập tên của bạn..."
            value={userName}
            readOnly
            style={{ marginTop: '1rem', background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
          />

          <button
            className="btn btn-primary"
            onClick={joinRoom}
            disabled={isJoining || !userName.trim()}
          >
            {isJoining ? (
              <>
                <span className="animate-pulse">⏳</span>
                Đang kết nối...
              </>
            ) : (
              <>
                <span>🚀</span>
                Tham gia ngay
              </>
            )}
          </button>
        </div>

        {/* Debug Logs Toggle */}
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => setShowLogs(!showLogs)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🔧 Debug Logs ({logs.length}) {showLogs ? '▲' : '▼'}
          </button>
          {showLogs && (
            <div className="log-panel animate-fadeIn">
              {logs.map((log, i) => (
                <div key={i} className={`log-entry ${log.type}`}>
                  [{log.time}] {log.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}
