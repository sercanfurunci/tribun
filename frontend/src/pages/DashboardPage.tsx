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
      className="rounded-2xl p-6 flex flex-col items-center text-center gap-3 min-w-0"
      style={{
        background: 'linear-gradient(180deg, rgba(18,30,52,0.95) 0%, rgba(12,22,40,0.92) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 6px 24px -10px rgba(0,0,0,0.45)',
      }}
    >
      <div className={`flex items-center gap-1.5 ${accent}`}>
        <Icon name={icon} size={16} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 font-heading">{label}</span>
      </div>
      <span className={`font-score text-5xl sm:text-6xl leading-none ${accent}`}>{value}</span>
      {sublabel && <p className="text-xs text-slate-600 truncate w-full">{sublabel}</p>}
    </div>
  );
}

function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
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
    <div className="space-y-8 sm:space-y-12 animate-fade-up">

      {/* Hero — centered greeting */}
      <div
        className="relative rounded-2xl overflow-hidden text-center px-6 sm:px-8 py-9 sm:py-12"
        style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.18) 0%, rgba(12,22,40,0.95) 60%)',
          border: '1px solid rgba(22,163,74,0.2)',
          boxShadow: '0 10px 40px -16px rgba(0,0,0,0.5)',
        }}
      >
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
        />
        <div className="relative">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
            {t('dashboard.welcome')} <span className="text-green-400">{user?.username}</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-[15px] mt-2 max-w-md mx-auto">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Upcoming matches */}
      <section>
        <SectionHeader title={t('dashboard.upcomingMatches')} linkTo="/matches" linkLabel={t('dashboard.viewAll')} />
        {loadingMatches ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : matches.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center text-slate-600 text-sm"
            style={{
              background: 'linear-gradient(180deg, rgba(18,30,52,0.6) 0%, rgba(12,22,40,0.6) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {t('dashboard.noUpcoming')}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        )}
      </section>

      {/* My leagues */}
      <section>
        <SectionHeader title={t('dashboard.myLeagues')} linkTo="/leagues" linkLabel={t('dashboard.viewAll')} />
        {loadingLeagues ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : leagues.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(18,30,52,0.6) 0%, rgba(12,22,40,0.6) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-slate-600 text-sm mb-4">{t('dashboard.noLeagues')}</p>
            <Link
              to="/leagues"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
            >
              {t('dashboard.createOrJoin')}
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
          </div>
        )}
      </section>
    </div>
  );
}
