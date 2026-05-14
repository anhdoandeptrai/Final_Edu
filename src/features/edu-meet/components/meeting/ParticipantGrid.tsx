'use client'

import { VideoTrack } from '@livekit/components-react'
import type { CSSProperties } from 'react'
import styles from './MeetingRoom.module.css'

export interface ParticipantEntry {
    participant: {
        sid: string
        identity: string
        name?: string
    }
    track?: any
    hasVideo: boolean
    isLocal: boolean
}

interface Props {
    participants: ParticipantEntry[]
    hasScreenShare: boolean
}

function getInitials(name: string) {
    return (name || 'U').charAt(0).toUpperCase()
}

function getAvatarColor(name: string) {
    const colors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#06b6d4', '#6366f1', '#22c55e'
    ]
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
}

export default function ParticipantGrid({ participants, hasScreenShare }: Props) {
    const gridStyle: CSSProperties = {
        ['--tile-min-width' as string]: hasScreenShare ? '170px' : '220px'
    }

    return (
        <div className={styles.participantGrid} style={gridStyle}>
            {participants.map((entry) => {
                const displayName = entry.participant.name || entry.participant.identity
                const tileClass = entry.isLocal
                    ? `${styles.participantTile} ${styles.participantTileLocal}`
                    : styles.participantTile

                return (
                    <div
                        key={entry.participant.sid}
                        data-lk-participant-sid={entry.participant.sid}
                        data-lk-participant-identity={entry.participant.identity}
                        className={tileClass}
                    >
                        {entry.hasVideo && entry.track ? (
                            <VideoTrack
                                trackRef={entry.track}
                                className={styles.participantVideo}
                                style={{ transform: entry.isLocal ? 'scaleX(-1)' : 'none' }}
                            />
                        ) : (
                            <div className={styles.participantPlaceholder}>
                                <div
                                    className={styles.avatarCircle}
                                    style={{ background: `linear-gradient(135deg, ${getAvatarColor(displayName)} 0%, ${getAvatarColor(displayName)}cc 100%)` }}
                                >
                                    {getInitials(displayName)}
                                </div>
                                <div style={{ fontWeight: 600 }}>{displayName}</div>
                                <div style={{ fontSize: '12px', color: '#cbd5f5' }}>Camera đang tắt</div>
                            </div>
                        )}

                        <div className={styles.tileNameBadge}>
                            <span>{displayName}</span>
                            {entry.isLocal && <span className={styles.tileLocalBadge}>Bạn</span>}
                        </div>

                        {entry.hasVideo && (
                            <div className={styles.tileStatus}>HD</div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
