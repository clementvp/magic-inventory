import { router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Drawer, Form, Input, Row, Segmented, Space, Table } from 'antd'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

interface StorageLocationItem {
  id: number
  name: string
  materialsCount: number
  createdAt: string
}

interface Props {
  storageLocations: StorageLocationItem[]
}

export default function StorageLocationsIndex({ storageLocations }: Props) {
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<StorageLocationItem | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const handleCreate = (values: { name: string }) => {
    setCreateLoading(true)
    router.post('/storage-locations', { name: values.name }, {
      onSuccess: () => { setCreateDrawerOpen(false); createForm.resetFields() },
      onFinish: () => setCreateLoading(false),
    })
  }

  const handleEdit = (location: StorageLocationItem) => {
    setEditingLocation(location)
    editForm.setFieldsValue({ name: location.name })
    setEditDrawerOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    if (!editingLocation) return
    setEditLoading(true)
    router.put(`/storage-locations/${editingLocation.id}`, { name: values.name }, {
      onSuccess: () => { setEditDrawerOpen(false); editForm.resetFields() },
      onFinish: () => setEditLoading(false),
    })
  }

  const handleDeleteRequest = (item: { id: number; name: string }) => {
    setDeletingItem(item)
  }

  const handleDeleteConfirm = () => {
    if (!deletingItem) return
    setIsDeleting(true)
    router.delete(`/storage-locations/${deletingItem.id}`, {
      onFinish: () => {
        setIsDeleting(false)
        setDeletingItem(null)
      },
    })
  }

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: StorageLocationItem) => (
        <Link href={`/storage-locations/${record.id}`} style={{ fontWeight: 600, color: '#583b00' }}>
          {name}
        </Link>
      ),
    },
    {
      title: "Nombre d'items",
      dataIndex: 'materialsCount',
      key: 'materialsCount',
      render: (count: number) => (
        <span style={{ color: '#54433a' }}>{count}</span>
      ),
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span style={{ color: '#54433a' }}>{new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: StorageLocationItem) => (
        <span style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button
            type="text"
            icon={<Icon name="edit" style={{ fontSize: 18, color: '#583b00' }} />}
            onClick={() => handleEdit(record)}
            title="Modifier"
          />
          <Button
            type="text"
            icon={<Icon name="delete" style={{ fontSize: 18, color: '#99443e' }} />}
            title="Supprimer"
            loading={isDeleting && deletingItem?.id === record.id}
            onClick={() => handleDeleteRequest({ id: record.id, name: record.name })}
          />
        </span>
      ),
    },
  ]

  const emptyState = (
    <div style={{ padding: '64px 0', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto 24px',
        borderRadius: '50%', backgroundColor: '#fff8e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="inventory_2" style={{ fontSize: 36, color: '#583b00' }} />
      </div>
      <h3 style={{ fontFamily: '"Newsreader", serif', fontSize: 24, fontWeight: 400, color: '#1b1c1c', marginBottom: 8 }}>
        Aucun lieu de stockage créé
      </h3>
      <p style={{ color: '#54433a', maxWidth: 360, margin: '0 auto 24px' }}>
        {"Créez votre premier coffre, étagère ou pièce secrète pour commencer l'archivage."}
      </p>
      <Button type="primary" onClick={() => setCreateDrawerOpen(true)}>
        Ajouter votre premier lieu
      </Button>
    </div>
  )

  const cardsEmptyState = (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
      <div style={{
        maxWidth: 560, width: '100%', textAlign: 'center',
        padding: '64px 48px', borderRadius: 24,
        background: 'rgba(246, 243, 242, 0.5)',
        border: '1px solid rgba(218, 194, 182, 0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 200, height: 200, background: 'rgba(255, 222, 172, 0.15)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 200, height: 200, background: 'rgba(254, 147, 138, 0.05)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, backgroundColor: '#fff8e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Icon name="inventory_2" style={{ fontSize: 36, color: '#583b00' }} />
          </div>
        </div>
        <h3 style={{ fontFamily: '"Newsreader", serif', fontSize: 32, fontWeight: 400, fontStyle: 'italic', color: '#292524', marginBottom: 16 }}>
          Aucun lieu de stockage créé
        </h3>
        <p style={{ color: '#78716c', fontSize: 16, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 40px' }}>
          {"Créez votre premier coffre, étagère ou pièce secrète pour commencer l'archivage."}
        </p>
        <button
            onClick={() => setCreateDrawerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
              color: 'white', border: 'none', borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: '"Manrope", sans-serif',
              boxShadow: '0 8px 24px rgba(88, 59, 0, 0.3)',
              margin: '0 auto',
            }}
        >
          <Icon name="inventory_2" style={{ fontSize: 20 }} />
          Ajouter votre premier lieu
        </button>
      </div>
    </div>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 48, fontWeight: 400,
            color: '#583b00', lineHeight: 1.1, margin: 0,
          }}>
            Lieux de Stockage
          </h1>
          <p style={{ color: '#54433a', fontSize: 14, marginTop: 8, maxWidth: 520, lineHeight: 1.6, marginBottom: 0 }}>
            {"Gérez les sanctuaires et espaces secrets où repose votre attirail mystique."}
          </p>
        </div>
        <Space>
          <Segmented
            value={viewMode}
            onChange={(val) => {
              if (val === 'table' || val === 'cards') setViewMode(val)
            }}
            options={[
              { label: 'Table', value: 'table' },
              { label: 'Cards', value: 'cards' },
            ]}
          />
          <Button
            type="primary"
            icon={<Icon name="add_circle" style={{ fontSize: 16 }} />}
            onClick={() => setCreateDrawerOpen(true)}
          >
            Ajouter un lieu
          </Button>
        </Space>
      </div>

      {viewMode === 'table' && (
        <Table
          dataSource={storageLocations}
          columns={columns}
          rowKey="id"
          style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden' }}
          locale={{ emptyText: emptyState }}
        />
      )}

      {viewMode === 'cards' && (
        storageLocations.length === 0 ? cardsEmptyState : (
          <Row gutter={[16, 16]}>
            {storageLocations.map((loc) => (
              <Col xs={24} sm={12} md={8} key={loc.id} style={{ display: 'flex' }}>
                <Card
                  hoverable
                  onClick={() => router.visit(`/storage-locations/${loc.id}`)}
                  style={{ width: '100%' }}
                  styles={{ body: { paddingTop: 48, position: 'relative' } }}
                >
                  <div
                    style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="text"
                      icon={<Icon name="edit" style={{ fontSize: 20, color: '#583b00' }} />}
                      onClick={() => handleEdit(loc)}
                      title="Modifier"
                    />
                    <Button
                      type="text"
                      icon={<Icon name="delete" style={{ fontSize: 20, color: '#99443e' }} />}
                      title="Supprimer"
                      loading={isDeleting && deletingItem?.id === loc.id}
                      onClick={() => handleDeleteRequest({ id: loc.id, name: loc.name })}
                    />
                  </div>
                  <Card.Meta
                    title={loc.name}
                    description={
                      <Space direction="vertical" size={4}>
                        <span style={{ color: '#54433a' }}>{loc.materialsCount} matériel(s)</span>
                        <span style={{ color: '#8c8c8c' }}>
                          {new Date(loc.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )
      )}

      <Drawer
        title="Ajouter un lieu"
        open={createDrawerOpen}
        onClose={() => { setCreateDrawerOpen(false); createForm.resetFields() }}
        placement="right"
        width={420}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input placeholder="ex : Tiroir cartes, Bibliothèque, Valise close-up..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createLoading}>Créer</Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="Modifier un lieu"
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); editForm.resetFields() }}
        placement="right"
        width={420}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input placeholder="ex : Tiroir cartes, Bibliothèque, Valise close-up..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={editLoading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Drawer>

      <DeleteModal
        open={deletingItem !== null}
        itemName={deletingItem?.name ?? ''}
        entityLabel="ce lieu de stockage"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </Layout>
  )
}
