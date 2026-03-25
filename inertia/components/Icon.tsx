interface IconProps {
  name: string
  className?: string
  style?: React.CSSProperties
  filled?: boolean
  size?: number
}

export default function Icon({ name, className = '', style, filled = false, size }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : undefined,
        fontSize: size,
        ...style,
      }}
    >
      {name}
    </span>
  )
}
