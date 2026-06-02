import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../services/matches';
import { MatchCard } from '../components/features/MatchCard';
import { Spinner } from '../components/ui/Spinner';
import { useT } from '../store/language';
import { Icon, type IconName } from '../components/ui/Icon';
import type { TranslationKey } from '../i18n/translations';

type Tab = 'upcoming' | 'live' | 'finished';

const TABS: { id: Tab; labelKey: TranslationKey; icon: IconName }[] = [
  { id: 'upcoming', labelKey: 'matches.upcoming', icon: 'ball' },
  { id: 'live', labelKey: 'matches.live', icon: 'video' },
  { id: 'finished', labelKey: 'matches.finished', icon: 'check' },
];

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const t = useT();

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

  const { data: liveCountData } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesApi.getLive(),
    refetchInterval: 60000,
  });

  const matches =
    tab === 'upcoming' ? upcomingData?.data.matches :
    tab === 'finished' ? finishedData?.data.matches :
    liveData?.data.matches;

  const isLoading =
    tab === 'upcoming' ? loadingUpcoming :
    tab === 'finished' ? loadingFinished : loadingLive;

  const liveCount = liveCountData?.data.matches.length ?? 0;

  const emptyMessages: Record<Tab, string> = {
    live: t('matches.empty.live'),
    upcoming: t('matches.empty.upcoming'),
    finished: t('matches.empty.finished'),
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Page header */}
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1 font-heading">{t('matches.browse')}</p>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white">{t('matches.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('matches.subtitle')}</p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl w-fit"
        style={{ background: 'rgba(12,22,40,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {TABS.map(({ id, labelKey, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-heading transition-all duration-200"
            style={{
              background: tab === id ? 'rgba(22,163,74,0.15)' : 'transparent',
              color: tab === id ? '#4ade80' : '#64748b',
              border: tab === id ? '1px solid rgba(22,163,74,0.25)' : '1px solid transparent',
            }}
          >
            <Icon name={icon} size={14} />
            {t(labelKey)}
            {id === 'live' && liveCount > 0 && (
              <span
                className="size-4 rounded-full text-[9px] font-black flex items-center justify-center text-white live-indicator"
                style={{ background: '#ef4444' }}
              >
                {liveCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !matches?.length ? (
        <div
          className="rounded-2xl p-14 text-center"
          style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="mb-4 flex justify-center text-slate-600">
            <Icon name={tab === 'live' ? 'video' : tab === 'upcoming' ? 'ball' : 'check'} size={36} />
          </div>
          <p className="text-slate-500 text-sm">{emptyMessages[tab]}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
