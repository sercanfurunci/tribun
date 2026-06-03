import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { matchesApi } from '../services/matches';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { footballApi, FixtureEvent, InjuryEntry, TeamStatistics, H2HFixture } from '../services/football';
import { PredictionForm } from '../components/features/PredictionForm';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useAuthStore } from '../store/auth';
import { useLanguageStore, useT } from '../store/language';
import { Icon, type IconName } from '../components/ui/Icon';
import { formatMatchDay, formatTeamName } from '../lib/matchDisplay';
import type { TranslationKey } from '../i18n/translations';

const STATUS_CONFIG: Record<string, { labelKey: TranslationKey; variant: 'blue' | 'live' | 'slate' | 'yellow' }> = {
  scheduled: { labelKey: 'matchDetail.upcoming', variant: 'blue' },
  live: { labelKey: 'matchDetail.live', variant: 'live' },
  finished: { labelKey: 'match.ftBadge', variant: 'slate' },
  postponed: { labelKey: 'matchDetail.postponed', variant: 'yellow' },
};

const EVENT_ICONS: Record<string, IconName> = {
  Goal: 'ball',
  subst: 'refresh',
  Var: 'video',
};

function MatchEvent({ event, homeName }: { event: FixtureEvent; homeName: string }) {
  const isHome = event.team.name === homeName;
  const iconName: IconName = event.type === 'Card'
    ? (event.detail.includes('Red') ? 'card-red' : 'card-yellow')
    : EVENT_ICONS[event.type] ?? 'check';

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <span className="text-xs text-slate-600 w-8 text-center shrink-0 font-score">{event.time.elapsed}'</span>
      <span className="shrink-0 text-slate-300"><Icon name={iconName} size={16} /></span>
      <div className={`flex-1 min-w-0 ${isHome ? 'text-left' : 'text-right'}`}>
        <span className="text-sm text-white">{event.player.name}</span>
        {event.assist.name && <span className="text-xs text-slate-500 ml-1">({event.assist.name})</span>}
        <span className="text-xs text-slate-600 ml-1">{event.detail}</span>
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const leagueId = searchParams.get('leagueId') || '';
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);
  const dateLocale = lang === 'tr' ? trLocale : enUS;

  const { data: matchData, isLoading } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchesApi.getById(id!),
    enabled: !!id,
  });

  const { data: leaguesData } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => leaguesApi.getAll(),
  });

  const { data: predictionsData } = useQuery({
    queryKey: ['predictions', 'match', id, leagueId],
    queryFn: () => predictionsApi.getForMatch(id!, leagueId),
    enabled: !!id && !!leagueId,
  });

  const { data: myPredictionsData } = useQuery({
    queryKey: ['predictions', 'mine', leagueId],
    queryFn: () => predictionsApi.getMine(leagueId),
    enabled: !!leagueId,
  });

  const match = matchData?.data.match;
  const externalId = match?.external_id;

  const { data: eventsData } = useQuery({
    queryKey: ['fixture-events', externalId],
    queryFn: () => footballApi.getFixtureEvents(externalId!),
    enabled: !!externalId && (match?.status === 'live' || match?.status === 'finished'),
    refetchInterval: match?.status === 'live' ? 30000 : false,
  });

  const { data: apiPredictionData } = useQuery({
    queryKey: ['api-prediction', externalId],
    queryFn: () => footballApi.getApiPrediction(externalId!),
    enabled: !!externalId && match?.status === 'scheduled',
  });

  const { data: injuriesData } = useQuery({
    queryKey: ['fixture-injuries', externalId],
    queryFn: () => footballApi.getFixtureInjuries(externalId!),
    enabled: !!externalId,
    staleTime: 1000 * 60 * 10,
  });

  const { data: statisticsData } = useQuery({
    queryKey: ['fixture-statistics', externalId],
    queryFn: () => footballApi.getFixtureStatistics(externalId!),
    enabled: !!externalId && (match?.status === 'live' || match?.status === 'finished'),
    refetchInterval: match?.status === 'live' ? 60000 : false,
  });

  const homeTeamExternalId = match?.home_team_external_id;
  const awayTeamExternalId = match?.away_team_external_id;

  const { data: h2hData } = useQuery({
    queryKey: ['h2h', homeTeamExternalId, awayTeamExternalId],
    queryFn: () => footballApi.getH2H(homeTeamExternalId!, awayTeamExternalId!, 5),
    enabled: !!homeTeamExternalId && !!awayTeamExternalId,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!match) return <div className="text-center text-slate-400 py-20 text-sm">{t('matchDetail.notFound')}</div>;

  const myPrediction = myPredictionsData?.data.predictions.find((p) => p.match_id === id);
  const events = eventsData?.data.events ?? [];
  const injuries: InjuryEntry[] = injuriesData?.data.injuries ?? [];
  const statistics: TeamStatistics[] = statisticsData?.data.statistics ?? [];
  const h2hFixtures: H2HFixture[] = h2hData?.data.h2h ?? [];
  const apiPrediction = apiPredictionData?.data.prediction?.predictions;
  const isLocked = match.status !== 'scheduled' || new Date(match.kickoff_time) <= new Date();
  const leagues = leaguesData?.data.leagues ?? [];
  const predictions = predictionsData?.data.predictions ?? [];
  const statusEntry = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.scheduled;
  const label = t(statusEntry.labelKey);
  const variant = statusEntry.variant;
  const isLive = match.status === 'live';
  const showScore = match.status === 'finished' || isLive;
  const homeTeam = formatTeamName(match.home_team, lang);
  const awayTeam = formatTeamName(match.away_team, lang);
  const matchDay = formatMatchDay(match.match_day, lang);

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Match hero card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isLive
            ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(12,22,40,0.95) 60%)'
            : 'linear-gradient(135deg, rgba(22,163,74,0.1) 0%, rgba(12,22,40,0.95) 60%)',
          border: isLive ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Top meta */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Badge variant={variant}>{label}</Badge>
          <div className="text-right">
            {match.tournament && (
              <p className="text-xs text-slate-600 uppercase tracking-wide">{match.tournament}</p>
            )}
            <p className="text-sm text-slate-400 mt-0.5">
              {format(new Date(match.kickoff_time), 'EEEE, d MMMM yyyy · HH:mm', { locale: dateLocale })}
            </p>
          </div>
        </div>

        {/* Teams & score */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-4 sm:gap-8">

            {/* Home team */}
            <Link to={`/teams/${encodeURIComponent(match.home_team)}`} className="flex-1 flex flex-col items-center gap-3 group">
              <div
                className="size-16 sm:size-20 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {match.home_team_logo
                  ? <img src={match.home_team_logo} alt={match.home_team} className="size-12 sm:size-16 object-contain" />
                  : <span className="text-2xl font-bold text-slate-300">{match.home_team[0]}</span>
                }
              </div>
              <span className="font-heading font-bold text-white text-center leading-tight text-sm sm:text-base group-hover:text-green-400 transition-colors">
                {homeTeam}
              </span>
            </Link>

            {/* Score / VS */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {showScore ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className="font-score text-5xl sm:text-6xl leading-none text-white"
                      style={isLive ? { textShadow: '0 0 20px rgba(239,68,68,0.7)' } : undefined}
                    >
                      {match.home_score ?? 0}
                    </span>
                    <span className="font-score text-3xl text-slate-600 leading-none">:</span>
                    <span
                      className="font-score text-5xl sm:text-6xl leading-none text-white"
                      style={isLive ? { textShadow: '0 0 20px rgba(239,68,68,0.7)' } : undefined}
                    >
                      {match.away_score ?? 0}
                    </span>
                  </div>
                  {isLive && (
                    <span className="text-xs font-bold text-red-400 live-indicator uppercase tracking-widest">● {t('matchDetail.live')}</span>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="font-score text-3xl text-slate-600 leading-none">{t('match.vs')}</span>
                  <span
                    className="text-sm font-bold tabular-nums px-3 py-1.5 rounded-xl font-score"
                    style={{ background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.2)' }}
                  >
                    {format(new Date(match.kickoff_time), 'HH:mm', { locale: dateLocale })}
                  </span>
                </div>
              )}
            </div>

            {/* Away team */}
            <Link to={`/teams/${encodeURIComponent(match.away_team)}`} className="flex-1 flex flex-col items-center gap-3 group">
              <div
                className="size-16 sm:size-20 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {match.away_team_logo
                  ? <img src={match.away_team_logo} alt={match.away_team} className="size-12 sm:size-16 object-contain" />
                  : <span className="text-2xl font-bold text-slate-300">{match.away_team[0]}</span>
                }
              </div>
              <span className="font-heading font-bold text-white text-center leading-tight text-sm sm:text-base group-hover:text-green-400 transition-colors">
                {awayTeam}
              </span>
            </Link>
          </div>

          {/* Match meta */}
          {(match.venue || matchDay) && (
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              {matchDay && (
                <span className="text-xs text-slate-600 uppercase tracking-widest font-heading">{matchDay}</span>
              )}
              {match.venue && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                  <Icon name="pin" size={12} /> {match.venue}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Live bar */}
        {isLive && <div className="h-0.5 bg-red-500/20"><div className="h-full bg-red-500 live-indicator w-3/5" /></div>}
      </div>

      {/* Main content: 2 columns on large screens */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">

        {/* Prediction section */}
        <div
          className="rounded-[24px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(18,30,52,0.96) 0%, rgba(12,22,40,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 10px 30px -18px rgba(0,0,0,0.55)',
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-green-400/80 mb-1">{t('matchDetail.sectionHint')}</p>
            <h2 className="text-sm font-bold text-white font-heading">{t('matchDetail.yourPrediction')}</h2>
          </div>
          <div className="p-5">
            {leagues.length === 0 ? (
              <p className="text-sm text-slate-500">{t('matchDetail.joinLeagueFirst')}</p>
            ) : leagueId ? (
              <PredictionForm
                matchId={match.id}
                leagueId={leagueId}
                initialHome={myPrediction?.predicted_home_score}
                initialAway={myPrediction?.predicted_away_score}
                isLocked={isLocked}
                homeName={homeTeam}
                awayName={awayTeam}
              />
            ) : (
              <div>
                <p className="text-sm text-slate-400 mb-3">{t('matchDetail.selectLeague')}</p>
                <div className="flex flex-wrap gap-2">
                  {leagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => navigate(`?leagueId=${league.id}`)}
                      className="px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {league.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI prediction / League predictions */}
        {apiPrediction ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-bold text-white font-heading">{t('matchDetail.aiPrediction')}</h2>
            </div>
            <div className="p-5 space-y-4">
              {apiPrediction.advice && (
                <p className="text-sm text-slate-300 italic">"{apiPrediction.advice}"</p>
              )}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                  { label: homeTeam, value: apiPrediction.percent.home, color: 'text-blue-400' },
                  { label: t('matchDetail.draw'), value: apiPrediction.percent.draw, color: 'text-slate-400' },
                  { label: awayTeam, value: apiPrediction.percent.away, color: 'text-green-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-2">
                    <span className={`font-score text-2xl leading-none ${color}`}>{value}</span>
                    <span className="text-xs text-slate-500 truncate">{label}</span>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>
              {apiPrediction.winner?.name && (
                <p className="text-xs text-slate-600 text-center">
                  {t('matchDetail.predictedWinner')} <span className="text-slate-300 font-medium">{apiPrediction.winner.name}</span>
                </p>
              )}
            </div>
          </div>
        ) : leagueId && predictions.length > 0 && match.status === 'finished' ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-bold text-white font-heading">{t('matchDetail.leaguePredictions')}</h2>
            </div>
            <div>
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: pred.user_id === user?.id ? 'rgba(22,163,74,0.05)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="size-7 rounded-lg flex items-center justify-center text-xs font-bold text-white font-heading"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      {pred.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300">{pred.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-score">
                      {pred.predicted_home_score} – {pred.predicted_away_score}
                    </span>
                    <span className={`text-sm font-bold w-10 text-right font-score ${
                      pred.points_awarded === 3 ? 'text-amber-400' :
                      pred.points_awarded >= 1 ? 'text-green-400' : 'text-slate-600'
                    }`}>+{pred.points_awarded}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Injuries & suspensions — split by team */}
      {injuries.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-bold text-white font-heading">{t('matchDetail.injuries')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {[match.home_team, match.away_team].map((teamName) => {
              const list = injuries.filter((i) => i.team.name === teamName);
              return (
                <div key={teamName} className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 font-heading mb-3">
                    {formatTeamName(teamName, lang)}
                  </p>
                  {list.length === 0 ? (
                    <p className="text-xs text-slate-600">{t('matchDetail.noInjuries')}</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {list.map((inj) => {
                        const type = inj.player.type?.toLowerCase() ?? '';
                        const isSuspended = type.includes('suspend') || inj.player.reason?.toLowerCase().includes('suspen');
                        const label = isSuspended
                          ? t('matchDetail.injuryType.suspended')
                          : type.includes('injur')
                            ? t('matchDetail.injuryType.injured')
                            : t('matchDetail.injuryType.missing');
                        return (
                          <li key={`${inj.player.id}-${inj.player.name}`} className="flex items-center gap-3">
                            <span
                              className="size-1.5 rounded-full shrink-0"
                              style={{ background: isSuspended ? '#f59e0b' : '#ef4444' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{inj.player.name}</p>
                              {inj.player.reason && (
                                <p className="text-[11px] text-slate-600 truncate">{inj.player.reason}</p>
                              )}
                            </div>
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                              style={{
                                color: isSuspended ? '#fbbf24' : '#fca5a5',
                                background: isSuspended ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                              }}
                            >
                              {label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Match Statistics */}
      {(match.status === 'live' || match.status === 'finished') && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-bold text-white font-heading">{t('matchDetail.statistics')}</h2>
          </div>
          {statistics.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-600 text-center">{t('matchDetail.noStats')}</p>
          ) : (
            <div className="p-5 space-y-3">
              {statistics[0]?.statistics
                .filter((s) => s.value !== null && s.value !== undefined)
                .map((stat, i) => {
                  const homeVal = statistics[0]?.statistics[i]?.value;
                  const awayVal = statistics[1]?.statistics[i]?.value;
                  const homeNum = typeof homeVal === 'string' && homeVal.endsWith('%')
                    ? parseFloat(homeVal) : Number(homeVal ?? 0);
                  const awayNum = typeof awayVal === 'string' && awayVal.endsWith('%')
                    ? parseFloat(awayVal) : Number(awayVal ?? 0);
                  const total = homeNum + awayNum || 1;
                  const homeWidth = Math.round((homeNum / total) * 100);
                  const awayWidth = 100 - homeWidth;

                  return (
                    <div key={stat.type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-white tabular-nums">{homeVal ?? 0}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-heading text-center flex-1 px-3">
                          {stat.type}
                        </span>
                        <span className="text-sm font-semibold text-white tabular-nums">{awayVal ?? 0}</span>
                      </div>
                      <div className="flex rounded-full overflow-hidden h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${homeWidth}%`, background: '#22c55e', transition: 'width 0.4s ease' }}
                        />
                        <div
                          className="h-full rounded-full ml-auto"
                          style={{ width: `${awayWidth}%`, background: '#3b82f6', transition: 'width 0.4s ease' }}
                        />
                      </div>
                    </div>
                  );
                })}
              <div className="flex items-center justify-between pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="size-2 rounded-full bg-green-500 inline-block" /> {homeTeam}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  {awayTeam} <span className="size-2 rounded-full bg-blue-500 inline-block" />
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* H2H */}
      {h2hFixtures.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-bold text-white font-heading">{t('matchDetail.h2h')}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{t('matchDetail.h2hLast')}</p>
          </div>
          <div>
            {h2hFixtures.slice(0, 5).map((fixture) => {
              const hWin = fixture.teams.home.winner === true;
              const aWin = fixture.teams.away.winner === true;
              const isDraw = fixture.teams.home.winner === false && fixture.teams.away.winner === false;
              return (
                <div
                  key={fixture.fixture.id}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className="text-[11px] text-slate-600 w-20 shrink-0">
                    {fixture.fixture.date ? format(new Date(fixture.fixture.date), 'dd MMM yy', { locale: dateLocale }) : ''}
                  </span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className={`text-xs truncate text-right flex-1 ${hWin ? 'text-white font-semibold' : 'text-slate-500'}`}>
                      {fixture.teams.home.name}
                    </span>
                    <span
                      className="font-score text-base text-white shrink-0 px-2 py-0.5 rounded-lg"
                      style={{
                        background: isDraw ? 'rgba(255,255,255,0.06)' : hWin ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.10)',
                      }}
                    >
                      {fixture.goals.home ?? 0} – {fixture.goals.away ?? 0}
                    </span>
                    <span className={`text-xs truncate flex-1 ${aWin ? 'text-white font-semibold' : 'text-slate-500'}`}>
                      {fixture.teams.away.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-700 shrink-0 w-16 text-right truncate">
                    {fixture.league.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Match events */}
      {events.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-bold text-white font-heading">{t('matchDetail.matchEvents')}</h2>
          </div>
          <div>
            {events.map((event: FixtureEvent, i: number) => (
              <MatchEvent key={i} event={event} homeName={match.home_team} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
