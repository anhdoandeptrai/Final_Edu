import { NextRequest, NextResponse } from 'next/server'
import { createClass, listClassesForUser } from '../../../../features/lms/server/store'
import { getAuthUserFromRequest } from '../../../../features/auth/server/session'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)

  // For local development convenience: allow providing userId & role as
  // query parameters when no session cookie is present. This makes it
  // easier to preview the UI without a browser session cookie.
  if (!user) {
    const userId = req.nextUrl.searchParams.get('userId') || undefined
    const role = (req.nextUrl.searchParams.get('role') as any) || undefined

    if (!userId || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If caller supplied an email as the userId (convenience), resolve it.
    let resolvedUserId = userId
    if (userId.includes('@')) {
      const found = await prisma.appUser.findUnique({ where: { email: userId } })
      if (!found) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      resolvedUserId = found.id
    }

    const classes = await listClassesForUser(resolvedUserId, role)
    return NextResponse.json({ classes })
  }

  const classes = await listClassesForUser(user.id, user.role)
  return NextResponse.json({ classes })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const name = String(body?.name || '').trim()
  const description = String(body?.description || '').trim()

  if (!name) {
    return NextResponse.json({ error: 'Missing required class fields' }, { status: 400 })
  }

  const created = await createClass({
    name,
    description,
    teacherId: user.id,
    teacherName: user.name,
  })
  return NextResponse.json({ class: created })
}
