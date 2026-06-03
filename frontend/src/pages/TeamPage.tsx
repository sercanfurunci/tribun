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

const STATUS_MAP: Record<string, 'scheduled' | 'live' | 'finished' | 'postponed'> = {
  NS: 'scheduled', '1H': 'live', HT: 'live', '2H': 'live', ET: 'live',
  P: 'live', FT: 'finished', AET: 'finished', PEN: 'finished',
  PST: 'postponed', CANC: 'postponed', LIVE: 'live',
};

const POSITION_TR: Record<string, string> = {
  Goalkeeper: 'Kaleci',
  Defender: 'Defans',
  Midfielder: 'Orta Saha',
  Midfield: 'Orta Saha',
  Forward: 'Forvet',
  Striker: 'Santrafor',
  Winger: 'Kanat',
  Attacker: 'Hücum',
  Manager: 'Teknik Direktör',
  Coach: 'Antrenör',
  'Centre-Back': 'Stoper',
  'Centre Back': 'Stoper',
  'Full-Back': 'Bek',
  'Left-Back': 'Sol Bek',
  'Right-Back': 'Sağ Bek',
  'Left Back': 'Sol Bek',
  'Right Back': 'Sağ Bek',
  'Defensive Midfielder': 'Defansif Orta Saha',
  'Defensive Midfield': 'Defansif Orta Saha',
  'Central Midfielder': 'Merkez Orta Saha',
  'Central Midfield': 'Merkez Orta Saha',
  'Attacking Midfielder': 'Ofansif Orta Saha',
  'Attacking Midfield': 'Ofansif Orta Saha',
  'Left Winger': 'Sol Kanat',
  'Left Wing': 'Sol Kanat',
  'Right Winger': 'Sağ Kanat',
  'Right Wing': 'Sağ Kanat',
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

function EventRow({ event, teamId, dateLocale, lang }: { event: SportsDBTeamEvent; teamId: string; dateLocale: Locale; lang: string }) {
  const status = mapStatus(event.strStatus, event.strPostponed);
  const isFinished = status === 'finished';
  const isHome = event.idHomeTeam === teamId;
  const myScore = isHome ? event.intHomeScore : event.intAwayScore;
  const theirScore = isHome ? event.intAwayScore : event.intHomeScore;
  const won = isFinished && myScore !== null && theirScore !== null && Number(myScore) > Number(theirScore);
  const drew = isFinished && myScore !== null && theirScore !== null && Number(myScore) === Number(theirScore);
  const opponent = isHome ? event.strAwayTeam : event.strHomeTeam;
  const opponentBadge = isHome ? event.strAwayTeamBadge : event.strHomeTeamBadge;

  const resultColor = !isFinished ? '' : won ? 'text-green-400' : drew ? 'text-slate-400' : 'text-red-400';
  const resultBg = !isFinished ? '' : won ? 'bg-green-500/10 border-green-500/20' : drew ? 'bg-slate-700/40 border-white/10' : 'bg-red-500/10 border-red-500/20';

  const resultLabel = !isFinished ? '' : lang === 'tr'
    ? (won ? 'G' : drew ? 'B' : 'M')
    : (won ? 'W' : drew ? 'D' : 'L');

  const locationLabel = lang === 'tr'
    ? (isHome ? 'ev' : 'dep')
    : (isHome ? 'vs' : '@');

  return (
    <div
      className="flex items-center gap-3 px-4 sm:px-5 py-3.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {isFinished && (
        <span className={`text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${resultColor} ${resultBg}`}>
          {resultLabel}
        </span>
      )}

      <Link to={`/teams/${encodeURIComponent(opponent)}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
        {opponentBadge ? (
          <img src={opponentBadge} alt={opponent} className="size-7 object-contain shrink-0" />
        ) : (
          <div className="size-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-slate-300">
            {opponent[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors">
            <span className="text-slate-500 mr-1">{locationLabel}</span>{opponent}
          </p>
          <p className="text-[11px] text-slate-600 truncate">{translateLeague(event.strLeague, lang)}</p>
        </div>
      </Link>

      <div className="text-right shrink-0">
        {isFinished ? (
          <span className="font-score text-lg text-white">
            {isHome ? event.intHomeScore : event.intAwayScore} – {isHome ? event.intAwayScore : event.intHomeScore}
          </span>
        ) : (
          <div>
            <p className="text-xs text-slate-300 font-semibold">
              {event.dateEvent
                ? format(new Date(event.strTimestamp || event.dateEvent), 'dd MMM', { locale: dateLocale })
                : '—'}
            </p>
            <p className="text-[10px] text-slate-600">
              {event.strTimestamp
                ? format(new Date(event.strTimestamp), 'HH:mm', { locale: dateLocale })
                : ''}
            </p>
          </div>
        )}
      </div>
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
        <Icon name="ball" size={40} className="text-slate-700" />
        <p className="text-slate-500">{lang === 'tr' ? 'Takım bulunamadı' : 'Team not found'}: {name}</p>
        <Link to="/matches" className="text-sm text-green-500 hover:text-green-400">
          ← {lang === 'tr' ? 'Maçlara dön' : 'Back to matches'}
        </Link>
      </div>
    );
  }

  const primaryColor = team.strColour1 ?? '#16a34a';

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
      <div
        className="relative rounded-[24px] overflow-hidden"
        style={{ minHeight: 200 }}
      >
        {team.strFanart1 && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${team.strFanart1})` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: team.strFanart1
              ? 'linear-gradient(to right, rgba(6,13,26,0.92) 40%, rgba(6,13,26,0.6) 100%)'
              : `linear-gradient(135deg, ${primaryColor}22 0%, #0B1220 60%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(600px 300px at 0% 50%, ${primaryColor}30, transparent 60%)` }}
        />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10 flex items-center gap-6">
          {team.strBadge && (
            <div
              className="size-20 sm:size-24 rounded-2xl flex items-center justify-center shrink-0 p-2"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <img src={team.strBadge} alt={team.strTeam} className="size-full object-contain" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              {[team.strColour1, team.strColour2].filter(Boolean).map((c, i) => (
                <span key={i} className="size-3 rounded-full border border-white/10 shrink-0" style={{ background: c! }} />
              ))}
              {team.strTeamShort && (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{team.strTeamShort}</span>
              )}
            </div>

            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
              {team.strTeam}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              {team.strCountry && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Icon name="pin" size={12} /> {team.strCountry}
                </span>
              )}
              {team.strStadium && (
                <span className="text-xs text-slate-500">· {team.strStadium}
                  {team.intStadiumCapacity && ` (${Number(team.intStadiumCapacity).toLocaleString()})`}
                </span>
              )}
              {team.intFormedYear && (
                <span className="text-xs text-slate-600">· {formedLabel} {team.intFormedYear}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout on lg */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">

        {/* Left column */}
        <div className="space-y-6">

          {/* Description */}
          {description && (
            <div
              className="rounded-[20px] p-5 sm:p-6"
              style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h2 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-widest mb-3">{aboutLabel}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {showFullDesc ? description : shortDesc}
              </p>
              {description.length > 400 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-3 text-xs text-green-500 hover:text-green-400 transition-colors font-semibold"
                >
                  {showFullDesc ? readLessLabel : readMoreLabel}
                </button>
              )}
            </div>
          )}

          {/* Players */}
          {players.length > 0 && (
            <div
              className="rounded-[20px] overflow-hidden"
              style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-widest">
                  {squadLabel} · {players.length} {playerLabel}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
                {players.map((p) => (
                  <div
                    key={p.idPlayer}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div
                      className="size-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      {p.strThumb ? (
                        <img src={p.strThumb} alt={p.strPlayer} className="size-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">{p.strPlayer[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{p.strPlayer}</p>
                      <p className="text-[10px] text-slate-600 truncate">
                        {translatePosition(p.strPosition, lang) ?? '—'}
                      </p>
                    </div>
                    {p.strNumber && (
                      <span className="ml-auto font-score text-sm text-slate-600 shrink-0">{p.strNumber}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Upcoming matches */}
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-widest">{upcomingLabel}</h2>
            </div>
            {nextEvents.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-600 text-center">{noUpcomingLabel}</p>
            ) : (
              <div>
                {nextEvents.slice(0, 5).map((e) => (
                  <EventRow key={e.idEvent} event={e} teamId={teamId!} dateLocale={dateLocale} lang={lang} />
                ))}
              </div>
            )}
          </div>

          {/* Last results */}
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-widest">{lastResultsLabel}</h2>
            </div>
            {lastEvents.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-600 text-center">{noResultsLabel}</p>
            ) : (
              <div>
                {lastEvents.slice(0, 5).map((e) => (
                  <EventRow key={e.idEvent} event={e} teamId={teamId!} dateLocale={dateLocale} lang={lang} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
