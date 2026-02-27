# 🚀 LAUNCH CHECKLIST

## What We Built
**"Will AI Replace You?"** - A LinkedIn profile analyzer that gives brutally honest career risk assessments.

### Features
✅ Paste LinkedIn URL or profile text
✅ Get risk percentage (0-100%)
✅ Brutally honest verdict
✅ Why AI might replace you (3 bullets)
✅ How to survive (3 tips)
✅ Share results
✅ Analytics tracking
✅ Mobile-responsive UI
✅ Free deployment configs

### Tech Stack
- Node.js + Express
- Cheerio for scraping
- Tailwind CSS (CDN)
- Vanilla JS frontend
- Deploys to Render/Vercel/Railway

---

## 🚀 DEPLOY (Choose One)

### Option A: Render (Recommended - FREE)

1. **Push to GitHub:**
```bash
cd ai-job-risk
git remote add origin https://github.com/YOUR_USERNAME/ai-job-risk.git
git branch -m main
git push -u origin main
```

2. **Deploy:**
   - Go to https://render.com
   - Sign up (GitHub login)
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Render auto-detects `render.yaml`
   - Click "Create Web Service"
   - Wait 2 minutes → Live URL

### Option B: Vercel (Serverless - FREE)

```bash
npm i -g vercel
vercel --prod
```

### Option C: Railway (FREE)

```bash
npm i -g @railway/cli
railway login
railway up
```

---

## 📊 TEST YOUR DEPLOYMENT

Once deployed, test these endpoints:

```bash
# Health check
curl https://YOUR-APP.com/api/health

# Test analysis
curl -X POST https://YOUR-APP.com/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text": "Data Entry Specialist at BigCorp"}'

# View stats
curl https://YOUR-APP.com/api/stats
```

---

## 📢 MARKETING BLAST

### 1. Twitter/X Post
```
I built a tool that analyzes your LinkedIn and tells you how likely AI is to replace your job.

It's brutally honest. I got a 73% "toast" rating 😬

Try it: [YOUR_URL]

What's your score?
```

### 2. LinkedIn Post
```
The question everyone's asking: Will AI replace me?

I built something that gives you a (slightly terrifying) answer based on your LinkedIn profile.

It's fast, free, and funny-but-true.

My result: 73% risk. Time to upskill. 🤖

Drop your score in the comments 👇

[YOUR_URL]
```

### 3. Hacker News
Title: `Show HN: I built a tool that predicts if AI will replace your job`

### 4. Reddit (post in these subs)
- r/webdev
- r/programming
- r/careerguidance
- r/antiwork

### 5. Product Hunt
- Create account at producthunt.com
- Submit with screenshot
- Title: "Will AI Replace You?"
- Tagline: "Brutally honest career risk analysis"

---

## 🎯 VIRAL HOOKS

### Post Ideas:
1. Screenshot your own result with caption "Well, this is awkward"
2. "Thread: 10 jobs AI will destroy by 2026"
3. "Ironic: I used AI to build a tool that predicts AI job replacement"
4. Poll: "What's your AI job risk? 🪦 High | 🤔 Medium | 😎 Low"

### Engagement Tactics:
- Reply to every comment with your own score
- Ask people to quote-tweet with their percentage
- Create a leaderboard of "most toast" jobs
- Share funniest/most surprising results (anonymized)

---

## 📈 TRACKING

Add Google Analytics:
1. Go to analytics.google.com
2. Create property
3. Get tracking ID (G-XXXXXXXXXX)
4. Add to `public/index.html` before `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 💰 MONETIZATION (Later)

After you get traffic:
- Premium detailed report ($5)
- Career pivot guide ($15)
- Resume optimization ($25)
- Affiliate links to courses

---

## 🐛 KNOWN ISSUES

1. **LinkedIn scraping often fails** - that's why we have text fallback
2. **Risk score is keyword-based** - not "real AI" but good enough for viral fun
3. **Analytics reset on restart** - upgrade to Redis/DB if you want persistence

---

## 📁 PROJECT FILES

```
ai-job-risk/
├── server.js           # Main Express server
├── public/
│   └── index.html      # Frontend UI
├── package.json        # Dependencies
├── render.yaml         # Render config
├── vercel.json         # Vercel config
├── deploy.sh           # Deployment helper
├── README.md           # Project docs
├── MARKETING.md        # Marketing plan
└── LAUNCH.md           # This file
```

---

## ✅ GO LIVE CHECKLIST

- [ ] Deploy to Render/Vercel
- [ ] Test all endpoints
- [ ] Add Google Analytics
- [ ] Post on Twitter
- [ ] Post on LinkedIn
- [ ] Submit to Hacker News
- [ ] Post on relevant subreddits
- [ ] Reply to all comments
- [ ] Watch analytics stats
- [ ] Iterate based on feedback

---

## 🎉 YOU'RE LIVE!

Ship it. Learn from it. Iterate.

Questions? Check MARKETING.md for more copy templates.

Built in a weekend. Now let's see if it spreads.
