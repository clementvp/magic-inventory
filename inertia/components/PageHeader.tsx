import { Button } from 'antd'
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
        <Button
          type="primary"
          icon={<Icon name={actionIcon} style={{ fontSize: 16 }} />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
