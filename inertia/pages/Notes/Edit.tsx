import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, Space, Spin, message } from 'antd'
import Icon from '~/components/Icon'
import Layout from '~/components/Layout'
import DeleteModal from '~/components/DeleteModal'

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
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
    setDeleteModalOpen(false)
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
          <Space>
            <Button onClick={() => router.visit('/notes')}>Retour aux notes</Button>
            <Button danger loading={deleting} onClick={() => setDeleteModalOpen(true)}>Supprimer</Button>
          </Space>
        </Form.Item>
      </Form>
      <DeleteModal
        open={deleteModalOpen}
        itemName={title || 'Note sans titre'}
        entityLabel="cette note"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </Layout>
  )
}
