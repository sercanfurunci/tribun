import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { footballApi, Standing } from '../services/football';
import { Spinner } from '../components/ui/Spinner';
import { useT } from '../store/language';
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

function StandingsGroup({ standings, t }: { standings: Standing[]; t: (key: TranslationKey) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E8E4DE] text-xs text-[#999390]">
            <th className="text-left py-2.5 px-4 w-8">#</th>
            <th className="text-left py-2.5 px-4">{t('standings.col.team')}</th>
            <th className="text-center py-2.5 px-2">{t('standings.col.played')}</th>
            <th className="text-center py-2.5 px-2">{t('standings.col.wins')}</th>
            <th className="text-center py-2.5 px-2">{t('standings.col.draws')}</th>
            <th className="text-center py-2.5 px-2">{t('standings.col.losses')}</th>
            <th className="text-center py-2.5 px-2">{t('standings.col.gd')}</th>
            <th className="text-center py-2.5 px-2 font-bold">{t('standings.col.pts')}</th>
            <th className="text-center py-2.5 px-4 hidden sm:table-cell">{t('standings.col.form')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F2EFE9]">
          {standings.map((s) => (
            <tr key={s.team.id} className="hover:bg-[#FAFAFA] transition-colors">
              <td className="py-2.5 px-4 text-[#999390] font-heading font-bold text-xs">{s.rank}</td>
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-2.5">
                  <img src={s.team.logo} alt={s.team.name} className="size-5 object-contain" />
                  <span className="font-medium text-[#111111] truncate max-w-[120px] sm:max-w-none">{s.team.name}</span>
                  {s.description && (
                    <span className="hidden md:inline text-[10px] text-[#8B1E1E] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {s.description}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-2 text-center text-[#666666]">{s.all.played}</td>
              <td className="py-2.5 px-2 text-center text-[#166534] font-semibold">{s.all.win}</td>
              <td className="py-2.5 px-2 text-center text-[#666666]">{s.all.draw}</td>
              <td className="py-2.5 px-2 text-center text-[#C1121F]">{s.all.lose}</td>
              <td className={`py-2.5 px-2 text-center font-semibold ${s.goalsDiff > 0 ? 'text-[#166534]' : s.goalsDiff < 0 ? 'text-[#C1121F]' : 'text-[#666666]'}`}>
                {s.goalsDiff > 0 ? '+' : ''}{s.goalsDiff}
              </td>
              <td className="py-2.5 px-2 text-center font-display text-base text-[#111111]">{s.points}</td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <div className="flex gap-0.5 justify-center">
                  {s.form?.split('').map((r, i) => <FormBadge key={i} result={r} />)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StandingsPage() {
  const t = useT();
  const [selected, setSelected] = useState(TOURNAMENTS[0]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['standings', selected.leagueId, selected.season],
    queryFn: () => footballApi.getStandings(selected.leagueId, selected.season),
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
                  <h2 className="font-heading font-black text-sm text-[#111111]">{group[0]?.group}</h2>
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
