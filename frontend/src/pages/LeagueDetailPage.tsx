import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leaguesApi } from '../services/leagues';
import { leaderboardApi } from '../services/leaderboard';
import { matchesApi } from '../services/matches';
import { predictionsApi } from '../services/predictions';
import { LeaderboardTable } from '../components/features/LeaderboardTable';
import { MatchCard } from '../components/features/MatchCard';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/auth';
import { useT } from '../store/language';

type Tab = 'leaderboard' | 'matches' | 'members';

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const t = useT();
  const [tab, setTab] = useState<Tab>('leaderboard');
  const [copied, setCopied] = useState(false);

  const { data: leagueData, isLoading } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leaguesApi.getById(id!),
    enabled: !!id,
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard', id],
    queryFn: () => leaderboardApi.getLeagueLeaderboard(id!),
    enabled: !!id && tab === 'leaderboard',
  });

  const { data: membersData } = useQuery({
    queryKey: ['members', id],
    queryFn: () => leaguesApi.getMembers(id!),
    enabled: !!id && tab === 'members',
  });

  const { data: matchesData } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: () => matchesApi.getUpcoming(),
    enabled: tab === 'matches',
  });

  const { data: myPredictionsData } = useQuery({
    queryKey: ['predictions', 'mine', id],
    queryFn: () => predictionsApi.getMine(id!),
    enabled: !!id && tab === 'matches',
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaguesApi.leave(id!),
    onSuccess: () => {
      toast.success(t('leagueDetail.left'));
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      navigate('/leagues');
    },
    onError: () => toast.error(t('leagueDetail.leaveError')),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const league = leagueData?.data.league;
  if (!league) return <div className="text-center text-[#999390] py-16">{t('leagueDetail.notFound')}</div>;

  const myPosition = leaderboardData?.data.leaderboard.find((e) => e.user_id === user?.id);
  const matches = matchesData?.data.matches ?? [];
  const myPredictions = myPredictionsData?.data.predictions ?? [];

  function copyInviteCode() {
    navigator.clipboard.writeText(league!.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'leaderboard', label: t('leagueDetail.tab.leaderboard') },
    { id: 'matches',     label: t('leagueDetail.tab.matches')     },
    { id: 'members',     label: t('leagueDetail.tab.members')     },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">{league.name}</h1>
            {league.is_owner && <Badge variant="gold">{t('leagueDetail.owner')}</Badge>}
          </div>
          {league.description && <p className="text-[#666666] text-sm">{league.description}</p>}
          <p className="text-xs text-[#999390] mt-1">{league.member_count} {t('leagueDetail.members').toLowerCase()}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-[#666666] bg-white border border-[#D9D4CC] hover:border-[#B8B2AA] hover:text-[#111111] transition-colors duration-150 font-mono tracking-widest"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? t('leagueDetail.copied') : league.invite_code}
          </button>
          {!league.is_owner && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => leaveMutation.mutate()}
              loading={leaveMutation.isPending}
            >
              {t('leagueDetail.leave')}
            </Button>
          )}
        </div>
      </div>

      {myPosition && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('leaderboard.col.rank'), value: `#${myPosition.position}` },
            { label: t('stats.totalPoints'), value: myPosition.total_points },
            { label: t('stats.exactScores'), value: myPosition.exact_scores },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-[#D9D4CC] rounded-lg px-4 py-3 text-center">
              <div className="font-display text-2xl text-[#111111]">{value}</div>
              <div className="text-[10px] text-[#999390] uppercase tracking-widest mt-0.5 font-heading">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-0 bg-white border border-[#D9D4CC] rounded-lg overflow-hidden w-fit">
        {tabs.map(({ id: tabId, label }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`px-5 py-2.5 text-sm font-semibold font-heading transition-colors duration-150 border-b-2 ${
              tab === tabId
                ? 'text-[#8B1E1E] border-[#8B1E1E] bg-[#FEF2F2]'
                : 'text-[#666666] border-transparent hover:text-[#111111] hover:bg-[#F7F4EF]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'leaderboard' && (
        <div className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
          {leaderboardData ? (
            <LeaderboardTable entries={leaderboardData.data.leaderboard} />
          ) : (
            <div className="flex justify-center py-8"><Spinner /></div>
          )}
        </div>
      )}

      {tab === 'matches' && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <div className="bg-white border border-[#D9D4CC] rounded-lg px-6 py-8 text-center text-[#999390] text-sm">
              {t('leagueDetail.noUpcoming')}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => {
                const pred = myPredictions.find((p) => p.match_id === match.id);
                return <MatchCard key={match.id} match={match} prediction={pred} leagueId={id} />;
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E8E4DE]">
            <h2 className="font-heading font-black text-sm text-[#111111]">
              {league.member_count} {t('leagueDetail.members')}
            </h2>
          </div>
          {membersData ? (
            <div className="divide-y divide-[#F2EFE9]">
              {membersData.data.members.map((member) => (
                <div key={member.id} className={`flex items-center gap-3 px-5 py-3 ${member.id === user?.id ? 'bg-[#FEF2F2]' : ''}`}>
                  <div className="size-9 rounded-full bg-[#8B1E1E] flex items-center justify-center text-sm font-bold text-white font-heading">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">
                      {member.username}
                      {member.id === user?.id && <span className="text-xs text-[#999390] ml-1">{t('leagueDetail.you')}</span>}
                      {league.owner_id === member.id && <Badge variant="gold" className="ml-2">{t('leagueDetail.owner')}</Badge>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-8"><Spinner /></div>
          )}
        </div>
      )}
    </div>
  );
}
