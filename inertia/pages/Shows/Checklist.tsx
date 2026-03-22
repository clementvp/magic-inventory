import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Alert, Button, Checkbox, List, Space, Tag, Typography } from 'antd'
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

  const allChecked = materials.length > 0 && checked.size === materials.length

  return (
    <Layout title="Checklist" breadcrumbLabels={{ [show.id.toString()]: show.name }}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => router.visit(`/shows/${show.id}`)}>Retour au spectacle</Button>
      </Space>

      <Typography.Title level={1}>Checklist — {show.name}</Typography.Title>

      {!hasRoutines && (
        <Alert
          type="warning"
          message="Ce spectacle ne contient aucune routine"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {hasRoutines && materials.length === 0 && (
        <Alert
          type="info"
          message="Aucun matériel nécessaire pour ce spectacle"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {allChecked && (
        <Alert
          type="success"
          message="Checklist complète !"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {materials.length > 0 && (
        <List
          dataSource={materials}
          renderItem={(m) => (
            <List.Item key={m.id}>
              <Space align="start" style={{ width: '100%' }}>
                <Checkbox
                  checked={checked.has(m.id)}
                  onChange={() => toggle(m.id)}
                  aria-label={`Cocher ${m.name}`}
                />
                <div style={{ opacity: checked.has(m.id) ? 0.5 : 1 }}>
                  <span
                    style={{
                      fontWeight: 500,
                      textDecoration: checked.has(m.id) ? 'line-through' : 'none',
                    }}
                  >
                    {m.name}
                  </span>
                  <div>
                    <Space>
                      <span>Type : {m.type ? <Tag>{m.type.name}</Tag> : <span>—</span>}</span>
                      <span>
                        Lieu :{' '}
                        {m.storageLocation ? (
                          <span
                            data-testid={`storage-location-${m.id}`}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Aller au lieu ${m.storageLocation.name}`}
                            onClick={() =>
                              router.visit(`/storage-locations/${m.storageLocation!.id}`)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ')
                                router.visit(`/storage-locations/${m.storageLocation!.id}`)
                            }}
                          >
                            {m.storageLocation.name}
                          </span>
                        ) : (
                          <span style={{ color: 'orange' }}>Lieu non défini</span>
                        )}
                      </span>
                    </Space>
                  </div>
                </div>
              </Space>
            </List.Item>
          )}
        />
      )}
    </Layout>
  )
}
