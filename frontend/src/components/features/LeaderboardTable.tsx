import { LeaderboardEntry } from '../../types';
import { useAuthStore } from '../../store/auth';

const MEDALS = [
  { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#fff', shadow: 'rgba(245,158,11,0.4)' },
  { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', text: '#fff', shadow: 'rgba(148,163,184,0.3)' },
  { bg: 'linear-gradient(135deg, #b45309, #92400e)', text: '#fff', shadow: 'rgba(180,83,9,0.3)' },
];

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { user } = useAuthStore();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['#', 'Player', 'Pts', 'Exact', 'Correct', 'Played'].map((h, i) => (
              <th
                key={h}
                className={`py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600 ${
                  i === 0 ? 'text-left w-10' :
                  i === 1 ? 'text-left' : 'text-right'
                } ${i >= 4 ? 'hidden md:table-cell' : ''} ${i === 3 ? 'hidden sm:table-cell' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isMe = entry.user_id === user?.id;
            const medal = MEDALS[entry.position - 1];
            const isTop3 = entry.position <= 3;

            return (
              <tr
                key={entry.user_id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: isMe ? 'rgba(22,163,74,0.06)' : undefined,
                  borderLeft: isMe ? '2px solid #16a34a' : '2px solid transparent',
                }}
              >
                <td className="py-3.5 px-4 w-10">
                  {isTop3 ? (
                    <div
                      className="size-7 rounded-lg flex items-center justify-center text-xs font-bold font-heading"
                      style={{ background: medal.bg, boxShadow: `0 2px 8px ${medal.shadow}` }}
                    >
                      {entry.position}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-600 font-heading font-bold pl-1">{entry.position}</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-8 rounded-xl flex items-center justify-center text-xs font-bold font-heading text-white shrink-0"
                      style={{
                        background: isTop3
                          ? medal.bg
                          : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {entry.username[0].toUpperCase()}
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${isMe ? 'text-green-400' : 'text-white'}`}>
                        {entry.username}
                      </span>
                      {isMe && (
                        <span className="ml-1.5 text-[10px] text-slate-600 font-medium">you</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="font-score text-xl text-white">{entry.total_points}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                  <span className="text-sm font-semibold text-amber-400">{entry.exact_scores}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden md:table-cell">
                  <span className="text-sm font-semibold text-green-400">{entry.correct_outcomes}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden md:table-cell">
                  <span className="text-sm text-slate-600">{entry.predictions_count}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
