'use client'

import { ReactNode, useMemo, useState, type CSSProperties } from 'react'
import useBreakpoints from '../../hooks/useBreakpoints'
import styles from './MeetingRoom.module.css'

export interface SidebarSection {
    id: string
    title: string
    icon: string
    content: ReactNode
    defaultOpen?: boolean
}

interface Props {
    sections: SidebarSection[]
}

export default function RightSidebar({ sections }: Props) {
    const { isMobile } = useBreakpoints()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isWide, setIsWide] = useState(false)

    const initialState = useMemo(() => {
        return sections.reduce<Record<string, boolean>>((acc, section) => {
            acc[section.id] = section.defaultOpen ?? true
            return acc
        }, {})
    }, [sections])

    const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialState)

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const toggleSidebar = () => {
        if (isMobile) {
            setIsSheetOpen(prev => !prev)
            return
        }
        setIsCollapsed(prev => !prev)
    }

    if (isMobile) {
        return (
            <>
                <button
                    type="button"
                    className={styles.sidebarFloatingToggle}
                    onClick={() => setIsSheetOpen(true)}
                    aria-label="Open sidebar"
                >
                    ☰
                </button>
                {isSheetOpen && (
                    <div className={styles.mobileSheet}>
                        <div className={styles.mobileSheetHandle} />
                        <div className={styles.sidebarHeaderControls}>
                            <button className={styles.controlButton} onClick={() => setIsSheetOpen(false)}>
                                ✕
                            </button>
                        </div>
                        {sections.map(section => (
                            <div key={section.id} className={styles.sidebarPanel}>
                                <div className={styles.sidebarPanelHeader}>
                                    <div className={styles.panelSectionTitle}>
                                        <span>{section.icon}</span>
                                        <span>{section.title}</span>
                                    </div>
                                    <button
                                        className={styles.controlButton}
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        {openSections[section.id] ? '▾' : '▸'}
                                    </button>
                                </div>
                                <div
                                    className={`${styles.sidebarPanelBody} ${openSections[section.id] ? '' : styles.sidebarPanelCollapsed}`}
                                >
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )
    }

    const sidebarClass = isCollapsed
        ? `${styles.sidebarRoot} ${styles.sidebarCollapsed}`
        : styles.sidebarRoot

    const sidebarStyle: CSSProperties | undefined = isWide ? { width: '400px' } : undefined

    return (
        <div className={sidebarClass} style={sidebarStyle}>
            <div className={styles.sidebarHeaderControls}>
                <button className={styles.controlButton} onClick={toggleSidebar}>
                    {isCollapsed ? '»' : '«'}
                </button>
                {!isCollapsed && (
                    <button className={styles.controlButton} onClick={() => setIsWide(prev => !prev)}>
                        ↔
                    </button>
                )}
            </div>

            {!isCollapsed && sections.map(section => (
                <div key={section.id} className={styles.sidebarPanel}>
                    <div className={styles.sidebarPanelHeader}>
                        <div className={styles.panelSectionTitle}>
                            <span>{section.icon}</span>
                            <span>{section.title}</span>
                        </div>
                        <button
                            className={styles.controlButton}
                            onClick={() => toggleSection(section.id)}
                        >
                            {openSections[section.id] ? '▾' : '▸'}
                        </button>
                    </div>
                    <div
                        className={`${styles.sidebarPanelBody} ${openSections[section.id] ? '' : styles.sidebarPanelCollapsed}`}
                    >
                        {section.content}
                    </div>
                </div>
            ))}
        </div>
    )
}
