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
  console.log('[AI-Detector] Bắt đầu khởi tạo detector...')
  
  if (detector) {
    console.log('[AI-Detector] ✅ Detector đã tồn tại')
    return true
  }
  
  if (isInitializing) {
    console.log('[AI-Detector] ⏳ Đang khởi tạo...')
    return false
  }
  
  if (initializationFailed) {
    console.log('[AI-Detector] ❌ Khởi tạo đã thất bại trước đó')
    return false
  }
  
  isInitializing = true
  
  try {
    // Check if running in browser and WebGL is available
    if (typeof window === 'undefined') {
      console.warn('[AI-Detector] ❌ Chỉ chạy được trên browser')
      isInitializing = false
      initializationFailed = true
      return false
    }

    console.log('[AI-Detector] 🔄 Đang tải MoveNet model...')
    // Use MoveNet model - lightweight and fast for browser
    const model = poseDetection.SupportedModels.MoveNet
    detector = await poseDetection.createDetector(model, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    })
    console.log('[AI-Detector] ✅ MoveNet model đã tải thành công')
    isInitializing = false
    return true
  } catch (error) {
    console.error('[AI-Detector] ❌ Lỗi khi khởi tạo pose detector:', error)
    console.warn('[AI-Detector] AI detection sẽ bị tắt')
    isInitializing = false
    initializationFailed = true
    return false
  }
}

export async function detectBehavior(video: HTMLVideoElement): Promise<BehaviorDetectionResult | null> {
  if (!detector) {
    console.log('[AI-Detector] Detector chưa sẵn sàng, đang khởi tạo...')
    const initialized = await initDetector()
    if (!initialized) {
      console.error('[AI-Detector] ❌ Không thể khởi tạo detector')
      return null
    }
  }

  try {
    console.log('[AI-Detector] 🔍 Đang phát hiện pose...')
    console.log('[AI-Detector] Video:', {
      width: video.videoWidth,
      height: video.videoHeight,
      readyState: video.readyState
    })
    
    const poses = await detector!.estimatePoses(video)
    console.log('[AI-Detector] Tìm thấy', poses.length, 'pose(s)')
    
    if (poses.length === 0) {
      console.log('[AI-Detector] ⚠️ Không phát hiện người')
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
    console.log('[AI-Detector] Keypoints:', keypoints.length)

    // Get key body parts
    const nose = keypoints.find(kp => kp.name === 'nose')
    const leftEye = keypoints.find(kp => kp.name === 'left_eye')
    const rightEye = keypoints.find(kp => kp.name === 'right_eye')
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder')
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder')

    console.log('[AI-Detector] Phát hiện các điểm:', {
      nose: nose?.score,
      leftEye: leftEye?.score,
      rightEye: rightEye?.score,
      leftShoulder: leftShoulder?.score,
      rightShoulder: rightShoulder?.score
    })

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

    console.log('[AI-Detector] Confidence:', {
      face: faceConfidence.toFixed(2),
      shoulder: shoulderConfidence.toFixed(2)
    })

    // If face is not visible (low confidence), person might be looking away
    if (faceConfidence < 0.3) {
      console.log('[AI-Detector] ⚠️ Khuôn mặt không rõ ->', 'Mất tập trung')
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

      console.log('[AI-Detector] Phân tích tư thế:', {
        headDrop: headDrop.toFixed(2),
        noseY: nose.y.toFixed(2),
        shoulderMidY: shoulderMidY.toFixed(2)
      })

      // If head is significantly below shoulders, might be sleeping
      if (headDrop > 100 && faceConfidence > 0.5) {
        console.log('[AI-Detector] 😴 Đầu cúi xuống ->', 'Buồn ngủ')
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
        
        console.log('[AI-Detector] Góc nghiêng đầu:', (eyeAngle * 180 / Math.PI).toFixed(2), 'độ')
        
        if (eyeAngle > 0.3) { // ~17 degrees
          console.log('[AI-Detector] ⚠️ Đầu nghiêng quá ->', 'Mất tập trung')
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
    console.log('[AI-Detector] ✅ Tư thế tốt ->', 'Tập trung')
    return {
      label: 'Tập trung',
      emoji: '✅',
      color: '#10b981',
      type: 'positive',
      confidence: faceConfidence
    }

  } catch (error) {
    console.error('[AI-Detector] ❌ Lỗi khi phát hiện hành vi:', error)
    return null
  }
}

export function cleanupDetector() {
  if (detector) {
    detector.dispose()
    detector = null
  }
}
