import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, BookOpen } from 'lucide-react';
import { useCourseStore } from '@/store/useCourseStore';

const languageTabs = ['全部', '英语', '日语', '韩语'];
const levels = [1, 2, 3, 4, 5];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, fetchCourses, loading } = useCourseStore();
  const [search, setSearch] = useState('');
  const [activeLang, setActiveLang] = useState(searchParams.get('language') || '全部');
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses({
      language: activeLang !== '全部' ? activeLang : undefined,
      level: activeLevel || undefined,
    });
  }, [activeLang, activeLevel, fetchCourses]);

  const handleLangChange = (lang: string) => {
    setActiveLang(lang);
    if (lang === '全部') {
      searchParams.delete('language');
    } else {
      searchParams.set('language', lang);
    }
    setSearchParams(searchParams);
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">课程中心</h1>
        <p className="mt-1 text-sm text-navy/50">探索丰富的语言学习课程</p>
      </div>

      {/* Filter bar */}
      <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
          <input
            type="text"
            placeholder="搜索课程..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-warm-gray bg-warm py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange focus:ring-1 focus:ring-orange"
          />
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {languageTabs.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangChange(lang)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeLang === lang
                  ? 'bg-orange text-white'
                  : 'bg-warm-gray text-navy/60 hover:bg-warm-gray/80'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-navy/40">级别：</span>
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(activeLevel === level ? null : level)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                activeLevel === level
                  ? 'bg-navy text-white'
                  : 'bg-warm-gray text-navy/60 hover:bg-warm-gray/80'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="py-20 text-center text-navy/40">加载中...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={`h-36 ${course.coverGradient} flex items-center justify-center relative`}>
                <BookOpen size={40} className="text-white/50" />
                <span className="absolute left-3 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {course.language}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < course.level ? 'fill-orange text-orange' : 'text-navy/20'} />
                  ))}
                </div>
                <h3 className="mt-2 font-display font-bold text-navy group-hover:text-orange transition-colors">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-navy/50 line-clamp-2">{course.description}</p>
                {course.progress > 0 ? (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-navy/40">
                      <span>{course.completedLessons}/{course.totalLessons} 课时</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-warm-gray">
                      <div className="h-full rounded-full bg-orange" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-navy/30">{course.totalLessons} 课时</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="py-20 text-center text-navy/40">没有找到匹配的课程</div>
      )}
    </div>
  );
}
