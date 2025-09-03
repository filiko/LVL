/**
 * User Simulation Script for LevelGG
 * Creates realistic user accounts and activity patterns for testing
 */

const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const CONFIG = {
  NUM_USERS: 50,
  NUM_ADDITIONAL_TEAMS: 10,
  NUM_ADDITIONAL_TOURNAMENTS: 5,
  ACTIVITY_DAYS: 7 // Days of historical activity to simulate
};

// Gaming-themed username prefixes and suffixes
const USERNAME_PARTS = {
  prefixes: [
    'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Ghost', 'Hunter',
    'Iron', 'Killer', 'Lightning', 'Master', 'Ninja', 'Omega', 'Phoenix',
    'Quick', 'Ranger', 'Shadow', 'Tiger', 'Ultra', 'Viper', 'Wolf', 'Xray',
    'Yankee', 'Zulu', 'Storm', 'Frost', 'Blaze', 'Steel', 'Cyber', 'Raven',
    'Eagle', 'Hawk', 'Falcon', 'Venom', 'Titan', 'Phantom', 'Wraith', 'Specter'
  ],
  suffixes: [
    'Strike', 'Force', 'Ops', 'Elite', 'Pro', 'Legend', 'Master', 'King',
    'Sniper', 'Tank', 'Pilot', 'Gunner', 'Warrior', 'Fighter', 'Soldier',
    'Reaper', 'Destroyer', 'Hunter', 'Killer', 'Slayer', 'Beast', 'Demon',
    'Angel', 'Knight', 'Lord', 'Chief', 'Captain', 'Major', 'General',
    '2K24', '2K25', 'X', 'Prime', 'Max', 'Ultra', 'Mega', 'Super', 'Hyper'
  ]
};

const TEAM_NAMES = {
  adjectives: [
    'Elite', 'Tactical', 'Special', 'Advanced', 'Lethal', 'Silent', 'Storm',
    'Iron', 'Steel', 'Diamond', 'Platinum', 'Golden', 'Silver', 'Bronze',
    'Crimson', 'Shadow', 'Frost', 'Fire', 'Thunder', 'Lightning', 'Viper',
    'Eagle', 'Wolf', 'Bear', 'Tiger', 'Phoenix', 'Dragon', 'Hawk', 'Raven'
  ],
  nouns: [
    'Squad', 'Unit', 'Force', 'Division', 'Battalion', 'Company', 'Regiment',
    'Brigade', 'Corps', 'Legion', 'Strike', 'Ops', 'Team', 'Crew', 'Guild',
    'Clan', 'Alliance', 'Order', 'Brotherhood', 'Syndicate', 'Collective',
    'Assembly', 'Coalition', 'Federation', 'Union', 'League', 'Society'
  ]
};

const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
const PLATFORMS = ['PC', 'XBOX', 'PLAYSTATION'];
const REGIONS = ['NA', 'EU', 'ASIA', 'OCE'];
const ROLES = ['INFANTRY', 'ARMOR', 'HELI', 'JET', 'SUPPORT'];
const SQUADS = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT'];

/**
 * Generate a gaming-style username
 */
function generateUsername() {
  const prefix = faker.helpers.arrayElement(USERNAME_PARTS.prefixes);
  const suffix = faker.helpers.arrayElement(USERNAME_PARTS.suffixes);
  const number = faker.number.int({ min: 1, max: 999 });
  
  const formats = [
    `${prefix}_${suffix}`,
    `${prefix}${suffix}`,
    `${prefix}_${suffix}${number}`,
    `${prefix}${suffix}${number}`,
    `${suffix}_${prefix}`,
    `${prefix}${number}`
  ];
  
  return faker.helpers.arrayElement(formats);
}

/**
 * Generate a team name
 */
function generateTeamName() {
  const adjective = faker.helpers.arrayElement(TEAM_NAMES.adjectives);
  const noun = faker.helpers.arrayElement(TEAM_NAMES.nouns);
  return `${adjective} ${noun}`;
}

/**
 * Generate a team tag (2-6 characters)
 */
function generateTeamTag(teamName) {
  const words = teamName.split(' ');
  if (words.length >= 2) {
    return words.map(w => w.charAt(0)).join('').toUpperCase();
  }
  return teamName.substring(0, 4).toUpperCase();
}

/**
 * Create realistic user profiles
 */
async function createUsers() {
  console.log(`Creating ${CONFIG.NUM_USERS} user profiles...`);
  
  const users = [];
  const usedUsernames = new Set();
  const usedEmails = new Set();
  
  for (let i = 0; i < CONFIG.NUM_USERS; i++) {
    let username, email;
    
    // Ensure unique usernames and emails
    do {
      username = generateUsername();
      email = faker.internet.email().toLowerCase();
    } while (usedUsernames.has(username) || usedEmails.has(email));
    
    usedUsernames.add(username);
    usedEmails.add(email);
    
    // Weighted tier distribution (more lower tiers)
    const tierWeights = { BRONZE: 0.3, SILVER: 0.3, GOLD: 0.25, PLATINUM: 0.1, DIAMOND: 0.05 };
    const tier = faker.helpers.weightedArrayElement([
      { weight: 30, value: 'BRONZE' },
      { weight: 30, value: 'SILVER' },
      { weight: 25, value: 'GOLD' },
      { weight: 10, value: 'PLATINUM' },
      { weight: 5, value: 'DIAMOND' }
    ]);
    
    // Small chance of being team lead (not admin)
    const isTeamLead = faker.datatype.boolean(0.15); // 15% chance
    
    const user = {
      id: `sim-user-${i.toString().padStart(3, '0')}`,
      username,
      email,
      tier,
      is_admin: false,
      is_team_lead: isTeamLead,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${faker.color.rgb({ format: 'hex', prefix: '' })}`,
      created_at: faker.date.recent({ days: 30 }),
      updated_at: new Date()
    };
    
    users.push(user);
  }
  
  // Insert users in batches
  const batchSize = 20;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const { error } = await supabase
      .from('profiles')
      .insert(batch);
      
    if (error) {
      console.error(`Error inserting user batch ${i}:`, error);
    } else {
      console.log(`Inserted users ${i + 1}-${Math.min(i + batchSize, users.length)}`);
    }
  }
  
  return users;
}

/**
 * Create additional teams
 */
async function createTeams(users) {
  console.log(`Creating ${CONFIG.NUM_ADDITIONAL_TEAMS} additional teams...`);
  
  // Get team leads from created users
  const teamLeads = users.filter(u => u.is_team_lead);
  
  if (teamLeads.length === 0) {
    console.log('No team leads found, skipping team creation');
    return [];
  }
  
  const teams = [];
  const usedTeamNames = new Set();
  const usedJoinCodes = new Set();
  
  for (let i = 0; i < Math.min(CONFIG.NUM_ADDITIONAL_TEAMS, teamLeads.length); i++) {
    let teamName, joinCode;
    
    do {
      teamName = generateTeamName();
      joinCode = faker.string.alpha({ length: 6, casing: 'upper' });
    } while (usedTeamNames.has(teamName) || usedJoinCodes.has(joinCode));
    
    usedTeamNames.add(teamName);
    usedJoinCodes.add(joinCode);
    
    const team = {
      id: `sim-team-${i.toString().padStart(3, '0')}`,
      name: teamName,
      tag: generateTeamTag(teamName),
      description: faker.lorem.paragraph(),
      captain_id: teamLeads[i].id,
      is_recruiting: faker.datatype.boolean(0.7), // 70% recruiting
      join_code: joinCode,
      created_at: faker.date.recent({ days: 20 }),
      updated_at: new Date()
    };
    
    teams.push(team);
  }
  
  // Insert teams
  const { error } = await supabase
    .from('teams')
    .insert(teams);
    
  if (error) {
    console.error('Error inserting teams:', error);
  } else {
    console.log(`Created ${teams.length} teams`);
  }
  
  return teams;
}

/**
 * Assign members to teams
 */
async function assignTeamMembers(users, teams) {
  console.log('Assigning members to teams...');
  
  const teamMembers = [];
  let memberIdCounter = 1000;
  
  // Get non-team-lead users for assignment
  const availableMembers = users.filter(u => !u.is_team_lead);
  
  for (const team of teams) {
    // Add captain as member
    teamMembers.push({
      id: `sim-member-${memberIdCounter++}`,
      team_id: team.id,
      user_id: team.captain_id,
      role: 'CAPTAIN',
      squad: 'ALPHA',
      position: faker.helpers.arrayElement(ROLES),
      joined_at: team.created_at
    });
    
    // Add 3-8 random members per team
    const numMembers = faker.number.int({ min: 3, max: 8 });
    const selectedMembers = faker.helpers.arrayElements(availableMembers, numMembers);
    
    selectedMembers.forEach((member, index) => {
      // First member might be co-leader
      const role = index === 0 && faker.datatype.boolean(0.3) ? 'CO_LEADER' : 'MEMBER';
      
      teamMembers.push({
        id: `sim-member-${memberIdCounter++}`,
        team_id: team.id,
        user_id: member.id,
        role,
        squad: faker.helpers.arrayElement(SQUADS),
        position: faker.helpers.arrayElement(ROLES),
        joined_at: faker.date.between({ from: team.created_at, to: new Date() })
      });
    });
    
    // Remove assigned members from available pool to avoid duplicates
    selectedMembers.forEach(member => {
      const index = availableMembers.indexOf(member);
      if (index > -1) availableMembers.splice(index, 1);
    });
  }
  
  // Insert team members in batches
  const batchSize = 50;
  for (let i = 0; i < teamMembers.length; i += batchSize) {
    const batch = teamMembers.slice(i, i + batchSize);
    const { error } = await supabase
      .from('team_members')
      .insert(batch);
      
    if (error) {
      console.error(`Error inserting team member batch ${i}:`, error);
    }
  }
  
  console.log(`Assigned ${teamMembers.length} team members`);
  return teamMembers;
}

/**
 * Create additional tournaments
 */
async function createTournaments() {
  console.log(`Creating ${CONFIG.NUM_ADDITIONAL_TOURNAMENTS} additional tournaments...`);
  
  // Get available games
  const { data: games } = await supabase.from('games').select('*');
  if (!games || games.length === 0) {
    console.log('No games found, skipping tournament creation');
    return [];
  }
  
  const tournaments = [];
  const modes = ['16v16', '32v32', '64v64'];
  const bracketTypes = ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS'];
  
  for (let i = 0; i < CONFIG.NUM_ADDITIONAL_TOURNAMENTS; i++) {
    const game = faker.helpers.arrayElement(games);
    const mode = faker.helpers.arrayElement(modes);
    const maxPlayers = mode === '16v16' ? 512 : mode === '32v32' ? 1024 : 2048;
    
    const startDate = faker.date.future({ years: 0.25 }); // Within next 3 months
    const endDate = new Date(startDate.getTime() + (faker.number.int({ min: 2, max: 8 }) * 60 * 60 * 1000)); // 2-8 hours later
    
    const tournament = {
      id: `sim-tournament-${i.toString().padStart(3, '0')}`,
      title: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Championship`,
      game_id: game.code,
      mode,
      max_players: maxPlayers,
      start_date: startDate,
      end_date: endDate,
      region: faker.helpers.arrayElement(REGIONS),
      platform: faker.helpers.arrayElement(PLATFORMS),
      language: 'English',
      bracket_type: faker.helpers.arrayElement(bracketTypes),
      tournament_type: faker.helpers.arrayElement(['RANKED', 'CASUAL']),
      prize_pool: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
      entry_fee: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
      description: faker.lorem.paragraph(),
      rules: 'Standard tournament rules apply. Fair play and sportsmanship expected.',
      is_active: faker.datatype.boolean(0.8), // 80% active
      created_by: 'admin-001', // Default to admin
      created_at: faker.date.recent({ days: 10 }),
      updated_at: new Date()
    };
    
    tournaments.push(tournament);
  }
  
  const { error } = await supabase
    .from('tournaments')
    .insert(tournaments);
    
  if (error) {
    console.error('Error inserting tournaments:', error);
  } else {
    console.log(`Created ${tournaments.length} tournaments`);
  }
  
  return tournaments;
}

/**
 * Create tournament registrations
 */
async function createRegistrations(teams, tournaments) {
  console.log('Creating tournament registrations...');
  
  const registrations = [];
  let regCounter = 1000;
  
  for (const tournament of tournaments) {
    // Randomly select teams to register (30-70% of teams)
    const numRegistrations = faker.number.int({ 
      min: Math.floor(teams.length * 0.3), 
      max: Math.floor(teams.length * 0.7) 
    });
    
    const registeredTeams = faker.helpers.arrayElements(teams, numRegistrations);
    
    for (const team of registeredTeams) {
      registrations.push({
        id: `sim-reg-${regCounter++}`,
        tournament_id: tournament.id,
        team_id: team.id,
        user_id: team.captain_id,
        status: faker.helpers.weightedArrayElement([
          { weight: 80, value: 'CONFIRMED' },
          { weight: 15, value: 'PENDING' },
          { weight: 5, value: 'CANCELLED' }
        ]),
        registered_at: faker.date.between({ from: tournament.created_at, to: new Date() })
      });
    }
  }
  
  // Insert registrations
  const batchSize = 50;
  for (let i = 0; i < registrations.length; i += batchSize) {
    const batch = registrations.slice(i, i + batchSize);
    const { error } = await supabase
      .from('registrations')
      .insert(batch);
      
    if (error) {
      console.error(`Error inserting registration batch ${i}:`, error);
    }
  }
  
  console.log(`Created ${registrations.length} tournament registrations`);
  return registrations;
}

/**
 * Main simulation function
 */
async function simulateUsers() {
  try {
    console.log('🎮 Starting LevelGG user simulation...\n');
    
    // Create users
    const users = await createUsers();
    
    // Create teams
    const teams = await createTeams(users);
    
    // Assign team members
    if (teams.length > 0) {
      await assignTeamMembers(users, teams);
    }
    
    // Create tournaments
    const tournaments = await createTournaments();
    
    // Create registrations
    if (teams.length > 0 && tournaments.length > 0) {
      await createRegistrations(teams, tournaments);
    }
    
    // Update statistics
    console.log('\nUpdating database statistics...');
    
    // Update team member counts
    await supabase.rpc('update_team_member_counts');
    
    // Update tournament player counts
    await supabase.rpc('update_tournament_player_counts');
    
    console.log('\n🎉 User simulation completed successfully!');
    console.log('\nGenerated:');
    console.log(`  - ${users.length} user profiles`);
    console.log(`  - ${teams.length} teams`);
    console.log(`  - ${tournaments.length} tournaments`);
    console.log('\n✨ Your LevelGG platform now has realistic test data!');
    
  } catch (error) {
    console.error('❌ Error during simulation:', error);
    process.exit(1);
  }
}

// Run the simulation
if (require.main === module) {
  simulateUsers();
}

module.exports = {
  simulateUsers,
  generateUsername,
  generateTeamName
};