'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../shared/components/DashboardLayout'
import { useAuth } from '../../shared/contexts/AuthContext'
import LmsWorkspace from '../../features/lms/components/LmsWorkspace'

export default function LmsPage() {
    const router = useRouter()
    const { user } = useAuth()

    useEffect(() => {
        if (!user) {
            router.push('/auth')
        }
    }, [user, router])

    if (!user) {
        return null
    }

    return (
        <DashboardLayout>
            <LmsWorkspace user={user} />
        </DashboardLayout>
    )
}
