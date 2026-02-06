'use client'

import { useState, useEffect } from 'react'

export interface BehaviorHistoryEntry {
    id: string
    timestamp: Date
    label: string
    emoji: string
    type: 'positive' | 'negative' | 'neutral' | 'warning'
}

// Global history storage (can be replaced with proper state management)
let historyEntries: BehaviorHistoryEntry[] = []
let historyListeners: (() => void)[] = []

export function addBehaviorEntry(entry: Omit<BehaviorHistoryEntry, 'id' | 'timestamp'>) {
    const newEntry: BehaviorHistoryEntry = {
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date()
    }

    // Avoid duplicate consecutive entries
    const lastEntry = historyEntries[historyEntries.length - 1]
    if (lastEntry && lastEntry.label === entry.label) {
        return
    }

    historyEntries = [...historyEntries.slice(-49), newEntry]
    historyListeners.forEach(listener => listener())
}

export function clearHistory() {
    historyEntries = []
    historyListeners.forEach(listener => listener())
}

export function getHistory() {
    return historyEntries
}

interface Props {
    maxEntries?: number
    showClearButton?: boolean
}

export default function BehaviorHistoryPanel({ maxEntries = 10, showClearButton = true }: Props) {
    const [entries, setEntries] = useState<BehaviorHistoryEntry[]>([])
    const [isExpanded, setIsExpanded] = useState(true)

    useEffect(() => {
        const updateEntries = () => {
            setEntries([...historyEntries].reverse().slice(0, maxEntries))
        }

        updateEntries()
        historyListeners.push(updateEntries)

        return () => {
            historyListeners = historyListeners.filter(l => l !== updateEntries)
        }
    }, [maxEntries])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return (
        <div className="history-panel">
            <div className="history-panel-header">
                <h3 className="history-panel-title">
                    <span>📊</span>
                    <span>Lịch sử Hành vi</span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {showClearButton && entries.length > 0 && (
                        <button
                            onClick={clearHistory}
                            style={{
                                background: 'none',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            Xóa
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            background: 'none',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        {isExpanded ? '▲' : '▼'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <>
                    {entries.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            color: 'var(--text-muted)'
                        }}>
                            <span style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>📝</span>
                            <p style={{ fontSize: '0.875rem' }}>Chưa có dữ liệu hành vi</p>
                            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Bật AI để bắt đầu phát hiện</p>
                        </div>
                    ) : (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>Thời gian</th>
                                    <th>Hành vi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                            {formatTime(entry.timestamp)}
                                        </td>
                                        <td>
                                            <span className={`history-badge ${entry.type}`}>
                                                <span>{entry.emoji}</span>
                                                <span>{entry.label}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    )
}
