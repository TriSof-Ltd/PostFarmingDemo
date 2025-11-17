# Post Farming - Social Media Management Platform

## Overview

Post Farming is a comprehensive social media management dashboard that enables users to schedule content, manage interactions, and monitor analytics across Instagram, Facebook, and TikTok platforms. The application provides a unified interface for handling multiple client accounts with features including a calendar-based content scheduler, unified inbox for cross-platform engagement, connection management, security monitoring, and detailed analytics reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management and data fetching

**UI Component System**
- **shadcn/ui** component library with Radix UI primitives providing accessible, unstyled base components
- **Tailwind CSS** for utility-first styling with custom design tokens defined in CSS variables
- **Design system** following "new-york" style from shadcn/ui with neutral base colors
- Custom design guidelines emphasizing modern SaaS dashboard aesthetics inspired by Hootsuite and Buffer

**State Management**
- **Context API (AppContext)** for global application state including clients, posts, comments, and analytics
- **localStorage** for persistent client-side data storage with JSON serialization
- State includes: client management, social media posts, unified inbox comments, security events, and analytics data

**Key UI Patterns**
- Sidebar navigation with collapsible mobile sheet
- Client switcher dropdown in header for multi-tenant management
- Modal-based workflows for creating posts and managing clients
- Empty states with call-to-action buttons
- Responsive grid layouts with mobile-first breakpoints

### Backend Architecture

**Server Framework**
- **Express.js** server with TypeScript
- **HTTP server** created via Node's native `http` module
- Development mode uses Vite middleware integration for HMR (Hot Module Replacement)
- Production build uses esbuild to bundle server code into ESM format

**API Design**
- RESTful API routes prefixed with `/api`
- Routes registered through centralized `registerRoutes` function
- Request/response logging middleware for API endpoints
- JSON body parsing with raw body preservation for webhook verification

**Data Layer**
- **Storage abstraction layer** (`IStorage` interface) allowing swappable implementations
- **MemStorage** in-memory implementation for development/prototyping
- **Drizzle ORM** configured for PostgreSQL (schema defined but not yet integrated)
- Storage interface supports CRUD operations for users and can be extended for posts, clients, comments

**Session Management**
- Configured for `connect-pg-simple` session store (PostgreSQL-based sessions)
- Cookie-based session handling with Express middleware

### Data Storage Solutions

**Current Implementation**
- **Client-side localStorage** stores complete application state (clients, posts, comments, security events, analytics)
- Mock data generator provides realistic sample data for development
- Date objects serialized/deserialized for localStorage persistence

**Database Schema (Prepared)**
- **Drizzle ORM** with PostgreSQL dialect
- Migrations output to `/migrations` directory
- Schema defines `users` table with UUID primary keys
- Zod schema validation integrated via `drizzle-zod`
- Neon serverless PostgreSQL connection configured via `DATABASE_URL` environment variable

**Database Transition Path**
The application is architected to migrate from localStorage to PostgreSQL database by:
1. Implementing database-backed storage class that implements `IStorage` interface
2. Adding Drizzle schema tables for clients, posts, comments, security events
3. Swapping MemStorage for database implementation in `server/storage.ts`
4. Moving client-side state fetching to API calls with React Query

### Authentication and Authorization

**Current State**
- User schema defined in `shared/schema.ts` with username/password fields
- No active authentication flow implemented yet
- Session middleware configured but not utilized

**Planned Implementation**
- Username/password authentication
- Session-based authentication using PostgreSQL session store
- User-to-client relationship for multi-tenant access control
- Protected API routes requiring authenticated sessions

### External Dependencies

**UI & Styling**
- **@radix-ui/react-*** - Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, popover, etc.)
- **class-variance-authority** - Type-safe variant management for component styling
- **tailwindcss** & **autoprefixer** - Utility-first CSS framework with PostCSS processing
- **lucide-react** - Icon library
- **react-icons** - Additional icons including social media platform logos (SiFacebook, SiInstagram, SiTiktok)

**Data Visualization**
- **recharts** - Composable chart library for analytics visualizations (bar charts, line charts)

**Forms & Validation**
- **react-hook-form** - Performant form state management
- **@hookform/resolvers** - Resolver integration for validation libraries
- **zod** - TypeScript-first schema validation

**Date Handling**
- **date-fns** - Modern date utility library for formatting, manipulation, and calculations
- **react-day-picker** - Calendar/date picker component

**Developer Tools**
- **@replit/vite-plugin-*** - Replit-specific development plugins (runtime error overlay, cartographer, dev banner)
- **esbuild** - Fast JavaScript bundler for production builds
- **tsx** - TypeScript execution for development server

**Database & ORM**
- **drizzle-orm** - Lightweight TypeScript ORM
- **drizzle-kit** - Migration and schema management CLI
- **@neondatabase/serverless** - Neon PostgreSQL serverless driver
- **drizzle-zod** - Integration layer for Zod validation with Drizzle schemas

**Carousel**
- **embla-carousel-react** - Lightweight carousel library

**Command Menu**
- **cmdk** - Command palette component (cmd+k style interface)

**Utilities**
- **clsx** & **tailwind-merge** - Conditional class name utilities
- **nanoid** - Compact unique ID generator