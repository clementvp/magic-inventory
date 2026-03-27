import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input } from 'antd'
import Layout from '~/components/Layout'
import SectionAccordion from '~/components/SectionAccordion'
import MaterialPickerBuilder from '~/components/MaterialPickerBuilder'

interface RoutineEditData {
  id: number
  name: string
  content: string | null
  categoryIds: number[]
  materials: { id: number; name: string }[]
}

interface MaterialOption {
  id: number
  name: string
}

interface CategoryItem {
  id: number
  name: string
}

interface Props {
  routine: RoutineEditData
  categories: CategoryItem[]
  allMaterials: MaterialOption[]
}

export default function RoutinesEdit({ routine, categories, allMaterials }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(routine.categoryIds)
  const [materialIds, setMaterialIds] = useState<number[]>(routine.materials.map((m) => m.id))

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (values: { name: string; content?: string | null }) => {
    setSubmitting(true)
    router.put(`/routines/${routine.id}`, { ...values, categoryIds: selectedCategoryIds, materialIds }, {
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Modifier la routine" breadcrumbLabels={{ [String(routine.id)]: routine.name }}>
      <div style={{ marginBottom: 32, maxWidth: 1100, margin: '0 auto 32px' }}>
        <h1 style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 48,
          fontWeight: 400,
          color: '#583b00',
          lineHeight: 1.1,
          margin: '8px 0 8px',
        }}>
          Modifier la routine
        </h1>
        <p style={{ color: '#54433a', fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
          Mettez à jour les informations et le contenu de cette routine.
        </p>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '32px 40px',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            name: routine.name,
            content: routine.content ?? '',
          }}
        >

          <p style={{ fontSize: 15, fontWeight: 600, color: '#583b00', marginBottom: 16, marginTop: 4 }}>Identité</p>

          <Form.Item
            name="name"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Ex: La pièce voyageuse, Le détective..." />
          </Form.Item>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <SectionAccordion title="Catégories">
            <Form.Item label={null}>
              {categories.length === 0 ? (
                <span style={{ color: '#8c8c8c', fontSize: 13 }}>Aucune catégorie disponible</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map((cat) => {
                    const selected = selectedCategoryIds.includes(cat.id)
                    return (
                      <span
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        style={{
                          cursor: 'pointer',
                          background: selected ? '#583b00' : '#fff8e8',
                          color: selected ? '#ffffff' : '#583b00',
                          border: `1px solid ${selected ? '#583b00' : '#dac2b6'}`,
                          borderRadius: 6,
                          padding: '4px 12px',
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: '"Manrope", sans-serif',
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {cat.name}
                      </span>
                    )
                  })}
                </div>
              )}
            </Form.Item>
          </SectionAccordion>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <SectionAccordion title="Notes">
            <Form.Item name="content" label={null}>
              <Input.TextArea
                autoSize={{ minRows: 6, maxRows: 30 }}
                placeholder="Écrivez votre script, mise en scène, déroulé technique..."
              />
            </Form.Item>
          </SectionAccordion>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <SectionAccordion title="Matériel">
            <Form.Item label={null}>
              <MaterialPickerBuilder
                allMaterials={allMaterials}
                value={materialIds}
                onChange={setMaterialIds}
              />
            </Form.Item>
          </SectionAccordion>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Enregistrer les modifications
              </Button>
            </div>
          </Form.Item>

        </Form>
      </div>
    </Layout>
  )
}
