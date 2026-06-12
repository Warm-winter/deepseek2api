import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Flame, Star, ChevronRight, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCourseStore } from '@/store/useCourseStore';

const languages = [
  { name: '英语', flag: '🇬🇧', desc: '全球通用语言，开启世界之门', gradient: 'gradient-english', color: 'text-blue-500' },
  { name: '日语', flag: '🇯🇵', desc: '感受日本文化，探索动漫世界', gradient: 'gradient-japanese', color: 'text-pink-500' },
  { name: '韩语', flag: '🇰🇷', desc: '韩流来袭，掌握韩语新技能', gradient: 'gradient-korean', color: 'text-purple-500' },
];

export default function Home() {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Section */}
      <section className="gradient-navy relative overflow-hidden rounded-2xl px-8 py-12 text-white lg:px-16 lg:py-20">
        <div className="absolute right-8 top-8 text-6xl opacity-20 animate-float lg:text-8xl">🌍</div>
        <div className="absolute left-1/2 top-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>📚</div>
        <div className="absolute right-1/4 bottom-8 text-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>💬</div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold leading-tight lg:text-5xl">
            探索语言的<span className="text-orange">无限可能</span>
          </h1>
          <p className="mt-4 text-lg text-white/70">
            LinguaVerse — 沉浸式多语种学习平台，让学习语言变得有趣又高效
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 font-display font-semibold text-white shadow-lg shadow-orange/25 transition hover:bg-orange-dark"
            >
              开始学习 <ChevronRight size={18} />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-display font-semibold text-white transition hover:bg-white/10"
              >
                登录体验
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats (logged in) */}
      {user && (
        <section className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{user.streak}</p>
              <p className="text-xs text-navy/50">天连续学习</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/10 text-mint">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{user.xp}</p>
              <p className="text-xs text-navy/50">经验值</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Star size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">Lv.{user.level}</p>
              <p className="text-xs text-navy/50">当前等级</p>
            </div>
          </div>
        </section>
      )}

      {/* Language Selection */}
      <section>
        <h2 className="font-display text-xl font-bold text-navy">选择你想学习的语言</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {languages.map((lang) => (
            <Link
              key={lang.name}
              to={`/courses?language=${lang.name}`}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${lang.gradient} opacity-20 transition group-hover:opacity-30`} />
              <span className="text-4xl">{lang.flag}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-navy">{lang.name}</h3>
              <p className="mt-1 text-sm text-navy/50">{lang.desc}</p>
              <span className={`mt-3 inline-flex items-center text-sm font-medium ${lang.color}`}>
                查看课程 <ChevronRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Courses */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy">推荐课程</h2>
          <Link to="/courses" className="text-sm font-medium text-orange hover:text-orange-dark transition">
            查看全部 <ChevronRight size={14} className="inline" />
          </Link>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
          {courses.length > 0 ? courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group min-w-[260px] flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={`h-32 ${course.coverGradient} flex items-center justify-center`}>
                <BookOpen size={40} className="text-white/60" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange/10 px-2 py-0.5 text-xs font-medium text-orange">
                    {course.language}
                  </span>
                  <span className="flex items-center text-xs text-navy/40">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className={i < course.level ? 'fill-orange text-orange' : 'text-navy/20'} />
                    ))}
                  </span>
                </div>
                <h3 className="mt-2 font-display font-bold text-navy group-hover:text-orange transition-colors">
                  {course.title}
                </h3>
                {course.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-navy/40">
                      <span>进度</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-warm-gray">
                      <div
                        className="h-full rounded-full bg-orange transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )) : (
            <p className="text-sm text-navy/40">暂无课程</p>
          )}
        </div>
      </section>
    </div>
  );
}
