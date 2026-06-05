import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { teamApi, SportsDBTeamEvent } from '../services/team';
import { Spinner } from '../components/ui/Spinner';
import { Icon } from '../components/ui/Icon';
import { useLanguageStore } from '../store/language';
import { formatTeamName } from '../lib/matchDisplay';
import type { Lang } from '../i18n/translations';

const STATUS_MAP: Record<string, 'scheduled' | 'live' | 'finished' | 'postponed'> = {
  NS: 'scheduled', '1H': 'live', HT: 'live', '2H': 'live', ET: 'live',
  P: 'live', FT: 'finished', AET: 'finished', PEN: 'finished',
  PST: 'postponed', CANC: 'postponed', LIVE: 'live',
};

const POSITION_TR: Record<string, string> = {
  Goalkeeper: 'Kaleci', Defender: 'Defans', Midfielder: 'Orta Saha',
  Midfield: 'Orta Saha', Forward: 'Forvet', Striker: 'Santrafor',
  Winger: 'Kanat', Attacker: 'Hücum', Manager: 'Teknik Direktör',
  Coach: 'Antrenör',
  'Centre-Back': 'Stoper', 'Centre Back': 'Stoper', 'Center Back': 'Stoper',
  'Centre-Forward': 'Santrafor', 'Center-Forward': 'Santrafor', 'Centre Forward': 'Santrafor',
  'Full-Back': 'Bek', 'Left-Back': 'Sol Bek', 'Right-Back': 'Sağ Bek',
  'Left Back': 'Sol Bek', 'Right Back': 'Sağ Bek',
  'Left Midfielder': 'Sol Orta Saha', 'Left Midfield': 'Sol Orta Saha',
  'Right Midfielder': 'Sağ Orta Saha', 'Right Midfield': 'Sağ Orta Saha',
  'Defensive Midfielder': 'Defansif Orta Saha', 'Defensive Midfield': 'Defansif Orta Saha',
  'Central Midfielder': 'Merkez Orta Saha', 'Central Midfield': 'Merkez Orta Saha',
  'Attacking Midfielder': 'Ofansif Orta Saha', 'Attacking Midfield': 'Ofansif Orta Saha',
  'Left Winger': 'Sol Kanat', 'Left Wing': 'Sol Kanat',
  'Right Winger': 'Sağ Kanat', 'Right Wing': 'Sağ Kanat',
  'Wing-Back': 'Kanat Bek', 'Left Wing-Back': 'Sol Kanat Bek', 'Right Wing-Back': 'Sağ Kanat Bek',
  'Sweeper': 'Libero', 'Utility': 'Çok Yönlü',
};

const LEAGUE_TR: Record<string, string> = {
  'International Friendlies': 'Uluslararası Hazırlık',
  'FIFA World Cup': 'FIFA Dünya Kupası',
  'UEFA Champions League': 'UEFA Şampiyonlar Ligi',
  'UEFA Europa League': 'UEFA Avrupa Ligi',
  'UEFA Conference League': 'UEFA Konferans Ligi',
  'UEFA Nations League': 'UEFA Uluslar Ligi',
  'UEFA European Championship': 'UEFA Avrupa Şampiyonası',
  'Copa America': 'Copa América',
  'Africa Cup of Nations': 'Afrika Uluslar Kupası',
  'AFC Asian Cup': 'Asya Kupası',
};

function translatePosition(pos: string | null, lang: string): string | null {
  if (!pos) return null;
  if (lang !== 'tr') return pos;
  return POSITION_TR[pos] ?? pos;
}

function translateLeague(league: string, lang: string): string {
  if (lang !== 'tr') return league;
  return LEAGUE_TR[league] ?? league;
}

function mapStatus(strStatus: string, strPostponed: string) {
  if (strPostponed === 'yes') return 'postponed';
  return STATUS_MAP[strStatus] ?? 'scheduled';
}

function EventRow({ event, teamId, dateLocale, lang }: {
  event: SportsDBTeamEvent; teamId: string; dateLocale: Locale; lang: Lang;
}) {
  const status = mapStatus(event.strStatus, event.strPostponed);
  const isFinished = status === 'finished';
  const isHome = event.idHomeTeam === teamId;
  const myScore = isHome ? event.intHomeScore : event.intAwayScore;
  const theirScore = isHome ? event.intAwayScore : event.intHomeScore;
  const won = isFinished && myScore !== null && theirScore !== null && Number(myScore) > Number(theirScore);
  const drew = isFinished && myScore !== null && theirScore !== null && Number(myScore) === Number(theirScore);
  const opponentRaw = isHome ? event.strAwayTeam : event.strHomeTeam;
  const opponent = formatTeamName(opponentRaw, lang);
  const opponentBadge = isHome ? event.strAwayTeamBadge : event.strHomeTeamBadge;

  const resultCls = !isFinished ? '' :
    won  ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]' :
    drew ? 'bg-[#F7F4EF] border-[#E8E4DE] text-[#666666]' :
           'bg-[#FEF2F2] border-[#FECACA] text-[#C1121F]';

  const resultLabel = !isFinished ? '' : lang === 'tr'
    ? (won ? 'G' : drew ? 'B' : 'M')
    : (won ? 'W' : drew ? 'D' : 'L');

  const locationLabel = lang === 'tr'
    ? (isHome ? 'ev' : 'dep')
    : (isHome ? 'vs' : '@');

  return (
    <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-[#F2EFE9]">
      {isFinished && (
        <span className={`text-xs font-black w-7 h-7 rounded flex items-center justify-center shrink-0 border ${resultCls}`}>
          {resultLabel}
        </span>
      )}

      <Link to={`/teams/${encodeURIComponent(opponentRaw)}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
        {opponentBadge ? (
          <img src={opponentBadge} alt={opponent} className="size-7 object-contain shrink-0" />
        ) : (
          <div className="size-7 rounded-full bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center shrink-0 text-xs font-bold text-[#666666]">
            {opponent[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111111] truncate group-hover:text-[#8B1E1E] transition-colors">
            <span className="text-[#999390] mr-1">{locationLabel}</span>{opponent}
          </p>
          <p className="text-[11px] text-[#999390] truncate">{translateLeague(event.strLeague, lang)}</p>
        </div>
      </Link>

      <div className="text-right shrink-0">
        {isFinished ? (
          <span className="font-display text-lg text-[#111111]">
            {isHome ? event.intHomeScore : event.intAwayScore} – {isHome ? event.intAwayScore : event.intHomeScore}
          </span>
        ) : (
          <div>
            <p className="text-xs text-[#666666] font-semibold">
              {event.dateEvent
                ? format(new Date(event.strTimestamp || event.dateEvent), 'dd MMM', { locale: dateLocale })
                : '—'}
            </p>
            <p className="text-[10px] text-[#999390]">
              {event.strTimestamp ? format(new Date(event.strTimestamp), 'HH:mm', { locale: dateLocale }) : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#E8E4DE]">
        <h2 className="font-heading font-black text-xs text-[#999390] uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function TeamPage() {
  const { name } = useParams<{ name: string }>();
  const lang = useLanguageStore((s) => s.lang);
  const dateLocale = lang === 'tr' ? trLocale : enUS;
  const [showFullDesc, setShowFullDesc] = React.useState(false);

  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team', 'search', name],
    queryFn: () => teamApi.search(name!),
    enabled: !!name,
    staleTime: 1000 * 60 * 60,
  });

  const team = teamData?.data.team;
  const teamId = team?.idTeam;

  const { data: nextData } = useQuery({
    queryKey: ['team-next', teamId],
    queryFn: () => teamApi.getNextEvents(teamId!),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 10,
  });

  const { data: lastData } = useQuery({
    queryKey: ['team-last', teamId],
    queryFn: () => teamApi.getLastEvents(teamId!),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 10,
  });

  const { data: playersData } = useQuery({
    queryKey: ['team-players', teamId],
    queryFn: () => teamApi.getPlayers(teamId!),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 60,
  });

  const nextEvents = nextData?.data.events ?? [];
  const lastEvents = lastData?.data.events ?? [];
  const players = playersData?.data.players ?? [];

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Icon name="ball" size={40} className="text-[#D9D4CC]" />
        <p className="text-[#999390]">{lang === 'tr' ? 'Takım bulunamadı' : 'Team not found'}: {name}</p>
        <Link to="/matches" className="text-sm text-[#8B1E1E] hover:text-[#6F1717] transition-colors">
          ← {lang === 'tr' ? 'Maçlara dön' : 'Back to matches'}
        </Link>
      </div>
    );
  }

  const description = lang === 'tr'
    ? (team.strDescriptionTR || team.strDescriptionEN || '')
    : (team.strDescriptionEN || '');

  const shortDesc = description.length > 400 ? description.slice(0, 400) + '…' : description;

  const formedLabel = lang === 'tr' ? 'Kur.' : 'Est.';
  const aboutLabel = lang === 'tr' ? 'Hakkında' : 'About';
  const squadLabel = lang === 'tr' ? 'Kadro' : 'Squad';
  const playerLabel = lang === 'tr' ? 'oyuncu' : 'players';
  const upcomingLabel = lang === 'tr' ? 'Gelecek Maçlar' : 'Upcoming Matches';
  const noUpcomingLabel = lang === 'tr' ? 'Yaklaşan maç yok' : 'No upcoming matches';
  const lastResultsLabel = lang === 'tr' ? 'Son Sonuçlar' : 'Last Results';
  const noResultsLabel = lang === 'tr' ? 'Henüz sonuç yok' : 'No results yet';
  const readMoreLabel = lang === 'tr' ? 'Devamını oku' : 'Read more';
  const readLessLabel = lang === 'tr' ? 'Daha az göster' : 'Show less';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero */}
      <div className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
        {team.strFanart1 && (
          <div
            className="h-32 sm:h-44 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${team.strFanart1})` }}
          >
            <div className="absolute inset-0 bg-[#111111]/40" />
          </div>
        )}
        <div className="px-6 py-6 flex items-center gap-5">
          {team.strBadge && (
            <div className="size-16 sm:size-20 rounded-lg bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center shrink-0 p-2 -mt-10 relative z-10 ring-2 ring-white">
              <img src={team.strBadge} alt={team.strTeam} className="size-full object-contain" />
            </div>
          )}
          <div className={`min-w-0 ${team.strBadge ? '' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              {[team.strColour1, team.strColour2].filter(Boolean).map((c, i) => (
                <span key={i} className="size-3 rounded-full border border-[#E8E4DE] shrink-0" style={{ background: c! }} />
              ))}
              {team.strTeamShort && (
                <span className="text-[10px] font-bold text-[#999390] uppercase tracking-widest ml-1">{team.strTeamShort}</span>
              )}
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#111111] leading-tight">
              {formatTeamName(team.strTeam, lang)}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {team.strCountry && (
                <span className="flex items-center gap-1 text-xs text-[#666666]">
                  <Icon name="pin" size={11} /> {formatTeamName(team.strCountry, lang)}
                </span>
              )}
              {team.strStadium && (
                <span className="text-xs text-[#999390]">
                  · {team.strStadium}{team.intStadiumCapacity && ` (${Number(team.intStadiumCapacity).toLocaleString()})`}
                </span>
              )}
              {team.intFormedYear && (
                <span className="text-xs text-[#999390]">· {formedLabel} {team.intFormedYear}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-6">
          {description && (
            <Section title={`${aboutLabel}${lang === 'tr' && !team.strDescriptionTR ? ' (EN)' : ''}`}>
              <div className="p-5">
                <p className="text-sm text-[#666666] leading-relaxed">{showFullDesc ? description : shortDesc}</p>
                {description.length > 400 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-3 text-xs text-[#8B1E1E] hover:text-[#6F1717] transition-colors font-semibold"
                  >
                    {showFullDesc ? readLessLabel : readMoreLabel}
                  </button>
                )}
              </div>
            </Section>
          )}

          {players.length > 0 && (
            <Section title={`${squadLabel} · ${players.length} ${playerLabel}`}>
              <div className="grid grid-cols-2 sm:grid-cols-3">
                {players.map((p) => (
                  <div key={p.idPlayer} className="flex items-center gap-2.5 px-4 py-3 border-b border-[#F2EFE9]">
                    <div className="size-9 rounded-lg overflow-hidden shrink-0 bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center">
                      {p.strThumb ? (
                        <img src={p.strThumb} alt={p.strPlayer} className="size-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-xs font-bold text-[#666666]">{p.strPlayer[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111111] truncate">{p.strPlayer}</p>
                      <p className="text-[10px] text-[#999390] truncate">{translatePosition(p.strPosition, lang) ?? '—'}</p>
                    </div>
                    {p.strNumber && (
                      <span className="ml-auto font-display text-sm text-[#999390] shrink-0">{p.strNumber}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title={upcomingLabel}>
            {nextEvents.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#999390] text-center">{noUpcomingLabel}</p>
            ) : (
              <div>
                {nextEvents.slice(0, 5).map((e) => (
                  <EventRow key={e.idEvent} event={e} teamId={teamId!} dateLocale={dateLocale} lang={lang} />
                ))}
              </div>
            )}
          </Section>

          <Section title={lastResultsLabel}>
            {lastEvents.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#999390] text-center">{noResultsLabel}</p>
            ) : (
              <div>
                {lastEvents.slice(0, 5).map((e) => (
                  <EventRow key={e.idEvent} event={e} teamId={teamId!} dateLocale={dateLocale} lang={lang} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
