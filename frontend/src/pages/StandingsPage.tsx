import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Standing } from '../services/football';
import { matchesApi } from '../services/matches';
import { Spinner } from '../components/ui/Spinner';
import { useLanguageStore, useT } from '../store/language';
import { formatGroupName, formatTeamName } from '../lib/matchDisplay';
import type { TranslationKey } from '../i18n/translations';

const TOURNAMENTS = [
  { name: 'FIFA World Cup 2026', leagueId: 1, season: 2026 },
];

function FormBadge({ result }: { result: string }) {
  const cls: Record<string, string> = {
    W: 'bg-[#DCFCE7] text-[#166534]',
    D: 'bg-[#F2EFE9] text-[#666666]',
    L: 'bg-[#FEF2F2] text-[#C1121F]',
  };
  return (
    <span className={`inline-flex items-center justify-center size-5 rounded text-[10px] font-bold ${cls[result] ?? 'bg-[#F2EFE9] text-[#999390]'}`}>
      {result}
    </span>
  );
}

// Shared fixed column template: rank, team, P, W, D, L, GD, Pts, Form.
// Header and rows must use the same template so columns never shift.
const GRID_COLS =
  'grid grid-cols-[40px_1fr_60px_60px_60px_60px_70px_70px] sm:grid-cols-[40px_1fr_60px_60px_60px_60px_70px_70px_90px] items-center';

function StandingsGroup({ standings, t }: { standings: Standing[]; t: (key: TranslationKey) => string }) {
  const { lang } = useLanguageStore();
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px] text-sm">
        <div className={`${GRID_COLS} border-b border-[#E8E4DE] text-xs text-[#999390]`}>
          <div className="py-2.5 pl-4">#</div>
          <div className="py-2.5 px-2">{t('standings.col.team')}</div>
          <div className="py-2.5 text-center">{t('standings.col.played')}</div>
          <div className="py-2.5 text-center">{t('standings.col.wins')}</div>
          <div className="py-2.5 text-center">{t('standings.col.draws')}</div>
          <div className="py-2.5 text-center">{t('standings.col.losses')}</div>
          <div className="py-2.5 text-center">{t('standings.col.gd')}</div>
          <div className="py-2.5 text-center font-bold">{t('standings.col.pts')}</div>
          <div className="py-2.5 text-center hidden sm:block">{t('standings.col.form')}</div>
        </div>
        <div className="divide-y divide-[#F2EFE9]">
          {standings.map((s) => (
            <div key={s.team.id} className={`${GRID_COLS} hover:bg-[#FAFAFA] transition-colors`}>
              <div className="py-2.5 pl-4 text-[#999390] font-heading font-bold text-xs">{s.rank}</div>
              <div className="py-2.5 px-2 min-w-0">
                <div className="flex items-center gap-2.5">
                  <img src={s.team.logo} alt={s.team.name} className="size-5 object-contain shrink-0" />
                  <span className="font-medium text-[#111111] truncate">{formatTeamName(s.team.name, lang)}</span>
                  {s.description && (
                    <span className="hidden md:inline shrink-0 text-[10px] text-[#8B1E1E] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {s.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="py-2.5 text-center text-[#666666]">{s.all.played}</div>
              <div className="py-2.5 text-center text-[#166534] font-semibold">{s.all.win}</div>
              <div className="py-2.5 text-center text-[#666666]">{s.all.draw}</div>
              <div className="py-2.5 text-center text-[#C1121F]">{s.all.lose}</div>
              <div className={`py-2.5 text-center font-semibold ${s.goalsDiff > 0 ? 'text-[#166534]' : s.goalsDiff < 0 ? 'text-[#C1121F]' : 'text-[#666666]'}`}>
                {s.goalsDiff > 0 ? '+' : ''}{s.goalsDiff}
              </div>
              <div className="py-2.5 text-center font-display text-base text-[#111111]">{s.points}</div>
              <div className="py-2.5 hidden sm:flex gap-0.5 justify-center">
                {s.form?.split('').map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StandingsPage() {
  const t = useT();
  const { lang } = useLanguageStore();
  const [selected, setSelected] = useState(TOURNAMENTS[0]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['standings', selected.leagueId, selected.season],
    queryFn: () => matchesApi.getStandings(),
    staleTime: 1000 * 60 * 5,
  });

  const standingsGroups = data?.data.standings ?? [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#111111] mb-1">{t('standings.title')}</h1>
        <p className="text-[#666666] text-sm">{t('standings.subtitle')}</p>
      </div>

      {TOURNAMENTS.length > 1 && <div className="flex flex-wrap gap-2">
        {TOURNAMENTS.map((tournament) => (
          <button
            key={tournament.leagueId}
            onClick={() => setSelected(tournament)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 border ${
              selected.leagueId === tournament.leagueId
                ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]'
                : 'bg-white text-[#666666] border-[#D9D4CC] hover:border-[#B8B2AA] hover:text-[#111111]'
            }`}
          >
            {tournament.name}
          </button>
        ))}
      </div>}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="bg-white border border-[#D9D4CC] rounded-lg px-6 py-8 text-center text-[#999390] text-sm">
          {t('standings.error')}
        </div>
      ) : standingsGroups.length === 0 ? (
        <div className="bg-white border border-[#D9D4CC] rounded-lg px-6 py-8 text-center text-[#999390] text-sm">
          {t('standings.empty')}
        </div>
      ) : (
        <div className="space-y-4">
          {standingsGroups.map((group, i) => (
            <div key={i} className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
              {standingsGroups.length > 1 && (
                <div className="px-4 py-3 border-b border-[#E8E4DE]">
                  <h2 className="font-heading font-black text-sm text-[#111111]">{formatGroupName(group[0]?.group, lang)}</h2>
                </div>
              )}
              <StandingsGroup standings={group} t={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
