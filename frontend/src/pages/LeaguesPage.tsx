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
      toast.success(t('leagues.createdToast', { name: resData.league.name }));
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setShowCreate(false);
      setNewLeague({ name: '', description: '' });
    },
    onError: () => toast.error(t('leagues.createError')),
  });

  const joinMutation = useMutation({
    mutationFn: () => leaguesApi.join(inviteCode.trim()),
    onSuccess: ({ data: resData }) => {
      toast.success(t('leagues.joinedToast', { name: resData.league.name }));
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setShowJoin(false);
      setInviteCode('');
    },
    onError: () => toast.error(t('leagues.joinError')),
  });

  const leagues = data?.data.leagues ?? [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold text-[#999390] uppercase tracking-[0.28em] mb-1 font-heading">
            {t('leagues.eyebrow')}
          </p>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#111111]">{t('leagues.title')}</h1>
          <p className="text-[#666666] text-sm mt-1">{t('leagues.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>
            {t('leagues.joinWithCode')}
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            {t('leagues.newLeague')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : leagues.length === 0 ? (
        <div className="bg-white border border-[#D9D4CC] rounded-lg p-14 flex flex-col items-center gap-5 text-center">
          <div className="size-14 rounded-lg bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center text-[#999390]">
            <Icon name="medal" size={26} />
          </div>
          <div>
            <p className="font-heading font-black text-[#111111] mb-1">{t('leagues.empty.title')}</p>
            <p className="text-[#666666] text-sm">{t('leagues.empty.subtitle')}</p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>{t('leagues.joinWithCode')}</Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>{t('leagues.create')}</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('leagues.createModal.title')} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="flex flex-col gap-4">
          <Input
            id="league-name"
            label={t('leagues.field.name')}
            placeholder={t('leagues.field.name')}
            value={newLeague.name}
            onChange={(e) => setNewLeague((p) => ({ ...p, name: e.target.value }))}
            required
            minLength={3}
            maxLength={100}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#666666] uppercase tracking-[0.08em] font-sans">
              {t('leagues.field.description')}{' '}
              <span className="text-[#999390] normal-case tracking-normal font-normal">{t('leagues.field.optional')}</span>
            </label>
            <textarea
              value={newLeague.description}
              onChange={(e) => setNewLeague((p) => ({ ...p, description: e.target.value }))}
              placeholder={t('leagues.field.description')}
              maxLength={500}
              rows={3}
              className="w-full rounded px-4 py-3 text-sm text-[#111111] bg-white border border-[#D9D4CC] hover:border-[#B8B2AA] focus:border-[#111111] focus:outline-none placeholder:text-[#999390] resize-none transition-[border-color] duration-150"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)} className="flex-1">{t('leagues.cancel')}</Button>
            <Button type="submit" loading={createMutation.isPending} className="flex-1">{t('leagues.create')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title={t('leagues.joinModal.title')} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); joinMutation.mutate(); }} className="flex flex-col gap-4">
          <Input
            id="invite-code"
            label={t('leagues.field.inviteCode')}
            placeholder={t('leagues.field.inviteCode')}
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
