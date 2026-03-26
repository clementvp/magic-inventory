import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Drawer, Form, Input, Table } from 'antd'
import Layout from '~/components/Layout'
import PageHeader from '~/components/PageHeader'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

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
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [editingType, setEditingType] = useState<TypeItem | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreate = (values: { name: string }) => {
    setCreateLoading(true)
    router.post('/types', { name: values.name }, {
      onSuccess: () => { setCreateDrawerOpen(false); createForm.resetFields() },
      onFinish: () => setCreateLoading(false),
    })
  }

  const handleEdit = (type: TypeItem) => {
    setEditingType(type)
    editForm.setFieldsValue({ name: type.name })
    setEditDrawerOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    if (!editingType) return
    setEditLoading(true)
    router.put(`/types/${editingType.id}`, { name: values.name }, {
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
    router.delete(`/types/${deletingItem.id}`, {
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
      render: (_: unknown, record: TypeItem) => (
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

  return (
    <Layout>
      <PageHeader
        title="Types de Matériel"
        description="Gérez les catégories de votre arsenal ésotérique. Classez vos accessoires par nature et usage pour une maîtrise parfaite de votre inventaire."
        actionLabel="Ajouter un type"
        actionIcon="add_circle"
        onAction={() => setCreateDrawerOpen(true)}
      />

      <Table
        dataSource={types}
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
                <Icon name="auto_stories" style={{ fontSize: 36, color: '#583b00' }} />
              </div>
              <h3 style={{
                fontFamily: '"Newsreader", serif',
                fontSize: 24, fontWeight: 400,
                color: '#1b1c1c', marginBottom: 8,
              }}>
                Aucun type créé
              </h3>
              <p style={{ color: '#54433a', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                Votre registre est vierge. Commencez par définir les types de matériel que vous utilisez.
              </p>
              <Button type="primary" onClick={() => setCreateDrawerOpen(true)}>
                Ajouter votre premier type
              </Button>
            </div>
          ),
        }}
      />

      <Drawer
        title="Ajouter un type"
        open={createDrawerOpen}
        onClose={() => { setCreateDrawerOpen(false); createForm.resetFields() }}
        placement="right"
        width={420}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du type est requis' }]}>
            <Input placeholder="Ex : Cartes, Cordes, Accessoires..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createLoading}>Créer</Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="Modifier un type"
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); editForm.resetFields() }}
        placement="right"
        width={420}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du type est requis' }]}>
            <Input placeholder="Ex : Cartes, Cordes, Accessoires..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={editLoading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Drawer>

      <DeleteModal
        open={deletingItem !== null}
        itemName={deletingItem?.name ?? ''}
        entityLabel="ce type"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </Layout>
  )
}
