# TMDB Development Skill

## Purpose

This skill enables the AI agent to assist with general development tasks for the TMDB Next.js frontend. It covers coding standards, project structure, and best practices.

## Scope

- Next.js 15 + App Router
- React 19
- TypeScript
- Tailwind CSS
- Testing (Vitest + Cypress)
- Code quality (ESLint, Prettier)

## Capabilities

### 1. Write Components

```tsx
// app/components/MovieCard.tsx
import Image from 'next/image';
import { formatRating } from '@/utils/format';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article data-testid="movie-card">
      <Image
        src={movie.posterPath}
        alt={movie.title}
        width={200}
        height={300}
      />
      <h2>{movie.title}</h2>
      <p>Rating: {formatRating(movie.rating)}</p>
    </article>
  );
}
```

### 2. Write Utility Functions

```ts
// utils/format.ts
export function formatRating(rating: number | null): string {
  if (rating === null) return 'N/A';
  return rating.toFixed(1);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### 3. Write API Routes

```ts
// app/api/movies/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${query}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    }
  );
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

### 4. Write Tests

```ts
// tests/vitest/utils/format.test.ts
import { formatRating } from '@/utils/format';

describe('formatRating', () => {
  it('formats rating to one decimal', () => {
    expect(formatRating(8.5)).toBe('8.5');
  });

  it('handles null rating', () => {
    expect(formatRating(null)).toBe('N/A');
  });
});
```

## Project Structure

```
tmdb-nextjs-frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── movies/
│   │   └── [id]/
│   ├── components/        # Shared components
│   ├── layout.tsx
│   └── page.tsx
├── tests/
│   ├── vitest/            # Unit tests
│   └── cypress/           # E2E + Component tests
├── utils/                 # Utility functions
├── types/                 # TypeScript types
└── docs/                  # Documentation
```

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Test all
npm run test

# Test unit
npm run test:unit

# Test component
npm run test:component

# Test acceptance
npm run test:acceptance

# Test accessibility
npm run test:a11y

# Test security
npm run test:security
```

## Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Testing**: Testing Library queries
- **Naming**: PascalCase for components, camelCase for functions

## Documentation

- **Testing Strategy**: [`docs/testing.md`](../../docs/testing.md)
- **AI Prompts**: [`docs/ai-prompts.md`](../../docs/ai-prompts.md)
- **README**: [`README.md`](../../README.md)

## When to Use

Use this skill when:
- Creating new components
- Adding new pages or routes
- Writing utility functions
- Fixing bugs
- Refactoring code
- Adding TypeScript types
