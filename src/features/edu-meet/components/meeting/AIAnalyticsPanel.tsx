'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import styles from './MeetingRoom.module.css'
import { getStudentBehaviors, subscribeToStudentBehaviors, StudentBehavior } from '../StudentsBehaviorPanel'

export interface CameraWarning {
    id: string
    name: string
    timestamp: number
    status: string
}

interface Props {
    isTeacher: boolean
    cameraWarnings: CameraWarning[]
}

function AIAnalyticsPanel({ isTeacher, cameraWarnings }: Props) {
    const [behaviors, setBehaviors] = useState<StudentBehavior[]>([])

    useEffect(() => {
        setBehaviors([...getStudentBehaviors()])
        const unsubscribe = subscribeToStudentBehaviors(() => {
            setBehaviors([...getStudentBehaviors()])
        })
        return unsubscribe
    }, [])

    const stats = useMemo(() => {
        const latestByUser = new Map<string, StudentBehavior>()
        behaviors.forEach((behavior) => {
            if (!latestByUser.has(behavior.userId)) {
                latestByUser.set(behavior.userId, behavior)
            }
        })

        const users = Array.from(latestByUser.values())
        return {
            total: users.length,
            focused: users.filter((s) => ['Tập trung', 'Đang lắng nghe', 'Giơ tay', 'Gật đầu'].includes(s.label)).length,
            distracted: users.filter((s) => ['Mất tập trung', 'Cúi đầu', 'Nghiêng đầu', 'Lắc đầu'].includes(s.label)).length,
            sleeping: users.filter((s) => ['Đang ngủ', 'Buồn ngủ'].includes(s.label)).length,
        }
    }, [behaviors])

    if (!isTeacher) {
        return (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Phân tích AI chỉ dành cho giáo viên.
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{stats.focused}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tập trung</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{stats.distracted}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mất tập trung</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444' }}>{stats.sleeping}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Buồn ngủ</div>
                </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Tổng số học sinh đang theo dõi: {stats.total}
            </div>

            {cameraWarnings.length > 0 && (
                <div className={styles.warningPanel}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c' }}>
                        Cảnh báo tắt camera
                    </div>
                    {cameraWarnings.slice(0, 6).map((warning) => (
                        <div key={warning.id} className={styles.warningItem}>
                            <div style={{ fontWeight: 600 }}>{warning.name}</div>
                            <div style={{ fontSize: '11px' }}>
                                {new Date(warning.timestamp).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })} - {warning.status}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default memo(AIAnalyticsPanel)
