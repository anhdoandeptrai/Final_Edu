'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  useParticipants,
  useLocalParticipant,
  VideoTrack,
  TrackToggle,
  useRoomContext,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import dynamic from 'next/dynamic'

// Dynamic import AI component
const AIBehaviorDetector = dynamic(
  () => import('../../../../components/AIBehaviorDetector'),
  { ssr: false }
)

// Dynamic import for BehaviorHistoryPanel
const BehaviorHistoryPanel = dynamic(
  () => import('../../../../components/BehaviorHistoryPanel'),
  { ssr: false }
)

// Dynamic import for StudentsBehaviorPanel
const StudentsBehaviorPanel = dynamic(
  () => import('../../../../components/StudentsBehaviorPanel'),
  { ssr: false }
)

interface MeetSettings {
  userName: string
  cameraEnabled: boolean
  micEnabled: boolean
  userRole?: 'teacher' | 'student'
  userId?: string
}

// AI Detection Manager - Renders AI detectors for all participants (for teacher)
function AIDetectionManager({ settings }: { settings: MeetSettings }) {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  
  if (settings.userRole === 'student') {
    // Students detect their own behavior
    return (
      <AIBehaviorDetector 
        enabled={true} 
        userId={settings.userId}
        userName={settings.userName}
      />
    )
  }
  
  if (settings.userRole === 'teacher') {
    // Teachers detect all remote participants (students)
    return (
      <>
        {participants.map((participant) => {
          // Don't detect self
          if (participant.sid === localParticipant?.sid) return null
          
          return (
            <AIBehaviorDetector
              key={participant.sid}
              enabled={true}
              userId={participant.sid}
              userName={participant.name || participant.identity}
              participantSid={participant.sid}
            />
          )
        })}
      </>
    )
  }
  
  return null
}

// Custom Video Grid Component
function VideoGrid() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  const videoTracks = tracks.filter(t => t.source === Track.Source.Camera)
  const screenTracks = tracks.filter(t => t.source === Track.Source.ScreenShare)
  
  // Check if local participant has video track
  const localHasVideo = videoTracks.some(t => t.participant.sid === localParticipant?.sid)

  // Get participants without video (excluding local participant to avoid duplication)
  const participantsWithVideo = new Set(videoTracks.map(t => t.participant.sid))
  const participantsWithoutVideo = participants.filter(p => 
    !participantsWithVideo.has(p.sid) && p.sid !== localParticipant?.sid
  )

  const getInitials = (name: string) => {
    return (name || 'U').charAt(0).toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    // Generate consistent color based on name
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
      '#10b981', '#06b6d4', '#6366f1', '#8b5cf6'
    ]
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
  }

  // If there's screen share, give it priority display
  const hasScreenShare = screenTracks.length > 0

  return (
    <div style={{
      display: 'flex',
      flexDirection: hasScreenShare ? 'column' : 'row',
      gap: '1rem',
      padding: '1rem',
      height: 'calc(100vh - 150px)',
      maxWidth: hasScreenShare ? '100%' : '1200px',
      margin: '0 auto'
    }}>
      {/* Screen Share - Full width at top if present */}
      {screenTracks.map((track) => (
        <div
          key={track.participant.sid + '-screen'}
          style={{
            position: 'relative',
            background: '#000',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2px solid var(--accent-primary)',
            boxShadow: 'var(--shadow-lg)',
            height: hasScreenShare ? '60vh' : 'auto',
            flex: hasScreenShare ? '0 0 auto' : 1
          }}
        >
          <VideoTrack
            trackRef={track}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />

          {/* Screen Share Label */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(59, 130, 246, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ fontSize: '1rem' }}>🖥️</span>
            <span style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 500 }}>
              {track.participant.name || track.participant.identity} đang chia sẻ màn hình
            </span>
          </div>
        </div>
      ))}

      {/* Video Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: participants.length > 1 ? '1fr 1fr' : '1fr',
        gap: '1rem',
        flex: 1,
        height: hasScreenShare ? '35vh' : 'auto',
        overflowY: hasScreenShare ? 'auto' : 'visible'
      }}>
      {/* Show local participant placeholder if no video */}
      {localParticipant && !localHasVideo && (
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '3px solid var(--accent-primary)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}
        >
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getAvatarColor(localParticipant.name || localParticipant.identity)} 0%, ${getAvatarColor(localParticipant.name || localParticipant.identity)}dd 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {getInitials(localParticipant.name || localParticipant.identity)}
          </div>
          <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 500 }}>
            {localParticipant.name || localParticipant.identity}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            📷 Camera đang tắt
          </p>
          
          {/* Name Badge */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {localParticipant.name || localParticipant.identity}
            </span>
            <span style={{
              fontSize: '0.625rem',
              background: 'var(--accent-primary)',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#fff'
            }}>
              Bạn
            </span>
          </div>
        </div>
      )}

      {/* Video tracks */}
      {videoTracks.map((track) => (
        <div
          key={track.participant.sid}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: track.participant.sid === localParticipant?.sid
              ? '3px solid var(--accent-primary)'
              : '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            minHeight: '300px'
          }}
        >
          <VideoTrack
            trackRef={track}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: track.participant.sid === localParticipant?.sid ? 'scaleX(-1)' : 'none'
            }}
          />

          {/* Participant Name Badge */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {track.participant.name || track.participant.identity}
            </span>
            {track.participant.sid === localParticipant?.sid && (
              <span style={{
                fontSize: '0.625rem',
                background: 'var(--accent-primary)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: '#fff'
              }}>
                Bạn
              </span>
            )}
          </div>

          {/* Connection Quality Indicator */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: 'var(--success)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            ● HD
          </div>
        </div>
      ))}

      {/* Remote participants without video - show avatars */}
      {participantsWithoutVideo.map((participant) => (
        <div
          key={participant.sid}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}
        >
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getAvatarColor(participant.name || participant.identity)} 0%, ${getAvatarColor(participant.name || participant.identity)}dd 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {getInitials(participant.name || participant.identity)}
          </div>
          <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 500 }}>
            {participant.name || participant.identity}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            📷 Camera đang tắt
          </p>
          
          {/* Name Badge */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {participant.name || participant.identity}
            </span>
          </div>
        </div>
      ))}

      {/* Empty state when waiting for others */}
      {participants.length === 1 && (
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '20px',
          border: '2px dashed var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          minHeight: '300px'
        }}>
          <div style={{ fontSize: '4rem' }}>👥</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Đang chờ người khác tham gia...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chia sẻ mã phòng để mời</p>
        </div>
      )}
      </div>
    </div>
  )
}

// Custom Control Bar with proper disconnect handling
function ControlBar({ roomCode, onDisconnect }: { roomCode: string; onDisconnect: () => void }) {
  const [copied, setCopied] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const room = useRoomContext()

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDisconnect = async () => {
    if (isDisconnecting) return
    setIsDisconnecting(true)
    
    try {
      // Stop all local tracks first
      const localParticipant = room.localParticipant
      if (localParticipant) {
        const tracks = localParticipant.getTrackPublications()
        tracks.forEach((publication) => {
          if (publication.track) {
            publication.track.stop()
          }
        })
      }
      
      // Disconnect from room
      await room.disconnect()
      onDisconnect()
    } catch (err) {
      console.error('Disconnect error:', err)
      onDisconnect()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-color)',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Room Code */}
      <button
        onClick={copyCode}
        style={{
          background: 'var(--accent-light)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          color: 'var(--accent-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          fontWeight: 600
        }}
      >
        <span>{copied ? '✓ Đã copy' : `📋 ${roomCode}`}</span>
      </button>

      {/* Mic Toggle */}
      <TrackToggle
        source={Track.Source.Microphone}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '2px solid var(--border-color)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'all 0.2s',
          background: 'var(--bg-primary)'
        }}
      />

      {/* Camera Toggle */}
      <TrackToggle
        source={Track.Source.Camera}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '2px solid var(--border-color)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'all 0.2s',
          background: 'var(--bg-primary)'
        }}
      />

      {/* Screen Share Toggle */}
      <TrackToggle
        source={Track.Source.ScreenShare}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '2px solid var(--border-color)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          transition: 'all 0.2s'
        }}
      />

      {/* Custom Disconnect Button */}
      <button
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: isDisconnecting 
            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          cursor: isDisconnecting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#fff',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
          transition: 'all 0.2s'
        }}
        title="Rời phòng"
      >
        {isDisconnecting ? '⏳' : '📞'}
      </button>
    </div>
  )
}

// Wrapper to get participants and pass to StudentsBehaviorPanel
function StudentsBehaviorPanelWrapper() {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  
  // Filter out local participant (teacher)
  const remoteParticipants = participants.filter(p => p.sid !== localParticipant?.sid)
  
  return <StudentsBehaviorPanel participants={remoteParticipants} />
}

// Room Content Component
function RoomContent({ settings, code }: { settings: MeetSettings; code: string }) {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [showHistory, setShowHistory] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  const addLog = useCallback((msg: string) => {
    console.log(`[ROOM] ${msg}`)
  }, [])

  useEffect(() => {
    async function fetchToken() {
      addLog('Đang lấy token...')
      try {
        const res = await fetch('/api/meet/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: code, participantName: settings.userName })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to get token')
        setToken(data.token)
        addLog('✓ Lấy token thành công!')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        addLog('✗ Lỗi: ' + message)
      }
    }
    fetchToken()
  }, [code, settings.userName, addLog])

  const handleDisconnect = useCallback(() => {
    addLog('Đã ngắt kết nối')
    // Clear session storage
    sessionStorage.removeItem('meetSettings')
    router.push('/')
  }, [router, addLog])

  const handleConnected = useCallback(() => {
    setIsConnected(true)
    addLog('✓ Đã kết nối vào phòng!')
  }, [addLog])

  const handleError = useCallback((err: Error) => {
    addLog('✗ Lỗi kết nối: ' + err.message)
  }, [addLog])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Không thể kết nối</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '4px solid var(--accent-light)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Đang kết nối...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ''

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      video={settings.cameraEnabled}
      audio={settings.micEnabled}
      onConnected={handleConnected}
      onDisconnected={handleDisconnect}
      onError={handleError}
      connect={true}
      options={{
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 }
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }}
      style={{ height: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
    >
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <span style={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Edu Insight Meet
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            padding: '0.375rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            color: isConnected ? 'var(--success)' : 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              background: isConnected ? 'var(--success)' : 'var(--warning)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
          </div>

          {/* History toggle button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: showHistory ? 'var(--accent-light)' : 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              color: showHistory ? 'var(--accent-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            📊 {showHistory ? 'Ẩn' : 'Hiện'} Analytics
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        paddingTop: '60px',
        paddingBottom: '90px',
        height: '100vh'
      }}>
        {/* Video Grid */}
        <div style={{ flex: 1 }}>
          <VideoGrid />
        </div>

        {/* Analytics & History Sidebar - Different for teacher vs student */}
        {showHistory && (
          <div style={{
            width: '320px',
            padding: '1rem',
            overflowY: 'auto',
            borderLeft: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)'
          }}>
            {settings.userRole === 'student' ? (
              <BehaviorHistoryPanel maxEntries={15} />
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                Xem phân tích học sinh ở panel bên phải
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Detection Manager - Detects behavior for students or all participants for teachers */}
      <AIDetectionManager settings={settings} />
      
      {/* Students Behavior Panel - Only for teachers */}
      {settings.userRole === 'teacher' && <StudentsBehaviorPanelWrapper />}

      {/* Control Bar */}
      <ControlBar roomCode={code} onDisconnect={handleDisconnect} />

      {/* Audio Renderer */}
      <RoomAudioRenderer />

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* LiveKit component overrides */
        [data-lk-theme="default"] {
          --lk-bg: transparent;
        }
        
        .lk-button-group {
          display: none;
        }
      `}</style>
    </LiveKitRoom>
  )
}

// Main Page Component
export default function RoomPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const [settings, setSettings] = useState<MeetSettings | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const stored = sessionStorage.getItem('meetSettings')
    if (!stored) {
      router.push(`/meet/${code}`)
      return
    }
    setSettings(JSON.parse(stored) as MeetSettings)
  }, [code, router, mounted])

  if (!mounted || !settings) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    )
  }

  return <RoomContent settings={settings} code={code} />
}
