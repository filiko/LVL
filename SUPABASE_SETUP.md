# LevelGG 32v32 Tournament System - Supabase Integration

## 🚀 Overview

This document outlines the complete Supabase integration for the LevelGG 32v32 tournament system, providing a scalable, real-time tournament management platform for large-scale competitive gaming.

## 📋 Phase 1: Database & Auth Setup ✅

### Dependencies Installed
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
```

### Core Files Created

#### 1. **lib/supabase.ts** - Supabase Client Configuration
- Browser client for client-side operations
- Server client for server-side operations
- Legacy compatibility clients
- Proper cookie handling for SSR

#### 2. **lib/database.types.ts** - TypeScript Database Types
Complete type definitions for:
- **Profiles** - User profiles with Discord/Google OAuth
- **Games** - Game definitions (Battlefield, NHL)
- **Tournaments** - Tournament management
- **Teams** - Team structure and management
- **Team Members** - Player roster management
- **Registrations** - Tournament registration tracking
- **Matches** - Match scheduling and results
- **Player Stats** - Performance tracking

#### 3. **database/schema.sql** - Supabase Database Schema
Comprehensive SQL schema including:
- **Enums** for consistent data types
- **Tables** with proper relationships
- **Indexes** for performance optimization
- **Functions** for automated tasks
- **Triggers** for data consistency
- **Row Level Security (RLS)** policies
- **Views** for complex queries

### Key Schema Features

#### Player Tier System
```sql
CREATE TYPE player_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');
```

#### Tournament Modes
```sql
CREATE TYPE tournament_mode AS ENUM ('16v16', '32v32', '64v64');
```

#### Squad Organization
```sql
CREATE TYPE squad_name AS ENUM ('ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL');
```

#### Player Positions
```sql
CREATE TYPE player_position AS ENUM ('INFANTRY', 'ARMOR', 'HELI', 'JET', 'SUPPORT');
```

## 🔐 Phase 2: Authentication System ✅

### Files Created

#### 1. **lib/auth.ts** - Authentication Helpers
- Client-side auth functions
- Server-side auth functions
- OAuth integration (Discord, Google)
- Profile management
- Role-based permissions

#### 2. **middleware.ts** - Route Protection
- Authentication middleware
- Role-based access control
- Admin route protection
- Team lead route protection
- Automatic redirects

#### 3. **app/api/auth/callback/route.ts** - OAuth Callback
- OAuth code exchange
- Profile creation/updating
- Error handling
- Redirect management

#### 4. **app/(auth)/login/page.tsx** - Login Page
- Discord OAuth integration
- Google OAuth integration
- Error handling
- Responsive design
- Gaming-themed UI

#### 5. **components/auth/AuthButton.tsx** - Auth Component
- User avatar and info display
- Dropdown menu with profile actions
- Admin panel access
- Sign out functionality
- Loading states

## 🏗️ Phase 3: Tournament Management APIs ✅

### API Routes Created

#### 1. **app/api/tournaments/route.ts**
- `GET /api/tournaments` - List tournaments with filters
- `POST /api/tournaments` - Create new tournament
- Supports filtering by mode, region, platform
- Pagination support
- Team lead/admin permissions

#### 2. **app/api/tournaments/[id]/route.ts**
- `GET /api/tournaments/[id]` - Get tournament details
- `PUT /api/tournaments/[id]` - Update tournament
- `DELETE /api/tournaments/[id]` - Delete tournament
- Ownership and admin checks
- Includes registration data

#### 3. **app/api/tournaments/[id]/register/route.ts**
- `POST` - Register team for tournament
- `DELETE` - Withdraw team registration
- Team size validation
- Capacity checking
- Captain permission verification

#### 4. **app/api/teams/route.ts**
- `GET /api/teams` - List teams with filters
- `POST /api/teams` - Create new team
- Unique join code generation
- Team lead permissions
- Member relationship management

## 🎮 Phase 4: Frontend Integration ✅

### Updated Pages

#### 1. **app/battlefield/32v32/page.tsx**
- Integrated with Supabase instead of Django
- Real-time tournament listings
- Team management interface
- Proper type safety with TypeScript
- Error handling and loading states

### Key Features Implemented

#### Tournament Listing
- Filter by mode, region, platform
- Real-time registration counts
- Tournament status indicators
- Click-through to detailed views

#### Team Management
- Team creation for team leads
- Member roster display
- Recruitment status
- Tier-based filtering

#### Authentication Flow
- OAuth with Discord and Google
- Profile management
- Role-based permissions
- Secure route protection

## 🔧 Environment Configuration

### Required Environment Variables
Create `.env.local` based on `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OAuth Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🚀 Deployment Steps

### 1. Supabase Setup
1. Create new Supabase project
2. Run `database/schema.sql` in SQL editor
3. Configure OAuth providers in Authentication settings
4. Set up environment variables

### 2. OAuth Configuration

#### Discord OAuth
1. Create Discord application at https://discord.com/developers/applications
2. Add OAuth2 redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret to environment variables

#### Google OAuth
1. Create Google Cloud project
2. Enable Google+ API
3. Create OAuth2 credentials
4. Add authorized redirect URI
5. Copy Client ID and Secret

### 3. Database Migration
If migrating from Django:
1. Export existing data
2. Transform to match Supabase schema
3. Import using Supabase dashboard or SQL
4. Update user references to use UUID format

## 📊 Key Features

### 32v32 Tournament System
- **Large Scale**: Support for up to 1,024 players (32 teams × 32 players)
- **Squad Structure**: Military-style squad organization (Alpha, Bravo, Charlie, etc.)
- **Role Management**: Infantry, Armor, Helicopter, Jet specializations
- **Real-time Updates**: Live registration counts and tournament status
- **Bracket Generation**: Single/Double Elimination, Round Robin, Swiss formats

### Team Management
- **Captain System**: Team leaders with roster management powers
- **Join Codes**: Secure team joining with unique 6-character codes
- **Member Roles**: Captain, Co-Leader, Member hierarchy
- **Position Assignment**: Squad-based position management
- **Recruitment Status**: Open/closed recruitment tracking

### User Management
- **OAuth Integration**: Discord and Google sign-in
- **Tier System**: Bronze to Diamond player ranking
- **Profile Management**: Comprehensive user profiles
- **Role-based Access**: Player, Team Lead, Admin permissions
- **Activity Tracking**: Online status and last activity

## 🔐 Security Features

### Row Level Security (RLS)
- **User Data Protection**: Users can only access their own sensitive data
- **Team-based Access**: Team members can view team information
- **Admin Override**: Admins have elevated access for management
- **Tournament Permissions**: Only creators and admins can modify tournaments

### Authentication Security
- **OAuth-only**: No password storage, relies on trusted providers
- **JWT Tokens**: Secure session management
- **Automatic Expiry**: Token refresh handling
- **CSRF Protection**: Built-in request validation

## 🚦 Next Steps

### Remaining Implementation Tasks

#### Phase 5: Advanced Features
- [ ] Real-time notifications
- [ ] Tournament brackets visualization
- [ ] Player statistics tracking
- [ ] Match scheduling system
- [ ] Discord bot integration

#### Phase 6: Admin Tools
- [ ] Advanced tournament management
- [ ] Player moderation tools
- [ ] Analytics dashboard
- [ ] Automated tournament scheduling

#### Phase 7: Mobile & Performance
- [ ] Mobile-responsive design improvements
- [ ] Performance optimization
- [ ] Offline functionality
- [ ] Push notifications

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Database migrations (via Supabase CLI)
supabase db push
```

## 📝 API Documentation

### Tournament Endpoints
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/[id]` - Get tournament details
- `PUT /api/tournaments/[id]` - Update tournament
- `DELETE /api/tournaments/[id]` - Delete tournament
- `POST /api/tournaments/[id]/register` - Register team
- `DELETE /api/tournaments/[id]/register` - Withdraw registration

### Team Endpoints
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/[id]` - Get team details
- `PUT /api/teams/[id]` - Update team
- `POST /api/teams/[id]/join` - Join team with code
- `DELETE /api/teams/[id]/leave` - Leave team

## 🎯 Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried fields
- **Views**: Pre-computed complex queries for better performance
- **Triggers**: Automated count updates for consistency
- **Partitioning**: Future consideration for match data

### Frontend Optimization
- **Code Splitting**: Lazy loading of tournament components
- **Caching**: Strategic use of React Query for data caching
- **Optimistic Updates**: Immediate UI feedback with rollback capability
- **Image Optimization**: Next.js image optimization for avatars and logos

This comprehensive system provides a solid foundation for the LevelGG 32v32 tournament platform with room for future expansion and feature additions.