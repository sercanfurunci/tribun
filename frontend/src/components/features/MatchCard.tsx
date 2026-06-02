import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Match } from '../../types';

interface MatchCardProps {
  match: Match;
  prediction?: { predicted_home_score: number; predicted_away_score: number; points_awarded?: number };
  leagueId?: string;
}

const statusConfig = {
  scheduled: { label: 'Upcoming', variant: 'blue' as const },
  live: { label: 'LIVE', variant: 'red' as const },
  finished: { label: 'Finished', variant: 'slate' as const },
  postponed: { label: 'Postponed', variant: 'yellow' as const },
};

function TeamFlag({ logo, name }: { logo?: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="size-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
        {logo ? (
          <img src={logo} alt={name} className="size-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-slate-300">{name[0]}</span>
        )}
      </div>
      <span className="text-sm font-semibold text-white text-center max-w-[80px] leading-tight">{name}</span>
    </div>
  );
}

export function MatchCard({ match, prediction, leagueId }: MatchCardProps) {
  const { label, variant } = statusConfig[match.status];

  return (
    <Link to={`/matches/${match.id}${leagueId ? `?leagueId=${leagueId}` : ''}`}>
      <Card className="hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 cursor-pointer group">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={variant}>{label}</Badge>
              {match.tournament && (
                <span className="text-xs text-slate-500 truncate max-w-[120px]">{match.tournament}</span>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {match.status === 'scheduled'
                ? format(new Date(match.kickoff_time), 'dd MMM, HH:mm')
                : format(new Date(match.kickoff_time), 'dd MMM')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <TeamFlag logo={match.home_team_logo} name={match.home_team} />

            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              {match.status === 'finished' ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">{match.home_score}</span>
                  <span className="text-slate-500 text-xl">–</span>
                  <span className="text-3xl font-bold text-white">{match.away_score}</span>
                </div>
              ) : match.status === 'live' ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">{match.home_score ?? 0}</span>
                  <span className="text-red-400 text-xl font-bold animate-pulse">–</span>
                  <span className="text-3xl font-bold text-white">{match.away_score ?? 0}</span>
                </div>
              ) : (
                <span className="text-slate-500 text-lg font-medium">vs</span>
              )}

              {prediction && (
                <div className="mt-2 px-3 py-1 rounded-lg bg-slate-700/60 border border-slate-600/50">
                  <span className="text-xs text-slate-400">Your pick: </span>
                  <span className="text-xs font-bold text-green-400">
                    {prediction.predicted_home_score} – {prediction.predicted_away_score}
                  </span>
                  {prediction.points_awarded !== undefined && match.status === 'finished' && (
                    <span className={`ml-2 text-xs font-bold ${
                      prediction.points_awarded === 3 ? 'text-amber-400' :
                      prediction.points_awarded >= 1 ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      +{prediction.points_awarded}pts
                    </span>
                  )}
                </div>
              )}
            </div>

            <TeamFlag logo={match.away_team_logo} name={match.away_team} />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
