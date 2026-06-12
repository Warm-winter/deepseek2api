import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../database.js'
import { JWT_SECRET, authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * POST /api/auth/register - Register with email, password, nickname
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, nickname } = req.body

  if (!email || !password || !nickname) {
    res.status(400).json({ success: false, error: '请提供邮箱、密码和昵称' })
    return
  }

  // Check if email already exists
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (existing) {
    res.status(409).json({ success: false, error: '该邮箱已被注册' })
    return
  }

  const passwordHash = bcrypt.hashSync(password, 10)

  const result = db.prepare(
    'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)'
  ).run(email, passwordHash, nickname)

  const userId = Number(result.lastInsertRowid)

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

  const user = db.prepare('SELECT id, email, nickname, avatar, level, xp, streak, longest_streak, created_at FROM users WHERE id = ?').get(userId)

  res.status(201).json({
    success: true,
    data: {
      token,
      user,
    },
  })
})

/**
 * POST /api/auth/login - Login and return JWT token
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ success: false, error: '请提供邮箱和密码' })
    return
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
  if (!user) {
    res.status(401).json({ success: false, error: '邮箱或密码错误' })
    return
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash)
  if (!validPassword) {
    res.status(401).json({ success: false, error: '邮箱或密码错误' })
    return
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        longest_streak: user.longest_streak,
      },
    },
  })
})

/**
 * GET /api/auth/me - Get current user info (requires auth)
 */
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!

  const user = db.prepare('SELECT id, email, nickname, avatar, level, xp, streak, longest_streak, created_at FROM users WHERE id = ?').get(userId)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }

  res.json({ success: true, data: user })
})

export default router
