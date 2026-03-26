import { router, Link } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { Badge, Button, Drawer, Empty, Form, Input, Modal, Select, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

interface StorageLocationDetail {
  id: number
  name: string
  createdAt: string
}

interface MaterialItem {
  id: number
  name: string
  type?: string
  categories?: string[]
  author?: string
}

interface Props {
  location: StorageLocationDetail
  materials: MaterialItem[]
}

export default function StorageLocationsShow({ location, materials }: Props) {
  const [editForm] = Form.useForm()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTypes, setFilterTypes] = useState<string[]>([])
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleEdit = () => {
    editForm.setFieldsValue({ name: location.name })
    setEditModalOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    setEditLoading(true)
    router.put(`/storage-locations/${location.id}`, { name: values.name }, {
      onSuccess: () => { setEditModalOpen(false); editForm.resetFields() },
      onFinish: () => setEditLoading(false),
    })
  }

  const handleDelete = () => {
    setDeleteModalOpen(false)
    setDeleting(true)
    router.delete(`/storage-locations/${location.id}`, {
      onSuccess: () => router.visit('/storage-locations'),
      onError: () => setDeleting(false),
    })
  }

  const uniqueCategories = [...new Set(materials.flatMap((m) => m.categories ?? []))].sort((a, b) => a.localeCompare(b))
  const uniqueTypes = [...new Set(materials.map((m) => m.type).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b))

  const description = [
    `Contient ${materials.length} matériel${materials.length !== 1 ? 's' : ''}`,
    uniqueCategories.length > 0 ? uniqueCategories.join(', ') : null,
  ].filter(Boolean).join(' · ')

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTypes = filterTypes.length === 0 || (m.type && filterTypes.includes(m.type))
    const matchesCategories = filterCategories.length === 0 || m.categories?.some((c) => filterCategories.includes(c))
    return matchesSearch && matchesTypes && matchesCategories
  })

  const tagStyle = (bg: string, color: string) => ({
    fontSize: 10,
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 700 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    padding: '2px 8px',
    borderRadius: 4,
    backgroundColor: bg,
    color,
  })

  const columns: ColumnsType<MaterialItem> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => <Link href={`/materials/${record.id}`}>{name}</Link>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type?: string) => type
        ? <span style={tagStyle('#ffdeac', '#604100')}>{type}</span>
        : '—',
    },
    {
      title: 'Catégories',
      dataIndex: 'categories',
      render: (categories?: string[]) => categories && categories.length > 0
        ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <span key={cat} style={tagStyle('#ffe088', '#574500')}>{cat}</span>
            ))}
          </div>
        )
        : '—',
    },
    {
      title: 'Auteur / Marque',
      dataIndex: 'author',
      render: (author?: string) => author
        ? <span style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', color: '#7e5700', fontWeight: 700 }}>{author}</span>
        : '—',
    },
  ]

  return (
    <Layout title={location.name}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 32,
        marginBottom: 40,
        borderBottom: '1px solid #e5e2e1',
      }}>
        <div>
          <h1 style={{
            fontFamily: '"Newsreader", serif',
            fontStyle: 'italic',
            fontSize: 48,
            fontWeight: 400,
            color: '#583b00',
            lineHeight: 1.1,
            margin: '0 0 8px',
          }}>
            {location.name}
          </h1>
          <p style={{ fontFamily: '"Manrope", sans-serif', fontSize: 14, color: '#54433a', margin: 0 }}>
            {description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexShrink: 0, marginLeft: 24 }}>
          <Button onClick={handleEdit} icon={<Icon name="edit" style={{ fontSize: 16 }} />}>
            Modifier le lieu
          </Button>
          <Button
            danger
            loading={deleting}
            icon={<Icon name="delete" style={{ fontSize: 16 }} />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Supprimer le lieu
          </Button>
        </div>
      </div>

      {/* Material list */}
      {materials.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }}>
            <Input
              placeholder="Rechercher un matériel…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              prefix={<Icon name="search" style={{ fontSize: 16, color: '#a8a29e' }} />}
              allowClear
              style={{ maxWidth: 300 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <Badge count={filterTypes.length + filterCategories.length} size="small">
                <Button onClick={() => setIsFilterDrawerOpen(true)}>Filtres</Button>
              </Badge>
              <Button type="primary" icon={<Icon name="add_circle" style={{ fontSize: 16 }} />} onClick={() => router.visit('/materials/create')}>
                Ajouter un matériel
              </Button>
            </div>
          </div>

          <Table<MaterialItem>
            dataSource={filteredMaterials}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5, hideOnSinglePage: true }}
            locale={{ emptyText: 'Aucun matériel ne correspond à votre recherche' }}
            onRow={(record) => ({ onClick: () => router.visit(`/materials/${record.id}`), style: { cursor: 'pointer' } })}
          />
        </>
      ) : (
        <Empty description="Aucun matériel dans ce lieu" style={{ marginTop: 48 }}>
          <Button type="primary">
            <Link href="/materials/create">Ajouter un matériel</Link>
          </Button>
        </Empty>
      )}

      <Drawer
        title="Filtres"
        placement="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        footer={
          <Button
            onClick={() => { setFilterTypes([]); setFilterCategories([]) }}
            disabled={filterTypes.length + filterCategories.length === 0}
          >
            Réinitialiser les filtres
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {uniqueTypes.length > 0 && (
            <div>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>Type</div>
              <Select
                mode="multiple"
                placeholder="Tous les types"
                style={{ width: '100%' }}
                options={uniqueTypes.map((t) => ({ value: t, label: t }))}
                value={filterTypes}
                onChange={setFilterTypes}
                allowClear
                virtual={false}
              />
            </div>
          )}
          {uniqueCategories.length > 0 && (
            <div>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>Catégorie(s)</div>
              <Select
                mode="multiple"
                placeholder="Toutes les catégories"
                style={{ width: '100%' }}
                options={uniqueCategories.map((c) => ({ value: c, label: c }))}
                value={filterCategories}
                onChange={setFilterCategories}
                allowClear
                virtual={false}
              />
            </div>
          )}
        </Space>
      </Drawer>

      <DeleteModal
        open={deleteModalOpen}
        itemName={location.name}
        entityLabel="ce lieu de stockage"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <Modal
        title="Modifier le lieu"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields() }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="name"
            label="Nom"
            rules={[{ required: true, message: 'Le nom du lieu est requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading}>
              Modifier
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
