import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Users, User, Menu, X, LogOut, Flame } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/courses', label: '课程中心', icon: BookOpen },
  { to: '/progress', label: '学习进度', icon: BarChart3 },
  { to: '/community', label: '社区', icon: Users },
  { to: '/profile', label: '个人中心', icon: User },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !user) {
      useAuthStore.getState().fetchCurrentUser();
    }
  }, [token, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-warm font-body">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-navy transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange">
                <span className="font-display text-lg font-bold text-white">L</span>
              </div>
              <span className="font-display text-xl font-bold text-white">
                Lingua<span className="text-orange">Verse</span>
              </span>
            </div>
            <button
              className="text-white/60 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange text-white shadow-lg shadow-orange/25'
                      : 'text-white/60 hover:bg-navy-light hover:text-white'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          {user && (
            <div className="border-t border-navy-lighter p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user.nickname}</p>
                  <div className="flex items-center gap-1 text-xs text-orange">
                    <Flame size={12} />
                    <span>{user.streak}天连续</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/40 hover:text-coral transition-colors"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-warm-gray bg-white px-4 lg:px-8">
          <button
            className="rounded-lg p-2 text-navy/60 hover:bg-warm-gray hover:text-navy lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-orange/10 px-3 py-1 text-sm font-medium text-orange">
                  <Flame size={14} />
                  Lv.{user.level}
                </div>
                <div className="text-sm text-navy/60">
                  {user.xp} XP
                </div>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="rounded-lg bg-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-dark transition-colors"
              >
                登录
              </NavLink>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
