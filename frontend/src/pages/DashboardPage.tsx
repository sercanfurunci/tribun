import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { matchesApi } from '../services/matches';
import { leaguesApi } from '../services/leagues';
import { predictionsApi } from '../services/predictions';
import { MatchCard } from '../components/features/MatchCard';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(12, 22, 40, 0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <span className={`font-score text-4xl leading-none ${color}`}>{value}</span>
    </div>
  );
}

function SectionHeader({ title, linkTo, linkLabel = 'View all' }: { title: string; linkTo: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-heading font-semibold text-sm text-slate-400 uppercase tracking-widest">{title}</h2>
      <Link
        to={linkTo}
        className="text-xs text-green-500 hover:text-green-400 font-semibold transition-colors flex items-center gap-1"
      >
        {linkLabel}
        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

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
  const matches = upcomingData?.data.matches.slice(0, 3) ?? [];
  const leagues = leaguesData?.data.leagues.slice(0, 3) ?? [];

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Hero greeting */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(12,22,40,0.8) 60%)',
          border: '1px solid rgba(22,163,74,0.2)',
        }}
      >
        <div
          className="absolute right-0 top-0 w-48 h-48 opacity-10 rounded-bl-full"
          style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
        />
        <p className="text-xs text-green-500 font-semibold uppercase tracking-widest mb-1 font-heading">Dashboard</p>
        <h1 className="font-heading font-bold text-2xl text-white">
          Welcome back, {user?.username}
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's your prediction overview</p>
      </div>

      {/* Stats */}
      {stats && (
        <section>
          <SectionHeader title="Your Stats" linkTo="/profile" linkLabel="Full profile" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Points" value={stats.total_points} color="text-green-400" icon="⚡" />
            <StatCard label="Predictions" value={stats.total_predictions} color="text-white" icon="🎯" />
            <StatCard label="Exact Scores" value={stats.exact_scores} color="text-amber-400" icon="🥇" />
            <StatCard label="Correct" value={stats.correct_outcomes} color="text-blue-400" icon="✓" />
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      <section>
        <SectionHeader title="Upcoming Matches" linkTo="/matches" />
        {loadingMatches ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : matches.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center text-slate-600 text-sm"
            style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            No upcoming matches scheduled
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        )}
      </section>

      {/* My leagues */}
      <section>
        <SectionHeader title="My Leagues" linkTo="/leagues" />
        {loadingLeagues ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : leagues.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-slate-600 text-sm mb-4">No leagues yet</p>
            <Link
              to="/leagues"
              className="text-sm text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              Create or join a league →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
          </div>
        )}
      </section>
    </div>
  );
}
