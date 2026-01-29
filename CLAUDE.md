# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tingxie** is a mobile-first Chinese vocabulary learning application for Primary 2 Higher Chinese Level (P2HCL) students in Singapore. The application is a React SPA built with Vite, TanStack Router, TanStack Query, and Tailwind CSS.

The app provides:
1. **听写练习 (Tingxie)** - Spelling practice with audio-based word revelation
2. **词汇浏览 (Vocabulary)** - Full vocabulary browser
3. **复习模式 (Review)** - Review unknown words
4. **笔画练习 (Handwriting)** - Stroke order practice with HanziWriter

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| TanStack Router | File-based routing |
| TanStack Query | Data fetching & caching |
| TanStack Store | Client state management |
| Tailwind CSS v4 | Styling |
| Cloudflare Workers | API & hosting |
| Cloudflare KV | Progress storage |

## Development Commands

```bash
npm run dev          # Start dev server on port 3001
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run deploy       # Build and deploy to Cloudflare
```

## Project Structure

```
tingxie/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── index.css                   # Tailwind + custom CSS
│   ├── routeTree.gen.ts            # Auto-generated route tree
│   ├── components/
│   │   ├── ui/                     # Shadcn-style UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── separator.tsx
│   │   ├── layout/
│   │   │   ├── MainNav.tsx         # Hamburger menu navigation
│   │   │   └── PageContainer.tsx   # Layout wrapper
│   │   ├── word/
│   │   │   ├── WordCard.tsx        # Main practice card
│   │   │   ├── WordRevealItem.tsx  # Clickable reveal items
│   │   │   └── SelfAssessButtons.tsx
│   │   ├── audio/
│   │   │   └── AudioButton.tsx
│   │   └── pages/
│   │       └── LatestWordsPage.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts       # Audio playback hook
│   │   ├── useScrollHide.ts        # Navbar hide on scroll
│   │   └── useMobileViewport.ts    # Viewport height fix
│   ├── routes/                     # TanStack Router file-based routes
│   │   ├── __root.tsx              # Root layout
│   │   ├── index.tsx               # / (Latest words)
│   │   ├── review.tsx              # /review
│   │   ├── vocabulary.tsx          # /vocabulary
│   │   └── ... (14 routes total)
│   ├── stores/
│   │   ├── uiStore.ts              # UI state (menu, filters, word index)
│   │   └── settingsStore.ts        # User preferences (persisted)
│   ├── queries/
│   │   ├── vocabularyQueries.ts    # Vocabulary data fetching
│   │   └── progressQueries.ts      # Cloud progress sync
│   ├── types/
│   │   ├── vocabulary.ts           # Word, VocabularyData types
│   │   └── progress.ts             # Progress types
│   └── lib/
│       ├── constants.ts            # App configuration
│       └── utils.ts                # cn() utility
├── public/                         # Static assets (copied to dist)
│   ├── audio/                      # MP3 pronunciation files
│   └── data/                       # Vocabulary JSON data
├── index.html                      # Vite entry HTML
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── wrangler.toml                   # Cloudflare Worker config
└── src/index.js                    # Cloudflare Worker entry
```

## Key Architecture Patterns

### TanStack Router (File-based Routing)

Routes are defined in `src/routes/`. The router plugin auto-generates `routeTree.gen.ts`.

```typescript
// src/routes/review.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/review')({
  component: ReviewPage,
})
```

### TanStack Query (Data Fetching)

```typescript
// Fetch vocabulary with caching
const { data, isLoading } = useQuery(vocabularyQueryOptions)

// Save progress with mutations
const saveProgress = useSaveProgressMutation()
saveProgress.mutate({ knownWords, unknownWords })
```

### TanStack Store (Client State)

```typescript
import { useStore } from '@tanstack/react-store'
import { uiStore, toggleImportantFilter } from '@/stores/uiStore'

// Read state
const showImportantOnly = useStore(uiStore, (s) => s.showImportantOnly)

// Update state
toggleImportantFilter()
```

### Custom Hooks

```typescript
// Audio playback
const { play, stop, preload } = useAudioPlayer()
await play('/audio/美丽.mp3')

// Navbar hide on scroll
const isHidden = useScrollHide()

// Mobile viewport height fix
useMobileViewport()
```

## Routes

| Route | Page |
|-------|------|
| `/` | Latest Words (main practice) |
| `/review` | Review unknown words |
| `/vocabulary` | Full vocabulary browser |
| `/dashboard` | Parent dashboard |
| `/school-tingxie` | School dictation practice |
| `/handwriting` | Stroke order practice |
| `/settings` | User settings |
| `/radicals` | Radical learning |
| `/family` | Family vocabulary |
| `/instructions` | Instructions vocabulary |
| `/phrase-matching` | Phrase matching game |
| `/koushi-family-cohesion` | Oral exam practice |
| `/p3hcl-reading-sync` | Reading practice |
| `/p3hcl-wupin-interactive` | Interactive reading |

## Data Format

Vocabulary data is stored in `public/data/tingxie/tingxie_vocabulary.json`:

```json
{
  "vocabulary": [
    {
      "row": 77,
      "words": [
        {
          "simplified": "美丽",
          "traditional": "美麗",
          "pinyin": "měi lì",
          "english": "beautiful",
          "audio": "audio/美丽.mp3",
          "important": true
        }
      ]
    }
  ]
}
```

## Adding New Vocabulary

1. Add new row to `public/data/tingxie/tingxie_vocabulary.json`
2. Update `CONSTANTS.VOCABULARY.LATEST_ROW_NUMBER` in `src/lib/constants.ts`
3. Generate audio: `python3 download_google_audio.py`
4. Build and deploy: `npm run deploy`

## Cloud Sync

Progress is synced via Cloudflare KV:
- **API**: `/api/progress` (GET/POST)
- **Key format**: `student:{studentId}:tingxie:progress`
- **Student ID**: Stored in localStorage (`tingxie_student_id`)
- **Retry logic**: 3 attempts with exponential backoff

## Deployment

The app is deployed on **Cloudflare Workers** with static assets:

```bash
npm run deploy  # Builds and deploys to Cloudflare
```

Configuration in `wrangler.toml`:
- Static assets served from `dist/` directory
- SPA fallback enabled for client-side routing
- KV namespace binding for progress storage

## Styling

Uses Tailwind CSS v4 with custom theme:

```css
/* src/index.css */
:root {
  --color-primary: #667eea;
  --color-primary-dark: #764ba2;
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

Button variants defined in `src/components/ui/button.tsx`:
- `default`, `primary`, `audio`, `know`, `dontKnow`, `handwriting`, `filter`, `filterActive`

## Mobile-First Design

- Hamburger menu with full-screen overlay
- Navbar hides on scroll down (mobile only)
- Touch targets minimum 44x44px
- Viewport height fix for iOS Safari
