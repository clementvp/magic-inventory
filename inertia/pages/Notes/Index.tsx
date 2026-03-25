import { router } from '@inertiajs/react'
import { Button, Empty, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Layout from '~/components/Layout'

interface Note {
  id: number
  title: string | null
  content: string | null
  createdAt: string
  updatedAt: string
}

interface Props {
  notes: Note[]
}

export default function NotesIndex({ notes }: Props) {
  return (
    <Layout title="Mes Notes">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>Mes Notes</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.visit('/notes/create')}>
          Nouvelle note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Empty description="Aucune note pour l'instant">
          <Button type="primary" onClick={() => router.visit('/notes/create')}>
            Créer ma première note
          </Button>
        </Empty>
      ) : (
        <div>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{ padding: '12px 16px', border: '1px solid #f0f0f0', borderRadius: 6, marginBottom: 8, cursor: 'pointer' }}
              onClick={() => router.visit(`/notes/${note.id}/edit`)}
            >
              <Typography.Text strong>{note.title || '(Sans titre)'}</Typography.Text>
              {note.content && (
                <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
                  {note.content}
                </Typography.Paragraph>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
