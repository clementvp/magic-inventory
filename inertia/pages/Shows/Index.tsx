import { router } from '@inertiajs/react'
import { useState, useMemo, useEffect } from 'react'
import { Button, Card, Col, Empty, Input, Pagination, Row, Space } from 'antd'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

interface ShowItem {
  id: number
  name: string
  routinesCount: number
  createdAt: string
}

interface Props {
  shows: ShowItem[]
}

const PAGE_SIZE = 12

export default function ShowsIndex({ shows }: Props) {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteRequest = (item: { id: number; name: string }) => {
    setDeletingItem(item)
  }

  const handleDeleteConfirm = () => {
    if (!deletingItem) return
    setIsDeleting(true)
    router.delete(`/shows/${deletingItem.id}`, {
      onFinish: () => {
        setIsDeleting(false)
        setDeletingItem(null)
      },
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const filteredShows = useMemo(() => {
    if (!searchQuery.trim()) return shows

    const q = searchQuery.toLowerCase()
    return shows.filter((s) => s.name.toLowerCase().includes(q))
  }, [shows, searchQuery])

  useEffect(() => {
    setPage(1)
  }, [filteredShows])

  const hasActiveSearch = searchQuery.trim() !== ''
  const paginatedShows = filteredShows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}
      >
        <div>
          <Space>
            <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: 0 }}>Mes Spectacles</h1>
            {hasActiveSearch && (
              <span style={{ color: '#8c8c8c', fontSize: 14 }}>{filteredShows.length} résultat(s)</span>
            )}
          </Space>
          <p style={{ color: '#54433a', fontSize: 14, marginTop: 8, maxWidth: 520, lineHeight: 1.6, marginBottom: 0 }}>
            {"Composez et organisez vos programmes. Associez des routines à chaque spectacle pour préparer vos représentations."}
          </p>
        </div>
        <Space>
          <Input.Search
            placeholder="Rechercher par nom..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              if (!e.target.value) setSearchQuery('')
            }}
            onSearch={(val) => {
              setSearchInput(val)
              setSearchQuery(val)
            }}
            allowClear
            style={{ width: 220 }}
          />
          <Button type="primary" icon={<Icon name="add_circle" style={{ fontSize: 16 }} />} onClick={() => router.visit('/shows/create')}>
            Créer un spectacle
          </Button>
        </Space>
      </div>

      {shows.length === 0 ? (
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
                <Icon name="theater_comedy" style={{ fontSize: 36, color: '#583b00' }} />
              </div>
            </div>
            <h3 style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 32, fontWeight: 400, fontStyle: 'italic',
              color: '#292524', marginBottom: 16,
            }}>
              Aucun spectacle créé
            </h3>
            <p style={{
              color: '#78716c', fontSize: 16, lineHeight: 1.7,
              maxWidth: 400, margin: '0 auto 40px',
            }}>
              {"La scène vous attend. Composez votre premier programme en assemblant vos meilleures routines."}
            </p>
            <button
              onClick={() => router.visit('/shows/create')}
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
              <Icon name="theater_comedy" style={{ fontSize: 20 }} />
              Créer votre premier spectacle
            </button>
          </div>
        </div>
      ) : filteredShows.length === 0 ? (
        <Empty description="Aucun spectacle ne correspond à votre recherche">
          <Button
            onClick={() => {
              setSearchInput('')
              setSearchQuery('')
            }}
          >
            Réinitialiser la recherche
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedShows.map((s) => (
              <Col xs={24} sm={12} md={8} key={s.id} style={{ display: 'flex' }}>
                <Card
                  hoverable
                  data-testid={`show-card-${s.id}`}
                  onClick={() => router.visit(`/shows/${s.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Voir le spectacle ${s.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.visit(`/shows/${s.id}`)
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
                      onClick={() => router.visit(`/shows/${s.id}/edit`)}
                      title="Modifier"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<Icon name="delete" style={{ fontSize: 20, color: '#99443e' }} />}
                      title="Supprimer"
                      loading={isDeleting && deletingItem?.id === s.id}
                      onClick={() => handleDeleteRequest({ id: s.id, name: s.name })}
                    />
                  </div>
                  <Card.Meta
                    title={s.name}
                    description={
                      <Space direction="vertical" size={4}>
                        <span>{s.routinesCount} routine(s)</span>
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(s.createdAt).format('DD/MM/YYYY')}
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
            total={filteredShows.length}
            onChange={(p) => setPage(p)}
            hideOnSinglePage
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
      <DeleteModal
        open={deletingItem !== null}
        itemName={deletingItem?.name ?? ''}
        entityLabel="ce spectacle"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </Layout>
  )
}
