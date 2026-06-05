import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { useAuthStore } from '../store/auth';
import { useLanguageStore, useT } from '../store/language';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import { Icon, type IconName } from '../components/ui/Icon';
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

  const chartData = [{ value: accuracy, fill: '#8B1E1E' }];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Profile hero */}
      <div className="bg-white border border-[#D9D4CC] rounded-lg px-6 py-7">
        <div className="flex items-center gap-5">
          <div className="size-16 sm:size-20 rounded-lg bg-[#8B1E1E] flex items-center justify-center text-2xl sm:text-3xl font-black text-white font-heading shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#111111] truncate">{user?.username}</h1>
            <p className="text-[#666666] truncate mt-0.5">{user?.email}</p>
            {user?.created_at && (
              <p className="text-xs text-[#999390] mt-1.5 font-heading uppercase tracking-widest">
                {t('profile.memberSince')} {format(new Date(user.created_at), 'MMMM yyyy', { locale: dateLocale })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {loadingStats ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {([
            { label: t('stats.totalPoints'), value: stats.total_points, icon: 'zap' as IconName, sub: t('stats.earned'), highlight: true },
            { label: t('stats.predictions'), value: stats.total_predictions, icon: 'target' as IconName, sub: t('stats.submitted') },
            { label: t('stats.exactScores'), value: stats.exact_scores, icon: 'award' as IconName, sub: t('stats.exactSub') },
            { label: t('stats.correctOutcomes'), value: stats.correct_outcomes, icon: 'check' as IconName, sub: t('stats.correctSub') },
          ]).map(({ label, value, icon, sub, highlight }) => (
            <div key={label} className="bg-white border border-[#D9D4CC] rounded-lg p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#999390] font-heading">{label}</span>
                <span className={highlight ? 'text-[#8B1E1E]' : 'text-[#999390]'}>
                  <Icon name={icon} size={16} />
                </span>
              </div>
              <span className={`font-display text-5xl leading-none ${highlight ? 'text-[#8B1E1E]' : 'text-[#111111]'}`}>{value}</span>
              <span className="text-xs text-[#999390]">{sub}</span>
            </div>
          ))}

          {/* Accuracy donut */}
          <div className="bg-white border border-[#D9D4CC] rounded-lg p-5 flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#999390] font-heading">{t('stats.accuracy')}</span>
            <div className="flex items-center gap-6">
              <div className="relative size-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="72%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#F2EFE9' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl leading-none text-[#111111]">{accuracy}%</span>
                </div>
              </div>
              <div>
                <p className="text-[#666666] text-sm">
                  {stats.total_predictions > 0
                    ? `${stats.correct_outcomes} ${t('stats.ofCorrect', { total: stats.total_predictions })}`
                    : t('stats.noPredictions')}
                </p>
                <p className="text-xs text-[#999390] mt-1">{t('stats.outcomeAccuracy')}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Leagues */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[11px] font-bold text-[#999390] uppercase tracking-[0.28em] font-heading">{t('profile.myLeagues')}</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2EFE9] border border-[#E8E4DE] text-[#666666]">
            {leagues.length}
          </span>
        </div>
        {loadingLeagues ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : leagues.length === 0 ? (
          <div className="bg-white border border-[#D9D4CC] rounded-lg p-10 text-center text-[#999390] text-sm">
            {t('profile.noLeagues')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
          </div>
        )}
      </section>
    </div>
  );
}
