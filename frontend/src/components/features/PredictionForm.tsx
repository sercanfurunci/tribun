import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { predictionsApi } from '../../services/predictions';
import Button from '../ui/Button';

interface PredictionFormProps {
  matchId: string;
  leagueId: string;
  initialHome?: number;
  initialAway?: number;
  isLocked: boolean;
  homeName: string;
  awayName: string;
}

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: string | number;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest text-center truncate w-full max-w-[90px]">
        {label}
      </label>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(String(Math.min(99, Number(value || 0) + 1)))}
          className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all text-lg leading-none"
        >
          ▲
        </button>
        <input
          type="number"
          min="0"
          max="99"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-16 text-center font-score text-4xl text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/40 focus:bg-white/8 transition-all"
          placeholder="0"
          required
        />
        <button
          type="button"
          onClick={() => onChange(String(Math.max(0, Number(value || 0) - 1)))}
          className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all text-lg leading-none"
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

  const mutation = useMutation({
    mutationFn: () =>
      predictionsApi.upsert(matchId, leagueId, Number(homeScore), Number(awayScore)),
    onSuccess: () => {
      toast.success('Prediction saved!');
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to save prediction';
      toast.error(msg);
    },
  });

  if (isLocked) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-slate-500 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <svg className="size-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Predictions locked for this match
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5">
      <div className="flex items-center gap-4">
        <ScoreInput value={homeScore} onChange={setHomeScore} label={homeName} />
        <div className="flex flex-col items-center gap-1 pb-8">
          <span className="font-score text-3xl text-slate-700 leading-none">–</span>
        </div>
        <ScoreInput value={awayScore} onChange={setAwayScore} label={awayName} />
      </div>
      <Button
        type="submit"
        loading={mutation.isPending}
        className="w-full"
        size="lg"
      >
        {initialHome !== undefined ? 'Update Prediction' : 'Save Prediction'}
      </Button>
    </form>
  );
}
