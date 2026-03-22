import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Empty, Form, Input, List, Modal, Popconfirm, Select, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'

interface RoutineOption {
  id: number
  name: string
}

interface LinkedRoutine {
  id: number
  name: string
  categories: { id: number; name: string }[]
}

interface ShowEditData {
  id: number
  name: string
  routines: LinkedRoutine[]
}

interface Props {
  show: ShowEditData
  allRoutines: RoutineOption[]
}

export default function ShowsEdit({ show, allRoutines }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<number[]>([])
  const [submittingRoutine, setSubmittingRoutine] = useState(false)

  const handleSubmit = (values: { name: string }) => {
    setSubmitting(true)
    router.put(`/shows/${show.id}`, values, {
      onFinish: () => setSubmitting(false),
    })
  }

  const linkedRoutineIds = new Set(show.routines.map((r) => r.id))
  const availableRoutines = allRoutines.filter((r) => !linkedRoutineIds.has(r.id))

  const handleAttach = () => {
    if (selectedRoutineIds.length === 0) return
    setSubmittingRoutine(true)
    router.post(
      `/shows/${show.id}/routines`,
      { routineIds: selectedRoutineIds },
      {
        onSuccess: () => {
          setModalOpen(false)
          setSelectedRoutineIds([])
        },
        onFinish: () => setSubmittingRoutine(false),
      }
    )
  }

  return (
    <Layout title="Modifier le spectacle">
      <Typography.Title level={1}>Modifier le spectacle</Typography.Title>

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{ maxWidth: 600 }}
        initialValues={{ name: show.name }}
      >
        <Form.Item
          name="name"
          label="Nom"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input placeholder="Ex: Soirée mariage, Festival d'été..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Enregistrer
          </Button>
          <Button onClick={() => router.visit('/shows')}>Annuler</Button>
        </Form.Item>
      </Form>

      <Typography.Title level={3} style={{ marginTop: 32 }}>
        Routines du spectacle
      </Typography.Title>

      <Button onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
        Ajouter des routines
      </Button>

      {show.routines.length === 0 ? (
        <Empty description="Aucune routine dans ce spectacle" />
      ) : (
        <List
          bordered
          dataSource={show.routines}
          renderItem={(r) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="retirer"
                  title="Retirer cette routine du spectacle ?"
                  onConfirm={() => router.delete(`/shows/${show.id}/routines/${r.id}`)}
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
                title={r.name}
                description={
                  r.categories.length > 0
                    ? r.categories.map((c) => (
                        <Tag key={c.id}>{c.name}</Tag>
                      ))
                    : '—'
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title="Ajouter des routines"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelectedRoutineIds([])
        }}
        onOk={handleAttach}
        confirmLoading={submittingRoutine}
        okText="Ajouter"
        cancelText="Annuler"
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Rechercher une routine..."
          filterOption={(input, option) =>
            typeof option?.label === 'string' &&
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          options={availableRoutines.map((r) => ({ label: r.name, value: r.id }))}
          onChange={(values) => setSelectedRoutineIds(values)}
          value={selectedRoutineIds}
        />
      </Modal>
    </Layout>
  )
}
