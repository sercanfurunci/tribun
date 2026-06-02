import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';
import { useAuthStore } from '../store/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => authApi.register(form.username, form.email, form.password),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success('Account created! Welcome to Tribün!');
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg);
    },
  });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="size-14 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Join Tribün</h1>
          <p className="text-slate-400 text-sm">Create your account and start predicting</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="flex flex-col gap-4"
          >
            <Input
              id="username"
              label="Username"
              placeholder="coolpredictor"
              value={form.username}
              onChange={update('username')}
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_]+"
            />
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
            />
            <p className="text-xs text-slate-500">
              By signing up, you agree to our Terms of Service.
            </p>
            <Button type="submit" loading={mutation.isPending} size="lg">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
