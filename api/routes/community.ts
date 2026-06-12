import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/community/posts - List community posts
 */
router.get('/posts', (req: Request, res: Response): void => {
  const posts = db.prepare(`
    SELECT p.*, u.nickname, u.avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `).all() as any[]

  // Get comment counts
  const postsWithComments = posts.map((post: any) => {
    const commentCount = (db.prepare(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = ?'
    ).get(post.id) as any).count
    return {
      ...post,
      comment_count: commentCount,
    }
  })

  res.json({ success: true, data: postsWithComments })
})

/**
 * POST /api/community/posts - Create a post
 */
router.post('/posts', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.userId!
  const { content } = req.body

  if (!content || content.trim() === '') {
    res.status(400).json({ success: false, error: '内容不能为空' })
    return
  }

  const result = db.prepare(
    'INSERT INTO posts (user_id, content) VALUES (?, ?)'
  ).run(userId, content.trim())

  const post = db.prepare(`
    SELECT p.*, u.nickname, u.avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(Number(result.lastInsertRowid))

  // Check for social achievement
  const postCount = (db.prepare(
    'SELECT COUNT(*) as count FROM posts WHERE user_id = ?'
  ).get(userId) as any).count

  let newAchievement = null
  if (postCount === 1) {
    const alreadyUnlocked = db.prepare(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).get(userId, 8)
    if (!alreadyUnlocked) {
      db.prepare(
        'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)'
      ).run(userId, 8)
      newAchievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(8)
    }
  }

  res.json({
    success: true,
    data: {
      post,
      new_achievement: newAchievement,
    },
  })
})

/**
 * GET /api/community/achievements - List all achievements with user unlock status
 */
router.get('/achievements', (req: Request, res: Response): void => {
  const userId = (req as any).userId || 1

  const achievements = db.prepare(`
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    ORDER BY a.category, a.id
  `).all(userId) as any[]

  res.json({ success: true, data: achievements })
})

export default router
