import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface Note {
  id: number
  title: string | null
  content: string | null
  createdAt: string
}

interface Props {
  notes: Note[]
}

const PAGE_SIZE = 20

export default function NotesIndex({ notes }: Props) {
  const [page, setPage] = useState(1)

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>Mes Notes</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.visit('/notes/create')}>
          Nouvelle note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Empty description="Aucune note créée">
          <Button type="primary" onClick={() => router.visit('/notes/create')}>
            Créer votre première note
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {notes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((note) => (
              <Col xs={24} sm={12} md={8} key={note.id}>
                <Card
                  hoverable
                  data-testid={`note-card-${note.id}`}
                  onClick={() => router.visit(`/notes/${note.id}/edit`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Modifier la note ${note.title || '(Sans titre)'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.visit(`/notes/${note.id}/edit`)
                  }}
                >
                  <Card.Meta
                    title={note.title || '(Sans titre)'}
                    description={
                      <Space direction="vertical" size={4}>
                        {note.content && (
                          <Typography.Text type="secondary">
                            {note.content.slice(0, 100)}{note.content.length > 100 ? '...' : ''}
                          </Typography.Text>
                        )}
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(note.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={notes.length}
            onChange={(p) => setPage(p)}
            hideOnSinglePage
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
    </Layout>
  )
}
