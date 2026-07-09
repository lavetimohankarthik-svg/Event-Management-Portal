# Recstacy — Frontend

React + Vite frontend for the Recstacy Event Management System, wired up
to the provided Express/MongoDB backend (with a couple of additions —
see **"Backend additions"** below).

## Tech stack & justification

| Category | Library | Why |
|---|---|---|
| Frontend | React 19 | Required by the assignment; component model fits the three-role dashboard structure well. |
| Build Tool | Vite | Fast dev server + HMR, minimal config, first-class React 19 support. |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first styling keeps the large number of pages visually consistent without a heavy component library. |
| Routing | React Router v7 | Nested routes map cleanly to the three role-based layouts (`/participant`, `/organizer`, `/admin`) and their guards. |
| API | Axios | Interceptors made it easy to attach the JWT to every request and handle 401s centrally (auto-logout). |
| Forms | React Hook Form + Zod + `@hookform/resolvers` | Schema-based validation for auth forms (email domain rules, password confirmation) with minimal re-renders. |
| Auth | JWT (localStorage) | Matches the backend's `protect`/`authorize` middleware; token is sent as `Authorization: Bearer <token>`. |
| State | React Context (`AuthContext`) | The only genuinely global state is "who's logged in" — Context is enough, no need for Redux/Zustand. |
| Charts | Recharts | Available for organizer analytics if you want to extend the dashboard with visual charts. |
| QR Code | Backend-generated (`qrcode` npm package server-side) rendered as an `<img>` | Simpler and avoids duplicating QR generation logic client + server; `qrcode.react` is still available if you'd rather generate client-side. |
| Real-time | `socket.io-client` **(added — not in the original package.json)** | Required for Team Chat (Tier B-3); the backend already depended on `socket.io` but never used it, so a client is needed to actually connect. |
| Icons | lucide-react | Consistent icon set, tree-shakeable. |
| Notifications | react-hot-toast | Lightweight toast notifications for success/error feedback. |
| Dialogs/overlays | radix-ui (`Dialog`) | Accessible, unstyled primitives for the ticket modal and the "organizer created" credentials modal. |
| Dates | date-fns | Formatting event dates/times and relative timestamps in chat. |
| Loading states | react-spinners | Simple spinner component for async states. |

## What's implemented

**Core system (Sections 3–12 of the brief):** registration/login with
role-based access, IIIT-domain validation, onboarding (interests +
follow clubs, skippable), all three role dashboards, event browse/search/
filter/trending, event details with registration (individual + team),
dynamic custom-form builder for Normal events, merchandise browse/
purchase, tickets with QR codes, profile pages (with password change),
clubs/organizers listing + follow, admin organizer provisioning, and
admin password-reset approval queue.

**Advanced features (Section 13) — as requested, only these two are
implemented:**

- **Tier B-3 — Team Chat** (`/participant/teams/:teamId/chat`): real-time
  messaging over Socket.IO once a team is fully registered (its Tier A-1
  dependency), with typing indicators and an online-members list.
- **Tier C-3 — Bot Protection**: Google reCAPTCHA v2 on both the Login
  and Register pages (`src/components/Captcha.jsx`), verified server-side
  before either request is processed.

All other Tier A/B/C features described in the brief (Discussion Forum,
Organizer Password-Reset *workflow* detail, QR Scanner & Attendance,
Feedback, Calendar export) are intentionally **not** built into the UI,
per your instructions — even though a couple of their backing routes
already existed in the backend zip.

## Backend additions (important)

The backend zip you gave me didn't yet have working code for the two
advanced features you asked to keep, so I added the minimum needed for
them to function, plus a few small missing pieces the core spec requires
(these existed as bugs/gaps independent of the two advanced features):

1. **Team Chat**: `models/Message.js`, `services/chatService.js`,
   `controllers/chatController.js`, `routes/chatRoutes.js`, and
   `config/socket.js` (Socket.IO server wired into `server.js`, JWT-
   authenticated the same way as REST).
2. **Bot Protection**: `middleware/captchaMiddleware.js`, applied to
   `/api/auth/register` and `/api/auth/login`. Uses Google's published
   test key by default — swap in real reCAPTCHA keys for production.
3. **Gaps filled that the core spec requires regardless of advanced
   tier choices**: self-service password change (`PUT /api/auth/password`),
   participant profile editing (`PUT /api/auth/me`), a `discordWebhook`
   field on the organizer profile, and ticket/QR generation on approved
   merchandise orders (the model had no `ticketId`/`qrCode` fields before).

See the updated `backend/` zip for all of this — it's a drop-in
replacement for what you uploaded.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your backend URL + reCAPTCHA keys
npm run dev
```

Environment variables (`.env`):

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RECAPTCHA_SITE_KEY=<your-google-recaptcha-v2-site-key>
```

The backend needs the matching `RECAPTCHA_SECRET_KEY` in its own `.env`
(already added with Google's test secret as a default — see
`backend/.env`).

## Project structure

```
src/
  lib/            axios client, socket.io client, utils, constants
  context/        AuthContext (session, login/logout)
  components/     shared UI primitives + feature components (FormBuilder,
                  DynamicForm, TeamPanel, TicketModal, Captcha, EventCard)
  components/layouts/  per-role NavBar + layout shells
  pages/auth/     Login, Register, Onboarding
  pages/participant/   Dashboard, BrowseEvents, EventDetails, Clubs,
                       ClubDetail, Teams, TeamChat, Profile, Merchandise
  pages/organizer/     Dashboard, CreateEvent (also handles Edit),
                       EventDetail, OngoingEvents, Merchandise, Profile
  pages/admin/         Dashboard, ManageOrganizers, PasswordResetRequests
```
