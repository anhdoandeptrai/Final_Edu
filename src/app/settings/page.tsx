'use client'

import { useState } from 'react'
import DashboardLayout from '../../shared/components/DashboardLayout'

export default function SettingsPage() {
    const [aiEnabled, setAiEnabled] = useState(true)
    const [autoRecord, setAutoRecord] = useState(false)

    return (
        <DashboardLayout>
            <div className="container" style={{ maxWidth: '600px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="title" style={{ fontSize: '1.75rem', textAlign: 'left', marginBottom: '0.5rem' }}>
                        ⚙️ Cài đặt
                    </h1>
                    <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                        Tùy chỉnh trải nghiệm của bạn
                    </p>
                </div>

                {/* AI Settings */}
                <div className="card animate-fadeIn">
                    <h2 className="section-title">🤖 Cài đặt AI</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <div>
                                <span style={{ fontWeight: 500 }}>Phát hiện hành vi tự động</span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    AI sẽ tự động phát hiện hành vi khi bật camera
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={aiEnabled}
                                onChange={(e) => setAiEnabled(e.target.checked)}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                            />
                        </label>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <div>
                                <span style={{ fontWeight: 500 }}>Lưu lịch sử tự động</span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    Tự động lưu lịch sử hành vi vào bộ nhớ
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={autoRecord}
                                onChange={(e) => setAutoRecord(e.target.checked)}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                            />
                        </label>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <h2 className="section-title">🎨 Giao diện</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Đang sử dụng giao diện sáng (Light theme)
                    </p>
                </div>

                {/* About */}
                <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <h2 className="section-title">ℹ️ Thông tin</h2>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <p><strong>Edu Insight Meet</strong></p>
                        <p style={{ marginTop: '0.5rem' }}>Phiên bản: 1.0.0</p>
                        <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                            Ứng dụng họp video với AI phát hiện hành vi học tập
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
