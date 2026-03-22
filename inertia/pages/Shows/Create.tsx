import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input } from 'antd'
import Layout from '~/components/Layout'

export default function ShowsCreate() {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: { name: string }) => {
    setSubmitting(true)
    router.post('/shows', values, {
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Créer un spectacle">
      <h1>Créer un spectacle</h1>
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          name="name"
          label="Nom"
          rules={[
            { required: true, message: 'Le nom est requis' },
            { whitespace: true, message: 'Le nom est requis' },
          ]}
        >
          <Input placeholder="Ex: Soirée mariage, Festival d'été, Corporate Lyon..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Créer le spectacle
          </Button>
          <Button onClick={() => router.visit('/shows')}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
