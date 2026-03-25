import { router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Empty, Form, Input, Modal, Popconfirm, Table } from 'antd'
import Layout from '~/components/Layout'

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
        <Link href={`/storage-locations/${record.id}`}>{name}</Link>
      ),
    },
    {
      title: "Nombre d'items",
      dataIndex: 'materialsCount',
      key: 'materialsCount',
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: StorageLocationItem) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce lieu ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
          >
            <Button type="link" danger loading={deletingId === record.id}>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <Layout>
      <h1>Lieux de Stockage</h1>
      <Button type="primary" onClick={() => setCreateModalOpen(true)} style={{ marginBottom: 16 }}>
        Ajouter un lieu
      </Button>
      <Table
        dataSource={storageLocations}
        columns={columns}
        rowKey="id"
        locale={{
          emptyText: (
            <Empty description="Aucun lieu de stockage créé">
              <Button type="primary" onClick={() => setCreateModalOpen(true)}>
                Ajouter votre premier lieu
              </Button>
            </Empty>
          ),
        }}
      />

      <Modal
        title="Ajouter un lieu"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input placeholder="ex : Tiroir cartes, Bibliothèque, Valise close-up, Boîte pièces" />
          </Form.Item>
          <Form.Item>
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
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input placeholder="ex : Tiroir cartes, Bibliothèque, Valise close-up, Boîte pièces" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
