export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          discord_id: string | null
          avatar_url: string | null
          tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
          country_code: string | null
          region: string | null
          is_team_lead: boolean
          is_admin: boolean
          is_online: boolean
          last_activity: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          discord_id?: string | null
          avatar_url?: string | null
          tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
          country_code?: string | null
          region?: string | null
          is_team_lead?: boolean
          is_admin?: boolean
          is_online?: boolean
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          discord_id?: string | null
          avatar_url?: string | null
          tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
          country_code?: string | null
          region?: string | null
          is_team_lead?: boolean
          is_admin?: boolean
          is_online?: boolean
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          title: string
          game_id: string
          mode: '16v16' | '32v32' | '64v64'
          max_players: number
          registered_players: number
          start_date: string
          end_date: string | null
          region: string
          platform: 'PC' | 'XBOX' | 'PLAYSTATION'
          language: string
          tournament_type: 'RANKED' | 'CASUAL' | 'CHAMPIONSHIP'
          bracket_type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS'
          is_active: boolean
          is_started: boolean
          is_completed: boolean
          prize_pool: number | null
          entry_fee: number | null
          description: string | null
          rules: string | null
          discord_channel: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          game_id: string
          mode: '16v16' | '32v32' | '64v64'
          max_players: number
          registered_players?: number
          start_date: string
          end_date?: string | null
          region: string
          platform: 'PC' | 'XBOX' | 'PLAYSTATION'
          language: string
          tournament_type: 'RANKED' | 'CASUAL' | 'CHAMPIONSHIP'
          bracket_type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS'
          is_active?: boolean
          is_started?: boolean
          is_completed?: boolean
          prize_pool?: number | null
          entry_fee?: number | null
          description?: string | null
          rules?: string | null
          discord_channel?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          game_id?: string
          mode?: '16v16' | '32v32' | '64v64'
          max_players?: number
          registered_players?: number
          start_date?: string
          end_date?: string | null
          region?: string
          platform?: 'PC' | 'XBOX' | 'PLAYSTATION'
          language?: string
          tournament_type?: 'RANKED' | 'CASUAL' | 'CHAMPIONSHIP'
          bracket_type?: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS'
          is_active?: boolean
          is_started?: boolean
          is_completed?: boolean
          prize_pool?: number | null
          entry_fee?: number | null
          description?: string | null
          rules?: string | null
          discord_channel?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          tag: string | null
          description: string | null
          logo_url: string | null
          tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
          region: string | null
          language: string | null
          captain_id: string
          member_count: number
          max_members: number
          join_code: string
          is_recruiting: boolean
          discord_server: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tag?: string | null
          description?: string | null
          logo_url?: string | null
          tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
          region?: string | null
          language?: string | null
          captain_id: string
          member_count?: number
          max_members?: number
          join_code: string
          is_recruiting?: boolean
          discord_server?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tag?: string | null
          description?: string | null
          logo_url?: string | null
          tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
          region?: string | null
          language?: string | null
          captain_id?: string
          member_count?: number
          max_members?: number
          join_code?: string
          is_recruiting?: boolean
          discord_server?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          player_id: string
          role: 'CAPTAIN' | 'CO_LEADER' | 'MEMBER'
          position: 'INFANTRY' | 'ARMOR' | 'HELI' | 'JET' | 'SUPPORT'
          squad_assignment: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA' | 'ECHO' | 'FOXTROT' | 'GOLF' | 'HOTEL' | null
          joined_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          team_id: string
          player_id: string
          role?: 'CAPTAIN' | 'CO_LEADER' | 'MEMBER'
          position?: 'INFANTRY' | 'ARMOR' | 'HELI' | 'JET' | 'SUPPORT'
          squad_assignment?: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA' | 'ECHO' | 'FOXTROT' | 'GOLF' | 'HOTEL' | null
          joined_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          team_id?: string
          player_id?: string
          role?: 'CAPTAIN' | 'CO_LEADER' | 'MEMBER'
          position?: 'INFANTRY' | 'ARMOR' | 'HELI' | 'JET' | 'SUPPORT'
          squad_assignment?: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA' | 'ECHO' | 'FOXTROT' | 'GOLF' | 'HOTEL' | null
          joined_at?: string
          is_active?: boolean
        }
      }
      registrations: {
        Row: {
          id: string
          tournament_id: string
          team_id: string
          registered_by: string
          status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
          registered_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          tournament_id: string
          team_id: string
          registered_by: string
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
          registered_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          tournament_id?: string
          team_id?: string
          registered_by?: string
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
          registered_at?: string
          notes?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          round_number: number
          match_number: number
          team1_id: string | null
          team2_id: string | null
          winner_id: string | null
          team1_score: number | null
          team2_score: number | null
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          scheduled_time: string | null
          started_at: string | null
          completed_at: string | null
          map_name: string | null
          server_info: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round_number: number
          match_number: number
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
          team1_score?: number | null
          team2_score?: number | null
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          scheduled_time?: string | null
          started_at?: string | null
          completed_at?: string | null
          map_name?: string | null
          server_info?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round_number?: number
          match_number?: number
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
          team1_score?: number | null
          team2_score?: number | null
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          scheduled_time?: string | null
          started_at?: string | null
          completed_at?: string | null
          map_name?: string | null
          server_info?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      player_stats: {
        Row: {
          id: string
          player_id: string
          tournament_id: string
          kills: number
          deaths: number
          assists: number
          score: number
          vehicles_destroyed: number
          objectives_captured: number
          revives: number
          match_time: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          tournament_id: string
          kills?: number
          deaths?: number
          assists?: number
          score?: number
          vehicles_destroyed?: number
          objectives_captured?: number
          revives?: number
          match_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          tournament_id?: string
          kills?: number
          deaths?: number
          assists?: number
          score?: number
          vehicles_destroyed?: number
          objectives_captured?: number
          revives?: number
          match_time?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      player_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
      tournament_mode: '16v16' | '32v32' | '64v64'
      platform: 'PC' | 'XBOX' | 'PLAYSTATION'
      bracket_type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS'
      team_role: 'CAPTAIN' | 'CO_LEADER' | 'MEMBER'
      player_position: 'INFANTRY' | 'ARMOR' | 'HELI' | 'JET' | 'SUPPORT'
      squad_name: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA' | 'ECHO' | 'FOXTROT' | 'GOLF' | 'HOTEL'
      match_status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
      registration_status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Game = Database['public']['Tables']['games']['Row']
export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type PlayerStats = Database['public']['Tables']['player_stats']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
export type RegistrationInsert = Database['public']['Tables']['registrations']['Insert']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']
export type RegistrationUpdate = Database['public']['Tables']['registrations']['Update']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

// Enum types
export type PlayerTier = Database['public']['Enums']['player_tier']
export type TournamentMode = Database['public']['Enums']['tournament_mode']
export type Platform = Database['public']['Enums']['platform']
export type BracketType = Database['public']['Enums']['bracket_type']
export type TeamRole = Database['public']['Enums']['team_role']
export type PlayerPosition = Database['public']['Enums']['player_position']
export type SquadName = Database['public']['Enums']['squad_name']
export type MatchStatus = Database['public']['Enums']['match_status']
export type RegistrationStatus = Database['public']['Enums']['registration_status']