import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Empty, Form, Input, Modal, Popconfirm, Table } from 'antd'
import Layout from '~/components/Layout'

interface TypeItem {
  id: number
  name: string
  createdAt: string
}

interface Props {
  types: TypeItem[]
}

export default function TypesIndex({ types }: Props) {
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<TypeItem | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const handleCreate = (values: { name: string }) => {
    setCreateLoading(true)
    router.post('/types', { name: values.name }, {
      onSuccess: () => { setCreateModalOpen(false); createForm.resetFields() },
      onFinish: () => setCreateLoading(false),
    })
  }

  const handleEdit = (type: TypeItem) => {
    setEditingType(type)
    editForm.setFieldsValue({ name: type.name })
    setEditModalOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    if (!editingType) return
    setEditLoading(true)
    router.put(`/types/${editingType.id}`, { name: values.name }, {
      onSuccess: () => { setEditModalOpen(false); editForm.resetFields() },
      onFinish: () => setEditLoading(false),
    })
  }

  const handleDelete = (id: number) => {
    router.delete(`/types/${id}`)
  }

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: TypeItem) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce type ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
          >
            <Button type="link" danger>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <Layout>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
      >
        <h1 style={{ margin: 0 }}>Types</h1>
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
          Ajouter un type
        </Button>
      </div>
      <Table
        dataSource={types}
        columns={columns}
        rowKey="id"
        locale={{
          emptyText: (
            <Empty description="Aucun type créé">
              <Button type="primary" onClick={() => setCreateModalOpen(true)}>
                Ajouter votre premier type
              </Button>
            </Empty>
          ),
        }}
      />

      <Modal
        title="Ajouter un type"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du type est requis' }]}>
            <Input placeholder="Ex: Cartes, Cordes, Accessoires..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createLoading}>Créer</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Modifier un type"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields() }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du type est requis' }]}>
            <Input placeholder="Ex: Cartes, Cordes, Accessoires..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
