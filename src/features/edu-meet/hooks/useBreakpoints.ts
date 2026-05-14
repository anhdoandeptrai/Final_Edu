'use client'

import { useEffect, useState } from 'react'

const MOBILE_MAX = 640
const TABLET_MAX = 960

export default function useBreakpoints() {
  const [width, setWidth] = useState<number>(0)

  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return {
    width,
    isMobile: width > 0 && width <= MOBILE_MAX,
    isTablet: width > MOBILE_MAX && width <= TABLET_MAX,
    isDesktop: width > TABLET_MAX
  }
}
