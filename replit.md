# SBT Philippines KPI Dashboard

## Overview

This is a KPI (Key Performance Indicator) dashboard application for tracking sales team performance metrics. The system allows users to enter daily performance data, view analytics through charts and visualizations, monitor team progress against targets, and receive alerts for underperforming teams. The application is built as a full-stack TypeScript solution with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with custom theme configuration using CSS variables
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Charts**: Recharts for data visualization (bar charts, line charts, pie charts)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **PDF Export**: jsPDF with html2canvas for report generation

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints defined in shared route definitions with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Build System**: 
  - Development: Vite dev server with HMR proxied through Express
  - Production: esbuild for server bundling, Vite for client build

### Data Layer
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Management**: Drizzle Kit for migrations (`db:push` command)
- **Schema Location**: `shared/schema.ts` contains table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and TypeScript types
- `routes.ts`: API route definitions with input/output Zod schemas

### Key Design Decisions

1. **Type-Safe API Layer**: Route definitions in `shared/routes.ts` include Zod schemas for both request inputs and response outputs, enabling end-to-end type safety.

2. **Colocated Validation**: Form validation schemas derive from database schemas using drizzle-zod, ensuring consistency between client and server validation.

3. **Component-Based UI**: Uses shadcn/ui pattern where UI components are copied into the project (`client/src/components/ui/`) rather than installed as a package, allowing full customization.

4. **CSS Variables for Theming**: All colors defined as CSS custom properties in HSL format, enabling easy theme switching and consistent color usage.

## External Dependencies

### Database
- **PostgreSQL**: Required database, connection string provided via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL (available but not currently used)

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **recharts**: Chart components
- **framer-motion**: Animation library
- **date-fns**: Date formatting utilities
- **jspdf + html2canvas**: PDF report generation
- **Radix UI**: Headless UI component primitives (accordion, dialog, dropdown, etc.)

### Build Tools
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server-side bundling for production
- **Drizzle Kit**: Database schema management

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Development tooling (dev only)
- **@replit/vite-plugin-dev-banner**: Development banner (dev only)