// AI Behavior Detector using TensorFlow.js MoveNet
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'

export interface BehaviorResult {
  label: string
  emoji: string
  color: string
  bgColor: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
}

interface Point {
  x: number
  y: number
}

class AIDetector {
  private detector: poseDetection.PoseDetector | null = null
  private historyBuffer: Point[] = []
  private readonly BUFFER_SIZE = 15
  private isInitialized = false
  private isInitializing = false

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true
    if (this.isInitializing) return false

    this.isInitializing = true
    
    try {
      console.log('[AI] Setting up TensorFlow backend...')
      
      // Set backend to webgl (more compatible than webgpu)
      await tf.setBackend('webgl')
      await tf.ready()
      
      console.log('[AI] TensorFlow ready, backend:', tf.getBackend())
      console.log('[AI] Initializing MoveNet...')
      
      const model = poseDetection.SupportedModels.MoveNet
      this.detector = await poseDetection.createDetector(model, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      })
      
      this.isInitialized = true
      this.isInitializing = false
      console.log('[AI] MoveNet initialized successfully!')
      return true
    } catch (err) {
      console.error('[AI] Failed to initialize:', err)
      this.isInitializing = false
      return false
    }
  }

  async detect(video: HTMLVideoElement): Promise<BehaviorResult | null> {
    if (!this.detector || !video || video.readyState < 2) {
      return null
    }

    try {
      const poses = await this.detector.estimatePoses(video)
      
      if (!poses || poses.length === 0 || !poses[0].keypoints) {
        return {
          label: 'Không thấy người',
          emoji: '❓',
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.2)',
          type: 'neutral'
        }
      }

      const keypoints = poses[0].keypoints
      return this.analyzeBehavior(keypoints)
    } catch (err) {
      console.error('[AI] Detection error:', err)
      return null
    }
  }

  private analyzeBehavior(keypoints: poseDetection.Keypoint[]): BehaviorResult {
    // MoveNet keypoints: nose(0), leftEye(1), rightEye(2), leftEar(3), rightEar(4),
    // leftShoulder(5), rightShoulder(6), leftElbow(7), rightElbow(8),
    // leftWrist(9), rightWrist(10), leftHip(11), rightHip(12)...

    const nose = keypoints[0]
    const leftEye = keypoints[1]
    const rightEye = keypoints[2]
    const leftEar = keypoints[3]
    const rightEar = keypoints[4]
    const leftShoulder = keypoints[5]
    const rightShoulder = keypoints[6]
    const leftWrist = keypoints[9]
    const rightWrist = keypoints[10]

    // Check confidence
    if (!nose || (nose.score ?? 0) < 0.3) {
      return {
        label: 'Không thấy người',
        emoji: '❓',
        color: '#64748b',
        bgColor: 'rgba(100, 116, 139, 0.2)',
        type: 'neutral'
      }
    }

    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2
    const shoulderX = (leftShoulder.x + rightShoulder.x) / 2
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
    const eyeMidY = (leftEye.y + rightEye.y) / 2

    // Update history for gesture detection
    this.updateHistory({ x: nose.x, y: nose.y })
    const headGesture = this.detectHeadGesture()

    // --- DETECTION RULES ---

    // Sleeping: head dropped significantly
    const distNoseToShoulder = Math.abs(shoulderY - nose.y)
    const distEyeToShoulder = Math.abs(shoulderY - eyeMidY)
    if (distNoseToShoulder < distEyeToShoulder * 0.5 && headGesture === 'STILL') {
      return {
        label: 'Đang ngủ',
        emoji: '😴',
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.2)',
        type: 'negative'
      }
    }

    // Distracted: head turned away
    const noseOffset = Math.abs(nose.x - shoulderX)
    if (shoulderWidth > 0 && noseOffset > shoulderWidth * 0.3) {
      return {
        label: 'Mất tập trung',
        emoji: '👀',
        color: '#f43f5e',
        bgColor: 'rgba(244, 63, 94, 0.2)',
        type: 'negative'
      }
    }

    // Head tilt
    if ((leftEar.score ?? 0) > 0.3 && (rightEar.score ?? 0) > 0.3) {
      const earDiff = Math.abs(leftEar.y - rightEar.y)
      if (shoulderWidth > 0 && earDiff > shoulderWidth * 0.2) {
        return {
          label: 'Nghiêng đầu',
          emoji: '⚠️',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.2)',
          type: 'warning'
        }
      }
    }

    // Looking down (phone)
    if ((leftEar.score ?? 0) > 0.3 && (rightEar.score ?? 0) > 0.3) {
      if (nose.y > leftEar.y + 30 && nose.y > rightEar.y + 30) {
        return {
          label: 'Cúi đầu',
          emoji: '📱',
          color: '#f43f5e',
          bgColor: 'rgba(244, 63, 94, 0.2)',
          type: 'negative'
        }
      }
    }

    // Raising hand
    if ((leftWrist.score ?? 0) > 0.3 && leftWrist.y < leftShoulder.y - 50) {
      return {
        label: 'Giơ tay',
        emoji: '✋',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.2)',
        type: 'positive'
      }
    }
    if ((rightWrist.score ?? 0) > 0.3 && rightWrist.y < rightShoulder.y - 50) {
      return {
        label: 'Giơ tay',
        emoji: '✋',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.2)',
        type: 'positive'
      }
    }

    // Head gestures
    if (headGesture === 'NOD') {
      return {
        label: 'Gật đầu',
        emoji: '👍',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.2)',
        type: 'positive'
      }
    }

    if (headGesture === 'SHAKE') {
      return {
        label: 'Lắc đầu',
        emoji: '👎',
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.2)',
        type: 'warning'
      }
    }

    // Default: Listening attentively
    return {
      label: 'Đang lắng nghe',
      emoji: '✅',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.2)',
      type: 'positive'
    }
  }

  private updateHistory(point: Point): void {
    this.historyBuffer.push(point)
    if (this.historyBuffer.length > this.BUFFER_SIZE) {
      this.historyBuffer.shift()
    }
  }

  private detectHeadGesture(): string {
    if (this.historyBuffer.length < 8) return 'MOVING'

    let xMin = Infinity, xMax = -Infinity
    let yMin = Infinity, yMax = -Infinity

    this.historyBuffer.forEach(p => {
      if (p.x < xMin) xMin = p.x
      if (p.x > xMax) xMax = p.x
      if (p.y < yMin) yMin = p.y
      if (p.y > yMax) yMax = p.y
    })

    const xRange = xMax - xMin
    const yRange = yMax - yMin

    if (yRange > 20 && xRange < 10) return 'NOD'
    if (xRange > 25 && yRange < 10) return 'SHAKE'
    if (xRange < 5 && yRange < 5) return 'STILL'
    return 'MOVING'
  }

  reset(): void {
    this.historyBuffer = []
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

export const aiDetector = new AIDetector()
