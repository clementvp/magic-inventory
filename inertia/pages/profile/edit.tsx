import { useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { Form, Input, Button, Modal } from 'antd'
import Icon from '~/components/Icon'
import Layout from '~/components/Layout'
import DeleteModal from '~/components/DeleteModal'

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

interface PasswordFormValues {
  currentPassword: string
  newPassword: string
  newPasswordConfirmation: string
}

export default function ProfileEdit({ user }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [passwordForm] = Form.useForm()
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

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

  const onPasswordFinish = (values: PasswordFormValues) => {
    setPasswordLoading(true)
    router.post('/profile/password', values, {
      onError: (errors) => {
        setPasswordLoading(false)
        const formErrors = Object.entries(errors).map(([field, messages]) => ({
          name: field,
          errors: Array.isArray(messages) ? messages : [messages as string],
        }))
        passwordForm.setFields(formErrors)
      },
      onSuccess: () => {
        setPasswordLoading(false)
        passwordForm.resetFields()
      },
    })
  }

  const handleExport = () => {
    window.location.href = '/profile/export'
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        Modal.confirm({
          title: 'Importer les données',
          content:
            'Cette action remplacera toutes vos données actuelles (matériels, routines, spectacles, notes…) par le contenu du fichier. Cette opération est irréversible.',
          okText: 'Importer',
          okButtonProps: { danger: true },
          cancelText: 'Annuler',
          onOk: () => {
            setImportLoading(true)
            router.post(
              '/profile/import',
              { data: parsed },
              {
                onSuccess: () => setImportLoading(false),
                onError: () => setImportLoading(false),
              }
            )
          },
        })
      } catch {
        Modal.error({
          title: 'Fichier invalide',
          content: "Le fichier sélectionné n'est pas un JSON valide.",
        })
      }
    }
    reader.readAsText(file)
    // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
    e.target.value = ''
  }

  const handleDeleteAccount = () => {
    setDeleteLoading(true)
    router.delete('/profile', {
      onSuccess: () => setDeleteLoading(false),
    })
  }

  return (
    <Layout>
      <div style={{ marginBottom: 32, maxWidth: 1100, margin: '0 auto 32px' }}>
        <h1 style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 48,
          fontWeight: 400,
          color: '#583b00',
          lineHeight: 1.1,
          margin: '8px 0 8px',
        }}>
          Mon profil
        </h1>
        <p style={{ color: '#54433a', fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
          Gérez vos informations personnelles et les paramètres de votre compte.
        </p>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '32px 40px',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{
            fullName: user.fullName ?? '',
            email: user.email,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: '#583b00', marginBottom: 16, marginTop: 4 }}>Informations</p>

          <Form.Item
            name="fullName"
            label="Nom complet"
            rules={[
              { required: true, message: 'Veuillez saisir votre nom complet' },
              { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
              { max: 255, message: 'Le nom ne peut pas dépasser 255 caractères' },
            ]}
          >
            <Input placeholder="Votre nom complet" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email' },
              { type: 'email', message: 'Email invalide' },
            ]}
          >
            <Input placeholder="votre@email.com" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Enregistrer les modifications
              </Button>
            </div>
          </Form.Item>
        </Form>

        <div style={{ borderTop: '1px solid #f0ebe8', margin: '32px 0 24px' }} />

        <p style={{ fontSize: 15, fontWeight: 600, color: '#583b00', marginBottom: 16, marginTop: 4 }}>Mot de passe</p>

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onPasswordFinish}
          autoComplete="off"
        >
          <Form.Item
            name="currentPassword"
            label="Mot de passe actuel"
            rules={[{ required: true, message: 'Veuillez saisir votre mot de passe actuel' }]}
          >
            <Input.Password
              prefix={<Icon name="lock" style={{ fontSize: 16, color: '#a8a29e' }} />}
              placeholder="Mot de passe actuel"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Nouveau mot de passe"
            rules={[
              { required: true, message: 'Veuillez saisir votre nouveau mot de passe' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
              },
            ]}
          >
            <Input.Password
              prefix={<Icon name="lock_open" style={{ fontSize: 16, color: '#a8a29e' }} />}
              placeholder="Nouveau mot de passe"
            />
          </Form.Item>

          <Form.Item
            name="newPasswordConfirmation"
            label="Confirmer le nouveau mot de passe"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Veuillez confirmer votre nouveau mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<Icon name="lock_open" style={{ fontSize: 16, color: '#a8a29e' }} />}
              placeholder="Confirmer le nouveau mot de passe"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit" loading={passwordLoading}>
                Modifier le mot de passe
              </Button>
            </div>
          </Form.Item>
        </Form>

        <div style={{ borderTop: '1px solid #f0ebe8', margin: '32px 0 24px' }} />

        <p style={{ fontSize: 15, fontWeight: 600, color: '#583b00', marginBottom: 16, marginTop: 4 }}>Mes données</p>
        <p style={{ color: '#54433a', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Téléchargez une copie complète de vos données personnelles au format JSON, ou restaurez
          vos données depuis un export précédent.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button onClick={handleExport}>Exporter mes données</Button>
          <Button onClick={handleImportClick} loading={importLoading}>
            Importer mes données
          </Button>
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />

        <div style={{ borderTop: '1px solid #f0ebe8', margin: '32px 0 24px' }} />

        <p style={{ fontSize: 15, fontWeight: 600, color: '#c0392b', marginBottom: 16, marginTop: 4 }}>Zone dangereuse</p>
        <p style={{ color: '#54433a', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Cette action est irréversible. Toutes vos données seront supprimées définitivement.
        </p>
        <Button danger type="primary" onClick={() => setDeleteModalOpen(true)}>
          Supprimer mon compte
        </Button>
      </div>

      <DeleteModal
        open={deleteModalOpen}
        itemName={user.fullName || user.email}
        entityLabel="votre compte"
        loading={deleteLoading}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </Layout>
  )
}
