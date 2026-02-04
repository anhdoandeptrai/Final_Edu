'use client'

import DashboardLayout from '../../components/DashboardLayout'
import BehaviorHistoryPanel from '../../components/BehaviorHistoryPanel'

export default function HistoryPage() {
    return (
        <DashboardLayout>
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="title" style={{ fontSize: '1.75rem', textAlign: 'left', marginBottom: '0.5rem' }}>
                        📊 Lịch sử & Phân tích
                    </h1>
                    <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                        Theo dõi lịch sử phát hiện hành vi trong các cuộc họp
                    </p>
                </div>

                {/* Behavior History Panel */}
                <BehaviorHistoryPanel maxEntries={50} showClearButton={true} />

                {/* Stats Overview */}
                <div className="card animate-fadeIn" style={{ marginTop: '1.5rem' }}>
                    <h2 className="section-title">📈 Tổng quan</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>0</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cuộc họp</div>
                        </div>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>0</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Hành vi tích cực</div>
                        </div>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>0</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cảnh báo</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
