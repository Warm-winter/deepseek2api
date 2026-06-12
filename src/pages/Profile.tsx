import { useNavigate } from 'react-router-dom';
import { User, Mail, Flame, Zap, LogOut, BookOpen, Trophy } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { mockAchievements } from '@/lib/api';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unlockedAchievements = mockAchievements.filter((a) => a.unlocked);
  const xpForNextLevel = (user?.level || 5) * 500;
  const currentXp = user?.xp || 0;
  const xpProgress = Math.min((currentXp / xpForNextLevel) * 100, 100);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">个人中心</h1>
        <p className="mt-1 text-sm text-navy/50">管理你的学习档案</p>
      </div>

      {/* User info card */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange/10 text-orange">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-navy">{user?.nickname || '未登录'}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-navy/40">
              <Mail size={14} /> {user?.email || '-'}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 font-medium text-navy">
              <Zap size={14} className="text-orange" /> Lv.{user?.level || 0}
            </span>
            <span className="text-navy/40">{currentXp} / {xpForNextLevel} XP</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-warm-gray">
            <div className="h-full rounded-full bg-orange transition-all" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-orange/5 p-3">
            <Flame size={18} className="text-orange" />
            <div>
              <p className="text-lg font-bold text-navy">{user?.streak || 0}</p>
              <p className="text-xs text-navy/40">天连续学习</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-mint/5 p-3">
            <Zap size={18} className="text-mint" />
            <div>
              <p className="text-lg font-bold text-navy">{currentXp}</p>
              <p className="text-xs text-navy/40">总经验值</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning preferences */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-navy">学习偏好</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-warm-gray/50 p-3">
            <span className="text-sm text-navy/70">每日目标</span>
            <span className="text-sm font-medium text-orange">20 分钟</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-warm-gray/50 p-3">
            <span className="text-sm text-navy/70">提醒时间</span>
            <span className="text-sm font-medium text-orange">每天 9:00</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-warm-gray/50 p-3">
            <span className="text-sm text-navy/70">学习语言</span>
            <span className="text-sm font-medium text-orange">英语、日语</span>
          </div>
        </div>
      </div>

      {/* Learning path recommendation */}
      <div className="rounded-xl gradient-navy p-6 text-white">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-orange" />
          <h3 className="font-display text-lg font-bold">推荐学习路径</h3>
        </div>
        <p className="mt-2 text-sm text-white/60">基于你的学习进度和目标，我们为你推荐以下学习路径：</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange text-xs font-bold">1</span>
            <span className="text-sm">完成「英语入门基础」剩余课程</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange/50 text-xs font-bold">2</span>
            <span className="text-sm text-white/60">开始「英语进阶会话」</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange/30 text-xs font-bold">3</span>
            <span className="text-sm text-white/40">挑战英语中级阅读</span>
          </div>
        </div>
      </div>

      {/* Achievement showcase */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
            <Trophy size={20} className="text-orange" /> 成就展示
          </h3>
          <span className="text-xs text-navy/30">{unlockedAchievements.length}/{mockAchievements.length}</span>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {unlockedAchievements.map((a) => (
            <div key={a.id} className="flex min-w-[80px] flex-col items-center rounded-xl bg-warm-gray/50 p-3">
              <span className="text-2xl">{a.icon}</span>
              <span className="mt-1 text-xs font-medium text-navy">{a.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-coral/20 bg-coral/5 py-3 text-sm font-medium text-coral transition hover:bg-coral/10"
      >
        <LogOut size={16} /> 退出登录
      </button>
    </div>
  );
}
