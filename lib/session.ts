import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from './prisma'

const COOKIE_NAME = 'tcb_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days
const MIN_SECRET_LENGTH = 32

function getSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET (or SESSION_SECRET) must be set')
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET (or SESSION_SECRET) must be at least ${MIN_SECRET_LENGTH} characters long`
    )
  }
  return secret
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

function encode(userId: string): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = `${userId}.${expires}`
  return `${payload}.${sign(payload)}`
}

function decode(token: string): { userId: string } | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, expiresStr, sig] = parts
  const payload = `${userId}.${expiresStr}`
  const expected = sign(payload)
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || expires < Date.now()) return null
  return { userId }
}

export function createSession(userId: string) {
  cookies().set(COOKIE_NAME, encode(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export function clearSession() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export function getSessionUserId(): string | null {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null
  return decode(token)?.userId ?? null
}

export async function getSessionUser() {
  const userId = getSessionUserId()
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId } })
}
