'use client'

import { VideoTrack } from '@livekit/components-react'
import { Track } from 'livekit-client'
import styles from './MeetingRoom.module.css'

interface Props {
    screenTracks: Array<{
        participant: { sid: string; name?: string; identity: string }
        source: Track.Source
        publication?: unknown
        track?: unknown
        trackRef: any
    }>
}

export default function ScreenShareView({ screenTracks }: Props) {
    if (screenTracks.length === 0) return null

    const activeTrack = screenTracks[0]

    return (
        <div className={styles.screenShare}>
            <VideoTrack trackRef={activeTrack} className={styles.screenShareVideo} />
            <div className={styles.screenShareLabel}>
                <span>🖥️</span>
                <span>{activeTrack.participant.name || activeTrack.participant.identity} đang chia sẻ</span>
            </div>
        </div>
    )
}
