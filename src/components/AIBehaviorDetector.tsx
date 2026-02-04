'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BehaviorResult } from '../lib/ai-detector'
import { addBehaviorEntry } from './BehaviorHistoryPanel'
import { addStudentBehavior } from './StudentsBehaviorPanel'

// Lazy load AI detector to avoid build issues
let aiDetector: any = null
const loadAIDetector = async () => {
  if (!aiDetector && typeof window !== 'undefined') {
    const module = await import('../lib/ai-detector')
    aiDetector = module.aiDetector
  }
  return aiDetector
}

interface Props {
  enabled?: boolean
  userId?: string
  userName?: string
}

export default function AIBehaviorDetector({ enabled = true, userId = '', userName = 'Student' }: Props) {
  const [behavior, setBehavior] = useState<BehaviorResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAIOn, setIsAIOn] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const findLocalVideo = useCallback((): HTMLVideoElement | null => {
    // Find the local (muted) video element from LiveKit
    const videos = Array.from(document.querySelectorAll('video'))
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      if (video.muted && video.srcObject && video.readyState >= 2) {
        return video
      }
    }
    return null
  }, [])

  const runDetection = useCallback(async () => {
    if (!isAIOn) return

    const video = videoRef.current || findLocalVideo()
    if (!video) return

    videoRef.current = video
    const detector = await loadAIDetector()
    if (!detector) return
    
    const result = await detector.detect(video)
    if (result) {
      setBehavior(result)
      // Add to history panel
      addBehaviorEntry({
        label: result.label,
        emoji: result.emoji,
        type: result.type
      })
      
      // Also broadcast to teacher's view if userId is provided
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
    }
  }, [isAIOn, findLocalVideo, userId, userName])

  useEffect(() => {
    if (!isAIOn) {
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
        const detector = await loadAIDetector()
        if (!detector) {
          setError('Không thể tải AI detector')
          setIsLoading(false)
          return
        }
        
        const success = await detector.initialize()
        if (!success) {
          setError('Không thể khởi tạo AI')
          setIsLoading(false)
          return
        }

        setIsLoading(false)

        // Wait for video to be available
        const waitForVideo = () => {
          const video = findLocalVideo()
          if (video) {
            videoRef.current = video
            // Start detection loop
            intervalRef.current = setInterval(runDetection, 500) // 2 FPS
          } else {
            setTimeout(waitForVideo, 1000)
          }
        }

        setTimeout(waitForVideo, 2000)
      } catch (err) {
        setError('Lỗi khởi tạo AI')
        setIsLoading(false)
      }
    }

    init()

    return () => {
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
      top: 70,
      left: 16,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      {/* AI Status Badge */}
      {isAIOn && behavior && (
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          borderRadius: '12px',
          fontSize: '0.875rem',
          background: 'var(--accent-light)',
          color: 'var(--accent-primary)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
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
