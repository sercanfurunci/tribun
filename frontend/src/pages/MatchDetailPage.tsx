import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { matchesApi } from '../services/matches';
import { predictionsApi } from '../services/predictions';
import { leaguesApi } from '../services/leagues';
import { footballApi, FixtureEvent } from '../services/football';
import { PredictionForm } from '../components/features/PredictionForm';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useAuthStore } from '../store/auth';

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

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!match) return <div className="text-center text-slate-400 py-16">Match not found</div>;

  const myPrediction = myPredictionsData?.data.predictions.find((p) => p.match_id === id);
  const events = eventsData?.data.events ?? [];
  const apiPrediction = apiPredictionData?.data.prediction?.predictions;

  const isLocked = match.status !== 'scheduled' || new Date(match.kickoff_time) <= new Date();
  const leagues = leaguesData?.data.leagues ?? [];
  const predictions = predictionsData?.data.predictions ?? [];

  const statusConfig = {
    scheduled: { label: 'Upcoming', variant: 'blue' as const },
    live: { label: 'LIVE', variant: 'red' as const },
    finished: { label: 'Finished', variant: 'slate' as const },
    postponed: { label: 'Postponed', variant: 'yellow' as const },
  };
  const { label, variant } = statusConfig[match.status];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card variant="elevated">
        <CardBody className="py-8">
          <div className="flex items-center justify-between mb-6">
            <Badge variant={variant}>{label}</Badge>
            <div className="text-right">
              {match.tournament && <p className="text-xs text-slate-500">{match.tournament}</p>}
              <p className="text-sm text-slate-400">
                {format(new Date(match.kickoff_time), 'EEEE, d MMMM yyyy • HH:mm')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="size-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {match.home_team_logo ? (
                  <img src={match.home_team_logo} alt={match.home_team} className="size-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">{match.home_team[0]}</span>
                )}
              </div>
              <span className="text-base font-bold text-white text-center">{match.home_team}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              {match.status === 'finished' || match.status === 'live' ? (
                <div className="text-center">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-white">{match.home_score ?? 0}</span>
                    <span className="text-3xl text-slate-600">–</span>
                    <span className="text-5xl font-black text-white">{match.away_score ?? 0}</span>
                  </div>
                  {match.status === 'live' && (
                    <Badge variant="red" size="md" className="mt-2">LIVE</Badge>
                  )}
                </div>
              ) : (
                <span className="text-3xl text-slate-600 font-bold">vs</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="size-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {match.away_team_logo ? (
                  <img src={match.away_team_logo} alt={match.away_team} className="size-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">{match.away_team[0]}</span>
                )}
              </div>
              <span className="text-base font-bold text-white text-center">{match.away_team}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {leagues.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-white">Your Prediction</h2>
          </CardHeader>
          <CardBody>
            {leagueId ? (
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
              <div className="text-sm text-slate-400">
                Select a league to make your prediction:
                <div className="mt-3 flex flex-wrap gap-2">
                  {leagues.map((league) => (
                    <a
                      key={league.id}
                      href={`?leagueId=${league.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-white transition-colors"
                    >
                      {league.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {apiPrediction && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-white">AI Match Prediction</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {apiPrediction.advice && (
              <p className="text-sm text-slate-300 italic">"{apiPrediction.advice}"</p>
            )}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: match.home_team, value: apiPrediction.percent.home, color: 'text-blue-400' },
                { label: 'Draw', value: apiPrediction.percent.draw, color: 'text-slate-400' },
                { label: match.away_team, value: apiPrediction.percent.away, color: 'text-green-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className={`text-xl font-bold ${color}`}>{value}</span>
                  <span className="text-xs text-slate-500 truncate">{label}</span>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                      style={{ width: value }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {apiPrediction.winner && (
              <p className="text-xs text-slate-500 text-center">
                Predicted winner: <span className="text-white font-medium">{apiPrediction.winner.name}</span>
                {apiPrediction.winner.comment && ` — ${apiPrediction.winner.comment}`}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-white">Match Events</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-800/50">
              {events.map((event: FixtureEvent, i: number) => (
                <MatchEvent key={i} event={event} homeName={match.home_team} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {leagueId && predictions.length > 0 && match.status === 'finished' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-white">League Predictions</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-800">
              {predictions.map((pred) => (
                <div key={pred.id} className={`flex items-center justify-between px-5 py-3 ${pred.user_id === user?.id ? 'bg-green-500/5' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {pred.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white">{pred.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-300">
                      {pred.predicted_home_score} – {pred.predicted_away_score}
                    </span>
                    <span className={`text-sm font-bold w-12 text-right ${
                      pred.points_awarded === 3 ? 'text-amber-400' :
                      pred.points_awarded >= 1 ? 'text-green-400' : 'text-slate-600'
                    }`}>
                      +{pred.points_awarded}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

const EVENT_ICONS: Record<string, string> = {
  Goal: '⚽',
  Card: '🟨',
  subst: '🔄',
  Var: '📺',
};

function MatchEvent({ event, homeName }: { event: FixtureEvent; homeName: string }) {
  const isHome = event.team.name === homeName;
  const icon = event.type === 'Card'
    ? (event.detail.includes('Red') ? '🟥' : '🟨')
    : EVENT_ICONS[event.type] || '•';

  return (
    <div className={`flex items-center gap-3 px-5 py-2.5 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
      <span className="text-xs text-slate-500 w-8 text-center flex-shrink-0">
        {event.time.elapsed}'
      </span>
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className={`flex-1 ${isHome ? 'text-left' : 'text-right'}`}>
        <span className="text-sm text-white">{event.player.name}</span>
        {event.assist.name && (
          <span className="text-xs text-slate-500 ml-1">({event.assist.name})</span>
        )}
        <span className="text-xs text-slate-600 ml-1">{event.detail}</span>
      </div>
    </div>
  );
}
