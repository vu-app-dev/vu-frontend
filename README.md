<div align="center">
  <img src="./public/vu.svg" alt="VU logo" width="88" />

# VU Frontend

The web experience for VU's recruiter workspace and candidate interview journey.

[![Live app](https://img.shields.io/badge/Live_App-vuapp.dev-ff5d31)](https://vuapp.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
</div>

## Overview

VU Frontend is a React single-page application with three distinct surfaces:

- A public product landing page.
- An authenticated hiring workspace for candidates, jobs, interview mocks, company members, and settings.
- A candidate-facing application and real-time interview flow.

The UI talks to the NestJS backend for platform data and to the FastAPI AI service for interview lifecycle events, speech-to-text, and WebSocket updates.

## Highlights

- Role-aware recruiter dashboard with protected routes and permissions.
- Candidate pipeline, filtering, analytics, CV analysis, detailed feedback, and interview replay.
- Job and mock configuration with reusable evaluation criteria and public application links.
- Candidate setup checks, microphone streaming, camera frames, tab-switch events, and live interview state.
- Company membership, join requests, profile management, and workspace settings.
- Dark/light semantic design tokens and reusable UI components.
- Route-level code splitting, loading states, and error boundaries.
- Responsive landing experience with React Three Fiber, OGL, GSAP, Motion, and Lenis.

## Technology

| Area | Libraries |
| --- | --- |
| Application | React 19, React Router 7, Vite 7 |
| UI and motion | Framer Motion, Motion, GSAP, Lenis, Lucide |
| Visuals | Three.js, React Three Fiber, Drei, OGL |
| Data visualization | Recharts 3 |
| Media | HLS.js, browser Media APIs, WebSockets |
| Quality | ESLint 9, PropTypes |
| Production image | Multi-stage Node 20 + nginx |

## Getting started

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- Running VU backend and AI services, or access to deployed instances

### Install and run

```bash
git clone https://github.com/vu-app-dev/vu-frontend.git
cd vu-frontend
npm ci
cp .env.example .env
npm run dev
```

The development server starts at [http://localhost:5173](http://localhost:5173).

For a fully integrated local environment, use the [`vu-app`](https://github.com/vu-app-dev/vu-app) Docker Compose repository.

## Environment

All browser configuration uses Vite's `VITE_` prefix:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Authenticated backend API base URL |
| `VITE_PUBLIC_API_ORIGIN` | Public backend origin used by application links and uploads |
| `VITE_AI_SERVICE_URL` | AI service HTTP origin; the client derives `ws://` or `wss://` for realtime sessions |

For local service development:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
VITE_PUBLIC_API_ORIGIN=http://localhost:3000
VITE_AI_SERVICE_URL=http://localhost:8000
```

> [!CAUTION]
> Values prefixed with `VITE_` are bundled into browser code. Never store secrets, database URLs, or private API keys in frontend environment files.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

There is no automated frontend test runner configured yet; the current pre-push checks are linting and a production build.

## Architecture

```text
src/
├── App.jsx                  # Routes, lazy loading, and application shells
├── api/
│   ├── backend/             # REST client, endpoints, mappers, services, and store
│   ├── ai/                  # Interview REST and WebSocket client
│   └── BackendProvider.jsx  # Authentication and workspace refresh orchestration
├── components/
│   ├── layout/              # Navigation, sidebar, shells, and error boundaries
│   ├── reactbits/           # Landing-page visual components
│   └── ui/                  # Shared design-system components
├── hooks/                   # Shared behavior
├── pages/                   # Landing, auth, dashboard, and application features
├── styles/                  # Global styles and semantic tokens
└── utils/                   # Theme, settings, display, and scoring helpers
```

`src/App.jsx` separates the landing, recruiter dashboard, and candidate application shells. Backend responses are normalized through `src/api/backend`, while `src/api/ai/client.js` owns interview sessions, realtime transcription, audio capture, and WebSocket messages.

## Project documentation

- [Product overview](./PRODUCT.md)
- [User flows](./USER_FLOWS.md)
- [Application flows](./APP_FLOWS.md)
- [Project context](./PROJECT_CONTEXT.md)
- [Project rules](./PROJECT_RULES.md)
- [Design-system color audit](./DESIGN_SYSTEM_COLOR_AUDIT.md)

## Related repositories

- [`vu-app`](https://github.com/vu-app-dev/vu-app) — full-stack local orchestration
- [`vu-backend`](https://github.com/vu-app-dev/vu-backend) — application API and persistence
- [`vu-ai`](https://github.com/vu-app-dev/vu-ai) — interview intelligence service
