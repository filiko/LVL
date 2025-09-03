-- LevelGG Test Data Population Script
-- This script creates realistic test data for development and testing

-- First, ensure we have some base games
INSERT INTO games (name, code, description, is_active) VALUES
('Battlefield 2042', 'BF2042', 'Large-scale multiplayer warfare with up to 128 players', true),
('NHL 24', 'NHL24', 'Professional ice hockey simulation', true),
('Call of Duty: Warzone', 'COD_WZ', 'Battle royale shooter', true),
('Apex Legends', 'APEX', 'Hero-based battle royale', true)
ON CONFLICT (code) DO NOTHING;

-- Create test user profiles (these would normally be created via OAuth)
-- Note: In production, these would be created through Supabase Auth
INSERT INTO profiles (id, username, email, tier, is_admin, is_team_lead, avatar_url, created_at, updated_at) VALUES
-- Admin users
('admin-001', 'SuperAdmin', 'admin@levelgg.com', 'DIAMOND', true, true, 'https://ui-avatars.com/api/?name=SuperAdmin&background=dc2626', NOW(), NOW()),
('admin-002', 'GameMaster', 'gamemaster@levelgg.com', 'PLATINUM', true, true, 'https://ui-avatars.com/api/?name=GameMaster&background=dc2626', NOW(), NOW()),

-- Team Leaders
('team-lead-001', 'AlphaCommander', 'alpha@example.com', 'PLATINUM', false, true, 'https://ui-avatars.com/api/?name=AlphaCommander&background=2563eb', NOW(), NOW()),
('team-lead-002', 'BravoLeader', 'bravo@example.com', 'GOLD', false, true, 'https://ui-avatars.com/api/?name=BravoLeader&background=2563eb', NOW(), NOW()),
('team-lead-003', 'CharlieChief', 'charlie@example.com', 'PLATINUM', false, true, 'https://ui-avatars.com/api/?name=CharlieChief&background=2563eb', NOW(), NOW()),
('team-lead-004', 'DeltaCaptain', 'delta@example.com', 'GOLD', false, true, 'https://ui-avatars.com/api/?name=DeltaCaptain&background=2563eb', NOW(), NOW()),
('team-lead-005', 'EchoLeader', 'echo@example.com', 'DIAMOND', false, true, 'https://ui-avatars.com/api/?name=EchoLeader&background=2563eb', NOW(), NOW()),

-- Regular players - Bronze tier
('player-001', 'Rookie_Sniper', 'rookie1@example.com', 'BRONZE', false, false, 'https://ui-avatars.com/api/?name=Rookie_Sniper&background=ea580c', NOW(), NOW()),
('player-002', 'Newbie_Tank', 'rookie2@example.com', 'BRONZE', false, false, 'https://ui-avatars.com/api/?name=Newbie_Tank&background=ea580c', NOW(), NOW()),
('player-003', 'Fresh_Pilot', 'rookie3@example.com', 'BRONZE', false, false, 'https://ui-avatars.com/api/?name=Fresh_Pilot&background=ea580c', NOW(), NOW()),
('player-004', 'Boot_Soldier', 'rookie4@example.com', 'BRONZE', false, false, 'https://ui-avatars.com/api/?name=Boot_Soldier&background=ea580c', NOW(), NOW()),
('player-005', 'Cadet_Gunner', 'rookie5@example.com', 'BRONZE', false, false, 'https://ui-avatars.com/api/?name=Cadet_Gunner&background=ea580c', NOW(), NOW()),

-- Regular players - Silver tier
('player-006', 'Silver_Bullet', 'silver1@example.com', 'SILVER', false, false, 'https://ui-avatars.com/api/?name=Silver_Bullet&background=6b7280', NOW(), NOW()),
('player-007', 'Steel_Rain', 'silver2@example.com', 'SILVER', false, false, 'https://ui-avatars.com/api/?name=Steel_Rain&background=6b7280', NOW(), NOW()),
('player-008', 'Iron_Fist', 'silver3@example.com', 'SILVER', false, false, 'https://ui-avatars.com/api/?name=Iron_Fist&background=6b7280', NOW(), NOW()),
('player-009', 'Quick_Silver', 'silver4@example.com', 'SILVER', false, false, 'https://ui-avatars.com/api/?name=Quick_Silver&background=6b7280', NOW(), NOW()),
('player-010', 'Storm_Trooper', 'silver5@example.com', 'SILVER', false, false, 'https://ui-avatars.com/api/?name=Storm_Trooper&background=6b7280', NOW(), NOW()),

-- Regular players - Gold tier
('player-011', 'Golden_Eagle', 'gold1@example.com', 'GOLD', false, false, 'https://ui-avatars.com/api/?name=Golden_Eagle&background=eab308', NOW(), NOW()),
('player-012', 'War_Machine', 'gold2@example.com', 'GOLD', false, false, 'https://ui-avatars.com/api/?name=War_Machine&background=eab308', NOW(), NOW()),
('player-013', 'Battle_Hawk', 'gold3@example.com', 'GOLD', false, false, 'https://ui-avatars.com/api/?name=Battle_Hawk&background=eab308', NOW(), NOW()),
('player-014', 'Viper_Strike', 'gold4@example.com', 'GOLD', false, false, 'https://ui-avatars.com/api/?name=Viper_Strike&background=eab308', NOW(), NOW()),
('player-015', 'Thunder_Bolt', 'gold5@example.com', 'GOLD', false, false, 'https://ui-avatars.com/api/?name=Thunder_Bolt&background=eab308', NOW(), NOW()),

-- Regular players - Platinum tier
('player-016', 'Platinum_Wolf', 'plat1@example.com', 'PLATINUM', false, false, 'https://ui-avatars.com/api/?name=Platinum_Wolf&background=06b6d4', NOW(), NOW()),
('player-017', 'Cyber_Ops', 'plat2@example.com', 'PLATINUM', false, false, 'https://ui-avatars.com/api/?name=Cyber_Ops&background=06b6d4', NOW(), NOW()),
('player-018', 'Steel_Phoenix', 'plat3@example.com', 'PLATINUM', false, false, 'https://ui-avatars.com/api/?name=Steel_Phoenix&background=06b6d4', NOW(), NOW()),
('player-019', 'Shadow_Hunter', 'plat4@example.com', 'PLATINUM', false, false, 'https://ui-avatars.com/api/?name=Shadow_Hunter&background=06b6d4', NOW(), NOW()),
('player-020', 'Frost_Bite', 'plat5@example.com', 'PLATINUM', false, false, 'https://ui-avatars.com/api/?name=Frost_Bite&background=06b6d4', NOW(), NOW()),

-- Regular players - Diamond tier
('player-021', 'Diamond_Edge', 'diamond1@example.com', 'DIAMOND', false, false, 'https://ui-avatars.com/api/?name=Diamond_Edge&background=8b5cf6', NOW(), NOW()),
('player-022', 'Apex_Predator', 'diamond2@example.com', 'DIAMOND', false, false, 'https://ui-avatars.com/api/?name=Apex_Predator&background=8b5cf6', NOW(), NOW()),
('player-023', 'Elite_Phantom', 'diamond3@example.com', 'DIAMOND', false, false, 'https://ui-avatars.com/api/?name=Elite_Phantom&background=8b5cf6', NOW(), NOW()),
('player-024', 'Master_Chief', 'diamond4@example.com', 'DIAMOND', false, false, 'https://ui-avatars.com/api/?name=Master_Chief&background=8b5cf6', NOW(), NOW()),
('player-025', 'Legend_Killer', 'diamond5@example.com', 'DIAMOND', false, false, 'https://ui-avatars.com/api/?name=Legend_Killer&background=8b5cf6', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create teams with realistic military-style names and structure
INSERT INTO teams (id, name, tag, description, captain_id, is_recruiting, join_code, created_at, updated_at) VALUES
('team-001', 'Alpha Strike Force', 'ALPHA', 'Elite tactical unit specializing in aggressive assault operations. Looking for dedicated players who can coordinate under pressure.', 'team-lead-001', true, 'ALPHA1', NOW(), NOW()),
('team-002', 'Bravo Battalion', 'BRAVO', 'Defensive specialists with strong teamwork. We focus on strategic positioning and support roles.', 'team-lead-002', true, 'BRAVO2', NOW(), NOW()),
('team-003', 'Charlie Company', 'CHAR', 'Versatile squad capable of adapting to any situation. Mix of aggressive and defensive playstyles.', 'team-lead-003', false, 'CHAR33', NOW(), NOW()),
('team-004', 'Delta Force Elite', 'DELTA', 'Special operations team. High skill requirement, competitive focus.', 'team-lead-004', true, 'DELT44', NOW(), NOW()),
('team-005', 'Echo Squadron', 'ECHO', 'Air superiority focused team with excellent pilots and ground support coordination.', 'team-lead-005', true, 'ECHO5', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add team members with realistic squad and role assignments
INSERT INTO team_members (id, team_id, user_id, role, squad, position, joined_at) VALUES
-- Alpha Strike Force (team-001)
('member-001', 'team-001', 'team-lead-001', 'CAPTAIN', 'ALPHA', 'INFANTRY', NOW()),
('member-002', 'team-001', 'player-021', 'CO_LEADER', 'ALPHA', 'ARMOR', NOW()),
('member-003', 'team-001', 'player-016', 'MEMBER', 'ALPHA', 'HELI', NOW()),
('member-004', 'team-001', 'player-011', 'MEMBER', 'ALPHA', 'JET', NOW()),
('member-005', 'team-001', 'player-006', 'MEMBER', 'ALPHA', 'SUPPORT', NOW()),
('member-006', 'team-001', 'player-001', 'MEMBER', 'BRAVO', 'INFANTRY', NOW()),
('member-007', 'team-001', 'player-007', 'MEMBER', 'BRAVO', 'ARMOR', NOW()),
('member-008', 'team-001', 'player-012', 'MEMBER', 'BRAVO', 'SUPPORT', NOW()),

-- Bravo Battalion (team-002)
('member-009', 'team-002', 'team-lead-002', 'CAPTAIN', 'ALPHA', 'SUPPORT', NOW()),
('member-010', 'team-002', 'player-022', 'CO_LEADER', 'ALPHA', 'INFANTRY', NOW()),
('member-011', 'team-002', 'player-017', 'MEMBER', 'ALPHA', 'ARMOR', NOW()),
('member-012', 'team-002', 'player-013', 'MEMBER', 'ALPHA', 'HELI', NOW()),
('member-013', 'team-002', 'player-008', 'MEMBER', 'ALPHA', 'JET', NOW()),
('member-014', 'team-002', 'player-002', 'MEMBER', 'BRAVO', 'INFANTRY', NOW()),
('member-015', 'team-002', 'player-009', 'MEMBER', 'BRAVO', 'SUPPORT', NOW()),

-- Charlie Company (team-003) 
('member-016', 'team-003', 'team-lead-003', 'CAPTAIN', 'ALPHA', 'INFANTRY', NOW()),
('member-017', 'team-003', 'player-023', 'CO_LEADER', 'ALPHA', 'JET', NOW()),
('member-018', 'team-003', 'player-018', 'MEMBER', 'ALPHA', 'ARMOR', NOW()),
('member-019', 'team-003', 'player-014', 'MEMBER', 'ALPHA', 'HELI', NOW()),
('member-020', 'team-003', 'player-010', 'MEMBER', 'ALPHA', 'SUPPORT', NOW()),
('member-021', 'team-003', 'player-003', 'MEMBER', 'BRAVO', 'INFANTRY', NOW()),

-- Delta Force Elite (team-004)
('member-022', 'team-004', 'team-lead-004', 'CAPTAIN', 'ALPHA', 'INFANTRY', NOW()),
('member-023', 'team-004', 'player-024', 'CO_LEADER', 'ALPHA', 'ARMOR', NOW()),
('member-024', 'team-004', 'player-019', 'MEMBER', 'ALPHA', 'JET', NOW()),
('member-025', 'team-004', 'player-015', 'MEMBER', 'ALPHA', 'HELI', NOW()),
('member-026', 'team-004', 'player-004', 'MEMBER', 'ALPHA', 'SUPPORT', NOW()),

-- Echo Squadron (team-005)
('member-027', 'team-005', 'team-lead-005', 'CAPTAIN', 'ALPHA', 'JET', NOW()),
('member-028', 'team-005', 'player-025', 'CO_LEADER', 'ALPHA', 'HELI', NOW()),
('member-029', 'team-005', 'player-020', 'MEMBER', 'ALPHA', 'INFANTRY', NOW()),
('member-030', 'team-005', 'player-005', 'MEMBER', 'ALPHA', 'SUPPORT', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create tournaments with realistic scenarios
INSERT INTO tournaments (id, title, game_id, mode, max_players, start_date, end_date, region, platform, language, bracket_type, tournament_type, prize_pool, entry_fee, description, rules, discord_channel, is_active, created_by, created_at, updated_at) VALUES
('tournament-001', 'Winter Championship 2025', 'BF2042', '32v32', 1024, '2025-02-15 18:00:00', '2025-02-16 22:00:00', 'NA', 'PC', 'English', 'SINGLE_ELIMINATION', 'RANKED', 5000.00, 25.00, 'The biggest tournament of the winter season! Compete for glory and prizes in intense 32v32 battles.', 'Standard LevelGG tournament rules apply. No cheating, respect all players, follow admin instructions.', 'https://discord.gg/levelgg-winter', true, 'admin-001', NOW(), NOW()),

('tournament-002', 'Spring Showdown', 'BF2042', '16v16', 512, '2025-03-01 19:00:00', '2025-03-02 23:00:00', 'EU', 'PC', 'English', 'DOUBLE_ELIMINATION', 'RANKED', 2500.00, 15.00, 'European spring tournament featuring double elimination bracket for maximum competition.', 'EU server rules. Ping limit 150ms. English communication required.', 'https://discord.gg/levelgg-spring', true, 'admin-002', NOW(), NOW()),

('tournament-003', 'Quick Strike Series', 'BF2042', '16v16', 256, '2025-01-20 20:00:00', '2025-01-20 23:00:00', 'NA', 'PC', 'English', 'SWISS', 'CASUAL', 500.00, 5.00, 'Fast-paced Swiss system tournament for a quick evening of competitive play.', 'Casual rules, have fun but play fair!', NULL, true, 'admin-001', NOW(), NOW()),

('tournament-004', 'NHL Pro League', 'NHL24', '3v3', 96, '2025-02-10 21:00:00', '2025-02-11 01:00:00', 'NA', 'XBOX', 'English', 'ROUND_ROBIN', 'RANKED', 1000.00, 20.00, 'Professional NHL tournament with round-robin group stage followed by playoffs.', 'Official NHL rules. No custom teams.', 'https://discord.gg/levelgg-nhl', false, 'admin-002', NOW(), NOW()),

('tournament-005', 'Apex Legends Showdown', 'APEX', '3v3', 180, '2025-01-25 18:00:00', '2025-01-26 22:00:00', 'NA', 'PC', 'English', 'SINGLE_ELIMINATION', 'RANKED', 3000.00, 30.00, 'High stakes Apex Legends tournament with substantial prize pool.', 'Ranked rules only. Diamond tier and above preferred.', 'https://discord.gg/levelgg-apex', true, 'admin-001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Register teams for tournaments
INSERT INTO registrations (id, tournament_id, team_id, user_id, status, registered_at) VALUES
-- Winter Championship registrations
('reg-001', 'tournament-001', 'team-001', 'team-lead-001', 'CONFIRMED', NOW()),
('reg-002', 'tournament-001', 'team-002', 'team-lead-002', 'CONFIRMED', NOW()),
('reg-003', 'tournament-001', 'team-003', 'team-lead-003', 'CONFIRMED', NOW()),
('reg-004', 'tournament-001', 'team-004', 'team-lead-004', 'PENDING', NOW()),

-- Spring Showdown registrations
('reg-005', 'tournament-002', 'team-001', 'team-lead-001', 'CONFIRMED', NOW()),
('reg-006', 'tournament-002', 'team-005', 'team-lead-005', 'CONFIRMED', NOW()),

-- Quick Strike Series registrations
('reg-007', 'tournament-003', 'team-002', 'team-lead-002', 'CONFIRMED', NOW()),
('reg-008', 'tournament-003', 'team-004', 'team-lead-004', 'CONFIRMED', NOW()),
('reg-009', 'tournament-003', 'team-005', 'team-lead-005', 'CONFIRMED', NOW()),

-- Apex Legends registrations
('reg-010', 'tournament-005', 'team-001', 'team-lead-001', 'CONFIRMED', NOW()),
('reg-011', 'tournament-005', 'team-003', 'team-lead-003', 'CONFIRMED', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some sample matches for tournaments
INSERT INTO matches (id, tournament_id, round, position, team1_id, team2_id, team1_score, team2_score, winner_id, is_completed, scheduled_time, created_at, updated_at) VALUES
-- Winter Championship matches
('match-001', 'tournament-001', 1, 1, 'team-001', 'team-002', 2, 1, 'team-001', true, '2025-02-15 18:00:00', NOW(), NOW()),
('match-002', 'tournament-001', 1, 2, 'team-003', 'team-004', 1, 2, 'team-004', true, '2025-02-15 18:30:00', NOW(), NOW()),
('match-003', 'tournament-001', 2, 1, 'team-001', 'team-004', NULL, NULL, NULL, false, '2025-02-15 20:00:00', NOW(), NOW()),

-- Quick Strike Series matches
('match-004', 'tournament-003', 1, 1, 'team-002', 'team-004', 3, 1, 'team-002', true, '2025-01-20 20:00:00', NOW(), NOW()),
('match-005', 'tournament-003', 1, 2, 'team-005', 'team-002', 0, 2, 'team-002', true, '2025-01-20 20:30:00', NOW(), NOW()),
('match-006', 'tournament-003', 2, 1, 'team-002', 'team-005', NULL, NULL, NULL, false, '2025-01-20 21:00:00', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some player statistics
INSERT INTO player_stats (id, player_id, tournament_id, kills, deaths, assists, score, match_time, created_at) VALUES
('stat-001', 'team-lead-001', 'tournament-001', 25, 12, 8, 2850, 3600, NOW()),
('stat-002', 'player-021', 'tournament-001', 18, 15, 12, 2100, 3600, NOW()),
('stat-003', 'team-lead-002', 'tournament-001', 12, 18, 15, 1950, 3600, NOW()),
('stat-004', 'player-022', 'tournament-001', 22, 14, 6, 2400, 3600, NOW()),
('stat-005', 'team-lead-003', 'tournament-001', 8, 20, 18, 1650, 3600, NOW()),
('stat-006', 'team-lead-004', 'tournament-001', 28, 10, 5, 3100, 3600, NOW()),
('stat-007', 'team-lead-002', 'tournament-003', 15, 8, 10, 2200, 1800, NOW()),
('stat-008', 'team-lead-004', 'tournament-003', 12, 12, 14, 1950, 1800, NOW()),
('stat-009', 'team-lead-005', 'tournament-003', 9, 15, 16, 1750, 1800, NOW())
ON CONFLICT (id) DO NOTHING;

-- Update team member counts (trigger should handle this, but let's be explicit)
UPDATE teams SET 
  member_count = (SELECT COUNT(*) FROM team_members WHERE team_id = teams.id)
WHERE id IN ('team-001', 'team-002', 'team-003', 'team-004', 'team-005');

-- Update tournament registered player counts
UPDATE tournaments SET 
  registered_players = (SELECT COUNT(*) FROM registrations WHERE tournament_id = tournaments.id AND status = 'CONFIRMED')
WHERE id IN ('tournament-001', 'tournament-002', 'tournament-003', 'tournament-004', 'tournament-005');

-- Create some recent activity for the admin dashboard
-- Note: This would normally be handled by triggers/functions in a real application