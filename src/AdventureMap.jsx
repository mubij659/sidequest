import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

function AdventureMap({ stops, startingPoint }) {
    const startingLocations = {
  'UVA Rotunda': [38.0356, -78.5034],
  'O-Hill': [38.0335, -78.5140],
  'Gooch-Dillard': [38.0295, -78.5180],
  'Shannon Library': [38.0367, -78.5050],
  'Clark Library': [38.0329, -78.5075],
}

const startPosition =
  startingLocations[startingPoint] || startingLocations['UVA Rotunda']
    const [route, setRoute] = useState([])

useEffect(() => {
  if (stops.length === 0) {
    setRoute([])
    return
  }

  let cancelled = false

  const start = [startPosition[1], startPosition[0]]

  const coordinates = [
    start,
    ...stops.map((stop) => [stop.lon, stop.lat]),
  ]

  async function getWalkingRoute() {
    try {
      const response = await fetch('/.netlify/functions/walking-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Walking route unavailable')
      }

      const points = data.features[0].geometry.coordinates.map(
        ([lon, lat]) => [lat, lon]
      )

      if (!cancelled) setRoute(points)
    } catch (error) {
      console.error('Walking route error:', error)
      if (!cancelled) setRoute([])
    }
  }

  setRoute([])
  getWalkingRoute()

  return () => {
    cancelled = true
  }
}, [stops, startingPoint])

  return (
    <MapContainer
      center={startPosition}
      zoom={14}
      style={{ height: '100%', width: '100%', minHeight: '450px' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
  position={startPosition}
  icon={L.divIcon({
    className: 'sidequest-start-marker',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background: #1689F9;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 6px rgba(0,0,0,0.3);
        box-sizing: border-box;
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })}
>
  <Popup>Your starting location</Popup>
</Marker>
      {route.length > 0 && (
  <Polyline
    positions={route}
    pathOptions={{
      color: '#2F5D46',
      weight: 5,
      opacity: 0.85,
    }}
  />
)}
      

     {stops.map((stop, index) => (
  <Marker
    key={stop.id}
    position={[stop.lat, stop.lon]}
    icon={L.divIcon({
      className: 'sidequest-marker',
      html: `
        <div style="
          background: #2F5D46;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        ">
          ${String.fromCharCode(65 + index)}
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    })}
  >
          <Popup>
            <strong>
              {String.fromCharCode(65 + index)} — {stop.name}
            </strong>
            <p>{stop.category}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default AdventureMap
