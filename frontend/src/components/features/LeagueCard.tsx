import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { League } from '../../types';

interface LeagueCardProps {
  league: League;
}

export function LeagueCard({ league }: LeagueCardProps) {
  return (
    <Link to={`/leagues/${league.id}`}>
      <div
        className="group rounded-[24px] p-5 transition-all duration-200 cursor-pointer glass-hover"
        style={{
          background: 'rgba(12, 22, 40, 0.7)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-start gap-3">
          {/* League icon */}
          <div
            className="size-11 rounded-xl shrink-0 flex items-center justify-center font-heading font-bold text-base text-white"
            style={{ background: 'linear-gradient(135deg, #16a34a22, #15803d33)', border: '1px solid rgba(22,163,74,0.25)' }}
          >
            {league.name[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-heading font-semibold text-white text-[15px] truncate">{league.name}</h3>
              {league.is_owner && <Badge variant="gold" size="sm">Owner</Badge>}
            </div>
            {league.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{league.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                {league.member_count} members
              </span>
              <span
                className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}
              >
                {league.invite_code}
              </span>
            </div>
          </div>

          <svg className="size-4 text-slate-700 shrink-0 group-hover:text-green-500 transition-colors mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
