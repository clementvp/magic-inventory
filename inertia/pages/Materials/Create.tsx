import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'

interface TypeItem {
  id: number
  name: string
}

interface CategoryItem {
  id: number
  name: string
}

interface LocationItem {
  id: number
  name: string
}

interface Props {
  types: TypeItem[]
  categories: CategoryItem[]
  storageLocations: LocationItem[]
}

export default function MaterialsCreate({ types, categories, storageLocations }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: {
    name: string
    typeId?: number
    categoryIds?: number[]
    storageLocationId?: number
    author?: string
  }) => {
    setSubmitting(true)
    router.post('/materials', values, {
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Ajouter un matériel">
      <h1>Ajouter un matériel</h1>
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          name="name"
          label="Nom"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input placeholder="Ex: Bicycle Standard, Thumb Tip, Foulard..." />
        </Form.Item>

        <Form.Item name="typeId" label="Type">
          <Select
            allowClear
            placeholder="Sélectionner un type..."
            options={types.map((t) => ({ label: t.name, value: t.id }))}
          />
        </Form.Item>

        <Form.Item name="categoryIds" label="Catégorie(s)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Sélectionner des catégories..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="storageLocationId" label="Lieu de stockage">
          <Select
            allowClear
            placeholder="Sélectionner un lieu..."
            options={storageLocations.map((l) => ({ label: l.name, value: l.id }))}
          />
        </Form.Item>

        <Form.Item name="author" label="Auteur">
          <Input placeholder="Ex: Paul Curry, Dai Vernon, Juan Tamariz..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Créer le matériel
          </Button>
          <Button onClick={() => router.visit('/materials')}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
