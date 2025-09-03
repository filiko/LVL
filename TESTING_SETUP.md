# 🎮 LevelGG Testing Setup Guide

## 🚀 Quick Start - Get Test Data in 5 Minutes!

This guide helps you populate your LevelGG database with realistic test data so you can see the admin dashboard and team lead features in action.

### Step 1: Database Setup ✅
**Run the base SQL script first:**

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `scripts/populate-test-data.sql`
4. Click "Run"

This creates:
- 2 Admin accounts (SuperAdmin, GameMaster)
- 5 Team Lead accounts 
- 20+ Player accounts across all tiers
- 5 Teams with realistic military names
- 5 Tournaments with registrations
- Sample match results and statistics

### Step 2: Generate More Users 🎯
**Create 50+ additional realistic users:**

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
npm install

# Set environment variables (create .env.local in project root)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Generate additional test data
npm run populate
```

### Step 3: Test Accounts 👤

**Admin Access** (Full platform control):
- Email: `admin@levelgg.com`
- Email: `gamemaster@levelgg.com`

**Team Lead Access** (Team management):
- Email: `alpha@example.com` (AlphaCommander)
- Email: `bravo@example.com` (BravoLeader) 
- Email: `charlie@example.com` (CharlieChief)

**Player Access** (Standard users):
- Various emails like `diamond1@example.com`, `gold1@example.com`, etc.

> **Note**: These are test accounts created directly in the database. In production, users sign up via OAuth.

### Step 4: Access Dashboards 📊

**Admin Dashboard:**
1. Login with admin account
2. Navigate to `/admin/dashboard`
3. See platform statistics, user management, tournament controls

**Team Lead Dashboard:**
1. Login with team lead account  
2. Navigate to `/team-lead/dashboard`
3. See team management, tournament registrations, member controls

## 🔧 What You'll See

### Admin Dashboard Features:
- **Live Statistics**: User counts, tournament stats, revenue tracking
- **User Management**: Ban/unban users, promote to team leads
- **Tournament Control**: Activate/deactivate tournaments, view registrations
- **Recent Activity Feed**: Real-time platform activity
- **Quick Actions**: Create tournaments, manage users

### Team Lead Dashboard Features:
- **My Teams Overview**: Teams you captain/co-lead with member counts
- **Tournament Registrations**: Your teams' tournament participation
- **Team Management**: Direct links to manage rosters and recruitment
- **Quick Actions**: Create teams, browse tournaments

### Test Data Highlights:
- **Realistic Usernames**: `Shadow_Hunter`, `Steel_Phoenix`, `Alpha_Strike`
- **Military Team Names**: `Alpha Strike Force`, `Delta Force Elite`
- **Tournament Variety**: Different modes (16v16, 32v32, 64v64)
- **Tier Distribution**: Balanced across Bronze → Diamond
- **Active Registrations**: Teams registered for multiple tournaments

## 🎯 Role-Based Access Testing

### Admin Features (is_admin = true):
✅ Access `/admin/dashboard`  
✅ User management (ban/promote)  
✅ Tournament management (activate/delete)  
✅ Platform statistics  
✅ Also has team lead access  

### Team Lead Features (is_team_lead = true):
✅ Access `/team-lead/dashboard`  
✅ Create and manage teams  
✅ Register teams for tournaments  
✅ Manage team rosters and recruitment  

### Player Features (standard users):
✅ Join teams with join codes  
✅ View tournaments and team listings  
✅ Participate in tournaments  
❌ Cannot create teams or access admin features  

## 🛡️ Security Implementation

The system properly checks database flags for access control:

```typescript
// Admin check
const isAdmin = profile?.is_admin === true

// Team lead check  
const isTeamLead = profile?.is_team_lead === true || profile?.is_admin === true

// Database queries respect Row Level Security (RLS) policies
```

## 🎮 Ready to Test!

After running the scripts, your LevelGG platform will have:

- **75+ User Accounts** with realistic gaming data
- **15+ Teams** with military organization  
- **10+ Tournaments** with active registrations
- **Admin Controls** for platform management
- **Team Lead Tools** for squad leadership
- **Real-time Features** ready for testing

**Your competitive gaming platform is now ready for action! 🏆**

---

## 🔄 Reset Data (if needed)

To start fresh, simply run the SQL script again - it uses `ON CONFLICT DO NOTHING` to avoid duplicates.

## 📞 Need Help?

Check the full documentation in `scripts/README.md` for advanced configuration options and troubleshooting.