import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Modal, Popconfirm, Table } from 'antd'
import Layout from '~/components/Layout'
import PageHeader from '~/components/PageHeader'
import Icon from '~/components/Icon'

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
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span style={{ fontWeight: 600, color: '#1b1c1c' }}>{name}</span>
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
      render: (_: unknown, record: Category) => (
        <span style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button
            type="text"
            icon={<Icon name="edit" style={{ fontSize: 18, color: '#583b00' }} />}
            onClick={() => handleEdit(record)}
            title="Modifier"
          />
          <Popconfirm
            title="Supprimer cette catégorie ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<Icon name="delete" style={{ fontSize: 18, color: '#99443e' }} />}
              title="Supprimer"
            />
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <Layout>
      <PageHeader
        title="Catégories"
        description="Gérez les différents domaines de votre répertoire magique. Organisez vos secrets par discipline pour une maîtrise parfaite de votre arsenal."
        actionLabel="Ajouter une catégorie"
        actionIcon="add_circle"
        onAction={() => setCreateModalOpen(true)}
      />

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden' }}
        locale={{
          emptyText: (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, margin: '0 auto 24px',
                borderRadius: '50%', backgroundColor: '#fff8e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="category" style={{ fontSize: 36, color: '#583b00' }} />
              </div>
              <h3 style={{
                fontFamily: '"Newsreader", serif',
                fontSize: 24, fontWeight: 400,
                color: '#1b1c1c', marginBottom: 8,
              }}>
                Aucune catégorie créée
              </h3>
              <p style={{ color: '#54433a', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                Commencez par définir les domaines de votre répertoire magique.
              </p>
              <Button type="primary" onClick={() => setCreateModalOpen(true)}>
                Ajouter votre première catégorie
              </Button>
            </div>
          ),
        }}
      />

      <Modal
        title="Ajouter une catégorie"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: 'Le nom de la catégorie est requis' }]}
          >
            <Input placeholder="Ex : Cartomagie, Mentalisme, Close-up..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              Créer
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Modifier la catégorie"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); setEditingCategory(null) }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: 'Le nom de la catégorie est requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={editLoading}>
              Enregistrer
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
