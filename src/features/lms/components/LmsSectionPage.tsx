'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../shared/components/DashboardLayout'
import { useAuth } from '../../../shared/contexts/AuthContext'
import LmsWorkspace from './LmsWorkspace'

type LmsSection = 'classes' | 'lessons' | 'assignments' | 'grading' | 'submissions'

interface Props {
    section: LmsSection
    classId?: string
}

export default function LmsSectionPage({ section, classId }: Props) {
    const router = useRouter()
    const { user } = useAuth()

    useEffect(() => {
        if (!user) {
            router.push('/auth')
            return
        }

        if (section === 'submissions' && user.role !== 'teacher') {
            router.push('/lms/grading')
        }
    }, [section, user, router])

    if (!user) {
        return null
    }

    return (
        <DashboardLayout>
            <LmsWorkspace user={user} section={section} classId={classId} />
        </DashboardLayout>
    )
}
