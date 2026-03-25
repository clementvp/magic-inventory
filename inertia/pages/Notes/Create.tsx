import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { Button, Form, Input, Space, Spin } from 'antd'
import Icon from '~/components/Icon'
import Layout from '~/components/Layout'

const { TextArea } = Input

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function NotesCreate() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    if (!title.trim() && !content.trim()) return

    const timer = setTimeout(() => {
      setSaveStatus('saving')
      router.post(
        '/notes',
        { title, content },
        {
          onSuccess: () => setSaveStatus('saved'),
          onError: () => setSaveStatus('error'),
          preserveScroll: true,
        }
      )
    }, 2000)

    return () => clearTimeout(timer)
  }, [title, content])

  return (
    <Layout title="Nouvelle note">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Nouvelle note</h1>
        <div>
          {saveStatus === 'saving' && (
            <Space>
              <Spin size="small" />
              <span style={{ color: '#8c8c8c' }}>Sauvegarde en cours...</span>
            </Space>
          )}
          {saveStatus === 'saved' && (
            <Space>
              <Icon name="check_circle" style={{ color: '#52c41a', fontSize: 16 }} />
              <span style={{ color: '#52c41a' }}>Sauvegardé</span>
            </Space>
          )}
          {saveStatus === 'error' && (
            <Space>
              <Icon name="error" style={{ color: '#ff4d4f', fontSize: 16 }} />
              <span style={{ color: '#ff4d4f' }}>Erreur de sauvegarde</span>
            </Space>
          )}
        </div>
      </div>

      <Form layout="vertical" style={{ maxWidth: 800 }}>
        <Form.Item label="Titre">
          <Input
            aria-label="Titre"
            autoFocus
            placeholder="Titre de la note..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Contenu">
          <TextArea
            aria-label="Contenu"
            placeholder="Contenu de la note..."
            autoSize={{ minRows: 10, maxRows: 30 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button onClick={() => router.visit('/notes')}>Retour aux notes</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
