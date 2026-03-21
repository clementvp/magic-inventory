import { router } from '@inertiajs/react'
import { Button, Empty, Space, Table, Tag } from 'antd'
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

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Mon Inventaire</h1>
        <Button type="primary" onClick={() => router.visit('/materials/create')}>
          Ajouter un matériel
        </Button>
      </div>
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
    </Layout>
  )
}
