
import { places } from '../../src/data/places.js'
import osmPlaces from '../../src/data/osm-places.json' with { type: 'json' }

const startingLocations = {
  'UVA Rotunda': { lat: 38.0356, lon: -78.5034 },
  'O-Hill': { lat: 38.0335, lon: -78.5140 },
  'Gooch-Dillard': { lat: 38.0295, lon: -78.5180 },
  'Shannon Library': { lat: 38.0367, lon: -78.5050 },
  'Clark Library': { lat: 38.0329, lon: -78.5075 },
}

function distance(a, b) {
  const toRad = (n) => (n * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLon / 2) ** 2

  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

const aliases = {
  cafes: ['drinks', 'bakery', 'cafe'],
  restaurants: ['food', 'restaurant'],
  bookstores: ['books', 'bookstore'],
  shopping: ['shopping'],
  museums: ['culture', 'museum'],
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { startingPoint, interests, budget } = await request.json()

    const start = startingLocations[startingPoint]

    if (!start || !Array.isArray(interests) || !interests.length) {
      return Response.json(
        { error: 'Please select a starting point and interests.' },
        { status: 400 }
      )
    }

    const selectedCategories = interests.flatMap((interest) => {
      const key = String(interest)
        .toLowerCase()
        .replace(/[^a-z]/g, '')

      return aliases[key] || [key]
    })

    const candidates = [...places, ...osmPlaces]
      .filter(
        (place) =>
          Number.isFinite(place.lat) &&
          Number.isFinite(place.lon) &&
          selectedCategories.includes(
            String(place.category).toLowerCase()
          )
      )
      .map((place) => ({
        ...place,
        distance: distance(start, place),
      }))
      .sort((a, b) => a.distance - b.distance)

    const budgetAmount = Number(budget) || 0

    const ranked = [...candidates].sort((a, b) => {
      const score = (place) => {
        if (budgetAmount <= 15) {
          if (['books', 'shopping', 'culture'].includes(place.category))
            return 0
          if (['drinks', 'bakery'].includes(place.category)) return 1
          return 2
        }
        return 0
      }

      return score(a) - score(b)
    })

    const stops = ranked.slice(0, 3)
    const alternatives = candidates
      .filter((place) => !stops.some((stop) => stop.id === place.id))
      .slice(0, 20)

    return new Response(
      JSON.stringify({ stops, alternatives, source: 'fallback' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Itinerary error:', error)

    return Response.json(
      { error: 'Could not generate itinerary.' },
      { status: 500 }
    )
  }
}
