import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy getter for GoogleGenAI
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'Tagali/1.0',
      },
    },
  });
}

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Video SEO Generation Route
app.post('/api/generate-seo', async (req, res) => {
  try {
    const {
      prompt,
      platform = 'all',
      niche = 'General Content',
      format = 'Reels / Shorts / TikTok (<60s)',
      tone = 'Engaging & Viral',
      language = 'English',
      excludeTags = [],
      iteration = 1,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Video topic or description prompt is required.' });
    }

    const ai = getGenAI();
    const previousTagsList = Array.isArray(excludeTags)
      ? excludeTags.filter((t) => typeof t === 'string' && t.trim().length > 0)
      : [];

    const systemInstruction = `You are an elite Social Media Video SEO Strategist and Algorithm Specialist with deep mastery over YouTube Search Algorithm, TikTok SEO, Instagram Reels indexing, and Facebook Watch/Reels discovery.
Your goal is to produce top-tier, search-optimized metadata, tags, and keywords to skyrocket discovery, search ranking, and suggested video recommendations.

Guidelines:
1. YouTube SEO: Provide EXACTLY 20 distinct, high-volume comma-separated tags suitable for YouTube's 500-character tag box. Tags should mix primary keywords, long-tail phrases, competitor search queries, and questions. Provide 4 high-CTR click-worthy titles (varying from curiosity to how-to), and a structured description snippet.
2. Anti-Duplication Rule: If previous tags are provided to exclude, you MUST generate 20 completely FRESH, NEW tags that have not been generated before.
3. TikTok SEO: Provide categorized hashtags (Trending, Niche, Broad, Community), TikTok Search Bar queries (terms viewers actually type into the TikTok search bar), and 3 viral retention hooks.
4. Instagram Reels: Provide 20-30 tiered hashtags (High-Volume >1M, Mid-Volume 100k-1M, Hyper-Niche 10k-100k), semantic explore keywords, and accessibility alt-text keywords for IG's AI image/video recognition.
5. Facebook SEO: Provide topic tags, discoverability keywords, and search terms optimized for Facebook Watch and Reels.
6. Provide a realistic Discoverability Score (80-98) and a percentage breakdown across search intent, algorithm alignment, trend relevance, and competition balance.
7. Provide output strictly in valid JSON format matching the requested schema.`;

    let userPrompt = `Generate comprehensive, high-ranking video SEO tags, keywords, and metadata for:
- Video Topic / Prompt: "${prompt}"
- Target Platform focus: "${platform}" (generate details for all requested platforms)
- Content Niche: "${niche}"
- Video Format: "${format}"
- Tone/Style: "${tone}"
- Target Language: "${language}"
- Generation Iteration / Batch: #${iteration}

CRITICAL RULES:
1. You MUST generate EXACTLY 20 tags in the youtube.tags array.
2. The 20 tags must be high-ranking, non-spammy, and tailored to current 2026 social algorithms.`;

    if (previousTagsList.length > 0) {
      userPrompt += `\n\n3. ZERO DUPLICATION MANDATE:
The user previously generated the following ${previousTagsList.length} tags:
[${previousTagsList.map((t) => `"${t}"`).join(', ')}]
You MUST NOT repeat any of the above tags. Generate 20 completely NEW, unique alternative tags (e.g. explore different search intents, synonyms, problem-solving angles, related subtopics, questions, and specific long-tail queries)!`;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: 'A 1-2 sentence executive summary of the SEO strategy and keyword positioning.',
        },
        discoverabilityScore: {
          type: Type.INTEGER,
          description: 'Overall SEO and discoverability rating between 75 and 99.',
        },
        scoreBreakdown: {
          type: Type.OBJECT,
          properties: {
            searchIntent: { type: Type.INTEGER },
            algorithmAlignment: { type: Type.INTEGER },
            trendRelevance: { type: Type.INTEGER },
            competitionBalance: { type: Type.INTEGER },
          },
          required: ['searchIntent', 'algorithmAlignment', 'trendRelevance', 'competitionBalance'],
        },
        youtube: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "EXACTLY 20 YouTube video tags without '#' prefix, ready for tag box.",
            },
            targetKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  searchVolume: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Very High'] },
                  competition: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                  type: { type: Type.STRING, enum: ['primary', 'long-tail', 'question'] },
                },
                required: ['keyword', 'searchVolume', 'competition', 'type'],
              },
            },
            titleSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            descriptionSnippet: {
              type: Type.STRING,
              description: 'Optimized description intro with natural keyword insertion and timestamps placeholder.',
            },
            categoryRecommendation: { type: Type.STRING },
          },
          required: ['tags', 'targetKeywords', 'titleSuggestions', 'descriptionSnippet', 'categoryRecommendation'],
        },
        tiktok: {
          type: Type.OBJECT,
          properties: {
            hashtags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING, description: 'Hashtag starting with #' },
                  category: { type: Type.STRING, enum: ['Trending', 'Niche', 'Broad', 'Community'] },
                },
                required: ['tag', 'category'],
              },
            },
            searchBarKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Natural search phrases viewers type into TikTok search.',
            },
            videoHooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'First 3-second hook ideas to boost retention and algorithm push.',
            },
            soundKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Audio or sound vibe keywords to pair with the video.',
            },
          },
          required: ['hashtags', 'searchBarKeywords', 'videoHooks', 'soundKeywords'],
        },
        instagram: {
          type: Type.OBJECT,
          properties: {
            hashtags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING, description: 'Hashtag with #' },
                  tier: { type: Type.STRING, enum: ['High-Volume', 'Mid-Volume', 'Hyper-Niche'] },
                },
                required: ['tag', 'tier'],
              },
            },
            exploreKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            altTextSEO: {
              type: Type.STRING,
              description: 'Recommended Accessibility Alt Text optimized for Instagram visual AI indexer.',
            },
            captionHook: {
              type: Type.STRING,
              description: 'Engaging first line caption hook with call to action.',
            },
          },
          required: ['hashtags', 'exploreKeywords', 'altTextSEO', 'captionHook'],
        },
        facebook: {
          type: Type.OBJECT,
          properties: {
            topicTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            discoverabilityKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            videoTitle: {
              type: Type.STRING,
            },
          },
          required: ['topicTags', 'hashtags', 'discoverabilityKeywords', 'videoTitle'],
        },
      },
      required: ['summary', 'discoverabilityScore', 'scoreBreakdown', 'youtube', 'tiktok', 'instagram', 'facebook'],
    };

    let parsedResult = null;
    const modelsToTry = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });

        if (response.text) {
          parsedResult = JSON.parse(response.text);
          break;
        }
      } catch (geminiError) {
        console.info(`Model ${modelName} unavailable, falling back to next provider.`);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!parsedResult) {
      console.info('Using algorithmic SEO generator fallback.');
      parsedResult = generateAlgorithmicFallback(prompt, niche, format, tone, previousTagsList, iteration);
    }

    // Ensure YouTube tags has exactly 20 unique tags
    if (parsedResult.youtube && Array.isArray(parsedResult.youtube.tags)) {
      let uniqueTags = Array.from(new Set(parsedResult.youtube.tags.map((t) => t.trim()))).filter(Boolean);

      if (previousTagsList.length > 0) {
        const lowerPrev = new Set(previousTagsList.map((t) => t.toLowerCase()));
        const filtered = uniqueTags.filter((t) => !lowerPrev.has(t.toLowerCase()));
        if (filtered.length >= 15) {
          uniqueTags = filtered;
        }
      }

      if (uniqueTags.length < 20) {
        const fillerPool = [
          `${prompt} tips`,
          `${prompt} hack`,
          `how to ${prompt}`,
          `${prompt} 2026`,
          `best ${prompt}`,
          `top ${prompt} tricks`,
          `${prompt} guide`,
          `${prompt} step by step`,
          `${prompt} for beginners`,
          `easy ${prompt}`,
          `${prompt} review`,
          `${prompt} secrets`,
          `${prompt} routine`,
          `${niche.toLowerCase()} guide`,
          `${prompt} mistakes`,
          `${prompt} strategy`,
          `${prompt} ideas`,
          `${prompt} questions`,
          `viral ${prompt}`,
          `${prompt} advice`,
          `${prompt} tutorial 2026`,
          `${prompt} explanation`,
        ];
        const lowerCurrent = new Set(uniqueTags.map((t) => t.toLowerCase()));
        for (const candidate of fillerPool) {
          if (!lowerCurrent.has(candidate.toLowerCase()) && !previousTagsList.some((p) => p.toLowerCase() === candidate.toLowerCase())) {
            uniqueTags.push(candidate);
            lowerCurrent.add(candidate.toLowerCase());
          }
          if (uniqueTags.length >= 20) break;
        }
      }

      parsedResult.youtube.tags = uniqueTags.slice(0, 20);
      parsedResult.youtube.totalTagsCharCount = parsedResult.youtube.tags.join(', ').length;
    }

    const result = {
      id: 'seo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      query: prompt,
      timestamp: Date.now(),
      platform,
      niche,
      format,
      tone,
      batchIndex: iteration,
      ...parsedResult,
    };

    return res.json(result);
  } catch (error) {
    console.error('SEO Generation Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate video SEO tags. Please try again.',
    });
  }
});

function generateAlgorithmicFallback(
  prompt,
  niche,
  format,
  tone,
  excludeTags = [],
  iteration = 1
) {
  const cleanPrompt = prompt.replace(/[^\w\s]/gi, '').trim();
  const words = cleanPrompt.split(/\s+/).filter((w) => w.length > 2);
  const mainSubject = cleanPrompt || 'Viral Video';
  const lowerExcludes = new Set(excludeTags.map((t) => t.toLowerCase().trim()));

  const tagPoolBatch1 = [
    cleanPrompt,
    `${cleanPrompt} tutorial`,
    `${cleanPrompt} tips`,
    `how to ${cleanPrompt}`,
    `${cleanPrompt} 2026`,
    `${niche.toLowerCase()} tips`,
    `${niche.toLowerCase()} hack`,
    `best ${cleanPrompt}`,
    `${cleanPrompt} guide`,
    `viral ${cleanPrompt}`,
    `beginner ${cleanPrompt}`,
    `${cleanPrompt} review`,
    `${cleanPrompt} step by step`,
    `${cleanPrompt} routine`,
    `easy ${cleanPrompt}`,
    `${cleanPrompt} for beginners`,
    `${cleanPrompt} explained`,
    `top ${cleanPrompt} tricks`,
    `secret ${cleanPrompt}`,
    `${cleanPrompt} walkthrough`,
    `${cleanPrompt} masterclass`,
    `${cleanPrompt} ideas`,
  ];

  const tagPoolBatch2 = [
    `${cleanPrompt} advice`,
    `ultimate ${cleanPrompt} checklist`,
    `${cleanPrompt} for advanced`,
    `${cleanPrompt} trends`,
    `why your ${cleanPrompt} is failing`,
    `${cleanPrompt} secrets revealed`,
    `affordable ${cleanPrompt}`,
    `professional ${cleanPrompt}`,
    `${cleanPrompt} daily routine`,
    `${cleanPrompt} in 5 minutes`,
    `${cleanPrompt} tools and equipment`,
    `${cleanPrompt} blueprint`,
    `${cleanPrompt} must haves`,
    `proven ${cleanPrompt} strategy`,
    `simple ${cleanPrompt} methods`,
    `${cleanPrompt} inspiration`,
    `${cleanPrompt} case study`,
    `${cleanPrompt} QA`,
    `${cleanPrompt} algorithm tips`,
    `top 10 ${cleanPrompt} tricks`,
    `${cleanPrompt} do and donts`,
    `fix your ${cleanPrompt}`,
  ];

  const tagPoolBatch3 = [
    `common ${cleanPrompt} mistakes`,
    `${cleanPrompt} rules to follow`,
    `how I improved my ${cleanPrompt}`,
    `best budget ${cleanPrompt}`,
    `expert ${cleanPrompt} review`,
    `${cleanPrompt} deep dive`,
    `${cleanPrompt} transformation`,
    `before and after ${cleanPrompt}`,
    `${cleanPrompt} challenge`,
    `can you do ${cleanPrompt} at home`,
    `fastest way to ${cleanPrompt}`,
    `${cleanPrompt} essentials`,
    `${cleanPrompt} vs alternatives`,
    `real results ${cleanPrompt}`,
    `${cleanPrompt} without experience`,
    `how to start ${cleanPrompt}`,
    `${cleanPrompt} setup guide`,
    `${cleanPrompt} routine 2026`,
    `tested ${cleanPrompt} methods`,
    `pro guide ${cleanPrompt}`,
    `${cleanPrompt} recommendations`,
  ];

  const candidatePool =
    iteration === 2
      ? [...tagPoolBatch2, ...tagPoolBatch3, ...tagPoolBatch1]
      : iteration >= 3
      ? [...tagPoolBatch3, ...tagPoolBatch2, ...tagPoolBatch1]
      : [...tagPoolBatch1, ...tagPoolBatch2, ...tagPoolBatch3];

  const selectedTags = [];
  for (const tag of candidatePool) {
    if (!lowerExcludes.has(tag.toLowerCase()) && !selectedTags.includes(tag)) {
      selectedTags.push(tag);
    }
    if (selectedTags.length >= 20) break;
  }

  let counter = 1;
  while (selectedTags.length < 20) {
    const candidate = `${cleanPrompt} keyword variation ${counter++}`;
    if (!selectedTags.includes(candidate)) {
      selectedTags.push(candidate);
    }
  }

  const ytTags = selectedTags.slice(0, 20);

  const camelPrompt = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const tiktokHashtags = [
    { tag: `#${camelPrompt || 'FYP'}`, category: 'Niche' },
    { tag: `#${words[0]?.toLowerCase() || 'viral'}tips`, category: 'Niche' },
    { tag: `#fyp`, category: 'Broad' },
    { tag: `#foryou`, category: 'Broad' },
    { tag: `#foryoupage`, category: 'Broad' },
    { tag: `#viral`, category: 'Trending' },
    { tag: `#trending`, category: 'Trending' },
    { tag: `#learnontiktok`, category: 'Trending' },
    { tag: `#tiktokmademebuyit`, category: 'Trending' },
    { tag: `#${niche.toLowerCase().replace(/[^a-z0-9]/g, '')}`, category: 'Community' },
    { tag: `#${words[1]?.toLowerCase() || 'creator'}tok`, category: 'Community' },
    { tag: `#aesthetic`, category: 'Community' },
  ];

  const igHashtags = [
    { tag: `#${camelPrompt}`, tier: 'Hyper-Niche' },
    { tag: `#${words[0]?.toLowerCase()}daily`, tier: 'Hyper-Niche' },
    { tag: `#${words[1]?.toLowerCase() || 'tips'}community`, tier: 'Hyper-Niche' },
    { tag: `#reelsvideo`, tier: 'High-Volume' },
    { tag: `#reelsinstagram`, tier: 'High-Volume' },
    { tag: `#explorepage`, tier: 'High-Volume' },
    { tag: `#viralreels`, tier: 'High-Volume' },
    { tag: `#trendingreels`, tier: 'High-Volume' },
    { tag: `#${niche.toLowerCase().replace(/[^a-z0-9]/g, '')}`, tier: 'Mid-Volume' },
    { tag: `#${words[0]?.toLowerCase()}tips`, tier: 'Mid-Volume' },
    { tag: `#${words[0]?.toLowerCase()}hacks`, tier: 'Mid-Volume' },
    { tag: `#instadaily`, tier: 'Mid-Volume' },
  ];

  return {
    summary: `Search-first keyword distribution tailored for ${niche} content with maximum search intent match and high CTR ranking triggers.`,
    discoverabilityScore: 94,
    scoreBreakdown: {
      searchIntent: 96,
      algorithmAlignment: 94,
      trendRelevance: 91,
      competitionBalance: 95,
    },
    youtube: {
      tags: ytTags,
      targetKeywords: [
        { keyword: cleanPrompt, searchVolume: 'High', competition: 'Medium', type: 'primary' },
        { keyword: `how to ${cleanPrompt}`, searchVolume: 'Very High', competition: 'Low', type: 'question' },
        { keyword: `${cleanPrompt} tutorial for beginners`, searchVolume: 'Medium', competition: 'Low', type: 'long-tail' },
        { keyword: `best ${cleanPrompt} 2026`, searchVolume: 'High', competition: 'Medium', type: 'long-tail' },
      ],
      titleSuggestions: [
        `The Secret to ${mainSubject} (Nobody Tells You This)`,
        `How to Master ${mainSubject} in Under 10 Minutes`,
        `Stop Doing ${mainSubject} Wrong! (Do This Instead)`,
        `5 Easy Steps to Perfect ${mainSubject} [2026 Guide]`,
      ],
      descriptionSnippet: `In this video, discover everything you need to know about ${cleanPrompt}. Whether you are a beginner or looking to optimize your routine, these tips will save you time and maximize your results.\n\n📌 Timestamps:\n0:00 - Introduction & Overview\n1:15 - Key Strategies & Step-by-Step Breakdown\n4:30 - Common Mistakes to Avoid\n7:45 - Final Pro Tips & Results\n\n🔔 Don't forget to like, subscribe, and drop a comment below with your favorite tip!`,
      categoryRecommendation: niche,
    },
    tiktok: {
      hashtags: tiktokHashtags,
      searchBarKeywords: [
        `${cleanPrompt} hack`,
        `how to do ${cleanPrompt}`,
        `${cleanPrompt} routine`,
        `best ${cleanPrompt} tutorial`,
        `${cleanPrompt} for beginners`,
      ],
      videoHooks: [
        `If you struggle with ${cleanPrompt}, watch this before you make this common mistake...`,
        `I tried every way to do ${cleanPrompt} so you don't have to. Here's what actually works:`,
        `Stop scrolling! This 30-second trick for ${cleanPrompt} will change everything.`,
      ],
      soundKeywords: ['Upbeat Lo-Fi', 'Aesthetic Chillout', 'Viral Ambient Synth', 'Energetic Pop'],
    },
    instagram: {
      hashtags: igHashtags,
      exploreKeywords: [
        cleanPrompt,
        `${niche} inspiration`,
        `${words[0] || 'viral'} guide`,
        `aesthetic ${words[1] || 'routine'}`,
        `trending ${niche.toLowerCase()}`,
      ],
      altTextSEO: `A close-up aesthetic demonstration of ${cleanPrompt} highlighting step-by-step techniques, natural lighting, and modern ${niche.toLowerCase()} styling.`,
      captionHook: `Save this post before your next session! 📌 Here is the ultimate guide to ${cleanPrompt} that makes everything 10x easier. Which tip was your favorite? Let me know below! 👇`,
    },
    facebook: {
      topicTags: [
        cleanPrompt,
        niche,
        'Tutorial & Guides',
        `${words[0] || 'lifestyle'} tips`,
        'Trending Videos',
      ],
      hashtags: [`#${camelPrompt}`, `#${niche.replace(/\s+/g, '')}`, `#TipsAndTricks`, `#DailyHacks`],
      discoverabilityKeywords: [
        cleanPrompt,
        `${cleanPrompt} video guide`,
        `how to do ${cleanPrompt}`,
        `watch ${cleanPrompt}`,
      ],
      videoTitle: `The Ultimate Guide to ${mainSubject} That Anyone Can Do!`,
    },
  };
}

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
