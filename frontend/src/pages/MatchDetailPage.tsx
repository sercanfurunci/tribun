import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { matchesApi } from '../services/matches';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { footballApi, FixtureEvent } from '../services/football';
import { PredictionForm } from '../components/features/PredictionForm';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useAuthStore } from '../store/auth';

const STATUS_CONFIG = {
  scheduled: { label: 'Upcoming', variant: 'blue' as const },
  live: { label: 'LIVE', variant: 'live' as const },
  finished: { label: 'FT', variant: 'slate' as const },
  postponed: { label: 'Postponed', variant: 'yellow' as const },
};

const EVENT_ICONS: Record<string, string> = {
  Goal: '⚽', subst: '🔄', Var: '📺',
};

function MatchEvent({ event, homeName }: { event: FixtureEvent; homeName: string }) {
  const isHome = event.team.name === homeName;
  const icon = event.type === 'Card'
    ? (event.detail.includes('Red') ? '🟥' : '🟨')
    : EVENT_ICONS[event.type] || '•';

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <span className="text-xs text-slate-600 w-8 text-center shrink-0 font-score">{event.time.elapsed}'</span>
      <span className="text-base shrink-0">{icon}</span>
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

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!match) return <div className="text-center text-slate-400 py-20 text-sm">Match not found</div>;

  const myPrediction = myPredictionsData?.data.predictions.find((p) => p.match_id === id);
  const events = eventsData?.data.events ?? [];
  const apiPrediction = apiPredictionData?.data.prediction?.predictions;
  const isLocked = match.status !== 'scheduled' || new Date(match.kickoff_time) <= new Date();
  const leagues = leaguesData?.data.leagues ?? [];
  const predictions = predictionsData?.data.predictions ?? [];
  const { label, variant } = STATUS_CONFIG[match.status];
  const isLive = match.status === 'live';
  const showScore = match.status === 'finished' || isLive;

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
              {format(new Date(match.kickoff_time), 'EEEE, d MMMM yyyy · HH:mm')}
            </p>
          </div>
        </div>

        {/* Teams & score */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-4 sm:gap-8">

            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div
                className="size-16 sm:size-20 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {match.home_team_logo
                  ? <img src={match.home_team_logo} alt={match.home_team} className="size-12 sm:size-16 object-contain" />
                  : <span className="text-2xl font-bold text-slate-300">{match.home_team[0]}</span>
                }
              </div>
              <span className="font-heading font-bold text-white text-center leading-tight text-sm sm:text-base">
                {match.home_team}
              </span>
            </div>

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
                    <span className="text-xs font-bold text-red-400 live-indicator uppercase tracking-widest">● Live</span>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="font-score text-3xl text-slate-600 leading-none">VS</span>
                  <span
                    className="text-sm font-bold tabular-nums px-3 py-1.5 rounded-xl font-score"
                    style={{ background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.2)' }}
                  >
                    {format(new Date(match.kickoff_time), 'HH:mm')}
                  </span>
                </div>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div
                className="size-16 sm:size-20 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {match.away_team_logo
                  ? <img src={match.away_team_logo} alt={match.away_team} className="size-12 sm:size-16 object-contain" />
                  : <span className="text-2xl font-bold text-slate-300">{match.away_team[0]}</span>
                }
              </div>
              <span className="font-heading font-bold text-white text-center leading-tight text-sm sm:text-base">
                {match.away_team}
              </span>
            </div>
          </div>

          {/* Match meta */}
          {(match.venue || match.match_day) && (
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              {match.match_day && (
                <span className="text-xs text-slate-600 uppercase tracking-widest font-heading">{match.match_day}</span>
              )}
              {match.venue && (
                <span className="text-xs text-slate-600">📍 {match.venue}</span>
              )}
            </div>
          )}
        </div>

        {/* Live bar */}
        {isLive && <div className="h-0.5 bg-red-500/20"><div className="h-full bg-red-500 live-indicator w-3/5" /></div>}
      </div>

      {/* Main content: 2 columns on large screens */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Prediction section */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-bold text-white font-heading">Your Prediction</h2>
          </div>
          <div className="p-5">
            {leagues.length === 0 ? (
              <p className="text-sm text-slate-500">Join a league to make predictions</p>
            ) : leagueId ? (
              <PredictionForm
                matchId={match.id}
                leagueId={leagueId}
                initialHome={myPrediction?.predicted_home_score}
                initialAway={myPrediction?.predicted_away_score}
                isLocked={isLocked}
                homeName={match.home_team}
                awayName={match.away_team}
              />
            ) : (
              <div>
                <p className="text-sm text-slate-400 mb-3">Select a league to predict:</p>
                <div className="flex flex-wrap gap-2">
                  {leagues.map((league) => (
                    <a
                      key={league.id}
                      href={`?leagueId=${league.id}`}
                      className="px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {league.name}
                    </a>
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
              <h2 className="text-sm font-bold text-white font-heading">AI Match Prediction</h2>
            </div>
            <div className="p-5 space-y-4">
              {apiPrediction.advice && (
                <p className="text-sm text-slate-300 italic">"{apiPrediction.advice}"</p>
              )}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: match.home_team, value: apiPrediction.percent.home, color: 'text-blue-400' },
                  { label: 'Draw', value: apiPrediction.percent.draw, color: 'text-slate-400' },
                  { label: match.away_team, value: apiPrediction.percent.away, color: 'text-green-400' },
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
                  Predicted winner: <span className="text-slate-300 font-medium">{apiPrediction.winner.name}</span>
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
              <h2 className="text-sm font-bold text-white font-heading">League Predictions</h2>
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

      {/* Match events */}
      {events.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-bold text-white font-heading">Match Events</h2>
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
