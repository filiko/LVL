-- ====================================
-- LevelGG 32v32 Tournament System
-- Supabase Database Schema
-- ====================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- ENUMS
-- ====================================

CREATE TYPE player_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');
CREATE TYPE tournament_mode AS ENUM ('16v16', '32v32', '64v64');
CREATE TYPE platform AS ENUM ('PC', 'XBOX', 'PLAYSTATION');
CREATE TYPE bracket_type AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS');
CREATE TYPE team_role AS ENUM ('CAPTAIN', 'CO_LEADER', 'MEMBER');
CREATE TYPE player_position AS ENUM ('INFANTRY', 'ARMOR', 'HELI', 'JET', 'SUPPORT');
CREATE TYPE squad_name AS ENUM ('ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL');
CREATE TYPE match_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE registration_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- ====================================
-- PROFILES TABLE
-- ====================================

CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    discord_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    tier player_tier DEFAULT 'BRONZE',
    country_code VARCHAR(2),
    region VARCHAR(255),
    is_team_lead BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- GAMES TABLE
-- ====================================

CREATE TABLE games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- TOURNAMENTS TABLE
-- ====================================

CREATE TABLE tournaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    mode tournament_mode NOT NULL,
    max_players INTEGER NOT NULL,
    registered_players INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    region VARCHAR(255) NOT NULL,
    platform platform NOT NULL,
    language VARCHAR(255) NOT NULL,
    tournament_type VARCHAR(50) DEFAULT 'RANKED',
    bracket_type bracket_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_started BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    prize_pool DECIMAL(10,2),
    entry_fee DECIMAL(10,2),
    description TEXT,
    rules TEXT,
    discord_channel VARCHAR(255),
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- TEAMS TABLE
-- ====================================

CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(10),
    description TEXT,
    logo_url TEXT,
    tier player_tier DEFAULT 'BRONZE',
    region VARCHAR(255),
    language VARCHAR(255),
    captain_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 32,
    join_code VARCHAR(10) UNIQUE NOT NULL,
    is_recruiting BOOLEAN DEFAULT true,
    discord_server TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- TEAM MEMBERS TABLE
-- ====================================

CREATE TABLE team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role team_role DEFAULT 'MEMBER',
    position player_position DEFAULT 'INFANTRY',
    squad_assignment squad_name,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, player_id)
);

-- ====================================
-- REGISTRATIONS TABLE
-- ====================================

CREATE TABLE registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    registered_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status registration_status DEFAULT 'PENDING',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(tournament_id, team_id)
);

-- ====================================
-- MATCHES TABLE
-- ====================================

CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    team1_score INTEGER,
    team2_score INTEGER,
    status match_status DEFAULT 'SCHEDULED',
    scheduled_time TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    map_name VARCHAR(255),
    server_info JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- PLAYER STATS TABLE
-- ====================================

CREATE TABLE player_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    vehicles_destroyed INTEGER DEFAULT 0,
    objectives_captured INTEGER DEFAULT 0,
    revives INTEGER DEFAULT 0,
    match_time INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- INDEXES
-- ====================================

-- Performance indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_discord_id ON profiles(discord_id);
CREATE INDEX idx_tournaments_mode ON tournaments(mode);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_tournaments_is_active ON tournaments(is_active);
CREATE INDEX idx_teams_captain_id ON teams(captain_id);
CREATE INDEX idx_teams_join_code ON teams(join_code);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_player_id ON team_members(player_id);
CREATE INDEX idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX idx_registrations_team_id ON registrations(team_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_round_number ON matches(round_number);
CREATE INDEX idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX idx_player_stats_tournament_id ON player_stats(tournament_id);

-- ====================================
-- FUNCTIONS
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate join codes
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT[] := '{A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9}';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || chars[1+random()*(array_length(chars, 1)-1)];
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE teams 
        SET member_count = (
            SELECT COUNT(*) 
            FROM team_members 
            WHERE team_id = NEW.team_id AND is_active = true
        )
        WHERE id = NEW.team_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE teams 
        SET member_count = (
            SELECT COUNT(*) 
            FROM team_members 
            WHERE team_id = OLD.team_id AND is_active = true
        )
        WHERE id = OLD.team_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update tournament registered players count
CREATE OR REPLACE FUNCTION update_tournament_registered_players()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tournaments
        SET registered_players = (
            SELECT COALESCE(SUM(t.member_count), 0)
            FROM registrations r
            JOIN teams t ON t.id = r.team_id
            WHERE r.tournament_id = NEW.tournament_id
            AND r.status = 'CONFIRMED'
        )
        WHERE id = NEW.tournament_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tournaments
        SET registered_players = (
            SELECT COALESCE(SUM(t.member_count), 0)
            FROM registrations r
            JOIN teams t ON t.id = r.team_id
            WHERE r.tournament_id = OLD.tournament_id
            AND r.status = 'CONFIRMED'
        )
        WHERE id = OLD.tournament_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- TRIGGERS
-- ====================================

-- Updated timestamp triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON teams 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Team member count triggers
CREATE TRIGGER trigger_update_team_member_count_insert
    AFTER INSERT ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

CREATE TRIGGER trigger_update_team_member_count_delete
    AFTER DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

-- Tournament registered players triggers
CREATE TRIGGER trigger_update_tournament_registered_players_insert
    AFTER INSERT ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_tournament_registered_players();

CREATE TRIGGER trigger_update_tournament_registered_players_delete
    AFTER DELETE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_tournament_registered_players();

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Games policies
CREATE POLICY "Anyone can view games" ON games
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage games" ON games
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Tournaments policies
CREATE POLICY "Anyone can view active tournaments" ON tournaments
    FOR SELECT USING (is_active = true);

CREATE POLICY "Tournament creators and admins can update tournaments" ON tournaments
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Team leads and admins can create tournaments" ON tournaments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND (is_team_lead = true OR is_admin = true)
        )
    );

-- Teams policies
CREATE POLICY "Anyone can view teams" ON teams
    FOR SELECT USING (true);

CREATE POLICY "Team captains can update their teams" ON teams
    FOR UPDATE USING (auth.uid() = captain_id);

CREATE POLICY "Team leads can create teams" ON teams
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_team_lead = true
        )
    );

-- Team members policies
CREATE POLICY "Anyone can view team members" ON team_members
    FOR SELECT USING (true);

CREATE POLICY "Team captains and members can manage memberships" ON team_members
    FOR ALL USING (
        auth.uid() = player_id OR
        EXISTS (
            SELECT 1 FROM teams
            WHERE id = team_id AND captain_id = auth.uid()
        )
    );

-- Registrations policies
CREATE POLICY "Anyone can view registrations" ON registrations
    FOR SELECT USING (true);

CREATE POLICY "Team captains can register their teams" ON registrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE id = team_id AND captain_id = auth.uid()
        )
    );

CREATE POLICY "Team captains and admins can update registrations" ON registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE id = team_id AND captain_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Matches policies
CREATE POLICY "Anyone can view matches" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage matches" ON matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Player stats policies
CREATE POLICY "Anyone can view player stats" ON player_stats
    FOR SELECT USING (true);

CREATE POLICY "Players can view/update their own stats" ON player_stats
    FOR ALL USING (auth.uid() = player_id);

-- ====================================
-- INITIAL DATA
-- ====================================

-- Insert default games
INSERT INTO games (name, code, description, is_active) VALUES
('Battlefield 2042', 'BF2042', 'Large-scale multiplayer warfare', true),
('NHL 24', 'NHL24', 'Professional ice hockey simulation', true);

-- Insert default admin user (will be created via auth)
-- This is just a placeholder - actual admin setup happens via Supabase auth

-- ====================================
-- HELPER VIEWS
-- ====================================

-- View for team details with member info
CREATE VIEW team_details AS
SELECT 
    t.*,
    p.username as captain_username,
    p.tier as captain_tier,
    COUNT(tm.id) as actual_member_count
FROM teams t
LEFT JOIN profiles p ON p.id = t.captain_id
LEFT JOIN team_members tm ON tm.team_id = t.id AND tm.is_active = true
GROUP BY t.id, p.username, p.tier;

-- View for tournament with registration stats
CREATE VIEW tournament_stats AS
SELECT 
    t.*,
    COUNT(r.id) as registered_teams,
    g.name as game_name
FROM tournaments t
LEFT JOIN registrations r ON r.tournament_id = t.id AND r.status = 'CONFIRMED'
LEFT JOIN games g ON g.id = t.game_id
GROUP BY t.id, g.name;