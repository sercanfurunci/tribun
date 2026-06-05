import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { TranslationKey } from '../../i18n/translations';
import { useLanguageStore, useT } from '../../store/language';

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
}: AuthLayoutProps) {
  const { lang, toggle } = useLanguageStore();
  const t = useT();

  return (
    <div className="min-h-screen bg-[#F7F4EF] lg:grid lg:grid-cols-[1fr_480px]">
      <section className="relative hidden lg:flex flex-col justify-between bg-[#111111] px-10 py-10 overflow-hidden">
        <div className="flex items-center justify-between relative">
          <p className="font-heading font-black text-[13px] tracking-[0.18em] uppercase text-white">
            TRIBÜN
          </p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#444444]">
            {t('auth.brandSeason')}
          </p>
        </div>

        <div className="relative max-w-lg">
          <p className="font-heading font-black text-[11px] uppercase tracking-[0.3em] text-[#8B1E1E] mb-5">
            {badge}
          </p>
          <h1 className="font-heading font-black text-5xl xl:text-6xl leading-tight text-white">
            {title}
          </h1>
          <p className="mt-5 text-sm text-[#777777] leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#444444] mb-4">
            {t('auth.scoring')}
          </p>
          <div className="flex gap-3">
            {[
              { pts: '3', label: t('scoring.exact') },
              { pts: '2', label: t('scoring.goalDiff') },
              { pts: '1', label: t('scoring.outcome') },
            ].map(({ pts, label }) => (
              <div
                key={pts}
                className="flex-1 border border-[#222222] px-4 py-5 text-center"
              >
                <p className="font-display text-4xl leading-none text-[#F7F4EF]">{pts}</p>
                <p className="mt-2.5 text-[9px] uppercase tracking-[0.2em] text-[#555555] leading-tight">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
        <button
          onClick={toggle}
          aria-label="Toggle language"
          className="absolute top-5 right-5 flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-[0.08em] border border-[#D9D4CC] hover:border-[#B8B2AA] transition-colors duration-150"
        >
          <span className={lang === 'tr' ? 'text-[#8B1E1E]' : 'text-[#666666]'}>TR</span>
          <span className="text-[#D9D4CC]">/</span>
          <span className={lang === 'en' ? 'text-[#8B1E1E]' : 'text-[#666666]'}>EN</span>
        </button>

        <div className="lg:hidden mb-8 text-center">
          <p className="font-heading font-black text-[15px] tracking-[0.15em] uppercase text-[#111111]">
            TRIBÜN
          </p>
        </div>

        <div className="w-full max-w-[360px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8B1E1E] mb-3">
            {badge}
          </p>
          <h2 className="font-heading font-black text-2xl text-[#111111] mb-1">
            {formTitle}
          </h2>
          <p className="text-sm text-[#666666] mb-7">
            {formSubtitle}
          </p>

          {children}

          {(primaryAction || secondaryAction) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {primaryAction}
              {secondaryAction}
            </div>
          )}

          <div className="mt-7 pt-6 border-t border-[#E8E4DE] text-center">
            <Link
              to={footerLink.to}
              className="text-sm text-[#666666] hover:text-[#111111] transition-colors duration-150"
            >
              {footerLink.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
