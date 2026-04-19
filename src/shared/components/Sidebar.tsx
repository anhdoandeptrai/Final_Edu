'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  icon: string
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: '🏠', label: 'Trang chủ', href: '/' },
  { icon: '📚', label: 'LMS', href: '/lms' },
  { icon: '📹', label: 'Cuộc họp', href: '/meeting' },
  { icon: '📊', label: 'Lịch sử & Phân tích', href: '/history' },
  { icon: '⚙️', label: 'Cài đặt', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Header */}
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

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <p>Powered by</p>
        <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
          LiveKit • TensorFlow • MediaPipe
        </p>
      </div>
    </aside>
  )
}
