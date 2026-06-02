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
}

function StatCard({ label, value, sublabel, accent, icon }: StatCardProps) {
  return (
    <div
      className="rounded-[20px] p-6 flex flex-col items-center text-center gap-3 min-w-0"
      style={{
        background: '#0F172A',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 6px 24px -10px rgba(0,0,0,0.45)',
      }}
    >
      <div className={`flex items-center gap-1.5 ${accent}`}>
        <Icon name={icon} size={16} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 font-heading">{label}</span>
      </div>
      <span className={`font-score text-5xl sm:text-6xl leading-none ${accent}`}>{value}</span>
      {sublabel && <p className="text-xs text-slate-500 truncate w-full">{sublabel}</p>}
    </div>
  );
}

function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-widest">{title}</h2>
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
      <svg viewBox="0 0 280 200" className="size-full max-h-[180px]" aria-hidden>
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
        <circle cx="140" cy="110" r="90" fill="url(#hero-glow)" />

        {/* Pitch arcs */}
        <g stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none">
          <circle cx="140" cy="110" r="55" />
          <circle cx="140" cy="110" r="78" strokeDasharray="2 4" />
        </g>

        {/* Trophy cup */}
        <g>
          <path
            d="M110 40 h60 v20 a30 30 0 0 1 -30 30 a30 30 0 0 1 -30 -30 z"
            fill="url(#trophy-gold)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
          />
          {/* Handles */}
          <path d="M110 50 c -12 0 -16 16 -4 22" stroke="#f59e0b" strokeWidth="3" fill="none" />
          <path d="M170 50 c 12 0 16 16 4 22" stroke="#f59e0b" strokeWidth="3" fill="none" />
          {/* Stem */}
          <rect x="135" y="90" width="10" height="22" fill="#b45309" />
          {/* Base */}
          <rect x="118" y="112" width="44" height="6" rx="2" fill="#92400e" />
          <rect x="112" y="118" width="56" height="10" rx="2" fill="url(#trophy-gold)" />
          {/* Shine */}
          <path d="M124 46 l8 0 l-4 18 z" fill="rgba(255,255,255,0.35)" />
        </g>

        {/* Mini ball */}
        <g transform="translate(60,150)">
          <circle r="14" fill="#0F172A" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <polygon points="0,-6 5,-2 3,4 -3,4 -5,-2" fill="rgba(255,255,255,0.85)" />
        </g>
        <g transform="translate(225,140)" opacity="0.7">
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
    <div className="space-y-12 animate-fade-up">

      {/* Hero — 2 columns on lg+, stacked on smaller; 160–220px range */}
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{
          background:
            'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, #0F172A 60%)',
          border: '1px solid rgba(34,197,94,0.22)',
          boxShadow: '0 10px 40px -16px rgba(0,0,0,0.5)',
        }}
      >
        {/* Stadium-light streaks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(800px 220px at 90% -20%, rgba(34,197,94,0.18), transparent 60%),' +
              'radial-gradient(500px 180px at 0% 120%, rgba(59,130,246,0.10), transparent 60%)',
          }}
        />
        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 items-center px-6 sm:px-8 py-7 sm:py-9 min-h-[160px]">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-[2.25rem] text-white leading-tight">
              {t('dashboard.welcome')} <span className="text-green-400">{user?.username}</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-[15px] mt-2 max-w-lg">{t('dashboard.subtitle')}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] btn-glow"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Icon name="trophy" size={16} />
                {t('nav.standings')}
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Statistics — 4 desktop / 2x2 tablet & mobile */}
      {stats && (
        <section>
          <SectionHeader title={t('dashboard.yourStats')} linkTo="/profile" linkLabel={t('dashboard.fullProfile')} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            <StatCard label={t('stats.points')} value={stats.total_points} sublabel={t('stats.totalEarned')} accent="text-green-400" icon="zap" />
            <StatCard label={t('stats.predictions')} value={stats.total_predictions} sublabel={t('stats.submitted')} accent="text-white" icon="target" />
            <StatCard label={t('stats.exactScores')} value={stats.exact_scores} sublabel={t('stats.exactSub')} accent="text-amber-400" icon="award" />
            <StatCard label={t('stats.correct')} value={stats.correct_outcomes} sublabel={t('stats.outcomes')} accent="text-blue-400" icon="check" />
          </div>
        </section>
      )}

      {/* Upcoming Matches — 3 desktop / 2 tablet / 1 mobile */}
      <section>
        <SectionHeader title={t('dashboard.upcomingMatches')} linkTo="/matches" linkLabel={t('dashboard.viewAll')} />
        {loadingMatches ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : matches.length === 0 ? (
          <div
            className="rounded-[20px] p-10 text-center text-slate-500 text-sm flex items-center justify-center min-h-[240px]"
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {t('dashboard.noUpcoming')}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        )}
      </section>

      {/* Leagues — 2 columns on desktop: leagues/empty + invite card */}
      <section>
        <SectionHeader title={t('dashboard.myLeagues')} linkTo="/leagues" linkLabel={t('dashboard.viewAll')} />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: leagues or empty state */}
          {loadingLeagues ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : leagues.length === 0 ? (
            <div
              className="rounded-[20px] p-8 flex flex-col items-center justify-center text-center min-h-[260px]"
              style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="size-14 rounded-2xl flex items-center justify-center text-slate-400 mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Icon name="medal" size={26} />
              </div>
              <p className="font-heading font-bold text-white mb-1">{t('dashboard.emptyLeaguesTitle')}</p>
              <p className="text-slate-500 text-sm max-w-xs">{t('dashboard.emptyLeaguesSubtitle')}</p>
              <Link
                to="/leagues"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-glow"
                style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16a34a 100%)' }}
              >
                {t('dashboard.inviteCreate')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {leagues.slice(0, 4).map((league) => <LeagueCard key={league.id} league={league} />)}
            </div>
          )}

          {/* Right: Invite Friends card */}
          <div
            className="relative rounded-[20px] p-8 overflow-hidden min-h-[260px] flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.10) 0%, #0F172A 60%)',
              border: '1px solid rgba(59,130,246,0.18)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
            />
            <div className="relative">
              <div
                className="size-12 rounded-xl flex items-center justify-center text-blue-300 mb-4"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
              >
                <Icon name="medal" size={22} />
              </div>
              <h3 className="font-heading font-bold text-xl text-white">{t('dashboard.inviteTitle')}</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-sm">{t('dashboard.inviteSubtitle')}</p>
            </div>
            <div className="relative flex flex-wrap gap-3 mt-6">
              <Link
                to="/leagues"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)',
                  boxShadow: '0 8px 24px -10px rgba(59,130,246,0.55)',
                }}
              >
                {t('dashboard.inviteCreate')}
              </Link>
              <Link
                to="/leagues"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {t('dashboard.inviteJoin')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
