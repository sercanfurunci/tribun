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
  icon: IconName;
  to?: string;
  highlight?: boolean;
}

function StatCard({ label, value, sublabel, icon, to, highlight }: StatCardProps) {
  const inner = (
    <>
      <div className="flex items-center gap-1.5 text-[#999390] min-w-0 w-full justify-center">
        <Icon name={icon} size={14} className="shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] font-heading truncate">{label}</span>
      </div>
      <span className={`font-display text-5xl sm:text-6xl leading-none ${highlight ? 'text-[#8B1E1E]' : 'text-[#111111]'}`}>
        {value}
      </span>
      {sublabel && <p className="text-[11px] text-[#999390] truncate w-full">{sublabel}</p>}
    </>
  );

  const cls = "bg-white border border-[#D9D4CC] rounded-lg p-5 sm:p-6 flex flex-col items-center justify-between text-center gap-3 min-h-[140px] transition-colors duration-150";

  if (to) {
    return (
      <Link to={to} className={`${cls} hover:border-[#B8B2AA] hover:bg-[#FAFAFA]`}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-heading font-black text-[11px] text-[#999390] uppercase tracking-[0.28em]">{title}</h2>
      <Link
        to={linkTo}
        className="text-xs font-semibold text-[#8B1E1E] hover:text-[#6F1717] transition-colors flex items-center gap-1 group"
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
    <div className="mx-auto w-full max-w-[1280px] space-y-10 animate-fade-up">
      {/* Hero */}
      <section className="bg-white border border-[#D9D4CC] rounded-lg px-6 py-8 sm:px-8 sm:py-10">
        <p className="font-heading font-black text-[11px] uppercase tracking-[0.3em] text-[#8B1E1E] mb-3">
          {t('dashboard.eyebrow')}
        </p>
        <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#111111] mb-3">
          {t(user?.created_at && Date.now() - new Date(user.created_at).getTime() < 24 * 60 * 60 * 1000 ? 'dashboard.welcomeNew' : 'dashboard.welcome')}{' '}
          <span className="text-[#8B1E1E]">{user?.username}</span>
        </h1>
        <p className="text-sm text-[#666666] mb-7 max-w-xl">
          {t('dashboard.subtitle')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-white bg-[#8B1E1E] hover:bg-[#6F1717] border border-[#8B1E1E] transition-colors duration-150"
          >
            <Icon name="target" size={15} />
            {t('dashboard.predictCta')}
          </Link>
          <Link
            to="/standings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-[#111111] bg-white hover:bg-[#F2EFE9] border border-[#D9D4CC] hover:border-[#B8B2AA] transition-colors duration-150"
          >
            <Icon name="trophy" size={15} />
            {t('nav.standings')}
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mt-8 pt-8 border-t border-[#E8E4DE]">
            <StatCard label={t('stats.points')} value={stats.total_points} sublabel={t('stats.totalEarned')} icon="zap" highlight />
            <StatCard label={t('stats.predictions')} value={stats.total_predictions} sublabel={t('stats.submitted')} icon="target" to="/predictions" />
            <StatCard label={t('stats.exactScores')} value={stats.exact_scores} sublabel={t('stats.exactSub')} icon="award" />
            <StatCard label={t('stats.correct')} value={stats.correct_outcomes} sublabel={t('stats.outcomes')} icon="check" />
          </div>
        )}
      </section>

      {/* Upcoming matches */}
      <section className="space-y-4">
        <SectionHeader title={t('dashboard.upcomingMatches')} linkTo="/matches" linkLabel={t('dashboard.viewAll')} />
        {loadingMatches ? (
          <div className="flex justify-center py-14">
            <Spinner size="lg" />
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white border border-[#D9D4CC] rounded-lg px-8 py-12 text-center text-sm text-[#999390]">
            {t('dashboard.noUpcoming')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {matches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        )}
      </section>

      {/* My leagues */}
      <section className="space-y-4">
        <SectionHeader title={t('dashboard.myLeagues')} linkTo="/leagues" linkLabel={t('dashboard.viewAll')} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="bg-white border border-[#D9D4CC] rounded-lg p-5 sm:p-6">
            {loadingLeagues ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : leagues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-12 rounded-lg bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center text-[#999390] mb-4">
                  <Icon name="medal" size={22} />
                </div>
                <p className="font-heading font-black text-base text-[#111111]">{t('dashboard.emptyLeaguesTitle')}</p>
                <p className="mt-2 max-w-xs text-sm text-[#666666]">{t('dashboard.emptyLeaguesSubtitle')}</p>
                <Link
                  to="/leagues"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-white bg-[#8B1E1E] hover:bg-[#6F1717] border border-[#8B1E1E] transition-colors duration-150"
                >
                  {t('dashboard.inviteCreate')}
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {leagues.slice(0, 4).map((league) => <LeagueCard key={league.id} league={league} />)}
              </div>
            )}
          </div>

          {/* Invite card */}
          <div className="bg-white border border-[#D9D4CC] rounded-lg px-6 py-7 flex flex-col justify-between">
            <div>
              <div className="size-10 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#8B1E1E] mb-4">
                <Icon name="medal" size={20} />
              </div>
              <h3 className="font-heading font-black text-lg text-[#111111]">{t('dashboard.inviteTitle')}</h3>
              <p className="mt-2 text-sm text-[#666666]">{t('dashboard.inviteSubtitle')}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/leagues"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold text-white bg-[#8B1E1E] hover:bg-[#6F1717] border border-[#8B1E1E] transition-colors duration-150"
              >
                {t('dashboard.inviteCreate')}
              </Link>
              <Link
                to="/leagues"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold text-[#111111] bg-white hover:bg-[#F2EFE9] border border-[#D9D4CC] hover:border-[#B8B2AA] transition-colors duration-150"
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
