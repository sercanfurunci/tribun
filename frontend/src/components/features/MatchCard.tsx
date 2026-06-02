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

function TeamBlock({ logo, name, score, isLive, align }: {
  logo?: string;
  name: string;
  score?: number | null;
  isLive?: boolean;
  align: 'left' | 'right';
}) {
  const isRight = align === 'right';
  return (
    <div className={`flex-1 flex flex-col items-center gap-2 min-w-0 ${isRight ? '' : ''}`}>
      <div
        className="size-12 sm:size-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {logo ? (
          <img src={logo} alt={name} className="size-9 sm:size-11 object-contain" loading="lazy" />
        ) : (
          <span className="font-heading font-bold text-lg text-slate-300">{name[0]}</span>
        )}
      </div>
      <span
        className="text-xs font-semibold text-slate-200 text-center leading-tight w-full px-1"
        style={{ wordBreak: 'break-word', hyphens: 'auto' }}
      >
        {name}
      </span>
      {score !== undefined && score !== null && (
        <span
          className="font-score text-3xl sm:text-4xl leading-none text-white"
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
        className={`match-card rounded-2xl overflow-hidden ${isLive ? 'match-card--live' : ''}`}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Badge variant={variant}>{label}</Badge>
          <div className="text-right min-w-0">
            {match.match_day && (
              <p className="text-[10px] text-slate-600 uppercase tracking-wide truncate max-w-[140px]">
                {match.match_day}
              </p>
            )}
            <p className="text-xs text-slate-500">
              {showScore
                ? format(new Date(match.kickoff_time), 'dd MMM yyyy')
                : format(new Date(match.kickoff_time), 'dd MMM · HH:mm')}
            </p>
          </div>
        </div>

        {/* Teams + Score */}
        <div className="px-4 py-4">
          {showScore ? (
            /* Finished / Live: horizontal layout with score in middle */
            <div className="flex items-center gap-2">
              <TeamBlock logo={match.home_team_logo} name={match.home_team} align="left" />
              <div className="flex flex-col items-center gap-1 shrink-0 w-16">
                <div className="flex items-center gap-1">
                  <span
                    className="font-score text-4xl leading-none text-white"
                    style={isLive ? { textShadow: '0 0 16px rgba(239,68,68,0.6)' } : undefined}
                  >
                    {match.home_score ?? 0}
                  </span>
                  <span className="font-score text-2xl text-slate-600 leading-none">:</span>
                  <span
                    className="font-score text-4xl leading-none text-white"
                    style={isLive ? { textShadow: '0 0 16px rgba(239,68,68,0.6)' } : undefined}
                  >
                    {match.away_score ?? 0}
                  </span>
                </div>
                {isLive && (
                  <span className="text-[10px] font-bold text-red-400 live-indicator">● LIVE</span>
                )}
              </div>
              <TeamBlock logo={match.away_team_logo} name={match.away_team} align="right" />
            </div>
          ) : (
            /* Scheduled: teams with VS and kickoff time */
            <div className="flex items-center gap-2">
              <TeamBlock logo={match.home_team_logo} name={match.home_team} align="left" />
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-14">
                <span className="font-score text-xl text-slate-600 leading-none">VS</span>
                <span
                  className="text-xs font-bold tabular-nums px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(22,163,74,0.1)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.2)' }}
                >
                  {format(new Date(match.kickoff_time), 'HH:mm')}
                </span>
              </div>
              <TeamBlock logo={match.away_team_logo} name={match.away_team} align="right" />
            </div>
          )}

          {/* Prediction pill */}
          {prediction && (
            <div className="mt-3 flex justify-center">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(22,163,74,0.1)',
                  border: '1px solid rgba(22,163,74,0.25)',
                  color: '#4ade80',
                }}
              >
                <span>Your pick:</span>
                <span>{prediction.predicted_home_score}–{prediction.predicted_away_score}</span>
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
