import { router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Descriptions, Popconfirm, Space, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import Layout from '~/components/Layout'

dayjs.locale('fr')

interface MaterialDetail {
  id: number
  name: string
  type: { id: number; name: string } | null
  categories: { id: number; name: string }[]
  storageLocation: { id: number; name: string } | null
  author: string | null
  createdAt: string
}

interface Props {
  material: MaterialDetail
}

export default function MaterialsShow({ material }: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleting(true)
    router.delete(`/materials/${material.id}`, {
      onSuccess: () => router.visit('/materials'),
      onError: () => setDeleting(false),
    })
  }

  return (
    <Layout title={material.name}>
      <Typography.Title level={1}>{material.name}</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.visit(`/materials/${material.id}/edit`)}>
          Modifier
        </Button>
        <Popconfirm
          title="Êtes-vous sûr de vouloir supprimer ce matériel ?"
          onConfirm={handleDelete}
          okText="Supprimer"
          cancelText="Annuler"
        >
          <Button danger loading={deleting}>Supprimer</Button>
        </Popconfirm>
        <Button onClick={() => router.visit('/materials')}>Retour à l'inventaire</Button>
      </Space>

      <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Nom">{material.name}</Descriptions.Item>
        <Descriptions.Item label="Type">
          {material.type ? <Tag color="blue">{material.type.name}</Tag> : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Catégorie(s)">
          {material.categories.length > 0
            ? material.categories.map((c) => <Tag key={c.id}>{c.name}</Tag>)
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Lieu de stockage">
          {material.storageLocation ? (
            <Link href={`/storage-locations/${material.storageLocation.id}`}>
              {material.storageLocation.name}
            </Link>
          ) : (
            '—'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Auteur">{material.author ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Date d'ajout">
          {dayjs(material.createdAt).format('DD MMMM YYYY')}
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title level={2}>Utilisé dans les routines suivantes :</Typography.Title>
      <Typography.Text type="secondary">
        Ce matériel n'est utilisé dans aucune routine
      </Typography.Text>
    </Layout>
  )
}
