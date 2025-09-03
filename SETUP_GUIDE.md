# LevelGG Setup Guide

This guide will help you set up the LevelGG tournament platform with Supabase integration.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- Git

## 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd LevelGG
npm install
```

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings > API to find your project URL and anon key

### Set up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `database/schema.sql` and run it
3. This will create all necessary tables, functions, triggers, and RLS policies

### Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your Site URL: `http://localhost:3000` (for development)
3. Add redirect URLs: `http://localhost:3000/api/auth/callback`

#### Optional: Social Authentication

**Discord OAuth:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. In OAuth2 > General, add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

## 3. Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. (Optional) Add OAuth credentials if you set them up:
   ```env
   DISCORD_CLIENT_ID=your-discord-client-id
   DISCORD_CLIENT_SECRET=your-discord-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## 4. Database Population (Optional)

To populate your database with sample data for testing:

1. Go to your Supabase SQL Editor
2. Run the following queries to create sample games:

```sql
INSERT INTO games (name, code, description, is_active) VALUES
('Battlefield 2042', 'BF2042', 'Large-scale multiplayer warfare', true),
('NHL 24', 'NHL24', 'Professional ice hockey simulation', true);
```

3. Create an admin user:
   - Sign up through your app
   - In Supabase, go to Authentication > Users
   - Find your user and copy their ID
   - In SQL Editor, run:
   ```sql
   UPDATE profiles SET is_admin = true, is_team_lead = true WHERE id = 'your-user-id-here';
   ```

## 5. Run the Application

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

## 6. Key Features Available

### ✅ Implemented Features

- **Authentication System**
  - Discord/Google OAuth login
  - User profiles with tier system
  - Role-based access control (Admin, Team Lead, Member)

- **Tournament Management**
  - Create, view, and manage tournaments
  - Multiple game modes (16v16, 32v32, 64v64)
  - Tournament registration system
  - Real-time player counts

- **Team System**
  - Create and join teams
  - Team roster management
  - Military-style squad organization (Alpha, Bravo, Charlie, etc.)
  - Role assignments (Infantry, Armor, Heli, Jet, Support)
  - Join code system for easy team joining

- **Draft System**
  - Auto-assignment algorithms
  - Manual player assignment
  - Tier-based balancing
  - Position-specific assignments

- **API Endpoints**
  - Full CRUD operations for tournaments and teams
  - Member management
  - Registration handling
  - Draft management

### 🚧 Additional Features You Can Add

- **Real-time Chat**: Implement Discord-style chat for teams
- **Statistics Tracking**: Player performance metrics
- **Bracket Generation**: Automatic tournament brackets
- **Match Scheduling**: Calendar integration for matches
- **Live Streaming Integration**: OBS/Twitch integration
- **Mobile App**: React Native version

## 7. Project Structure

```
LevelGG/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── battlefield/       # Main game pages
│   ├── admin/             # Admin panel
│   └── (auth)/            # Authentication pages
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── database/          # Database helpers
│   └── algorithms/        # Team assignment logic
├── database/              # SQL schema files
└── types/                 # TypeScript definitions
```

## 8. Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Update Supabase auth settings with production URLs

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
# ... other variables
```

## 9. Troubleshooting

### Common Issues

1. **"Failed to fetch tournaments"**
   - Check your Supabase URL and anon key
   - Ensure RLS policies are set up correctly

2. **"Authentication required" errors**
   - Verify your auth callback URL is correct
   - Check if user is properly logged in

3. **Database connection issues**
   - Ensure your Supabase project is active
   - Check if database schema was applied correctly

### Getting Help

- Check the browser console for detailed error messages
- Review Supabase logs in your dashboard
- Ensure all environment variables are set correctly

## 10. Next Steps

Once you have the basic setup running:

1. **Customize the UI**: Modify components to match your branding
2. **Add More Games**: Extend the system to support other games
3. **Implement Statistics**: Add player performance tracking
4. **Create Mobile App**: Use React Native for mobile version
5. **Add Real-time Features**: Implement live match updates

## Support

If you encounter any issues, please check:
- Browser console for client-side errors
- Supabase dashboard logs for server-side issues
- Network tab to see failing API requests

---

**Happy Gaming! 🎮**