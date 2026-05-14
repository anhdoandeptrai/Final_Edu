'use client'

import { ReactNode } from 'react'
import styles from './MeetingRoom.module.css'

interface Props {
    header: ReactNode
    sidebar: ReactNode
    footer: ReactNode
    children: ReactNode
}

export default function MeetingLayout({ header, sidebar, footer, children }: Props) {
    return (
        <div className={styles.meetingRoot}>
            <div className={styles.meetingHeader}>{header}</div>
            <div className={styles.meetingContent}>
                <div className={styles.stageArea}>{children}</div>
                {sidebar}
            </div>
            <div className={styles.controlBar}>{footer}</div>
        </div>
    )
}
