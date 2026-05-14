'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  icon: string
  label: string
  href: string
}

interface Props {
  isMobileOpen: boolean
  onOpenMobile: () => void
  onCloseMobile: () => void
}

const navItems: NavItem[] = [
  { icon: '🏠', label: 'Trang chủ', href: '/' },
  { icon: '📚', label: 'LMS', href: '/lms' },
  { icon: '📹', label: 'Cuộc họp', href: '/meeting' },
  { icon: '📊', label: 'Lịch sử & Phân tích', href: '/history' },
  { icon: '⚙️', label: 'Cài đặt', href: '/settings' },
]

export default function Sidebar({ isMobileOpen, onOpenMobile, onCloseMobile }: Props) {
  const pathname = usePathname()

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-trigger"
        aria-label={isMobileOpen ? 'Đóng menu' : 'Mở menu'}
        onClick={isMobileOpen ? onCloseMobile : onOpenMobile}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-icon">🎓</div>
            <div>
              <h1 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Edu Insight
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                AI-Powered Learning
              </p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <p>Powered by</p>
          <p className="sidebar-footer-tech">
            LiveKit • TensorFlow • MediaPipe
          </p>
        </div>
      </aside>
    </>
  )
}
