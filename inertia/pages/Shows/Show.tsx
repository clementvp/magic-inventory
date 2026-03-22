import { router } from '@inertiajs/react'
import { Button, List, Space, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'

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
  return (
    <Layout title={show.name}>
      <Typography.Title level={1}>{show.name}</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.visit(`/shows/${show.id}/checklist`)}>
          Générer checklist
        </Button>
        <Button type="primary" onClick={() => router.visit(`/shows/${show.id}/edit`)}>Modifier</Button>
        <Button danger disabled>
          Supprimer
        </Button>
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
    </Layout>
  )
}
