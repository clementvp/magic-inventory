import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import Login from './login'
import {router} from '@inertiajs/react'

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn() },
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  usePage: () => ({ url: '/login', props: {} })
}))

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields', () => {
    render(<Login />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
  })

  it('renders submit button with correct text and type', () => {
    render(<Login />)

    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveClass('ant-btn-primary')
  })

  it('displays "Mot de passe oublié ?" link', () => {
    render(<Login />)

    const forgotPasswordLink = screen.getByRole('link', { name: /mot de passe oublié/i })
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '#')
  })

  it('displays link to register page', () => {
    render(<Login />)

    const registerLink = screen.getByRole('link', { name: /s'inscrire/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })
  })

  it('displays validation error for empty password', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir votre mot de passe')).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const mockPost = vi.fn()
    vi.mocked(router).post = mockPost

    const user = userEvent.setup()
    render(<Login />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'ValidPass123')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/login', expect.objectContaining({
        email: 'test@example.com',
        password: 'ValidPass123'
      }), expect.any(Object))
    })
  })

  it('displays page title "Connexion"', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
  })

  it('displays server validation errors on form fields', async () => {
    vi.mocked(router).post = vi.fn().mockImplementation((_url, _data, options) => {
      // Simuler une erreur serveur
      if (options?.onError) {
        options.onError({
          email: ['Email ou mot de passe incorrect']
        })
      }
    })

    const user = userEvent.setup()
    render(<Login />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'WrongPassword123')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument()
    })
  })
})
