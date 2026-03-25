import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, Popconfirm, Space, Spin, message } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import Layout from '~/components/Layout'

const { TextArea } = Input

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Note {
  id: number
  title: string | null
  content: string | null
}

interface Props {
  note: Note
}

export default function NotesEdit({ note }: Props) {
  const [title, setTitle] = useState(note.title ?? '')
  const [content, setContent] = useState(note.content ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [deleting, setDeleting] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      setSaveStatus('saving')
      router.put(
        `/notes/${note.id}`,
        { title, content },
        {
          onSuccess: () => setSaveStatus('saved'),
          onError: () => setSaveStatus('error'),
          preserveScroll: true,
        }
      )
    }, 2000)

    return () => clearTimeout(timer)
  }, [title, content, note.id])

  const handleDelete = () => {
    setDeleting(true)
    router.delete(`/notes/${note.id}`, {
      onError: () => {
        setDeleting(false)
        message.error('Une erreur est survenue lors de la suppression')
      },
    })
  }

  return (
    <Layout title="Modifier" breadcrumbLabels={{ [String(note.id)]: title || 'Note sans titre' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{title || 'Note sans titre'}</h1>
        <div>
          {saveStatus === 'saving' && (
            <Space>
              <Spin size="small" />
              <span style={{ color: '#8c8c8c' }}>Sauvegarde en cours...</span>
            </Space>
          )}
          {saveStatus === 'saved' && (
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span style={{ color: '#52c41a' }}>Sauvegardé</span>
            </Space>
          )}
          {saveStatus === 'error' && (
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
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
          <Space>
            <Button onClick={() => router.visit('/notes')}>Retour aux notes</Button>
            <Popconfirm
              title="Êtes-vous sûr de vouloir supprimer cette note ?"
              onConfirm={handleDelete}
              okText="Supprimer"
              cancelText="Annuler"
            >
              <Button danger loading={deleting}>Supprimer</Button>
            </Popconfirm>
          </Space>
        </Form.Item>
      </Form>
    </Layout>
  )
}
