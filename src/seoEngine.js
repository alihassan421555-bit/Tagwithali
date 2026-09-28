/**
 * Algorithmic Video SEO & Social Tag Generator Engine
 * Generates 20 unique tags, CTR titles, keywords, hashtags, and hooks
 */

export function generateSeoResults(
  prompt,
  platform = 'all',
  niche = 'General Content',
  format = 'Reels / Shorts / TikTok (<60s)',
  tone = 'Engaging & Viral',
  excludeTags = [],
  iteration = 1
) {
  const cleanPrompt = prompt.replace(/[^\w\s]/gi, '').trim();
  const words = cleanPrompt.split(/\s+/).filter((w) => w.length > 2);
  const mainSubject = cleanPrompt || 'Viral Video';
  const lowerExcludes = new Set(excludeTags.map((t) => t.toLowerCase().trim()));

  // Tag pools varied by iteration
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

  // TikTok Hashtags
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

  // Instagram Hashtags
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
    id: 'seo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    query: prompt,
    timestamp: Date.now(),
    platform,
    niche,
    format,
    tone,
    batchIndex: iteration,
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
      totalTagsCharCount: ytTags.join(', ').length,
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
