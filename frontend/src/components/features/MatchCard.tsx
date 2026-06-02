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

function TeamLogo({ logo, name }: { logo?: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
      <div
        className="size-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {logo ? (
          <img src={logo} alt={name} className="size-10 object-contain" />
        ) : (
          <span className="font-heading font-bold text-xl text-slate-300">{name[0]}</span>
        )}
      </div>
      <span className="text-xs font-semibold text-slate-300 text-center leading-tight w-full max-w-[72px] truncate">
        {name}
      </span>
    </div>
  );
}

export function MatchCard({ match, prediction, leagueId }: MatchCardProps) {
  const { label, variant } = statusConfig[match.status];
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <Link to={`/matches/${match.id}${leagueId ? `?leagueId=${leagueId}` : ''}`}>
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
        style={{
          background: 'rgba(12, 22, 40, 0.7)',
          border: isLive
            ? '1px solid rgba(239,68,68,0.25)'
            : '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.borderColor = isLive
            ? 'rgba(239,68,68,0.4)'
            : 'rgba(22,163,74,0.25)';
          (e.currentTarget as HTMLElement).style.boxShadow = isLive
            ? '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(239,68,68,0.1)'
            : '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(22,163,74,0.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = '';
          (e.currentTarget as HTMLElement).style.borderColor = isLive
            ? 'rgba(239,68,68,0.25)'
            : 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <Badge variant={variant}>{label}</Badge>
          <div className="text-right">
            {match.tournament && (
              <p className="text-[10px] text-slate-600 uppercase tracking-wide truncate max-w-[120px]">
                {match.tournament}
              </p>
            )}
            <p className="text-xs text-slate-500">
              {match.status === 'scheduled'
                ? format(new Date(match.kickoff_time), 'dd MMM · HH:mm')
                : format(new Date(match.kickoff_time), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        {/* Match row */}
        <div className="flex items-center px-4 pb-3 gap-3">
          <TeamLogo logo={match.home_team_logo} name={match.home_team} />

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 shrink-0 w-20">
            {isFinished || isLive ? (
              <div className="flex items-center gap-1.5">
                <span
                  className="font-score text-4xl leading-none text-white"
                  style={{ textShadow: isLive ? '0 0 12px rgba(239,68,68,0.5)' : undefined }}
                >
                  {match.home_score ?? 0}
                </span>
                <span className="text-slate-600 font-score text-2xl leading-none">:</span>
                <span
                  className="font-score text-4xl leading-none text-white"
                  style={{ textShadow: isLive ? '0 0 12px rgba(239,68,68,0.5)' : undefined }}
                >
                  {match.away_score ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-score text-2xl text-slate-600 leading-none">VS</span>
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">
                  {format(new Date(match.kickoff_time), 'HH:mm')}
                </span>
              </div>
            )}

            {/* Prediction pill */}
            {prediction && (
              <div
                className="px-2.5 py-1 rounded-full text-[10px] font-bold mt-0.5"
                style={{
                  background: 'rgba(22,163,74,0.12)',
                  border: '1px solid rgba(22,163,74,0.25)',
                  color: '#4ade80',
                }}
              >
                {prediction.predicted_home_score}–{prediction.predicted_away_score}
                {prediction.points_awarded !== undefined && isFinished && (
                  <span className={`ml-1.5 ${
                    prediction.points_awarded === 3 ? 'text-amber-400' :
                    prediction.points_awarded >= 1 ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    +{prediction.points_awarded}
                  </span>
                )}
              </div>
            )}
          </div>

          <TeamLogo logo={match.away_team_logo} name={match.away_team} />
        </div>

        {/* Live progress bar */}
        {isLive && (
          <div className="h-0.5 w-full bg-red-500/20">
            <div className="h-full bg-red-500 live-indicator" style={{ width: '60%' }} />
          </div>
        )}
      </div>
    </Link>
  );
}
