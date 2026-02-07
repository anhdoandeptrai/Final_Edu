'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { addBehaviorEntry } from './BehaviorHistoryPanel'
import { addStudentBehavior } from './StudentsBehaviorPanel'
import { detectBehavior, initDetector, cleanupDetector } from '../lib/ai-detector'

interface Props {
  enabled?: boolean
  userId?: string
  userName?: string
}

interface BehaviorResult {
  label: string
  emoji: string
  color: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  confidence?: number
}

export default function AIBehaviorDetector({ enabled = true, userId, userName }: Props) {
  const [behavior, setBehavior] = useState<BehaviorResult | null>(null)
  const [isAIOn, setIsAIOn] = useState(enabled)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const detectorInitialized = useRef(false)

  const findLocalVideo = useCallback((): HTMLVideoElement | null => {
    const videos = Array.from(document.querySelectorAll('video'))
    console.log('[AI] Tìm thấy', videos.length, 'video elements')
    
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      console.log(`[AI] Video ${i}:`, {
        muted: video.muted,
        hasSrcObject: !!video.srcObject,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      })
      
      // Try to find local video (usually muted) with video stream
      if (video.srcObject && video.readyState >= 2 && video.videoWidth > 0) {
        console.log('[AI] ✅ Tìm thấy video phù hợp:', i)
        return video
      }
    }
    console.log('[AI] ❌ Không tìm thấy video phù hợp')
    return null
  }, [])

  const runDetection = useCallback(async () => {
    console.log('[AI] Bắt đầu phát hiện, isAIOn:', isAIOn)
    if (!isAIOn) return

    const video = videoRef.current || findLocalVideo()
    if (!video) {
      console.log('[AI] ❌ Không tìm thấy video element')
      return
    }

    videoRef.current = video
    console.log('[AI] ✅ Đang sử dụng video element')
    
    // Initialize detector on first run
    if (!detectorInitialized.current) {
      console.log('[AI] Đang khởi tạo AI detector...')
      setIsLoading(true)
      const initialized = await initDetector()
      if (!initialized) {
        console.error('[AI] ❌ Không thể khởi tạo AI detector')
        setIsLoading(false)
        return
      }
      console.log('[AI] ✅ AI detector đã sẵn sàng')
      detectorInitialized.current = true
      setIsLoading(false)
    }

    // Run real AI detection
    console.log('[AI] Đang phân tích hành vi...')
    const result = await detectBehavior(video)
    if (!result) {
      console.log('[AI] ⚠️ Không có kết quả phát hiện')
      return
    }
    
    console.log('[AI] ✅ Phát hiện:', result.label, result.emoji)
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

    let retryCount = 0
    const maxRetries = 10

    // Wait for video to be available
    const waitForVideo = () => {
      console.log(`[AI] Thử tìm video (lần ${retryCount + 1}/${maxRetries})...`)
      const video = findLocalVideo()
      
      if (video) {
        console.log('[AI] ✅ Đã tìm thấy video, bắt đầu detection loop')
        videoRef.current = video
        
        // Run immediately first time
        runDetection()
        
        // Then start detection loop - every 5 seconds
        intervalRef.current = setInterval(() => {
          console.log('[AI] Chạy detection định kỳ...')
          runDetection()
        }, 5000)
      } else {
        retryCount++
        if (retryCount < maxRetries) {
          console.log('[AI] Chưa tìm thấy video, thử lại sau 1s...')
          setTimeout(waitForVideo, 1000)
        } else {
          console.error('[AI] ❌ Không thể tìm thấy video sau', maxRetries, 'lần thử')
        }
      }
    }

    console.log('[AI] Đợi 2s trước khi tìm video...')
    setTimeout(waitForVideo, 2000)

    return () => {
      console.log('[AI] Cleanup: dọn dẹp interval và detector')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      cleanupDetector()
    }
  }, [isAIOn])

  const toggleAI = () => {
    setIsAIOn(!isAIOn)
    if (isAIOn) {
      setBehavior(null)
      detectorInitialized.current = false
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 70,
      left: 16,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      {/* AI Status Badge */}
      {isLoading && (
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
          <span style={{ fontSize: '1.25rem' }}>⏳</span>
          <span>Đang tải AI...</span>
        </div>
      )}
      
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
      `}</style>
    </div>
  )
}
