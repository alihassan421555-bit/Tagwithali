# Tagali

> **Tagali** — Cross-Platform Video SEO Tags & Social Hashtag Optimizer for YouTube, TikTok, Instagram Reels, and Facebook Watch. Built with pure modern **HTML5, CSS3, and JavaScript**.

---

## Overview

**Tagali** is an interactive web application engineered to maximize video discoverability, search ranking, and audience reach across major social video platforms. It generates tailored metadata, high-ranking SEO tags, algorithmic hashtags, and click-worthy title suggestions.

### Key Features

- **YouTube Video Tag Engine**: Generates exactly 20 focused, comma-separated tags ready to paste directly into YouTube's video tag box with live character counting (500-character limit).
- **TikTok SEO & Hashtag Optimization**: High-velocity niche tags, FYP discovery tags, search query keywords, and 3-second retention hooks.
- **Instagram Reels Reach**: Categorized community, category, and broad hashtags to optimize Explore page placement, plus visual AI alt-text SEO.
- **Facebook Watch & Reels**: Topic tags, search queries, and targeted audience keywords.
- **Smart Anti-Duplication**: Re-generating for the same topic produces brand new, unique batches without repetitive keyword spam.
- **1-Click Copy**: Instant clipboard export formatted specifically for each platform's input specifications.
- **Offline / Static Support**: Built-in client-side algorithmic engine guarantees full functionality even when hosted statically (e.g., GitHub Pages).
- **History & Session Storage**: Local persistence for quick reference to previously generated tag batches.

---

## Tech Stack

- **Markup**: Semantic [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML)
- **Styling**: Modern [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) & [Tailwind CSS](https://tailwindcss.com/)
- **Scripting**: Modular [JavaScript (ES6 Modules)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **Server**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Bundler**: [Vite](https://vitejs.dev/)

---

## Project Structure

```
├── index.html              # Clean semantic HTML entry point
├── server.js               # Node.js Express server & API routes
├── vite.config.js          # Vite build configuration
├── package.json            # Project manifest & scripts
├── public/                 # Static public assets
│   └── logo.jpg            # Application logo
└── src/
    ├── app.js              # Core UI logic, state & event handling
    ├── seoEngine.js        # Algorithmic SEO tag generator engine
    ├── style.css           # Styling, animations & glow effects
    ├── assets/             # Brand graphics
    └── data/
        └── samplePrompts.js# Preset topics, niches, and video formats
```

---

## Getting Started

### 1. Installation

```bash
git clone https://github.com/your-username/tagali.git
cd tagali
npm install
```

### 2. Environment Setup (Optional for AI generation)

```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY=your_api_key_here
```
*(Note: If no API key is provided, Tagali automatically runs using its high-speed algorithmic SEO engine!)*

### 3. Run Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Deployment

```bash
npm run build
npm run start
```

---

## Deploying to GitHub Pages

Tagali is fully optimized for GitHub Pages with relative asset paths and dual-mode CSS (compiled bundle + in-browser fallback).

### Option 1: Automatic via GitHub Actions (Recommended)
1. Push this repository to your GitHub account (`main` or `master` branch).
2. On GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build and publish your site with all styles and assets working seamlessly.

### Option 2: Deploy from Branch (Direct Static)
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Tagali will load with full Tailwind CSS styling directly in the browser.

---

## License

MIT License.
