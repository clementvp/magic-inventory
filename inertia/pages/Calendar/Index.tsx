import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import {
  Badge,
  Button,
  Calendar,
  Drawer,
  Empty,
  Form,
  Input,
  Select,
  TimePicker,
  Typography,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import Layout from '~/components/Layout'

// ── Types ──────────────────────────────────────────────────────────────

type CalendarMode = 'month' | 'year'

interface ShowOption {
  id: number
  name: string
}

interface ShowEventData {
  id: number
  date: string
  startTime: string | null
  venue: string | null
  contact: string | null
  notes: string | null
  show: { id: number; name: string }
}

interface Props {
  events: ShowEventData[]
  shows: ShowOption[]
  currentMonth: number
  currentYear: number
}

// ── Badge color dérivée de l'id du spectacle ──────────────────────────

const BADGE_COLORS = ['#d97706', '#7c3aed', '#0891b2', '#16a34a', '#dc2626', '#db2777']

function badgeColor(showId: number): string {
  return BADGE_COLORS[showId % BADGE_COLORS.length]
}

// ── Composant principal ───────────────────────────────────────────────

export default function CalendarIndex({ events, shows, currentMonth, currentYear }: Props) {
  const today = dayjs()
  const targetMonth = dayjs().year(currentYear).month(currentMonth - 1)
  const safeDay = Math.min(today.date(), targetMonth.daysInMonth())
  const calendarValue = targetMonth.date(safeDay)

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const eventsByDate = useMemo(() => {
    const map: Record<string, ShowEventData[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [events])

  const selectedDateStr = selectedDate?.format('YYYY-MM-DD') ?? ''
  const dayEvents = eventsByDate[selectedDateStr] ?? []

  // F4 — n'ouvrir le drawer que sur un clic de cellule jour (source === 'date')
  function handleDaySelect(date: Dayjs, info: { source: string }) {
    if (info.source !== 'date') return
    setSelectedDate(date)
    setDrawerOpen(true)
    form.resetFields()
  }

  // F6 — fermer le drawer lors du changement de mois
  function handlePanelChange(value: Dayjs, mode: CalendarMode) {
    setDrawerOpen(false)
    if (mode === 'month') {
      router.get(
        '/calendar',
        { month: value.month() + 1, year: value.year() },
        { preserveScroll: true }
      )
    }
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    form.resetFields()
  }

  function handleSubmit(values: {
    showId: number
    startTime?: Dayjs
    venue?: string
    contact?: string
    notes?: string
  }) {
    setSubmitting(true)
    router.post(
      '/show-events',
      {
        showId: values.showId,
        date: selectedDateStr,
        startTime: values.startTime ? values.startTime.format('HH:mm') : null,
        venue: values.venue || null,
        contact: values.contact || null,
        notes: values.notes || null,
        month: currentMonth,
        year: currentYear,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          form.resetFields()
          setSubmitting(false)
        },
        onError: () => setSubmitting(false),
      }
    )
  }

  function handleDelete(eventId: number) {
    router.delete(`/show-events/${eventId}`, {
      data: { month: currentMonth, year: currentYear },
      preserveScroll: true,
    })
  }

  function dateCellRender(date: Dayjs) {
    const dateStr = date.format('YYYY-MM-DD')
    const dayEvs = eventsByDate[dateStr] ?? []
    if (dayEvs.length === 0) return null
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayEvs.map((ev) => (
          <li key={ev.id} style={{ marginBottom: 2 }}>
            <Badge
              color={badgeColor(ev.show.id)}
              text={
                <span style={{ fontSize: 11 }}>
                  {ev.startTime ? `${ev.startTime} · ` : ''}
                  {ev.show.name}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    )
  }

  const cellRender = (date: Dayjs, info: { type: string; originNode: React.ReactNode }) => {
    if (info.type === 'date') return dateCellRender(date)
    return info.originNode
  }

  return (
    <Layout title="Calendrier">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 48, fontWeight: 400, color: '#583b00', lineHeight: 1.1, margin: 0 }}>
            Calendrier
          </h1>
          <p style={{ color: '#54433a', fontSize: 14, marginTop: 8, maxWidth: 520, lineHeight: 1.6, marginBottom: 0 }}>
            Planifiez vos représentations. Cliquez sur un jour pour associer un spectacle et noter le lieu et le contact.
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Calendar
          value={calendarValue}
          cellRender={cellRender}
          onPanelChange={handlePanelChange}
          onSelect={handleDaySelect}
          mode="month"
          headerRender={({ value, onChange }) => {
            const year = value.year()
            const month = value.month()
            const years = Array.from({ length: 11 }, (_, i) => year - 5 + i)
            const months = Array.from({ length: 12 }, (_, i) => ({
              value: i,
              label: dayjs().month(i).format('MMMM'),
            }))
            return (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 0 16px' }}>
                <Select
                  size="small"
                  value={month}
                  onChange={(m) => onChange(value.month(m))}
                  options={months}
                  style={{ width: 120, textTransform: 'capitalize' }}
                />
                <Select
                  size="small"
                  value={year}
                  onChange={(y) => onChange(value.year(y))}
                  options={years.map((y) => ({ value: y, label: y }))}
                  style={{ width: 90 }}
                />
              </div>
            )
          }}
        />
      </div>

      <Drawer
        title={selectedDate ? selectedDate.format('dddd D MMMM YYYY') : 'Représentations'}
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={handleDrawerClose}
        styles={{ body: { paddingTop: 16 } }}
      >
        {dayEvents.length > 0 && (
          <>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              Représentations du jour
            </Typography.Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, marginBottom: 24 }}>
              {dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    borderLeft: `3px solid ${badgeColor(ev.show.id)}`,
                    background: '#f6f3f2',
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1b1c1c', marginBottom: 4 }}>
                      {ev.show.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', fontSize: 12, color: '#54433a' }}>
                      {ev.startTime && <span>⏰ {ev.startTime}</span>}
                      {ev.venue && <span>📍 {ev.venue}</span>}
                      {ev.contact && <span>👤 {ev.contact}</span>}
                    </div>
                    {ev.notes && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#78716c', fontStyle: 'italic', lineHeight: 1.5 }}>
                        {ev.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => handleDelete(ev.id)}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <Typography.Text
          type="secondary"
          style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Ajouter une représentation
        </Typography.Text>

        {/* F8 — état vide si aucun spectacle */}
        {shows.length === 0 ? (
          <Empty
            style={{ marginTop: 24 }}
            description="Vous n'avez pas encore de spectacles. Créez des spectacles pour les planifier dans le calendrier."
          />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }}>
            <Form.Item
              name="showId"
              label="Spectacle"
              rules={[{ required: true, message: 'Veuillez sélectionner un spectacle' }]}
            >
              <Select
                placeholder="Sélectionner un spectacle"
                options={shows.map((s) => ({ value: s.id, label: s.name }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item name="startTime" label="Heure de début">
              <TimePicker format="HH:mm" minuteStep={15} needConfirm={false} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="venue" label="Lieu de représentation">
              <Input placeholder="Nom de la salle, ville..." />
            </Form.Item>

            <Form.Item name="contact" label="Contact">
              <Input placeholder="Nom, email ou téléphone..." />
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea placeholder="Informations complémentaires..." rows={3} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button type="primary" htmlType="submit" loading={submitting} block>
                Ajouter
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </Layout>
  )
}
