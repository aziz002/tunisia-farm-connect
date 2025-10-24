# Tunisia Farm Connect (FarmHub)

Modern farm management dashboard with smart irrigation, livestock, marketplace, and an agentic AI assistant. Built with Vite + React + TypeScript + Tailwind + shadcn/ui.

## Features

- Responsive, collapsible sidebar with keyboard toggle (Ctrl/Cmd + B), cookie-persisted state
- Command palette (Ctrl/Cmd + K) for global actions and navigation
- Agentic AI assistant with quick suggestions and app-integrated tools (open pages, toggle theme/language, open schedule editor)
- Role-ready navigation and modular pages (Dashboard, Smart Irrigation, Livestock, Marketplace, My Tools)
- Theme and language switching (English/العربية) with direction support (LTR/RTL)
- Zustand-powered UI bus for cross-module actions

## Run locally

```sh
npm i
npm run dev
```

Build for production:

```sh
npm run build
npm run preview
```

## Shortcuts

- Toggle sidebar: Ctrl/Cmd + B
- Open command palette: Ctrl/Cmd + K

## Tech stack

- Vite, React 18, TypeScript
- Tailwind CSS, shadcn/ui, Radix Primitives
- Zustand, TanStack Query

## Project structure

- `src/components/ui/*`: Reusable UI primitives (shadcn)
- `src/components/AppSidebar.tsx`: Application sidebar composition
- `src/components/CommandMenu.tsx`: Command palette
- `src/components/AIAssistant.tsx`: AI assistant surface
- `src/hooks/*`: Auth and app stores
- `src/lib/*`: Plugins, API, integrations, types

## Notes

This is a POC that demonstrates navigation, modular pages, AI assistance, and a clean design system. Add your APIs and real data sources in `src/lib/api.ts` and extend modules in `src/lib/plugins.ts`.
