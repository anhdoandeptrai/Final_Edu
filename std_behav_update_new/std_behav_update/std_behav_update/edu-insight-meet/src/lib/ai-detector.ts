// Simplified AI detector placeholder (no TensorFlow for now)
export interface BehaviorResult {
  label: string
  emoji: string
  color: string
  bgColor: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
}

export const aiDetector = {
  initialized: false,

  async initialize(): Promise<boolean> {
    this.initialized = true
    return true
  },

  async detect(video: HTMLVideoElement): Promise<BehaviorResult | null> {
    if (!this.initialized || !video) return null

    // Placeholder behavior - can be enhanced later
    return {
      label: 'Engaged',
      emoji: '✅',
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      type: 'positive'
    }
  },

  cleanup(): void {
    this.initialized = false
  }
}
