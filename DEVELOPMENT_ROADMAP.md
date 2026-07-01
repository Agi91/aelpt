# DEVELOPMENT_ROADMAP.md
## AI Enhancement Learning Progress Tracker (AELPT)

---

```
Version        : 1.0.0
Status         : ACTIVE
Authority      : Technical Program Manager · Principal Software Architect
Aligned With   : PROJECT_CONSTITUTION.md v1.0.0
Last Updated   : June 30, 2026
Builder Level  : Beginner with AI Assistance
```

> **HOW TO USE THIS DOCUMENT**
> Read ONE milestone at a time. Complete every task in order.
> Pass every test before moving to the next milestone.
> Never skip a step — even if it seems small.
> Every task produces a working, testable output.

---

## PROJECT OVERVIEW

| Item | Detail |
|------|--------|
| Total Phases | 12 |
| Total Milestones | 42 |
| MVP Phases | Phase 0 through Phase 9 + Phase 12 |
| Future Phases | Phase 10, 11 |
| Estimated MVP Duration | 16–20 weeks (solo beginner with AI assistance) |

## PHASE OVERVIEW TABLE

| Phase | Name | MVP/Future | Est. Duration |
|-------|------|------------|---------------|
| 0 | Project Foundation & Setup | MVP | Week 1–2 |
| 1 | Authentication System | MVP | Week 2–3 |
| 2 | App Shell & Navigation | MVP | Week 3–4 |
| 3 | Academic Structure | MVP | Week 4–6 |
| 4 | Progress Tracking & Understanding Score | MVP | Week 6–7 |
| 5 | Spaced Repetition & Flashcards | MVP | Week 7–8 |
| 6 | Notes & Resource Manager | MVP | Week 8–9 |
| 7 | AI Integration — Gemini Core | MVP | Week 9–11 |
| 8 | RAG Pipeline & Quiz Generation | MVP | Week 11–13 |
| 9 | Analytics, Gamification & Dashboard | MVP | Week 13–15 |
| 10 | Study Planner & Calendar | Future | Post-MVP |
| 11 | Recommendation Engine & Wellness | Future | Post-MVP |
| 12 | Polish, Testing & Production Deployment | MVP | Week 15–16 |

---

## PHASE 0 — PROJECT FOUNDATION & SETUP

**Duration:** Week 1–2
**Type:** MVP — Required before everything else
**Goal:** A fully configured, runnable monorepo with correct folder structure,
tooling, and empty scaffolding for frontend and backend. No features yet. Only infrastructure.

---

### MILESTONE 0.1 — Monorepo Initialization

**Estimated Time:** 1–2 days
**Depends On:** Nothing

#### Tasks (in order)

**Task 0.1.1** — Create root project folder: aelpt/ and open in VS Code

**Task 0.1.2** — Initialize Git:
  - git init
  - Create GitHub repo named: aelpt
  - git remote add origin <YOUR_GITHUB_URL>
  - Verify: git remote -v

**Task 0.1.3** — Create root package.json with workspaces: ["apps/*", "packages/*"]

**Task 0.1.4** — Create skeleton folder structure:
  - apps/ apps/web/ apps/server/
  - packages/ packages/shared/
  - .github/ .github/workflows/

**Task 0.1.5** — Create root .gitignore:
  - Add: node_modules/, .env, .env.local, .next/, dist/, build/, .DS_Store, *.log, coverage/

**Task 0.1.6** — Create root .prettierrc:
  - semi: true, singleQuote: true, tabWidth: 2, trailingComma: es5

**Task 0.1.7** — Create root .eslintrc.js with TypeScript and React rules

#### Files Created

```
aelpt/
  package.json         (root workspaces)
  .gitignore
  .prettierrc
  .eslintrc.js
  apps/web/            (empty)
  apps/server/         (empty)
  packages/shared/     (empty)
  .github/workflows/   (empty)
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "chore: initialize monorepo structure with workspaces"
git push origin main
```

#### Expected Output
- aelpt/ folder has all subfolders
- git log shows first commit
- github.com/<your-name>/aelpt shows repository

#### Tests Before Moving On
- [ ] All subfolders exist (verify with ls or File Explorer)
- [ ] git log shows first commit
- [ ] git remote -v shows correct GitHub URL
- [ ] .gitignore is present with node_modules listed

#### Risks & Common Mistakes
- MISTAKE: Forgetting to push after commit — always push to GitHub
- MISTAKE: Creating files inside apps/web/ before running create-next-app
- MISTAKE: Using npm workspaces with npm < 7 — update npm first: npm install -g npm@latest

---

### MILESTONE 0.2 — Frontend Scaffolding (Next.js 15)

**Estimated Time:** 1–2 days
**Depends On:** Milestone 0.1

#### Tasks (in order)

**Task 0.2.1** — Scaffold Next.js 15 inside apps/web/:
  - cd apps/web/
  - npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  - Select YES for all prompts

**Task 0.2.2** — Initialize shadcn/ui:
  - npx shadcn@latest init
  - Style: Default, Base color: Zinc, CSS variables: Yes

**Task 0.2.3** — Install frontend dependencies:
  - npm install framer-motion lucide-react react-hook-form zod @hookform/resolvers
  - npm install recharts next-themes date-fns clsx tailwind-merge

**Task 0.2.4** — Add first shadcn/ui components:
  - npx shadcn@latest add button card input label toast dialog
  - npx shadcn@latest add dropdown-menu avatar badge separator

**Task 0.2.5** — Configure TypeScript strict mode in tsconfig.json:
  - Add: noImplicitAny, strictNullChecks, noUnusedLocals, noUnusedParameters
  - Test: npx tsc --noEmit (must show 0 errors)

**Task 0.2.6** — Create environment files:
  - Create .env.local with all NEXT_PUBLIC_ variable names (leave values empty for now)
  - Create .env.example with same keys (always commit this one)

**Task 0.2.7** — Clean Next.js template:
  - Remove default content from src/app/page.tsx
  - Replace with: <main><h1>AELPT — Coming Soon</h1></main>
  - Remove default images from public/
  - Keep Tailwind directives in globals.css, remove rest

**Task 0.2.8** — Create cn() utility:
  - Create: src/lib/utils/cn.ts
  - Export: function cn(...inputs) using clsx + tailwind-merge

**Task 0.2.9** — Configure fonts in layout.tsx:
  - Import Inter from next/font/google
  - Apply to body className
  - Add --font-body CSS variable in globals.css

#### Files Created

```
apps/web/
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
    components/ui/      (shadcn/ui generated components)
    lib/utils/cn.ts
  .env.local            (NEVER commit)
  .env.example          (ALWAYS commit)
  components.json
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "chore(web): scaffold Next.js 15 with TypeScript, Tailwind, shadcn/ui"
git push origin main
```

#### Expected Output
- npm run dev starts on localhost:3000 without errors
- Browser shows "AELPT — Coming Soon" text

#### Tests Before Moving On
- [ ] localhost:3000 loads without console errors
- [ ] npx tsc --noEmit shows 0 errors
- [ ] .env.local is NOT visible in git status
- [ ] A shadcn Button renders correctly (test temporarily, then remove)

#### Risks & Common Mistakes
- MISTAKE: Missing --app flag in create-next-app command (gets Pages Router instead of App Router)
- MISTAKE: Running shadcn add before shadcn init
- MISTAKE: Editing files in components/ui/ — shadcn manages these
- RISK: Tailwind not processing — verify tailwind.config.ts has correct content paths

---

### MILESTONE 0.3 — Backend Scaffolding (Express + TypeScript)

**Estimated Time:** 1–2 days
**Depends On:** Milestone 0.1

#### Tasks (in order)

**Task 0.3.1** — Initialize apps/server/:
  - cd apps/server/
  - npm init -y

**Task 0.3.2** — Install backend dependencies:
  - Production: npm install express cors helmet morgan express-rate-limit dotenv
  - Production: npm install firebase-admin @google/generative-ai zod
  - Dev: npm install -D typescript @types/node @types/express @types/cors @types/morgan ts-node-dev

**Task 0.3.3** — Create tsconfig.json:
  - target: ES2022, module: CommonJS, strict: true, outDir: dist/, rootDir: src/
  - Add all strict flags from PROJECT_CONSTITUTION.md Section 15

**Task 0.3.4** — Create folder structure inside src/:
  - routes/ controllers/ services/ services/ai/ middleware/
  - firebase/ lib/ lib/errors/ lib/utils/ lib/constants/ config/

**Task 0.3.5** — Create entry point files:
  - src/config/index.ts — typed environment variable config object
  - src/app.ts — Express app setup (middleware only, no routes yet)
  - src/server.ts — imports app, calls app.listen()
  - src/routes/index.ts — empty router aggregator (will grow per phase)

**Task 0.3.6** — Add health check route to src/routes/index.ts:
  - GET /health returns { status: "ok", version: "1.0.0", timestamp: new Date().toISOString() }

**Task 0.3.7** — Add npm scripts to package.json:
  - "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  - "build": "tsc"
  - "start": "node dist/server.js"
  - "type-check": "tsc --noEmit"

**Task 0.3.8** — Create environment files:
  - .env with PORT=3001 and placeholder values
  - .env.example with all variable names from PROJECT_CONSTITUTION.md Section 20.3

**Task 0.3.9** — Test server startup:
  - npm run dev should show: "Server running on port 3001"
  - Visit http://localhost:3001/api/v1/health in browser

#### Files Created

```
apps/server/
  src/
    app.ts
    server.ts
    config/index.ts
    routes/index.ts
    controllers/         (empty folders)
    services/            (empty folders)
    services/ai/         (empty folders)
    middleware/          (empty folders)
    firebase/            (empty folders)
    lib/errors/          (empty folders)
    lib/utils/           (empty folders)
    lib/constants/       (empty folders)
  .env                   (NEVER commit)
  .env.example           (ALWAYS commit)
  tsconfig.json
  package.json
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "chore(server): scaffold Express TypeScript server with health check"
git push origin main
```

#### Expected Output
- npm run dev starts server on port 3001
- GET /api/v1/health returns 200 with JSON { status: "ok" }

#### Tests Before Moving On
- [ ] Server starts without TypeScript errors
- [ ] /api/v1/health returns 200 JSON response
- [ ] npx tsc --noEmit shows 0 errors
- [ ] .env is NOT in git status

#### Risks & Common Mistakes
- MISTAKE: Using import/export (ESM) when tsconfig says CommonJS — use require() OR change module to ESNext
- TIP: Use ts-node-dev for development — it auto-restarts on file changes
- MISTAKE: Putting all logic in server.ts — keep app.ts and server.ts separate (constitution rule)

---

### MILESTONE 0.4 — Shared Package + Firebase Setup

**Estimated Time:** 1 day
**Depends On:** Milestones 0.1, 0.2, 0.3

#### Tasks (in order)

**Task 0.4.1** — Initialize packages/shared/:
  - npm init -y
  - Set name: "@aelpt/shared" in package.json
  - Create tsconfig.json with declaration: true

**Task 0.4.2** — Create shared structure and initial constants:
  - src/constants/error-codes.ts — ERROR_CODES const assertion object
  - src/constants/status.ts — TOPIC_STATUS const assertion
  - src/constants/difficulty.ts — DIFFICULTY const assertion
  - index.ts — barrel export

**Task 0.4.3** — Create Firebase project (in Firebase Console):
  - Project name: aelpt-dev
  - Enable Authentication (Email/Password + Google)
  - Create Firestore (test mode, asia-south1 region)
  - Enable Storage (test mode)

**Task 0.4.4** — Register web app and copy client config to .env.local

**Task 0.4.5** — Generate Admin SDK service account:
  - Download JSON → copy 3 fields to apps/server/.env → DELETE the JSON file

**Task 0.4.6** — Create Firebase initialization files:
  - apps/web/src/lib/firebase/config.ts — client SDK singleton
  - apps/server/src/firebase/admin.ts — Admin SDK singleton
  - apps/server/src/firebase/firestore.ts — Firestore instance
  - apps/server/src/firebase/storage.ts — Storage instance

**Task 0.4.7** — Create lib/constants/collections.ts in apps/server/:
  - Define COLLECTIONS and SUBCOLLECTIONS const objects
  - All Firestore collection names as typed constants (no string literals allowed)

**Task 0.4.8** — Link shared package to both apps:
  - Add "@aelpt/shared": "*" to dependencies in apps/web/package.json
  - Add "@aelpt/shared": "*" to dependencies in apps/server/package.json
  - Run npm install from root directory

**Task 0.4.9** — Setup CI/CD (GitHub Actions):
  - Create .github/workflows/ci.yml
  - Triggers: push to any branch, PR to dev and main
  - Jobs: type-check + lint for web and server
  - Install Husky: npx husky init
  - Add pre-commit hook running lint-staged

#### Files Created

```
packages/shared/src/constants/
  error-codes.ts
  status.ts
  difficulty.ts
packages/shared/index.ts
packages/shared/tsconfig.json

apps/web/src/lib/firebase/
  config.ts

apps/server/src/firebase/
  admin.ts
  firestore.ts
  storage.ts
apps/server/src/lib/constants/
  collections.ts

.github/workflows/ci.yml
.husky/pre-commit
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "chore: setup shared package, Firebase SDKs, and CI pipeline"
git push origin main
```

#### Tests Before Moving On
- [ ] Firebase console shows: Auth enabled, Firestore created, Storage created
- [ ] Service account JSON file is DELETED from your computer
- [ ] GitHub Actions CI passes (green checkmark in Actions tab)
- [ ] Both apps can import from @aelpt/shared without errors

#### Risks & Common Mistakes
- CRITICAL: Never commit the Firebase service account JSON file
- MISTAKE: Using the production Firebase project for development — use aelpt-dev always
- MISTAKE: Picking wrong Firestore region — pick asia-south1 for India
- RISK: GitHub Actions failing because of TypeScript errors — fix before adding CI

---

## PHASE 1 — AUTHENTICATION SYSTEM

**Duration:** Week 2–3
**Type:** MVP — Required before any other feature
**Goal:** Working login, signup, Google OAuth, and session management.
         Protected routes that redirect unauthenticated users.

---

### MILESTONE 1.1 — Backend Auth Middleware

**Estimated Time:** 1 day
**Depends On:** Phase 0 complete

#### Tasks (in order)

**Task 1.1.1** — Create AppError class hierarchy:
  - apps/server/src/lib/errors/AppError.ts
  - Classes: AppError (base), NotFoundError, ValidationError, UnauthorizedError, AiServiceError

**Task 1.1.2** — Create global error handler middleware:
  - apps/server/src/middleware/error.middleware.ts
  - Must be the LAST middleware registered in app.ts
  - Returns standard ErrorResponse format from constitution

**Task 1.1.3** — Create API response builder utility:
  - apps/server/src/lib/utils/response.ts
  - Functions: ApiResponse.success(data, message?) and ApiResponse.error(code, message)
  - All controllers use this — never build response objects manually

**Task 1.1.4** — Create Firebase auth middleware:
  - apps/server/src/middleware/auth.middleware.ts
  - Verifies Firebase ID token from Authorization: Bearer <token> header
  - Attaches decoded user to req.user (create AuthenticatedRequest type)
  - Returns 401 UnauthorizedError if token is missing or invalid

**Task 1.1.5** — Create rate limiting middleware:
  - apps/server/src/middleware/rateLimit.middleware.ts
  - General limiter: 100 req/min per user
  - Auth limiter: 10 req/15min per IP
  - AI limiter: 20 req/min per user (used in Phase 7)

**Task 1.1.6** — Create validation middleware:
  - apps/server/src/middleware/validate.middleware.ts
  - Takes a Zod schema, validates req.body, calls next() or throws ValidationError

**Task 1.1.7** — Register all middleware in correct order in app.ts:
  - helmet(), cors(), express.json(), morgan (dev only), routes, errorMiddleware (LAST)

**Task 1.1.8** — Create auth routes (skeleton):
  - apps/server/src/routes/auth.routes.ts
  - POST /api/v1/auth/verify — verify ID token and return user info
  - Register in routes/index.ts

**Task 1.1.9** — Create auth controller:
  - apps/server/src/controllers/auth.controller.ts
  - verifyToken: reads token from body, calls Admin SDK, returns user data

#### Files Created

```
apps/server/src/
  lib/errors/AppError.ts
  lib/utils/response.ts
  middleware/auth.middleware.ts
  middleware/error.middleware.ts
  middleware/rateLimit.middleware.ts
  middleware/validate.middleware.ts
  routes/auth.routes.ts
  controllers/auth.controller.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(auth): add Firebase auth middleware, error handler, and response builder"
```

#### Tests Before Moving On
- [ ] POST /api/v1/auth/verify with a valid Firebase token returns 200 with user data
- [ ] POST /api/v1/auth/verify with no token returns 401
- [ ] POST /api/v1/auth/verify with invalid token returns 401
- [ ] Any route error properly returns ErrorResponse format (not HTML error page)

#### Risks & Common Mistakes
- MISTAKE: Registering error middleware BEFORE routes — it must be LAST
- MISTAKE: Using req.body.userId instead of req.user.uid — always use the verified token
- MISTAKE: Not handling the case where token is expired (Firebase throws a specific error)

---

### MILESTONE 1.2 — Frontend Auth Pages

**Estimated Time:** 2–3 days
**Depends On:** Milestone 1.1

#### Tasks (in order)

**Task 1.2.1** — Create AuthProvider context:
  - apps/web/src/providers/AuthProvider.tsx
  - Uses Firebase onAuthStateChanged to track auth state
  - Provides: user, loading, signIn, signUp, signOut, signInWithGoogle

**Task 1.2.2** — Create useAuth custom hook:
  - apps/web/src/hooks/useAuth.ts
  - Wraps AuthProvider context into a clean hook
  - Throws if used outside AuthProvider

**Task 1.2.3** — Create auth helper functions:
  - apps/web/src/lib/firebase/auth.ts
  - Functions: signInWithEmail, signUpWithEmail, signInWithGoogle, signOut
  - All functions return typed results, never throw unhandled

**Task 1.2.4** — Create Login page:
  - apps/web/src/app/(auth)/login/page.tsx
  - Form fields: email, password
  - Uses React Hook Form + Zod validation schema from shared package
  - Google sign-in button (Lucide Google icon)
  - Link to /signup
  - Shows loading state during auth
  - Shows error messages (wrong password, email not found)
  - Redirects to /dashboard on success

**Task 1.2.5** — Create Signup page:
  - apps/web/src/app/(auth)/signup/page.tsx
  - Form fields: full name, email, password, confirm password
  - Same form patterns as login
  - On success: creates user profile in Firestore + redirects to /onboarding

**Task 1.2.6** — Create auth layout:
  - apps/web/src/app/(auth)/layout.tsx
  - Centered card layout with brand logo/name
  - No sidebar or navigation

**Task 1.2.7** — Create Zod validation schemas in shared package:
  - packages/shared/src/schemas/auth.schema.ts
  - loginSchema: email, password
  - signupSchema: fullName, email, password, confirmPassword (with .refine for match)

**Task 1.2.8** — Style the auth pages:
  - Dark background, centered card
  - Brand purple primary color for primary button
  - Input fields with proper focus states
  - Password show/hide toggle
  - Loading spinner on submit button

#### Files Created

```
apps/web/src/
  providers/AuthProvider.tsx
  hooks/useAuth.ts
  lib/firebase/auth.ts
  app/(auth)/
    layout.tsx
    login/page.tsx
    signup/page.tsx

packages/shared/src/schemas/
  auth.schema.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(auth): add login and signup pages with Firebase Authentication"
```

#### Expected Output
- /login shows a styled form with email/password fields
- /signup shows a styled form with all fields
- Submitting login with correct credentials redirects to /dashboard
- Submitting with wrong password shows error message

#### Tests Before Moving On
- [ ] /login loads without errors
- [ ] /signup loads without errors
- [ ] Creating a new account works (check Firebase Auth console — user appears)
- [ ] Logging in with correct credentials succeeds
- [ ] Wrong password shows error message (not a crash)
- [ ] Google sign-in button opens the Google popup

#### Risks & Common Mistakes
- MISTAKE: Not wrapping layout.tsx in AuthProvider — auth state will not work
- MISTAKE: Using useRouter() before auth state is resolved — check loading state first
- RISK: Google sign-in popup blocked — user needs to allow popups for localhost:3000
- MISTAKE: Storing Firebase user in localStorage — Firebase SDK handles this automatically

---

### MILESTONE 1.3 — Protected Routes & User Profile

**Estimated Time:** 1–2 days
**Depends On:** Milestone 1.2

#### Tasks (in order)

**Task 1.3.1** — Create route protection in dashboard layout:
  - apps/web/src/app/(dashboard)/layout.tsx
  - Uses useAuth() to check if user is authenticated
  - If loading: show full-page skeleton/spinner
  - If not authenticated: redirect to /login
  - If authenticated: render children

**Task 1.3.2** — Create user profile service (backend):
  - apps/server/src/services/user.service.ts
  - createUserProfile(uid, data): creates document in users/{uid} in Firestore
  - getUserProfile(uid): reads the user document
  - updateUserProfile(uid, data): updates fields

**Task 1.3.3** — Create user routes and controller (backend):
  - apps/server/src/routes/user.routes.ts
  - GET /api/v1/users/me — get current user profile
  - PATCH /api/v1/users/me — update profile
  - Register in routes/index.ts

**Task 1.3.4** — Auto-create user profile on first signup:
  - In AuthProvider or signup handler: after Firebase creates user, call backend
  - POST /api/v1/users/profile to create Firestore user document
  - Document: { uid, displayName, email (reference only), createdAt, onboardingDone: false }

**Task 1.3.5** — Create API client wrapper in frontend:
  - apps/web/src/lib/api/client.ts
  - A fetch wrapper that automatically attaches Firebase ID token to every request
  - Handles token refresh automatically
  - Returns typed responses

**Task 1.3.6** — Create a placeholder /dashboard page:
  - apps/web/src/app/(dashboard)/dashboard/page.tsx
  - Shows: "Welcome, [user display name]!" and a sign-out button
  - This is just a placeholder — full dashboard comes in Phase 9

**Task 1.3.7** — Test the complete auth flow end-to-end

#### Files Created

```
apps/web/src/
  app/(dashboard)/
    layout.tsx           (protected route wrapper)
    dashboard/page.tsx   (placeholder)
  lib/api/client.ts

apps/server/src/
  services/user.service.ts
  controllers/user.controller.ts
  routes/user.routes.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(auth): add protected routes, user profile creation, and API client"
```

#### Tests Before Moving On
- [ ] Visiting /dashboard without logging in redirects to /login
- [ ] Visiting /dashboard after logging in shows the placeholder page
- [ ] User profile document appears in Firebase Firestore after signup
- [ ] Sign-out button works and redirects to /login
- [ ] Browser refresh on /dashboard keeps the user logged in (auth persists)

#### Risks & Common Mistakes
- RISK: Infinite redirect loop if layout.tsx has a bug — add console.log to debug
- MISTAKE: Not waiting for Firebase auth state to resolve before checking user
- MISTAKE: Storing user data in component state without handling the async nature

---

## PHASE 2 — APP SHELL & NAVIGATION

**Duration:** Week 3–4
**Type:** MVP
**Goal:** The full application shell — sidebar, header, breadcrumbs, and mobile navigation.
         This shell wraps all dashboard pages. Built once, used everywhere.

---

### MILESTONE 2.1 — Sidebar Navigation

**Estimated Time:** 2 days
**Depends On:** Phase 1 complete

#### Tasks (in order)

**Task 2.1.1** — Create route constants:
  - apps/web/src/lib/constants/routes.ts
  - All app routes as typed constants (ROUTES.DASHBOARD, ROUTES.SEMESTERS, etc.)

**Task 2.1.2** — Create AppSidebar component:
  - apps/web/src/components/layout/AppSidebar.tsx
  - Navigation items: Dashboard, Semesters, Notes, Flashcards, Resources,
    Planner, AI Mentor, Analytics, Revision, Achievements, Wellness, Settings
  - Each item: icon (Lucide), label, route link
  - Active state: highlighted when current route matches
  - Collapsible on tablet (icon-only mode)
  - User section at bottom: avatar, display name, burnout badge (placeholder)
  - Streak counter at bottom

**Task 2.1.3** — Create AppHeader component:
  - apps/web/src/components/layout/AppHeader.tsx
  - Left: hamburger menu (mobile), page title
  - Right: notification bell (placeholder), user avatar dropdown
  - Avatar dropdown: profile link, settings link, sign-out

**Task 2.1.4** — Create AppBreadcrumb component:
  - apps/web/src/components/layout/AppBreadcrumb.tsx
  - Shows: Home > Semesters > Semester 3 > Algorithms
  - Reads from current route and page metadata

**Task 2.1.5** — Create Zustand UI store:
  - apps/web/src/store/useUiStore.ts
  - State: isSidebarOpen, isMobileSidebarOpen, activePageTitle
  - Actions: toggleSidebar, openMobileSidebar, closeMobileSidebar, setPageTitle

**Task 2.1.6** — Update dashboard layout to use shell components:
  - apps/web/src/app/(dashboard)/layout.tsx
  - Compose: AppSidebar + AppHeader + main content area
  - Apply correct CSS grid layout for sidebar + main area

**Task 2.1.7** — Style the shell with design system values:
  - Dark mode colors from PROJECT_CONSTITUTION.md Section 24
  - Purple primary brand color
  - Surface color for sidebar background
  - Subtle border between sidebar and content

#### Files Created

```
apps/web/src/
  components/layout/
    AppSidebar.tsx
    AppHeader.tsx
    AppBreadcrumb.tsx
  store/useUiStore.ts
  lib/constants/routes.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(layout): add app shell with sidebar, header, and navigation"
```

#### Expected Output
- Dashboard page shows sidebar on left, header on top, content area on right
- Clicking navigation items updates the active state
- Sidebar shows all navigation icons with labels

#### Tests Before Moving On
- [ ] Sidebar renders all navigation items
- [ ] Active route is highlighted
- [ ] Header shows user name and avatar
- [ ] Clicking sign-out works from header dropdown
- [ ] Layout is responsive (test at 375px, 768px, 1280px widths)

---

### MILESTONE 2.2 — Common Components & Empty States

**Estimated Time:** 1–2 days
**Depends On:** Milestone 2.1

#### Tasks (in order)

**Task 2.2.1** — Create PageHeader component:
  - apps/web/src/components/common/PageHeader.tsx
  - Props: title, subtitle?, actions? (button group on right)
  - Used at the top of every page

**Task 2.2.2** — Create EmptyState component:
  - apps/web/src/components/common/EmptyState.tsx
  - Props: icon, title, description, action (label + onClick)
  - Centered in its container
  - Every empty list uses this — never show a blank space

**Task 2.2.3** — Create LoadingSpinner component:
  - apps/web/src/components/common/LoadingSpinner.tsx
  - Sizes: sm, md, lg
  - Used during loading states

**Task 2.2.4** — Create StatusBadge component:
  - apps/web/src/components/common/StatusBadge.tsx
  - Displays TopicStatus with correct color
  - not_started: gray, in_progress: blue, completed: green, mastered: purple

**Task 2.2.5** — Create ConfirmDialog component:
  - apps/web/src/components/common/ConfirmDialog.tsx
  - Used for all destructive actions (delete semester, delete topic)
  - Props: title, description, onConfirm, onCancel, isOpen, variant (danger/default)

**Task 2.2.6** — Create ErrorBoundary component:
  - apps/web/src/components/common/ErrorBoundary.tsx
  - Wraps critical sections of the app
  - Shows user-friendly error message with retry button
  - Logs error to console in development

**Task 2.2.7** — Create skeleton/loading components:
  - apps/web/src/components/common/CardSkeleton.tsx
  - A pulsing placeholder card for loading states

**Task 2.2.8** — Create ThemeProvider:
  - apps/web/src/providers/ThemeProvider.tsx
  - Wraps next-themes ThemeProvider
  - Add theme toggle to AppHeader

#### Files Created

```
apps/web/src/components/common/
  PageHeader.tsx
  EmptyState.tsx
  LoadingSpinner.tsx
  StatusBadge.tsx
  ConfirmDialog.tsx
  ErrorBoundary.tsx
  CardSkeleton.tsx
apps/web/src/providers/
  ThemeProvider.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(ui): add common components library (empty state, skeleton, confirm dialog)"
```

#### Tests Before Moving On
- [ ] EmptyState renders with icon, title, description, and button
- [ ] StatusBadge shows correct colors for each status
- [ ] ConfirmDialog opens and closes correctly
- [ ] Dark mode toggle works (background switches colors)
- [ ] LoadingSpinner renders in all three sizes

---

## PHASE 3 — ACADEMIC STRUCTURE

**Duration:** Week 4–6
**Type:** MVP
**Goal:** The core data model — Semester > Subject > Unit > Topic hierarchy.
         Full CRUD operations for each level. This is the skeleton of the learning system.

---

### MILESTONE 3.1 — TypeScript Types & Zod Schemas

**Estimated Time:** 1 day
**Depends On:** Phase 2 complete

#### Tasks (in order)

**Task 3.1.1** — Create shared TypeScript types:
  - packages/shared/src/types/academic.types.ts
  - Interfaces: Semester, Subject, Unit, Topic, TopicResource
  - All Firestore Timestamp fields typed as: Timestamp | null | string
  - Every interface includes: id, userId, createdAt, updatedAt

**Task 3.1.2** — Create Zod validation schemas:
  - packages/shared/src/schemas/semester.schema.ts — createSemesterSchema
  - packages/shared/src/schemas/subject.schema.ts — createSubjectSchema
  - packages/shared/src/schemas/unit.schema.ts — createUnitSchema
  - packages/shared/src/schemas/topic.schema.ts — createTopicSchema

**Task 3.1.3** — Update shared package barrel export:
  - Export all new types and schemas from packages/shared/index.ts

#### Files Created

```
packages/shared/src/
  types/academic.types.ts
  schemas/
    semester.schema.ts
    subject.schema.ts
    unit.schema.ts
    topic.schema.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(types): add academic structure types and Zod schemas to shared package"
```

---

### MILESTONE 3.2 — Semester Management

**Estimated Time:** 2 days
**Depends On:** Milestone 3.1

#### Tasks (in order)

**Task 3.2.1** — Create semester service (backend):
  - apps/server/src/services/semester.service.ts
  - createSemester(userId, data): writes to users/{uid}/semesters/
  - getSemesters(userId): reads all semesters for user
  - getSemesterById(userId, semesterId): reads one document
  - updateSemester(userId, semesterId, data): updates fields
  - deleteSemester(userId, semesterId): deletes document

**Task 3.2.2** — Create semester controller:
  - apps/server/src/controllers/semester.controller.ts
  - Handlers for all 5 operations (list, create, get, update, delete)

**Task 3.2.3** — Create semester routes:
  - apps/server/src/routes/semester.routes.ts
  - GET /api/v1/semesters — list all
  - POST /api/v1/semesters — create new
  - GET /api/v1/semesters/:id — get one
  - PATCH /api/v1/semesters/:id — update
  - DELETE /api/v1/semesters/:id — delete
  - All routes: apply authMiddleware + validate where needed
  - Register in routes/index.ts

**Task 3.2.4** — Create semester API client (frontend):
  - apps/web/src/lib/api/semester.api.ts
  - Functions matching each backend endpoint
  - All functions return typed results

**Task 3.2.5** — Create useSemesters custom hook:
  - apps/web/src/hooks/useSemesters.ts
  - State: semesters[], isLoading, error
  - Functions: createSemester, updateSemester, deleteSemester
  - Fetches semesters on mount

**Task 3.2.6** — Create SemesterForm component:
  - apps/web/src/components/forms/SemesterForm.tsx
  - Fields: name (e.g., "Semester 3"), startDate, endDate, description
  - Uses React Hook Form + Zod validation
  - Works for both create and edit

**Task 3.2.7** — Create Semesters list page:
  - apps/web/src/app/(dashboard)/semesters/page.tsx
  - Shows list of semester cards with: name, date range, subject count
  - Add Semester button → opens Dialog with SemesterForm
  - Delete button → opens ConfirmDialog
  - Empty state when no semesters exist

**Task 3.2.8** — Create Semester detail page:
  - apps/web/src/app/(dashboard)/semesters/[semesterId]/page.tsx
  - Shows semester info and list of its subjects (subjects list is placeholder for now)

#### Files Created

```
apps/server/src/
  services/semester.service.ts
  controllers/semester.controller.ts
  routes/semester.routes.ts

apps/web/src/
  lib/api/semester.api.ts
  hooks/useSemesters.ts
  components/forms/SemesterForm.tsx
  app/(dashboard)/semesters/
    page.tsx
    [semesterId]/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(semesters): add full CRUD for semester management"
```

#### Expected Output
- /semesters page shows list of semesters (empty state if none)
- Creating a semester adds it to Firestore and shows in the list
- Editing a semester updates it
- Deleting asks for confirmation then removes it

#### Tests Before Moving On
- [ ] Create a semester — verify it appears in Firestore console under users/{uid}/semesters/
- [ ] Edit a semester — verify Firestore document updates
- [ ] Delete a semester — verify it disappears from list AND Firestore
- [ ] Empty state shows when no semesters exist
- [ ] Form validation works (try submitting with empty name)

---

### MILESTONE 3.3 — Subject, Unit & Topic Management

**Estimated Time:** 3–4 days
**Depends On:** Milestone 3.2

#### Tasks (in order)

**Task 3.3.1** — Build Subject CRUD (same pattern as Semester):
  - apps/server/: subject.service.ts, subject.controller.ts, subject.routes.ts
  - API endpoints nested: /semesters/:semesterId/subjects/*
  - Frontend: subject.api.ts, useSubjects.ts, SubjectForm.tsx
  - Page: app/(dashboard)/subjects/[subjectId]/page.tsx

**Task 3.3.2** — Build Unit CRUD (same pattern):
  - Nested under subjects
  - Unit fields: name, description, estimatedHours
  - API: /subjects/:subjectId/units/*
  - Frontend: unit.api.ts, useUnits.ts, UnitForm.tsx

**Task 3.3.3** — Build Topic CRUD (most important level):
  - Topic fields: title, description, difficulty (easy/medium/hard/very_hard),
    status (not_started/in_progress/completed/mastered), estimatedMinutes, tags[]
  - API: /units/:unitId/topics/*
  - Frontend: topic.api.ts, useTopics.ts, TopicForm.tsx

**Task 3.3.4** — Create Topic detail page:
  - apps/web/src/app/(dashboard)/subjects/[subjectId]/units/[unitId]/topics/[topicId]/page.tsx
  - Shows: topic title, difficulty badge, status, description
  - Understanding Score section (placeholder — Phase 4)
  - Resources section (placeholder — Phase 6)
  - Notes section (placeholder — Phase 6)
  - Study session button (placeholder — Phase 4)

**Task 3.3.5** — Create TopicProgressCard component:
  - apps/web/src/components/progress/TopicProgressCard.tsx
  - Shows: topic name, status badge, understanding score bar, time spent
  - Used in unit detail page to list topics

**Task 3.3.6** — Add DualProgressBar component:
  - apps/web/src/components/progress/DualProgressBar.tsx
  - Two bars: Completion % (blue) and Understanding % (purple)
  - Shows gap if understanding is lower than completion
  - This is a SIGNATURE component — make it look premium

#### Files Created

```
apps/server/src/
  services/subject.service.ts, unit.service.ts, topic.service.ts
  controllers/subject.controller.ts, unit.controller.ts, topic.controller.ts
  routes/subject.routes.ts, unit.routes.ts, topic.routes.ts

apps/web/src/
  lib/api/subject.api.ts, unit.api.ts, topic.api.ts
  hooks/useSubjects.ts, useUnits.ts, useTopics.ts
  components/forms/SubjectForm.tsx, UnitForm.tsx, TopicForm.tsx
  components/progress/TopicProgressCard.tsx, DualProgressBar.tsx
  app/(dashboard)/subjects/[subjectId]/
    page.tsx
    units/[unitId]/
      page.tsx
      topics/[topicId]/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(academic): add complete Subject, Unit, and Topic CRUD management"
```

#### Tests Before Moving On
- [ ] Full hierarchy works: create Semester > Subject > Unit > Topic
- [ ] Verify Firestore: users/{uid}/semesters/{id}/subjects/{id}/units/{id}/topics/{id}
- [ ] TopicProgressCard renders correctly with all status colors
- [ ] DualProgressBar shows both bars correctly
- [ ] Topic detail page loads with placeholder sections

---

## PHASE 4 — PROGRESS TRACKING & UNDERSTANDING SCORE

**Duration:** Week 6–7
**Type:** MVP
**Goal:** The core innovation. Track real understanding, not just task completion.
         Session logging, understanding score updates, status transitions.

---

### MILESTONE 4.1 — Understanding Score Engine

**Estimated Time:** 2 days
**Depends On:** Phase 3 complete

#### Tasks (in order)

**Task 4.1.1** — Create score calculation utility (shared):
  - packages/shared/src/utils/score.ts (also copy to server src/lib/utils/score.ts)
  - Function: calculateNewScore(currentScore, selfRating 1-5): number
  - Formula: newScore = (currentScore * 0.7) + (selfRating / 5 * 100 * 0.3)
  - Function: ratingToLabel(score): "Critical" | "Developing" | "Building" | "Strong" | "Mastered"
  - Function: getScoreColor(score): CSS color class string

**Task 4.1.2** — Create progress types in shared package:
  - packages/shared/src/types/progress.types.ts
  - TopicProgress interface, StudySession interface, UnderstandingHistory interface

**Task 4.1.3** — Create progress service (backend):
  - apps/server/src/services/progress.service.ts
  - updateTopicProgress(userId, topicId, data): writes to topic document
  - getTopicProgress(userId, topicId): reads progress fields
  - recordUnderstandingHistory(userId, topicId, score, source): appends to history subcollection

**Task 4.1.4** — Create progress routes and controller:
  - PATCH /api/v1/progress/topics/:topicId — update understanding score
  - GET /api/v1/progress/topics/:topicId — get current progress
  - PATCH /api/v1/progress/topics/:topicId/status — update status

**Task 4.1.5** — Create UnderstandingScoreBadge component:
  - apps/web/src/components/progress/UnderstandingScoreBadge.tsx
  - Shows score as number + color-coded badge
  - 0-29: red "Critical", 30-49: orange "Developing"
  - 50-69: yellow "Building", 70-84: green "Strong", 85-100: purple "Mastered"
  - Used everywhere a score is shown

**Task 4.1.6** — Create useProgress hook:
  - apps/web/src/hooks/useProgress.ts
  - Reads and updates topic progress
  - Handles optimistic updates (update UI before server responds)

#### Files Created

```
packages/shared/src/types/progress.types.ts

apps/server/src/
  services/progress.service.ts
  controllers/progress.controller.ts
  routes/progress.routes.ts
  lib/utils/score.ts

apps/web/src/
  components/progress/UnderstandingScoreBadge.tsx
  lib/api/progress.api.ts
  hooks/useProgress.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(progress): add understanding score engine and topic progress tracking"
```

---

### MILESTONE 4.2 — Study Session Logger

**Estimated Time:** 2 days
**Depends On:** Milestone 4.1

#### Tasks (in order)

**Task 4.2.1** — Create study session Zod schema:
  - packages/shared/src/schemas/session.schema.ts
  - Fields: topicIds[], durationMinutes, moodBefore (1-5), moodAfter (1-5),
    understandingRatings {[topicId]: 1-5}, notes

**Task 4.2.2** — Create session service (backend):
  - apps/server/src/services/session.service.ts
  - createSession(userId, data): creates session document, updates topic scores
  - getSessions(userId, limit): returns recent sessions
  - Triggers: XP award (placeholder), streak update, SR scheduling

**Task 4.2.3** — Create session routes and controller

**Task 4.2.4** — Create Zustand session store:
  - apps/web/src/store/useSessionStore.ts
  - State: activeTopicIds[], elapsedSeconds, isRunning, studyNotes
  - Actions: startSession, pauseSession, endSession, addTopic, removeTopicFromSession

**Task 4.2.5** — Create StudyTimer component:
  - apps/web/src/components/progress/StudyTimer.tsx
  - Shows: elapsed time (MM:SS), pause/resume, stop buttons
  - Pomodoro mode: 25-min work, 5-min break
  - Custom mode: user sets their own duration

**Task 4.2.6** — Create SessionEndForm component:
  - apps/web/src/components/progress/SessionEndForm.tsx
  - After timer stops: shows list of studied topics
  - For each topic: 5-star rating for understanding (emoji scale)
  - Mood rating (before/after)
  - Quick note input
  - Submit button → calls session service

**Task 4.2.7** — Add Study button to Topic detail page:
  - "Start Studying" button opens study timer
  - Timer runs in a floating panel (doesn't navigate away)
  - On stop: SessionEndForm appears

#### Files Created

```
packages/shared/src/schemas/session.schema.ts

apps/server/src/
  services/session.service.ts
  controllers/session.controller.ts
  routes/session.routes.ts

apps/web/src/
  store/useSessionStore.ts
  components/progress/StudyTimer.tsx
  components/progress/SessionEndForm.tsx
  lib/api/session.api.ts
  hooks/useStudySession.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(sessions): add study session logging with understanding score capture"
```

#### Tests Before Moving On
- [ ] Starting a study timer counts up correctly
- [ ] Ending session shows rating form with all studied topics
- [ ] Submitting rating updates the Understanding Score in Firestore
- [ ] UnderstandingScoreBadge shows updated score after session
- [ ] Session document appears in Firestore: users/{uid}/studySessions/{id}

---

### MILESTONE 4.3 — Activity Heatmap

**Estimated Time:** 1 day
**Depends On:** Milestone 4.2

#### Tasks (in order)

**Task 4.3.1** — Create heatmap data aggregation service (backend):
  - apps/server/src/services/analytics.service.ts (initial version)
  - getActivityHeatmap(userId, days=90): returns array of { date, minutesStudied, topicsStudied }
  - Reads from studySessions subcollection

**Task 4.3.2** — Create heatmap API endpoint:
  - GET /api/v1/analytics/heatmap?days=90

**Task 4.3.3** — Create ActivityHeatmap component:
  - apps/web/src/components/dashboard/ActivityHeatmap.tsx
  - GitHub contribution graph style
  - Each cell: a day, colored by minutes studied (0=empty, low=light purple, high=dark purple)
  - Tooltip on hover: date, minutes, topics studied
  - Shows past 90 days

#### Files Created

```
apps/server/src/services/analytics.service.ts  (initial)
apps/web/src/components/dashboard/ActivityHeatmap.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(analytics): add activity heatmap component with 90-day view"
```

---

## PHASE 5 — SPACED REPETITION & FLASHCARDS

**Duration:** Week 7–8
**Type:** MVP
**Goal:** SM-2 spaced repetition algorithm. Automatic revision scheduling.
         Flashcard creation and review sessions.

---

### MILESTONE 5.1 — SM-2 Spaced Repetition Engine

**Estimated Time:** 2 days
**Depends On:** Phase 4 complete

#### Tasks (in order)

**Task 5.1.1** — Implement SM-2 algorithm as pure utility function:
  - apps/server/src/lib/utils/sr.ts
  - Function: calculateSm2(currentInterval, easeFactor, qualityRating 1-5): Sm2Result
  - Returns: { newInterval, newEaseFactor, nextReviewDate }
  - SM-2 rules (from constitution):
    - Quality 5: EF = EF + 0.1
    - Quality 4: EF unchanged
    - Quality 3: EF = EF - 0.14
    - Quality 2: reset interval to 1, EF = EF - 0.2
    - Quality 1: reset interval to 1, EF = max(1.3, EF - 0.3)
  - Minimum EF = 1.3, Maximum EF = 3.0

**Task 5.1.2** — Write unit tests for SM-2 algorithm:
  - apps/server/src/lib/utils/sr.test.ts
  - Test all 5 quality ratings
  - Test boundary conditions (EF at minimum 1.3)
  - Test interval growth over multiple sessions
  - Run: npx vitest sr.test.ts (must all pass)

**Task 5.1.3** — Create SR service (backend):
  - apps/server/src/services/sr.service.ts
  - scheduleTopicReview(userId, topicId, qualityRating): calculates next date, writes to Firestore
  - getRevisionQueue(userId): returns topics with nextReviewAt <= today
  - getTodaysRevisions(userId): filtered to today only
  - getUpcomingRevisions(userId, days=7): next 7 days

**Task 5.1.4** — Integrate SR scheduling into session completion:
  - In session.service.ts: after saving session, call sr.service.scheduleTopicReview
  - Use the understanding rating from the session as the quality rating for SM-2

**Task 5.1.5** — Create revision queue routes:
  - GET /api/v1/revision/today — today's due topics
  - GET /api/v1/revision/upcoming — next 7 days
  - POST /api/v1/revision/:topicId/review — submit quality rating after review

**Task 5.1.6** — Add nextReviewAt field to topic Firestore documents:
  - When a topic is first completed, schedule initial review for 1 day later
  - SR updates this date after each review

#### Files Created

```
apps/server/src/
  lib/utils/sr.ts
  lib/utils/sr.test.ts
  services/sr.service.ts
  controllers/revision.controller.ts
  routes/revision.routes.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(sr): implement SM-2 spaced repetition engine with unit tests"
```

#### Tests Before Moving On
- [ ] All SM-2 unit tests pass (run npx vitest)
- [ ] Completing a study session schedules a revision (visible in Firestore on the topic doc)
- [ ] GET /api/v1/revision/today returns topics due today
- [ ] After submitting a review, the topic's nextReviewAt updates correctly

---

### MILESTONE 5.2 — Revision Queue UI

**Estimated Time:** 2 days
**Depends On:** Milestone 5.1

#### Tasks (in order)

**Task 5.2.1** — Create useRevisionQueue hook:
  - apps/web/src/hooks/useRevisionQueue.ts
  - Fetches today's revisions and upcoming revisions
  - submitReview(topicId, qualityRating): calls API and refreshes queue

**Task 5.2.2** — Create Revision Queue page:
  - apps/web/src/app/(dashboard)/revision/page.tsx
  - Shows: "Overdue" section (red), "Due Today" section, "Upcoming 7 Days" section
  - Each item: topic name, last studied, current score, urgency
  - "Start Revision" button per item

**Task 5.2.3** — Create RevisionCard component:
  - apps/web/src/components/progress/RevisionCard.tsx
  - Shows topic title and 3 AI-generated recall questions (placeholder text for now)
  - After user attempts recall: reveal answer section
  - Quality rating: 5 buttons (Forgot → Perfect)
  - Smooth flip animation (Framer Motion)

**Task 5.2.4** — Create Revision Session flow:
  - "Start All Due" button on revision page
  - Goes through each due topic one by one using RevisionCard
  - Shows progress: "3 of 7 reviewed"
  - After all complete: summary screen with XP earned (placeholder)

#### Files Created

```
apps/web/src/
  hooks/useRevisionQueue.ts
  components/progress/RevisionCard.tsx
  app/(dashboard)/revision/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(revision): add revision queue UI with SM-2 review flow"
```

---

### MILESTONE 5.3 — Flashcard System

**Estimated Time:** 2–3 days
**Depends On:** Milestone 5.1

#### Tasks (in order)

**Task 5.3.1** — Create flashcard types and schema:
  - packages/shared/src/types/flashcard.types.ts
  - packages/shared/src/schemas/flashcard.schema.ts

**Task 5.3.2** — Create flashcard service (backend):
  - apps/server/src/services/flashcard.service.ts
  - createDeck, getDeck, createFlashcard, getFlashcardsInDeck
  - reviewFlashcard(userId, cardId, quality): applies SM-2, updates card

**Task 5.3.3** — Create flashcard routes and controller

**Task 5.3.4** — Create flashcard API client and hook:
  - apps/web/src/lib/api/flashcard.api.ts
  - apps/web/src/hooks/useFlashcards.ts

**Task 5.3.5** — Create FlashcardDeck component:
  - apps/web/src/components/flashcards/FlashcardDeck.tsx
  - Shows deck name, card count, and "Review" button

**Task 5.3.6** — Create FlashcardReviewCard component:
  - apps/web/src/components/flashcards/FlashcardReviewCard.tsx
  - Front: shows the question
  - Click to flip: reveals the answer (3D flip animation with Framer Motion)
  - Quality rating buttons after flip

**Task 5.3.7** — Create FlashcardCreator component:
  - apps/web/src/components/flashcards/FlashcardCreator.tsx
  - Form: front text, back text, card type, topic link
  - Can also be manually created from the Topic detail page

**Task 5.3.8** — Create Flashcards page:
  - apps/web/src/app/(dashboard)/flashcards/page.tsx
  - Shows list of decks
  - Create Deck button
  - Each deck: card count, due for review count, review button

#### Files Created

```
apps/server/src/
  services/flashcard.service.ts
  controllers/flashcard.controller.ts
  routes/flashcard.routes.ts

apps/web/src/
  components/flashcards/
    FlashcardDeck.tsx
    FlashcardReviewCard.tsx
    FlashcardCreator.tsx
  hooks/useFlashcards.ts
  lib/api/flashcard.api.ts
  app/(dashboard)/flashcards/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(flashcards): add flashcard system with SM-2 review and flip animation"
```

#### Tests Before Moving On
- [ ] Create a flashcard deck — appears in Firestore
- [ ] Create flashcards in the deck
- [ ] Review a flashcard — flip animation works
- [ ] After rating, the card's nextReviewAt updates
- [ ] Cards due for review are shown in the queue

---

## PHASE 6 — NOTES & RESOURCE MANAGER

**Duration:** Week 8–9
**Type:** MVP
**Goal:** Rich markdown note editor linked to topics. Resource manager for
         YouTube videos, articles, and LeetCode problems. YouTube embedding.

---

### MILESTONE 6.1 — Notes System

**Estimated Time:** 2 days
**Depends On:** Phase 5 complete

#### Tasks (in order)

**Task 6.1.1** — Create notes types and schemas:
  - packages/shared/src/types/note.types.ts
  - packages/shared/src/schemas/note.schema.ts

**Task 6.1.2** — Create notes service (backend):
  - apps/server/src/services/notes.service.ts
  - createNote, getNotes, getNoteById, updateNote, deleteNote
  - Notes can be linked to a topicId (or standalone)

**Task 6.1.3** — Create notes routes and controller

**Task 6.1.4** — Create NoteCard component:
  - apps/web/src/components/notes/NoteCard.tsx
  - Shows: title, topic link (if any), word count, preview of first 100 chars
  - Edit and delete buttons

**Task 6.1.5** — Create NoteEditor component:
  - apps/web/src/components/notes/NoteEditor.tsx
  - Simple textarea with markdown support (basic)
  - Bold, italic, code block buttons (toolbar)
  - Auto-save on blur (every time user clicks away)
  - Word count display

**Task 6.1.6** — Create Notes page:
  - apps/web/src/app/(dashboard)/notes/page.tsx
  - Left panel: list of notes (filterable by topic)
  - Right panel: NoteEditor for selected note
  - "New Note" button with topic selector

**Task 6.1.7** — Link Notes to Topic detail page:
  - Add "Notes" section to Topic detail page
  - Shows notes linked to this topic
  - Quick "Add Note" button

#### Files Created

```
apps/server/src/
  services/notes.service.ts
  controllers/notes.controller.ts
  routes/notes.routes.ts

apps/web/src/
  components/notes/NoteCard.tsx
  components/notes/NoteEditor.tsx
  hooks/useNotes.ts
  lib/api/notes.api.ts
  app/(dashboard)/notes/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(notes): add note editor with topic linking and auto-save"
```

---

### MILESTONE 6.2 — Resource Manager & YouTube Embedding

**Estimated Time:** 2 days
**Depends On:** Milestone 6.1

#### Tasks (in order)

**Task 6.2.1** — Create resource types and schema:
  - packages/shared/src/types/resource.types.ts
  - ResourceType: youtube_video | article | leetcode_problem | pdf | custom_link
  - packages/shared/src/schemas/resource.schema.ts

**Task 6.2.2** — Create resource service (backend):
  - apps/server/src/services/resource.service.ts
  - addResource(userId, topicId, data): adds resource to topic's resources subcollection
  - getResources(userId, topicId): lists all resources for a topic
  - markComplete(userId, topicId, resourceId): marks resource as completed
  - deleteResource(userId, topicId, resourceId)

**Task 6.2.3** — Create YouTube embed utility:
  - apps/web/src/lib/utils/youtube.ts
  - extractVideoId(url): extracts YouTube video ID from any YouTube URL format
  - getEmbedUrl(videoId): returns the embed URL for the iframe

**Task 6.2.4** — Create ResourceCard component:
  - apps/web/src/components/resources/ResourceCard.tsx
  - Shows: resource type icon, title, platform, completion status
  - "Mark Complete" toggle button
  - For YouTube: "Watch Here" button that opens embedded player

**Task 6.2.5** — Create YouTubePlayer component:
  - apps/web/src/components/resources/YouTubePlayer.tsx
  - Embeds YouTube iframe responsively
  - Handles invalid video IDs gracefully

**Task 6.2.6** — Create AddResourceForm component:
  - apps/web/src/components/forms/AddResourceForm.tsx
  - URL input: auto-detects type (YouTube, LeetCode, GeeksforGeeks, or generic)
  - Shows preview after URL entered
  - Title input (auto-populated from URL metadata where possible)

**Task 6.2.7** — Integrate resources into Topic detail page:
  - Resources section in Topic detail page
  - Shows all resources for the topic
  - YouTube videos show embedded player inline
  - "Add Resource" button opens AddResourceForm

**Task 6.2.8** — Create standalone Resources page:
  - apps/web/src/app/(dashboard)/resources/page.tsx
  - Shows all resources across all topics
  - Filter by type (YouTube, LeetCode, Article)

#### Files Created

```
apps/server/src/
  services/resource.service.ts
  controllers/resource.controller.ts
  routes/resource.routes.ts

apps/web/src/
  components/resources/ResourceCard.tsx
  components/resources/YouTubePlayer.tsx
  components/forms/AddResourceForm.tsx
  lib/utils/youtube.ts
  hooks/useResources.ts
  lib/api/resource.api.ts
  app/(dashboard)/resources/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(resources): add resource manager with YouTube video embedding"
```

#### Tests Before Moving On
- [ ] Add a YouTube link — video ID is correctly extracted
- [ ] YouTube video embeds and plays correctly on topic page
- [ ] Adding an article link creates a ResourceCard
- [ ] Mark complete toggles the completion state
- [ ] Resources page shows all resources across topics

---

## PHASE 7 — AI INTEGRATION (GEMINI CORE)

**Duration:** Week 9–11
**Type:** MVP
**Goal:** The Gemini AI service layer. AI Mentor chat with persistent memory.
         Concept explainer. AI study plan generation. All with proper fallbacks.

---

### MILESTONE 7.1 — Gemini Service Layer

**Estimated Time:** 2 days
**Depends On:** Phase 6 complete, Gemini API key obtained

#### Tasks (in order)

**Task 7.1.1** — Get Google Gemini API key:
  - Go to aistudio.google.com
  - Create API key (free tier is sufficient for development)
  - Add to apps/server/.env: GEMINI_API_KEY=your_key_here

**Task 7.1.2** — Create GeminiService class:
  - apps/server/src/services/ai/gemini.service.ts
  - This is THE ONLY FILE that imports or uses @google/generative-ai
  - Methods: generateText(params), generateStream(params), generateJSON(params, schema)
  - All methods: try/catch → throw AiServiceError on failure
  - Logs token usage for every call

**Task 7.1.3** — Create all system prompt constants:
  - apps/server/src/lib/constants/ai-prompts.ts
  - MENTOR_SYSTEM: empathetic tutor persona (see constitution)
  - CONCEPT_EXPLAINER: multi-angle explanation prompt
  - STUDY_PLAN_GENERATION: structured plan generation
  - WEAKNESS_ANALYSIS: diagnostic analysis prompt
  - Never use inline prompt strings in service files

**Task 7.1.4** — Create AI context builder:
  - apps/server/src/services/ai/context.service.ts
  - buildUserContext(userId): fetches user's current progress, weak topics, recent sessions
  - Returns structured UserAiContext object (see constitution section 30.4)
  - This context is injected into every AI request

**Task 7.1.5** — Create AI types in shared package:
  - packages/shared/src/types/ai.types.ts
  - AiMessage, AiConversation, UserAiContext interfaces

#### Files Created

```
apps/server/src/
  services/ai/
    gemini.service.ts
    context.service.ts
  lib/constants/ai-prompts.ts

packages/shared/src/types/ai.types.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(ai): implement Gemini service wrapper with context building"
```

#### Tests Before Moving On
- [ ] GeminiService.generateText() returns a text response (test with a simple prompt)
- [ ] AiServiceError is thrown when API key is invalid (test with wrong key)
- [ ] buildUserContext() returns correct data for a user with some topics

---

### MILESTONE 7.2 — AI Mentor Chat

**Estimated Time:** 2–3 days
**Depends On:** Milestone 7.1

#### Tasks (in order)

**Task 7.2.1** — Create AI conversation service:
  - apps/server/src/services/ai/mentor.service.ts
  - createConversation(userId, type): creates aiConversations/{id} document
  - sendMessage(userId, conversationId, message): calls Gemini with context + history
  - getConversations(userId): returns recent conversations list
  - getMessages(userId, conversationId): returns message history

**Task 7.2.2** — Create AI conversation routes (with SSE streaming):
  - GET /api/v1/ai/conversations — list conversations
  - POST /api/v1/ai/conversations — create new
  - GET /api/v1/ai/conversations/:id/messages — get message history
  - POST /api/v1/ai/conversations/:id/messages — send message → SSE stream response
  - SSE format: send each token as it arrives, end with done: true

**Task 7.2.3** — Create useAiCoach custom hook:
  - apps/web/src/hooks/useAiCoach.ts
  - State: messages[], isStreaming, conversations[]
  - Functions: sendMessage(), createConversation(), selectConversation()
  - Handles SSE response reading and appending tokens to message

**Task 7.2.4** — Create AiMessageBubble component:
  - apps/web/src/components/ai/AiMessageBubble.tsx
  - User bubble: right-aligned, primary color
  - AI bubble: left-aligned, surface color, AI avatar
  - Streaming: show blinking cursor while receiving tokens
  - Code blocks: syntax highlighted with copy button

**Task 7.2.5** — Create AiStreamingText component:
  - apps/web/src/components/ai/AiStreamingText.tsx
  - Receives streaming text and renders it progressively
  - Shows blinking cursor while streaming
  - Renders markdown formatting (bold, code, lists)

**Task 7.2.6** — Create AiMentorChat main component:
  - apps/web/src/components/ai/AiMentorChat.tsx
  - Left panel: conversation history list
  - Main area: messages with scroll to bottom
  - Bottom: text input + send button + voice placeholder
  - Context card: shows what AI knows about the user (goal, weak topics, streak)
  - Quick action buttons: "Explain a concept", "Quiz me", "Plan my day"

**Task 7.2.7** — Create AI Mentor page:
  - apps/web/src/app/(dashboard)/ai-mentor/page.tsx
  - Full-screen chat interface
  - Persistent conversation history

**Task 7.2.8** — Create fallback for when AI is unavailable:
  - If Gemini API fails: show "AI mentor is temporarily unavailable" message
  - Offer: "View your revision queue instead" link

#### Files Created

```
apps/server/src/
  services/ai/mentor.service.ts
  controllers/ai.controller.ts
  routes/ai.routes.ts

apps/web/src/
  components/ai/
    AiMentorChat.tsx
    AiMessageBubble.tsx
    AiStreamingText.tsx
  hooks/useAiCoach.ts
  lib/api/ai.api.ts
  app/(dashboard)/ai-mentor/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(ai): add AI mentor chat with Gemini streaming and conversation history"
```

#### Expected Output
- AI Mentor page shows chat interface
- Sending a message gets an AI response
- Response streams in token by token
- Conversation is saved and appears in history

#### Tests Before Moving On
- [ ] Send a message → AI responds (verify Gemini API is being called)
- [ ] Streaming works — text appears progressively, not all at once
- [ ] Conversation is saved to Firestore: users/{uid}/aiConversations/{id}/messages/
- [ ] Context card shows user's actual weak topics (not placeholder)
- [ ] AI unavailable fallback shows correctly when GEMINI_API_KEY is wrong

---

### MILESTONE 7.3 — AI Concept Explainer & Study Plan

**Estimated Time:** 2 days
**Depends On:** Milestone 7.2

#### Tasks (in order)

**Task 7.3.1** — Create concept explanation endpoint:
  - POST /api/v1/ai/explain
  - Body: { topicId, concept, explanationType: "simple" | "technical" | "analogy" | "code" }
  - Uses CONCEPT_EXPLAINER prompt + user's current understanding level

**Task 7.3.2** — Create AiInsightCard component:
  - apps/web/src/components/ai/AiInsightCard.tsx
  - Shows a single AI insight with type: recommendation | warning | celebration | tip
  - Used on dashboard and topic pages
  - "Ask AI Coach" button links to chat with that topic pre-filled

**Task 7.3.3** — Create study plan generation endpoint:
  - POST /api/v1/ai/study-plan
  - Generates a 7-day plan based on user context, goal, and deadline
  - Returns structured plan: array of { day, topics[], estimatedMinutes, focus }

**Task 7.3.4** — Create AiStudyPlanCard component:
  - apps/web/src/components/ai/AiStudyPlanCard.tsx
  - Renders the AI-generated 7-day plan
  - Each day shows topic list and estimated time
  - "Apply to Planner" button (placeholder for Phase 10)

**Task 7.3.5** — Add "Ask AI" button to Topic detail page:
  - Opens AI chat pre-filled with: "Explain [topic title] to me"
  - AI knows the topic's current understanding score

#### Files Created

```
apps/web/src/components/ai/
  AiInsightCard.tsx
  AiStudyPlanCard.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(ai): add concept explainer and AI study plan generation"
```

---

## PHASE 8 — RAG PIPELINE & QUIZ GENERATION

**Duration:** Week 11–13
**Type:** MVP
**Goal:** Retrieval-Augmented Generation for quiz generation from user notes.
         Chunking, embedding, similarity search, grounded quiz creation.

---

### MILESTONE 8.1 — Embedding Pipeline

**Estimated Time:** 2–3 days
**Depends On:** Phase 7 complete

#### Tasks (in order)

**Task 8.1.1** — Create text chunking utility:
  - apps/server/src/lib/utils/chunker.ts
  - splitIntoChunks(text, maxTokens=500, overlap=50): string[]
  - Splits at sentence boundaries (not mid-sentence)
  - Respects token limit (estimate: 1 token ≈ 4 characters)
  - Returns empty array for text < 50 tokens

**Task 8.1.2** — Add generateEmbedding() to GeminiService:
  - Uses text-embedding-004 model
  - Input: string, Output: number[] (768 dimensions)

**Task 8.1.3** — Create embedding service:
  - apps/server/src/services/ai/embedding.service.ts
  - embedNote(userId, noteId, content): chunks → embeds → stores in Firestore
  - Each chunk stored at: users/{uid}/notes/{noteId}/chunks/{chunkId}
  - Chunk document: { content, embedding, chunkIndex, tokenCount, noteId, topicId }

**Task 8.1.4** — Create cosine similarity utility:
  - apps/server/src/lib/utils/similarity.ts
  - cosineSimilarity(vec1: number[], vec2: number[]): number (0 to 1)
  - findTopK(queryEmbedding, chunks, k=5): returns top-K most similar chunks

**Task 8.1.5** — Trigger embedding when note is saved:
  - In notes.service.ts: after saving a note, call embedding.service.embedNote()
  - Run embedding asynchronously (do not block the save response)
  - Only re-embed if note content changed by more than 20%

**Task 8.1.6** — Create RAG retrieval service:
  - apps/server/src/services/ai/rag.service.ts
  - retrieveContext(userId, topicId, query, k=5):
    1. Generate query embedding
    2. Fetch all chunks for the topic
    3. Calculate cosine similarity for each
    4. Return top-K chunks with similarity score
    5. Filter: only return chunks with score > 0.65

#### Files Created

```
apps/server/src/
  lib/utils/
    chunker.ts
    similarity.ts
  services/ai/
    embedding.service.ts
    rag.service.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(rag): implement text chunking, embedding pipeline, and similarity retrieval"
```

#### Tests Before Moving On
- [ ] splitIntoChunks("Hello world. This is a test.", 10) returns correct chunks
- [ ] generateEmbedding("Binary search") returns array of 768 numbers
- [ ] Saving a note creates chunk documents in Firestore under notes/{id}/chunks/
- [ ] cosineSimilarity([1,0], [1,0]) returns 1.0 (identical vectors)
- [ ] cosineSimilarity([1,0], [0,1]) returns 0.0 (orthogonal vectors)

---

### MILESTONE 8.2 — Quiz Generation

**Estimated Time:** 2–3 days
**Depends On:** Milestone 8.1

#### Tasks (in order)

**Task 8.2.1** — Create quiz generation service:
  - apps/server/src/services/ai/quiz.service.ts
  - generateQuiz(userId, topicId, questionCount=5):
    1. Call rag.service.retrieveContext() to get relevant note chunks
    2. If no chunks score > 0.65: return RAG_CONTEXT_EMPTY error
    3. Build quiz prompt with retrieved chunks + QUIZ_GENERATION prompt
    4. Call Gemini Pro model (more accurate for structured output)
    5. Parse response as JSON array of questions
    6. Validate with Zod schema
    7. Cache result in Firestore (same content hash = same quiz)

**Task 8.2.2** — Create quiz types and Zod schema:
  - packages/shared/src/types/quiz.types.ts
  - QuizQuestion: { question, options[4], correctAnswerIndex, explanation, difficulty }
  - packages/shared/src/schemas/quiz.schema.ts

**Task 8.2.3** — Create quiz routes and controller:
  - POST /api/v1/ai/quiz/:topicId
  - Body: { questionCount?: 5 }
  - Rate limited: 10 per hour per user
  - Requires topics to have notes with sufficient content

**Task 8.2.4** — Create AiQuizCard component:
  - apps/web/src/components/ai/AiQuizCard.tsx
  - Shows: question text, 4 answer options (buttons)
  - On answer click: reveals correct/incorrect + explanation
  - Progress: "Question 3 of 5"
  - Score at end: "You got 4/5 correct"

**Task 8.2.5** — Create quiz session flow:
  - "Generate Quiz" button on Topic detail page
  - Loading state: "Analyzing your notes..."
  - If no notes: "Add notes to this topic first to generate a quiz"
  - Quiz session: one question at a time, with animations
  - Score updates Understanding Score after completing the quiz

**Task 8.2.6** — Create Quiz results component:
  - Shows final score, which questions were wrong
  - AI explanation for missed questions
  - "Study these concepts" — links to relevant note sections

#### Files Created

```
packages/shared/src/
  types/quiz.types.ts
  schemas/quiz.schema.ts

apps/server/src/
  services/ai/quiz.service.ts
  controllers/quiz.controller.ts (or add to ai.controller.ts)
  routes/quiz.routes.ts (or add to ai.routes.ts)

apps/web/src/
  components/ai/AiQuizCard.tsx
  hooks/useQuiz.ts
  lib/api/quiz.api.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(rag): add AI quiz generation from user notes using RAG pipeline"
```

#### Tests Before Moving On
- [ ] Add notes to a topic, then click Generate Quiz
- [ ] Quiz generates 5 multiple-choice questions
- [ ] Questions are grounded in your notes (not generic knowledge)
- [ ] Answering questions updates the Understanding Score
- [ ] If no notes: shows helpful message instead of error
- [ ] Rate limit works: trying to generate more than 10 quizzes per hour is blocked

---

## PHASE 9 — ANALYTICS, GAMIFICATION & DASHBOARD

**Duration:** Week 13–15
**Type:** MVP
**Goal:** The analytics dashboard, gamification system (XP, streaks, achievements),
         and the pre-computed dashboard data model.

---

### MILESTONE 9.1 — Gamification Engine

**Estimated Time:** 2 days
**Depends On:** Phase 8 complete

#### Tasks (in order)

**Task 9.1.1** — Create gamification types:
  - packages/shared/src/types/gamification.types.ts
  - UserXp, Streak, Achievement, UserAchievement interfaces

**Task 9.1.2** — Create XP transaction system:
  - apps/server/src/services/gamification.service.ts
  - awardXp(userId, amount, type, referenceId): writes xpTransactions document, updates userXp
  - XP rewards table (defined as constants):
    - topic_complete: 50 XP * difficulty multiplier
    - quiz_pass (score >= 80%): 100 XP
    - sr_review: 20 XP
    - streak (daily): 10 XP * streak day
    - milestone: 200 XP
  - calculateLevel(totalXp): returns { level, levelName, xpToNextLevel }

**Task 9.1.3** — Create streak system:
  - In gamification.service.ts:
  - updateStreak(userId): called after every study session
  - Logic: if last active was yesterday → increment, if today → no change, else → reset to 1
  - Rest day: once per week, user can "use a rest day" — streak does not break
  - Store: users/{uid} document fields: currentStreak, longestStreak, lastActiveDate

**Task 9.1.4** — Create achievement definitions:
  - apps/server/src/lib/constants/achievements.ts
  - Define 15 achievements with: slug, name, description, xpReward, criteria, rarity
  - Examples: first-session, 7-day-streak, topic-mastered, 10-quizzes, first-100-xp

**Task 9.1.5** — Create achievement checker service:
  - In gamification.service.ts: checkAchievements(userId)
  - Runs after every significant action (session end, quiz complete, etc.)
  - Checks all criteria, unlocks new achievements, awards XP

**Task 9.1.6** — Integrate gamification into session completion flow:
  - After session.service creates a session: call gamification.service.awardXp()
  - After session: call updateStreak() and checkAchievements()

#### Files Created

```
packages/shared/src/types/gamification.types.ts

apps/server/src/
  services/gamification.service.ts
  lib/constants/achievements.ts
  controllers/gamification.controller.ts
  routes/gamification.routes.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(gamification): add XP system, streak tracking, and achievement engine"
```

---

### MILESTONE 9.2 — Gamification UI Components

**Estimated Time:** 2 days
**Depends On:** Milestone 9.1

#### Tasks (in order)

**Task 9.2.1** — Create StreakCounter component:
  - apps/web/src/components/gamification/StreakCounter.tsx
  - Shows: fire emoji, current streak number, longest streak
  - Pulsing animation on streak milestones
  - Visible in sidebar and dashboard

**Task 9.2.2** — Create XpBar component:
  - apps/web/src/components/gamification/XpBar.tsx
  - Shows: current level, level name, progress bar to next level
  - Animates XP bar fill when new XP is earned

**Task 9.2.3** — Create AchievementCard component:
  - apps/web/src/components/gamification/AchievementCard.tsx
  - Locked state: grayed out with lock icon
  - Unlocked state: colored icon, name, description
  - Legendary achievements: glowing purple border

**Task 9.2.4** — Create achievement unlock celebration:
  - When an achievement is unlocked: pop-up toast notification
  - Celebration animation: scale in + fade (Framer Motion)
  - Shows: achievement icon, name, XP reward

**Task 9.2.5** — Create Achievements page:
  - apps/web/src/app/(dashboard)/achievements/page.tsx
  - Level display at top
  - Unlocked achievements (colored)
  - In-progress achievements (progress bar)
  - Locked achievements (grayed)

#### Files Created

```
apps/web/src/
  components/gamification/
    StreakCounter.tsx
    XpBar.tsx
    AchievementCard.tsx
  app/(dashboard)/achievements/page.tsx
  hooks/useGamification.ts
  lib/api/gamification.api.ts
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(gamification): add XP bar, streak counter, and achievements page"
```

---

### MILESTONE 9.3 — Analytics Dashboard

**Estimated Time:** 3 days
**Depends On:** Milestones 9.1, 9.2

#### Tasks (in order)

**Task 9.3.1** — Build dashboard data aggregation service:
  - Expand apps/server/src/services/analytics.service.ts
  - computeDashboardSnapshot(userId): returns full DashboardData object
  - Reads: topic progress, sessions, streak, xp, weak topics
  - Computes: completion %, understanding %, gap, weak topic list, AI insight

**Task 9.3.2** — Create dashboard snapshot storage:
  - After session end: call analytics.service.computeDashboardSnapshot()
  - Store result in: users/{uid}/dashboardSnapshot document (field: latest)
  - Dashboard page reads this snapshot (never computes on request)

**Task 9.3.3** — Create analytics API endpoints:
  - GET /api/v1/analytics/dashboard — returns pre-computed snapshot
  - GET /api/v1/analytics/heatmap — 90 days activity
  - GET /api/v1/analytics/topics — per-topic understanding scores

**Task 9.3.4** — Build DashboardStats component:
  - apps/web/src/components/dashboard/DashboardStats.tsx
  - 5 stat cards: study hours, understanding growth, reviews done, topics studied, readiness %
  - Animated count-up numbers (Framer Motion)

**Task 9.3.5** — Build WeaknessRadar component:
  - apps/web/src/components/dashboard/WeaknessRadar.tsx
  - Shows top 3 weakest topics (by understanding score)
  - Each with: topic name, score bar, "Study this" button
  - AI-generated reason (from snapshot)

**Task 9.3.6** — Build TodaysPlan component:
  - apps/web/src/components/dashboard/TodaysPlan.tsx
  - Shows: new topics to study (max 3) + revision queue items
  - Each item: topic name, type (new/revision), estimated time, start button
  - Dynamically generated from recommendation engine (see constitution section 32)

**Task 9.3.7** — Build UnderstandingChart component:
  - apps/web/src/components/analytics/UnderstandingChart.tsx
  - Recharts line chart: understanding score over time per topic
  - Selectable by topic from dropdown

**Task 9.3.8** — Assemble the complete Dashboard page:
  - apps/web/src/app/(dashboard)/dashboard/page.tsx
  - Layout follows constitution section 33.1 information hierarchy:
    1. TodaysPlan (top-left, most prominent)
    2. DualProgressBar (understanding vs completion)
    3. StreakCounter + ActivityHeatmap
    4. WeaknessRadar
    5. AiInsightCard (bottom)

**Task 9.3.9** — Build Analytics page:
  - apps/web/src/app/(dashboard)/analytics/page.tsx
  - DashboardStats row
  - UnderstandingChart
  - Time distribution (bar chart by day of week)
  - Topic progress table (all topics with scores)

#### Files Created

```
apps/server/src/services/analytics.service.ts  (full version)

apps/web/src/
  components/dashboard/
    DashboardStats.tsx
    TodaysPlan.tsx
    WeaknessRadar.tsx
  components/analytics/
    UnderstandingChart.tsx
    TimeDistributionChart.tsx
  app/(dashboard)/
    dashboard/page.tsx  (complete version)
    analytics/page.tsx
```

#### Git Commit Checkpoint

```bash
git add .
git commit -m "feat(analytics): complete dashboard with stats, charts, and today's plan"
```

#### Tests Before Moving On
- [ ] Dashboard loads in under 2 seconds (reading from snapshot)
- [ ] TodaysPlan shows correct topics based on SR queue and roadmap order
- [ ] DualProgressBar shows correct gap between completion and understanding
- [ ] ActivityHeatmap shows session data for past 90 days
- [ ] WeaknessRadar shows the 3 topics with lowest understanding scores
- [ ] Analytics page charts render correctly with real data

---

## PHASE 10 — STUDY PLANNER & CALENDAR (FUTURE)

**Duration:** Post-MVP
**Type:** Future Feature
**Goal:** AI-generated study schedules synced to a calendar view.
         Daily and weekly planner with time blocking.

---

### MILESTONE 10.1 — Study Planner (Future)

**Estimated Time:** 3–4 days
**Type:** Future

#### Overview (implement after MVP is stable)

**Features to build:**
- AI generates a 7-day or 30-day study schedule
- Calendar grid view showing planned topics per day
- Drag-and-drop rescheduling
- Integration with Google Calendar (webhook-based, not mandatory)
- Pomodoro session blocks on calendar
- "Plan today" quick action from dashboard

#### Files to Create (when building)

```
apps/server/src/
  services/planner.service.ts
  controllers/planner.controller.ts
  routes/planner.routes.ts

apps/web/src/
  components/planner/ (all planner-specific components)
  app/(dashboard)/planner/page.tsx
  app/(dashboard)/calendar/page.tsx
```

#### Dependency Note
- Requires Phase 7 AI integration to be fully working
- Study plan generation endpoint must be stable

---

## PHASE 11 — RECOMMENDATION ENGINE & WELLNESS (FUTURE)

**Duration:** Post-MVP
**Type:** Future Feature
**Goal:** Advanced priority scoring, burnout detection, mood analysis, growth journal.

---

### MILESTONE 11.1 — Advanced Recommendation Engine (Future)

**Estimated Time:** 2–3 days
**Type:** Future

#### Overview

Priority Score Formula (from constitution section 32):
```
PRIORITY_SCORE = (0.35 * URGENCY) + (0.30 * WEAKNESS) + (0.20 * DEPENDENCY) + (0.15 * RECENCY)
```
- Computed for every topic
- Sorted to produce "What to study next" list
- Currently the basic version is in analytics.service.ts (dashboard TodaysPlan)
- Advanced version uses all 4 components of the formula

---

### MILESTONE 11.2 — Burnout Detection & Wellness (Future)

**Estimated Time:** 3–4 days
**Type:** Future

#### Features to build:
- Burnout Risk Score (0-100) computed from study intensity + mood trend + performance trend
- Mood log visualization (14-day trend chart)
- Growth journal with AI-generated prompts
- Breathing exercise modal
- Burnout badge in sidebar (LOW/MEDIUM/HIGH/CRITICAL)

---

## PHASE 12 — POLISH, TESTING & PRODUCTION DEPLOYMENT

**Duration:** Week 15–16
**Type:** MVP (Required before going live)
**Goal:** Performance optimization, accessibility audit, Firestore security rules,
         final testing, and deploying to Vercel + Render.

---

### MILESTONE 12.1 — Performance & Accessibility Audit

**Estimated Time:** 2 days
**Depends On:** All MVP phases complete

#### Tasks (in order)

**Task 12.1.1** — Run Lighthouse audit on key pages:
  - Run: npx lighthouse http://localhost:3000/dashboard --output html
  - Target scores: Performance > 80, Accessibility > 90, Best Practices > 90
  - Fix all issues before continuing

**Task 12.1.2** — Add dynamic imports for heavy components:
  - Wrap UnderstandingChart, ActivityHeatmap, AiMentorChat with dynamic()
  - Add loading: () => <ChartSkeleton /> to each

**Task 12.1.3** — Add missing loading.tsx files:
  - Add to: dashboard/, semesters/, subjects/, analytics/, revision/, ai-mentor/

**Task 12.1.4** — Audit keyboard navigation:
  - Tab through every page — verify every element is reachable
  - Verify focus rings are visible on all interactive elements
  - Fix any missing aria-label attributes

**Task 12.1.5** — Audit color contrast:
  - Use axe DevTools Chrome extension
  - Fix any contrast failures

**Task 12.1.6** — Add prefers-reduced-motion guard to all animations:
  - Use useReducedMotion() from Framer Motion in every animated component

---

### MILESTONE 12.2 — Firestore Security Rules

**Estimated Time:** 1 day
**Depends On:** Milestone 12.1

#### Tasks (in order)

**Task 12.2.1** — Write Firestore security rules:
  - Create firestore.rules file in project root
  - Rule: users/{userId} — read/write only if request.auth.uid == userId
  - Rule: users/{userId}/{...} — same ownership check for all subcollections
  - Rule: roadmapTemplates/{...} — read: any authenticated user, write: never from client
  - Rule: achievementDefinitions/{...} — read only

**Task 12.2.2** — Test security rules with Firebase Emulator:
  - Run: firebase emulators:start
  - Test: authenticated user can read their own data
  - Test: authenticated user CANNOT read another user's data
  - Test: unauthenticated user cannot read any data

**Task 12.2.3** — Deploy security rules:
  - Run: firebase deploy --only firestore:rules
  - Verify in Firebase console: Rules tab shows new rules

**Task 12.2.4** — Switch Firestore from test mode to locked mode:
  - The deployed rules now govern all access
  - Test the live app — verify everything still works

#### Git Commit Checkpoint

```bash
git add firestore.rules
git commit -m "security: add Firestore security rules for production"
```

---

### MILESTONE 12.3 — Unit Tests

**Estimated Time:** 2 days
**Depends On:** Milestone 12.2

#### Tasks (in order)

**Task 12.3.1** — Install Vitest:
  - In apps/server/: npm install -D vitest
  - In apps/server/: create vitest.config.ts

**Task 12.3.2** — Write tests for all pure utility functions:
  - sr.test.ts — SM-2 algorithm (all quality ratings, boundary conditions)
  - score.test.ts — understanding score calculation
  - chunker.test.ts — text chunking (empty, short, long inputs)
  - similarity.test.ts — cosine similarity (identical, orthogonal, random vectors)
  - response.test.ts — API response builder format

**Task 12.3.3** — Write tests for Zod schemas:
  - Test each schema with valid and invalid inputs
  - Verify error messages are user-friendly

**Task 12.3.4** — Write middleware tests:
  - auth.middleware.test.ts — valid token, expired token, missing token, malformed
  - validate.middleware.test.ts — valid body, invalid body
  - error.middleware.test.ts — AppError, unknown error, validation error

**Task 12.3.5** — Add test script to CI:
  - Update .github/workflows/ci.yml to run: npm run test
  - All tests must pass before merge is allowed

#### Git Commit Checkpoint

```bash
git add .
git commit -m "test: add unit tests for SR algorithm, score calculator, and middleware"
```

#### Tests Before Moving On
- [ ] npx vitest run shows all tests passing
- [ ] CI workflow runs tests and shows green checkmark

---

### MILESTONE 12.4 — Frontend Deployment (Vercel)

**Estimated Time:** 1 day
**Depends On:** Milestones 12.1, 12.2, 12.3

#### Tasks (in order)

**Task 12.4.1** — Create Vercel account and import repository:
  - Go to vercel.com → New Project → Import from GitHub → select aelpt
  - Select framework: Next.js (auto-detected)
  - Root directory: apps/web

**Task 12.4.2** — Configure environment variables in Vercel dashboard:
  - Add all NEXT_PUBLIC_FIREBASE_* variables from .env.example
  - Add NEXT_PUBLIC_API_BASE_URL pointing to Render backend URL

**Task 12.4.3** — Deploy and verify:
  - Trigger first deployment (Vercel auto-deploys)
  - Visit the .vercel.app URL
  - Test: login, navigate pages, verify no 404s or console errors

**Task 12.4.4** — Configure custom domain (optional):
  - In Vercel dashboard: Domains → Add Domain → follow DNS instructions

---

### MILESTONE 12.5 — Backend Deployment (Render)

**Estimated Time:** 1 day
**Depends On:** Milestone 12.4

#### Tasks (in order)

**Task 12.5.1** — Create Render account and new Web Service:
  - Go to render.com → New → Web Service → Connect GitHub → select aelpt
  - Root directory: apps/server
  - Build command: npm install && npm run build
  - Start command: npm run start

**Task 12.5.2** — Configure environment variables in Render dashboard:
  - Add all server environment variables from .env.example
  - Set: NODE_ENV=production
  - Set: ALLOWED_ORIGINS to your Vercel app URL

**Task 12.5.3** — Deploy and verify:
  - Trigger first deployment
  - Visit: https://your-app.onrender.com/api/v1/health
  - Should return: { status: "ok", version: "1.0.0" }

**Task 12.5.4** — Handle Render cold start:
  - Add frontend loading message when first API call takes > 5 seconds
  - Show: "Server is waking up — this takes ~30 seconds on first load"

**Task 12.5.5** — Test full production deployment:
  - Visit Vercel frontend URL
  - Sign up with a new account
  - Create a semester, subject, topic
  - Log a study session
  - Start the AI mentor chat
  - Verify everything works end-to-end on production

#### Git Commit Checkpoint

```bash
git add .
git commit -m "chore: production deployment configuration for Vercel and Render"
```

---

## FINAL DEPLOYMENT CHECKLIST

Before announcing the product as ready, verify ALL items below:

### Code Quality
- [ ] npx tsc --noEmit passes with 0 errors (both web and server)
- [ ] npx eslint . passes with 0 errors (both web and server)
- [ ] npx vitest run passes all tests
- [ ] No console.log statements in production code (search: grep -r "console.log" apps/)
- [ ] No TODO comments referencing unimplemented critical features
- [ ] No any types in TypeScript code (search: grep -r ": any" apps/)

### Security
- [ ] Firestore security rules deployed (NOT in test mode)
- [ ] .env and .env.local are NOT in GitHub (check: git log -- .env)
- [ ] Firebase service account JSON file is deleted
- [ ] CORS is configured with explicit allowlist (not *)
- [ ] All API routes use authMiddleware (check each route file)
- [ ] Rate limiting is enabled on AI endpoints
- [ ] No API keys in frontend code or public folder

### Firebase & Database
- [ ] Firestore has production security rules deployed
- [ ] Firebase project for production is separate from dev project
- [ ] Firestore indexes created for all compound queries
- [ ] Firebase Storage rules are locked down

### Performance
- [ ] Lighthouse performance score > 80 on Dashboard and AI Mentor pages
- [ ] Heavy components use dynamic imports (charts, AI chat)
- [ ] All pages have loading.tsx files
- [ ] Images use next/image (no raw img tags)

### Functionality
- [ ] Sign up flow works (new user + Firestore profile created)
- [ ] Login with email/password works
- [ ] Login with Google OAuth works
- [ ] Sign out works and redirects to /login
- [ ] Refreshing browser keeps user logged in
- [ ] Create Semester → Subject → Unit → Topic flow works
- [ ] Study session logging works and updates Understanding Score
- [ ] Revision queue shows due topics
- [ ] Flashcard review with SM-2 updates next review date
- [ ] AI Mentor chat works and streams responses
- [ ] RAG quiz generates questions from user notes
- [ ] Dashboard shows correct stats

### Accessibility
- [ ] Lighthouse accessibility score > 90
- [ ] All pages navigable by keyboard (tab through each page)
- [ ] Dark mode toggle works on all pages
- [ ] No color-only state indicators (always have text or icon)

### Deployment
- [ ] Frontend deployed to Vercel (not just localhost)
- [ ] Backend deployed to Render (not just localhost)
- [ ] Health check: https://your-backend.onrender.com/api/v1/health returns 200
- [ ] Environment variables set in both Vercel and Render dashboards
- [ ] No localhost URLs in production code
- [ ] Render cold start message implemented in frontend

### Monitoring
- [ ] Sentry (or basic error logging) set up for production errors
- [ ] Backend logs are visible in Render dashboard
- [ ] Firebase console monitoring enabled

---

## MILESTONE SUMMARY TABLE

| Milestone | Name | Phase | Est. Time | Status |
|-----------|------|-------|-----------|--------|
| 0.1 | Monorepo Initialization | 0 | 1-2 days | |
| 0.2 | Frontend Scaffolding | 0 | 1-2 days | |
| 0.3 | Backend Scaffolding | 0 | 1-2 days | |
| 0.4 | Shared Package + Firebase | 0 | 1 day | |
| 1.1 | Backend Auth Middleware | 1 | 1 day | |
| 1.2 | Frontend Auth Pages | 1 | 2-3 days | |
| 1.3 | Protected Routes + Profile | 1 | 1-2 days | |
| 2.1 | Sidebar Navigation | 2 | 2 days | |
| 2.2 | Common Components | 2 | 1-2 days | |
| 3.1 | Types & Schemas | 3 | 1 day | |
| 3.2 | Semester Management | 3 | 2 days | |
| 3.3 | Subject, Unit & Topic | 3 | 3-4 days | |
| 4.1 | Understanding Score Engine | 4 | 2 days | |
| 4.2 | Study Session Logger | 4 | 2 days | |
| 4.3 | Activity Heatmap | 4 | 1 day | |
| 5.1 | SM-2 Algorithm | 5 | 2 days | |
| 5.2 | Revision Queue UI | 5 | 2 days | |
| 5.3 | Flashcard System | 5 | 2-3 days | |
| 6.1 | Notes System | 6 | 2 days | |
| 6.2 | Resources + YouTube | 6 | 2 days | |
| 7.1 | Gemini Service Layer | 7 | 2 days | |
| 7.2 | AI Mentor Chat | 7 | 2-3 days | |
| 7.3 | Explainer + Study Plan | 7 | 2 days | |
| 8.1 | Embedding Pipeline | 8 | 2-3 days | |
| 8.2 | Quiz Generation | 8 | 2-3 days | |
| 9.1 | Gamification Engine | 9 | 2 days | |
| 9.2 | Gamification UI | 9 | 2 days | |
| 9.3 | Analytics Dashboard | 9 | 3 days | |
| 10.1 | Study Planner | 10 | 3-4 days | Future |
| 11.1 | Recommendation Engine | 11 | 2-3 days | Future |
| 11.2 | Wellness & Burnout | 11 | 3-4 days | Future |
| 12.1 | Performance & A11y Audit | 12 | 2 days | |
| 12.2 | Firestore Security Rules | 12 | 1 day | |
| 12.3 | Unit Tests | 12 | 2 days | |
| 12.4 | Frontend Deployment | 12 | 1 day | |
| 12.5 | Backend Deployment | 12 | 1 day | |

---

## COMMON MISTAKES REFERENCE

### Biggest Mistakes to Avoid

| # | Mistake | Prevention |
|---|---------|-----------|
| 1 | Committing .env or service account JSON | Check git status before EVERY commit |
| 2 | Skipping --app flag in create-next-app | Run command exactly as shown |
| 3 | String literals for Firestore collections | Always import from COLLECTIONS constants |
| 4 | Calling Gemini API from frontend | All AI calls through Express backend only |
| 5 | Not testing TypeScript after changes | Run tsc --noEmit after every milestone |
| 6 | Using any type | Enable noImplicitAny in tsconfig and obey it |
| 7 | Forgetting auth middleware on new routes | Check every new route file before committing |
| 8 | Fetching entire Firestore collections | Always use where() clauses + limit() |
| 9 | Not having fallbacks for AI features | Every AI feature has a non-AI backup |
| 10 | Skipping empty and loading states | Every async list has loading AND empty states |
| 11 | Making components too large (> 200 lines) | Split into smaller components |
| 12 | Using default exports for components | Named exports always (constitution rule) |
| 13 | Not running the app after each task | Test after every task, not just milestones |
| 14 | Using the production Firebase project for dev | Separate dev and prod Firebase projects |
| 15 | Building Phase 2 before Phase 1 works | Never skip phases. Dependencies matter. |

---

## TECH DEBT TRACKER

Keep track of shortcuts taken during MVP that must be fixed later:

| # | Location | Shortcut Taken | Must Fix By |
|---|----------|----------------|-------------|
| 1 | Firestore vector search | In-memory similarity (loads all chunks) | Before 1000+ notes |
| 2 | Dashboard snapshot | Computed on session end only | Add scheduled compute |
| 3 | Note editor | Simple textarea (not full rich text) | Phase 10 polish |
| 4 | AI memory | No persistent memory across conversations | Add ai_memory collection |
| 5 | Mobile nav | No bottom tab bar (desktop sidebar only) | Before mobile launch |
| 6 | YouTube embedding | No progress tracking of watched % | Add in Phase 10 |

---

*End of DEVELOPMENT_ROADMAP.md — Version 1.0.0*
*Document governs the implementation sequence for AELPT.*
*Created: June 30, 2026 | Next review: After Phase 3 completion*
