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
  { id: 'live',     labelKey: 'matches.live',     icon: 'video' },
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
    live:     t('matches.empty.live'),
    upcoming: t('matches.empty.upcoming'),
    finished: t('matches.empty.finished'),
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[11px] font-bold text-[#999390] uppercase tracking-[0.28em] mb-1 font-heading">
          {t('matches.browse')}
        </p>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#111111]">{t('matches.title')}</h1>
        <p className="text-[#666666] text-sm mt-1">{t('matches.subtitle')}</p>
      </div>

      <div className="flex gap-0 bg-white border border-[#D9D4CC] rounded-lg overflow-hidden w-full sm:w-fit">
        {TABS.map(({ id, labelKey, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold font-heading transition-colors duration-150 border-b-2 ${
              tab === id
                ? 'text-[#8B1E1E] border-[#8B1E1E] bg-[#FEF2F2]'
                : 'text-[#666666] border-transparent hover:text-[#111111] hover:bg-[#F7F4EF]'
            }`}
          >
            <Icon name={icon} size={14} />
            {t(labelKey)}
            {id === 'live' && liveCount > 0 && (
              <span className="size-4 rounded-full text-[9px] font-black flex items-center justify-center text-white bg-[#8B1E1E]">
                {liveCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !matches?.length ? (
        <div className="bg-white border border-[#D9D4CC] rounded-lg p-14 text-center">
          <div className="mb-4 flex justify-center text-[#D9D4CC]">
            <Icon name={tab === 'live' ? 'video' : tab === 'upcoming' ? 'ball' : 'check'} size={36} />
          </div>
          <p className="text-[#999390] text-sm">{emptyMessages[tab]}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      )}
    </div>
  );
}
