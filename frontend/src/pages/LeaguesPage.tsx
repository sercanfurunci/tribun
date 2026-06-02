import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leaguesApi } from '../services/leagues';
import { LeagueCard } from '../components/features/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Icon } from '../components/ui/Icon';
import { useT } from '../store/language';

export default function LeaguesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newLeague, setNewLeague] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const queryClient = useQueryClient();
  const t = useT();

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
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1 font-heading">{t('leagues.eyebrow')}</p>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white">{t('leagues.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('leagues.subtitle')}</p>
        </div>
        <div
          className="flex flex-wrap gap-2 rounded-[20px] border border-white/8 bg-[#0B1220] p-2 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.7)]"
        >
          <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>
            {t('leagues.joinWithCode')}
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            {t('leagues.newLeague')}
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
            className="size-16 rounded-2xl flex items-center justify-center text-slate-400"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Icon name="medal" size={28} />
          </div>
          <div>
            <p className="font-heading font-bold text-white mb-1">{t('leagues.empty.title')}</p>
            <p className="text-slate-600 text-sm">{t('leagues.empty.subtitle')}</p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>{t('leagues.joinWithCode')}</Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>{t('leagues.create')}</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('leagues.createModal.title')} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="flex flex-col gap-4">
          <Input
            id="league-name"
            label={t('leagues.field.name')}
            placeholder="Friends WC 2026"
            value={newLeague.name}
            onChange={(e) => setNewLeague((p) => ({ ...p, name: e.target.value }))}
            required
            minLength={3}
            maxLength={100}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading">
              {t('leagues.field.description')} <span className="text-slate-700 normal-case tracking-normal font-normal">{t('leagues.field.optional')}</span>
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
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)} className="flex-1">{t('leagues.cancel')}</Button>
            <Button type="submit" loading={createMutation.isPending} className="flex-1">{t('leagues.create')}</Button>
          </div>
        </form>
      </Modal>

      {/* Join modal */}
      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title={t('leagues.joinModal.title')} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); joinMutation.mutate(); }} className="flex flex-col gap-4">
          <Input
            id="invite-code"
            label={t('leagues.field.inviteCode')}
            placeholder="ABC12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            required
            maxLength={20}
            className="uppercase tracking-[0.3em] text-center font-mono text-lg"
          />
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setShowJoin(false)} className="flex-1">{t('leagues.cancel')}</Button>
            <Button type="submit" loading={joinMutation.isPending} className="flex-1">{t('leagues.join')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
