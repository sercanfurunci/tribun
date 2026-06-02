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
  sublabel?: string;
  accent: string;
  icon: string;
}

function StatCard({ label, value, sublabel, accent, icon }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(12,22,40,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-heading">{label}</span>
        <span className="text-xl leading-none">{icon}</span>
      </div>
      <div>
        <span className={`font-score text-5xl leading-none ${accent}`}>{value}</span>
        {sublabel && <p className="text-xs text-slate-600 mt-1.5">{sublabel}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, linkTo, linkLabel = 'View all' }: { title: string; linkTo: string; linkLabel?: string }) {
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

      {/* Hero */}
      <div
        className="relative rounded-2xl overflow-hidden px-6 py-8"
        style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.18) 0%, rgba(12,22,40,0.95) 55%)',
          border: '1px solid rgba(22,163,74,0.2)',
        }}
      >
        <div
          className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 0, transparent 50%)`,
            backgroundSize: '8px 8px',
          }}
        />
        <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2 font-heading">Dashboard</p>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white leading-tight">
          Welcome back,<br />
          <span className="text-green-400">{user?.username}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-2">Track your predictions and climb the leaderboard.</p>
      </div>

      {/* Stats */}
      {stats && (
        <section>
          <SectionHeader title="Your Stats" linkTo="/profile" linkLabel="Full profile" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
            <StatCard label="Points" value={stats.total_points} sublabel="total earned" accent="text-green-400" icon="⚡" />
            <StatCard label="Predictions" value={stats.total_predictions} sublabel="submitted" accent="text-white" icon="🎯" />
            <StatCard label="Exact Scores" value={stats.exact_scores} sublabel="3 pts each" accent="text-amber-400" icon="🥇" />
            <StatCard label="Correct" value={stats.correct_outcomes} sublabel="outcomes" accent="text-blue-400" icon="✓" />
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      <section>
        <SectionHeader title="Upcoming Matches" linkTo="/matches" />
        {loadingMatches ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : matches.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center text-slate-600 text-sm"
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
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-slate-600 text-sm mb-4">No leagues yet</p>
            <Link
              to="/leagues"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
            >
              Create or join a league
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
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
