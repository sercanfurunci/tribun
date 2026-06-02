import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../services/matches';
import { MatchCard } from '../components/features/MatchCard';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';

type Tab = 'upcoming' | 'finished' | 'live';

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

  const isLoading = tab === 'upcoming' ? loadingUpcoming : tab === 'finished' ? loadingFinished : loadingLive;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live' },
    { id: 'finished', label: 'Finished' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Matches</h1>
        <p className="text-slate-400 text-sm">Browse all tournament matches</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl w-fit">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
            {id === 'live' && liveData?.data.matches.length ? (
              <Badge variant="red" size="sm" className="ml-2">
                {liveData.data.matches.length}
              </Badge>
            ) : null}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !matches?.length ? (
        <div className="text-center py-16 text-slate-500">
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
