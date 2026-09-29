import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export function generateZoomSignature(meetingNumber: string, role: string): string {
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Zoom credentials are not configured')
  }

  const iat = Math.floor(Date.now() / 1000) - 30
  const exp = iat + 60 * 60 * 2
  const payload = { appKey: clientId, mn: meetingNumber, role, iat, exp, tokenExp: exp }

  return jwt.sign(payload, clientSecret, { algorithm: 'HS256' })
}