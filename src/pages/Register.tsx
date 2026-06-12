import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Register() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(nickname, email, password);
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
          <p className="mt-1 text-sm text-navy/40">创建你的学习账号</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-navy/70">昵称</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称"
                  required
                  className="w-full rounded-lg border border-warm-gray bg-warm py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange focus:ring-1 focus:ring-orange"
                />
              </div>
            </div>
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
                  placeholder="请输入密码（至少6位）"
                  required
                  minLength={6}
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
            <UserPlus size={18} /> {loading ? '注册中...' : '注册'}
          </button>

          <p className="mt-4 text-center text-sm text-navy/40">
            已有账号？
            <Link to="/login" className="ml-1 font-medium text-orange hover:text-orange-dark transition">
              立即登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
