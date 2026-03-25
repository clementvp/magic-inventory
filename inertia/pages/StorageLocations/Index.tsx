import { router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Segmented, Space, Table } from 'antd'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'

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
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<StorageLocationItem | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const handleCreate = (values: { name: string }) => {
    setCreateLoading(true)
    router.post('/storage-locations', { name: values.name }, {
      onSuccess: () => { setCreateModalOpen(false); createForm.resetFields() },
      onFinish: () => setCreateLoading(false),
    })
  }

  const handleEdit = (location: StorageLocationItem) => {
    setEditingLocation(location)
    editForm.setFieldsValue({ name: location.name })
    setEditModalOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    if (!editingLocation) return
    setEditLoading(true)
    router.put(`/storage-locations/${editingLocation.id}`, { name: values.name }, {
      onSuccess: () => { setEditModalOpen(false); editForm.resetFields() },
      onFinish: () => setEditLoading(false),
    })
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    router.delete(`/storage-locations/${id}`, {
      onFinish: () => setDeletingId(null),
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
          <Popconfirm
            title="Supprimer ce lieu de stockage ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<Icon name="delete" style={{ fontSize: 18, color: '#99443e' }} />}
              title="Supprimer"
              loading={deletingId === record.id}
            />
          </Popconfirm>
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
      <Button type="primary" onClick={() => setCreateModalOpen(true)}>
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
            onClick={() => setCreateModalOpen(true)}
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
            onClick={() => setCreateModalOpen(true)}
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
              <Col xs={24} sm={12} md={8} key={loc.id}>
                <Card
                  hoverable
                  onClick={() => router.visit(`/storage-locations/${loc.id}`)}
                  extra={
                    <span style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="text"
                        icon={<Icon name="edit" style={{ fontSize: 16, color: '#583b00' }} />}
                        onClick={() => handleEdit(loc)}
                        title="Modifier"
                      />
                      <Popconfirm
                        title="Supprimer ce lieu de stockage ?"
                        onConfirm={() => handleDelete(loc.id)}
                        okText="Supprimer"
                        cancelText="Annuler"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          icon={<Icon name="delete" style={{ fontSize: 16, color: '#99443e' }} />}
                          title="Supprimer"
                          loading={deletingId === loc.id}
                        />
                      </Popconfirm>
                    </span>
                  }
                >
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

      <Modal
        title="Ajouter un lieu"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input placeholder="ex : Tiroir cartes, Bibliothèque, Valise close-up..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createLoading}>Créer</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Modifier un lieu"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields() }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input placeholder="ex : Tiroir cartes, Bibliothèque, Valise close-up..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={editLoading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
