# Sidequest

### Your city. Your pace. Your adventure.

**Sidequest** is an AI-powered solo adventure planner designed to help people explore Charlottesville, Virginia, with confidence and spontaneity.

Whether you have a free afternoon between classes or just want to discover somewhere new, Sidequest turns your interests, available time, starting location, and budget into a personalized adventure.

## The Problem

Exploring a city alone can be exciting, but deciding where to go and how to get there can feel overwhelming. Finding places that match your interests, fit your schedule, and connect into a walkable route takes time.

Sidequest makes independent exploration easier by helping you turn free time into an adventure.

## How It Works

1. **Choose your starting point.** Start from a selected location around the University of Virginia.
2. **Pick your interests.** Explore cafés, restaurants, shopping, bookstores, or museums.
3. **Set your preferences.** Enter your available time and budget.
4. **Generate an adventure.** Gemini can select destinations from a curated list of real places.
5. **Explore your route.** View your destinations and pedestrian route on an interactive map.
6. **Make it yours.** Reorder stops, remove destinations, or add alternatives.

## Powered by Google Gemini

Sidequest integrates the Google Gemini API to help personalize destination selection.

The intended AI workflow provides Gemini with the user's preferences and a curated list of candidate destinations. Gemini returns destination IDs in a structured JSON response, allowing the application to match recommendations to existing place records instead of relying on invented business names.

Sidequest also includes a local fallback recommendation system for cases when Gemini is unavailable or its API quota is exhausted.

**AI availability note:** Gemini API usage is subject to rate limits and quotas. The Gemini integration is included in the project, but live API availability depends on the configured API key and account quota.

## Features

- AI-assisted itinerary generation with Google Gemini
- Real Charlottesville-area destination data
- Multiple starting locations around UVA
- Interest-based destination filtering
- Budget-aware recommendation preferences
- Interactive map with destination markers
- Pedestrian routing using Valhalla
- OpenStreetMap map tiles
- Drag-and-drop itinerary customization
- Remove stops and add alternative destinations
- Fallback recommendations when the AI service is unavailable

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tooling |
| JavaScript | Application logic |
| Google Gemini API | AI-assisted itinerary selection |
| Netlify Functions | Server-side API integration |
| Leaflet and React Leaflet | Interactive maps |
| OpenStreetMap | Map data and tiles |
| Valhalla | Pedestrian routing |
| dnd-kit | Drag-and-drop itinerary editing |

## 💻 Run Locally

### Prerequisites

- Node.js and npm
- A Google Gemini API key for AI-powered generation
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/sidequest.git
cd sidequest
npm install
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Keep your API key private. The `.env` file should not be committed to Git.

### Start the application

Run:

```bash
npx netlify dev
```

Open the local URL printed in your terminal, typically:

`http://localhost:8888`

You can also verify that the frontend builds with:

```bash
npm run build
```

## 🔐 Security

The Gemini API key is accessed server-side through an environment variable. Never expose API keys in frontend code or commit secrets to a public repository.

For hosted deployments, configure `GEMINI_API_KEY` in the hosting provider's environment-variable settings.

## ⚠️ Current Limitations

- The destination dataset currently focuses on Charlottesville and the UVA area.
- Destination categories may occasionally require correction.
- Budget preferences are approximate; verified prices are not available for every destination.
- Business hours, accessibility, and other venue details should be independently verified.
- Gemini generation depends on API availability and account quotas.
- The complete hosted itinerary-generation flow has not yet been confirmed to work reliably.

## What's Next?

Potential improvements include:

- Expanding to additional cities
- Incorporating verified business hours and prices
- Improving budget estimation
- Adding accessibility preferences
- Improving destination categorization and recommendation diversity
- Making recommendations more personalized over time

## The Vision

Sidequest is built around a simple idea: you shouldn't need a big group or a perfectly planned day to explore somewhere new.

Choose your starting point. Follow your curiosity. Find your next adventure.

---

*Built with curiosity for independent exploration.* 