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
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/auth';

type Tab = 'leaderboard' | 'matches' | 'members';

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      toast.success('Left league');
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      navigate('/leagues');
    },
    onError: () => toast.error('Failed to leave league'),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const league = leagueData?.data.league;
  if (!league) return <div className="text-center text-slate-400 py-16">League not found</div>;

  const myPosition = leaderboardData?.data.leaderboard.find((e) => e.user_id === user?.id);
  const matches = matchesData?.data.matches ?? [];
  const myPredictions = myPredictionsData?.data.predictions ?? [];

  function copyInviteCode() {
    navigator.clipboard.writeText(league!.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'matches', label: 'Matches' },
    { id: 'members', label: 'Members' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">{league.name}</h1>
            {league.is_owner && <Badge variant="gold">Owner</Badge>}
          </div>
          {league.description && <p className="text-slate-400 text-sm">{league.description}</p>}
          <p className="text-xs text-slate-600 mt-1">{league.member_count} members</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-slate-300 border border-slate-700"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : league.invite_code}
          </button>
          {!league.is_owner && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => leaveMutation.mutate()}
              loading={leaveMutation.isPending}
            >
              Leave League
            </Button>
          )}
        </div>
      </div>

      {myPosition && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Your Position', value: `#${myPosition.position}` },
            { label: 'Total Points', value: myPosition.total_points },
            { label: 'Exact Scores', value: myPosition.exact_scores },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardBody className="text-center py-3">
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl w-fit">
        {tabs.map(({ id: tabId, label }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === tabId ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'leaderboard' && (
        <Card>
          {leaderboardData ? (
            <LeaderboardTable entries={leaderboardData.data.leaderboard} />
          ) : (
            <CardBody className="flex justify-center py-8"><Spinner /></CardBody>
          )}
        </Card>
      )}

      {tab === 'matches' && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <Card><CardBody className="text-center text-slate-500 py-8">No upcoming matches</CardBody></Card>
          ) : (
            matches.map((match) => {
              const pred = myPredictions.find((p) => p.match_id === match.id);
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={pred}
                  leagueId={id}
                />
              );
            })
          )}
        </div>
      )}

      {tab === 'members' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-white">{league.member_count} Members</h2>
          </CardHeader>
          {membersData ? (
            <CardBody className="p-0">
              <div className="divide-y divide-slate-800">
                {membersData.data.members.map((member) => (
                  <div key={member.id} className={`flex items-center gap-3 px-5 py-3 ${member.id === user?.id ? 'bg-green-500/5' : ''}`}>
                    <div className="size-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                      {member.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.username}
                        {member.id === user?.id && <span className="text-xs text-slate-500 ml-1">(you)</span>}
                        {league.owner_id === member.id && <Badge variant="gold" className="ml-2">Owner</Badge>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          ) : (
            <CardBody className="flex justify-center py-8"><Spinner /></CardBody>
          )}
        </Card>
      )}
    </div>
  );
}
