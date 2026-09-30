import { randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'

interface ZoomTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

interface CreateZoomMeetingBody {
  topic?: string
  startTime?: string
  duration?: number
}

interface ZoomMeetingResponse {
  id?: number | string
  join_url?: string
  password?: string
}

const pendingStates = new Map<string, number>()
let zoomTokens: ZoomTokenResponse | undefined

export const getZoomTokens = () => zoomTokens

export const startZoomAuthorization = (_request: Request, response: Response) => {
  const clientId = process.env.ZOOM_CLIENT_ID
  const redirectUri = process.env.ZOOM_CALLBACK_URL

  if (!clientId || !redirectUri) {
    response.status(500).send('Zoom OAuth is not configured on the backend')
    return
  }

  const now = Date.now()
  for (const [state, createdAt] of pendingStates) {
    if (now - createdAt > 10 * 60 * 1000) pendingStates.delete(state)
  }

  const state = randomBytes(24).toString('hex')
  pendingStates.set(state, now)

  const authorizationUrl = new URL('https://zoom.us/oauth/authorize')
  authorizationUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  }).toString()

  response.redirect(authorizationUrl.toString())
}

export const handleZoomCallback = async (request: Request, response: Response) => {
  const code = request.query.code
  const state = request.query.state
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET
  const redirectUri = process.env.ZOOM_CALLBACK_URL

  if (typeof code !== 'string' || typeof state !== 'string') {
    response.status(400).send('Zoom callback is missing its authorization code or state')
    return
  }

  if (!pendingStates.has(state)) {
    response.status(400).send('Zoom authorization state is invalid or expired')
    return
  }
  pendingStates.delete(state)

  if (!clientId || !clientSecret || !redirectUri) {
    response.status(500).send('Zoom OAuth is not configured on the backend')
    return
  }

  try {
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      response.status(502).send('Zoom rejected the authorization-code exchange')
      return
    }

    zoomTokens = await tokenResponse.json() as ZoomTokenResponse
    response.redirect(new URL('/video?zoom=connected', redirectUri).toString())
  } catch {
    response.status(502).send('Could not complete Zoom authorization')
  }
}

export const createZoomMeeting = async (
  request: Request<unknown, unknown, CreateZoomMeetingBody>,
  response: Response,
) => {
  const tokens = getZoomTokens()
  if (!tokens) {
    response.status(401).json({ error: 'Connect a Zoom account before creating a meeting' })
    return
  }

  const { topic, startTime, duration } = request.body
  const parsedStartTime = startTime ? new Date(startTime) : undefined
  if (
    !topic?.trim() ||
    !parsedStartTime ||
    Number.isNaN(parsedStartTime.getTime()) ||
    !Number.isInteger(duration) ||
    duration! < 1
  ) {
    response.status(400).json({ error: 'A topic, valid start time, and positive duration are required' })
    return
  }

  try {
    const zoomResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic.trim(),
        type: 2,
        start_time: parsedStartTime.toISOString(),
        duration,
      }),
    })
    const meeting = await zoomResponse.json() as ZoomMeetingResponse

    if (!zoomResponse.ok) {
      response.status(zoomResponse.status).json({ error: 'Zoom could not create the meeting', details: meeting })
      return
    }

    if (!meeting.join_url) {
      response.status(502).json({ error: 'Zoom created no join link for the meeting' })
      return
    }

    response.status(201).json({
      meetingId: meeting.id,
      joinUrl: meeting.join_url,
      password: meeting.password,
    })
  } catch {
    response.status(502).json({ error: 'Could not reach Zoom to create the meeting' })
  }
}