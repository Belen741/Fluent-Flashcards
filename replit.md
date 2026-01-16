# Spanish for Nurses - Flashcard Learning App

## Overview

This is a medical Spanish vocabulary learning application designed for nurses. It uses a flashcard-based approach with an invisible spaced repetition system that dynamically adjusts card presentation based on user performance. The app presents vocabulary in multiple variant formats (intro, cloze, and multiple choice) to reinforce learning through varied exposure.

The core learning mechanic shows flashcards organized by medical concepts, with each concept having three presentation variants. When users struggle with a concept, the system silently reinserts alternative variants to reinforce learning without exposing the underlying algorithm to the user.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing (3 main pages: Home, Study, Complete)
- **State Management**: TanStack React Query for server state, React useState for local component state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for page transitions and card animations
- **Fonts**: Nunito (body text) and DM Sans (headings)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES Modules
- **API Pattern**: Simple REST endpoints defined in `shared/routes.ts`
- **Build System**: Custom build script using esbuild for server and Vite for client

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Client Storage**: localStorage for learning state and session history (not synced to server)

### Key Design Decisions

**Shared Schema Pattern**: The database schema lives in `shared/` to enable type-safe API contracts between frontend and backend without code duplication.

**Invisible Spaced Repetition**: Learning state is tracked client-side in localStorage rather than the database. This keeps the UI simple while enabling adaptive card ordering based on user performance.

**Concept-Variant Model**: Each vocabulary concept has three variant types (intro, cloze, mcq) stored as separate flashcard records linked by `conceptId`. This enables camouflaged repetition where struggling users see different presentations of the same concept.

**Session Queue Algorithm**: Located in `client/src/utils/sessionQueue.ts`, builds a dynamic queue that interleaves concepts and reinjects variants when users mark "No lo supe" (didn't know it).

### Recent UX Improvements (Jan 2026)

**Spanish UI Text**: All user-facing text is in Spanish for the target nurse audience.

**Response System**: Users mark "Lo supe" (I knew it) or "No lo supe" (I didn't know it) to track progress. When marking "No lo supe", a variant card is silently inserted 2-3 steps ahead for reinforcement.

**Micro-Feedback**: Brief encouraging messages appear after responses ("Muy bien." for correct, "Sigue adelante." for incorrect).

**Keyboard Shortcuts**: Press 1 for "Lo supe", 2 for "No lo supe", Enter to proceed.

**Session Flow**: Home shows dynamic card count and time estimate. Study page has minimal progress bar and status messaging. Completion page offers "Repetir sesión" option.

### CDN Preparation (Jan 2026)

**Media Resolver Pattern**: All image and audio URLs are resolved through `client/src/utils/mediaResolver.ts`. Components never access URLs directly.

**New Schema Fields** (nullable, for future use):
- `deckId`: Groups cards by deck
- `tags`: Array of category tags
- `imageKey`: Logical path for CDN (e.g., "mazo_01/images/001.webp")
- `audioKey`: Logical path for CDN (e.g., "mazo_01/audio/001.mp3")

**Future CDN Switch**: When ready to use Cloudflare R2, only `mediaResolver.ts` needs modification. No component changes required.

## External Dependencies

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- Drizzle Kit for schema migrations (`npm run db:push`)

### Key Runtime Dependencies
- `drizzle-orm` / `drizzle-zod` - Database ORM and validation
- `express` - HTTP server
- `@tanstack/react-query` - Data fetching and caching
- `framer-motion` - Animations
- `canvas-confetti` - Celebration effects on session completion

### UI Component Library
- shadcn/ui components built on Radix UI primitives
- Full component set in `client/src/components/ui/`
- Configured via `components.json` with path aliases

### Development Tools
- Replit-specific Vite plugins for development experience
- `tsx` for running TypeScript directly in development