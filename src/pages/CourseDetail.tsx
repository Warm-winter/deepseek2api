import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, PenTool, Mic, Headphones, Star, Target, ArrowLeft } from 'lucide-react';
import { useCourseStore } from '@/store/useCourseStore';
import type { Lesson } from '@/lib/api';

const lessonIcons: Record<string, React.ElementType> = {
  vocabulary: BookOpen,
  grammar: PenTool,
  speaking: Mic,
  listening: Headphones,
};

const lessonTypeLabels: Record<string, string> = {
  vocabulary: '词汇',
  grammar: '语法',
  speaking: '口语',
  listening: '听力',
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentCourse, fetchCourseDetail, loading } = useCourseStore();
  const [openChapter, setOpenChapter] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCourseDetail(id);
  }, [id, fetchCourseDetail]);

  useEffect(() => {
    if (currentCourse?.chapters.length) {
      setOpenChapter(currentCourse.chapters[0].id);
    }
  }, [currentCourse]);

  if (loading || !currentCourse) {
    return <div className="py-20 text-center text-navy/40">加载中...</div>;
  }

  const totalLessons = currentCourse.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const completedLessons = currentCourse.chapters.reduce(
    (sum, ch) => sum + ch.lessons.filter((l) => l.completed).length, 0
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back */}
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-navy/50 hover:text-orange transition">
        <ArrowLeft size={16} /> 返回课程列表
      </Link>

      {/* Course header */}
      <div className={`rounded-2xl ${currentCourse.coverGradient} p-8 text-white relative overflow-hidden`}>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute right-16 bottom-4 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              {currentCourse.language}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < currentCourse.level ? 'fill-white text-white' : 'text-white/30'} />
              ))}
            </div>
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold lg:text-3xl">{currentCourse.title}</h1>
          <p className="mt-2 text-white/70">{currentCourse.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
            <span>{totalLessons} 课时</span>
            <span>已完成 {completedLessons}</span>
            <span>{currentCourse.progress}% 进度</span>
          </div>
        </div>
      </div>

      {/* Learning objectives */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
          <Target size={20} className="text-orange" /> 学习目标
        </h2>
        <ul className="mt-3 space-y-2">
          {currentCourse.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-navy/70">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-mint/10 text-xs font-bold text-mint">
                {i + 1}
              </span>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-navy">课程章节</h2>
        {currentCourse.chapters.map((chapter) => {
          const isOpen = openChapter === chapter.id;
          return (
            <div key={chapter.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenChapter(isOpen ? null : chapter.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-warm-gray/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 font-display text-sm font-bold text-navy">
                    {chapter.order}
                  </span>
                  <span className="font-display font-bold text-navy">{chapter.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-navy/40">
                    {chapter.lessons.filter((l) => l.completed).length}/{chapter.lessons.length}
                  </span>
                  {isOpen ? <ChevronDown size={18} className="text-navy/40" /> : <ChevronRight size={18} className="text-navy/40" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-warm-gray px-6 py-2 animate-slide-down">
                  {chapter.lessons.map((lesson: Lesson) => {
                    const Icon = lessonIcons[lesson.type] || BookOpen;
                    return (
                      <Link
                        key={lesson.id}
                        to={`/learn/${lesson.id}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-warm-gray/50"
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          lesson.completed ? 'bg-mint/10 text-mint' : 'bg-navy/5 text-navy/40'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${lesson.completed ? 'text-navy/50 line-through' : 'text-navy'}`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-navy/30">{lessonTypeLabels[lesson.type]}</p>
                        </div>
                        {lesson.completed && (
                          <span className="rounded-full bg-mint/10 px-2 py-0.5 text-xs font-medium text-mint">已完成</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
