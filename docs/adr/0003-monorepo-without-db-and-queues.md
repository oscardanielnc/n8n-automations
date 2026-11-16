# 0003 — Standard monorepo without Redis, BullMQ and Prisma

**Status:** Accepted · 2026-11-10 (Oscar)

## Context
The development standard's stack includes Prisma, Redis + BullMQ and Passport. This app has no database of its own
(ADR 0001), no background jobs (n8n runs them) and no login (ADR 0002).

## Decision
Keep: Turborepo + pnpm, NestJS 11, Zod contracts in `packages/contracts`, React + Vite (Bulletproof React), TanStack
Query, React Router 7, Tailwind + Radix, Storybook, Vitest + Testing Library + supertest, Playwright for the 4 pages,
nestjs-pino, helmet, throttler, gitleaks, check-unicode, Husky, GitHub Actions.
Drop: Prisma, Redis, BullMQ, Passport/JWT, Sentry (errors go to n8n-style Telegram alert later if needed).

## Why
Every dropped piece would exist only to satisfy the template, with nothing to do. They come back if a need appears.
