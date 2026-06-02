import { Link } from 'react-router-dom';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { League } from '../../types';

interface LeagueCardProps {
  league: League;
}

export function LeagueCard({ league }: LeagueCardProps) {
  return (
    <Link to={`/leagues/${league.id}`}>
      <Card className="hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 cursor-pointer">
        <CardBody className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-white truncate">{league.name}</h3>
              {league.is_owner && <Badge variant="gold">Owner</Badge>}
            </div>
            {league.description && (
              <p className="text-sm text-slate-400 line-clamp-2 mb-3">{league.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                {league.member_count} {league.member_count === 1 ? 'member' : 'members'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {league.invite_code}
              </span>
            </div>
          </div>
          <svg className="size-5 text-slate-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </CardBody>
      </Card>
    </Link>
  );
}
