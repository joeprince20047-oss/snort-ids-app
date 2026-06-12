# SNORT IDS Monitoring Platform

A full-stack monitoring platform for **SNORT Intrusion Detection System** with a web dashboard (deployable on GitHub Pages) and a native Android companion app.

## Architecture

```
┌─────────────┐    syslog     ┌──────────┐    REST API    ┌──────────────┐
│ SNORT Sensor├──────────────►│ Backend  │◄──────────────►│  Web App     │
│ (IDS Mode)  │               │ Express  │                │  (React/TS)  │
└─────────────┘               └──────────┘                └──────┬───────┘
                                                                  │
                                                         ┌────────v──────┐
                                                         │  Android App  │
                                                         │  (Kotlin/CP)  │
                                                         └───────────────┘
```

## Project Structure

```
snort-ids-app/
├── web/                  # React web dashboard (GitHub Pages)
│   ├── src/
│   │   ├── components/   # Dashboard, AlertTable, StatsCards, Charts
│   │   ├── api/          # API client
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Mock data generator
│   └── .github/workflows/deploy.yml  # GitHub Pages auto-deploy
│
├── backend/              # Node.js Express API server
│   └── src/
│       ├── routes/       # REST endpoints
│       └── services/     # SNORT log parser
│
├── android/              # Native Android app
│   └── app/src/main/java/com/snortids/app/
│       ├── ui/           # Jetpack Compose screens
│       ├── data/         # Retrofit API + models
│       └── viewmodel/    # State management
│
└── .github/workflows/    # CI/CD pipelines
```

## Quick Start

### Web App (deployable to GitHub Pages)

```bash
cd web
npm install
npm run dev          # Development server at http://localhost:5173
npm run build        # Production build → web/dist/
```

### Backend API (optional, for live SNORT data)

```bash
cd backend
npm install
npm run dev          # API server at http://localhost:3001
```

### Android App

Open `android/` in Android Studio, sync Gradle, and run on device/emulator.

## Features

- **Real-time alert dashboard** with live-updating table
- **Charts & statistics**: alert trends, protocol distribution, top attackers
- **Alert detail view** with full payload inspection
- **Dark/light theme** support
- **Android push notifications** for critical alerts
- **Mock data mode** — works out-of-the-box without a real SNORT sensor

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. The included workflow deploys `web/` to Pages automatically on push

Live at: `https://<your-username>.github.io/snort-ids-app/`

## License

MIT
