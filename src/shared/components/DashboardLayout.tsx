'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

interface Props {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    return (
        <div className="dashboard-layout">
            <Sidebar
                isMobileOpen={mobileSidebarOpen}
                onOpenMobile={() => setMobileSidebarOpen(true)}
                onCloseMobile={() => setMobileSidebarOpen(false)}
            />
            {mobileSidebarOpen ? (
                <button
                    type="button"
                    className="sidebar-backdrop"
                    aria-label="Close navigation menu"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            ) : null}
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    )
}
