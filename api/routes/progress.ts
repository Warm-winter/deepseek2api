import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/progress - Get user progress (requires auth)
 */
router.get('/progress', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.userId!

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }

  // Get enrolled courses with progress
  const enrolledCourses = db.prepare(`
    SELECT uc.*, c.title, c.language, c.level, c.total_lessons, c.cover_image
    FROM user_courses uc
    JOIN courses c ON uc.course_id = c.id
    WHERE uc.user_id = ?
    ORDER BY uc.enrolled_at DESC
  `).all(userId) as any[]

  // Get completed lessons count
  const completedLessons = (db.prepare(
    'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = TRUE'
  ).get(userId) as any).count

  // Get total time spent
  const totalTime = (db.prepare(
    'SELECT COALESCE(SUM(time_spent), 0) as total FROM user_progress WHERE user_id = ?'
  ).get(userId) as any).total

  // Get achievements
  const achievements = db.prepare(`
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    ORDER BY a.category, a.id
  `).all(userId) as any[]

  // Get recent activity
  const recentActivity = db.prepare(`
    SELECT up.*, l.title as lesson_title, l.type as lesson_type
    FROM user_progress up
    JOIN lessons l ON up.lesson_id = l.id
    WHERE up.user_id = ? AND up.completed = TRUE
    ORDER BY up.completed_at DESC
    LIMIT 10
  `).all(userId) as any[]

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        longest_streak: user.longest_streak,
      },
      enrolled_courses: enrolledCourses,
      completed_lessons: completedLessons,
      total_time_spent: totalTime,
      achievements,
      recent_activity: recentActivity,
    },
  })
})

/**
 * GET /api/recommendations - Get personalized learning path recommendations
 */
router.get('/recommendations', (req: Request, res: Response): void => {
  const userId = (req as any).userId || 1

  // Get user's enrolled courses
  const enrolledCourseIds = db.prepare(
    'SELECT course_id FROM user_courses WHERE user_id = ?'
  ).all(userId).map((row: any) => row.course_id)

  // Get user's completed lesson types
  const completedByType = db.prepare(`
    SELECT l.type, COUNT(*) as count FROM user_progress up
    JOIN lessons l ON up.lesson_id = l.id
    WHERE up.user_id = ? AND up.completed = TRUE
    GROUP BY l.type
  `).all(userId) as any[]

  const typeCountMap: Record<string, number> = {}
  for (const row of completedByType) {
    typeCountMap[row.type] = row.count
  }

  // Find weakest skill type
  const skillTypes = ['vocabulary', 'grammar', 'speaking', 'listening']
  const weakestType = skillTypes.reduce((weakest, type) => {
    if ((typeCountMap[type] || 0) < (typeCountMap[weakest] || 0)) {
      return type
    }
    return weakest
  }, skillTypes[0])

  // Recommend courses not yet enrolled
  let recommendCourses: any[]
  if (enrolledCourseIds.length > 0) {
    recommendCourses = db.prepare(
      'SELECT * FROM courses WHERE id NOT IN (' + enrolledCourseIds.join(',') + ') ORDER BY level LIMIT 3'
    ).all() as any[]
  } else {
    recommendCourses = db.prepare(
      'SELECT * FROM courses ORDER BY level LIMIT 3'
    ).all() as any[]
  }

  // Find next incomplete lesson in enrolled courses
  const nextLessons: any[] = []
  for (const courseId of enrolledCourseIds) {
    const nextLesson = db.prepare(`
      SELECT l.*, c.title as chapter_title, co.title as course_title
      FROM lessons l
      JOIN chapters c ON l.chapter_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.course_id = ? AND l.id NOT IN (
        SELECT lesson_id FROM user_progress WHERE user_id = ? AND completed = TRUE
      )
      ORDER BY c.order_num, l.order_num
      LIMIT 1
    `).get(courseId, userId) as any
    if (nextLesson) {
      nextLessons.push(nextLesson)
    }
  }

  // Find lessons of weakest type
  const weakTypeLessons = db.prepare(`
    SELECT l.*, c.title as chapter_title, co.title as course_title
    FROM lessons l
    JOIN chapters c ON l.chapter_id = c.id
    JOIN courses co ON c.course_id = co.id
    WHERE l.type = ? AND l.id NOT IN (
      SELECT lesson_id FROM user_progress WHERE user_id = ? AND completed = TRUE
    )
    ORDER BY co.level, c.order_num, l.order_num
    LIMIT 3
  `).all(weakestType, userId) as any[]

  res.json({
    success: true,
    data: {
      recommended_courses: recommendCourses,
      next_lessons: nextLessons,
      weakest_skill: weakestType,
      weak_skill_lessons: weakTypeLessons,
    },
  })
})

export default router
