import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Edu Insight Meet',
  description: 'Real-time video meeting for education',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
