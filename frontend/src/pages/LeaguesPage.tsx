import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leaguesApi } from '../services/leagues';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card, CardBody } from '../components/ui/Card';

export default function LeaguesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newLeague, setNewLeague] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => leaguesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: () => leaguesApi.create(newLeague.name, newLeague.description || undefined),
    onSuccess: ({ data }) => {
      toast.success(`League "${data.league.name}" created!`);
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setShowCreate(false);
      setNewLeague({ name: '', description: '' });
    },
    onError: () => toast.error('Failed to create league'),
  });

  const joinMutation = useMutation({
    mutationFn: () => leaguesApi.join(inviteCode.trim()),
    onSuccess: ({ data }) => {
      toast.success(`Joined "${data.league.name}"!`);
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setShowJoin(false);
      setInviteCode('');
    },
    onError: () => toast.error('Invalid invite code or already a member'),
  });

  const leagues = data?.data.leagues ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Leagues</h1>
          <p className="text-slate-400 text-sm">Compete with friends in prediction leagues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>
            Join League
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + Create
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : leagues.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center py-16 gap-4">
            <div className="size-16 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="size-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">No leagues yet</p>
              <p className="text-slate-500 text-sm">Create a league or join one with an invite code</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>Join with Code</Button>
              <Button size="sm" onClick={() => setShowCreate(true)}>Create League</Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create League">
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="flex flex-col gap-4"
        >
          <Input
            id="league-name"
            label="League Name"
            placeholder="Friends WC 2026"
            value={newLeague.name}
            onChange={(e) => setNewLeague((p) => ({ ...p, name: e.target.value }))}
            required
            minLength={3}
            maxLength={100}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description (optional)</label>
            <textarea
              value={newLeague.description}
              onChange={(e) => setNewLeague((p) => ({ ...p, description: e.target.value }))}
              placeholder="A friendly league for our group..."
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending} className="flex-1">
              Create League
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="Join League">
        <form
          onSubmit={(e) => { e.preventDefault(); joinMutation.mutate(); }}
          className="flex flex-col gap-4"
        >
          <Input
            id="invite-code"
            label="Invite Code"
            placeholder="ABC12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            required
            maxLength={20}
            className="uppercase tracking-widest"
          />
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowJoin(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={joinMutation.isPending} className="flex-1">
              Join League
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
