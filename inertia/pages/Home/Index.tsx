import { Button, Typography } from 'antd'
import { Link } from '@inertiajs/react'

const { Title, Paragraph } = Typography

export default function Index() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 48,
        textAlign: 'center',
      }}
    >
      <Title level={1} style={{ marginBottom: 24 }}>
        magic-inventory
      </Title>

      <Title level={3} style={{ marginBottom: 24, fontWeight: 'normal' }}>
        Organisez la magie
      </Title>

      <Paragraph
        style={{
          fontSize: 16,
          maxWidth: 600,
          marginBottom: 48,
          color: 'rgba(0, 0, 0, 0.65)',
        }}
      >
        Centralisez votre inventaire, routines et spectacles en un seul endroit.
      </Paragraph>

      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/register">
          <Button type="primary" size="large">
            S'inscrire
          </Button>
        </Link>

        <Link href="/login">
          <Button type="default" size="large">
            Se connecter
          </Button>
        </Link>
      </div>
    </div>
  )
}
