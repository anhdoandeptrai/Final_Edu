import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs'

export interface BehaviorDetectionResult {
  label: string
  emoji: string
  color: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  confidence: number
}

let detector: poseDetection.PoseDetector | null = null
let isInitializing = false
let initializationFailed = false

export async function initDetector(): Promise<boolean> {
  if (detector) return true
  if (isInitializing) return false
  if (initializationFailed) return false // Don't retry if already failed
  
  isInitializing = true
  
  try {
    // Check if running in browser and WebGL is available
    if (typeof window === 'undefined') {
      console.warn('AI detector can only run in browser')
      isInitializing = false
      initializationFailed = true
      return false
    }

    // Use MoveNet model - lightweight and fast for browser
    const model = poseDetection.SupportedModels.MoveNet
    detector = await poseDetection.createDetector(model, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    })
    isInitializing = false
    return true
  } catch (error) {
    console.error('Failed to initialize pose detector:', error)
    console.warn('AI detection will be disabled. This is normal on some devices.')
    isInitializing = false
    initializationFailed = true
    return false
  }
}

export async function detectBehavior(video: HTMLVideoElement): Promise<BehaviorDetectionResult | null> {
  if (!detector) {
    const initialized = await initDetector()
    if (!initialized) return null
  }

  try {
    const poses = await detector!.estimatePoses(video)
    
    if (poses.length === 0) {
      return {
        label: 'Không phát hiện',
        emoji: '👻',
        color: '#6b7280',
        type: 'neutral',
        confidence: 0
      }
    }

    const pose = poses[0]
    const keypoints = pose.keypoints

    // Get key body parts
    const nose = keypoints.find(kp => kp.name === 'nose')
    const leftEye = keypoints.find(kp => kp.name === 'left_eye')
    const rightEye = keypoints.find(kp => kp.name === 'right_eye')
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder')
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder')

    // Calculate confidence scores
    const faceConfidence = Math.min(
      nose?.score || 0,
      leftEye?.score || 0,
      rightEye?.score || 0
    )

    const shoulderConfidence = Math.min(
      leftShoulder?.score || 0,
      rightShoulder?.score || 0
    )

    // If face is not visible (low confidence), person might be looking away
    if (faceConfidence < 0.3) {
      return {
        label: 'Mất tập trung',
        emoji: '⚠️',
        color: '#f59e0b',
        type: 'warning',
        confidence: faceConfidence
      }
    }

    // Check head position relative to shoulders
    if (nose && leftShoulder && rightShoulder) {
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2
      const headDrop = nose.y - shoulderMidY

      // If head is significantly below shoulders, might be sleeping
      if (headDrop > 100 && faceConfidence > 0.5) {
        return {
          label: 'Buồn ngủ',
          emoji: '😴',
          color: '#ef4444',
          type: 'negative',
          confidence: faceConfidence
        }
      }

      // If head is tilted too much
      if (leftEye && rightEye) {
        const eyeAngle = Math.abs(Math.atan2(
          rightEye.y - leftEye.y,
          rightEye.x - leftEye.x
        ))
        
        if (eyeAngle > 0.3) { // ~17 degrees
          return {
            label: 'Mất tập trung',
            emoji: '⚠️',
            color: '#f59e0b',
            type: 'warning',
            confidence: faceConfidence
          }
        }
      }
    }

    // Default: person is focused (face visible, upright posture)
    return {
      label: 'Tập trung',
      emoji: '✅',
      color: '#10b981',
      type: 'positive',
      confidence: faceConfidence
    }

  } catch (error) {
    console.error('Error detecting behavior:', error)
    return null
  }
}

export function cleanupDetector() {
  if (detector) {
    detector.dispose()
    detector = null
  }
}
