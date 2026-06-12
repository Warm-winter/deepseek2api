import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/lessons/:id/content - Get lesson content based on type
 */
router.get('/:id/content', (req: Request, res: Response): void => {
  const lessonId = Number(req.params.id)

  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId) as any
  if (!lesson) {
    res.status(404).json({ success: false, error: '课程内容不存在' })
    return
  }

  let content
  try {
    content = JSON.parse(lesson.content)
  } catch {
    content = lesson.content
  }

  res.json({
    success: true,
    data: {
      id: lesson.id,
      chapter_id: lesson.chapter_id,
      title: lesson.title,
      type: lesson.type,
      order_num: lesson.order_num,
      content,
    },
  })
})

/**
 * POST /api/lessons/:id/complete - Mark lesson as completed, return XP and achievements
 */
router.post('/:id/complete', authMiddleware, (req: Request, res: Response): void => {
  const lessonId = Number(req.params.id)
  const userId = req.userId!
  const { score = 0, time_spent = 0 } = req.body

  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId) as any
  if (!lesson) {
    res.status(404).json({ success: false, error: '课程内容不存在' })
    return
  }

  // Upsert progress
  const existing = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(userId, lessonId) as any

  if (existing) {
    db.prepare(
      'UPDATE user_progress SET score = ?, time_spent = ?, completed = TRUE, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND lesson_id = ?'
    ).run(score, time_spent, userId, lessonId)
  } else {
    db.prepare(
      'INSERT INTO user_progress (user_id, lesson_id, score, time_spent, completed, completed_at) VALUES (?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)'
    ).run(userId, lessonId, score, time_spent)
  }

  // Calculate XP
  const xpMap: Record<string, number> = {
    vocabulary: 10,
    grammar: 15,
    speaking: 20,
    listening: 15,
  }
  const xpEarned = xpMap[lesson.type] || 10

  // Update user XP
  db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpEarned, userId)

  // Check for achievements
  const newAchievements: any[] = []

  // Get total completed lessons count
  const completedCount = (db.prepare(
    'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = TRUE'
  ).get(userId, lessonId) as any).count

  // Get completed lessons by type
  const completedByType = (db.prepare(
    `SELECT l.type, COUNT(*) as count FROM user_progress up
     JOIN lessons l ON up.lesson_id = l.id
     WHERE up.user_id = ? AND up.completed = TRUE
     GROUP BY l.type`
  ).all(userId) as any[])

  const typeCountMap: Record<string, number> = {}
  for (const row of completedByType) {
    typeCountMap[row.type] = row.count
  }

  // Achievement checks
  const achievementChecks = [
    { id: 1, name: '初出茅庐', condition: completedCount >= 1 },
    { id: 3, name: '学海无涯', condition: completedCount >= 10 },
    { id: 4, name: '单词达人', condition: (typeCountMap['vocabulary'] || 0) >= 5 },
    { id: 5, name: '语法高手', condition: (typeCountMap['grammar'] || 0) >= 5 },
    { id: 6, name: '口语新秀', condition: (typeCountMap['speaking'] || 0) >= 3 },
    { id: 7, name: '听力精英', condition: (typeCountMap['listening'] || 0) >= 3 },
  ]

  for (const check of achievementChecks) {
    if (check.condition) {
      const alreadyUnlocked = db.prepare(
        'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
      ).get(userId, check.id)
      if (!alreadyUnlocked) {
        db.prepare(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)'
        ).run(userId, check.id)
        const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(check.id) as any
        newAchievements.push(achievement)
      }
    }
  }

  // Get updated user info
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any

  res.json({
    success: true,
    data: {
      xp_earned: xpEarned,
      total_xp: user.xp,
      level: user.level,
      new_achievements: newAchievements,
    },
  })
})

export default router
