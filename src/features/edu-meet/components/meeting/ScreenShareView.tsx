'use client'

import { VideoTrack, type TrackReference } from '@livekit/components-react'
import styles from './MeetingRoom.module.css'

interface Props {
    screenTracks: TrackReference[]
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
