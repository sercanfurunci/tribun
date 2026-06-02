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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="size-14 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your Tribün account</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="flex flex-col gap-4"
          >
            <Input
              id="email"
              type="email"
              label="Email address"
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
            <Button type="submit" loading={mutation.isPending} size="lg" className="mt-1">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 hover:text-green-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
