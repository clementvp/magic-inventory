import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Pagination, Row, Space, Typography, message } from 'antd'
import Icon from '~/components/Icon'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'
import DeleteModal from '~/components/DeleteModal'

interface Note {
  id: number
  title: string | null
  content: string | null
  createdAt: string
}

interface Props {
  notes: Note[]
}

const PAGE_SIZE = 20

export default function NotesIndex({ notes }: Props) {
  const [page, setPage] = useState(1)
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteRequest = (item: { id: number; name: string }) => {
    setDeletingItem(item)
  }

  const handleDeleteConfirm = () => {
    if (!deletingItem) return
    setIsDeleting(true)
    router.delete(`/notes/${deletingItem.id}`, {
      onFinish: () => {
        setIsDeleting(false)
        setDeletingItem(null)
      },
      onError: () => {
        setIsDeleting(false)
        setDeletingItem(null)
        message.error('Une erreur est survenue lors de la suppression')
      },
    })
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: 0 }}>Mes Notes</h1>
          <p style={{ color: '#54433a', fontSize: 14, marginTop: 8, maxWidth: 520, lineHeight: 1.6, marginBottom: 0 }}>
            {"Consignez vos idées, observations et secrets de scène. Un carnet de bord pour nourrir votre pratique magique."}
          </p>
        </div>
        <Button type="primary" icon={<Icon name="add_circle" style={{ fontSize: 16 }} />} onClick={() => router.visit('/notes/create')}>
          Nouvelle note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingTop: 48,
        }}>
          <div style={{
            maxWidth: 560, width: '100%', textAlign: 'center',
            padding: '64px 48px', borderRadius: 24,
            background: 'rgba(246, 243, 242, 0.5)',
            border: '1px solid rgba(218, 194, 182, 0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -80, right: -80,
              width: 200, height: 200,
              background: 'rgba(255, 222, 172, 0.15)',
              borderRadius: '50%', filter: 'blur(60px)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: -80, left: -80,
              width: 200, height: 200,
              background: 'rgba(254, 147, 138, 0.05)',
              borderRadius: '50%', filter: 'blur(60px)',
              pointerEvents: 'none',
            }} />
            <div style={{ marginBottom: 32 }}>
              <div style={{
                width: 80, height: 80,
                backgroundColor: '#fff8e8',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
              }}>
                <Icon name="description" style={{ fontSize: 36, color: '#583b00' }} />
              </div>
            </div>
            <h3 style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 32, fontWeight: 400, fontStyle: 'italic',
              color: '#292524', marginBottom: 16,
            }}>
              Aucune note créée
            </h3>
            <p style={{
              color: '#78716c', fontSize: 16, lineHeight: 1.7,
              maxWidth: 400, margin: '0 auto 40px',
            }}>
              {"Votre carnet est vierge. Notez vos idées, observations et secrets de scène avant qu'ils ne s'envolent."}
            </p>
            <button
              onClick={() => router.visit('/notes/create')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
                color: 'white', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: '"Manrope", sans-serif',
                boxShadow: '0 8px 24px rgba(88, 59, 0, 0.3)',
                margin: '0 auto',
              }}
            >
              <Icon name="description" style={{ fontSize: 20 }} />
              Créer votre première note
            </button>
          </div>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {notes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((note) => (
              <Col xs={24} sm={12} md={8} key={note.id} style={{ display: 'flex' }}>
                <Card
                  hoverable
                  data-testid={`note-card-${note.id}`}
                  onClick={() => router.visit(`/notes/${note.id}/edit`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Modifier la note ${note.title || '(Sans titre)'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.visit(`/notes/${note.id}/edit`)
                  }}
                  style={{ width: '100%' }}
                  styles={{ body: { paddingTop: 40, position: 'relative' } }}
                >
                  <div
                    style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<Icon name="edit" style={{ fontSize: 20, color: '#583b00' }} />}
                      onClick={() => router.visit(`/notes/${note.id}/edit`)}
                      title="Modifier"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<Icon name="delete" style={{ fontSize: 20, color: '#99443e' }} />}
                      title="Supprimer"
                      loading={isDeleting && deletingItem?.id === note.id}
                      onClick={() => handleDeleteRequest({ id: note.id, name: note.title || 'Note sans titre' })}
                    />
                  </div>
                  <Card.Meta
                    title={note.title || '(Sans titre)'}
                    description={
                      <Space direction="vertical" size={4}>
                        {note.content && (
                          <Typography.Text type="secondary">
                            {note.content.slice(0, 100)}{note.content.length > 100 ? '...' : ''}
                          </Typography.Text>
                        )}
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(note.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={notes.length}
            onChange={(p) => setPage(p)}
            hideOnSinglePage
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
      <DeleteModal
        open={deletingItem !== null}
        itemName={deletingItem?.name ?? ''}
        entityLabel="cette note"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </Layout>
  )
}
