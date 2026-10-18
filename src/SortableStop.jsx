
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableStop({ stop, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: '#fffdf8',
    border: '1px solid #e5e5df',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${stop.name}`}
        style={{
          cursor: 'grab',
          border: 'none',
          background: 'transparent',
          fontSize: '22px',
          touchAction: 'none',
        }}
      >
        ⠿
      </button>

      <div
        style={{
          background: '#2F5D46',
          color: 'white',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {String.fromCharCode(65 + index)}
      </div>

      <div>
        <strong>{stop.name}</strong>
        <p style={{ margin: '4px 0 0', color: '#777' }}>
          {stop.category}
        </p>
      </div>
      <button
  type="button"
  onClick={() => onRemove(stop.id)}
  aria-label={`Remove ${stop.name}`}
  style={{
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#777',
  }}
>
  ×
</button>
    </div>
  )
}

export default SortableStop
