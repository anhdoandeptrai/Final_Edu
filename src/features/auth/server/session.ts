import { randomBytes } from 'crypto'
import { compare, hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export type AuthRole = 'teacher' | 'student'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole
}

const SESSION_COOKIE = 'edu_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function mapUser(user: { id: string; name: string; email: string; role: AuthRole }): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

export async function hashPassword(rawPassword: string): Promise<string> {
  return hash(rawPassword, 12)
}

export async function verifyPassword(rawPassword: string, passwordHash: string): Promise<boolean> {
  return compare(rawPassword, passwordHash)
}

function createSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(userId: string): Promise<string> {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  await prisma.authSession.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export async function getAuthUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return null
  }

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.authSession.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  return mapUser(session.user)
}

export async function deleteSessionFromRequest(req: NextRequest): Promise<void> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return
  }

  await prisma.authSession.deleteMany({ where: { token } })
}
