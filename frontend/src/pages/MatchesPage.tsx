import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../services/matches';
import { MatchCard } from '../components/features/MatchCard';
import { Spinner } from '../components/ui/Spinner';

type Tab = 'upcoming' | 'live' | 'finished';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'upcoming', label: 'Upcoming', icon: '📅' },
  { id: 'live', label: 'Live', icon: '🔴' },
  { id: 'finished', label: 'Finished', icon: '✓' },
];

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>('upcoming');

  const { data: upcomingData, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: () => matchesApi.getUpcoming(),
    enabled: tab === 'upcoming',
  });

  const { data: finishedData, isLoading: loadingFinished } = useQuery({
    queryKey: ['matches', 'finished'],
    queryFn: () => matchesApi.getFinished(),
    enabled: tab === 'finished',
  });

  const { data: liveData, isLoading: loadingLive } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesApi.getLive(),
    enabled: tab === 'live',
    refetchInterval: 30000,
  });

  const matches =
    tab === 'upcoming' ? upcomingData?.data.matches :
    tab === 'finished' ? finishedData?.data.matches :
    liveData?.data.matches;

  const isLoading =
    tab === 'upcoming' ? loadingUpcoming :
    tab === 'finished' ? loadingFinished : loadingLive;

  const liveCount = liveData?.data.matches.length ?? 0;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1 font-heading">Browse</p>
        <h1 className="font-heading font-bold text-2xl text-white">Matches</h1>
        <p className="text-slate-500 text-sm mt-1">All tournament fixtures</p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl w-fit"
        style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative"
            style={{
              background: tab === id ? 'rgba(22,163,74,0.15)' : 'transparent',
              color: tab === id ? '#4ade80' : '#64748b',
              border: tab === id ? '1px solid rgba(22,163,74,0.25)' : '1px solid transparent',
            }}
          >
            <span>{icon}</span>
            {label}
            {id === 'live' && tab !== 'live' && liveCount > 0 && (
              <span
                className="size-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: '#ef4444' }}
              >
                {liveCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !matches?.length ? (
        <div
          className="rounded-2xl p-12 text-center text-slate-600 text-sm"
          style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {tab === 'live' ? 'No matches live right now' :
           tab === 'upcoming' ? 'No upcoming matches scheduled' :
           'No finished matches yet'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      )}
    </div>
  );
}
