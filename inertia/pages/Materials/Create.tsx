import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'
import SectionAccordion from '~/components/SectionAccordion'

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (values: {
    name: string
    typeId?: number
    storageLocationId?: number
    author?: string
  }) => {
    setSubmitting(true)
    router.post('/materials', { ...values, categoryIds: selectedCategoryIds }, {
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Ajouter un matériel">
      <div style={{ marginBottom: 32, maxWidth: 1100, margin: '0 auto 32px' }}>
        <h1 style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 48,
          fontWeight: 400,
          color: '#583b00',
          lineHeight: 1.1,
          margin: '8px 0 8px',
        }}>
          Nouveau Matériel
        </h1>
        <p style={{ color: '#54433a', fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
          Ajoutez un accessoire, un effet ou une ressource à votre répertoire magique.
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

          <Form.Item
            name="name"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Ex: Bicycle Standard, Thumb Tip, Foulard..." />
          </Form.Item>

          <Form.Item name="author" label="Auteur">
            <Input placeholder="Ex: Paul Curry, Dai Vernon, Juan Tamariz..." />
          </Form.Item>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <SectionAccordion title="Classification">
            <Form.Item name="typeId" label="Type">
              <Select
                allowClear
                placeholder="Sélectionner un type..."
                options={types.map((t) => ({ label: t.name, value: t.id }))}
              />
            </Form.Item>

            <Form.Item label="Catégories">
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

          <SectionAccordion title="Lieu de stockage">
            <Form.Item name="storageLocationId" label={null}>
              <Select
                allowClear
                placeholder="Sélectionner un lieu..."
                options={storageLocations.map((l) => ({ label: l.name, value: l.id }))}
              />
            </Form.Item>
          </SectionAccordion>

          <div style={{ borderTop: '1px solid #f0ebe8', margin: '8px 0 24px' }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Créer le matériel
              </Button>
            </div>
          </Form.Item>

        </Form>
      </div>
    </Layout>
  )
}
