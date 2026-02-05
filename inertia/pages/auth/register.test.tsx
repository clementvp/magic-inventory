import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import Register from './register'
import {router} from '@inertiajs/react'

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn() },
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  usePage: () => ({ url: '/register', props: {} })
}))

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<Register />)

    expect(screen.getByLabelText('Nom complet')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmer le mot de passe')).toBeInTheDocument()
  })

  it('renders submit button with correct text and type', () => {
    render(<Register />)

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveClass('ant-btn-primary')
  })

  it('displays link to login page', () => {
    render(<Register />)

    const loginLink = screen.getByRole('link', { name: /se connecter/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<Register />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })
  })

  it('displays validation error for short password', async () => {
    const user = userEvent.setup()
    render(<Register />)

    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    await user.type(passwordInput, 'short')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Le mot de passe doit contenir au moins 8 caractères')).toBeInTheDocument()
    })
  })

  it('displays validation error when password confirmation does not match', async () => {
    const user = userEvent.setup()
    render(<Register />)

    const passwordInput = screen.getByLabelText('Mot de passe')
    const confirmInput = screen.getByLabelText('Confirmer le mot de passe')
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    await user.type(passwordInput, 'ValidPass123')
    await user.type(confirmInput, 'DifferentPass123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument()
    })
  })

  it('displays validation error for password without required pattern', async () => {
    const user = userEvent.setup()
    render(<Register />)

    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    await user.type(passwordInput, 'alllowercase')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/au moins une minuscule, une majuscule et un chiffre/i)).toBeInTheDocument()
    })
  })

  it('displays validation error for short fullName', async () => {
    const user = userEvent.setup()
    render(<Register />)

    const nameInput = screen.getByLabelText('Nom complet')
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    await user.type(nameInput, 'A')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Le nom doit contenir au moins 2 caractères')).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const mockPost = vi.fn()
    vi.mocked(router).post = mockPost

    const user = userEvent.setup()
    render(<Register />)

    await user.type(screen.getByLabelText('Nom complet'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'ValidPass123')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'ValidPass123')
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/register', expect.objectContaining({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        passwordConfirmation: 'ValidPass123'
      }), expect.any(Object))
    })
  })

  it('displays page title "Inscription"', () => {
    render(<Register />)

    expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument()
  })

  it('displays server validation errors on form fields', async () => {
    vi.mocked(router).post = vi.fn().mockImplementation((_url, _data, options) => {
      // Simuler une erreur serveur
      if (options?.onError) {
        options.onError({
          email: ['Cette adresse email est déjà utilisée']
        })
      }
    })

    const user = userEvent.setup()
    render(<Register />)

    await user.type(screen.getByLabelText('Nom complet'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'ValidPass123')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'ValidPass123')
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    await waitFor(() => {
      expect(screen.getByText('Cette adresse email est déjà utilisée')).toBeInTheDocument()
    })
  })
})
