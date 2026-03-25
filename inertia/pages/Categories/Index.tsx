import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Empty, Form, Input, Modal, Popconfirm, Table } from 'antd'
import Layout from '~/components/Layout'

interface Category {
  id: number
  name: string
  createdAt: string
}

interface Props {
  categories: Category[]
}

export default function CategoriesIndex({ categories }: Props) {
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const handleCreate = (values: { name: string }) => {
    setCreateLoading(true)
    router.post('/categories', { name: values.name }, {
      onSuccess: () => {
        setCreateModalOpen(false)
        createForm.resetFields()
      },
      onFinish: () => setCreateLoading(false),
    })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    editForm.setFieldsValue({ name: category.name })
    setEditModalOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    if (!editingCategory) return
    setEditLoading(true)
    router.put(`/categories/${editingCategory.id}`, { name: values.name }, {
      onSuccess: () => {
        setEditModalOpen(false)
        editForm.resetFields()
        setEditingCategory(null)
      },
      onFinish: () => setEditLoading(false),
    })
  }

  const handleDelete = (id: number) => {
    router.delete(`/categories/${id}`)
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
      render: (_: unknown, record: Category) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Modifier
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette catégorie ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
          >
            <Button type="link" danger>
              Supprimer
            </Button>
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
        <h1 style={{ margin: 0 }}>Catégories</h1>
        <Button
          type="primary"
          onClick={() => setCreateModalOpen(true)}
        >
          Ajouter une catégorie
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        locale={{
          emptyText: (
            <Empty description="Aucune catégorie créée">
              <Button type="primary" onClick={() => setCreateModalOpen(true)}>
                Ajouter votre première catégorie
              </Button>
            </Empty>
          ),
        }}
      />

      <Modal
        title="Ajouter une catégorie"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          createForm.resetFields()
        }}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: 'Le nom de la catégorie est requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              Créer
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Modifier la catégorie"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false)
          editForm.resetFields()
          setEditingCategory(null)
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: 'Le nom de la catégorie est requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading}>
              Enregistrer
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
