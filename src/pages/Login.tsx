import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange shadow-lg shadow-orange/25">
            <span className="font-display text-2xl font-bold text-white">L</span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-navy">
            Lingua<span className="text-orange">verse</span>
          </h1>
          <p className="mt-1 text-sm text-navy/40">登录你的学习账号</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-navy/70">邮箱</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  required
                  className="w-full rounded-lg border border-warm-gray bg-warm py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange focus:ring-1 focus:ring-orange"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy/70">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="w-full rounded-lg border border-warm-gray bg-warm py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange focus:ring-1 focus:ring-orange"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-orange py-3 font-display font-semibold text-white shadow-lg shadow-orange/25 transition hover:bg-orange-dark disabled:opacity-50"
          >
            <LogIn size={18} /> {loading ? '登录中...' : '登录'}
          </button>

          <p className="mt-4 text-center text-sm text-navy/40">
            还没有账号？
            <Link to="/register" className="ml-1 font-medium text-orange hover:text-orange-dark transition">
              立即注册
            </Link>
          </p>
        </form>

        {/* Demo hint */}
        <div className="mt-4 rounded-xl bg-orange/5 p-3 text-center text-xs text-navy/40">
          演示账号：输入任意邮箱和密码即可登录
        </div>
      </div>
    </div>
  );
}
