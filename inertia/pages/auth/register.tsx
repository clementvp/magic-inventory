import { useState } from 'react'
import { router, Link } from '@inertiajs/react'
import { Form, Input, Button, Card, Typography, theme } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { useToken } = theme

interface RegisterFormValues {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
}

export default function Register() {
  const [form] = Form.useForm()
  const { token } = useToken()
  const [loading, setLoading] = useState(false)

  const onFinish = (values: RegisterFormValues) => {
    setLoading(true)
    router.post('/register', values, {
      onError: (errors) => {
        setLoading(false)
        // Afficher les erreurs de validation serveur dans le formulaire
        const formErrors = Object.entries(errors).map(([field, messages]) => ({
          name: field,
          errors: Array.isArray(messages) ? messages : [messages as string]
        }))
        form.setFields(formErrors)
      },
      onFinish: () => setLoading(false)
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
              { required: true, message: 'Veuillez saisir votre nom complet' },
              { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
              { max: 255, message: 'Le nom ne peut pas dépasser 255 caractères' }
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
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mot de passe"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="passwordConfirmation"
            label="Confirmer le mot de passe"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Veuillez confirmer votre mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirmer le mot de passe"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ marginTop: token.margin }}
            >
              S'inscrire
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Déjà un compte ?{' '}
              <Link href="/login">Se connecter</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}
