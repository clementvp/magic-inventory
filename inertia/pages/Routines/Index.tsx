import { router } from '@inertiajs/react'
import { useState, useMemo, useEffect } from 'react'
import { Badge, Button, Card, Col, Drawer, Empty, Input, Pagination, Row, Select, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

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
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([])

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Catégories uniques disponibles
  const availableCategories = useMemo(() => {
    const seen = new Set<number>()
    const cats: { id: number; name: string }[] = []
    routines.forEach((r) =>
      r.categories.forEach((c) => {
        if (!seen.has(c.id)) {
          seen.add(c.id)
          cats.push(c)
        }
      })
    )
    return cats.sort((a, b) => a.name.localeCompare(b.name))
  }, [routines])

  // Filtrage combiné
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

  // Reset page quand les filtres changent
  useEffect(() => {
    setPage(1)
  }, [filteredRoutines])

  // [M2] Simplifié : compte le nombre de types de filtres Drawer actifs (0 ou 1 ici)
  const activeFilterCount = filterCategoryIds.length > 0 ? 1 : 0
  const hasActiveFilters = searchQuery.trim() !== '' || activeFilterCount > 0

  // [L2] Reset tout : catégories ET recherche → "toutes les routines réapparaissent" (AC6)
  const resetFilters = () => {
    setFilterCategoryIds([])
    setSearchInput('')
    setSearchQuery('')
  }

  const paginatedRoutines = filteredRoutines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const noResultsState = (
    <Empty description="Aucune routine ne correspond à vos critères de recherche">
      <Button onClick={resetFilters}>Réinitialiser la recherche</Button>
    </Empty>
  )

  return (
    <Layout>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
      >
        <Space>
          <h1 style={{ margin: 0 }}>Mes Routines</h1>
          {hasActiveFilters && (
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>{filteredRoutines.length} résultat(s)</span>
          )}
        </Space>
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
          <Button type="primary" onClick={() => router.visit('/routines/create')}>
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
              style={{ width: '100%' }}
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

      {routines.length === 0 ? (
        <Empty description="Aucune routine créée">
          <Button type="primary" onClick={() => router.visit('/routines/create')}>
            Créer votre première routine
          </Button>
        </Empty>
      ) : filteredRoutines.length === 0 ? (
        noResultsState
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedRoutines.map((r) => (
              <Col xs={24} sm={12} md={8} key={r.id}>
                <Card hoverable onClick={() => router.visit(`/routines/${r.id}`)}>
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
                          <span style={{ color: '#8c8c8c' }}>Aucune catégorie</span>
                        )}
                        <span style={{ color: '#8c8c8c' }}>
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
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
    </Layout>
  )
}
