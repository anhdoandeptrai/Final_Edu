import LmsSectionPage from '../../../../features/lms/components/LmsSectionPage'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ClassDetailPage({ params }: PageProps) {
    const { id } = await params
    return <LmsSectionPage section="classes" classId={id} />
}
