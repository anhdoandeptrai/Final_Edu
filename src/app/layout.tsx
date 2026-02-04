import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { MeetingProvider } from '../contexts/MeetingContext'

export const metadata: Metadata = {
  title: 'Edu Insight Meet',
  description: 'Real-time video meeting for education',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <MeetingProvider>
            {children}
          </MeetingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
