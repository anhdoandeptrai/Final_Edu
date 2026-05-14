'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { aiDetector, BehaviorResult } from '../lib/ai-detector'
import { addBehaviorEntry } from './BehaviorHistoryPanel'
import { addStudentBehavior } from './StudentsBehaviorPanel'

interface Props {
  enabled?: boolean
  userId?: string
  userName?: string
  participantSid?: string // For detecting remote participants
}

export default function AIBehaviorDetector({ enabled = true, userId, userName, participantSid }: Props) {
  const [behavior, setBehavior] = useState<BehaviorResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAIOn, setIsAIOn] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastEmitRef = useRef<number>(0)
  const lastLabelRef = useRef<string>('')
  const updateIntervalMs = 2500

  const findLocalVideo = useCallback((): HTMLVideoElement | null => {
    // Find the video element - either local or specific participant
    const videos = Array.from(document.querySelectorAll('video'))
    console.log('[AI] Tìm thấy', videos.length, 'video elements', participantSid ? `(tìm participant: ${participantSid})` : '(tìm local)')

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]

      // Check if video is ready
      if (!video.srcObject || video.readyState < 2 || video.videoWidth === 0) {
        continue
      }

      // If looking for specific participant
      if (participantSid) {
        // Try multiple ways to identify the participant video

        // Method 1: Check data attributes on video or parent
        const container = video.closest('[data-lk-participant-sid]') ||
          video.closest('[data-lk-participant]') ||
          video.closest('[data-lk-participant-identity]')

        if (container) {
          const sid = container.getAttribute('data-lk-participant-sid') ||
            container.getAttribute('data-lk-participant') ||
            container.getAttribute('data-lk-participant-identity')

          if (sid === participantSid) {
            console.log('[AI] ✅ Tìm thấy video của participant qua data attribute:', participantSid)
            return video
          }
        }

        // Method 2: Check if video element itself has data attributes
        const videoSid = video.getAttribute('data-lk-participant-sid') ||
          video.getAttribute('data-participant-sid') ||
          video.getAttribute('data-participant-identity')

        if (videoSid === participantSid) {
          console.log('[AI] ✅ Tìm thấy video của participant qua video attribute:', participantSid)
          return video
        }

        // Method 3: For remote participants, exclude muted videos (local video is usually muted)
        // Remote participants typically have unmuted video elements
        if (!video.muted && i > 0) {
          console.log('[AI] ✅ Tìm thấy video remote participant (unmuted):', i)
          return video
        }
      } else {
        // Find local video (usually the first muted video with srcObject)
        if (video.muted) {
          console.log('[AI] ✅ Tìm thấy local video (muted):', i)
          return video
        }

        // Fallback: first available video
        if (i === 0) {
          console.log('[AI] ✅ Tìm thấy video phù hợp (fallback):', i)
          return video
        }
      }
    }
    console.log('[AI] ❌ Không tìm thấy video phù hợp')
    return null
  }, [participantSid])

  const runDetection = useCallback(async () => {
    if (!isAIOn) return

    const video = videoRef.current || findLocalVideo()
    if (!video) {
      console.log('[AI] ❌ Không tìm thấy video element')
      return
    }

    videoRef.current = video
    const result = await aiDetector.detect(video)
    if (!result) {
      return
    }

    const now = Date.now()
    if (lastLabelRef.current === result.label && now - lastEmitRef.current < updateIntervalMs) {
      return
    }

    lastLabelRef.current = result.label
    lastEmitRef.current = now
    setBehavior(result)

    // Add to history panel (student's own view)
    addBehaviorEntry({
      label: result.label,
      emoji: result.emoji,
      type: result.type
    })

    // Add to teacher's panel if userId and userName provided
    if (userId && userName) {
      addStudentBehavior({
        userId,
        userName,
        label: result.label,
        emoji: result.emoji,
        color: result.color,
        timestamp: Date.now()
      })
    }
  }, [isAIOn, findLocalVideo, userId, userName])

  useEffect(() => {
    console.log('[AI] useEffect triggered, isAIOn:', isAIOn)

    if (!isAIOn) {
      console.log('[AI] AI tắt, dọn dẹp interval')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const init = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('[AI] Đang khởi tạo AI detector...')
        const success = await aiDetector.initialize()
        if (!success) {
          console.error('[AI] ❌ Không thể khởi tạo AI')
          setError('Không thể khởi tạo AI')
          setIsLoading(false)
          return
        }

        setIsLoading(false)

        let retryCount = 0
        const maxRetries = 10

        // Wait for video to be available
        const waitForVideo = () => {
          console.log(`[AI] Thử tìm video (lần ${retryCount + 1}/${maxRetries})...`)
          const video = findLocalVideo()

          if (video) {
            console.log('[AI] ✅ Đã tìm thấy video, bắt đầu detection loop')
            console.log('[AI] Video info:', {
              width: video.videoWidth,
              height: video.videoHeight,
              readyState: video.readyState,
              muted: video.muted,
              participantSid
            })
            videoRef.current = video

            // Run immediately first time
            runDetection()

            // Then start detection loop - throttled for UI stability
            intervalRef.current = setInterval(() => {
              runDetection()
            }, updateIntervalMs)
          } else {
            retryCount++
            if (retryCount < maxRetries) {
              setTimeout(waitForVideo, 1000)
            } else {
              console.error('[AI] ❌ Không thể tìm thấy video sau', maxRetries, 'lần thử')
              console.log('[AI] Debug - tất cả video elements:', Array.from(document.querySelectorAll('video')).map((v, i) => ({
                index: i,
                muted: v.muted,
                width: v.videoWidth,
                height: v.videoHeight,
                readyState: v.readyState,
                hasSrcObject: !!v.srcObject
              })))
            }
          }
        }

        console.log('[AI] Đợi 2s trước khi tìm video...')
        setTimeout(waitForVideo, 2000)
      } catch (err) {
        console.error('[AI] Lỗi khởi tạo AI:', err)
        setError('Lỗi khởi tạo AI')
        setIsLoading(false)
      }
    }

    init()

    return () => {
      console.log('[AI] Cleanup: dọn dẹp interval')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAIOn, findLocalVideo, runDetection])

  const toggleAI = () => {
    setIsAIOn(!isAIOn)
    if (isAIOn) {
      setBehavior(null)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: participantSid ? -9999 : 70, // Hide if detecting remote participant
      left: participantSid ? -9999 : 16,
      zIndex: participantSid ? -1 : 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      {/* AI Status Badge */}
      {isAIOn && behavior && !isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: 'var(--bg-primary)',
            color: behavior.color,
            border: `2px solid ${behavior.color}40`,
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>{behavior.emoji}</span>
          <span>{behavior.label}</span>
        </div>
      )}

      {/* Loading State */}
      {isAIOn && isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: 'var(--bg-primary)',
            color: '#6b7280',
            border: '2px solid rgba(107, 114, 128, 0.3)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <span style={{ fontSize: '1.25rem', animation: 'spin 1s linear infinite' }}>⏳</span>
          <span>Đang tải AI...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          {error}
        </div>
      )}

      {/* AI Toggle Button */}
      <button
        onClick={toggleAI}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: isAIOn ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
          border: `1px solid ${isAIOn ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
          borderRadius: '10px',
          padding: '0.5rem 0.875rem',
          color: isAIOn ? 'var(--success)' : 'var(--text-muted)',
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s'
        }}
      >
        <span>🤖</span>
        <span>AI {isAIOn ? 'ON' : 'OFF'}</span>
      </button>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
