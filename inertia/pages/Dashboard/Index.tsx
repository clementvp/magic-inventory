import { router } from '@inertiajs/react'
import { Card, Col, Row } from 'antd'
import Icon from '~/components/Icon'
import Layout from '~/components/Layout'

interface Props {
  counts: {
    categories: number
    routines: number
    materials: number
    shows: number
    notes: number
  }
}

const ICON_COLOR = '#d97706'

const STAT_CARDS: { label: string; key: keyof Props['counts']; icon: string; href: string }[] = [
  { label: 'Catégories', key: 'categories', icon: 'category', href: '/categories' },
  { label: 'Routines', key: 'routines', icon: 'auto_fix_high', href: '/routines' },
  { label: 'Matériels', key: 'materials', icon: 'magic_button', href: '/materials' },
  { label: 'Spectacles', key: 'shows', icon: 'theater_comedy', href: '/shows' },
  { label: 'Notes', key: 'notes', icon: 'description', href: '/notes' },
]

export default function DashboardIndex({ counts }: Props) {
  return (
    <Layout>
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 48,
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#583b00',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Tableau de bord
        </h1>
      </div>

      <Row gutter={[16, 16]}>
        {STAT_CARDS.map((card) => (
          <Col xs={24} sm={12} flex="1" key={card.key}>
            <Card
              hoverable
              data-testid={`stat-card-${card.key}`}
              onClick={() => router.visit(card.href)}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <Icon name={card.icon} style={{ fontSize: 36, color: ICON_COLOR, display: 'block', marginBottom: 8 }} />
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#292524',
                  lineHeight: 1.2,
                  fontFamily: '"Manrope", sans-serif',
                }}
              >
                {counts[card.key]}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#78716c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: '"Manrope", sans-serif',
                  marginTop: 4,
                }}
              >
                {card.label}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Layout>
  )
}
