import { router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Empty, Form, Input, List, Modal, Popconfirm, Select, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'

interface RoutineEditData {
  id: number
  name: string
  content: string | null
  categoryIds: number[]
}

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  storageLocation: { id: number; name: string } | null
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
  routine: RoutineEditData & { materials: MaterialItem[] }
  categories: CategoryItem[]
  allMaterials: MaterialOption[]
}

export default function RoutinesEdit({ routine, categories, allMaterials }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([])
  const [submittingMaterial, setSubmittingMaterial] = useState(false)

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

  const handleAttach = () => {
    if (selectedMaterialIds.length === 0) return
    setSubmittingMaterial(true)
    router.post(
      `/routines/${routine.id}/materials`,
      { materialIds: selectedMaterialIds },
      {
        onSuccess: () => {
          setModalOpen(false)
          setSelectedMaterialIds([])
        },
        onFinish: () => setSubmittingMaterial(false),
      }
    )
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
          <Button onClick={() => router.visit(`/routines/${routine.id}`)}>Annuler</Button>
        </Form.Item>
      </Form>

      <Typography.Title level={3} style={{ marginTop: 32 }}>
        Matériel utilisé
      </Typography.Title>

      <Button onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
        Ajouter du matériel
      </Button>

      {routine.materials.length === 0 ? (
        <Empty description="Aucun matériel lié à cette routine" />
      ) : (
        <List
          bordered
          dataSource={routine.materials}
          renderItem={(m) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="retirer"
                  title="Retirer ce matériel de la routine ?"
                  onConfirm={() => router.delete(`/routines/${routine.id}/materials/${m.id}`)}
                  okText="Retirer"
                  cancelText="Annuler"
                >
                  <Button danger size="small">
                    Retirer
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={<Link href={`/materials/${m.id}`}>{m.name}</Link>}
                description={
                  <>
                    {m.type ? <Tag color="blue">{m.type.name}</Tag> : '—'}
                    {m.storageLocation ? ` · ${m.storageLocation.name}` : ''}
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title="Ajouter du matériel"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelectedMaterialIds([])
        }}
        onOk={handleAttach}
        confirmLoading={submittingMaterial}
        okText="Ajouter"
        cancelText="Annuler"
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Rechercher du matériel..."
          filterOption={(input, option) =>
            typeof option?.label === 'string' &&
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          options={allMaterials.map((m) => ({ label: m.name, value: m.id }))}
          onChange={(values) => setSelectedMaterialIds(values)}
          value={selectedMaterialIds}
        />
      </Modal>
    </Layout>
  )
}
