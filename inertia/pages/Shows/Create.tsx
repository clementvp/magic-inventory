import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input } from 'antd'
import Layout from '~/components/Layout'
import RoutineSetlistBuilder from '~/components/RoutineSetlistBuilder'
import SectionAccordion from '~/components/SectionAccordion'

interface RoutineOption {
  id: number
  name: string
  categories: { id: number; name: string }[]
}

interface Props {
  allRoutines: RoutineOption[]
}


export default function ShowsCreate({ allRoutines }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [routineIds, setRoutineIds] = useState<number[]>([])

  const handleSubmit = (values: { name: string; notes?: string }) => {
    setSubmitting(true)
    router.post('/shows', { ...values, routineIds }, {
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Créer un spectacle">
      <div style={{ marginBottom: 32, maxWidth: 1100, margin: '0 auto 32px' }}>
        <h1
          style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 48,
            fontWeight: 400,
            color: '#583b00',
            lineHeight: 1.1,
            margin: '8px 0 8px',
          }}
        >
          Nouveau Spectacle
        </h1>
        <p style={{ color: '#54433a', fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
          Composez votre programme en assemblant vos routines, puis ajoutez vos notes.
        </p>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '32px 40px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <p style={{ fontSize: 15, fontWeight: 600, color: '#583b00', marginBottom: 16, marginTop: 4 }}>Identité</p>

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

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <SectionAccordion title="Notes">
            <Form.Item name="notes" label={null}>
              <Input.TextArea
                autoSize={{ minRows: 4, maxRows: 20 }}
                placeholder="Contexte, consignes de scène, timing, notes techniques..."
              />
            </Form.Item>
          </SectionAccordion>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <SectionAccordion title="Programme">
            <Form.Item label={null}>
              <RoutineSetlistBuilder
                allRoutines={allRoutines}
                value={routineIds}
                onChange={setRoutineIds}
              />
            </Form.Item>
          </SectionAccordion>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <div
              style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}
            >
              <Button type="primary" htmlType="submit" loading={submitting}>
                Créer le spectacle
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  )
}
