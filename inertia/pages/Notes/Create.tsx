import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input } from 'antd'
import Layout from '~/components/Layout'

export default function NotesCreate() {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: { title?: string; content?: string }) => {
    setSubmitting(true)
    router.post('/notes', values, {
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Nouvelle note">
      <div style={{ marginBottom: 32, maxWidth: 1100, margin: '0 auto 32px' }}>
        <h1 style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 48,
          fontWeight: 400,
          color: '#583b00',
          lineHeight: 1.1,
          margin: '8px 0 8px',
        }}>
          Nouvelle note
        </h1>
        <p style={{ color: '#54433a', fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
          Créez une nouvelle note pour conserver vos idées, références ou observations.
        </p>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '32px 40px',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">

          <p style={{ fontSize: 15, fontWeight: 600, color: '#583b00', marginBottom: 16, marginTop: 4 }}>Identité</p>

          <Form.Item name="title" label="Titre">
            <Input autoFocus placeholder="Titre de la note..." />
          </Form.Item>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <p style={{ fontSize: 15, fontWeight: 600, color: '#583b00', marginBottom: 16, marginTop: 4 }}>Contenu</p>

          <Form.Item name="content" label={null}>
            <Input.TextArea
              placeholder="Écrivez votre note ici..."
              autoSize={{ minRows: 10, maxRows: 30 }}
            />
          </Form.Item>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Enregistrer la note
              </Button>
            </div>
          </Form.Item>

        </Form>
      </div>
    </Layout>
  )
}
