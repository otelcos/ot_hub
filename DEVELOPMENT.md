# Website Development Guide

## Quick Start

```bash
cd website
npm install    # First time only
npm start      # Starts dev server at http://localhost:3000/
```

## Prerequisites

- Node.js >= 20.0

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server with hot reload |
| `npm run build` | Build static site to `build/` directory |
| `npm run serve` | Serve the production build locally |
| `npm run clear` | Clear Docusaurus cache |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run deploy` | Deploy to GitHub Pages |

## Tech Stack

- **Framework**: Docusaurus 3.9.2
- **UI**: React 19
- **Language**: TypeScript
- **Charts**: Recharts

## Project Structure

```
website/
├── src/
│   ├── pages/           # React pages (index.tsx, leaderboard.tsx)
│   ├── components/      # Reusable React components
│   ├── hooks/           # Custom React hooks
│   └── css/             # Global styles
├── tabs/                # Tab-based content (research, leaderboard, resources, blog)
├── static/              # Static assets (images, files)
├── docusaurus.config.ts # Main configuration
└── build/               # Production output (generated)
```

## Deployment

The site is deployed to https://opentelco.io

To deploy manually:
```bash
npm run build
npm run deploy
```
