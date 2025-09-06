# 🗄️ Database Setup Guide

## Current Situation

Your project has **TWO database systems**:

1. **Django Backend** (PostgreSQL) - `backend/` directory
2. **Supabase** (PostgreSQL) - Frontend Next.js app

## 🎯 **Option 1: Use Supabase (Recommended)**

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to **Settings > API** to find your credentials

### Step 2: Set Up Environment Variables
Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql` and run it
3. This creates all tables, functions, and security policies

### Step 4: Test the Connection
```bash
npm run dev
```

## 🎯 **Option 2: Use Django Backend**

### Step 1: Set Up Django Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Set Up Database
```bash
# Create .env file in backend/ directory
DATABASE_URL=postgresql://username:password@localhost:5432/levelgg_db

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Step 3: Populate Test Data
```bash
python manage.py shell < populate_db.py
```

## 🔍 **Check What's Currently Working**

### Check Supabase Connection:
```bash
# This will show if Supabase is connected
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://YOUR_PROJECT.supabase.co/rest/v1/tournaments"
```

### Check Django Backend:
```bash
cd backend
python manage.py shell
>>> from tournaments.models import *
>>> print("Users:", Player.objects.count())
>>> print("Teams:", Team.objects.count())
>>> print("Tournaments:", Tournament.objects.count())
```

## 🚀 **Quick Start (Supabase)**

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Copy your credentials** from Settings > API
3. **Create `.env.local`** with your credentials
4. **Run the schema** from `database/schema.sql` in Supabase SQL Editor
5. **Start the app**: `npm run dev`
6. **Test tournament creation** at `http://localhost:3000/battlefield/tournaments/create`

## 🧪 **Test Your Setup**

Once you have a database connected, you can:

```bash
# View test data
npm run test:data:summary

# Seed test data
npm run test:data:seed

# Open database inspector
npm run test:data:viewer
```

## ❓ **Which Should You Choose?**

- **Choose Supabase** if you want the modern, real-time tournament system
- **Choose Django** if you want to keep the existing backend structure

The tournament creator system I built works with **Supabase**, so that's the recommended path.
