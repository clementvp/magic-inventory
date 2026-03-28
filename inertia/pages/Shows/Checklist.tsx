import { useState } from 'react'
import { router } from '@inertiajs/react'
import Layout from '~/components/Layout'

interface ChecklistMaterial {
  id: number
  name: string
  type: { id: number; name: string } | null
  storageLocation: { id: number; name: string } | null
}

interface Props {
  show: { id: number; name: string }
  materials: ChecklistMaterial[]
  hasRoutines: boolean
}

export default function ShowsChecklist({ show, materials, hasRoutines }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (checked.size === materials.length) {
      setChecked(new Set())
    } else {
      setChecked(new Set(materials.map((m) => m.id)))
    }
  }

  const allChecked = materials.length > 0 && checked.size === materials.length
  const progressPct = materials.length > 0 ? Math.round((checked.size / materials.length) * 100) : 0

  return (
    <Layout title="Checklist" breadcrumbLabels={{ [show.id.toString()]: show.name }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>

        {/* Back link */}
        <button
          onClick={() => router.visit(`/shows/${show.id}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#877369',
            fontSize: 13,
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 500,
            padding: '0 0 20px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#583b00')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#877369')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: 1 }}>
            arrow_back
          </span>
          Retour au spectacle
        </button>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8c8c8c',
              fontFamily: '"Manrope", sans-serif',
              margin: '0 0 8px',
            }}
          >
            Checklist
          </p>
          <h1
            style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 48,
              fontWeight: 400,
              color: '#583b00',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {show.name}
          </h1>
        </div>

        {/* No routines warning */}
        {!hasRoutines && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '16px 20px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: '#d97706', lineHeight: 1, marginTop: 1, flexShrink: 0 }}
            >
              warning
            </span>
            <div>
              <p
                style={{
                  fontFamily: '"Manrope", sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#92400e',
                  margin: '0 0 2px',
                }}
              >
                Aucune routine dans ce spectacle
              </p>
              <p style={{ fontFamily: '"Manrope", sans-serif', fontSize: 13, color: '#b45309', margin: 0 }}>
                Ajoutez des routines au spectacle pour générer une checklist de matériels.
              </p>
            </div>
          </div>
        )}

        {/* No materials info */}
        {hasRoutines && materials.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: '#0284c7', lineHeight: 1, flexShrink: 0 }}
            >
              info
            </span>
            <p style={{ fontFamily: '"Manrope", sans-serif', fontSize: 14, color: '#0369a1', margin: 0, fontWeight: 500 }}>
              Aucun matériel associé aux routines de ce spectacle.
            </p>
          </div>
        )}

        {/* Progress card */}
        {materials.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '20px 24px',
              border: allChecked ? '1px solid #bbf7d0' : '1px solid #f0ebe8',
              marginBottom: 16,
              transition: 'border-color 0.3s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {allChecked ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: '#16a34a', fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
                  >
                    check_circle
                  </span>
                ) : (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: '#d97706', fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
                  >
                    checklist
                  </span>
                )}
                <span
                  style={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: allChecked ? '#16a34a' : '#1b1c1c',
                  }}
                >
                  {allChecked
                    ? 'Tout est prêt !'
                    : `${checked.size} / ${materials.length} matériels préparés`}
                </span>
              </div>

              <button
                onClick={toggleAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  background: allChecked ? '#f6f3f2' : '#583b00',
                  color: allChecked ? '#877369' : '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: '"Manrope", sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, lineHeight: 1 }}>
                  {allChecked ? 'remove_done' : 'done_all'}
                </span>
                {allChecked ? 'Décocher tout' : 'Tout cocher'}
              </button>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 6,
                background: '#f0ebe8',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: allChecked
                    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                    : 'linear-gradient(90deg, #583b00, #d97706)',
                  borderRadius: 99,
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Checklist */}
        {materials.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #f0ebe8',
              overflow: 'hidden',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8c8c8c',
                fontFamily: '"Manrope", sans-serif',
                margin: 0,
                padding: '16px 24px',
                borderBottom: '1px solid #f0ebe8',
              }}
            >
              Matériels à préparer
              <span
                style={{
                  marginLeft: 8,
                  background: '#583b00',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {materials.length}
              </span>
            </p>

            <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {materials.map((m) => {
                const isChecked = checked.has(m.id)
                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${isChecked ? 'Décocher' : 'Cocher'} ${m.name}`}
                    onClick={() => toggle(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggle(m.id)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      background: isChecked ? '#f0fdf4' : '#faf7f5',
                      border: `1px solid ${isChecked ? '#bbf7d0' : '#ede5e0'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      opacity: isChecked ? 0.75 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = '#fff8e8'
                        e.currentTarget.style.borderColor = '#dac2b6'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = '#faf7f5'
                        e.currentTarget.style.borderColor = '#ede5e0'
                      }
                    }}
                  >
                    {/* Custom checkbox */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        border: `2px solid ${isChecked ? '#16a34a' : '#dac2b6'}`,
                        background: isChecked ? '#16a34a' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isChecked && (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 14, color: '#ffffff', lineHeight: 1, fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                        >
                          check
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1b1c1c',
                          fontFamily: '"Manrope", sans-serif',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          transition: 'text-decoration 0.15s',
                        }}
                      >
                        {m.name}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginTop: 4,
                          flexWrap: 'wrap',
                        }}
                      >
                        {m.type && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: '#877369',
                              fontFamily: '"Manrope", sans-serif',
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 12, lineHeight: 1, color: '#a8a29e' }}
                            >
                              label
                            </span>
                            {m.type.name}
                          </span>
                        )}
                        {m.storageLocation ? (
                          <button
                            data-testid={`storage-location-${m.id}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              router.visit(`/storage-locations/${m.storageLocation!.id}`)
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: '#583b00',
                              fontFamily: '"Manrope", sans-serif',
                              fontWeight: 600,
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              textDecorationColor: '#dac2b6',
                            }}
                            aria-label={`Aller au lieu ${m.storageLocation.name}`}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 12, lineHeight: 1, color: '#877369' }}
                            >
                              location_on
                            </span>
                            {m.storageLocation.name}
                          </button>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: '#d97706',
                              fontFamily: '"Manrope", sans-serif',
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 12, lineHeight: 1 }}
                            >
                              location_off
                            </span>
                            Lieu non défini
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Check indicator on right */}
                    {isChecked && (
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#16a34a',
                          fontFamily: '"Manrope", sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        Prêt
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
