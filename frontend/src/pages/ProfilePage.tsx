import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuthStore } from '../store/auth';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { Card, CardBody } from '../components/ui/Card';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

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
    <div className="max-w-3xl mx-auto space-y-6">
      <Card variant="elevated">
        <CardBody className="flex items-center gap-5">
          <div className="size-16 rounded-full bg-green-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.username}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
            {user?.created_at && (
              <p className="text-xs text-slate-600 mt-1">
                Member since {format(new Date(user.created_at), 'MMMM yyyy')}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {loadingStats ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardBody>
              <h2 className="text-sm font-medium text-slate-400 mb-4">Prediction Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Points', value: stats.total_points, color: 'text-green-400' },
                  { label: 'Predictions', value: stats.total_predictions, color: 'text-white' },
                  { label: 'Exact Scores', value: stats.exact_scores, color: 'text-amber-400' },
                  { label: 'Correct Outcomes', value: stats.correct_outcomes, color: 'text-blue-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className={`text-2xl font-bold ${color}`}>{value}</span>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col items-center">
              <h2 className="text-sm font-medium text-slate-400 mb-2 self-start">Accuracy</h2>
              <div className="relative size-36">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#1e293b' }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{accuracy}%</span>
                  <span className="text-xs text-slate-500">accuracy</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Leagues ({leagues.length})
        </h2>
        {loadingLeagues ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : leagues.length === 0 ? (
          <Card><CardBody className="text-center text-slate-500 py-8">No leagues joined yet</CardBody></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
          </div>
        )}
      </section>
    </div>
  );
}
