import { router, Link } from '@inertiajs/react'
import { Form, Input, Button, Card, Typography, theme } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { useToken } = theme

interface LoginFormValues {
  email: string
  password: string
  [key: string]: string
}

export default function Login() {
  const [form] = Form.useForm()
  const { token } = useToken()

  const onFinish = (values: LoginFormValues) => {
    router.post('/login', values, {
      onError: (errors) => {
        // Afficher les erreurs de validation serveur dans le formulaire
        const formErrors = Object.entries(errors).map(([field, messages]) => ({
          name: field,
          errors: Array.isArray(messages) ? messages : [messages as string]
        }))
        form.setFields(formErrors)
      }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: token.colorBgLayout
    }}>
      <Card style={{ width: 400, boxShadow: token.boxShadow }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: token.marginLG }}>
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
              style={{ marginTop: token.margin }}
            >
              Se connecter
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Pas encore de compte ?{' '}
              <Link href="/register">S'inscrire</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}
