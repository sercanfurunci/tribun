import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuthStore } from '../store/auth';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface StatRowProps {
  label: string;
  value: number | string;
  accent: string;
  icon: string;
}

function StatRow({ label, value, accent, icon }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className={`font-score text-2xl leading-none ${accent}`}>{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['stats', 'profile'],
    queryFn: () => predictionsApi.getStats(),
  });

  const { data: leaguesData, isLoading: loadingLeagues } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => leaguesApi.getAll(),
  });

  const stats = statsData?.data.stats;
  const leagues = leaguesData?.data.leagues ?? [];

  const accuracy = stats && stats.total_predictions > 0
    ? Math.round((stats.correct_outcomes / stats.total_predictions) * 100)
    : 0;

  const chartData = [{ value: accuracy, fill: '#16a34a' }];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">

      {/* Profile hero card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(12,22,40,0.95) 60%)',
          border: '1px solid rgba(22,163,74,0.2)',
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
        />
        <div className="px-6 py-6 flex items-center gap-5">
          <div
            className="size-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white font-heading shrink-0"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: '0 0 24px rgba(22,163,74,0.4)',
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-xl text-white truncate">{user?.username}</h1>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            {user?.created_at && (
              <p className="text-xs text-slate-600 mt-1 font-heading">
                Member since {format(new Date(user.created_at), 'MMMM yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {loadingStats ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stat rows */}
          <div
            className="rounded-2xl px-5 py-2"
            style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-heading pt-3 pb-1">Prediction Stats</p>
            <StatRow label="Total Points" value={stats.total_points} accent="text-green-400" icon="⚡" />
            <StatRow label="Predictions Made" value={stats.total_predictions} accent="text-white" icon="🎯" />
            <StatRow label="Exact Scores" value={stats.exact_scores} accent="text-amber-400" icon="🥇" />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <span className="text-base">✓</span>
                <span className="text-sm text-slate-400">Correct Outcomes</span>
              </div>
              <span className="font-score text-2xl leading-none text-blue-400">{stats.correct_outcomes}</span>
            </div>
          </div>

          {/* Accuracy donut */}
          <div
            className="rounded-2xl px-5 py-5 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-heading self-start">Accuracy</p>
            <div className="relative size-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={chartData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.04)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-score text-4xl leading-none text-white">{accuracy}%</span>
                <span className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-heading">accuracy</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center">
              {stats.total_predictions > 0
                ? `${stats.correct_outcomes} of ${stats.total_predictions} correct`
                : 'No predictions yet'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Leagues */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-heading">
            My Leagues
          </h2>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
          >
            {leagues.length}
          </span>
        </div>
        {loadingLeagues ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : leagues.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center text-slate-600 text-sm"
            style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            No leagues joined yet
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
          </div>
        )}
      </section>
    </div>
  );
}
