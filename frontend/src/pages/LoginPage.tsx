import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';
import { useAuthStore } from '../store/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate('/dashboard');
    },
    onError: () => toast.error('Invalid email or password'),
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(22,163,74,0.12) 0%, #060d1a 55%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(14,48,100,0.8) 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-sm relative animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="size-14 rounded-2xl flex items-center justify-center mx-auto mb-5 font-heading font-bold text-2xl text-white"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 0 40px rgba(22,163,74,0.5), 0 0 80px rgba(22,163,74,0.15)',
            }}
          >
            T
          </div>
          <h1 className="font-heading font-bold text-2xl text-white mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your Tribün account</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{
            background: 'rgba(12, 22, 40, 0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="flex flex-col gap-4"
          >
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              loading={mutation.isPending}
              size="lg"
              className="w-full mt-1"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
