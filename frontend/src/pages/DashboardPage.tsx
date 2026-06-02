import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { matchesApi } from '../services/matches';
import { leaguesApi } from '../services/leagues';
import { predictionsApi } from '../services/predictions';
import { MatchCard } from '../components/features/MatchCard';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import { Card, CardBody } from '../components/ui/Card';

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
        <span className={`text-3xl font-bold ${accent || 'text-white'}`}>{value}</span>
      </CardBody>
    </Card>
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-slate-400 text-sm">Here's what's happening in your leagues</p>
      </div>

      {stats && (
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Your Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Points" value={stats.total_points} accent="text-green-400" />
            <StatCard label="Predictions" value={stats.total_predictions} />
            <StatCard label="Exact Scores" value={stats.exact_scores} accent="text-amber-400" />
            <StatCard label="Correct Outcomes" value={stats.correct_outcomes} accent="text-blue-400" />
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Upcoming Matches</h2>
          <Link to="/matches" className="text-sm text-green-400 hover:text-green-300">View all →</Link>
        </div>
        {loadingMatches ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : matches.length === 0 ? (
          <Card><CardBody className="text-center text-slate-500 py-8">No upcoming matches</CardBody></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">My Leagues</h2>
          <Link to="/leagues" className="text-sm text-green-400 hover:text-green-300">View all →</Link>
        </div>
        {loadingLeagues ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : leagues.length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-slate-500 mb-3">You haven't joined any leagues yet</p>
              <Link to="/leagues" className="text-green-400 hover:text-green-300 text-sm font-medium">
                Join or create a league →
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
          </div>
        )}
      </section>
    </div>
  );
}
