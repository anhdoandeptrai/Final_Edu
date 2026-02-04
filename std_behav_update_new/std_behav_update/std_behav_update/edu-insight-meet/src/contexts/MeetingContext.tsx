'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { UserRole } from './AuthContext'

export interface MeetingParticipant {
  userId: string
  userName: string
  role: UserRole
  joinedAt: number
}

export interface Meeting {
  code: string
  creatorId: string
  participants: MeetingParticipant[]
  createdAt: number
}

interface MeetingContextType {
  createMeeting: (code: string, userId: string, userName: string, role: UserRole) => void
  joinMeeting: (code: string, userId: string, userName: string, role: UserRole) => boolean
  getMeeting: (code: string) => Meeting | null
  isTeacher: (code: string, userId: string) => boolean
  getStudents: (code: string) => MeetingParticipant[]
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined)

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Map<string, Meeting>>(new Map())

  const createMeeting = (code: string, userId: string, userName: string, role: UserRole) => {
    const meeting: Meeting = {
      code,
      creatorId: userId,
      participants: [{
        userId,
        userName,
        role,
        joinedAt: Date.now()
      }],
      createdAt: Date.now()
    }
    
    setMeetings(prev => new Map(prev).set(code, meeting))
    
    // Store in localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const meetingsData = JSON.parse(localStorage.getItem('meetings') || '{}')
      meetingsData[code] = meeting
      localStorage.setItem('meetings', JSON.stringify(meetingsData))
    }
  }

  const joinMeeting = (code: string, userId: string, userName: string, role: UserRole): boolean => {
    // Load meeting from localStorage if not in state (client-side only)
    let meeting = meetings.get(code)
    
    if (!meeting && typeof window !== 'undefined') {
      const meetingsData = JSON.parse(localStorage.getItem('meetings') || '{}')
      meeting = meetingsData[code]
      
      if (!meeting) {
        return false
      }
    }
    
    if (!meeting) {
      return false
    }

    // Check if user already joined
    if (meeting.participants.some(p => p.userId === userId)) {
      return true
    }

    // Add participant
    const newParticipant: MeetingParticipant = {
      userId,
      userName,
      role,
      joinedAt: Date.now()
    }

    meeting.participants.push(newParticipant)
    setMeetings(prev => new Map(prev).set(code, meeting!))

    // Update localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const meetingsData = JSON.parse(localStorage.getItem('meetings') || '{}')
      meetingsData[code] = meeting
      localStorage.setItem('meetings', JSON.stringify(meetingsData))
    }

    return true
  }

  const getMeeting = (code: string): Meeting | null => {
    let meeting = meetings.get(code)
    
    if (!meeting && typeof window !== 'undefined') {
      const meetingsData = JSON.parse(localStorage.getItem('meetings') || '{}')
      meeting = meetingsData[code]
    }

    return meeting || null
  }

  const isTeacher = (code: string, userId: string): boolean => {
    const meeting = getMeeting(code)
    if (!meeting) return false
    
    // Check actual role of the participant, not creator status
    const participant = meeting.participants.find(p => p.userId === userId)
    return participant?.role === 'teacher'
  }

  const getStudents = (code: string): MeetingParticipant[] => {
    const meeting = getMeeting(code)
    if (!meeting) return []
    
    return meeting.participants.filter(p => p.role === 'student')
  }

  return (
    <MeetingContext.Provider value={{
      createMeeting,
      joinMeeting,
      getMeeting,
      isTeacher,
      getStudents
    }}>
      {children}
    </MeetingContext.Provider>
  )
}

export function useMeeting() {
  const context = useContext(MeetingContext)
  if (context === undefined) {
    throw new Error('useMeeting must be used within a MeetingProvider')
  }
  return context
}
