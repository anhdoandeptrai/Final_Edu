'use client'

import { memo } from 'react'
import styles from './MeetingRoom.module.css'
import { ParticipantEntry } from './ParticipantGrid'

interface Props {
    participants: ParticipantEntry[]
    overflow: ParticipantEntry[]
}

function ParticipantSidebar({ participants, overflow }: Props) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className={styles.participantList}>
                {participants.map((entry) => {
                    const name = entry.participant.name || entry.participant.identity
                    return (
                        <div key={entry.participant.sid} className={styles.participantRow}>
                            <div style={{ fontSize: '18px' }}>{entry.hasVideo ? '🎥' : '🚫'}</div>
                            <div style={{ flex: 1 }}>
                                <div className={styles.participantRowName}>{name}</div>
                                <div className={styles.participantRowMeta}>
                                    {entry.hasVideo ? 'Camera đang bật' : 'Camera đang tắt'}
                                </div>
                            </div>
                            <span
                                className={styles.participantStatusBadge}
                                style={{
                                    background: entry.hasVideo ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                    color: entry.hasVideo ? '#10b981' : '#ef4444'
                                }}
                            >
                                {entry.isLocal ? 'Bạn' : entry.hasVideo ? 'Bật' : 'Tắt'}
                            </span>
                        </div>
                    )
                })}
            </div>

            {overflow.length > 0 && (
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Học viên khác
                    </div>
                    <div className={styles.participantOverflowGrid}>
                        {overflow.map((entry) => {
                            const name = entry.participant.name || entry.participant.identity
                            return (
                                <div key={entry.participant.sid} className={styles.overflowTile}>
                                    <div style={{ fontSize: '20px' }}>{entry.hasVideo ? '🎥' : '🚫'}</div>
                                    <div style={{ fontSize: '11px', textAlign: 'center' }}>{name}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default memo(ParticipantSidebar)
