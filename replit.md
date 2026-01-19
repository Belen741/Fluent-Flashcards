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

**5-Level Progression System**: Each concept has a level (0-4) tracked in localStorage via `client/src/utils/userProgress.ts`. No login required.

**Level Progression**:
- **Level 0 (Learn)**: Standard intro card - flip to reveal translation
- **Level 1 (Recognize)**: Cloze card - pick the correct Spanish phrase from options
- **Level 2 (Recall)**: MCQ card - pick correct English word to complete Spanish sentence
- **Level 3 (Produce)**: Word Reorder card - tap words in correct order to form the phrase
- **Level 4 (Mastered)**: Review card - appears every 20 sessions with "I know"/"I don't know" buttons

**Simple Progression Rules**:
- Correct answer = level up (max 4)
- Incorrect answer = level down (min 0)
- On incorrect: a downgraded variant card is inserted 2-5 positions ahead for reinforcement

**Session Queue Algorithm**: Located in `client/src/utils/sessionQueue.ts`:
- **New concepts per session**: 5 (configurable via `NEW_CONCEPTS_PER_SESSION`)
- **Max interactions per session**: 18 (configurable via `MAX_INTERACTIONS_PER_SESSION`)
- **Mastered review interval**: 20 sessions (configurable via `MASTERED_REVIEW_INTERVAL`)
- Prioritizes in-progress concepts (levels 1-3), then new concepts (level 0)
- Up to 2 mastered concepts (level 4) due for review included per session
- Sessions feel short, achievable, and friendly (~2-3 minutes)

### Recent UX Improvements (Jan 2026)

**English UI Text**: All user-facing text is in English (teaching Spanish to English-speaking nurses).

**Five Card Surface Types**:
- **Standard Card (Level 0)**: Shows Spanish phrase with "Show translation" button; flip to reveal English translation
- **Quick Fill (Level 1)**: Shows image + "Which phrase matches?" with 4 Spanish options to choose from
- **Quick Pick (Level 2)**: Shows image + Spanish question with blanks, user picks correct English word from 3 options
- **Word Reorder (Level 3)**: Shows shuffled words as tappable buttons; user taps words in correct order to form the Spanish phrase
- **Review Card (Level 4)**: Shows Spanish phrase with translation; user marks "I know" or "I don't know" for mastered concept review

**Response System**: 
- Standard cards: Users mark "I knew it" or "I didn't know" to track progress
- Interactive cards (cloze/mcq): Auto-submit on option selection; Next button appears after answering
- When marking "I didn't know" or getting interactive cards wrong, a variant card is silently inserted 2-5 steps ahead for reinforcement
- Quick Fill cards show audio button; Quick Pick cards do not show audio button

**Micro-Feedback**: Brief encouraging messages appear after responses ("Great job!" for correct, "Keep going!" for incorrect).

**Keyboard Shortcuts**: Press 1 for "I knew it", 2 for "I didn't know", Enter to proceed.

**Session Flow**: Home shows dynamic card count and time estimate. Study page has minimal progress bar and status messaging. Completion page offers "Start another session" option. Multiple sessions per day supported with session tracking.

### CDN Preparation (Jan 2026)

**Media Resolver Pattern**: All image and audio URLs are resolved through `client/src/utils/mediaResolver.ts`. Components never access URLs directly.

**New Schema Fields** (nullable, for future use):
- `deckId`: Groups cards by deck
- `tags`: Array of category tags
- `imageKey`: Logical path for CDN (e.g., "mazo_01/images/001.webp")
- `audioKey`: Logical path for CDN (e.g., "mazo_01/audio/001.mp3")

**CDN Active**: Cloudflare R2 is now connected via `mediaResolver.ts`. Cards with `imageKey`/`audioKey` load from `https://pub-1fbc99701cda4b24becbb4123415045d.r2.dev/`. Cards without keys fall back to `imageUrl`/`audioUrl` or placeholder.

### Flashcard Import System

**Excel Import**: Place `.xlsx` files in `client/src/data/raw/` and run:
```bash
npx tsx scripts/import-flashcards.ts
```

**Excel Format** (columns): deck, card_id, es, en, audio_file, image_file, cloze_option_1-4, cloze_correct, mcq_question_es, mcq_option_en_1-3, mcq_correct_en, tag_1, tag_2

**Generated Output**: `client/src/data/flashcards.ts` with 3 variants per concept (intro, cloze, mcq)

**To update database**: After regenerating flashcards.ts, delete existing cards and restart the app to re-seed.

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