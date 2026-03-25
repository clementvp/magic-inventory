import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Button, List, message, Popconfirm, Space, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  storageLocation: { id: number; name: string } | null
}

interface RoutineDetail {
  id: number
  name: string
  content: string | null
  categories: { id: number; name: string }[]
  materials: MaterialItem[]
  createdAt: string
}

interface Props {
  routine: RoutineDetail
}

export default function RoutinesShow({ routine }: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleting(true)
    router.delete(`/routines/${routine.id}`, {
      onError: () => {
        setDeleting(false)
        message.error('Une erreur est survenue lors de la suppression de la routine')
      },
    })
  }

  return (
    <Layout title={routine.name}>
      <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: '0 0 24px' }}>{routine.name}</h1>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.visit(`/routines/${routine.id}/edit`)}>
          Modifier
        </Button>
        <Popconfirm
          title="Êtes-vous sûr de vouloir supprimer cette routine ?"
          onConfirm={handleDelete}
          okText="Supprimer"
          cancelText="Annuler"
        >
          <Button danger loading={deleting}>Supprimer</Button>
        </Popconfirm>
        <Button onClick={() => router.visit('/routines')}>Retour aux routines</Button>
      </Space>

      <Typography.Title level={3}>Catégories</Typography.Title>
      <div style={{ marginBottom: 16 }}>
        {routine.categories.length > 0
          ? routine.categories.map((c) => <Tag key={c.id}>{c.name}</Tag>)
          : '—'}
      </div>

      <Typography.Title level={3}>Contenu</Typography.Title>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          maxHeight: 400,
          overflowY: 'auto',
          padding: 8,
          background: '#fafafa',
          borderRadius: 4,
          marginBottom: 16,
        }}
      >
        {routine.content || 'Aucun contenu'}
      </div>

      <Typography.Title level={3}>Matériel utilisé</Typography.Title>
      {routine.materials.length === 0 ? (
        <Typography.Text type="secondary">Aucun matériel lié</Typography.Text>
      ) : (
        <List
          dataSource={routine.materials}
          renderItem={(m) => (
            <List.Item
              key={m.id}
              style={{ cursor: 'pointer' }}
              onClick={() => router.visit(`/materials/${m.id}`)}
            >
              <List.Item.Meta
                title={<span style={{ fontWeight: 500 }}>{m.name}</span>}
                description={
                  <Space>
                    <span>Type : {m.type ? <Tag>{m.type.name}</Tag> : '—'}</span>
                    <span>Lieu : {m.storageLocation ? m.storageLocation.name : '—'}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Layout>
  )
}
