import { useEffect } from 'react';
import { Zap, Star, Flame, BookOpen, TrendingUp } from 'lucide-react';
import { useLearningStore } from '@/store/useLearningStore';

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const skillLabels = [
  { key: 'listening' as const, label: '听力', color: '#3B82F6' },
  { key: 'speaking' as const, label: '口语', color: '#FF6B35' },
  { key: 'reading' as const, label: '阅读', color: '#10B981' },
  { key: 'writing' as const, label: '写作', color: '#8B5CF6' },
];

export default function Progress() {
  const { progress, fetchProgress } = useLearningStore();

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (!progress) return <div className="py-20 text-center text-navy/40">加载中...</div>;

  const maxActivity = Math.max(...progress.weeklyActivity, 1);

  // Calendar generation
  const now = new Date(2026, 5, 12); // June 2026
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calOffset = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">学习进度</h1>
        <p className="mt-1 text-sm text-navy/50">追踪你的学习成就</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Zap, label: '总经验值', value: progress.totalXp, color: 'text-orange bg-orange/10' },
          { icon: Star, label: '当前等级', value: `Lv.${progress.level}`, color: 'text-blue-500 bg-blue-500/10' },
          { icon: Flame, label: '连续天数', value: `${progress.streak}天`, color: 'text-coral bg-coral/10' },
          { icon: BookOpen, label: '完成课时', value: progress.lessonsCompleted, color: 'text-mint bg-mint/10' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="mt-3 text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-navy/40">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly activity */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy">本周学习</h2>
          <div className="mt-4 flex items-end justify-between gap-2" style={{ height: 120 }}>
            {progress.weeklyActivity.map((val, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-orange/80 transition-all"
                  style={{ height: `${(val / maxActivity) * 100}%`, minHeight: 4 }}
                />
                <span className="text-xs text-navy/30">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill radar */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy">技能水平</h2>
          <div className="mt-4 space-y-4">
            {skillLabels.map((skill) => (
              <div key={skill.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-navy">{skill.label}</span>
                  <span className="text-navy/40">{progress.skills[skill.key]}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-warm-gray">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress.skills[skill.key]}%`, backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning calendar */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-navy">
          {year}年{month + 1}月学习日历
        </h2>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <div key={d} className="py-1 text-xs font-medium text-navy/30">{d}</div>
          ))}
          {Array.from({ length: calOffset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const active = progress.calendar[dateStr];
            return (
              <div
                key={day}
                className={`flex h-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                  active
                    ? 'bg-orange text-white'
                    : day === now.getDate()
                    ? 'bg-orange/10 text-orange'
                    : 'text-navy/40'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-navy">最近活动</h2>
        <div className="mt-4 space-y-3">
          {progress.recentActivity.map((act) => (
            <div key={act.id} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-warm-gray/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10 text-orange">
                <TrendingUp size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-navy">{act.title}</p>
                <p className="text-xs text-navy/30">{new Date(act.timestamp).toLocaleDateString('zh-CN')}</p>
              </div>
              <span className="text-sm font-medium text-mint">+{act.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
