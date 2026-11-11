# Frontend Command Center

React-based frontend for THEHIVE ecosystem.

## Quick Start

npm install
npm run dev

## Local development — point at the live Worker

There is no local backend. Local dev reads the live Cloudflare Worker:

```sh
VITE_API_BASE_URL=https://thehive.sovereignhive.workers.dev npm run dev
```

Without `VITE_API_BASE_URL` the app reads same-origin (`''`), and the Vite
dev server has no `/v11` routes — so the app reads OFFLINE. Never point the
base at `localhost:8080`: the Jasper backend that used to answer there runs
nowhere. The production build (`npm run build:app`, output `../docs/app`)
uses same-origin by default; `pages.yml` rebuilds `docs/app/` when a
`frontend/` change merges to main.

## Scripts
- dev: Start development server
- build: Build for production
- preview: Preview production build

## Features
- Constitution Visualizer
- Mission Timeline
- Memory Graph Enhanced
- Tesseract Renderer
- Constitutional Documents
- Live Arena Viewer
- Phaser 3 Integration
