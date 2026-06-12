import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

/**
 * GET /api/courses - List courses with optional ?lang=&level= filters
 */
router.get('/', (req: Request, res: Response): void => {
  const { lang, level } = req.query

  let sql = 'SELECT * FROM courses WHERE 1=1'
  const params: unknown[] = []

  if (lang) {
    sql += ' AND language = ?'
    params.push(lang)
  }
  if (level) {
    sql += ' AND level = ?'
    params.push(Number(level))
  }

  sql += ' ORDER BY level, language'

  const courses = db.prepare(sql).all(...params)
  res.json({ success: true, data: courses })
})

/**
 * GET /api/courses/:id - Get course detail with chapters and lessons
 */
router.get('/:id', (req: Request, res: Response): void => {
  const courseId = Number(req.params.id)

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId)
  if (!course) {
    res.status(404).json({ success: false, error: '课程不存在' })
    return
  }

  const chapters = db.prepare(
    'SELECT * FROM chapters WHERE course_id = ? ORDER BY order_num'
  ).all(courseId)

  const lessons = db.prepare(
    'SELECT * FROM lessons WHERE chapter_id IN (SELECT id FROM chapters WHERE course_id = ?) ORDER BY order_num'
  ).all(courseId)

  const chaptersWithLessons = chapters.map((chapter: any) => ({
    ...(chapter as object),
    lessons: lessons.filter((lesson: any) => lesson.chapter_id === chapter.id),
  }))

  res.json({
    success: true,
    data: {
      ...(course as object),
      chapters: chaptersWithLessons,
    },
  })
})

export default router
