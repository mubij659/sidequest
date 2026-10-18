
function decodePolyline(encoded, precision = 6) {
  const coordinates = []
  let index = 0
  let lat = 0
  let lon = 0
  const factor = 10 ** precision

  while (index < encoded.length) {
    const values = []

    for (let i = 0; i < 2; i++) {
      let result = 0
      let shift = 0
      let byte

      do {
        byte = encoded.charCodeAt(index++) - 63
        result += (byte & 0x1f) * 2 ** shift
        shift += 5
      } while (byte >= 0x20)

      values.push(result % 2 ? -(result + 1) / 2 : result / 2)
    }

    lat += values[0]
    lon += values[1]
    coordinates.push([lon / factor, lat / factor])
  }

  return coordinates
}

export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { coordinates } = await request.json()

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      coordinates.length > 20 ||
      !coordinates.every(
        (point) =>
          Array.isArray(point) &&
          point.length === 2 &&
          point.every(Number.isFinite) &&
          Math.abs(point[0]) <= 180 &&
          Math.abs(point[1]) <= 90
      )
    ) {
      return Response.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    const locations = coordinates.map(([lon, lat]) => ({
      lat,
      lon,
    }))

    const response = await fetch(
      'https://valhalla1.openstreetmap.de/route',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations,
          costing: 'pedestrian',
          directions_options: { units: 'kilometers' },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok || !data.trip?.legs) {
      console.error('Valhalla error:', response.status, data)
      throw new Error('Walking route unavailable')
    }

    const routeCoordinates = data.trip.legs.flatMap((leg) =>
      decodePolyline(leg.shape)
    )

    return Response.json({
      features: [
        {
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
        },
      ],
      distanceKm: data.trip.summary?.length,
      durationMinutes: data.trip.summary?.time / 60,
    })
  } catch (error) {
    console.error('Walking route error:', error.message)

    return Response.json(
      { error: 'Could not calculate walking route' },
      { status: 502 }
    )
  }
}
