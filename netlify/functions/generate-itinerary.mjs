import { places } from '../../src/data/places.js'
import osmPlaces from '../../src/data/osm-places.json' with { type: 'json' }

const startingLocations = {
  'UVA Rotunda': {
    lat: 38.0356,
    lon: -78.5034,
  },
  'O-Hill': {
    lat: 38.0335,
    lon: -78.5140,
  },
  'Gooch-Dillard': {
    lat: 38.0295,
    lon: -78.5180,
  },
  'Shannon Library': {
    lat: 38.0367,
    lon: -78.5050,
  },
  'Clark Library': {
    lat: 38.0329,
    lon: -78.5075,
  },
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const toRadians = (degrees) => degrees * Math.PI / 180

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'Gemini API key is missing' },
      { status: 500 }
    )
  }

  try {
    const { startingPoint, hours, budget, transport, interests } =
      await request.json()

    if (
      typeof startingPoint !== 'string' ||
      !startingPoint.trim() ||
      !Array.isArray(interests) ||
      interests.length === 0
    ) {
      return Response.json(
        { error: 'Please provide a starting point and interests.' },
        { status: 400 }
      )
    }
    
const start = startingLocations[startingPoint]

if (!start) {
  return Response.json(
    { error: 'Please select a valid starting location.' },
    { status: 400 }
  )
}

const allPlaces = [...places, ...osmPlaces]
  .filter((place) =>
    Number.isFinite(place.lat) &&
    Number.isFinite(place.lon)
  )
  .map((place) => ({
    ...place,
    distance: getDistance(
      start.lat,
      start.lon,
      place.lat,
      place.lon
    ),
  }))

  .sort((a, b) => a.distance - b.distance)

const matchingPlaces = allPlaces.filter((place) => {
  return interests.some((interest) => {
    const category = place.category.toLowerCase()

const selected = interest
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z]/g, '')
  

    const aliases = {
  cafes: ['drinks', 'bakery', 'cafe'],
  restaurants: ['food', 'restaurant'],
  bookstores: ['books', 'bookstore'],
  shopping: ['shopping'],
  museums: ['culture', 'museum'],
}

    return (
      category === selected ||
      aliases[selected]?.includes(category)
    )
  })
})
console.log('OSM records:', osmPlaces.length)
console.log('Places with coordinates:', allPlaces.length)
console.log('Places matching interests:', matchingPlaces.length)
console.log('Selected interests:', interests)
console.log('First imported place:', osmPlaces[0])
const candidatePlaces = matchingPlaces.slice(0, 35)

const availablePlaces = candidatePlaces
  .map((place) => `${place.id} | ${place.name} (${place.category})`)
  .join('\n')
  console.log('PLACES SENT TO GEMINI:\n', availablePlaces)



const prompt = `
You are Sidequest, an AI-powered solo adventure planner.

Starting point: ${startingPoint}
Available time: ${hours} hours
Budget: $${budget}
Transportation: ${transport}
Interests: ${interests.join(', ')}

Choose exactly 3 different destinations from this list:

${availablePlaces}

Return ONLY a valid JSON object in this format:

{
  "stopIds": ["id1", "id2", "id3"]
}

Rules:
- Use only IDs from the provided list.
- Do not invent destinations or IDs.
- Choose places that match the user's interests.
- Order the stops in a sensible sequence.
- Do not include Markdown, explanations, or extra text.
`


    
  let response

for (let attempt = 0; attempt < 3; attempt++) {
  response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
       generationConfig: {
  thinkingConfig: {
    thinkingLevel: 'low',
  },
  maxOutputTokens: 1500,
},
      }),
    }
  )

  if (response.status !== 503)  {
    break
  }

  if (attempt < 2) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * (attempt + 1))
    )
  }
}


    const data = await response.json()

    
if (!response.ok) {
  console.error(
    'Gemini API error:',
    response.status,
    data.error?.message || 'Unknown error'
  )

  // Backup: choose real nearby places matching the user's interests
  const budgetAmount = Number(budget) || 0

const freeToBrowse = ['books', 'shopping', 'culture', 'outdoors']
const lowerCost = ['drinks', 'bakery']

const rankedPlaces = [...candidatePlaces].sort((a, b) => {
  function score(place) {
    if (budgetAmount <= 15) {
      if (freeToBrowse.includes(place.category)) return 0
      if (lowerCost.includes(place.category)) return 1
      return 2
    }

    if (budgetAmount <= 35) {
      if (lowerCost.includes(place.category)) return 0
      if (freeToBrowse.includes(place.category)) return 1
      return 2
    }

    return 0
  }

  return score(a) - score(b)
})

const fallbackStops = rankedPlaces.slice(0, 3)

  const alternatives = matchingPlaces
    .filter(
      (place) =>
        !fallbackStops.some((stop) => stop.id === place.id)
    )
    .slice(0, 20)

  return Response.json({
    stops: fallbackStops,
    alternatives,
    source: 'fallback',
  })
}


    const itinerary =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('') || 'No itinerary was generated.'

    const parsed = JSON.parse(itinerary)

const stops = parsed.stopIds
  .map((id) => candidatePlaces.find((place) => place.id === id))
  .filter(Boolean)

const alternatives = matchingPlaces
  .filter((place) => !stops.some((stop) => stop.id === place.id))
  .slice(0, 20)

return Response.json({ stops, alternatives })
  } catch (error) {
    console.error('Itinerary generation failed:', error.message)

    return Response.json(
      { error: 'Something went wrong generating your itinerary.' },
      { status: 500 }
    )
  }
}

