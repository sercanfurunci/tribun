import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { footballApi, Standing } from '../services/football';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useT } from '../store/language';
import type { TranslationKey } from '../i18n/translations';

const TOURNAMENTS = [
  { name: 'FIFA World Cup 2026', leagueId: 1, season: 2026 },
  { name: 'UEFA Euro 2024', leagueId: 4, season: 2024 },
  { name: 'UEFA Champions League', leagueId: 2, season: 2024 },
  { name: 'Premier League', leagueId: 39, season: 2024 },
  { name: 'La Liga', leagueId: 140, season: 2024 },
  { name: 'Bundesliga', leagueId: 78, season: 2024 },
  { name: 'Serie A', leagueId: 135, season: 2024 },
  { name: 'Ligue 1', leagueId: 61, season: 2024 },
];

function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: 'bg-green-500/20 text-green-400',
    D: 'bg-slate-600 text-slate-300',
    L: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`inline-flex items-center justify-center size-5 rounded text-xs font-bold ${colors[result] || 'bg-slate-700 text-slate-400'}`}>
      {result}
    </span>
  );
}

function StandingsGroup({ standings, t }: { standings: Standing[]; t: (key: TranslationKey) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 text-xs text-slate-500">
            <th className="text-left py-2 px-3 w-8">#</th>
            <th className="text-left py-2 px-3">{t('standings.col.team')}</th>
            <th className="text-center py-2 px-2">{t('standings.col.played')}</th>
            <th className="text-center py-2 px-2">{t('standings.col.wins')}</th>
            <th className="text-center py-2 px-2">{t('standings.col.draws')}</th>
            <th className="text-center py-2 px-2">{t('standings.col.losses')}</th>
            <th className="text-center py-2 px-2">{t('standings.col.gd')}</th>
            <th className="text-center py-2 px-2 font-bold">{t('standings.col.pts')}</th>
            <th className="text-center py-2 px-3 hidden sm:table-cell">{t('standings.col.form')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {standings.map((s) => (
            <tr key={s.team.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="py-2.5 px-3 text-slate-500">{s.rank}</td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2.5">
                  <img src={s.team.logo} alt={s.team.name} className="size-5 object-contain" />
                  <span className="font-medium text-white truncate max-w-[120px] sm:max-w-none">{s.team.name}</span>
                  {s.description && (
                    <span className="hidden md:inline text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                      {s.description}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-2 text-center text-slate-400">{s.all.played}</td>
              <td className="py-2.5 px-2 text-center text-green-400">{s.all.win}</td>
              <td className="py-2.5 px-2 text-center text-slate-400">{s.all.draw}</td>
              <td className="py-2.5 px-2 text-center text-red-400">{s.all.lose}</td>
              <td className={`py-2.5 px-2 text-center ${s.goalsDiff > 0 ? 'text-green-400' : s.goalsDiff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {s.goalsDiff > 0 ? '+' : ''}{s.goalsDiff}
              </td>
              <td className="py-2.5 px-2 text-center font-bold text-white">{s.points}</td>
              <td className="py-2.5 px-3 hidden sm:table-cell">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">{t('standings.title')}</h1>
        <p className="text-slate-400 text-sm">{t('standings.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOURNAMENTS.map((tournament) => (
          <button
            key={tournament.leagueId}
            onClick={() => setSelected(tournament)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selected.leagueId === tournament.leagueId
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tournament.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : error ? (
        <Card>
          <CardBody className="text-center py-8 text-slate-500">
            {t('standings.error')}
          </CardBody>
        </Card>
      ) : standingsGroups.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8 text-slate-500">
            {t('standings.empty')}
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {standingsGroups.map((group, i) => (
            <Card key={i}>
              {standingsGroups.length > 1 && (
                <CardHeader>
                  <h2 className="font-semibold text-white text-sm">{group[0]?.group}</h2>
                </CardHeader>
              )}
              <StandingsGroup standings={group} t={t} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
