import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface RoutineItem {
  id: number
  name: string
  categories: { id: number; name: string }[]
  createdAt: string
}

interface Props {
  routines: RoutineItem[]
}

const PAGE_SIZE = 12

export default function RoutinesIndex({ routines }: Props) {
  const [page, setPage] = useState(1)

  const paginatedRoutines = routines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
      >
        <h1 style={{ margin: 0 }}>Mes Routines</h1>
        <Button type="primary" onClick={() => router.visit('/routines/create')}>
          Créer une routine
        </Button>
      </div>

      {routines.length === 0 ? (
        <Empty description="Aucune routine créée">
          <Button type="primary" onClick={() => router.visit('/routines/create')}>
            Créer votre première routine
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedRoutines.map((r) => (
              <Col xs={24} sm={12} md={8} key={r.id}>
                <Card hoverable onClick={() => router.visit(`/routines/${r.id}`)}>
                  <Card.Meta
                    title={r.name}
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {r.categories.length > 0 ? (
                          <Space wrap size={4}>
                            {r.categories.map((c) => (
                              <Tag key={c.id}>{c.name}</Tag>
                            ))}
                          </Space>
                        ) : (
                          <span style={{ color: '#8c8c8c' }}>Aucune catégorie</span>
                        )}
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(r.createdAt).format('DD/MM/YYYY')}
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
            total={routines.length}
            onChange={(p) => setPage(p)}
            hideOnSinglePage
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
    </Layout>
  )
}
