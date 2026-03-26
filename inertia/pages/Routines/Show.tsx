import { useState } from 'react'
import { router, Link } from '@inertiajs/react'
import { Button, Input, message, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import Layout from '~/components/Layout'
import Icon from '~/components/Icon'
import DeleteModal from '~/components/DeleteModal'

dayjs.locale('fr')

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  storageLocation: { id: number; name: string } | null
}

interface RoutineDetail {
  id: number
  name: string
  content: string | null
  categories: { id: number; name: string }[]
  materials: MaterialItem[]
  createdAt: string
}

interface Props {
  routine: RoutineDetail
}

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
}

export default function RoutinesShow({ routine }: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleteModalOpen(false)
    setDeleting(true)
    router.delete(`/routines/${routine.id}`, {
      onError: () => {
        setDeleting(false)
        message.error('Une erreur est survenue lors de la suppression de la routine')
      },
    })
  }

  const materialColumns: ColumnsType<MaterialItem> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => <Link href={`/materials/${record.id}`}>{name}</Link>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type: MaterialItem['type']) =>
        type ? <span style={typeTagStyle}>{type.name}</span> : '—',
    },
    {
      title: 'Lieu de stockage',
      dataIndex: 'storageLocation',
      render: (loc: MaterialItem['storageLocation']) =>
        loc ? <Link href={`/storage-locations/${loc.id}`}>{loc.name}</Link> : '—',
    },
  ]

  return (
    <Layout title={routine.name}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 32,
        marginBottom: 40,
        borderBottom: '1px solid #e5e2e1',
      }}>
        <div>
          <h1 style={{
            fontFamily: '"Newsreader", serif',
            fontStyle: 'italic',
            fontSize: 48,
            fontWeight: 400,
            color: '#583b00',
            lineHeight: 1.1,
            margin: '0 0 8px',
          }}>
            {routine.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ fontFamily: '"Manrope", sans-serif', fontSize: 14, color: '#54433a' }}>
              Créée le {dayjs(routine.createdAt).format('DD MMMM YYYY')}
            </span>
            {routine.categories.length > 0 && (
              <>
                <span style={{ color: '#a8a29e' }}>·</span>
                {routine.categories.map((c) => (
                  <span key={c.id} style={tagStyle}>{c.name}</span>
                ))}
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexShrink: 0, marginLeft: 24 }}>
          <Button
            onClick={() => router.visit(`/routines/${routine.id}/edit`)}
            icon={<Icon name="edit" style={{ fontSize: 16 }} />}
          >
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

      {/* Contenu */}
      <h2 style={{
        fontFamily: '"Newsreader", serif',
        fontStyle: 'italic',
        fontSize: 28,
        fontWeight: 400,
        color: '#583b00',
        marginTop: 40,
        marginBottom: 16,
      }}>
        Contenu
      </h2>
      <Input.TextArea
        readOnly
        value={routine.content ?? ''}
        autoSize={{ minRows: 4, maxRows: 20 }}
        placeholder="Aucun contenu"
        style={{
          fontFamily: '"Manrope", sans-serif',
          fontSize: 14,
          color: routine.content ? '#54433a' : '#a8a29e',
          lineHeight: 1.7,
          background: '#fdf8f0',
          border: '1px solid #e5d9c3',
          borderRadius: 6,
          cursor: 'default',
          resize: 'none',
          boxShadow: 'none',
        }}
      />

      {/* Matériel utilisé */}
      <h2 style={{
        fontFamily: '"Newsreader", serif',
        fontStyle: 'italic',
        fontSize: 28,
        fontWeight: 400,
        color: '#583b00',
        marginTop: 40,
        marginBottom: 16,
      }}>
        Matériel utilisé
      </h2>
      <DeleteModal
        open={deleteModalOpen}
        itemName={routine.name}
        entityLabel="cette routine"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {routine.materials.length === 0 ? (
        <Typography.Text type="secondary">Aucun matériel lié à cette routine</Typography.Text>
      ) : (
        <Table<MaterialItem>
          dataSource={routine.materials}
          columns={materialColumns}
          rowKey="id"
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          onRow={(record) => ({ onClick: () => router.visit(`/materials/${record.id}`), style: { cursor: 'pointer' } })}
        />
      )}
    </Layout>
  )
}
