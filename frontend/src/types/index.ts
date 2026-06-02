export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  owner_id: string;
  is_public: boolean;
  member_count: number;
  is_owner: boolean;
  is_member: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  kickoff_time: string;
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
  created_at: string;
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
  created_at: string;
  updated_at: string;
  home_team?: string;
  away_team?: string;
  kickoff_time?: string;
  status?: string;
  home_score?: number;
  away_score?: number;
  tournament?: string;
  username?: string;
  avatar_url?: string;
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
}

export interface UserStats {
  total_predictions: number;
  total_points: number;
  exact_scores: number;
  correct_outcomes: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
