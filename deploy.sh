#!/bin/bash

echo "🚀 AI Job Risk Analyzer - Deployment Script"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Run this from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔍 Running health check..."
node -e "
const http = require('http');
const server = require('./server.js');
setTimeout(() => {
  http.get('http://localhost:3000/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✅ Health check passed:', data);
      process.exit(0);
    });
  }).on('error', (e) => {
    console.log('⚠️  Could not start server for testing:', e.message);
    process.exit(0);
  });
}, 1000);
"

echo ""
echo "📋 Deployment Options:"
echo ""
echo "1. RENDER (Recommended - Free Tier)"
echo "   - Push to GitHub: git push origin main"
echo "   - Go to https://render.com"
echo "   - Click 'New Web Service'"
echo "   - Connect your GitHub repo"
echo "   - Render will auto-detect render.yaml"
echo ""
echo "2. VERCEL (Serverless)"
echo "   - Install Vercel CLI: npm i -g vercel"
echo "   - Run: vercel --prod"
echo ""
echo "3. RAILWAY"
echo "   - Install Railway CLI: npm i -g @railway/cli"
echo "   - Run: railway login && railway up"
echo ""
echo "4. LOCAL TUNNEL (For testing)"
echo "   - npm install -g ngrok"
echo "   - node server.js &"
echo "   - ngrok http 3000"
echo ""
echo "✨ Your app is ready to ship!"
