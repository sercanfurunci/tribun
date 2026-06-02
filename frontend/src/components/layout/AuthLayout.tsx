import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { TranslationKey } from '../../i18n/translations';
import { useLanguageStore, useT } from '../../store/language';
import { Icon } from '../ui/Icon';

interface AuthLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  formTitle: string;
  formSubtitle: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  children: ReactNode;
  footerLink: { to: string; label: string };
  highlights: TranslationKey[];
}

function TrophyArt() {
  return (
    <div className="absolute right-[-28px] top-10 hidden w-[320px] opacity-75 lg:block">
      <svg viewBox="0 0 360 280" className="w-full" aria-hidden>
        <defs>
          <radialGradient id="auth-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="auth-gold" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        <circle cx="180" cy="136" r="104" fill="url(#auth-glow)" />
        <g stroke="rgba(255,255,255,0.09)" strokeWidth="1" fill="none">
          <circle cx="180" cy="136" r="62" />
          <circle cx="180" cy="136" r="90" strokeDasharray="2 5" />
          <path d="M100 188 C135 150, 225 150, 260 188" />
        </g>

        <g transform="translate(180 84)">
          <path
            d="M-46 6 h92 v24 a46 46 0 0 1 -46 46 a46 46 0 0 1 -46 -46 z"
            fill="url(#auth-gold)"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="1"
          />
          <path d="M-46 18 c-18 0 -24 20 -8 28" stroke="#f59e0b" strokeWidth="4" fill="none" />
          <path d="M46 18 c18 0 24 20 8 28" stroke="#f59e0b" strokeWidth="4" fill="none" />
          <rect x="-7" y="78" width="14" height="28" fill="#b45309" />
          <rect x="-24" y="106" width="48" height="8" rx="3" fill="#92400e" />
          <rect x="-30" y="114" width="60" height="14" rx="4" fill="url(#auth-gold)" />
          <path d="M-17 12 l10 0 l-5 22 z" fill="rgba(255,255,255,0.38)" />
        </g>

        <g transform="translate(84 190)">
          <circle r="20" fill="rgba(12,22,40,0.9)" stroke="rgba(255,255,255,0.22)" />
          <path d="M0 -8 6 -3 4 5 -4 5 -6 -3Z" fill="rgba(255,255,255,0.85)" />
        </g>
        <g transform="translate(286 174)">
          <circle r="16" fill="rgba(12,22,40,0.9)" stroke="rgba(255,255,255,0.16)" />
          <path d="M0 -6 5 -2 3 4 -3 4 -5 -2Z" fill="rgba(255,255,255,0.75)" />
        </g>
      </svg>
    </div>
  );
}

export function AuthLayout({
  badge,
  title,
  subtitle,
  formTitle,
  formSubtitle,
  primaryAction,
  secondaryAction,
  children,
  footerLink,
  highlights,
}: AuthLayoutProps) {
  const { lang, toggle } = useLanguageStore();
  const t = useT();

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
      style={{
        background:
          'radial-gradient(900px 500px at 50% 0%, rgba(22,163,74,0.16) 0%, transparent 55%), radial-gradient(700px 380px at 100% 100%, rgba(59,130,246,0.14) 0%, transparent 50%), #060d1a',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-60deg, transparent, transparent 42px, rgba(255,255,255,0.5) 42px, rgba(255,255,255,0.5) 84px)',
          }}
        />
        <div
          className="absolute -top-28 left-1/2 h-[760px] w-[760px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 65%)' }}
        />
      </div>

      <button
        onClick={toggle}
        aria-label="Toggle language"
        className="absolute right-5 top-5 z-20 flex items-center gap-1 rounded-xl border border-white/10 bg-[#0B1220]/70 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 backdrop-blur-md transition-colors hover:bg-white/5 hover:text-white sm:right-7 sm:top-7"
      >
        <span className={lang === 'tr' ? 'text-green-400' : ''}>TR</span>
        <span className="text-slate-700">/</span>
        <span className={lang === 'en' ? 'text-green-400' : ''}>EN</span>
      </button>

      <div className="relative mx-auto grid w-full max-w-[1280px] items-center gap-5 lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[1.08fr_0.92fr]">
        <section
          className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#0F172A]/88 px-6 py-8 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.72)] backdrop-blur-2xl sm:px-8 sm:py-10 lg:min-h-[700px] lg:px-10 lg:py-11"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                'radial-gradient(900px 260px at 50% 0%, rgba(34,197,94,0.18), transparent 55%),' +
                'radial-gradient(420px 160px at 80% 15%, rgba(59,130,246,0.09), transparent 60%)',
            }}
          />

          <div className="relative flex h-full flex-col">
            <TrophyArt />

            <div className="flex items-center gap-3">
              <div
                className="size-12 rounded-2xl flex items-center justify-center font-heading text-xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 0 28px rgba(22,163,74,0.4), 0 0 60px rgba(22,163,74,0.12)',
                }}
              >
                T
              </div>
              <div>
                <p className="font-heading text-xl font-bold tracking-tight text-white">Tribün</p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{t('auth.brandSeason')}</p>
              </div>
            </div>

            <div className="mt-10 max-w-xl lg:pr-28">
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.34em] text-green-400/90">{badge}</p>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-lg text-sm text-slate-400 sm:text-[15px]">{subtitle}</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:pr-20">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/8 bg-[#0B1220] p-4 text-sm text-slate-300 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.65)]"
                >
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-green-600/12 text-green-400">
                    <Icon name="check" size={16} />
                  </div>
                  <p className="leading-snug">{t(item)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[22px] border border-white/8 bg-[#0B1220] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">{t('auth.brandSeason')}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{formTitle}</p>
                    <p className="mt-2 max-w-md text-sm text-slate-400">{formSubtitle}</p>
                  </div>
                  <div
                    className="hidden size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-green-400 md:flex"
                  >
                    <Icon name="trophy" size={28} />
                  </div>
                </div>

                {(primaryAction || secondaryAction) && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {primaryAction}
                    {secondaryAction}
                  </div>
                )}
              </div>

              <div className="rounded-[22px] border border-white/8 bg-[#0B1220] p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">{t('auth.scoring')}</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-4 text-center">
                    <p className="font-score text-3xl leading-none text-amber-400">3</p>
                    <p className="mt-2 text-[9px] font-heading uppercase tracking-[0.22em] text-slate-500">{t('scoring.exact')}</p>
                  </div>
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-3 py-4 text-center">
                    <p className="font-score text-3xl leading-none text-green-400">2</p>
                    <p className="mt-2 text-[9px] font-heading uppercase tracking-[0.22em] text-slate-500">{t('scoring.goalDiff')}</p>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-4 text-center">
                    <p className="font-score text-3xl leading-none text-blue-400">1</p>
                    <p className="mt-2 text-[9px] font-heading uppercase tracking-[0.22em] text-slate-500">{t('scoring.outcome')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#0F172A]/90 px-4 py-5 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:px-6 sm:py-7 lg:px-7 lg:py-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(520px 220px at 90% 0%, rgba(34,197,94,0.12), transparent 55%),' +
                'radial-gradient(420px 180px at 0% 100%, rgba(59,130,246,0.08), transparent 60%)',
            }}
          />
          <div className="relative">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-green-500">{badge}</p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">{formTitle}</h2>
              <p className="mt-3 text-sm text-slate-500">{formSubtitle}</p>
            </div>

              <div className="mt-6 rounded-[24px] border border-white/8 bg-[#0B1220] p-5 sm:p-6">{children}</div>

              <div className="mt-6 text-center">
                <Link
                to={footerLink.to}
                className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                {footerLink.label}
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
