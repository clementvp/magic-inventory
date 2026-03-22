import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Space } from 'antd'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface ShowItem {
  id: number
  name: string
  routinesCount: number
  createdAt: string
}

interface Props {
  shows: ShowItem[]
}

const PAGE_SIZE = 12

export default function ShowsIndex({ shows }: Props) {
  const [page, setPage] = useState(1)
  const paginatedShows = shows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
      >
        <h1 style={{ margin: 0 }}>Mes Spectacles</h1>
        <Button type="primary" onClick={() => router.visit('/shows/create')}>
          Créer un spectacle
        </Button>
      </div>

      {shows.length === 0 ? (
        <Empty description="Aucun spectacle créé">
          <Button type="primary" onClick={() => router.visit('/shows/create')}>
            Créer votre premier spectacle
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedShows.map((s) => (
              <Col xs={24} sm={12} md={8} key={s.id}>
                <Card
                  hoverable
                  data-testid={`show-card-${s.id}`}
                  onClick={() => router.visit(`/shows/${s.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Voir le spectacle ${s.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.visit(`/shows/${s.id}`)
                  }}
                >
                  <Card.Meta
                    title={s.name}
                    description={
                      <Space direction="vertical" size={4}>
                        <span>{s.routinesCount} routine(s)</span>
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(s.createdAt).format('DD/MM/YYYY')}
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
            total={shows.length}
            onChange={(p) => setPage(p)}
            hideOnSinglePage
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
    </Layout>
  )
}
