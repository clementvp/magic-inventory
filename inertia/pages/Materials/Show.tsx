import React from 'react'
import { router, Link } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { Badge, Button, Drawer, Input, message, Select, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

dayjs.locale('fr')

const tagStyle = {
  fontSize: 10,
  fontFamily: '"Manrope", sans-serif',
  fontWeight: 700 as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  padding: '2px 8px',
  borderRadius: 4,
  backgroundColor: '#ffe088',
  color: '#574500',
  display: 'inline-block' as const,
  lineHeight: '18px',
}

const typeTagStyle = {
  fontSize: 10,
  fontFamily: '"Manrope", sans-serif',
  fontWeight: 700 as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  padding: '2px 8px',
  borderRadius: 4,
  backgroundColor: '#ffdeac',
  color: '#604100',
  display: 'inline-block' as const,
  lineHeight: '18px',
}

const metaLabelStyle: React.CSSProperties = {
  fontFamily: '"Manrope", sans-serif',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: '#a8a29e',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const metaValueStyle: React.CSSProperties = {
  fontFamily: '"Manrope", sans-serif',
  fontSize: 14,
  color: '#54433a',
}

interface RoutineItem {
  id: number
  name: string
  categories: { id: number; name: string }[]
}

interface MaterialDetail {
  id: number
  name: string
  type: { id: number; name: string } | null
  categories: { id: number; name: string }[]
  storageLocation: { id: number; name: string } | null
  author: string | null
  createdAt: string
  routines: RoutineItem[]
}

interface Props {
  material: MaterialDetail
}

export default function MaterialsShow({ material }: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([])
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleDelete = () => {
    setDeleteModalOpen(false)
    setDeleting(true)
    router.delete(`/materials/${material.id}`, {
      onError: () => {
        setDeleting(false)
        message.error('Une erreur est survenue lors de la suppression du matériel')
      },
    })
  }

  const availableCategories = [...new Map(
    material.routines.flatMap((r) => r.categories).map((c) => [c.id, c])
  ).values()].sort((a, b) => a.name.localeCompare(b.name))

  const filteredRoutines = material.routines.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategories = filterCategoryIds.length === 0 || r.categories.some((c) => filterCategoryIds.includes(c.id))
    return matchesSearch && matchesCategories
  })

  const routineColumns: ColumnsType<RoutineItem> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Link href={`/routines/${record.id}`}>{name}</Link>
      ),
    },
    {
      title: 'Catégories',
      dataIndex: 'categories',
      render: (categories: { id: number; name: string }[]) =>
        categories.length > 0 ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <span key={c.id} style={tagStyle}>{c.name}</span>
            ))}
          </div>
        ) : '—',
    },
  ]

  return (
    <Layout title={material.name}>
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 0,
        }}>
          <h1 style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: 0 }}>
            {material.name}
          </h1>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0, marginLeft: 24 }}>
            <Button onClick={() => router.visit(`/materials/${material.id}/edit`)} icon={<Icon name="edit" style={{ fontSize: 16 }} />}>
              Modifier
            </Button>
            <Button
              danger
              loading={deleting}
              icon={<Icon name="delete" style={{ fontSize: 16 }} />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Supprimer
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 40, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e2e1', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {material.type && (
            <div>
              <div style={metaLabelStyle}>Type</div>
              <span style={typeTagStyle}>{material.type.name}</span>
            </div>
          )}
          {material.categories.length > 0 && (
            <div>
              <div style={metaLabelStyle}>Catégories</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {material.categories.map((c) => (
                  <span key={c.id} style={tagStyle}>{c.name}</span>
                ))}
              </div>
            </div>
          )}
          {material.storageLocation && (
            <div>
              <div style={metaLabelStyle}>Stocké dans</div>
              <Link
                href={`/storage-locations/${material.storageLocation.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px 4px 10px',
                  borderRadius: 6,
                  border: '1px solid #e8d5a8',
                  backgroundColor: '#fdf6ec',
                  color: '#583b00',
                  fontFamily: '"Manrope", sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'background-color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.backgroundColor = '#f5e8c8'
                  el.style.borderColor = '#c9a84c'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.backgroundColor = '#fdf6ec'
                  el.style.borderColor = '#e8d5a8'
                }}
              >
                {material.storageLocation.name}
                <Icon name="chevron_right" style={{ fontSize: 14, color: '#a8813a' }} />
              </Link>
            </div>
          )}
          {material.author && (
            <div>
              <div style={metaLabelStyle}>Auteur</div>
              <span style={metaValueStyle}>{material.author}</span>
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <div style={metaLabelStyle}>Ajouté le</div>
            <span style={metaValueStyle}>{dayjs(material.createdAt).format('DD MMMM YYYY')}</span>
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 28, fontWeight: 400, color: '#583b00', marginTop: 40, marginBottom: 16 }}>
        Routines utilisant ce matériel
      </h2>

      {material.routines.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }}>
            <Input
              placeholder="Rechercher une routine…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              prefix={<Icon name="search" style={{ fontSize: 16, color: '#a8a29e' }} />}
              allowClear
              style={{ maxWidth: 320 }}
            />
            {availableCategories.length > 0 && (
              <Badge count={filterCategoryIds.length} size="small">
                <Button onClick={() => setIsFilterDrawerOpen(true)}>Filtres</Button>
              </Badge>
            )}
          </div>
          <Table<RoutineItem>
            dataSource={filteredRoutines}
            columns={routineColumns}
            rowKey="id"
            pagination={{ pageSize: 5, hideOnSinglePage: true }}
            locale={{ emptyText: 'Aucune routine ne correspond à votre recherche' }}
            onRow={(record) => ({ onClick: () => router.visit(`/routines/${record.id}`), style: { cursor: 'pointer' } })}
          />
        </>
      ) : (
        <Typography.Text type="secondary">
          Ce matériel n'est utilisé dans aucune routine
        </Typography.Text>
      )}
      <DeleteModal
        open={deleteModalOpen}
        itemName={material.name}
        entityLabel="ce matériel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <Drawer
        title="Filtres"
        placement="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        footer={
          <Button
            onClick={() => setFilterCategoryIds([])}
            disabled={filterCategoryIds.length === 0}
          >
            Réinitialiser les filtres
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Catégorie(s)</div>
            <Select
              mode="multiple"
              placeholder="Toutes les catégories"
              style={{ width: '100%' }}
              options={availableCategories.map((c) => ({ value: c.id, label: c.name }))}
              value={filterCategoryIds}
              onChange={setFilterCategoryIds}
              allowClear
              virtual={false}
            />
          </div>
        </Space>
      </Drawer>
    </Layout>
  )
}
