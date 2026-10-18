
import fs from 'node:fs'

const raw = JSON.parse(
  fs.readFileSync('data/charlottesville-places.json', 'utf8')
)

function getCategory(tags) {
  if (tags.amenity === 'cafe') return 'drinks'
  if (tags.shop === 'bakery' || tags.shop === 'pastry') return 'bakery'
  if (['restaurant', 'fast_food'].includes(tags.amenity)) return 'food'
  if (tags.shop === 'books') return 'books'
  if (['gift', 'toys', 'clothes', 'second_hand', 'vintage'].includes(tags.shop)) return 'shopping'
  if (tags.tourism === 'museum' || tags.tourism === 'gallery') return 'culture'
  if (['park', 'garden', 'nature_reserve'].includes(tags.leisure)) return 'outdoors'
  if (['theatre', 'cinema', 'arts_centre'].includes(tags.amenity)) return 'culture'
  if (tags.amenity === 'library') return 'books'
  return 'exploring'
}

const places = raw.elements
  .filter((item) => item.tags?.name)
  .map((item) => ({
    id: `osm-${item.type}-${item.id}`,
    name: item.tags.name,
    category: getCategory(item.tags),
    lat: item.lat ?? item.center?.lat,
    lon: item.lon ?? item.center?.lon,
    address: [
      item.tags['addr:housenumber'],
      item.tags['addr:street'],
    ].filter(Boolean).join(' '),
  }))
  .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon))

fs.writeFileSync(
  'src/data/osm-places.json',
  JSON.stringify(places, null, 2)
)

console.log(`Imported ${places.length} Charlottesville places!`)
