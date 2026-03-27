import { useState } from 'react'
import { Button, Input, Table } from 'antd'
import type { TableColumnsType } from 'antd'

interface MaterialOption {
  id: number
  name: string
}

interface Props {
  allMaterials: MaterialOption[]
  value: number[]
  onChange: (ids: number[]) => void
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

export default function MaterialPickerBuilder({ allMaterials, value, onChange }: Props) {
  const [search, setSearch] = useState('')

  const selectedSet = new Set(value)

  const availableMaterials = allMaterials.filter((m) => {
    if (selectedSet.has(m.id)) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selectedMaterials = value
    .map((id) => allMaterials.find((m) => m.id === id))
    .filter(Boolean) as MaterialOption[]

  const addMaterial = (id: number) => onChange([...value, id])
  const removeMaterial = (id: number) => onChange(value.filter((v) => v !== id))

  const hasActiveFilters = search.length > 0

  const columns: TableColumnsType<MaterialOption> = [
    {
      title: 'Matériel',
      key: 'name',
      render: (_, m) => (
        <span
          style={{
            fontWeight: 500,
            fontSize: 13,
            color: '#1b1c1c',
            fontFamily: '"Manrope", sans-serif',
          }}
        >
          {m.name}
        </span>
      ),
    },
    {
      key: 'action',
      width: 90,
      align: 'right',
      render: (_, m) => (
        <Button
          size="small"
          onClick={() => addMaterial(m.id)}
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
      {/* Left panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={sectionLabel}>Inventaire</p>

        <div
          style={{
            background: '#faf7f5',
            border: '1px solid #ede5e0',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                size="small"
              />
            </div>
            {hasActiveFilters && (
              <Button
                size="small"
                type="link"
                onClick={() => setSearch('')}
                style={{ color: '#877369', padding: '0 4px', fontSize: 12 }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        <Table
          dataSource={availableMaterials}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            hideOnSinglePage: true,
            showTotal: (total) => (
              <span style={{ fontSize: 12, color: '#877369' }}>{total} matériel(s)</span>
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
                {allMaterials.length === 0
                  ? 'Aucun matériel disponible'
                  : hasActiveFilters
                    ? 'Aucun résultat pour ce filtre'
                    : 'Tout le matériel est sélectionné'}
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

      {/* Right panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <p style={{ ...sectionLabel, marginBottom: 0 }}>Sélectionné</p>
          {selectedMaterials.length > 0 && (
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
              {selectedMaterials.length}
            </span>
          )}
        </div>

        {selectedMaterials.length === 0 ? (
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
            Cliquez sur un matériel pour l'ajouter
          </div>
        ) : (
          <div>
            {selectedMaterials.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: '#ffffff',
                  border: '1px solid #dac2b6',
                  borderRadius: 8,
                  marginBottom: 6,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: '#1b1c1c',
                      fontFamily: '"Manrope", sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                    }}
                  >
                    {m.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMaterial(m.id)}
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
                  title="Retirer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
