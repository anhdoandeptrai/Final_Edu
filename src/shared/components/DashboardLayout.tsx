'use client'

import Sidebar from './Sidebar'

interface Props {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    )
}
