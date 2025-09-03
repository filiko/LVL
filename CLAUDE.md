# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Frontend (Next.js)**
- `npm run dev` - Start development server on port 3000
- `npm run build` - Create production build
- `npm run lint` - Run ESLint checks
- `npm run start` - Start production server

**Backend (Django)**
- `cd backend && python manage.py runserver` - Start Django dev server on port 8000
- `cd backend && python manage.py migrate` - Apply database migrations
- `cd backend && python populate_db.py` - Populate database with test data

## Architecture Overview

LevelGG is a competitive gaming tournament platform built as a full-stack application:

**Frontend**: Next.js 14 with TypeScript, Material-UI, Tailwind CSS
- Uses App Router structure under `/app` directory
- Authentication via JWT tokens stored in localStorage
- Real-time polling for live data updates
- Gaming-focused UI with custom fonts and styling

**Backend**: Django 5.2.3 with Django REST Framework
- RESTful API using ViewSets and serializers
- Custom Player model extending AbstractUser
- Social authentication (Discord, Twitch, Facebook)
- PostgreSQL database configured via environment variables

## Core Data Models

The application centers around competitive gaming tournaments:

- **Player**: Extended user model with gaming stats, tier system (Bronze-Diamond), social auth
- **Team**: Hierarchical team structure with join codes, leadership roles, squad organization
- **Tournament**: Multi-game tournament system supporting various bracket formats
- **Squad**: Military-style squad organization (Alpha, Bravo, Charlie) with role assignments (Infantry, Armor, Heli, Jet)
- **Match**: Tournament match tracking with scheduling and score management

## Key Architectural Patterns

**Authentication Flow**
- JWT tokens with Bearer header authentication
- Social login integration through django-allauth
- Token persistence in localStorage with automatic refresh

**API Communication**
- Axios-based HTTP client with centralized configuration
- CORS enabled for localhost:3000 ↔ localhost:8000 communication
- RESTful endpoints following Django REST Framework conventions

**State Management**
- Local React state with hooks
- localStorage/sessionStorage for client-side persistence
- Real-time polling patterns for live tournament data

## Multi-Game Tournament System

The platform supports multiple games (currently Battlefield and NHL) with:
- Flexible tournament formats (Single/Double Elimination, Swiss, Round Robin)
- Variable team sizes (16v16, 32v32, 64v64)
- Squad-based team organization with military naming conventions
- Role-specific assignments for tactical gameplay

## Environment Requirements

Development requires PostgreSQL connection and these environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `BACKEND_URL`, `CLIENT_URL` - Service endpoint configuration
- Social auth credentials for Discord and Google integration:
  - `DISCORD_CLIENT_ID`, `DISCORD_SECRET_KEY`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`