# The Future of American Work — 00IA

An AI-powered job evolution explorer built with Next.js, live BLS OEWS data, and Claude Haiku.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.local.example .env.local
# Edit .env.local and paste your key

# 3. Run locally
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo at vercel.com
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

## Features

- Live wage data from BLS OEWS API (no key required)
- 10-year employment projections from BLS EP Program
- AI analysis powered by Claude Haiku 4.5
- Free-text job mapping via Claude
- Similar roles exploration
- LinkedIn share card generator (1200×630 PNG)

## Stack

- Next.js 14 (App Router)
- React 18
- BLS Public API (wages)
- Anthropic Claude Haiku 4.5 (analysis)

## Built by

[00IA](https://00ia.com) — Thoughts, Code, and Cognition.
