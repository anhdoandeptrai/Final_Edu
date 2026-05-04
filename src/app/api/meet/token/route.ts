import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'
import { requireServerEnvVar } from '../../../../lib/env'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const roomName = String(body?.roomName || '').trim()
    const participantName = String(body?.participantName || '').trim()

    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 })
    }

    if (roomName.length > 120 || participantName.length > 120) {
      return NextResponse.json({ error: 'roomName or participantName is too long' }, { status: 400 })
    }

    const apiKey = requireServerEnvVar('LIVEKIT_API_KEY')
    const apiSecret = requireServerEnvVar('LIVEKIT_API_SECRET')

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
      ttl: '2h',
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    console.log(`[TOKEN] Generated for ${participantName} in room ${roomName}`)

    return NextResponse.json({ token })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[TOKEN ERROR]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
