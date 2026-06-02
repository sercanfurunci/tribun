import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leaguesApi } from '../services/leagues';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

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
    onSuccess: ({ data: resData }) => {
      toast.success(`"${resData.league.name}" created!`);
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setShowCreate(false);
      setNewLeague({ name: '', description: '' });
    },
    onError: () => toast.error('Failed to create league'),
  });

  const joinMutation = useMutation({
    mutationFn: () => leaguesApi.join(inviteCode.trim()),
    onSuccess: ({ data: resData }) => {
      toast.success(`Joined "${resData.league.name}"!`);
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setShowJoin(false);
      setInviteCode('');
    },
    onError: () => toast.error('Invalid code or already a member'),
  });

  const leagues = data?.data.leagues ?? [];

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1 font-heading">Prediction</p>
          <h1 className="font-heading font-bold text-2xl text-white">Leagues</h1>
          <p className="text-slate-500 text-sm mt-1">Compete with friends in prediction leagues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>
            Join with Code
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + New League
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : leagues.length === 0 ? (
        <div
          className="rounded-2xl p-14 flex flex-col items-center gap-5 text-center"
          style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div
            className="size-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            🏅
          </div>
          <div>
            <p className="font-heading font-bold text-white mb-1">No leagues yet</p>
            <p className="text-slate-600 text-sm">Create a league or join one with an invite code</p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>Join with Code</Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>Create League</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create League">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="flex flex-col gap-4">
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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading">
              Description <span className="text-slate-700 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              value={newLeague.description}
              onChange={(e) => setNewLeague((p) => ({ ...p, description: e.target.value }))}
              placeholder="A friendly league for our group..."
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/40 resize-none transition-all"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending} className="flex-1">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Join modal */}
      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="Join League">
        <form onSubmit={(e) => { e.preventDefault(); joinMutation.mutate(); }} className="flex flex-col gap-4">
          <Input
            id="invite-code"
            label="Invite Code"
            placeholder="ABC12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            required
            maxLength={20}
            className="uppercase tracking-[0.3em] text-center font-mono text-lg"
          />
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setShowJoin(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={joinMutation.isPending} className="flex-1">Join</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
