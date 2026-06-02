import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { useAuthStore } from '../store/auth';
import { useLanguageStore, useT } from '../store/language';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);
  const dateLocale = lang === 'tr' ? trLocale : enUS;

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
    <div className="space-y-6 animate-fade-up">

      {/* Profile hero */}
      <div
        className="relative rounded-2xl overflow-hidden px-6 py-8"
        style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(12,22,40,0.95) 60%)',
          border: '1px solid rgba(22,163,74,0.2)',
        }}
      >
        <div
          className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
        />
        <div className="flex items-center gap-5">
          <div
            className="size-16 sm:size-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white font-heading shrink-0"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: '0 0 28px rgba(22,163,74,0.4)',
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white truncate">{user?.username}</h1>
            <p className="text-slate-500 truncate mt-0.5">{user?.email}</p>
            {user?.created_at && (
              <p className="text-xs text-slate-600 mt-1.5 font-heading uppercase tracking-widest">
                {t('profile.memberSince')} {format(new Date(user.created_at), 'MMMM yyyy', { locale: dateLocale })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {loadingStats ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Stat cards */}
          {[
            { label: t('stats.totalPoints'), value: stats.total_points, accent: 'text-green-400', icon: '⚡', sub: t('stats.earned') },
            { label: t('stats.predictions'), value: stats.total_predictions, accent: 'text-white', icon: '🎯', sub: t('stats.submitted') },
            { label: t('stats.exactScores'), value: stats.exact_scores, accent: 'text-amber-400', icon: '🥇', sub: t('stats.exactSub') },
            { label: t('stats.correctOutcomes'), value: stats.correct_outcomes, accent: 'text-blue-400', icon: '✓', sub: t('stats.correctSub') },
          ].map(({ label, value, accent, icon, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: 'linear-gradient(180deg, rgba(18,30,52,0.95) 0%, rgba(12,22,40,0.92) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-heading">{label}</span>
                <span className="text-lg">{icon}</span>
              </div>
              <span className={`font-score text-5xl leading-none ${accent}`}>{value}</span>
              <span className="text-xs text-slate-600">{sub}</span>
            </div>
          ))}

          {/* Accuracy donut */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-3 sm:col-span-2 lg:col-span-1"
            style={{
              background: 'linear-gradient(180deg, rgba(18,30,52,0.95) 0%, rgba(12,22,40,0.92) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-heading">{t('stats.accuracy')}</span>
            <div className="flex items-center gap-6">
              <div className="relative size-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="72%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.04)' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-score text-3xl leading-none text-white">{accuracy}%</span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm">
                  {stats.total_predictions > 0
                    ? `${stats.correct_outcomes} ${t('stats.ofCorrect', { total: stats.total_predictions })}`
                    : t('stats.noPredictions')}
                </p>
                <p className="text-xs text-slate-600 mt-1">{t('stats.outcomeAccuracy')}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Leagues */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-heading">{t('profile.myLeagues')}</h2>
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
            className="rounded-2xl p-10 text-center text-slate-600 text-sm"
            style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {t('profile.noLeagues')}
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
