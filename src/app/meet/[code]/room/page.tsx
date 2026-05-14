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
import { RoomEvent, Track } from 'livekit-client'
import dynamic from 'next/dynamic'
import MeetingLayout from '../../../../features/edu-meet/components/meeting/MeetingLayout'
import ParticipantGrid, { ParticipantEntry } from '../../../../features/edu-meet/components/meeting/ParticipantGrid'
import ScreenShareView from '../../../../features/edu-meet/components/meeting/ScreenShareView'
import RightSidebar from '../../../../features/edu-meet/components/meeting/RightSidebar'
import AIBehaviorPanel from '../../../../features/edu-meet/components/meeting/AIBehaviorPanel'
import ParticipantSidebar from '../../../../features/edu-meet/components/meeting/ParticipantSidebar'
import AIAnalyticsPanel, { CameraWarning } from '../../../../features/edu-meet/components/meeting/AIAnalyticsPanel'
import { getStudentBehaviors, subscribeToStudentBehaviors, type StudentBehavior } from '../../../../features/edu-meet/components/StudentsBehaviorPanel'
import useBreakpoints from '../../../../features/edu-meet/hooks/useBreakpoints'
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

type MeetingChatMessage = {
  id: string
  sender: string
  message: string
  timestamp: number
  isMine: boolean
}

const CHAT_TOPIC = 'meeting-chat'

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

function ControlBar({
  roomCode,
  isChatOpen,
  onToggleChat,
  onDisconnect,
}: {
  roomCode: string
  isChatOpen: boolean
  onToggleChat: () => void
  onDisconnect: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const room = useRoomContext()
  const { isMobile } = useBreakpoints()

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

      {isMobile && (
        <button
          type="button"
          onClick={onToggleChat}
          className={`${styles.controlButton} ${isChatOpen ? styles.controlButtonActive : ''}`}
          title={isChatOpen ? 'Ẩn chat' : 'Hiện chat'}
        >
          💬
        </button>
      )}

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
  const [isChatOpen, setIsChatOpen] = useState(false)
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
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(prev => !prev)}
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
  isChatOpen,
  onToggleChat,
  onDisconnect,
  settings,
  cameraWarnings,
  onCameraWarningsChange,
  cameraStatusRef,
}: {
  code: string
  isConnected: boolean
  isChatOpen: boolean
  onToggleChat: () => void
  onDisconnect: () => void
  settings: MeetSettings
  cameraWarnings: CameraWarning[]
  onCameraWarningsChange: Dispatch<SetStateAction<CameraWarning[]>>
  cameraStatusRef: MutableRefObject<Map<string, boolean>>
}) {
  const room = useRoomContext()
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const { isMobile } = useBreakpoints()
  const cameraTracks = useTracks([Track.Source.Camera])
  const screenTracks = useTracks([Track.Source.ScreenShare])
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([])
  const [chatDraft, setChatDraft] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [followAll, setFollowAll] = useState(true)
  const [studentBehaviors, setStudentBehaviors] = useState<StudentBehavior[]>([])

  useEffect(() => {
    setStudentBehaviors([...getStudentBehaviors()])
    const unsubscribe = subscribeToStudentBehaviors(() => {
      setStudentBehaviors([...getStudentBehaviors()])
    })
    return unsubscribe
  }, [])

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

  const studentOptions = useMemo(() => {
    return participantEntries.filter((entry) => !entry.isLocal)
  }, [participantEntries])

  useEffect(() => {
    if (studentOptions.length === 0) {
      setSelectedStudentId('')
      return
    }

    if (!selectedStudentId || !studentOptions.some((entry) => entry.participant.sid === selectedStudentId)) {
      setSelectedStudentId(studentOptions[0].participant.sid)
    }
  }, [selectedStudentId, studentOptions])

  const selectedStudent = useMemo(() => {
    return participantEntries.find((entry) => entry.participant.sid === selectedStudentId) ?? null
  }, [participantEntries, selectedStudentId])

  const selectedStudentWarnings = useMemo(() => {
    if (!selectedStudent) return []
    const selectedName = selectedStudent.participant.name || selectedStudent.participant.identity
    return cameraWarnings.filter((warning) => warning.name === selectedName)
  }, [cameraWarnings, selectedStudent])

  const latestBehaviorsByStudent = useMemo(() => {
    const map = new Map<string, StudentBehavior>()
    studentBehaviors.forEach((behavior) => {
      if (!map.has(behavior.userId)) {
        map.set(behavior.userId, behavior)
      }
    })
    return map
  }, [studentBehaviors])

  const studentOverview = useMemo(() => {
    const entries = studentOptions

    const cameraOn = entries.filter((entry) => entry.hasVideo).length
    const cameraOff = entries.filter((entry) => !entry.hasVideo).length
    const focused = Array.from(latestBehaviorsByStudent.values()).filter((behavior) =>
      ['Tập trung', 'Đang lắng nghe', 'Giơ tay', 'Gật đầu'].includes(behavior.label)
    ).length
    const distracted = Array.from(latestBehaviorsByStudent.values()).filter((behavior) =>
      ['Mất tập trung', 'Cúi đầu', 'Nghiêng đầu', 'Lắc đầu'].includes(behavior.label)
    ).length
    const raisedHand = Array.from(latestBehaviorsByStudent.values()).filter((behavior) =>
      behavior.label === 'Giơ tay'
    ).length

    return {
      cameraOn,
      cameraOff,
      focused,
      distracted,
      raisedHand,
      total: entries.length,
    }
  }, [studentOptions, latestBehaviorsByStudent])

  const selectedStudentHistory = useMemo(() => {
    if (!selectedStudent) return []
    return studentBehaviors.filter((behavior) => behavior.userId === selectedStudent.participant.sid)
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [selectedStudent, studentBehaviors])

  const hasScreenShare = screenTracks.length > 0
  const maxMain = hasScreenShare ? 6 : 8
  const mainParticipants = participantEntries.slice(0, maxMain)
  const overflowParticipants = participantEntries.slice(maxMain)

  useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: Parameters<typeof room.on>[1] extends never ? never : any,
      _kind?: unknown,
      topic?: string
    ) => {
      if (topic !== CHAT_TOPIC) {
        return
      }

      try {
        const text = new TextDecoder().decode(payload)
        const parsed = JSON.parse(text) as {
          id?: string
          sender?: string
          message?: string
          timestamp?: number
        }

        if (!parsed.message?.trim()) {
          return
        }

        if (participant?.sid === room.localParticipant.sid) {
          return
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: parsed.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            sender: parsed.sender || participant?.name || participant?.identity || 'Ẩn danh',
            message: parsed.message.trim(),
            timestamp: parsed.timestamp || Date.now(),
            isMine: false,
          },
        ].slice(-100))
      } catch (err) {
        console.error('Chat parse error:', err)
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived)
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room])

  const sendChatMessage = useCallback(async () => {
    const message = chatDraft.trim()
    if (!message) return

    const chatEntry: MeetingChatMessage = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sender: settings.userName,
      message,
      timestamp: Date.now(),
      isMine: true,
    }

    try {
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({
          id: chatEntry.id,
          sender: chatEntry.sender,
          message: chatEntry.message,
          timestamp: chatEntry.timestamp,
        })),
        { reliable: true, topic: CHAT_TOPIC }
      )

      setChatMessages((prev) => [...prev, chatEntry].slice(-100))
      setChatDraft('')
    } catch (err) {
      console.error('Send chat error:', err)
    }
  }, [chatDraft, room.localParticipant, settings.userName])

  const handleChatKeyDown = useCallback((event: import('react').KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    void sendChatMessage()
  }, [sendChatMessage])

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

  const chatSectionContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Giao tiếp nhanh với các thành viên trong phòng.
      </div>
      <div className={styles.chatMessages} style={{ minHeight: '180px', maxHeight: '240px' }}>
        {chatMessages.length === 0 ? (
          <div className={styles.chatEmptyState}>
            <p>Chưa có tin nhắn nào.</p>
            <p>Gửi lời nhắn đầu tiên cho mọi người trong phòng.</p>
          </div>
        ) : (
          chatMessages.map((item) => (
            <div key={item.id} className={`${styles.chatMessage} ${item.isMine ? styles.chatMessageOwn : ''}`}>
              <div className={styles.chatMessageMeta}>
                <strong>{item.isMine ? 'Bạn' : item.sender}</strong>
                <span>{new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={styles.chatBubble}>{item.message}</div>
            </div>
          ))
        )}
      </div>
      <div className={styles.chatComposer}>
        <input
          className={styles.chatInput}
          value={chatDraft}
          onChange={(event) => setChatDraft(event.target.value)}
          onKeyDown={handleChatKeyDown}
          placeholder="Nhập tin nhắn..."
        />
        <button type="button" className={styles.chatSendButton} onClick={() => void sendChatMessage()}>
          Gửi
        </button>
      </div>
    </div>
  )

  const followSectionContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className={styles.followCard}>
        <div className={styles.followHeader}>
          <div>
            <div className={styles.followTitle}>Theo dõi học sinh</div>
            <div className={styles.followSubtitle}>Tóm tắt ngay trạng thái camera và hành vi của học sinh trong lớp.</div>
          </div>
          <div className={styles.followModeBadge}>
            {followAll ? 'Toàn bộ' : 'Cụ thể'}
          </div>
        </div>

        <div className={styles.followButtons}>
          <button
            type="button"
            className={`${styles.followModeButton} ${followAll ? styles.activeFollowButton : ''}`}
            onClick={() => setFollowAll(true)}
          >
            Toàn bộ
          </button>
          <button
            type="button"
            className={`${styles.followModeButton} ${!followAll ? styles.activeFollowButton : ''}`}
            onClick={() => setFollowAll(false)}
          >
            Cụ thể
          </button>
        </div>

        <div className={styles.followStats}>
          <div className={styles.followStatCard}>
            <div className={styles.followStatValue}>{studentOverview.total}</div>
            <div className={styles.followStatLabel}>Tổng học sinh</div>
          </div>
          <div className={styles.followStatCard}>
            <div className={styles.followStatValue}>{studentOverview.cameraOn}</div>
            <div className={styles.followStatLabel}>Camera bật</div>
          </div>
          <div className={styles.followStatCard}>
            <div className={styles.followStatValue}>{studentOverview.cameraOff}</div>
            <div className={styles.followStatLabel}>Camera tắt</div>
          </div>
          <div className={styles.followStatCard}>
            <div className={styles.followStatValue}>{studentOverview.focused}</div>
            <div className={styles.followStatLabel}>Tập trung</div>
          </div>
          <div className={styles.followStatCard}>
            <div className={styles.followStatValue}>{studentOverview.distracted}</div>
            <div className={styles.followStatLabel}>Mất tập trung</div>
          </div>
          <div className={styles.followStatCard}>
            <div className={styles.followStatValue}>{studentOverview.raisedHand}</div>
            <div className={styles.followStatLabel}>Giơ tay</div>
          </div>
        </div>
      </div>

      {!followAll && (
        <div className={styles.followCard}>
          <div className={styles.followSummary}>
            <div>
              <div className={styles.followSummaryLabel}>Học sinh đang chọn</div>
              <div className={styles.followStudentName}>
                {selectedStudent ? selectedStudent.participant.name || selectedStudent.participant.identity : 'Chưa có học sinh'}
              </div>
            </div>
            <div className={styles.followStatusBadge} style={{ background: selectedStudent?.hasVideo ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: selectedStudent?.hasVideo ? '#10b981' : '#ef4444' }}>
              {selectedStudent ? (selectedStudent.hasVideo ? 'Camera bật' : 'Camera tắt') : 'Không có dữ liệu'}
            </div>
          </div>

          <div className={styles.followStats}>
            <div className={styles.followStatCard}>
              <div className={styles.followStatValue}>{selectedStudent ? (selectedStudent.hasVideo ? 'Bật' : 'Tắt') : '-'}</div>
              <div className={styles.followStatLabel}>Camera hiện tại</div>
            </div>
            <div className={styles.followStatCard}>
              <div className={styles.followStatValue}>{selectedStudentWarnings.length}</div>
              <div className={styles.followStatLabel}>Cảnh báo</div>
            </div>
            <div className={styles.followStatCard}>
              <div className={styles.followStatValue}>{selectedStudentHistory.length}</div>
              <div className={styles.followStatLabel}>Lịch sử sự kiện</div>
            </div>
          </div>

          <div className={styles.followStudentSelectLabel}>Chọn học sinh</div>
          <div className={styles.followStudentList}>
            {studentOptions.map((entry) => {
              const displayName = entry.participant.name || entry.participant.identity
              const isActive = entry.participant.sid === selectedStudentId
              return (
                <button
                  key={entry.participant.sid}
                  type="button"
                  className={`${styles.followStudentRow} ${isActive ? styles.activeFollowButton : ''}`}
                  onClick={() => setSelectedStudentId(entry.participant.sid)}
                >
                  <div>
                    <div className={styles.followStudentNameSmall}>{displayName}</div>
                    <div className={styles.followStudentMeta}>{entry.hasVideo ? 'Camera đang bật' : 'Camera đang tắt'}</div>
                  </div>
                  <div className={styles.followStudentBadge} style={{ background: entry.hasVideo ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: entry.hasVideo ? '#10b981' : '#ef4444' }}>
                    {entry.hasVideo ? 'Bật' : 'Tắt'}
                  </div>
                </button>
              )
            })}
          </div>

          <div className={styles.followCardTitle}>Phân tích chi tiết</div>
          <div className={styles.followCardText}>
            Hệ thống sẽ ghi lại mọi sự kiện hành vi của học sinh. Chọn một học sinh để xem lịch sử chi tiết.
          </div>

          {selectedStudent && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {selectedStudentWarnings.length > 0 ? (
                <div className={styles.followWarningList}>
                  {selectedStudentWarnings.map((warning) => (
                    <div key={warning.id} className={styles.followWarningItem}>
                      <div className={styles.followWarningHeading}>{warning.status}</div>
                      <div>{new Date(warning.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.followCardText}>Không có cảnh báo camera mới với học sinh này.</div>
              )}

              <div style={{ maxHeight: '260px', overflowY: 'auto', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px' }}>
                {selectedStudentHistory.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Chưa có sự kiện hành vi nào được ghi nhận cho học sinh này.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {selectedStudentHistory.map((history) => (
                      <div key={`${history.userId}-${history.timestamp}`} style={{ padding: '10px', borderRadius: '14px', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(148,163,184,0.18)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{history.emoji} {history.label}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(history.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const sections = useMemo(() => {
    const historySection = {
      id: 'history',
      title: 'Lịch sử hành vi AI',
      icon: '📊',
      content: <AIBehaviorPanel maxEntries={20} />,
      defaultOpen: true
    }

    const participantsSection = {
      id: 'participants',
      title: 'Thành viên',
      icon: '👥',
      content: <ParticipantSidebar participants={participantEntries} overflow={overflowParticipants} />,
      defaultOpen: true
    }

    const analyticsSection = {
      id: 'analytics',
      title: 'Theo dõi học sinh',
      icon: '🎯',
      content: followSectionContent,
      defaultOpen: true
    }

    const chatSection = {
      id: 'chat',
      title: 'Chat cuộc họp',
      icon: '💬',
      content: chatSectionContent,
      defaultOpen: true
    }

    if (settings.userRole === 'teacher') {
      return [analyticsSection, participantsSection, chatSection]
    }

    return [historySection, participantsSection, chatSection]
  }, [participantEntries, overflowParticipants, settings.userRole, cameraWarnings, followSectionContent, chatSectionContent])

  return (
    <>
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
        footer={<ControlBar roomCode={code} isChatOpen={isChatOpen} onToggleChat={onToggleChat} onDisconnect={onDisconnect} />}
      >
        <ScreenShareView screenTracks={screenTracks} />
        <ParticipantGrid participants={mainParticipants} hasScreenShare={hasScreenShare} />
      </MeetingLayout>
      {isMobile && isChatOpen && (
        <div className={styles.chatDrawer}>
          <div className={styles.chatDrawerHeader}>
            <div>
              <div className={styles.chatTitle}>💬 Chat cuộc họp</div>
              <div className={styles.chatSubtitle}>{chatMessages.length} tin nhắn</div>
            </div>
            <button type="button" className={styles.controlButton} onClick={onToggleChat} aria-label="Close chat">
              ✕
            </button>
          </div>
          {chatSectionContent}
        </div>
      )}
    </>
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
