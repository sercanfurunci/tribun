import { LeaderboardEntry } from '../../types';
import { useAuthStore } from '../../store/auth';
import { useT } from '../../store/language';

const MEDALS = [
  { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #b45309, #92400e)', text: '#fff' },
];

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { user } = useAuthStore();
  const t = useT();

  const headers = [
    t('leaderboard.col.rank'),
    t('leaderboard.col.player'),
    t('leaderboard.col.pts'),
    t('leaderboard.col.exact'),
    t('leaderboard.col.correct'),
    t('leaderboard.col.played'),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E8E4DE]">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-[#999390] ${
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
                className="border-b border-[#F2EFE9]"
                style={{
                  background: isMe ? '#FEF2F2' : undefined,
                  borderLeft: isMe ? '2px solid #8B1E1E' : '2px solid transparent',
                }}
              >
                <td className="py-3.5 px-4 w-10">
                  {isTop3 ? (
                    <div
                      className="size-7 rounded-lg flex items-center justify-center text-xs font-bold font-heading text-white"
                      style={{ background: medal.bg }}
                    >
                      {entry.position}
                    </div>
                  ) : (
                    <span className="text-sm text-[#999390] font-heading font-bold pl-1">{entry.position}</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-8 rounded-lg flex items-center justify-center text-xs font-bold font-heading shrink-0 text-white"
                      style={{ background: isTop3 ? medal.bg : '#8B1E1E' }}
                    >
                      {entry.username[0].toUpperCase()}
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${isMe ? 'text-[#8B1E1E]' : 'text-[#111111]'}`}>
                        {entry.username}
                      </span>
                      {isMe && (
                        <span className="ml-1.5 text-[10px] text-[#999390] font-medium">{t('leaderboard.you')}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="font-display text-xl text-[#111111]">{entry.total_points}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                  <span className="text-sm font-semibold text-[#92400E]">{entry.exact_scores}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden md:table-cell">
                  <span className="text-sm font-semibold text-[#166534]">{entry.correct_outcomes}</span>
                </td>
                <td className="py-3.5 px-4 text-right hidden md:table-cell">
                  <span className="text-sm text-[#999390]">{entry.predictions_count}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
