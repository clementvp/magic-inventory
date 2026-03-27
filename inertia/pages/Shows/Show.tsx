import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Button, message, Space, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'
import DeleteModal from '~/components/DeleteModal'

interface RoutineItem {
  id: number
  name: string
  order: number
  categories: { id: number; name: string }[]
}

interface ShowDetail {
  id: number
  name: string
  notes: string | null
  routines: RoutineItem[]
  createdAt: string
}

interface Props {
  show: ShowDetail
}

export default function ShowsShow({ show }: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleteModalOpen(false)
    setDeleting(true)
    router.delete(`/shows/${show.id}`, {
      onError: () => {
        setDeleting(false)
        message.error('Une erreur est survenue lors de la suppression du spectacle')
      },
      onFinish: () => setDeleting(false),
    })
  }

  return (
    <Layout title={show.name}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 48,
            fontWeight: 400,
            color: '#583b00',
            lineHeight: 1.1,
            margin: '0 0 24px',
          }}
        >
          {show.name}
        </h1>

        <Space style={{ marginBottom: 24 }}>
          <Button type="primary" onClick={() => router.visit(`/shows/${show.id}/checklist`)}>
            Générer checklist
          </Button>
          <Button onClick={() => router.visit(`/shows/${show.id}/edit`)}>Modifier</Button>
          <Button danger loading={deleting} onClick={() => setDeleteModalOpen(true)}>
            Supprimer
          </Button>
        </Space>

        {show.notes && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '24px 32px',
              marginBottom: 24,
              border: '1px solid #f0ebe8',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8c8c8c',
                marginBottom: 12,
                marginTop: 0,
                fontFamily: '"Manrope", sans-serif',
              }}
            >
              Notes
            </p>
            <Typography.Paragraph
              style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#1b1c1c', lineHeight: 1.7 }}
            >
              {show.notes}
            </Typography.Paragraph>
          </div>
        )}

        <div
          style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '24px 32px',
            border: '1px solid #f0ebe8',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8c8c8c',
              marginBottom: 16,
              marginTop: 0,
              fontFamily: '"Manrope", sans-serif',
            }}
          >
            Programme
            {show.routines.length > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  background: '#583b00',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {show.routines.length}
              </span>
            )}
          </p>

          {show.routines.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#877369',
                fontSize: 13,
                fontFamily: '"Manrope", sans-serif',
                background: '#faf7f5',
                borderRadius: 8,
                border: '1px dashed #dac2b6',
              }}
            >
              Aucune routine dans ce spectacle
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {show.routines.map((r, index) => (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Voir la routine ${r.name}`}
                  onClick={() => router.visit(`/routines/${r.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.visit(`/routines/${r.id}`)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: '#faf7f5',
                    border: '1px solid #ede5e0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fff8e8'
                    e.currentTarget.style.borderColor = '#dac2b6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#faf7f5'
                    e.currentTarget.style.borderColor = '#ede5e0'
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#583b00',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: '"Manrope", sans-serif',
                    }}
                  >
                    {index + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#1b1c1c',
                        fontFamily: '"Manrope", sans-serif',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.name}
                    </div>
                    {r.categories.length > 0 && (
                      <Space wrap size={4} style={{ marginTop: 4 }}>
                        {r.categories.map((c) => (
                          <Tag key={c.id} style={{ margin: 0, fontSize: 11 }}>
                            {c.name}
                          </Tag>
                        ))}
                      </Space>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        open={deleteModalOpen}
        itemName={show.name}
        entityLabel="ce spectacle"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </Layout>
  )
}
