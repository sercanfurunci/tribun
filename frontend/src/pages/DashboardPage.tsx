import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useT } from '../store/language';
import { matchesApi } from '../services/matches';
import { leaguesApi } from '../services/leagues';
import { predictionsApi } from '../services/predictions';
import { MatchCard } from '../components/features/MatchCard';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import { Icon, type IconName } from '../components/ui/Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent: string;
  icon: IconName;
  to?: string;
}

function StatCard({ label, value, sublabel, accent, icon, to }: StatCardProps) {
  const inner = (
    <>
      <div className={`flex items-center gap-1.5 ${accent}`}>
        <Icon name={icon} size={16} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 font-heading">{label}</span>
      </div>
      <span className={`font-score text-5xl sm:text-6xl leading-none ${accent}`}>{value}</span>
      {sublabel && <p className="text-xs text-slate-500 truncate w-full">{sublabel}</p>}
    </>
  );

  const baseClass = "rounded-[22px] p-5 sm:p-6 flex flex-col items-center justify-between text-center gap-3 min-w-0 min-h-[150px]";
  const baseStyle = {
    background: '#0F172A',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 6px 24px -10px rgba(0,0,0,0.45)',
  };

  if (to) {
    return (
      <Link
        to={to}
        className={`${baseClass} transition-colors hover:border-white/20 hover:bg-[#132033]`}
        style={baseStyle}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={baseClass} style={baseStyle}>
      {inner}
    </div>
  );
}

function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-heading font-bold text-[11px] text-slate-500 uppercase tracking-[0.28em]">{title}</h2>
      <Link
        to={linkTo}
        className="text-xs font-semibold text-green-500 hover:text-green-400 transition-colors flex items-center gap-1 group"
      >
        {linkLabel}
        <svg className="size-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

/* Decorative trophy + pitch lines illustration for the hero */
function HeroIllustration() {
  return (
    <div className="relative size-full flex items-center justify-center pointer-events-none select-none">
      <svg viewBox="0 0 280 220" className="size-full max-h-[220px]" aria-hidden>
        <defs>
          <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trophy-gold" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Glow */}
        <circle cx="140" cy="120" r="92" fill="url(#hero-glow)" />

        {/* Pitch arcs */}
        <g stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none">
          <circle cx="140" cy="120" r="56" />
          <circle cx="140" cy="120" r="80" strokeDasharray="2 4" />
        </g>

        {/* Trophy cup */}
        <g transform="translate(0,6)">
          <path
            d="M108 42 h64 v20 a32 32 0 0 1 -32 32 a32 32 0 0 1 -32 -32 z"
            fill="url(#trophy-gold)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
          />
          {/* Handles */}
          <path d="M108 52 c -12 0 -16 16 -4 22" stroke="#f59e0b" strokeWidth="3" fill="none" />
          <path d="M172 52 c 12 0 16 16 4 22" stroke="#f59e0b" strokeWidth="3" fill="none" />
          {/* Stem */}
          <rect x="135" y="94" width="10" height="24" fill="#b45309" />
          {/* Base */}
          <rect x="118" y="118" width="44" height="6" rx="2" fill="#92400e" />
          <rect x="112" y="124" width="56" height="10" rx="2" fill="url(#trophy-gold)" />
          {/* Shine */}
          <path d="M124 48 l8 0 l-4 18 z" fill="rgba(255,255,255,0.35)" />
        </g>

        {/* Mini ball */}
        <g transform="translate(60,162)">
          <circle r="14" fill="#0F172A" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <polygon points="0,-6 5,-2 3,4 -3,4 -5,-2" fill="rgba(255,255,255,0.85)" />
        </g>
        <g transform="translate(225,150)" opacity="0.7">
          <circle r="10" fill="#0F172A" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <polygon points="0,-4 4,-1 2,3 -2,3 -4,-1" fill="rgba(255,255,255,0.7)" />
        </g>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const t = useT();

  const { data: upcomingData, isLoading: loadingMatches } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: () => matchesApi.getUpcoming(),
  });

  const { data: leaguesData, isLoading: loadingLeagues } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => leaguesApi.getAll(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => predictionsApi.getStats(),
  });

  const stats = statsData?.data.stats;
  const matches = upcomingData?.data.matches.slice(0, 6) ?? [];
  const leagues = leaguesData?.data.leagues.slice(0, 6) ?? [];

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-10 animate-fade-up">
      <section
        className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[#0B1220]/85 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.75)]"
        style={{
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(900px 280px at 50% 0%, rgba(34,197,94,0.16), transparent 55%),' +
              'radial-gradient(500px 180px at 90% 20%, rgba(59,130,246,0.08), transparent 60%),' +
              'radial-gradient(500px 180px at 0% 110%, rgba(34,197,94,0.05), transparent 60%)',
          }}
        />

        <div className="relative grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-center lg:px-10 lg:py-12">
          <div className="space-y-6 text-center lg:text-left">
            <div>
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.32em] text-green-400/90">
                {t('dashboard.eyebrow')}
              </p>
              <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {t('dashboard.welcome')} <span className="text-green-400">{user?.username}</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-[15px] lg:mx-0">
                {t('dashboard.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] btn-glow"
                style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #16a34a 100%)',
                  boxShadow: '0 8px 28px -10px rgba(34,197,94,0.6)',
                }}
              >
                <Icon name="target" size={16} />
                {t('dashboard.predictCta')}
              </Link>
              <Link
                to="/standings"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Icon name="trophy" size={16} />
                {t('nav.standings')}
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[420px]">
              <HeroIllustration />
            </div>
          </div>
        </div>

        {stats && (
          <div className="relative px-6 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5 stagger">
              <StatCard label={t('stats.points')} value={stats.total_points} sublabel={t('stats.totalEarned')} accent="text-green-400" icon="zap" />
              <StatCard label={t('stats.predictions')} value={stats.total_predictions} sublabel={t('stats.submitted')} accent="text-white" icon="target" to="/predictions" />
              <StatCard label={t('stats.exactScores')} value={stats.exact_scores} sublabel={t('stats.exactSub')} accent="text-amber-400" icon="award" />
              <StatCard label={t('stats.correct')} value={stats.correct_outcomes} sublabel={t('stats.outcomes')} accent="text-blue-400" icon="check" />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader title={t('dashboard.upcomingMatches')} linkTo="/matches" linkLabel={t('dashboard.viewAll')} />
        {loadingMatches ? (
          <div className="flex justify-center py-14">
            <Spinner size="lg" />
          </div>
        ) : matches.length === 0 ? (
          <div
            className="rounded-[28px] border border-white/8 bg-[#0F172A] px-8 py-12 text-center text-sm text-slate-500"
            style={{ boxShadow: '0 6px 24px -10px rgba(0,0,0,0.45)' }}
          >
            {t('dashboard.noUpcoming')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {matches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader title={t('dashboard.myLeagues')} linkTo="/leagues" linkLabel={t('dashboard.viewAll')} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="rounded-[28px] border border-white/8 bg-[#0F172A]/90 p-5 sm:p-6" style={{ boxShadow: '0 6px 24px -10px rgba(0,0,0,0.45)' }}>
            {loadingLeagues ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : leagues.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className="flex min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-white/8 bg-white/[0.02] px-6 py-8 text-center"
                >
                  <div
                    className="mb-4 flex size-14 items-center justify-center rounded-2xl text-slate-400"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Icon name="medal" size={26} />
                  </div>
                  <p className="font-heading text-lg font-bold text-white">{t('dashboard.emptyLeaguesTitle')}</p>
                  <p className="mt-2 max-w-xs text-sm text-slate-500">{t('dashboard.emptyLeaguesSubtitle')}</p>
                  <Link
                    to="/leagues"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white btn-glow"
                    style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16a34a 100%)' }}
                  >
                    {t('dashboard.inviteCreate')}
                  </Link>
                </div>

                <div
                  className="flex min-h-[240px] flex-col justify-between rounded-[24px] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-[#0F172A] px-6 py-8"
                >
                  <div>
                    <div
                      className="mb-4 flex size-12 items-center justify-center rounded-xl text-sky-300"
                      style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
                    >
                      <Icon name="medal" size={22} />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white">{t('dashboard.inviteTitle')}</h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-400">{t('dashboard.inviteSubtitle')}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/leagues"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)',
                        boxShadow: '0 8px 24px -10px rgba(59,130,246,0.55)',
                      }}
                    >
                      {t('dashboard.inviteCreate')}
                    </Link>
                    <Link
                      to="/leagues"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {t('dashboard.inviteJoin')}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {leagues.slice(0, 4).map((league) => <LeagueCard key={league.id} league={league} />)}
              </div>
            )}
          </div>

          <div
            className="relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-[#0F172A] to-[#0B1220] px-6 py-7 sm:px-7 sm:py-8"
            style={{ boxShadow: '0 6px 24px -10px rgba(0,0,0,0.45)' }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.95) 0%, transparent 70%)' }}
            />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div
                  className="mb-4 flex size-12 items-center justify-center rounded-xl text-sky-300"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
                >
                  <Icon name="medal" size={22} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{t('dashboard.inviteTitle')}</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-400">{t('dashboard.inviteSubtitle')}</p>
              </div>

              <div className="mt-7 rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                  {t('leagueDetail.inviteCode')}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-score text-4xl leading-none text-green-400">TRB-7XK3</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-green-400 transition-colors hover:bg-white/[0.05]"
                    style={{ border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <Icon name="copy" size={16} />
                    {t('leagueDetail.copy')}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/leagues"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)',
                    boxShadow: '0 8px 24px -10px rgba(59,130,246,0.55)',
                  }}
                >
                  {t('dashboard.inviteCreate')}
                </Link>
                <Link
                  to="/leagues"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {t('dashboard.inviteJoin')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
