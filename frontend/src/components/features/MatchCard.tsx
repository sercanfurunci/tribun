import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { Badge } from '../ui/Badge';
import { Match } from '../../types';
import { useLanguageStore, useT } from '../../store/language';
import { formatMatchDay, formatTeamName } from '../../lib/matchDisplay';
import type { TranslationKey } from '../../i18n/translations';

interface MatchCardProps {
  match: Match;
  prediction?: { predicted_home_score: number; predicted_away_score: number; points_awarded?: number };
  leagueId?: string;
}

const statusConfig: Record<Match['status'], { key: TranslationKey; variant: 'pending' | 'live' | 'default' | 'gold' }> = {
  scheduled: { key: 'match.upcomingBadge', variant: 'pending' },
  live:      { key: 'match.liveBadge',     variant: 'live'    },
  finished:  { key: 'match.ftBadge',       variant: 'default' },
  postponed: { key: 'match.pstBadge',      variant: 'gold'    },
};

function TeamBlock({ logo, name, score, isLive }: {
  logo?: string;
  name: string;
  score?: number | null;
  isLive?: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      <div className="size-12 sm:size-14 rounded-xl bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center overflow-hidden shrink-0">
        {logo ? (
          <img src={logo} alt={name} className="size-8 sm:size-10 object-contain" loading="lazy" />
        ) : (
          <span className="font-heading font-bold text-lg text-[#666666]">{name[0]}</span>
        )}
      </div>
      <span
        className="text-[12px] sm:text-[13px] font-semibold text-[#111111] text-center leading-tight w-full px-1 line-clamp-1"
        title={name}
      >
        {name}
      </span>
      {score !== undefined && score !== null && (
        <span className={`font-display text-3xl sm:text-4xl leading-none ${isLive ? 'text-[#8B1E1E]' : 'text-[#111111]'}`}>
          {score}
        </span>
      )}
    </div>
  );
}

export function MatchCard({ match, prediction, leagueId }: MatchCardProps) {
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);
  const dateLocale = lang === 'tr' ? trLocale : enUS;
  const { key, variant } = statusConfig[match.status];
  const label = t(key);
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const showScore = isLive || isFinished;
  const homeTeam = formatTeamName(match.home_team, lang);
  const awayTeam = formatTeamName(match.away_team, lang);
  const matchDay = formatMatchDay(match.match_day, lang);

  return (
    <Link to={`/matches/${match.id}${leagueId ? `?leagueId=${leagueId}` : ''}`} className="block">
      <div className={`match-card h-full ${isLive ? 'match-card--live' : ''}`}>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 pb-3">
          <Badge variant={variant}>{label}</Badge>
          <div className="text-right min-w-0">
            {matchDay && (
              <p className="text-[10px] text-[#999390] uppercase tracking-[0.2em] truncate font-heading">
                {matchDay}
              </p>
            )}
            <p className="text-[11px] text-[#666666] tabular-nums sm:text-xs font-sans">
              {showScore
                ? format(new Date(match.kickoff_time), 'dd MMM yyyy', { locale: dateLocale })
                : format(new Date(match.kickoff_time), 'dd MMM · HH:mm', { locale: dateLocale })}
            </p>
          </div>
        </div>

        <div className="px-4 pb-5 sm:px-5 sm:pb-6">
          {showScore ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TeamBlock logo={match.home_team_logo} name={homeTeam} score={match.home_score} isLive={isLive} />
              <div className="flex flex-col items-center justify-center gap-1 shrink-0 px-1">
                <span className="font-display text-2xl text-[#D9D4CC] leading-none">:</span>
                {isLive && <span className="live-dot" />}
              </div>
              <TeamBlock logo={match.away_team_logo} name={awayTeam} score={match.away_score} isLive={isLive} />
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TeamBlock logo={match.home_team_logo} name={homeTeam} />
              <div className="flex flex-col items-center justify-center shrink-0 px-1 gap-1">
                <span className="h-px w-5 bg-[#E8E4DE]" />
                <span className="font-heading text-[10px] font-bold tracking-[0.25em] text-[#999390] uppercase">
                  {t('match.vs')}
                </span>
                <span className="h-px w-5 bg-[#E8E4DE]" />
                <span className="text-[11px] tabular-nums text-[#8B1E1E] font-semibold font-sans">
                  {format(new Date(match.kickoff_time), 'HH:mm', { locale: dateLocale })}
                </span>
              </div>
              <TeamBlock logo={match.away_team_logo} name={awayTeam} />
            </div>
          )}

          {prediction && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FEF2F2] border border-[#FECACA] text-[#8B1E1E]">
                <span>{t('match.yourPick')}</span>
                <span className="tabular-nums">{prediction.predicted_home_score}–{prediction.predicted_away_score}</span>
                {prediction.points_awarded !== undefined && isFinished && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    prediction.points_awarded === 3
                      ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                      : prediction.points_awarded >= 1
                      ? 'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
                      : 'bg-[#F2EFE9] text-[#999390] border border-[#E8E4DE]'
                  }`}>
                    +{prediction.points_awarded}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {isLive && (
          <div className="h-0.5 bg-[#E8E4DE]">
            <div className="h-full bg-[#8B1E1E] w-3/5" />
          </div>
        )}
      </div>
    </Link>
  );
}
