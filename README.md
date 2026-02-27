# 🤖 Will AI Replace You?

A spicy LinkedIn profile analyzer that tells you how likely your job is to be replaced by AI.

## What It Does

Paste your LinkedIn URL (or profile text), get a brutally honest assessment:
- **Risk percentage** (0-100%)
- **Verdict** (one sentence summary)
- **Why AI might replace you** (3 bullets)
- **How to survive** (3 tips)

## Quick Start

```bash
npm install
npm start
```

Then open http://localhost:3000

## API Endpoints

- `POST /api/analyze` - Analyze LinkedIn URL
- `POST /api/analyze-text` - Analyze pasted text
- `GET /api/health` - Health check

## Deploy

Deploy to Render/Railway/Vercel:
1. Push to GitHub
2. Connect to platform
3. Set `PORT` env var (Render sets this automatically)
4. Deploy

## Note

LinkedIn actively blocks scrapers. The tool includes a fallback to paste profile text directly when scraping fails.

## License

MIT - Built for fun weekend project
