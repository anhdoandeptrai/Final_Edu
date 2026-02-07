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
  const [selectedStudent, setSelectedStudent] = useState<StudentBehavior | null>(null)

  useEffect(() => {
    setBehaviors([...getStudentBehaviors()])
    
    const unsubscribe = subscribeToStudentBehaviors(() => {
      setBehaviors([...getStudentBehaviors()])
    })
    return unsubscribe
  }, [])

  // Get unique students from behaviors with their latest status
  const studentsMap = new Map<string, StudentBehavior>()
  
  // Iterate through behaviors from most recent to oldest
  // Only keep the first (most recent) behavior for each student
  behaviors.forEach(behavior => {
    if (!studentsMap.has(behavior.userId)) {
      studentsMap.set(behavior.userId, behavior)
    }
  })

  const allStudents = Array.from(studentsMap.values())
  console.log('[StudentsBehaviorPanel] Số học sinh:', allStudents.length)
  console.log('[StudentsBehaviorPanel] Behaviors:', behaviors.length)

  // Calculate statistics based on latest behavior for each student
  const stats = {
    focused: allStudents.filter(s => 
      s.label === 'Tập trung' || 
      s.label === 'Đang lắng nghe' || 
      s.label === 'Giơ tay' ||
      s.label === 'Gật đầu'
    ).length,
    distracted: allStudents.filter(s => 
      s.label === 'Mất tập trung' || 
      s.label === 'Cúi đầu' ||
      s.label === 'Nghiêng đầu' ||
      s.label === 'Lắc đầu'
    ).length,
    sleeping: allStudents.filter(s => s.label === 'Đang ngủ' || s.label === 'Buồn ngủ').length,
    total: allStudents.length
  }

  console.log('[StudentsBehaviorPanel] Stats:', stats)

  // Get student history for detail view
  const getStudentHistory = (userId: string) => {
    return behaviors.filter(b => b.userId === userId).reverse().slice(0, 20)
  }

  // Get student stats
  const getStudentStats = (userId: string) => {
    const history = behaviors.filter(b => b.userId === userId)
    const total = history.length
    const focused = history.filter(h => 
      h.label === 'Tập trung' || 
      h.label === 'Đang lắng nghe' || 
      h.label === 'Giơ tay' ||
      h.label === 'Gật đầu'
    ).length
    const distracted = history.filter(h => 
      h.label === 'Mất tập trung' || 
      h.label === 'Cúi đầu' ||
      h.label === 'Nghiêng đầu' ||
      h.label === 'Lắc đầu'
    ).length
    const sleeping = history.filter(h => h.label === 'Đang ngủ' || h.label === 'Buồn ngủ').length

    return {
      total,
      focusedPercent: total > 0 ? Math.round((focused / total) * 100) : 0,
      distractedPercent: total > 0 ? Math.round((distracted / total) * 100) : 0,
      sleepingPercent: total > 0 ? Math.round((sleeping / total) * 100) : 0
    }
  }

  // Get first letter for avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 70,
      right: 16,
      zIndex: 1000,
      width: isExpanded ? (selectedStudent ? '420px' : '360px') : 'auto',
      maxHeight: 'calc(100vh - 100px)',
      background: 'var(--bg-primary)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div 
        style={{
          padding: '1rem',
          background: selectedStudent 
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {selectedStudent && (
            <button
              onClick={() => setSelectedStudent(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              ← Quay lại
            </button>
          )}
          <span style={{ fontSize: '1.25rem' }}>
            {selectedStudent ? '👤' : '👥'}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {selectedStudent ? selectedStudent.userName : `Học sinh (${stats.total})`}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s'
          }}
        >
          ▼
        </button>
      </div>

      {isExpanded && !selectedStudent && (
        <>
          {/* Overview Statistics */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem'
          }}>
            <div style={{
              padding: '0.75rem 0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {stats.focused}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Tập trung
              </div>
            </div>
            <div style={{
              padding: '0.75rem 0.5rem',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {stats.distracted}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Mất tập trung
              </div>
            </div>
            <div style={{
              padding: '0.75rem 0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                {stats.sleeping}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Buồn ngủ
              </div>
            </div>
          </div>

          {/* Student List */}
          <div style={{
            maxHeight: '450px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {allStudents.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
              }}>
                <p>Chưa có học sinh nào</p>
                <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>👥</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>AI sẽ tự động phát hiện khi học sinh bật camera</p>
              </div>
            ) : (
              allStudents.map((student) => (
                <div
                  key={student.userId}
                  onClick={() => setSelectedStudent(student)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    margin: '0.25rem 0',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: `2px solid ${student.color}40`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ':hover': {
                      transform: 'translateX(-4px)',
                      boxShadow: 'var(--shadow-md)'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-4px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Avatar with initials */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${student.color} 0%, ${student.color}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#fff',
                    position: 'relative'
                  }}>
                    {getInitials(student.userName)}
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      {student.emoji}
                    </div>
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-muted)'
                    }}>
                      {new Date(student.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      color: 'var(--accent-primary)',
                      fontWeight: 500
                    }}>
                      Chi tiết →
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {isExpanded && selectedStudent && (
        <>
          {/* Student Detail View */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {/* Student Avatar & Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${selectedStudent.color} 0%, ${selectedStudent.color}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#fff'
              }}>
                {getInitials(selectedStudent.userName)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {selectedStudent.userName}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{selectedStudent.emoji}</span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: selectedStudent.color,
                    fontWeight: 500
                  }}>
                    {selectedStudent.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Statistics */}
            {(() => {
              const studentStats = getStudentStats(selectedStudent.userId)
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      {studentStats.focusedPercent}%
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem'
                    }}>
                      Tập trung
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#fbbf24'
                    }}>
                      {studentStats.distractedPercent}%
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem'
                    }}>
                      Không tập trung
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#ef4444'
                    }}>
                      {studentStats.sleepingPercent}%
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem'
                    }}>
                      Buồn ngủ
                    </div>
                  </div>
                </div>
              )
            })()}

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              Tổng số lần phát hiện: {getStudentStats(selectedStudent.userId).total}
            </div>
          </div>

          {/* Student Behavior History */}
          <div style={{
            padding: '0.75rem 1rem',
            maxHeight: '350px',
            overflowY: 'auto'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '0.75rem'
            }}>
              📊 Lịch sử hành vi
            </div>
            {(() => {
              const history = getStudentHistory(selectedStudent.userId)
              return history.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 1rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>
                  <p>Chưa có lịch sử</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {history.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: `1px solid ${h.color}40`
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `${h.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                      }}>
                        {h.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: h.color
                        }}>
                          {h.label}
                        </div>
                        <div style={{
                          fontSize: '0.6875rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.125rem'
                        }}>
                          {new Date(h.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}
