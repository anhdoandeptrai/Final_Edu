import { NextResponse } from 'next/server'
import { getMissingRequiredEnvVars } from '../../../lib/env'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  const missingEnv = getMissingRequiredEnvVars()

  if (missingEnv.server.length > 0 || missingEnv.public.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        service: 'backend',
        database: 'unknown',
        env: {
          configured: false,
          missingServer: missingEnv.server,
          missingPublic: missingEnv.public,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      ok: true,
      service: 'backend',
      database: 'connected',
      env: {
        configured: true,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'

    return NextResponse.json(
      {
        ok: false,
        service: 'backend',
        database: 'disconnected',
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
