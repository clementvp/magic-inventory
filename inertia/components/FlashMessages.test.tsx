import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { message } from 'antd'
import FlashMessages from './FlashMessages'

// Mock Inertia usePage hook
const mockUsePage = vi.fn()
vi.mock('@inertiajs/react', () => ({
  usePage: () => mockUsePage(),
}))

// Mock Ant Design message API
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }
})

describe('FlashMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays success message when flash.success is present', () => {
    mockUsePage.mockReturnValue({
      props: {
        flash: {
          success: 'Operation successful',
        },
      },
    })

    render(<FlashMessages />)

    expect(message.success).toHaveBeenCalledWith('Operation successful')
  })

  it('displays error message when flash.error is present', () => {
    mockUsePage.mockReturnValue({
      props: {
        flash: {
          error: 'An error occurred',
        },
      },
    })

    render(<FlashMessages />)

    expect(message.error).toHaveBeenCalledWith('An error occurred')
  })

  it('displays warning message when flash.warning is present', () => {
    mockUsePage.mockReturnValue({
      props: {
        flash: {
          warning: 'Warning message',
        },
      },
    })

    render(<FlashMessages />)

    expect(message.warning).toHaveBeenCalledWith('Warning message')
  })

  it('displays info message when flash.info is present', () => {
    mockUsePage.mockReturnValue({
      props: {
        flash: {
          info: 'Information message',
        },
      },
    })

    render(<FlashMessages />)

    expect(message.info).toHaveBeenCalledWith('Information message')
  })

  it('handles empty flash object gracefully', () => {
    mockUsePage.mockReturnValue({
      props: {
        flash: {},
      },
    })

    render(<FlashMessages />)

    expect(message.success).not.toHaveBeenCalled()
    expect(message.error).not.toHaveBeenCalled()
    expect(message.warning).not.toHaveBeenCalled()
    expect(message.info).not.toHaveBeenCalled()
  })

  it('displays multiple message types when present', () => {
    mockUsePage.mockReturnValue({
      props: {
        flash: {
          success: 'Success message',
          info: 'Info message',
        },
      },
    })

    render(<FlashMessages />)

    expect(message.success).toHaveBeenCalledWith('Success message')
    expect(message.info).toHaveBeenCalledWith('Info message')
  })
})
