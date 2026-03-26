import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Button, List, message, Space, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'
import DeleteModal from '~/components/DeleteModal'

interface RoutineItem {
  id: number
  name: string
  categories: { id: number; name: string }[]
}

interface ShowDetail {
  id: number
  name: string
  notes: string | null
  routines: RoutineItem[]
  createdAt: string
}

interface Props {
  show: ShowDetail
}

export default function ShowsShow({ show }: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleteModalOpen(false)
    setDeleting(true)
    router.delete(`/shows/${show.id}`, {
      onError: () => {
        setDeleting(false)
        message.error('Une erreur est survenue lors de la suppression du spectacle')
      },
      onFinish: () => setDeleting(false),
    })
  }

  return (
    <Layout title={show.name}>
      <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: '0 0 24px' }}>{show.name}</h1>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.visit(`/shows/${show.id}/checklist`)}>
          Générer checklist
        </Button>
        <Button type="primary" onClick={() => router.visit(`/shows/${show.id}/edit`)}>Modifier</Button>
          <Button danger loading={deleting} onClick={() => setDeleteModalOpen(true)}>Supprimer</Button>
      </Space>

      {show.notes && (
        <>
          <Typography.Title level={3}>Notes</Typography.Title>
          <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {show.notes}
          </Typography.Paragraph>
        </>
      )}

      <Typography.Title level={3}>Routines du spectacle</Typography.Title>
      {show.routines.length === 0 ? (
        <Typography.Text type="secondary">Aucune routine dans ce spectacle</Typography.Text>
      ) : (
        <List
          dataSource={show.routines}
          renderItem={(r) => (
            <List.Item
              key={r.id}
              data-testid={`routine-item-${r.id}`}
              style={{ cursor: 'pointer' }}
              tabIndex={0}
              role="button"
              aria-label={`Voir la routine ${r.name}`}
              onClick={() => router.visit(`/routines/${r.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') router.visit(`/routines/${r.id}`)
              }}
            >
              <List.Item.Meta
                title={<span style={{ fontWeight: 500 }}>{r.name}</span>}
                description={
                  r.categories.length > 0 ? (
                    <Space wrap>
                      {r.categories.map((c) => (
                        <Tag key={c.id}>{c.name}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span>—</span>
                  )
                }
              />
            </List.Item>
          )}
        />
      )}
      <DeleteModal
        open={deleteModalOpen}
        itemName={show.name}
        entityLabel="ce spectacle"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </Layout>
  )
}
