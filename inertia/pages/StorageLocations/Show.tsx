import { router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Empty, Form, Input, List, Modal, Popconfirm } from 'antd'
import Layout from '~/components/Layout'

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
  const [deletingId, setDeletingId] = useState<number | null>(null)

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
    setDeletingId(location.id)
    router.delete(`/storage-locations/${location.id}`, {
      onSuccess: () => router.visit('/storage-locations'),
      onError: () => setDeletingId(null),
    })
  }

  return (
    <Layout title={location.name}>
      <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: '0 0 24px' }}>{location.name}</h1>

      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleEdit} style={{ marginRight: 8 }}>
          Modifier le lieu
        </Button>
        <Popconfirm
          title="Êtes-vous sûr de vouloir supprimer ce lieu ?"
          onConfirm={handleDelete}
          okText="Supprimer"
          cancelText="Annuler"
        >
          <Button danger loading={deletingId === location.id}>
            Supprimer le lieu
          </Button>
        </Popconfirm>
      </div>

      {materials.length > 0 ? (
        <List
          dataSource={materials}
          renderItem={(material) => (
            <List.Item key={material.id}>
              <Link href={`/materials/${material.id}`}>
                <strong>{material.name}</strong>
                {material.type && <span> — {material.type}</span>}
                {material.categories && material.categories.length > 0 && (
                  <span> [{material.categories.join(', ')}]</span>
                )}
                {material.author && <span> par {material.author}</span>}
              </Link>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Aucun matériel dans ce lieu" style={{ marginTop: 48 }}>
          <Button type="primary">
            <Link href="/materials/create">Ajouter un matériel</Link>
          </Button>
        </Empty>
      )}

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
