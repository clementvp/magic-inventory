import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Segmented, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  categories: { id: number; name: string }[]
  storageLocation: { id: number; name: string } | null
  author: string | null
  createdAt: string
}

interface Props {
  materials: MaterialItem[]
}

export default function MaterialsIndex({ materials }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [cardsPage, setCardsPage] = useState(1)

  const CARDS_PAGE_SIZE = 12
  const paginatedMaterials = materials.slice(
    (cardsPage - 1) * CARDS_PAGE_SIZE,
    cardsPage * CARDS_PAGE_SIZE
  )

  const columns: ColumnsType<MaterialItem> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <a onClick={(e) => { e.stopPropagation(); router.visit(`/materials/${record.id}`) }}>{name}</a>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => record.type?.name ?? '—',
      sorter: (a, b) => (a.type?.name ?? '').localeCompare(b.type?.name ?? ''),
    },
    {
      title: 'Catégorie(s)',
      key: 'categories',
      render: (_, record) =>
        record.categories.length > 0 ? (
          <Space wrap size={4}>
            {record.categories.map((c) => (
              <Tag key={c.id}>{c.name}</Tag>
            ))}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Lieu',
      key: 'storageLocation',
      render: (_, record) => record.storageLocation?.name ?? '—',
    },
    {
      title: 'Auteur',
      dataIndex: 'author',
      key: 'author',
      render: (author: string | null) => author ?? '—',
    },
    {
      title: "Date d'ajout",
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => null, // Réservé Stories 3.5/3.6
    },
  ]

  const emptyState = (
    <Empty description="Aucun matériel dans votre inventaire">
      <Button type="primary" onClick={() => router.visit('/materials/create')}>
        Ajouter votre premier matériel
      </Button>
    </Empty>
  )

  const cardsView = (
    <>
      {materials.length === 0 ? (
        emptyState
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedMaterials.map((m) => (
              <Col xs={24} sm={12} md={8} key={m.id}>
                <Card
                  hoverable
                  onClick={() => router.visit(`/materials/${m.id}`)}
                >
                  <Card.Meta
                    title={m.name}
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {m.type && <Tag color="blue">{m.type.name}</Tag>}
                        {m.categories.length > 0 && (
                          <Space wrap size={4}>
                            {m.categories.map((c) => (
                              <Tag key={c.id}>{c.name}</Tag>
                            ))}
                          </Space>
                        )}
                        {m.storageLocation && (
                          <span style={{ color: '#8c8c8c' }}>📦 {m.storageLocation.name}</span>
                        )}
                        {m.author && (
                          <span style={{ color: '#8c8c8c' }}>{m.author}</span>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={cardsPage}
            pageSize={CARDS_PAGE_SIZE}
            total={materials.length}
            onChange={(page) => { setCardsPage(page) }}
            hideOnSinglePage
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
    </>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Mon Inventaire</h1>
        <Space>
          <Segmented
            value={viewMode}
            onChange={(val) => {
              if (val === 'table' || val === 'cards') {
                setViewMode(val)
                setCardsPage(1)
              }
            }}
            options={[
              { label: 'Table', value: 'table' },
              { label: 'Cards', value: 'cards' },
            ]}
          />
          <Button type="primary" onClick={() => router.visit('/materials/create')}>
            Ajouter un matériel
          </Button>
        </Space>
      </div>

      {viewMode === 'table' && (
        <Table<MaterialItem>
          dataSource={materials}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: ['25', '50', '100'],
          }}
          onRow={(record) => ({
            onClick: () => router.visit(`/materials/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{ emptyText: emptyState }}
        />
      )}

      {viewMode === 'cards' && cardsView}
    </Layout>
  )
}
