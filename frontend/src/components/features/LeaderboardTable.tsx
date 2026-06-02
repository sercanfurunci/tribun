import { LeaderboardEntry } from '../../types';
import { useAuthStore } from '../../store/auth';

const medals = ['🥇', '🥈', '🥉'];

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { user } = useAuthStore();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">#</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Player</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Pts</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Exact</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Correct</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Played</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {entries.map((entry) => {
            const isMe = entry.user_id === user?.id;
            const medal = medals[entry.position - 1];

            return (
              <tr
                key={entry.user_id}
                className={`transition-colors ${isMe ? 'bg-green-500/5 border-l-2 border-green-500' : 'hover:bg-slate-800/30'}`}
              >
                <td className="py-3.5 px-4">
                  <span className="text-sm font-medium text-slate-400">
                    {medal || entry.position}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      entry.position === 1 ? 'bg-amber-500/20 text-amber-400' :
                      entry.position === 2 ? 'bg-slate-400/20 text-slate-300' :
                      entry.position === 3 ? 'bg-orange-700/20 text-orange-500' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {entry.username[0].toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium ${isMe ? 'text-green-400' : 'text-white'}`}>
                      {entry.username} {isMe && <span className="text-xs text-slate-500">(you)</span>}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-sm font-bold text-white">{entry.total_points}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                  <span className="text-sm text-amber-400">{entry.exact_scores}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                  <span className="text-sm text-green-400">{entry.correct_outcomes}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden md:table-cell">
                  <span className="text-sm text-slate-400">{entry.predictions_count}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
