import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName } = await req.json()

    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error('Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

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
  } catch (error: any) {
    console.error('[TOKEN ERROR]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
