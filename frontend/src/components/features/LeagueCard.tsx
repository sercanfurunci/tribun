import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { League } from '../../types';
import { useT } from '../../store/language';

interface LeagueCardProps {
  league: League;
}

export function LeagueCard({ league }: LeagueCardProps) {
  const t = useT();
  return (
    <Link to={`/leagues/${league.id}`}>
      <div className="group bg-white border border-[#D9D4CC] rounded-lg p-5 transition-colors duration-150 hover:border-[#B8B2AA] hover:bg-[#FAFAFA] cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg shrink-0 flex items-center justify-center font-heading font-black text-base text-[#8B1E1E] bg-[#FEF2F2] border border-[#FECACA]">
            {league.name[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-heading font-black text-[#111111] text-[15px] truncate">{league.name}</h3>
              {league.is_owner && <Badge variant="gold" size="sm">{t('leagueDetail.owner')}</Badge>}
            </div>
            {league.description && (
              <p className="text-xs text-[#666666] line-clamp-2 mb-3">{league.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[#999390] flex items-center gap-1">
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                {league.member_count} {t('leagueCard.members')}
              </span>
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-[#F2EFE9] border border-[#E8E4DE] text-[#666666]">
                {league.invite_code}
              </span>
            </div>
          </div>

          <svg className="size-4 text-[#D9D4CC] shrink-0 group-hover:text-[#8B1E1E] transition-colors mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
