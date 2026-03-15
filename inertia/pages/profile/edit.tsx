import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { Form, Input, Button, Card, Typography, theme, Divider, Modal } from 'antd'
import { MailOutlined, UserOutlined } from '@ant-design/icons'
import Layout from '~/components/Layout'

const { Title } = Typography
const { useToken } = theme

interface User {
  id: number
  fullName: string | null
  email: string
}

interface ProfileFormValues {
  fullName: string
  email: string
}

interface Props {
  user: User
}

export default function ProfileEdit({ user }: Props) {
  const [form] = Form.useForm()
  const { token } = useToken()
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    form.setFieldsValue({
      fullName: user.fullName ?? '',
      email: user.email,
    })
  }, [user, form])

  const onFinish = (values: ProfileFormValues) => {
    setLoading(true)
    router.post('/profile', values, {
      onError: (errors) => {
        setLoading(false)
        const formErrors = Object.entries(errors).map(([field, messages]) => ({
          name: field,
          errors: Array.isArray(messages) ? messages : [messages as string],
        }))
        form.setFields(formErrors)
      },
      onSuccess: () => setLoading(false),
    })
  }

  const handleExport = () => {
    window.location.href = '/profile/export'
  }

  const handleDeleteAccount = () => {
    setDeleteLoading(true)
    router.delete('/profile', {
      onSuccess: () => setDeleteLoading(false),
    })
  }

  return (
    <Layout>
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Title level={2} style={{ marginBottom: token.marginLG }}>
          Mon Profil
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="fullName"
            label="Nom complet"
            rules={[
              { required: true, message: 'Veuillez saisir votre nom complet' },
              { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
              { max: 255, message: 'Le nom ne peut pas dépasser 255 caractères' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Votre nom complet"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email' },
              { type: 'email', message: 'Email invalide' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="votre@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Enregistrer
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div>
          <Title level={4} style={{ marginBottom: token.marginSM }}>
            Mes données
          </Title>
          <p style={{ marginBottom: token.marginSM }}>
            Téléchargez une copie complète de vos données personnelles au format JSON.
          </p>
          <Button type="default" onClick={handleExport}>
            Exporter mes données
          </Button>
        </div>

        <Divider />

        <div>
          <Title level={4} style={{ color: token.colorError, marginBottom: token.marginSM }}>
            Zone dangereuse
          </Title>
          <Button danger type="primary" onClick={() => setDeleteModalOpen(true)}>
            Supprimer mon compte
          </Button>
        </div>

        <Modal
          title="Êtes-vous sûr de vouloir supprimer votre compte ?"
          open={deleteModalOpen}
          onOk={handleDeleteAccount}
          onCancel={() => setDeleteModalOpen(false)}
          okText="Supprimer"
          cancelText="Annuler"
          okButtonProps={{ danger: true, loading: deleteLoading }}
        >
          <p>
            Cette action est irréversible. Toutes vos données seront supprimées définitivement.
          </p>
        </Modal>
      </Card>
    </Layout>
  )
}
