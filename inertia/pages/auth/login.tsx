import { router } from '@inertiajs/react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function Login() {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    router.post('/login', values)
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
          Connexion
        </Title>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
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
              { required: true, message: 'Veuillez saisir votre mot de passe' }
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
              Se connecter
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Pas encore de compte ?{' '}
              <a href="/register">S'inscrire</a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}
