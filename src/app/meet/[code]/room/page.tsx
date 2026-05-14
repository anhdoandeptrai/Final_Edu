'use client'

import { useMemo, useState, useEffect, useCallback, useRef, type MutableRefObject, type Dispatch, type SetStateAction } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  useParticipants,
  useLocalParticipant,
  TrackToggle,
  useRoomContext,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import dynamic from 'next/dynamic'
import MeetingLayout from '../../../../features/edu-meet/components/meeting/MeetingLayout'
import ParticipantGrid, { ParticipantEntry } from '../../../../features/edu-meet/components/meeting/ParticipantGrid'
import ScreenShareView from '../../../../features/edu-meet/components/meeting/ScreenShareView'
import RightSidebar from '../../../../features/edu-meet/components/meeting/RightSidebar'
import AIBehaviorPanel from '../../../../features/edu-meet/components/meeting/AIBehaviorPanel'
import ParticipantSidebar from '../../../../features/edu-meet/components/meeting/ParticipantSidebar'
import AIAnalyticsPanel, { CameraWarning } from '../../../../features/edu-meet/components/meeting/AIAnalyticsPanel'
import styles from '../../../../features/edu-meet/components/meeting/MeetingRoom.module.css'

const AIBehaviorDetector = dynamic(
  () => import('../../../../features/edu-meet/components/AIBehaviorDetector'),
  { ssr: false }
)

interface MeetSettings {
  userName: string
  cameraEnabled: boolean
  micEnabled: boolean
  userRole?: 'teacher' | 'student'
  userId?: string
}

function AIDetectionManager({ settings }: { settings: MeetSettings }) {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  if (settings.userRole === 'student') {
    return (
      <AIBehaviorDetector
        enabled={true}
        userId={settings.userId}
        userName={settings.userName}
      />
    )
  }

  if (settings.userRole === 'teacher') {
    return (
      <>
        {participants.map((participant) => {
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
      const localParticipant = room.localParticipant
      if (localParticipant) {
        const tracks = localParticipant.getTrackPublications()
        tracks.forEach((publication) => {
          if (publication.track) {
            publication.track.stop()
          }
        })
      }

      await room.disconnect()
      onDisconnect()
    } catch (err) {
      console.error('Disconnect error:', err)
      onDisconnect()
    }
  }

  return (
    <>
      <button onClick={copyCode} className={styles.controlRoomCode}>
        <span>{copied ? '✓' : '📋'}</span>
        <span className={styles.roomCodeText}>{copied ? 'Đã copy' : roomCode}</span>
      </button>

      <TrackToggle source={Track.Source.Microphone} className={styles.controlButton} />
      <TrackToggle source={Track.Source.Camera} className={styles.controlButton} />
      <TrackToggle source={Track.Source.ScreenShare} className={styles.controlButton} />

      <button
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        className={`${styles.controlButton} ${styles.controlButtonDanger}`}
        title="Rời phòng"
      >
        {isDisconnecting ? '⏳' : '📞'}
      </button>
    </>
  )
}

function RoomContent({ settings, code }: { settings: MeetSettings; code: string }) {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [cameraWarnings, setCameraWarnings] = useState<CameraWarning[]>([])
  const cameraStatusRef = useRef<Map<string, boolean>>(new Map())

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
      style={{ height: '100vh' }}
    >
      <RoomStage
        code={code}
        isConnected={isConnected}
        onDisconnect={handleDisconnect}
        settings={settings}
        cameraWarnings={cameraWarnings}
        onCameraWarningsChange={setCameraWarnings}
        cameraStatusRef={cameraStatusRef}
      />
      <AIDetectionManager settings={settings} />
      <RoomAudioRenderer />

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

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

function RoomStage({
  code,
  isConnected,
  onDisconnect,
  settings,
  cameraWarnings,
  onCameraWarningsChange,
  cameraStatusRef,
}: {
  code: string
  isConnected: boolean
  onDisconnect: () => void
  settings: MeetSettings
  cameraWarnings: CameraWarning[]
  onCameraWarningsChange: Dispatch<SetStateAction<CameraWarning[]>>
  cameraStatusRef: MutableRefObject<Map<string, boolean>>
}) {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const cameraTracks = useTracks([Track.Source.Camera])
  const screenTracks = useTracks([Track.Source.ScreenShare])

  const orderedParticipants = useMemo(() => {
    const local = localParticipant ? [localParticipant] : []
    const remotes = participants.filter(p => p.sid !== localParticipant?.sid)
    return [...local, ...remotes]
  }, [participants, localParticipant])

  const cameraTrackBySid = useMemo(() => {
    return new Map(cameraTracks.map(track => [track.participant.sid, track]))
  }, [cameraTracks])

  const participantEntries = useMemo<ParticipantEntry[]>(() => {
    return orderedParticipants.map((participant) => ({
      participant,
      track: cameraTrackBySid.get(participant.sid),
      hasVideo: cameraTrackBySid.has(participant.sid),
      isLocal: participant.sid === localParticipant?.sid
    }))
  }, [orderedParticipants, cameraTrackBySid, localParticipant])

  const hasScreenShare = screenTracks.length > 0
  const maxMain = hasScreenShare ? 6 : 8
  const mainParticipants = participantEntries.slice(0, maxMain)
  const overflowParticipants = participantEntries.slice(maxMain)

  useEffect(() => {
    if (settings.userRole !== 'teacher') return

    participantEntries.forEach((entry) => {
      if (entry.isLocal) return
      const prev = cameraStatusRef.current.get(entry.participant.sid)
      if (prev === undefined) {
        cameraStatusRef.current.set(entry.participant.sid, entry.hasVideo)
        return
      }

      if (prev && !entry.hasVideo) {
        const name = entry.participant.name || entry.participant.identity
        const warning: CameraWarning = {
          id: `${entry.participant.sid}-${Date.now()}`,
          name,
          timestamp: Date.now(),
          status: 'Camera đã tắt'
        }
        onCameraWarningsChange(prev => [warning, ...prev].slice(0, 20))
      }

      cameraStatusRef.current.set(entry.participant.sid, entry.hasVideo)
    })
  }, [participantEntries, settings.userRole, onCameraWarningsChange, cameraStatusRef])

  const sections = useMemo(() => ([
    {
      id: 'history',
      title: 'Lịch sử hành vi AI',
      icon: '📊',
      content: <AIBehaviorPanel maxEntries={20} />,
      defaultOpen: true
    },
    {
      id: 'participants',
      title: 'Thành viên',
      icon: '👥',
      content: <ParticipantSidebar participants={participantEntries} overflow={overflowParticipants} />,
      defaultOpen: true
    },
    {
      id: 'analytics',
      title: 'AI realtime',
      icon: '🤖',
      content: <AIAnalyticsPanel isTeacher={settings.userRole === 'teacher'} cameraWarnings={cameraWarnings} />,
      defaultOpen: true
    }
  ]), [participantEntries, overflowParticipants, settings.userRole, cameraWarnings])

  return (
    <MeetingLayout
      header={(
        <>
          <div className={styles.headerLeft}>
            <span>🎓</span>
            <span className={styles.headerBrand}>Edu Insight Meet</span>
          </div>
          <div className={styles.headerRight}>
            <div
              className={styles.connectionBadge}
              style={{
                background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                color: isConnected ? 'var(--success)' : 'var(--warning)'
              }}
            >
              <span
                className={styles.connectionDot}
                style={{ background: isConnected ? 'var(--success)' : 'var(--warning)' }}
              />
              {isConnected ? 'Đã kết nối' : 'Đang kết nối'}
            </div>
          </div>
        </>
      )}
      sidebar={<RightSidebar sections={sections} />}
      footer={<ControlBar roomCode={code} onDisconnect={onDisconnect} />}
    >
      <ScreenShareView screenTracks={screenTracks} />
      <ParticipantGrid participants={mainParticipants} hasScreenShare={hasScreenShare} />
    </MeetingLayout>
  )
}

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
