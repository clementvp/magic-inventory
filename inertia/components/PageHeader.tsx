import Icon from './Icon'

interface PageHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  actionIcon?: string
  onAction?: () => void
}

export default function PageHeader({ title, description, actionLabel, actionIcon = 'add_circle', onAction }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 40,
    }}>
      <div>
        <h1 style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 48,
          fontWeight: 400,
          color: '#583b00',
          lineHeight: 1.1,
          margin: 0,
        }}>
          {title}
        </h1>
        {description && (
          <p style={{
            color: '#54433a',
            fontSize: 14,
            marginTop: 8,
            maxWidth: 520,
            lineHeight: 1.6,
          }}>
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '"Manrope", sans-serif',
            boxShadow: '0 4px 16px rgba(88, 59, 0, 0.3)',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          <Icon name={actionIcon} style={{ fontSize: 16 }} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
