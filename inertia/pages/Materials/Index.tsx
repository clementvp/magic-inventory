import { router } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Input,
  Pagination,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  categories: { id: number; name: string }[]
  storageLocation: { id: number; name: string } | null
  author: string | null
  createdAt: string
}

interface Props {
  materials: MaterialItem[]
}

export default function MaterialsIndex({ materials }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [tablePageSize, setTablePageSize] = useState(50)
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteRequest = (item: { id: number; name: string }) => {
    setDeletingItem(item)
  }

  const handleDeleteConfirm = () => {
    if (!deletingItem) return
    setIsDeleting(true)
    router.delete(`/materials/${deletingItem.id}`, {
      onFinish: () => {
        setIsDeleting(false)
        setDeletingItem(null)
      },
    })
  }
  const [cardsPage, setCardsPage] = useState(1)

  // Search state — input affiché vs query debouncée (300ms)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter Drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [filterTypeId, setFilterTypeId] = useState<number | null>(null)
  const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([])
  const [filterStorageLocationId, setFilterStorageLocationId] = useState<number | null>(null)
  const [filterAuthor, setFilterAuthor] = useState('')

  // Debounce 300ms pour la recherche par nom
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Options de filtres disponibles extraites des matériels existants
  const availableTypes = useMemo(() => {
    const seen = new Set<number>()
    const types: { id: number; name: string }[] = []
    materials.forEach((m) => {
      if (m.type && !seen.has(m.type.id)) {
        seen.add(m.type.id)
        types.push(m.type)
      }
    })
    return types.sort((a, b) => a.name.localeCompare(b.name))
  }, [materials])

  const availableCategories = useMemo(() => {
    const seen = new Set<number>()
    const cats: { id: number; name: string }[] = []
    materials.forEach((m) =>
      m.categories.forEach((c) => {
        if (!seen.has(c.id)) {
          seen.add(c.id)
          cats.push(c)
        }
      })
    )
    return cats.sort((a, b) => a.name.localeCompare(b.name))
  }, [materials])

  const availableStorageLocations = useMemo(() => {
    const seen = new Set<number>()
    const locs: { id: number; name: string }[] = []
    materials.forEach((m) => {
      if (m.storageLocation && !seen.has(m.storageLocation.id)) {
        seen.add(m.storageLocation.id)
        locs.push(m.storageLocation)
      }
    })
    return locs.sort((a, b) => a.name.localeCompare(b.name))
  }, [materials])

  // Matériels filtrés (AND logic entre tous les critères)
  const filteredMaterials = useMemo(() => {
    let result = materials

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((m) => m.name.toLowerCase().includes(q))
    }

    if (filterTypeId !== null) {
      result = result.filter((m) => m.type?.id === filterTypeId)
    }

    if (filterCategoryIds.length > 0) {
      result = result.filter((m) =>
        m.categories.some((c) => filterCategoryIds.includes(c.id))
      )
    }

    if (filterStorageLocationId !== null) {
      result = result.filter((m) => m.storageLocation?.id === filterStorageLocationId)
    }

    if (filterAuthor.trim()) {
      const a = filterAuthor.toLowerCase()
      result = result.filter((m) => m.author?.toLowerCase().includes(a))
    }

    return result
  }, [materials, searchQuery, filterTypeId, filterCategoryIds, filterStorageLocationId, filterAuthor])

  // Remettre la pagination Cards à 1 quand les filtres changent
  useEffect(() => {
    setCardsPage(1)
  }, [filteredMaterials])

  const activeFilterCount = [
    filterTypeId !== null,
    filterCategoryIds.length > 0,
    filterStorageLocationId !== null,
    filterAuthor.trim() !== '',
  ].filter(Boolean).length

  const hasActiveFilters = searchQuery.trim() !== '' || activeFilterCount > 0

  const resetFilters = () => {
    setFilterTypeId(null)
    setFilterCategoryIds([])
    setFilterStorageLocationId(null)
    setFilterAuthor('')
  }

  const CARDS_PAGE_SIZE = 12
  const paginatedMaterials = filteredMaterials.slice(
    (cardsPage - 1) * CARDS_PAGE_SIZE,
    cardsPage * CARDS_PAGE_SIZE
  )

  const columns: ColumnsType<MaterialItem> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <a onClick={(e) => { e.stopPropagation(); router.visit(`/materials/${record.id}`) }}>{name}</a>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => record.type?.name ?? '—',
      sorter: (a, b) => (a.type?.name ?? '').localeCompare(b.type?.name ?? ''),
    },
    {
      title: 'Catégorie(s)',
      key: 'categories',
      render: (_, record) =>
        record.categories.length > 0 ? (
          <Space wrap size={4}>
            {record.categories.map((c) => (
              <Tag key={c.id}>{c.name}</Tag>
            ))}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Lieu',
      key: 'storageLocation',
      render: (_, record) => record.storageLocation?.name ?? '—',
    },
    {
      title: 'Auteur',
      dataIndex: 'author',
      key: 'author',
      render: (author: string | null) => author ?? '—',
    },
    {
      title: "Date d'ajout",
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: MaterialItem) => (
        <span style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            icon={<Icon name="edit" style={{ fontSize: 18, color: '#583b00' }} />}
            onClick={() => router.visit(`/materials/${record.id}/edit`)}
            title="Modifier"
          />
          <Button
            type="text"
            icon={<Icon name="delete" style={{ fontSize: 18, color: '#99443e' }} />}
            title="Supprimer"
            loading={isDeleting && deletingItem?.id === record.id}
            onClick={() => handleDeleteRequest({ id: record.id, name: record.name })}
          />
        </span>
      ),
    },
  ]

  const emptyState = (
    <div style={{ padding: '64px 0', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto 24px',
        borderRadius: '50%', backgroundColor: '#fff8e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="magic_button" style={{ fontSize: 36, color: '#583b00' }} />
      </div>
      <h3 style={{
        fontFamily: '"Newsreader", serif',
        fontSize: 24, fontWeight: 400,
        color: '#1b1c1c', marginBottom: 8,
      }}>
        Inventaire vide
      </h3>
      <p style={{ color: '#54433a', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
        Votre collection n'a pas encore de matériel. Commencez par ajouter votre premier accessoire.
      </p>
      <Button type="primary" onClick={() => router.visit('/materials/create')}>
        Ajouter votre premier matériel
      </Button>
    </div>
  )

  const cardsEmptyState = (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
      <div style={{
        maxWidth: 560, width: '100%', textAlign: 'center',
        padding: '64px 48px', borderRadius: 24,
        background: 'rgba(246, 243, 242, 0.5)',
        border: '1px solid rgba(218, 194, 182, 0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 200, height: 200, background: 'rgba(255, 222, 172, 0.15)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 200, height: 200, background: 'rgba(254, 147, 138, 0.05)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, backgroundColor: '#fff8e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Icon name="magic_button" style={{ fontSize: 36, color: '#583b00' }} />
          </div>
        </div>
        <h3 style={{ fontFamily: '"Newsreader", serif', fontSize: 32, fontWeight: 400, fontStyle: 'italic', color: '#292524', marginBottom: 16 }}>
          Inventaire vide
        </h3>
        <p style={{ color: '#78716c', fontSize: 16, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 40px' }}>
          Votre collection est encore vide. Ajoutez votre premier accessoire pour commencer à construire votre arsenal.
        </p>
        <button
            onClick={() => router.visit('/materials/create')}
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
          <Icon name="magic_button" style={{ fontSize: 20 }} />
          Ajouter votre premier matériel
        </button>
      </div>
    </div>
  )

  const noResultsState = (
    <Empty description="Aucun matériel ne correspond à vos critères de recherche">
      <Button
        onClick={() => {
          setSearchInput('')
          setSearchQuery('')
          resetFilters()
        }}
      >
        Réinitialiser la recherche
      </Button>
    </Empty>
  )

  const cardsGrid = (
    <>
      <Row gutter={[16, 16]}>
        {paginatedMaterials.map((m) => (
          <Col xs={24} sm={12} md={8} key={m.id} style={{ display: 'flex' }}>
            <Card
              hoverable
              onClick={() => router.visit(`/materials/${m.id}`)}
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
                  onClick={() => router.visit(`/materials/${m.id}/edit`)}
                  title="Modifier"
                />
                <Button
                  type="text"
                  size="small"
                  icon={<Icon name="delete" style={{ fontSize: 20, color: '#99443e' }} />}
                  title="Supprimer"
                  loading={isDeleting && deletingItem?.id === m.id}
                  onClick={() => handleDeleteRequest({ id: m.id, name: m.name })}
                />
              </div>
              <Card.Meta
                title={m.name}
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {m.type && <Tag color="blue">{m.type.name}</Tag>}
                    {m.categories.length > 0 && (
                      <Space wrap size={4}>
                        {m.categories.map((c) => (
                          <Tag key={c.id}>{c.name}</Tag>
                        ))}
                      </Space>
                    )}
                    {m.storageLocation && (
                      <span style={{ color: '#8c8c8c' }}>📦 {m.storageLocation.name}</span>
                    )}
                    {m.author && <span style={{ color: '#8c8c8c' }}>{m.author}</span>}
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Pagination
        current={cardsPage}
        pageSize={CARDS_PAGE_SIZE}
        total={filteredMaterials.length}
        onChange={(page) => {
          setCardsPage(page)
        }}
        hideOnSinglePage
        style={{ textAlign: 'center', marginTop: 16 }}
      />
    </>
  )

  const cardsView = (
    <>
      {materials.length === 0
        ? cardsEmptyState
        : filteredMaterials.length === 0
          ? noResultsState
          : cardsGrid}
    </>
  )

  return (
    <Layout>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}
      >
        <div>
          <Space>
            <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: 0 }}>Mon Inventaire</h1>
            {hasActiveFilters && (
              <span style={{ color: '#8c8c8c', fontSize: 14 }}>
                {filteredMaterials.length} résultat(s)
              </span>
            )}
          </Space>
          <p style={{ color: '#54433a', fontSize: 14, marginTop: 8, maxWidth: 520, lineHeight: 1.6, marginBottom: 0 }}>
            {"L'ensemble de vos accessoires, livres et artifices. Retrouvez, filtrez et gérez chaque pièce de votre arsenal magique."}
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
          <Badge count={activeFilterCount} size="small">
            <Button onClick={() => setIsFilterDrawerOpen(true)}>Filtres</Button>
          </Badge>
          <Segmented
            value={viewMode}
            onChange={(val) => {
              if (val === 'table' || val === 'cards') {
                setViewMode(val)
                setCardsPage(1)
              }
            }}
            options={[
              { label: 'Table', value: 'table' },
              { label: 'Cards', value: 'cards' },
            ]}
          />
          <Button type="primary" icon={<Icon name="add_circle" style={{ fontSize: 16 }} />} onClick={() => router.visit('/materials/create')}>
            Ajouter un matériel
          </Button>
        </Space>
      </div>

      {viewMode === 'table' && (
        <Table<MaterialItem>
          dataSource={filteredMaterials}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: tablePageSize,
            showSizeChanger: true,
            pageSizeOptions: ['25', '50', '100'],
            onShowSizeChange: (_, size) => setTablePageSize(size),
          }}
          onRow={(record) => ({
            onClick: () => router.visit(`/materials/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{ emptyText: hasActiveFilters ? noResultsState : emptyState }}
        />
      )}

      {viewMode === 'cards' && cardsView}

      <Drawer
        title="Filtres"
        placement="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        footer={
          <Button onClick={resetFilters} disabled={activeFilterCount === 0}>
            Réinitialiser les filtres
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Type</div>
            <Select
              aria-label="Filtrer par type"
              placeholder="Tous les types"
              style={{ width: '100%' }}
              options={availableTypes.map((t) => ({ value: t.id, label: t.name }))}
              value={filterTypeId}
              onChange={(val) => setFilterTypeId(val ?? null)}
              allowClear
              virtual={false}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Catégorie(s)</div>
            <Select
              aria-label="Filtrer par catégorie"
              mode="multiple"
              placeholder="Toutes les catégories"
              style={{ width: '100%' }}
              options={availableCategories.map((c) => ({ value: c.id, label: c.name }))}
              value={filterCategoryIds}
              onChange={(vals) => setFilterCategoryIds(vals)}
              allowClear
              virtual={false}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Lieu de stockage</div>
            <Select
              aria-label="Filtrer par lieu de stockage"
              placeholder="Tous les lieux"
              style={{ width: '100%' }}
              options={availableStorageLocations.map((l) => ({ value: l.id, label: l.name }))}
              value={filterStorageLocationId}
              onChange={(val) => setFilterStorageLocationId(val ?? null)}
              allowClear
              virtual={false}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Auteur</div>
            <Input
              aria-label="Filtrer par auteur"
              placeholder="Filtrer par auteur..."
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              allowClear
            />
          </div>
        </Space>
      </Drawer>

      <DeleteModal
        open={deletingItem !== null}
        itemName={deletingItem?.name ?? ''}
        entityLabel="ce matériel"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </Layout>
  )
}
