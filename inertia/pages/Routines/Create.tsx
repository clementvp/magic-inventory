import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'

interface CategoryItem {
  id: number
  name: string
}

interface Props {
  categories: CategoryItem[]
}

export default function RoutinesCreate({ categories }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: { name: string; categoryIds?: number[] }) => {
    setSubmitting(true)
    router.post('/routines', values, {
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Créer une routine">
      <h1>Créer une routine</h1>
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          name="name"
          label="Nom"
          rules={[
            { required: true, message: 'Le nom est requis' },
            { whitespace: true, message: 'Le nom est requis' },
          ]}
        >
          <Input placeholder="Ex: La pièce voyageuse, Le détective, Ambitious Card..." />
        </Form.Item>

        <Form.Item name="categoryIds" label="Catégorie(s)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Sélectionner des catégories..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Créer la routine
          </Button>
          <Button onClick={() => router.visit('/routines')}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
