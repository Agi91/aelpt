# AI Enhancement Learning Progress Tracker (AELPT)

> A portfolio-grade, startup-ready AI-powered learning platform that helps students
> manage their complete academic and placement journey — from Semester 1 to their
> first job offer.

---

## Project Vision

Build an AI-powered Personalized Learning Operating System where students can organize
subjects, track real understanding (not just completion), get AI-driven study plans,
and prepare for placement — all in one free platform.

**Understanding Score** is our core differentiator:
- Completion % tells you what you *finished*
- Understanding Score tells you what you *know*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | Firebase Authentication, Cloud Firestore, Firebase Storage |
| AI | Google Gemini API (primary) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Monorepo Structure

```
aelpt/ (d:\ALTP\)
├── apps/
│   ├── web/              ← Next.js 15 frontend (added in Milestone 0.2)
│   └── server/           ← Express.js backend (added in Milestone 0.3)
├── packages/
│   └── shared/           ← Shared TypeScript types, Zod schemas, constants
├── .github/
│   └── workflows/        ← CI/CD pipelines
├── PROJECT_CONSTITUTION.md   ← Engineering rulebook (READ THIS FIRST)
├── DEVELOPMENT_ROADMAP.md    ← Implementation guide (Phase-by-phase)
├── package.json              ← Root workspaces config
├── .eslintrc.js              ← Root ESLint config
├── .prettierrc               ← Prettier formatting config
└── README.md                 ← This file
```

---

## Getting Started

### Prerequisites

| Tool | Required Version |
|------|-----------------|
| Node.js | >= 20.0.0 |
| npm | >= 10.0.0 |
| Git | Any recent version |

### Setup (Development)

```bash
# 1. Clone the repository
git clone <YOUR_GITHUB_URL>
cd aelpt

# 2. Install all workspace dependencies from root
npm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env

# 4. Fill in environment variables
# Edit apps/web/.env.local with your Firebase client config
# Edit apps/server/.env with your Firebase Admin SDK and Gemini API key

# 5. Run frontend (in one terminal)
npm run dev:web

# 6. Run backend (in another terminal)
npm run dev:server
```

### Environment Variables

See:
- `apps/web/.env.example` for frontend variables
- `apps/server/.env.example` for backend variables

**CRITICAL: Never commit `.env` or `.env.local` files.**

---

## Engineering Rules

All engineering decisions are governed by [`PROJECT_CONSTITUTION.md`](./PROJECT_CONSTITUTION.md).

Read it before writing any code. No exceptions.

---

## Development Roadmap

The complete implementation guide is in [`DEVELOPMENT_ROADMAP.md`](./DEVELOPMENT_ROADMAP.md).

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Foundation & Setup | 🔄 In Progress |
| 1 | Authentication System | ⏳ Pending |
| 2 | App Shell & Navigation | ⏳ Pending |
| 3 | Academic Structure | ⏳ Pending |
| 4 | Progress Tracking | ⏳ Pending |
| 5 | Spaced Repetition & Flashcards | ⏳ Pending |
| 6 | Notes & Resources | ⏳ Pending |
| 7 | AI Integration | ⏳ Pending |
| 8 | RAG & Quiz Generation | ⏳ Pending |
| 9 | Analytics & Gamification | ⏳ Pending |
| 12 | Polish & Deployment | ⏳ Pending |

---

## Contributing

This project is built solo with AI assistance, following the constitution strictly.

Before any commit:
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] ESLint passes with 0 errors
- [ ] No `.env` files in `git status`
- [ ] Commit message follows Conventional Commits format

---

*Built with the constitution, built to last.*
