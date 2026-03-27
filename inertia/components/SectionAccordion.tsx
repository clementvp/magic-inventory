import { useState } from 'react'

interface Props {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function SectionAccordion({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '4px 0',
          cursor: 'pointer',
          marginBottom: open ? 16 : 0,
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#583b00',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 36,
            color: '#8c8c8c',
            lineHeight: 1,
            display: 'inline-block',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▾
        </span>
      </button>

      <div
        style={{
          display: open ? 'block' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
