
import ReactMarkdown from 'react-markdown'
import { useState, useEffect } from 'react'
import './App.css'
import AdventureMap from './AdventureMap'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import SortableStop from './SortableStop'

function App() {
  useEffect(() => {
  function handleBack() {
    setScreen('form')
    setStartingPoint('')
    setInterests([])
    setHours('3')
    setBudget('35')
    setStops([])
    setAlternatives([])
    setError('')
  }

  window.addEventListener('popstate', handleBack)

  return () => {
    window.removeEventListener('popstate', handleBack)
  }
}, [])
  const [startingPoint, setStartingPoint] = useState('')
  const [interests, setInterests] = useState([])
  const [hours, setHours] = useState('3')
  const [budget, setBudget] = useState('35')
  const [transport, setTransport] = useState('walking')
  const [itinerary, setItinerary] = useState('')
  const [stops, setStops] = useState([])
  const [alternatives, setAlternatives] = useState([])
  const [screen, setScreen] = useState('form')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

  const options = [
  '🛍️ Shopping',
  '☕ Cafés',
  '🍽️ Restaurants',
  '📚 Bookstores',
  '🏛️ Museums',
]

  function toggleInterest(interest) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    )
  }

function moveStop(index, direction) {
  setStops((current) => {
    const newIndex = index + direction

    if (newIndex < 0 || newIndex >= current.length) {
      return current
    }

    const updated = [...current]

    ;[updated[index], updated[newIndex]] = [
      updated[newIndex],
      updated[index],
    ]

    return updated
  })
}
function handleDragEnd(event) {
  const { active, over } = event

  if (!over || active.id === over.id) return

  setStops((current) => {
    const oldIndex = current.findIndex(
      (stop) => stop.id === active.id
    )
    const newIndex = current.findIndex(
      (stop) => stop.id === over.id
    )

    if (oldIndex === -1 || newIndex === -1) return current

    return arrayMove(current, oldIndex, newIndex)
  })
}
function removeStop(id) {
  setStops((current) =>
    current.filter((stop) => stop.id !== id)
  )
}
function addStop(id) {
  const place = alternatives.find((item) => item.id === id)

  if (!place) return

  setStops((current) => {
    if (current.some((stop) => stop.id === id)) return current
    return [...current, place]
  })
}


async function planAdventure() {
  if (!startingPoint.trim()) {
    alert('Please enter your starting location!')
    return
  }

  if (interests.length === 0) {
    alert('Please choose at least one interest!')
    return
  }

  setLoading(true)
  setError('')
  setItinerary('')
  setStops([])
  setAlternatives([])
  setScreen('loading')

  try {
    const response = await fetch(
      '/.netlify/functions/generate-itinerary',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startingPoint,
          hours: Number(hours),
          budget: Number(budget),
          transport,
          interests,
        }),
      }
    )

    const responseText = await response.text()

let data
try {
  data = JSON.parse(responseText)
} catch {
  throw new Error(
    'Your adventure took too long to generate. Please try again! 🌿'
  )
}

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not generate an itinerary.'
      )
    }

    setStops(data.stops || [])
    setAlternatives(data.alternatives || [])
    window.history.pushState({ screen: 'results' }, '', window.location.href)
    setScreen('results')
  } catch (err) {
    setError(err.message)
    setScreen('form')
  } finally {
    setLoading(false)
  }
}


  if (screen === 'loading') {
    return (
      <div className="app">
        <header className="navbar">
          <h2>sidequest<span>.</span></h2>
          <p>YOUR CITY. YOUR PACE.</p>
        </header>

        <main className="hero">
          <div className="hero-content" style={{ textAlign: 'center' }}>
            <h1>Finding your next little adventure... 🌿</h1>
            <p className="description">
              Discovering places that match your vibe.
            </p>
          </div>
        </main>
      </div>
    )
  }
  if (screen === 'results') {
  return (
    <div className="app">
      <header className="navbar">
        <h2>sidequest<span>.</span></h2>
        <p>YOUR CITY. YOUR PACE.</p>
      </header>

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '40% 60%',
          height: 'calc(100vh - 90px)',
        }}
      >
        {/* LEFT: Adventure stops */}
        <section
          style={{
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          <h1>Your Sidequest 🌿</h1>
          <p>Starting from: {startingPoint}</p>

          <DndContext
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={stops.map((stop) => stop.id)}
    strategy={verticalListSortingStrategy}
  >
    {stops.map((stop, index) => (
      <SortableStop
        key={stop.id}
        stop={stop}
        index={index}
        onRemove={removeStop}
      />
    ))}
  </SortableContext>
  <div
  style={{
    padding: '14px 16px',
    marginBottom: '16px',
    background: '#E8EDE4',
    borderRadius: '12px',
  }}
>
  <div style={{ fontSize: '12px', color: '#666' }}>
    YOUR ADVENTURE BUDGET
  </div>

  <strong style={{ fontSize: '24px', color: '#203E32' }}>
    ${budget}
  </strong>

  <p style={{ fontSize: '12px', color: '#777', margin: '4px 0 0' }}>
    Spending target · Actual costs may vary
  </p>
</div>
</DndContext>
<div style={{ marginTop: '24px' }}>
  <h3 style={{ color: '#203E32', marginBottom: '4px' }}>
    A little more to explore
  </h3>

  <p style={{ color: '#777', fontSize: '13px', marginBottom: '16px' }}>
    Nearby places you might love
  </p>

  {alternatives
    .filter((place) => !stops.some((stop) => stop.id === place.id))
    .slice(0, 5)
    .map((place) => (
      <div
        key={place.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px',
          marginBottom: '10px',
          background: '#fffdf8',
          border: '1px solid #e5e5df',
          borderRadius: '12px',
        }}
      >
        <div>
          <strong style={{ color: '#203E32' }}>
            {place.name}
          </strong>

          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#777' }}>
            {place.category}
          </p>
        </div>

        <button
          type="button"
          onClick={() => addStop(place.id)}
          style={{
            flexShrink: 0,
            background: '#2F5D46',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 12px',
            cursor: 'pointer',
          }}
        >
          + Add
        </button>
      </div>
    ))}
</div>
        </section>

        {/* RIGHT: Interactive map */}
        <section style={{ minWidth: 0 }}>
          <AdventureMap
  stops={stops}
  startingPoint={startingPoint}
/>
        </section>
      </main>
    </div>
  )
}
  return (
    <div className="app">
      <header className="navbar">
        <h2>soloside<span>.</span></h2>
        <p>GO OUT. EVEN SOLO.</p>
      </header>

      <main className="hero">
        <div className="hero-content">
          <p className="eyebrow">YOUR CITY. YOUR PACE.</p>

          <h1>
            Your next favorite day
            <br />
            doesn't need a plus-one.
          </h1>

          <p className="description">
            Discover hidden gems, explore new places,
            and plan your perfect solo adventure.
          </p>

          <div className="planner">
            <h3>Let's plan your day ✨</h3>

            <label>Where are you starting?</label>
            <input
              type="text"
              placeholder="e.g. Vienna Metro Station"
              value={startingPoint}
              onChange={(e) => setStartingPoint(e.target.value)}
            />
            <label>How much time do you have?</label>

          <select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          >
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours</option>
            <option value="5">5 hours</option>
          </select>


<label>What's your budget?</label>

<select
  value={budget}
  onChange={(e) => setBudget(e.target.value)}
>
  <option value="15">Under $15</option>
  <option value="35">Under $35</option>
  <option value="60">Under $60</option>
  <option value="100">Under $100</option>
</select>




            <label>What are you in the mood for?</label>

            <div className="interests">
              {options.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={
                    interests.includes(interest)
                      ? 'interest selected'
                      : 'interest'
                  }
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>

            

<button
  className="plan-button"
  onClick={planAdventure}
  disabled={loading}
>
  {loading ? 'Planning your adventure...' : 'Plan my adventure →'}
</button>

{error && (
  <p className="error-message">{error}</p>
)}

{stops.length > 0 && (
  <section className="itinerary-result">
    <h3>Your Sidequest 🌿</h3>

    <p>Starting from: {startingPoint}</p>

    {stops.map((stop, index) => (
      <div className="stop-card" key={stop.id}>
        <h3>
          {String.fromCharCode(65 + index)} — {stop.name}
        </h3>

        <p>{stop.category}</p>
      </div>
    ))}
  </section>
)}


          </div>
        </div>
      </main>
    </div>
  )
}

export default App
