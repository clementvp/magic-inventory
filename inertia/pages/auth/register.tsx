import { router } from '@inertiajs/react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function Register() {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    router.post('/register', values)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Inscription
        </Title>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="fullName"
            label="Nom complet"
            rules={[
              { required: true, message: 'Veuillez saisir votre nom complet' }
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
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="votre@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Veuillez saisir votre mot de passe' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mot de passe"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{ marginTop: 16 }}
            >
              S'inscrire
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Déjà un compte ?{' '}
              <a href="/login">Se connecter</a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}
