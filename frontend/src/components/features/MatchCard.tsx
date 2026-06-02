import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import { Match } from '../../types';

interface MatchCardProps {
  match: Match;
  prediction?: { predicted_home_score: number; predicted_away_score: number; points_awarded?: number };
  leagueId?: string;
}

const statusConfig = {
  scheduled: { label: 'Upcoming', variant: 'blue' as const },
  live: { label: 'LIVE', variant: 'live' as const },
  finished: { label: 'FT', variant: 'slate' as const },
  postponed: { label: 'PST', variant: 'yellow' as const },
};

function TeamBlock({ logo, name, score, isLive }: {
  logo?: string;
  name: string;
  score?: number | null;
  isLive?: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2.5 min-w-0">
      <div
        className="size-14 sm:size-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {logo ? (
          <img src={logo} alt={name} className="size-10 sm:size-12 object-contain" loading="lazy" />
        ) : (
          <span className="font-heading font-bold text-xl text-slate-300">{name[0]}</span>
        )}
      </div>
      <span
        className="text-[13px] font-semibold text-slate-100 text-center leading-tight w-full px-1 line-clamp-2"
        style={{ wordBreak: 'break-word', hyphens: 'auto' }}
        title={name}
      >
        {name}
      </span>
      {score !== undefined && score !== null && (
        <span
          className="font-score text-4xl sm:text-5xl leading-none text-white"
          style={isLive ? { textShadow: '0 0 16px rgba(239,68,68,0.6)' } : undefined}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export function MatchCard({ match, prediction, leagueId }: MatchCardProps) {
  const { label, variant } = statusConfig[match.status];
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const showScore = isLive || isFinished;

  return (
    <Link to={`/matches/${match.id}${leagueId ? `?leagueId=${leagueId}` : ''}`} className="block match-card-link">
      <div
        className={`match-card rounded-2xl overflow-hidden h-full ${isLive ? 'match-card--live' : ''}`}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Header strip */}
        <div
          className="flex items-center justify-between px-4 py-2.5 gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Badge variant={variant}>{label}</Badge>
          <div className="text-right min-w-0 flex-1">
            {match.match_day && (
              <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate font-heading">
                {match.match_day}
              </p>
            )}
            <p className="text-xs text-slate-400 tabular-nums">
              {showScore
                ? format(new Date(match.kickoff_time), 'dd MMM yyyy')
                : format(new Date(match.kickoff_time), 'dd MMM · HH:mm')}
            </p>
          </div>
        </div>

        {/* Teams + score body */}
        <div className="px-3 sm:px-4 py-5">
          {showScore ? (
            /* Finished / Live: teams flanking centered score */
            <div className="flex items-start gap-2">
              <TeamBlock logo={match.home_team_logo} name={match.home_team} />
              <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 w-16 pt-2">
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-score text-4xl sm:text-5xl leading-none text-white"
                    style={isLive ? { textShadow: '0 0 16px rgba(239,68,68,0.6)' } : undefined}
                  >
                    {match.home_score ?? 0}
                  </span>
                  <span className="font-score text-2xl text-slate-600 leading-none">:</span>
                  <span
                    className="font-score text-4xl sm:text-5xl leading-none text-white"
                    style={isLive ? { textShadow: '0 0 16px rgba(239,68,68,0.6)' } : undefined}
                  >
                    {match.away_score ?? 0}
                  </span>
                </div>
                {isLive && (
                  <span className="text-[10px] font-bold text-red-400 live-indicator">● LIVE</span>
                )}
              </div>
              <TeamBlock logo={match.away_team_logo} name={match.away_team} />
            </div>
          ) : (
            /* Scheduled: teams with VS + kickoff pill */
            <div className="flex items-start gap-2">
              <TeamBlock logo={match.home_team_logo} name={match.home_team} />
              <div className="flex flex-col items-center justify-center gap-2 shrink-0 w-16 pt-3">
                <span className="font-score text-2xl text-slate-600 leading-none">VS</span>
                <span
                  className="text-[11px] font-bold tabular-nums px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                  style={{ background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.22)' }}
                >
                  {format(new Date(match.kickoff_time), 'HH:mm')}
                </span>
              </div>
              <TeamBlock logo={match.away_team_logo} name={match.away_team} />
            </div>
          )}

          {/* Prediction pill */}
          {prediction && (
            <div className="mt-4 flex justify-center">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(22,163,74,0.12)',
                  border: '1px solid rgba(22,163,74,0.25)',
                  color: '#4ade80',
                }}
              >
                <span>Your pick:</span>
                <span className="tabular-nums">{prediction.predicted_home_score}–{prediction.predicted_away_score}</span>
                {prediction.points_awarded !== undefined && isFinished && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      prediction.points_awarded === 3
                        ? 'bg-amber-400/20 text-amber-400'
                        : prediction.points_awarded >= 1
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-500'
                    }`}
                  >
                    +{prediction.points_awarded}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live progress bar */}
        {isLive && (
          <div className="h-0.5 bg-red-500/15">
            <div className="h-full bg-red-500 live-indicator w-3/5" />
          </div>
        )}
      </div>
    </Link>
  );
}
