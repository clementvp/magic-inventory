import { useEffect } from 'react'
import { message } from 'antd'
import { usePage } from '@inertiajs/react'

interface FlashProps {
  success?: string
  error?: string
  warning?: string
  info?: string
}

interface PageProps {
  flash: FlashProps
}

export default function FlashMessages() {
  const { props } = usePage<PageProps>()
  const flash = props.flash || {}

  useEffect(() => {
    if (flash.success) {
      message.success(flash.success)
    }
    if (flash.error) {
      message.error(flash.error)
    }
    if (flash.warning) {
      message.warning(flash.warning)
    }
    if (flash.info) {
      message.info(flash.info)
    }
  }, [flash])

  return null
}
