import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';
import { useAuthStore } from '../store/auth';
import { useLanguageStore, useT } from '../store/language';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const { lang, toggle } = useLanguageStore();

  const mutation = useMutation({
    mutationFn: () => authApi.register(form.username, form.email, form.password),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success(t('auth.welcomeToTribun'));
      navigate('/dashboard');
    },
    onError: () => toast.error(t('auth.registerFailed')),
  });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center px-5 py-12 sm:px-8 sm:py-16 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(22,163,74,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(14,48,100,0.25) 0%, transparent 60%), #060d1a',
      }}
    >
      {/* Top-right lang toggle */}
      <button
        onClick={toggle}
        aria-label="Toggle language"
        className="absolute top-5 right-5 sm:top-7 sm:right-7 z-10 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold font-heading uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(12,22,40,0.6)', backdropFilter: 'blur(8px)' }}
      >
        <span className={lang === 'tr' ? 'text-green-400' : ''}>TR</span>
        <span className="text-slate-700">/</span>
        <span className={lang === 'en' ? 'text-green-400' : ''}>EN</span>
      </button>

      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 60%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 110px)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.2%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="relative w-full max-w-[520px] animate-fade-up">
        {/* Logo strip */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="size-12 rounded-2xl flex items-center justify-center font-heading font-bold text-xl text-white"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 0 40px rgba(22,163,74,0.5), 0 0 80px rgba(22,163,74,0.15)',
            }}
          >
            T
          </div>
          <div>
            <p className="font-heading font-bold text-xl text-white tracking-tight leading-none">Tribün</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-heading mt-1">World Cup 2026</p>
          </div>
        </div>

        {/* Glass card */}
        <div
          className="relative rounded-3xl p-6 sm:p-10"
          style={{
            background: 'linear-gradient(180deg, rgba(18,30,52,0.85) 0%, rgba(12,22,40,0.85) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 24px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset',
          }}
        >
          <div
            className="absolute -top-px left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }}
          />

          {/* Heading */}
          <div className="text-center mb-8">
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.35em] mb-3 font-heading">
              {t('auth.register.eyebrow')}
            </p>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white leading-tight tracking-tight">
              {t('auth.register.title')}
            </h1>
            <p className="text-slate-500 text-sm mt-3">{t('auth.register.subtitle')}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="flex flex-col gap-5"
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
            <Button type="submit" loading={mutation.isPending} size="lg" className="w-full mt-3">
              {t('auth.createButton')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[10px] text-slate-700 uppercase tracking-widest font-heading">{t('auth.alreadyMember')}</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {t('auth.signInInstead')}
          </Link>
        </div>

        {/* Scoring strip */}
        <div
          className="mt-8 grid grid-cols-3 gap-4 rounded-2xl p-5"
          style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="text-center">
            <p className="font-score text-2xl text-amber-400 leading-none">3</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-heading mt-1.5">{t('scoring.exact')}</p>
          </div>
          <div className="text-center" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="font-score text-2xl text-green-400 leading-none">2</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-heading mt-1.5">{t('scoring.goalDiff')}</p>
          </div>
          <div className="text-center">
            <p className="font-score text-2xl text-blue-400 leading-none">1</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-heading mt-1.5">{t('scoring.outcome')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
