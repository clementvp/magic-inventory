import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'

interface RoutineEditData {
  id: number
  name: string
  content: string | null
  categoryIds: number[]
}

interface CategoryItem {
  id: number
  name: string
}

interface Props {
  routine: RoutineEditData
  categories: CategoryItem[]
}

export default function RoutinesEdit({ routine, categories }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: {
    name: string
    categoryIds?: number[]
    content?: string | null
  }) => {
    setSubmitting(true)
    router.put(`/routines/${routine.id}`, values, {
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Layout title={routine.name}>
      <h1>Modifier la routine</h1>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{ maxWidth: 600 }}
        initialValues={{
          name: routine.name,
          categoryIds: routine.categoryIds,
          content: routine.content ?? '',
        }}
      >
        <Form.Item
          name="name"
          label="Nom"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input placeholder="Ex: La pièce voyageuse, Le détective..." />
        </Form.Item>

        <Form.Item name="categoryIds" label="Catégorie(s)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Sélectionner des catégories..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="content" label="Contenu">
          <Input.TextArea
            autoSize={{ minRows: 10, maxRows: 30 }}
            placeholder="Écrivez votre script, mise en scène, déroulé technique..."
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Enregistrer
          </Button>
          <Button
            onClick={() => router.visit(`/routines/${routine.id}`)}
            style={{ marginRight: 8 }}
          >
            Liaison matériel
          </Button>
          <Button onClick={() => router.visit(`/routines/${routine.id}`)}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
