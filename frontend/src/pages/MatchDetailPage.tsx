import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { matchesApi } from '../services/matches';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { footballApi, FixtureEvent, InjuryEntry, TeamStatistics, H2HFixture, SportsDBTimelineEvent, SportsDBEventStat } from '../services/football';
import { PredictionForm } from '../components/features/PredictionForm';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useAuthStore } from '../store/auth';
import { useLanguageStore, useT } from '../store/language';
import { Icon, type IconName } from '../components/ui/Icon';
import { formatMatchDay, formatTeamName } from '../lib/matchDisplay';
import type { TranslationKey } from '../i18n/translations';

const STATUS_CONFIG: Record<string, { labelKey: TranslationKey; variant: 'pending' | 'live' | 'default' | 'gold' }> = {
  scheduled: { labelKey: 'matchDetail.upcoming', variant: 'pending' },
  live:      { labelKey: 'matchDetail.live',     variant: 'live'    },
  finished:  { labelKey: 'match.ftBadge',        variant: 'default' },
  postponed: { labelKey: 'matchDetail.postponed', variant: 'gold'   },
};

const EVENT_ICONS: Record<string, IconName> = {
  Goal: 'ball',
  subst: 'refresh',
  Var: 'video',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#E8E4DE]">
        <h2 className="text-sm font-heading font-black text-[#111111]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MatchEvent({ event, homeName }: { event: FixtureEvent; homeName: string }) {
  const isHome = event.team.name === homeName;
  const iconName: IconName = event.type === 'Card'
    ? (event.detail.includes('Red') ? 'card-red' : 'card-yellow')
    : EVENT_ICONS[event.type] ?? 'check';

  return (
    <div className={`flex items-center gap-3 px-5 py-3 border-b border-[#F2EFE9] ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
      <span className="text-xs text-[#999390] w-8 text-center shrink-0 font-display">{event.time.elapsed}'</span>
      <span className="shrink-0 text-[#666666]"><Icon name={iconName} size={16} /></span>
      <div className={`flex-1 min-w-0 ${isHome ? 'text-left' : 'text-right'}`}>
        <span className="text-sm text-[#111111]">{event.player.name}</span>
        {event.assist.name && <span className="text-xs text-[#999390] ml-1">({event.assist.name})</span>}
        <span className="text-xs text-[#999390] ml-1">{event.detail}</span>
      </div>
    </div>
  );
}

const TIMELINE_ICONS: Record<string, IconName> = {
  Goal: 'ball',
  Card: 'card-yellow',
  Subst: 'refresh',
};

function TimelineRow({ event, t }: { event: SportsDBTimelineEvent; t: (k: TranslationKey) => string }) {
  const isHome = event.strHome === 'Yes';
  const isGoal = event.strTimeline === 'Goal';
  const isCard = event.strTimeline === 'Card';
  const isRed = isCard && event.strTimelineDetail.toLowerCase().includes('red');
  const isSubst = event.strTimeline === 'Subst';
  const iconName: IconName = isCard
    ? (isRed ? 'card-red' : 'card-yellow')
    : TIMELINE_ICONS[event.strTimeline] ?? 'check';

  const detail = isGoal
    ? (event.strTimelineDetail?.toLowerCase().includes('own') ? t('matchDetail.ownGoal')
      : event.strTimelineDetail?.toLowerCase().includes('pen') ? t('matchDetail.penalty')
      : t('matchDetail.goal'))
    : isCard ? (isRed ? t('matchDetail.redCard') : t('matchDetail.yellowCard'))
    : isSubst ? t('matchDetail.substitution')
    : event.strTimelineDetail;

  return (
    <div className={`flex items-center gap-3 px-5 py-3 border-b border-[#F2EFE9] ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
      <span className="text-xs text-[#999390] w-8 text-center shrink-0 font-display">{event.intTime}'</span>
      <span className={`shrink-0 ${isGoal ? 'text-[#166534]' : isRed ? 'text-[#C1121F]' : 'text-[#666666]'}`}>
        <Icon name={iconName} size={16} />
      </span>
      <div className={`flex-1 min-w-0 ${isHome ? 'text-left' : 'text-right'}`}>
        <span className="text-sm text-[#111111]">{event.strPlayer}</span>
        {event.strAssist && <span className="text-xs text-[#999390] ml-1">({event.strAssist})</span>}
        <span className="text-xs text-[#999390] ml-1">{detail}</span>
      </div>
    </div>
  );
}

function SportsDBStatsPanel({ stats, homeTeam, awayTeam }: { stats: SportsDBEventStat[]; homeTeam: string; awayTeam: string }) {
  const STAT_LABEL_MAP: Record<string, string> = {
    'Ball Possession': 'Top Hakimiyeti',
    'Shots on Goal': 'İsabetli Şut',
    'Shots off Goal': 'İsabetsiz Şut',
    'Total Shots': 'Toplam Şut',
    'Blocked Shots': 'Bloklanan Şut',
    'Corner Kicks': 'Korner',
    'Offsides': 'Ofsayt',
    'Fouls': 'Faul',
    'Yellow Cards': 'Sarı Kart',
    'Red Cards': 'Kırmızı Kart',
    'Goalkeeper Saves': 'Kurtarış',
    'Total passes': 'Toplam Pas',
    'Passes accurate': 'İsabetli Pas',
    'Passes %': 'Pas İsabeti',
  };

  return (
    <div className="p-5 space-y-3">
      {stats.map((stat) => {
        const homeNum = parseFloat(stat.intHome) || 0;
        const awayNum = parseFloat(stat.intAway) || 0;
        const total = homeNum + awayNum || 1;
        const homeWidth = Math.round((homeNum / total) * 100);
        const label = STAT_LABEL_MAP[stat.strStat] ?? stat.strStat;
        const homeDisplay = stat.strStat.toLowerCase().includes('possession') ? `${stat.intHome}%` : stat.intHome;
        const awayDisplay = stat.strStat.toLowerCase().includes('possession') ? `${stat.intAway}%` : stat.intAway;

        return (
          <div key={stat.strStat}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-[#111111] tabular-nums">{homeDisplay}</span>
              <span className="text-[10px] text-[#999390] uppercase tracking-wider font-heading text-center flex-1 px-3">{label}</span>
              <span className="text-sm font-semibold text-[#111111] tabular-nums">{awayDisplay}</span>
            </div>
            <div className="flex rounded-full overflow-hidden h-1.5 bg-[#E8E4DE]">
              <div className="h-full rounded-full bg-[#8B1E1E]" style={{ width: `${homeWidth}%`, transition: 'width 0.4s ease' }} />
              <div className="h-full rounded-full bg-[#1D4ED8] ml-auto" style={{ width: `${100 - homeWidth}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-[#999390]">
          <span className="size-2 rounded-full bg-[#8B1E1E] inline-block" /> {homeTeam}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#999390]">
          {awayTeam} <span className="size-2 rounded-full bg-[#1D4ED8] inline-block" />
        </span>
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

  const { data: h2hData } = useQuery({
    queryKey: ['h2h', match?.home_team_external_id, match?.away_team_external_id],
    queryFn: () => footballApi.getH2H(match!.home_team_external_id!, match!.away_team_external_id!, 5),
    enabled: !!match?.home_team_external_id && !!match?.away_team_external_id,
    staleTime: 1000 * 60 * 60,
  });

  // TheSportsDB timeline + stats — used when API-Football data is unavailable
  const isSportsDBMatch = match?.external_league_id === 4429;
  const { data: sportsdbTimelineData } = useQuery({
    queryKey: ['sportsdb-timeline', externalId],
    queryFn: () => footballApi.getSportsDBTimeline(externalId!),
    enabled: !!externalId && isSportsDBMatch && match?.status === 'finished',
    staleTime: 1000 * 60 * 30,
  });
  const { data: sportsdbStatsData } = useQuery({
    queryKey: ['sportsdb-stats', externalId],
    queryFn: () => footballApi.getSportsDBStats(externalId!),
    enabled: !!externalId && isSportsDBMatch && match?.status === 'finished',
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!match) return <div className="text-center text-[#999390] py-20 text-sm">{t('matchDetail.notFound')}</div>;

  const myPrediction = myPredictionsData?.data.predictions.find((p) => p.match_id === id);
  const events = eventsData?.data.events ?? [];
  const injuries: InjuryEntry[] = injuriesData?.data.injuries ?? [];
  const statistics: TeamStatistics[] = statisticsData?.data.statistics ?? [];
  const h2hFixtures: H2HFixture[] = h2hData?.data.h2h ?? [];
  const sportsdbTimeline: SportsDBTimelineEvent[] = sportsdbTimelineData?.data.timeline ?? [];
  const sportsdbStats: SportsDBEventStat[] = sportsdbStatsData?.data.stats ?? [];
  const showSportsDBSummary = match?.status === 'finished' && isSportsDBMatch && (sportsdbTimeline.length > 0 || sportsdbStats.length > 0);
  const apiPrediction = apiPredictionData?.data.prediction?.predictions;
  const isLocked = match.status !== 'scheduled' || new Date(match.kickoff_time) <= new Date();
  const leagues = leaguesData?.data.leagues ?? [];
  const predictions = predictionsData?.data.predictions ?? [];
  const hasRightPanel = !!(apiPrediction || (leagueId && predictions.length > 0 && match.status === 'finished'));
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
      {/* Match hero */}
      <div className={`bg-white border rounded-lg overflow-hidden ${isLive ? 'border-[#FECACA]' : 'border-[#D9D4CC]'}`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E4DE]">
          <Badge variant={variant}>{label}</Badge>
          <div className="text-right">
            {match.tournament && (
              <p className="text-xs text-[#999390] uppercase tracking-wide">{match.tournament}</p>
            )}
            <p className="text-sm text-[#666666] mt-0.5">
              {format(new Date(match.kickoff_time), 'EEEE, d MMMM yyyy · HH:mm', { locale: dateLocale })}
            </p>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to={`/teams/${encodeURIComponent(match.home_team)}`} className="flex-1 flex flex-col items-center gap-3 group">
              <div className="size-16 sm:size-20 rounded-xl bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                {match.home_team_logo
                  ? <img src={match.home_team_logo} alt={match.home_team} className="size-12 sm:size-16 object-contain" />
                  : <span className="text-2xl font-bold text-[#666666]">{match.home_team[0]}</span>
                }
              </div>
              <span className="font-heading font-black text-[#111111] text-center leading-tight text-sm sm:text-base group-hover:text-[#8B1E1E] transition-colors">
                {homeTeam}
              </span>
            </Link>

            <div className="flex flex-col items-center gap-2 shrink-0">
              {showScore ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`font-display text-5xl sm:text-6xl leading-none ${isLive ? 'text-[#8B1E1E]' : 'text-[#111111]'}`}>
                      {match.home_score ?? 0}
                    </span>
                    <span className="font-display text-3xl text-[#D9D4CC] leading-none">:</span>
                    <span className={`font-display text-5xl sm:text-6xl leading-none ${isLive ? 'text-[#8B1E1E]' : 'text-[#111111]'}`}>
                      {match.away_score ?? 0}
                    </span>
                  </div>
                  {isLive && (
                    <span className="text-xs font-bold text-[#8B1E1E] uppercase tracking-widest flex items-center gap-1.5">
                      <span className="live-dot" />{t('matchDetail.live')}
                    </span>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="font-heading font-black text-2xl text-[#D9D4CC] leading-none">{t('match.vs')}</span>
                  <span className="text-sm font-semibold tabular-nums px-3 py-1.5 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#8B1E1E] font-sans">
                    {format(new Date(match.kickoff_time), 'HH:mm', { locale: dateLocale })}
                  </span>
                </div>
              )}
            </div>

            <Link to={`/teams/${encodeURIComponent(match.away_team)}`} className="flex-1 flex flex-col items-center gap-3 group">
              <div className="size-16 sm:size-20 rounded-xl bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                {match.away_team_logo
                  ? <img src={match.away_team_logo} alt={match.away_team} className="size-12 sm:size-16 object-contain" />
                  : <span className="text-2xl font-bold text-[#666666]">{match.away_team[0]}</span>
                }
              </div>
              <span className="font-heading font-black text-[#111111] text-center leading-tight text-sm sm:text-base group-hover:text-[#8B1E1E] transition-colors">
                {awayTeam}
              </span>
            </Link>
          </div>

          {(match.venue || matchDay) && (
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              {matchDay && (
                <span className="text-xs text-[#999390] uppercase tracking-widest font-heading">{matchDay}</span>
              )}
              {match.venue && (
                <span className="inline-flex items-center gap-1 text-xs text-[#999390]">
                  <Icon name="pin" size={12} /> {match.venue}
                </span>
              )}
            </div>
          )}
        </div>

        {isLive && (
          <div className="h-0.5 bg-[#E8E4DE]">
            <div className="h-full bg-[#8B1E1E] w-3/5" />
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className={`grid gap-5 ${hasRightPanel ? 'lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]' : ''}`}>
        {/* Prediction section */}
        <Section title={t('matchDetail.yourPrediction')}>
          <div className="p-5">
            {leagues.length === 0 ? (
              <p className="text-sm text-[#999390]">{t('matchDetail.joinLeagueFirst')}</p>
            ) : leagueId ? (
              <PredictionForm
                key={`${match.id}-${leagueId}-${myPrediction?.id ?? 'new'}`}
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
                <p className="text-sm text-[#666666] mb-3">{t('matchDetail.selectLeague')}</p>
                <div className="flex flex-wrap gap-2">
                  {leagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => navigate(`?leagueId=${league.id}`)}
                      className="px-3 py-2 rounded text-sm font-medium text-[#111111] bg-white border border-[#D9D4CC] hover:border-[#B8B2AA] hover:bg-[#F7F4EF] transition-colors duration-150"
                    >
                      {league.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* AI prediction / League predictions */}
        {apiPrediction ? (
          <Section title={t('matchDetail.aiPrediction')}>
            <div className="p-5 space-y-4">
              {apiPrediction.advice && (
                <p className="text-sm text-[#666666] italic">"{apiPrediction.advice}"</p>
              )}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: homeTeam, value: apiPrediction.percent.home, color: 'text-[#1D4ED8]' },
                  { label: t('matchDetail.draw'), value: apiPrediction.percent.draw, color: 'text-[#666666]' },
                  { label: awayTeam, value: apiPrediction.percent.away, color: 'text-[#166534]' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-2">
                    <span className={`font-display text-2xl leading-none ${color}`}>{value}</span>
                    <span className="text-xs text-[#999390] truncate">{label}</span>
                    <div className="h-1 rounded-full bg-[#E8E4DE]">
                      <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>
              {apiPrediction.winner?.name && (
                <p className="text-xs text-[#999390] text-center">
                  {t('matchDetail.predictedWinner')} <span className="text-[#111111] font-semibold">{apiPrediction.winner.name}</span>
                </p>
              )}
            </div>
          </Section>
        ) : leagueId && predictions.length > 0 && match.status === 'finished' ? (
          <Section title={t('matchDetail.leaguePredictions')}>
            <div>
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`flex items-center justify-between px-5 py-3 border-b border-[#F2EFE9] ${pred.user_id === user?.id ? 'bg-[#FEF2F2]' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-[#8B1E1E] flex items-center justify-center text-xs font-bold text-white font-heading">
                      {pred.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-[#111111]">{pred.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#111111] font-display">
                      {pred.predicted_home_score} – {pred.predicted_away_score}
                    </span>
                    <span className={`text-sm font-bold w-10 text-right font-display ${
                      pred.points_awarded === 3 ? 'text-[#92400E]' :
                      pred.points_awarded >= 1 ? 'text-[#166534]' : 'text-[#999390]'
                    }`}>+{pred.points_awarded}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </div>

      {/* Injuries */}
      {injuries.length > 0 && (
        <Section title={t('matchDetail.injuries')}>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E4DE]">
            {[match.home_team, match.away_team].map((teamName) => {
              const list = injuries.filter((i) => i.team.name === teamName);
              return (
                <div key={teamName} className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999390] font-heading mb-3">
                    {formatTeamName(teamName, lang)}
                  </p>
                  {list.length === 0 ? (
                    <p className="text-xs text-[#999390]">{t('matchDetail.noInjuries')}</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {list.map((inj) => {
                        const type = inj.player.type?.toLowerCase() ?? '';
                        const isSuspended = type.includes('suspend') || inj.player.reason?.toLowerCase().includes('suspen');
                        const lbl = isSuspended
                          ? t('matchDetail.injuryType.suspended')
                          : type.includes('injur')
                            ? t('matchDetail.injuryType.injured')
                            : t('matchDetail.injuryType.missing');
                        return (
                          <li key={`${inj.player.id}-${inj.player.name}`} className="flex items-center gap-3">
                            <span className={`size-1.5 rounded-full shrink-0 ${isSuspended ? 'bg-[#F59E0B]' : 'bg-[#C1121F]'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#111111] truncate">{inj.player.name}</p>
                              {inj.player.reason && (
                                <p className="text-[11px] text-[#999390] truncate">{inj.player.reason}</p>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                              isSuspended ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]' : 'bg-[#FEF2F2] text-[#C1121F] border border-[#FECACA]'
                            }`}>
                              {lbl}
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
        </Section>
      )}

      {/* Statistics */}
      {(match.status === 'live' || match.status === 'finished') && (
        <Section title={t('matchDetail.statistics')}>
          {statistics.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#999390] text-center">{t('matchDetail.noStats')}</p>
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

                  return (
                    <div key={stat.type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-[#111111] tabular-nums">{homeVal ?? 0}</span>
                        <span className="text-[10px] text-[#999390] uppercase tracking-wider font-heading text-center flex-1 px-3">
                          {stat.type}
                        </span>
                        <span className="text-sm font-semibold text-[#111111] tabular-nums">{awayVal ?? 0}</span>
                      </div>
                      <div className="flex rounded-full overflow-hidden h-1.5 bg-[#E8E4DE]">
                        <div className="h-full rounded-full bg-[#8B1E1E]" style={{ width: `${homeWidth}%`, transition: 'width 0.4s ease' }} />
                        <div className="h-full rounded-full bg-[#1D4ED8] ml-auto" style={{ width: `${100 - homeWidth}%`, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              <div className="flex items-center justify-between pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#999390]">
                  <span className="size-2 rounded-full bg-[#8B1E1E] inline-block" /> {homeTeam}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#999390]">
                  {awayTeam} <span className="size-2 rounded-full bg-[#1D4ED8] inline-block" />
                </span>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* H2H */}
      {h2hFixtures.length > 0 && (
        <Section title={t('matchDetail.h2h')}>
          <div>
            {h2hFixtures.slice(0, 5).map((fixture) => {
              const hWin = fixture.teams.home.winner === true;
              const aWin = fixture.teams.away.winner === true;
              const isDraw = !hWin && !aWin;
              return (
                <div key={fixture.fixture.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#F2EFE9]">
                  <span className="text-[11px] text-[#999390] w-20 shrink-0">
                    {fixture.fixture.date ? format(new Date(fixture.fixture.date), 'dd MMM yy', { locale: dateLocale }) : ''}
                  </span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className={`text-xs truncate text-right flex-1 ${hWin ? 'text-[#111111] font-semibold' : 'text-[#999390]'}`}>
                      {fixture.teams.home.name}
                    </span>
                    <span className={`font-display text-base text-[#111111] shrink-0 px-2 py-0.5 rounded border ${
                      isDraw ? 'bg-[#F7F4EF] border-[#E8E4DE]' :
                      hWin   ? 'bg-[#DCFCE7] border-[#86EFAC]' :
                               'bg-[#FEF2F2] border-[#FECACA]'
                    }`}>
                      {fixture.goals.home ?? 0} – {fixture.goals.away ?? 0}
                    </span>
                    <span className={`text-xs truncate flex-1 ${aWin ? 'text-[#111111] font-semibold' : 'text-[#999390]'}`}>
                      {fixture.teams.away.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#D9D4CC] shrink-0 w-16 text-right truncate">
                    {fixture.league.name}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* TheSportsDB Match Summary (timeline + stats for WC matches) */}
      {showSportsDBSummary && (
        <Section title={t('matchDetail.matchSummary')}>
          {sportsdbTimeline.length > 0 && (
            <div className={sportsdbStats.length > 0 ? 'border-b border-[#E8E4DE]' : ''}>
              {[...sportsdbTimeline]
                .sort((a, b) => parseInt(a.intTime) - parseInt(b.intTime))
                .map((event) => (
                  <TimelineRow key={event.idTimeline} event={event} t={t} />
                ))}
            </div>
          )}
          {sportsdbStats.length > 0 && (
            <SportsDBStatsPanel stats={sportsdbStats} homeTeam={homeTeam} awayTeam={awayTeam} />
          )}
        </Section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <Section title={t('matchDetail.matchEvents')}>
          <div>
            {events.map((event: FixtureEvent, i: number) => (
              <MatchEvent key={i} event={event} homeName={match.home_team} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
