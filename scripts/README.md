# LevelGG Test Data Scripts

This directory contains scripts to populate your LevelGG database with realistic test data for development and demonstration purposes.

## 🎯 What This Does

The scripts create:
- **50+ realistic user profiles** with gaming-style usernames
- **Multiple teams** with military-style names and organization
- **Tournament registrations** and realistic competition scenarios  
- **Admin and team lead accounts** with proper role assignments
- **Statistical data** for testing admin dashboards

## 🚀 Quick Start

### 1. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

⚠️ **Important**: You need the **service role key** (not the anon key) to create users and bypass RLS policies.

### 2. Install Dependencies

```bash
cd scripts
npm install
```

### 3. Run the SQL Seed Script First

In your Supabase SQL Editor, run the contents of `populate-test-data.sql` to create the base test data.

### 4. Generate Additional Users

```bash
npm run populate
```

This will create 50+ additional users, teams, and tournament data.

## 📊 What Gets Created

### Test Accounts

**Admin Accounts:**
- Username: `SuperAdmin` (email: admin@levelgg.com)
- Username: `GameMaster` (email: gamemaster@levelgg.com)

**Team Lead Accounts:**
- Multiple team leads with usernames like `AlphaCommander`, `BravoLeader`, etc.

**Player Accounts:**
- 50+ players across all tiers (Bronze → Diamond)
- Gaming-style usernames like `Shadow_Hunter`, `Steel_Phoenix`, etc.

### Team Structure

**Example Teams:**
- Alpha Strike Force [ALPHA] - Elite tactical unit
- Bravo Battalion [BRAVO] - Defensive specialists  
- Charlie Company [CHAR] - Versatile squad
- Delta Force Elite [DELTA] - Special operations
- Echo Squadron [ECHO] - Air superiority focused

### Tournament Scenarios

- **Winter Championship 2025** - Large 32v32 tournament with $5,000 prize pool
- **Spring Showdown** - European double elimination tournament
- **Quick Strike Series** - Fast-paced Swiss system matches
- **NHL Pro League** - Hockey tournament for console players
- **Apex Legends Showdown** - High-stakes battle royale competition

## 🔧 Customization

Edit the configuration in `simulate-users.js`:

```javascript
const CONFIG = {
  NUM_USERS: 50,              // Number of users to create
  NUM_ADDITIONAL_TEAMS: 10,   // Number of teams to create
  NUM_ADDITIONAL_TOURNAMENTS: 5, // Number of tournaments
  ACTIVITY_DAYS: 7            // Days of historical activity
};
```

## 🧪 Testing Admin Features

After running the scripts, you can:

1. **Login as Admin**: Use the admin accounts to access `/admin/dashboard`
2. **View Statistics**: See realistic user counts, team stats, tournament data
3. **Test Team Leads**: Login as team leads to access team management features
4. **Tournament Management**: View and manage tournaments with real registration data

## 🎮 User Types Created

### Tier Distribution
- **Bronze (30%)**: New players, learning the game
- **Silver (30%)**: Casual players, some experience  
- **Gold (25%)**: Regular competitive players
- **Platinum (10%)**: Skilled competitive players
- **Diamond (5%)**: Elite players and professionals

### Role Distribution
- **85% Regular Players**: Standard tournament participants
- **15% Team Leads**: Can create and manage teams
- **2 Admin Accounts**: Full platform access

## 📝 Files Included

- `populate-test-data.sql` - Base SQL data (run this first)
- `simulate-users.js` - Main user generation script
- `package.json` - Dependencies and scripts
- `README.md` - This documentation

## 🛡️ Security Notes

- Test accounts use placeholder data and should not be used in production
- The service role key has full database access - keep it secure
- All generated users have realistic but fake email addresses
- Passwords are managed by Supabase Auth (OAuth only)

## 🎯 Next Steps

After populating test data:

1. **Deploy to Production**: Your platform is ready for real users
2. **Admin Training**: Use the test data to learn admin features
3. **Team Lead Onboarding**: Show team leads how to manage their squads
4. **Tournament Testing**: Run test tournaments with the generated teams

**Happy Gaming! 🎮🏆**