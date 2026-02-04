'use client'

import { useState, useEffect } from 'react'

export interface StudentBehavior {
  userId: string
  userName: string
  label: string
  emoji: string
  color: string
  timestamp: number
}

let studentBehaviors: StudentBehavior[] = []
let listeners: Array<() => void> = []

export function addStudentBehavior(behavior: StudentBehavior) {
  studentBehaviors = [behavior, ...studentBehaviors.slice(0, 99)] // Keep last 100
  listeners.forEach(listener => listener())
}

export function subscribeToStudentBehaviors(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

export function getStudentBehaviors() {
  return studentBehaviors
}

export default function StudentsBehaviorPanel() {
  const [behaviors, setBehaviors] = useState<StudentBehavior[]>([])
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToStudentBehaviors(() => {
      setBehaviors([...getStudentBehaviors()])
    })
    return unsubscribe
  }, [])

  // Get unique students
  const students = new Map<string, StudentBehavior>()
  behaviors.forEach(behavior => {
    if (!students.has(behavior.userId)) {
      students.set(behavior.userId, behavior)
    }
  })

  const uniqueStudents = Array.from(students.values())

  // Calculate statistics
  const stats = {
    focused: behaviors.filter(b => b.label === 'Tập trung').length,
    distracted: behaviors.filter(b => b.label === 'Mất tập trung').length,
    sleeping: behaviors.filter(b => b.label === 'Buồn ngủ').length,
    total: uniqueStudents.length
  }

  return (
    <div style={{
      position: 'fixed',
      top: 70,
      right: 16,
      zIndex: 1000,
      width: isExpanded ? '360px' : 'auto',
      maxHeight: 'calc(100vh - 100px)',
      background: 'var(--bg-primary)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>👥</span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            Học sinh ({stats.total})
          </span>
        </div>
        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <>
          {/* Statistics */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem'
          }}>
            <div style={{
              padding: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                {stats.focused}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Tập trung
              </div>
            </div>
            <div style={{
              padding: '0.5rem',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {stats.distracted}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Mất tập trung
              </div>
            </div>
            <div style={{
              padding: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
                {stats.sleeping}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Buồn ngủ
              </div>
            </div>
          </div>

          {/* Student List */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {uniqueStudents.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
              }}>
                <p>Chưa có học sinh nào</p>
                <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>👥</p>
              </div>
            ) : (
              uniqueStudents.map((student) => (
                <div
                  key={student.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    margin: '0.25rem 0',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: `2px solid ${student.color}40`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${student.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {student.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.125rem'
                    }}>
                      {student.userName}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: student.color,
                      fontWeight: 500
                    }}>
                      {student.label}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-muted)'
                  }}>
                    {new Date(student.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Activity */}
          {behaviors.length > 0 && (
            <div style={{
              borderTop: '1px solid var(--border-color)',
              padding: '0.75rem 1rem',
              background: 'var(--bg-secondary)'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '0.5rem'
              }}>
                Hoạt động gần đây
              </div>
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                {behaviors.slice(0, 10).map((b, i) => (
                  <div key={i} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ marginRight: '0.25rem' }}>{b.emoji}</span>
                    <span style={{ fontWeight: 500 }}>{b.userName}</span>
                    <span style={{ color: 'var(--text-muted)' }}> - {b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
