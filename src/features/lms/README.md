# LMS Feature Module

This module contains a simple LMS implementation backed by Next.js API routes.

## Structure

- `types.ts`: LMS entities and storage contracts
- `service.ts`: client-side API calls
- `server/store.ts`: server-side storage and business logic
- `components/LmsWorkspace.tsx`: main LMS UI and interaction logic

## API Routes

- `GET/POST /api/lms/classes`
- `POST /api/lms/classes/join`
- `GET/POST /api/lms/lessons`
- `GET/POST /api/lms/assignments`
- `GET/POST /api/lms/submissions`
- `PATCH /api/lms/submissions/grade`

## Persistence

LMS data is stored in PostgreSQL via Prisma.

Useful commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:studio`
- `npm run db:migrate-json` (import old data from `data/lms-store.json`)

## Route

The LMS page is mounted at `/lms` via `src/app/lms/page.tsx`.
