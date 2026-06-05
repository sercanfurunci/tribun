import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';
import { useAuthStore } from '../store/auth';
import { useT } from '../store/language';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AuthLayout } from '../components/layout/AuthLayout';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();

  const mutation = useMutation({
    mutationFn: () => authApi.register(form.username, form.email, form.password),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success(t('auth.welcomeToTribun'));
      navigate('/dashboard');
    },
    onError: () => toast.error(t('auth.registerFailed')),
  });

  const update = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <AuthLayout
      badge={t('auth.register.eyebrow')}
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      formTitle={t('auth.createButton')}
      formSubtitle={t('auth.register.subtitle')}
      highlights={['auth.register.highlight.1', 'auth.register.highlight.2', 'auth.register.highlight.3']}
      footerLink={{ to: '/login', label: t('auth.signInInstead') }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <Input
          id="username"
          label={t('auth.field.username')}
          placeholder="coolpredictor"
          value={form.username}
          onChange={update('username')}
          required
          minLength={3}
          maxLength={50}
          pattern="[a-zA-Z0-9_]+"
          autoComplete="username"
        />
        <Input
          id="email"
          type="email"
          label={t('auth.field.email')}
          placeholder="you@example.com"
          value={form.email}
          onChange={update('email')}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          type="password"
          label={t('auth.field.password')}
          placeholder="Min. 8"
          value={form.password}
          onChange={update('password')}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button type="submit" loading={mutation.isPending} size="lg" className="w-full mt-1">
          {t('auth.createButton')}
        </Button>
      </form>
    </AuthLayout>
  );
}
