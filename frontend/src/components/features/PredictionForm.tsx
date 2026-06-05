import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { predictionsApi } from '../../services/predictions';
import Button from '../ui/Button';
import { useT } from '../../store/language';

interface PredictionFormProps {
  matchId: string;
  leagueId: string;
  initialHome?: number;
  initialAway?: number;
  isLocked: boolean;
  homeName: string;
  awayName: string;
}

function ScoreInput({ value, onChange, label }: {
  value: string | number;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 bg-[#F7F4EF] border border-[#E8E4DE] rounded-lg px-3 py-3 sm:px-4 sm:py-4">
      <label className="w-full truncate text-center text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
        {label}
      </label>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(String(Math.min(99, Number(value || 0) + 1)))}
          className="grid size-8 sm:size-9 place-items-center rounded border border-[#D9D4CC] bg-white text-[#666666] hover:border-[#B8B2AA] hover:text-[#111111] transition-colors duration-150 active:scale-95 text-xs"
        >
          ▲
        </button>
        <input
          type="number"
          min="0"
          max="99"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-14 sm:w-20 sm:h-16 rounded border border-[#D9D4CC] bg-white text-center font-display text-3xl sm:text-4xl text-[#111111] focus:border-[#8B1E1E] focus:outline-none transition-[border-color] duration-150"
          placeholder="0"
          required
        />
        <button
          type="button"
          onClick={() => onChange(String(Math.max(0, Number(value || 0) - 1)))}
          className="grid size-8 sm:size-9 place-items-center rounded border border-[#D9D4CC] bg-white text-[#666666] hover:border-[#B8B2AA] hover:text-[#111111] transition-colors duration-150 active:scale-95 text-xs"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export function PredictionForm({
  matchId, leagueId, initialHome, initialAway, isLocked, homeName, awayName
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState<string | number>(initialHome ?? '');
  const [awayScore, setAwayScore] = useState<string | number>(initialAway ?? '');
  const queryClient = useQueryClient();
  const t = useT();

  const mutation = useMutation({
    mutationFn: () =>
      predictionsApi.upsert(matchId, leagueId, Number(homeScore), Number(awayScore)),
    onSuccess: () => {
      toast.success(t('matchDetail.predictionSavedToast'));
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : t('matchDetail.predictionFailed');
      toast.error(msg);
    },
  });

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 bg-[#F7F4EF] border border-[#E8E4DE] rounded px-4 py-3 text-sm text-[#999390]">
        <svg className="size-4 text-[#D9D4CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {t('matchDetail.predictionLocked')}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
        <ScoreInput value={homeScore} onChange={setHomeScore} label={homeName} />
        <div className="flex items-center justify-center">
          <div className="flex size-8 sm:size-10 items-center justify-center rounded border border-[#D9D4CC] bg-[#F7F4EF] font-heading font-black text-[10px] sm:text-xs text-[#999390]">
            VS
          </div>
        </div>
        <ScoreInput value={awayScore} onChange={setAwayScore} label={awayName} />
      </div>
      <Button type="submit" loading={mutation.isPending} className="w-full" size="lg">
        {initialHome !== undefined ? t('matchDetail.predictionUpdate') : t('matchDetail.predictionSave')}
      </Button>
    </form>
  );
}
