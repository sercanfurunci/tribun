export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  created_at: Date;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  owner_id: string;
  is_public: boolean;
  created_at: Date;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  joined_at: Date;
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  kickoff_time: Date;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  home_score?: number;
  away_score?: number;
  tournament?: string;
  match_day?: string;
  external_id?: number;
  external_league_id?: number;
  external_season?: number;
  venue?: string;
  referee?: string;
  created_at: Date;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  league_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_awarded: number;
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  predictions_count: number;
  exact_scores: number;
  correct_outcomes: number;
  position: number;
  position_change?: number;
}
