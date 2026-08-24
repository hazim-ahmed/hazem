# Note Expenses Frontend App

Next.js 14 App Router dashboard & management interface for the Expense Management System.

## Features
- Built with Next.js 14, React 18, TypeScript, and TailwindCSS
- React Query (TanStack Query) for data fetching & caching
- Modern dark/light UI with Lucide React icons
- Dynamic Dashboard, Daily Journals, Projects, Users, Reports, and System Settings

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

## Deployment
This project is optimized for deployment on **Vercel**, Netlify, or any Node.js host.
Simply import this repository into Vercel and configure the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed backend URL.
