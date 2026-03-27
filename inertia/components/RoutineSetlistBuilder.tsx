import { useState } from 'react'
import { Button, Input, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface RoutineOption {
  id: number
  name: string
  categories: { id: number; name: string }[]
}

interface Props {
  allRoutines: RoutineOption[]
  value: number[]
  onChange: (routineIds: number[]) => void
}

function SortableRoutineItem({
  routine,
  index,
  onRemove,
}: {
  routine: RoutineOption
  index: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: routine.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        background: isDragging ? '#fff8e8' : '#ffffff',
        border: '1px solid #dac2b6',
        borderRadius: 8,
        marginBottom: 6,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <span
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          color: '#c9b8b1',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          fontSize: 18,
          lineHeight: 1,
        }}
        title="Réordonner"
      >
        ⠿
      </span>

      <span
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#583b00',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Manrope", sans-serif',
        }}
      >
        {index + 1}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: '#1b1c1c',
            fontFamily: '"Manrope", sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {routine.name}
        </div>
        {routine.categories.length > 0 && (
          <div style={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {routine.categories.map((c) => (
              <Tag key={c.id} style={{ margin: 0, fontSize: 11 }}>
                {c.name}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#c9b8b1',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          transition: 'color 0.15s',
          fontSize: 16,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ba1a1a')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#c9b8b1')}
        title="Retirer du programme"
      >
        ✕
      </button>
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#8c8c8c',
  marginBottom: 12,
  marginTop: 0,
  fontFamily: '"Manrope", sans-serif',
}

export default function RoutineSetlistBuilder({ allRoutines, value, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const allCategories = Array.from(
    new Map(allRoutines.flatMap((r) => r.categories).map((c) => [c.id, c])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const selectedSet = new Set(value)

  const availableRoutines = allRoutines.filter((r) => {
    if (selectedSet.has(r.id)) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter.length > 0 && !r.categories.some((c) => categoryFilter.includes(c.id)))
      return false
    return true
  })

  const selectedRoutines = value
    .map((id) => allRoutines.find((r) => r.id === id))
    .filter(Boolean) as RoutineOption[]

  const addRoutine = (id: number) => onChange([...value, id])
  const removeRoutine = (id: number) => onChange(value.filter((v) => v !== id))

  const toggleCategoryFilter = (id: number) => {
    setCategoryFilter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const hasActiveFilters = search.length > 0 || categoryFilter.length > 0

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as number)
      const newIndex = value.indexOf(over.id as number)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }

  const columns: TableColumnsType<RoutineOption> = [
    {
      title: 'Routine',
      key: 'name',
      render: (_, r) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 13,
              color: '#1b1c1c',
              fontFamily: '"Manrope", sans-serif',
            }}
          >
            {r.name}
          </div>
          {r.categories.length > 0 && (
            <div style={{ marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {r.categories.map((c) => (
                <Tag key={c.id} style={{ margin: 0, fontSize: 11 }}>
                  {c.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      width: 90,
      align: 'right',
      render: (_, r) => (
        <Button
          size="small"
          onClick={() => addRoutine(r.id)}
          style={{
            background: '#fff8e8',
            borderColor: '#dac2b6',
            color: '#583b00',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          + Ajouter
        </Button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      {/* Left panel: Répertoire */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={sectionLabel}>Répertoire</p>

        {/* Filter bar */}
        <div
          style={{
            background: '#faf7f5',
            border: '1px solid #ede5e0',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: allCategories.length > 0 ? 10 : 0,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#877369',
                fontFamily: '"Manrope", sans-serif',
                flexShrink: 0,
              }}
            >
              Filtres
            </span>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Rechercher par nom..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
                allowClear
                size="small"
              />
            </div>
            {hasActiveFilters && (
              <Button
                size="small"
                type="link"
                onClick={() => {
                  setSearch('')
                  setCategoryFilter([])
                }}
                style={{ color: '#877369', padding: '0 4px', fontSize: 12 }}
              >
                Réinitialiser
              </Button>
            )}
          </div>

          {allCategories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {allCategories.map((cat) => {
                const active = categoryFilter.includes(cat.id)
                return (
                  <span
                    key={cat.id}
                    onClick={() => toggleCategoryFilter(cat.id)}
                    style={{
                      cursor: 'pointer',
                      background: active ? '#583b00' : '#ffffff',
                      color: active ? '#ffffff' : '#583b00',
                      border: `1px solid ${active ? '#583b00' : '#dac2b6'}`,
                      borderRadius: 6,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 500,
                      fontFamily: '"Manrope", sans-serif',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat.name}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <Table
          dataSource={availableRoutines}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            hideOnSinglePage: true,
            showTotal: (total) => (
              <span style={{ fontSize: 12, color: '#877369' }}>{total} routine(s)</span>
            ),
          }}
          locale={{
            emptyText: (
              <div
                style={{
                  padding: '20px 0',
                  color: '#877369',
                  fontSize: 13,
                  fontFamily: '"Manrope", sans-serif',
                }}
              >
                {allRoutines.length === 0
                  ? 'Aucune routine disponible'
                  : hasActiveFilters
                    ? 'Aucun résultat pour ces filtres'
                    : 'Toutes les routines sont dans le programme'}
              </div>
            ),
          }}
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Vertical divider */}
      <div
        style={{
          width: 1,
          background: '#f0ebe8',
          alignSelf: 'stretch',
          flexShrink: 0,
          minHeight: 200,
        }}
      />

      {/* Right panel: Programme */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <p style={{ ...sectionLabel, marginBottom: 0 }}>Programme</p>
          {selectedRoutines.length > 0 && (
            <span
              style={{
                background: '#583b00',
                color: '#fff',
                borderRadius: 10,
                padding: '1px 7px',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: '"Manrope", sans-serif',
              }}
            >
              {selectedRoutines.length}
            </span>
          )}
        </div>

        {selectedRoutines.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#877369',
              fontSize: 13,
              fontFamily: '"Manrope", sans-serif',
              background: '#faf7f5',
              borderRadius: 8,
              border: '1px dashed #dac2b6',
            }}
          >
            Cliquez sur une routine pour l'ajouter au programme
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={value} strategy={verticalListSortingStrategy}>
              {selectedRoutines.map((r, index) => (
                <SortableRoutineItem
                  key={r.id}
                  routine={r}
                  index={index}
                  onRemove={() => removeRoutine(r.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
