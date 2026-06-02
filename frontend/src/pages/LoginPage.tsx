import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';
import { useAuthStore } from '../store/auth';
import { useT } from '../store/language';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AuthLayout } from '../components/layout/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();

  const mutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success(t('auth.welcomeBack', { name: data.user.username }));
      navigate('/dashboard');
    },
    onError: () => toast.error(t('auth.invalidCredentials')),
  });

  return (
    <AuthLayout
      badge={t('auth.login.eyebrow')}
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      formTitle={t('auth.signInButton')}
      formSubtitle={t('auth.login.subtitle')}
      highlights={['auth.login.highlight.1', 'auth.login.highlight.2', 'auth.login.highlight.3']}
      footerLink={{ to: '/register', label: t('auth.createNew') }}
      primaryAction={
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] btn-glow"
        >
          {t('auth.createNew')}
        </Link>
      }
      secondaryAction={
        <Link
          to="/matches"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.07]"
        >
          {t('nav.matches')}
        </Link>
      }
    >
      <div
        className="rounded-[28px] border border-white/8 bg-black/20 p-6"
        style={{ boxShadow: '0 10px 30px -18px rgba(0,0,0,0.55)' }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            id="email"
            type="email"
            label={t('auth.field.email')}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            type="password"
            label={t('auth.field.password')}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" loading={mutation.isPending} size="lg" className="w-full mt-1">
            {t('auth.signInButton')}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
