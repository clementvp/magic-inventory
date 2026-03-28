import { useState } from 'react'
import { router, Link, Head } from '@inertiajs/react'
import { Form, Input, Button, Typography } from 'antd'
import Icon from '~/components/Icon'

const { Text } = Typography

interface RegisterFormValues {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
}

const FEATURES = [
  { icon: 'magic_button', label: 'Inventaire de matériels', desc: 'Cataloguez chaque accessoire de magie' },
  { icon: 'auto_fix_high', label: 'Routines organisées', desc: 'Structurez vos numéros et séquences' },
  { icon: 'theater_comedy', label: 'Gestion des spectacles', desc: 'Préparez vos shows avec une checklist' },
]

export default function Register() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)

  if (typeof window !== 'undefined') {
    window.onresize = () => setIsMobile(window.innerWidth < 768)
  }

  const onFinish = (values: RegisterFormValues) => {
    setLoading(true)
    router.post('/register', values, {
      onError: (errors) => {
        setLoading(false)
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
    <>
      <Head title="Inscription" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Panneau gauche — identité de marque */}
        {!isMobile && (
          <div style={{
            width: 440,
            flexShrink: 0,
            background: '#1c1917',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Halo décoratif */}
            <div style={{
              position: 'absolute',
              top: -120,
              left: -120,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              bottom: -80,
              right: -80,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Logo */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Icon name="auto_fix_high" style={{ fontSize: 28, color: '#f59e0b' }} />
              </div>
              <div style={{
                fontFamily: "'Newsreader', serif",
                fontStyle: 'italic',
                fontSize: 38,
                fontWeight: 500,
                color: '#f59e0b',
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
                marginBottom: 12,
              }}>
                Arcane Ledger
              </div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
                color: '#a8a29e',
                fontWeight: 400,
                lineHeight: 1.6,
              }}>
                L'inventaire du magicien moderne.<br />
                Organisez, planifiez, performez.
              </div>
            </div>

            {/* Features */}
            <div>
              <div style={{
                borderTop: '1px solid rgba(245,158,11,0.2)',
                paddingTop: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}>
                {FEATURES.map(({ icon, label, desc }) => (
                  <div key={icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(245,158,11,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon name={icon} style={{ fontSize: 18, color: '#f59e0b' }} />
                    </div>
                    <div>
                      <div style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#e7e5e4',
                        marginBottom: 2,
                      }}>
                        {label}
                      </div>
                      <div style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 12,
                        color: '#78716c',
                        lineHeight: 1.5,
                      }}>
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 11,
              color: '#44403c',
              letterSpacing: '0.05em',
            }}>
              © 2025 Arcane Ledger
            </div>
          </div>
        )}

        {/* Panneau droit — formulaire */}
        <div style={{
          flex: 1,
          background: '#fcf9f8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
        }}>
          {/* Lien retour */}
          <div style={{ position: 'absolute', top: 24, left: 24 }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              color: '#78716c',
              textDecoration: 'none',
              fontFamily: "'Manrope', sans-serif",
            }}>
              <Icon name="arrow_back" style={{ fontSize: 16, color: '#78716c' }} />
              Accueil
            </Link>
          </div>

          <div style={{ width: '100%', maxWidth: 400 }}>
            <h2 style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 36,
              fontWeight: 400,
              color: '#583b00',
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 8,
            }}>
              Créer un compte
            </h2>
            <Text style={{
              display: 'block',
              marginBottom: 32,
              color: '#78716c',
              fontFamily: "'Manrope', sans-serif",
              fontSize: 14,
            }}>
              Rejoignez Arcane Ledger et organisez votre magie.
            </Text>

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
                  prefix={<Icon name="person" style={{ fontSize: 16, color: '#a8a29e' }} />}
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
                  prefix={<Icon name="mail" style={{ fontSize: 16, color: '#a8a29e' }} />}
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
                  prefix={<Icon name="lock" style={{ fontSize: 16, color: '#a8a29e' }} />}
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
                  prefix={<Icon name="lock" style={{ fontSize: 16, color: '#a8a29e' }} />}
                  placeholder="Confirmer le mot de passe"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                >
                  Créer mon compte
                </Button>
              </Form.Item>
            </Form>

            <div style={{
              marginTop: 16,
              paddingTop: 24,
              borderTop: '1px solid #ede8e4',
              textAlign: 'center',
            }}>
              <Text style={{
                fontSize: 14,
                color: '#78716c',
                fontFamily: "'Manrope', sans-serif",
              }}>
                Déjà un compte ?{' '}
                <Link href="/login" style={{ color: '#765100', fontWeight: 600 }}>
                  Se connecter
                </Link>
              </Text>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
