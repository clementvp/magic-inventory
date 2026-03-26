import { router } from '@inertiajs/react'
import { useState, useMemo, useEffect } from 'react'
import { Badge, Button, Card, Col, Drawer, Empty, Input, Pagination, Row, Segmented, Select, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

interface RoutineItem {
  id: number
  name: string
  categories: { id: number; name: string }[]
  createdAt: string
}

interface Props {
  routines: RoutineItem[]
}

const PAGE_SIZE = 12

export default function RoutinesIndex({ routines }: Props) {
  const [page, setPage] = useState(1)
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
    router.delete(`/routines/${deletingItem.id}`, {
      onFinish: () => {
        setIsDeleting(false)
        setDeletingItem(null)
      },
    })
  }
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const availableCategories = useMemo(() => {
    const seen = new Set<number>()
    const cats: { id: number; name: string }[] = []
    routines.forEach((r) =>
      r.categories.forEach((c) => {
        if (!seen.has(c.id)) { seen.add(c.id); cats.push(c) }
      })
    )
    return cats.sort((a, b) => a.name.localeCompare(b.name))
  }, [routines])

  const filteredRoutines = useMemo(() => {
    let result = routines
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((r) => r.name.toLowerCase().includes(q))
    }
    if (filterCategoryIds.length > 0) {
      result = result.filter((r) => r.categories.some((c) => filterCategoryIds.includes(c.id)))
    }
    return result
  }, [routines, searchQuery, filterCategoryIds])

  useEffect(() => { setPage(1) }, [filteredRoutines])

  const activeFilterCount = filterCategoryIds.length > 0 ? 1 : 0
  const hasActiveFilters = searchQuery.trim() !== '' || activeFilterCount > 0

  const resetFilters = () => {
    setFilterCategoryIds([])
    setSearchInput('')
    setSearchQuery('')
  }

  const paginatedRoutines = filteredRoutines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: ColumnsType<RoutineItem> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <a onClick={(e) => { e.stopPropagation(); router.visit(`/routines/${record.id}`) }}>{name}</a>
      ),
    },
    {
      title: 'Catégorie(s)',
      key: 'categories',
      render: (_, record) =>
        record.categories.length > 0 ? (
          <Space wrap size={4}>
            {record.categories.map((c) => <Tag key={c.id}>{c.name}</Tag>)}
          </Space>
        ) : '—',
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: RoutineItem) => (
        <span style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            icon={<Icon name="edit" style={{ fontSize: 18, color: '#583b00' }} />}
            onClick={() => router.visit(`/routines/${record.id}/edit`)}
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

  const tableEmptyState = (
    <div style={{ padding: '64px 0', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto 24px',
        borderRadius: '50%', backgroundColor: '#fff8e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="auto_fix_high" style={{ fontSize: 36, color: '#583b00' }} />
      </div>
      <h3 style={{ fontFamily: '"Newsreader", serif', fontSize: 24, fontWeight: 400, color: '#1b1c1c', marginBottom: 8 }}>
        Aucune routine créée
      </h3>
      <p style={{ color: '#54433a', maxWidth: 360, margin: '0 auto 24px' }}>
        Commencez par assembler vos tours favoris pour créer une routine inoubliable.
      </p>
      <Button type="primary" onClick={() => router.visit('/routines/create')}>
        Créer votre première routine
      </Button>
    </div>
  )

  const emptyState = (
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
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80,
            backgroundColor: '#fff8e8',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}>
            <Icon name="auto_fix_high" style={{ fontSize: 36, color: '#583b00' }} />
          </div>
        </div>
        <h3 style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 32, fontWeight: 400, fontStyle: 'italic',
          color: '#292524', marginBottom: 16,
        }}>
          Aucune routine créée
        </h3>
        <p style={{
          color: '#78716c', fontSize: 16, lineHeight: 1.7,
          maxWidth: 400, margin: '0 auto 40px',
        }}>
          Votre grimoire est encore vide. Commencez par assembler vos tours favoris pour créer une routine inoubliable.
        </p>
        <button
          onClick={() => router.visit('/routines/create')}
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
          <Icon name="auto_fix_high" style={{ fontSize: 20 }} />
          Créer votre première routine
        </button>
      </div>
    </div>
  )

  const noResultsState = (
    <Empty description="Aucune routine ne correspond à vos critères de recherche">
      <Button onClick={resetFilters}>Réinitialiser la recherche</Button>
    </Empty>
  )

  const cardsGrid = (
    <>
      <Row gutter={[16, 16]}>
        {paginatedRoutines.map((r) => (
          <Col xs={24} sm={12} md={8} key={r.id}>
            <Card
              hoverable
              onClick={() => router.visit(`/routines/${r.id}`)}
              extra={
                <span style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="text"
                    size="small"
                    icon={<Icon name="edit" style={{ fontSize: 16, color: '#583b00' }} />}
                    onClick={() => router.visit(`/routines/${r.id}/edit`)}
                    title="Modifier"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<Icon name="delete" style={{ fontSize: 16, color: '#99443e' }} />}
                    title="Supprimer"
                    loading={isDeleting && deletingItem?.id === r.id}
                    onClick={() => handleDeleteRequest({ id: r.id, name: r.name })}
                  />
                </span>
              }
            >
              <Card.Meta
                title={r.name}
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {r.categories.length > 0 ? (
                      <Space wrap size={4}>
                        {r.categories.map((c) => (
                          <Tag key={c.id}>{c.name}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <span style={{ color: '#877369' }}>Aucune catégorie</span>
                    )}
                    <span style={{ color: '#877369' }}>
                      {dayjs(r.createdAt).format('DD/MM/YYYY')}
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
        total={filteredRoutines.length}
        onChange={(p) => setPage(p)}
        hideOnSinglePage
        style={{ textAlign: 'center', marginTop: 24 }}
      />
    </>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 48,
            fontWeight: 400,
            color: '#583b00',
            lineHeight: 1.1,
            margin: 0,
          }}>
            Mes Routines
            {hasActiveFilters && (
              <span style={{ fontSize: 18, fontStyle: 'normal', color: '#877369', marginLeft: 16 }}>
                {filteredRoutines.length} résultat(s)
              </span>
            )}
          </h1>
          <p style={{ color: '#54433a', fontSize: 14, marginTop: 8, maxWidth: 520, lineHeight: 1.6 }}>
            Gérez vos enchaînements magiques et vos performances scéniques avec précision.
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
          <Segmented<'table' | 'cards'>
            value={viewMode}
            onChange={(val) => {
              setViewMode(val)
              setPage(1)
            }}
            options={[
              { label: 'Table', value: 'table' as const },
              { label: 'Cards', value: 'cards' as const },
            ]}
          />
          <Button type="primary" icon={<Icon name="add_circle" style={{ fontSize: 16 }} />} onClick={() => router.visit('/routines/create')}>
            Créer une routine
          </Button>
        </Space>
      </div>

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
            <label>Catégorie(s)</label>
            <Select
              mode="multiple"
              placeholder="Toutes les catégories"
              style={{ width: '100%', marginTop: 8 }}
              options={availableCategories.map((c) => ({ value: c.id, label: c.name }))}
              value={filterCategoryIds}
              onChange={(vals) => setFilterCategoryIds(vals)}
              allowClear
              virtual={false}
              aria-label="Catégories"
            />
          </div>
        </Space>
      </Drawer>

      {viewMode === 'table' && (
        <Table<RoutineItem>
          dataSource={filteredRoutines}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: tablePageSize, showSizeChanger: true, pageSizeOptions: ['25', '50', '100'], onShowSizeChange: (_, size) => setTablePageSize(size) }}
          onRow={(record) => ({
            onClick: () => router.visit(`/routines/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{ emptyText: routines.length === 0 ? tableEmptyState : noResultsState }}
        />
      )}

      {viewMode === 'cards' && (
        routines.length === 0 ? emptyState :
        filteredRoutines.length === 0 ? noResultsState :
        cardsGrid
      )}

      <DeleteModal
        open={deletingItem !== null}
        itemName={deletingItem?.name ?? ''}
        entityLabel="cette routine"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </Layout>
  )
}
