require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const pdfModule = require('pdf-parse');
const pdfParse = pdfModule.PDFParse || pdfModule;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// LinkedIn profile scraper
async function scrapeLinkedIn(url) {
  try {
    // Clean up URL
    const cleanUrl = url.trim().replace(/\/$/, '');
    
    // Try proxied request with headers that mimic a browser
    const response = await axios.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000,
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);
    
    // Extract profile data
    const name = $('h1').first().text().trim() || 
                 $('meta[property="og:title"]').attr('content')?.split('|')[0].trim() ||
                 'Unknown';
    
    const headline = $('div[data-test-id="headline"]').text().trim() ||
                    $('h2').first().text().trim() ||
                    $('meta[name="description"]').attr('content') ||
                    '';
    
    const about = $('section[data-section="about"] .inline-show-more-text').text().trim() ||
                 $('section:contains("About") p').first().text().trim() ||
                 '';
    
    // Try to extract experience
    const experience = [];
    $('section[data-section="experience"] li, .experience-section li, .experience-group').each((i, el) => {
      const title = $(el).find('h3, .experience-item__title, .t-bold').first().text().trim();
      const company = $(el).find('p, .experience-item__subtitle, .t-14').first().text().trim();
      if (title) {
        experience.push(`${title} at ${company || 'Unknown'}`);
      }
    });

    // If we got minimal data, try alternative selectors
    if (!headline && !about && experience.length === 0) {
      // Fallback: extract any text that looks like job titles
      const allText = $('body').text();
      const jobTitleMatches = allText.match(/(CEO|CTO|Engineer|Manager|Director|Analyst|Developer|Designer|Marketing|Sales|Consultant)[^\n]{0,50}/gi);
      if (jobTitleMatches) {
        experience.push(...jobTitleMatches.slice(0, 3));
      }
    }

    return {
      name,
      headline,
      about,
      experience: experience.slice(0, 5),
      url: cleanUrl,
      scrapedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Scraping error:', error.message);
    throw new Error('Failed to scrape profile. LinkedIn may be blocking automated access.');
  }
}

// AI Analysis function
async function analyzeRisk(profileData) {
  const prompt = `You are a brutally honest AI career analyst. Analyze this LinkedIn profile and determine how likely their job is to be replaced by AI.

Profile Data:
Name: ${profileData.name}
Headline: ${profileData.headline}
About: ${profileData.about}
Experience: ${profileData.experience.join(', ')}

Provide your analysis in this EXACT format:

RISK_PERCENTAGE: [number 0-100]
VERDICT: [one sentence summary like "Your job is 73% toast" or "You're safe... for now"]
WHY_AI_WILL_REPLACE:
- [bullet 1]
- [bullet 2]  
- [bullet 3]
HOW_TO_SURVIVE:
- [bullet 1]
- [bullet 2]
- [bullet 3]

Be funny but true. Not mean, just honest. The tone should be "I care enough to tell you the hard truth."`;

  try {
    // Call OpenClaw's internal Kimi or use environment-based AI
    // For now, simulate with a structured response if no AI available
    const response = await callAI(prompt);
    return parseAIResponse(response, profileData);
  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback analysis
    return generateFallbackAnalysis(profileData);
  }
}

async function callAI(prompt) {
  // Try to use OpenClaw's internal session capability
  // This is a placeholder - in production you'd use OpenAI, Anthropic, etc.
  
  // For now, return a simulated response based on keywords
  const text = (prompt || '').toLowerCase();
  
  const highRisk = ['data entry', 'customer service', 'translator', 'accountant', 'bookkeeper', 'paralegal', 'researcher'];
  const mediumRisk = ['analyst', 'marketer', 'writer', 'designer', 'developer', 'manager'];
  const lowRisk = ['nurse', 'doctor', 'therapist', 'teacher', 'electrician', 'plumber', 'chef', 'artist'];
  
  let risk = 50;
  let verdict = "You're in the danger zone";
  
  if (highRisk.some(job => text.includes(job))) {
    risk = 85;
    verdict = "Your job is basically a human API that schedules meetings. Toast.";
  } else if (mediumRisk.some(job => text.includes(job))) {
    risk = 60;
    verdict = "You're safe... for now. But update that resume just in case.";
  } else if (lowRisk.some(job => text.includes(job))) {
    risk = 25;
    verdict = "AI can't hold hands or fix pipes. You're golden.";
  }
  
  return `RISK_PERCENTAGE: ${risk}
VERDICT: ${verdict}
WHY_AI_WILL_REPLACE:
- Your tasks involve repetitive pattern matching that LLMs excel at
- Your work product is primarily text-based and easily automated
- You spend significant time on information retrieval and synthesis
HOW_TO_SURVIVE:
- Develop skills requiring physical presence or emotional intelligence
- Become the person who manages the AI tools
- Focus on strategy, relationships, and creative problem solving`;
}

function parseAIResponse(response, profileData) {
  const lines = response.split('\n');
  let risk = 50;
  let verdict = "Analysis inconclusive";
  const why = [];
  const survive = [];
  
  let currentSection = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('RISK_PERCENTAGE:')) {
      risk = parseInt(trimmed.split(':')[1]) || 50;
    } else if (trimmed.startsWith('VERDICT:')) {
      verdict = trimmed.split(':').slice(1).join(':').trim();
    } else if (trimmed === 'WHY_AI_WILL_REPLACE:') {
      currentSection = 'why';
    } else if (trimmed === 'HOW_TO_SURVIVE:') {
      currentSection = 'survive';
    } else if (trimmed.startsWith('- ') && currentSection === 'why') {
      why.push(trimmed.substring(2));
    } else if (trimmed.startsWith('- ') && currentSection === 'survive') {
      survive.push(trimmed.substring(2));
    }
  }
  
  return {
    riskPercentage: risk,
    verdict,
    whyAIWillReplace: why.length > 0 ? why : ['Pattern-based work is highly automatable', 'Your outputs are increasingly AI-generatable'],
    howToSurvive: survive.length > 0 ? survive : ['Develop uniquely human skills', 'Learn to work with AI tools'],
    profileName: profileData.name,
    profileHeadline: profileData.headline
  };
}

function generateFallbackAnalysis(profileData) {
  const headline = (profileData.headline || '').toLowerCase();
  const experience = profileData.experience.join(' ').toLowerCase();
  const about = (profileData.about || '').toLowerCase();
  const allText = `${headline} ${experience} ${about}`;
  
  // Comprehensive keyword-based risk scoring
  const riskProfiles = {
    high: {
      keywords: [
        'data entry', 'customer service', 'translator', 'interpreter', 'bookkeeper', 
        'accounting clerk', 'paralegal', 'legal assistant', 'administrative assistant',
        'receptionist', 'telemarketer', 'proofreader', 'transcriptionist', 'data analyst',
        'market research', 'content moderator', 'basic coding', 'junior developer',
        'qa tester', 'technical support', 'help desk', 'call center', 'claims processor'
      ],
      score: 85,
      verdict: "Your job is basically a human API. RIP. 🪦",
      why: [
        "Your work is repetitive pattern-matching that AI crushes",
        "Clear inputs/outputs = perfect automation target",
        "You're essentially a biological middleware layer"
      ],
      survive: [
        "Pivot to AI tool management and orchestration",
        "Develop client relationships that require human trust",
        "Learn the strategic layer above the tasks you do"
      ]
    },
    medium: {
      keywords: [
        'software engineer', 'developer', 'programmer', 'web designer', 'graphic designer',
        'copywriter', 'content writer', 'marketing manager', 'seo', 'social media',
        'financial analyst', 'business analyst', 'product manager', 'project manager',
        'hr manager', 'recruiter', 'sales representative', 'account manager',
        'journalist', 'editor', 'photographer', 'videographer', 'musician'
      ],
      score: 60,
      verdict: "You're in the danger zone. AI is coming for 40% of your job. 🫣",
      why: [
        "AI can already do 60% of your tasks faster",
        "Your outputs are increasingly AI-generatable",
        "You're one ChatGPT plugin away from redundancy"
      ],
      survive: [
        "Become the human who edits AI output (for now)",
        "Focus on creative direction over production",
        "Build proprietary relationships and domain expertise"
      ]
    },
    low: {
      keywords: [
        'ceo', 'founder', 'executive', 'doctor', 'physician', 'surgeon', 'nurse',
        'therapist', 'psychologist', 'psychiatrist', 'social worker', 'teacher',
        'professor', 'electrician', 'plumber', 'hvac', 'mechanic', 'carpenter',
        'chef', 'baker', 'physical therapist', 'occupational therapist', 'dentist',
        'veterinarian', 'pilates instructor', 'yoga teacher', 'personal trainer',
        'hair stylist', 'makeup artist', 'tattoo artist', 'emergency responder'
      ],
      score: 25,
      verdict: "AI can't hold hands or fix pipes. You're golden. 😎",
      why: [
        "Your work requires physical presence and dexterity",
        "Human trust and emotional connection are core to your role",
        "Complex, ambiguous situations need human judgment"
      ],
      survive: [
        "Keep doing what you're doing - you're hard to automate",
        "Use AI for admin tasks to focus on the human parts",
        "Stay current, but don't panic about your job"
      ]
    },
    elite: {
      keywords: [
        'ai researcher', 'ml engineer', 'ai engineer', 'prompt engineer',
        'ai ethics', 'robotics engineer', 'chip designer', 'quantum computing'
      ],
      score: 10,
      verdict: "You're literally building the thing that replaces others. King/Queen. 👑",
      why: [
        "You're creating the automation, not being automated",
        "Your skills are in the highest demand in history",
        "Even if AI improves, someone needs to steer it"
      ],
      survive: [
        "Keep shipping - you're on the right side of history",
        "Build AI that augments humans, don't just replace them",
        "Stay paranoid about AGI - it's closer than it looks"
      ]
    }
  };
  
  // Determine risk level
  let matchedProfile = null;
  for (const [level, profile] of Object.entries(riskProfiles)) {
    if (profile.keywords.some(kw => allText.includes(kw))) {
      matchedProfile = profile;
      break;
    }
  }
  
  // Default to medium if no match
  if (!matchedProfile) {
    matchedProfile = riskProfiles.medium;
  }
  
  // Add some randomness to avoid identical scores
  const variance = Math.floor(Math.random() * 10) - 5;
  const finalScore = Math.max(5, Math.min(95, matchedProfile.score + variance));
  
  return {
    riskPercentage: finalScore,
    verdict: matchedProfile.verdict,
    whyAIWillReplace: matchedProfile.why,
    howToSurvive: matchedProfile.survive,
    profileName: profileData.name,
    profileHeadline: profileData.headline,
    fallback: true
  };
}

// Simple analytics store (in-memory, resets on restart)
const analytics = {
  totalAnalyses: 0,
  riskScores: [],
  dailyStats: {}
};

// Track analysis
function trackAnalysis(riskPercentage) {
  analytics.totalAnalyses++;
  analytics.riskScores.push(riskPercentage);
  const today = new Date().toISOString().split('T')[0];
  analytics.dailyStats[today] = (analytics.dailyStats[today] || 0) + 1;
}

// API Routes
app.post('/api/analyze', async (req, res) => {
  const { linkedinUrl } = req.body;
  
  if (!linkedinUrl || !linkedinUrl.includes('linkedin.com')) {
    return res.status(400).json({ error: 'Please provide a valid LinkedIn URL' });
  }
  
  try {
    // Step 1: Scrape profile
    const profileData = await scrapeLinkedIn(linkedinUrl);
    
    // Step 2: Analyze with AI
    const analysis = await analyzeRisk(profileData);
    
    // Track analytics
    trackAnalysis(analysis.riskPercentage);
    
    res.json({
      success: true,
      profile: {
        name: profileData.name,
        headline: profileData.headline
      },
      analysis
    });
    
  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({ 
      error: 'Failed to analyze profile',
      message: error.message,
      suggestion: 'LinkedIn blocks automated scraping. Try pasting your profile content directly instead.'
    });
  }
});

// Manual text analysis (fallback)
app.post('/api/analyze-text', async (req, res) => {
  const { text, name = 'You' } = req.body;
  
  if (!text || text.length < 50) {
    return res.status(400).json({ error: 'Please provide more profile content (at least 50 characters)' });
  }
  
  const profileData = {
    name,
    headline: text.split('\n')[0].substring(0, 100),
    about: text,
    experience: [],
    url: 'manual-entry'
  };
  
  try {
    const analysis = await analyzeRisk(profileData);
    
    // Track analytics
    trackAnalysis(analysis.riskPercentage);
    
    res.json({
      success: true,
      profile: { name, headline: profileData.headline },
      analysis
    });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

// PDF analysis endpoint
app.post('/api/analyze-pdf', async (req, res) => {
  const { pdfBase64, name = 'You' } = req.body;
  
  if (!pdfBase64) {
    return res.status(400).json({ error: 'Please upload a PDF file' });
  }
  
  try {
    // Decode base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // Parse PDF
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;
    
    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({ error: 'Could not extract enough text from PDF. Try uploading a different file.' });
    }
    
    const profileData = {
      name,
      headline: extractedText.split('\n')[0].substring(0, 100),
      about: extractedText,
      experience: [],
      url: 'pdf-upload'
    };
    
    const analysis = await analyzeRisk(profileData);
    
    // Track analytics
    trackAnalysis(analysis.riskPercentage);
    
    res.json({
      success: true,
      profile: { name, headline: profileData.headline },
      analysis,
      extractedLength: extractedText.length
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({ 
      error: 'Failed to parse PDF',
      message: error.message 
    });
  }
});

// Analytics endpoint (basic stats)
app.get('/api/stats', (req, res) => {
  const avgRisk = analytics.riskScores.length > 0 
    ? (analytics.riskScores.reduce((a, b) => a + b, 0) / analytics.riskScores.length).toFixed(1)
    : 0;
  
  const highRiskCount = analytics.riskScores.filter(s => s >= 70).length;
  const safeCount = analytics.riskScores.filter(s => s < 40).length;
  
  res.json({
    totalAnalyses: analytics.totalAnalyses,
    averageRisk: avgRisk + '%',
    highRiskJobs: highRiskCount,
    safeJobs: safeCount,
    dailyStats: analytics.dailyStats
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🔥 AI Job Risk Analyzer running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
