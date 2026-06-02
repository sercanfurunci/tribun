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

export function PredictionForm({
  matchId, leagueId, initialHome, initialAway, isLocked, homeName, awayName
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(initialHome ?? '');
  const [awayScore, setAwayScore] = useState(initialAway ?? '');
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
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Predictions locked
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1.5 text-center">{homeName}</label>
          <input
            type="number"
            min="0"
            max="99"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="0"
            className="w-full text-center text-2xl font-bold bg-slate-800 border border-slate-700 rounded-lg py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <span className="text-slate-500 text-xl font-bold mt-5">–</span>
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1.5 text-center">{awayName}</label>
          <input
            type="number"
            min="0"
            max="99"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="0"
            className="w-full text-center text-2xl font-bold bg-slate-800 border border-slate-700 rounded-lg py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      <Button type="submit" loading={mutation.isPending} className="w-full">
        {initialHome !== undefined ? 'Update Prediction' : 'Save Prediction'}
      </Button>
    </form>
  );
}
