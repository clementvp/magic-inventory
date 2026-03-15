import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileEdit from './edit'
import { router } from '@inertiajs/react'

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/profile', props: {} }),
}))

// Mock Layout pour isoler les tests de la page Profile
vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockUser = {
  id: 1,
  fullName: 'John Doe',
  email: 'john@example.com',
}

describe('ProfileEdit Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders profile form with pre-filled data', async () => {
    render(<ProfileEdit user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    })
  })

  it('renders "Nom complet" and "Email" labels', () => {
    render(<ProfileEdit user={mockUser} />)

    expect(screen.getByLabelText('Nom complet')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders submit button "Enregistrer" with type primary', () => {
    render(<ProfileEdit user={mockUser} />)

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveClass('ant-btn-primary')
  })

  it('renders page title "Mon Profil"', () => {
    render(<ProfileEdit user={mockUser} />)

    expect(screen.getByRole('heading', { name: /mon profil/i })).toBeInTheDocument()
  })

  it('displays validation error when name is empty', async () => {
    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    const nameInput = screen.getByLabelText('Nom complet')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir votre nom complet')).toBeInTheDocument()
    })
  })

  it('displays validation error when name is less than 2 characters', async () => {
    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    const nameInput = screen.getByLabelText('Nom complet')
    await user.clear(nameInput)
    await user.type(nameInput, 'A')
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Le nom doit contenir au moins 2 caractères')
      ).toBeInTheDocument()
    })
  })

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    const emailInput = screen.getByLabelText('Email')
    await user.clear(emailInput)
    await user.type(emailInput, 'invalid-email')
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })
  })

  it('displays validation error when email is empty', async () => {
    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    const emailInput = screen.getByLabelText('Email')
    await user.clear(emailInput)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir votre email')).toBeInTheDocument()
    })
  })

  it('submits form with valid data via router.post', async () => {
    const mockPost = vi.fn()
    vi.mocked(router).post = mockPost

    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText('Nom complet')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/profile',
        expect.objectContaining({
          fullName: 'Jane Doe',
          email: 'john@example.com',
        }),
        expect.any(Object)
      )
    })
  })

  it('displays server error for duplicate email', async () => {
    vi.mocked(router).post = vi.fn().mockImplementation((_url, _data, options) => {
      if (options?.onError) {
        options.onError({
          email: ['Cet email est déjà utilisé'],
        })
      }
    })

    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Cet email est déjà utilisé')).toBeInTheDocument()
    })
  })

  it('pre-fills form with null fullName as empty string', async () => {
    const userWithNullName = { ...mockUser, fullName: null }
    render(<ProfileEdit user={userWithNullName} />)

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Nom complet')
      expect(nameInput).toHaveValue('')
    })
  })

  // Tests Zone dangereuse

  it('renders "Zone dangereuse" section with danger button', () => {
    render(<ProfileEdit user={mockUser} />)

    expect(screen.getByRole('heading', { name: /zone dangereuse/i })).toBeInTheDocument()
    const deleteButton = screen.getByRole('button', { name: /supprimer mon compte/i })
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toHaveClass('ant-btn-dangerous')
    expect(deleteButton).toHaveClass('ant-btn-primary')
  })

  it('opens confirmation modal when clicking "Supprimer mon compte"', async () => {
    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /supprimer mon compte/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByText('Êtes-vous sûr de vouloir supprimer votre compte ?')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Cette action est irréversible. Toutes vos données seront supprimées définitivement.'
        )
      ).toBeInTheDocument()
    })
  })

  it('calls router.delete when confirming account deletion', async () => {
    const mockDelete = vi.fn()
    vi.mocked(router).delete = mockDelete

    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /supprimer mon compte/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^supprimer$/i }))

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/profile', expect.any(Object))
    })
  })

  it('closes modal when clicking "Annuler"', async () => {
    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /supprimer mon compte/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /annuler/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // Tests section "Mes données" (Story 1.6)

  it('renders "Mes données" section with export button', () => {
    render(<ProfileEdit user={mockUser} />)

    expect(screen.getByRole('heading', { name: /mes données/i })).toBeInTheDocument()
    const exportButton = screen.getByRole('button', { name: /exporter mes données/i })
    expect(exportButton).toBeInTheDocument()
  })

  it('export button is type default (not primary, not danger)', () => {
    render(<ProfileEdit user={mockUser} />)

    const exportButton = screen.getByRole('button', { name: /exporter mes données/i })
    expect(exportButton).toHaveClass('ant-btn-default')
    expect(exportButton).not.toHaveClass('ant-btn-primary')
    expect(exportButton).not.toHaveClass('ant-btn-dangerous')
  })

  it('sets window.location.href to /profile/export when clicking export button', async () => {
    vi.stubGlobal('location', { href: '' })

    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /exporter mes données/i }))

    expect(window.location.href).toBe('/profile/export')
  })

  it('does not call router.delete when cancelling', async () => {
    const mockDelete = vi.fn()
    vi.mocked(router).delete = mockDelete

    const user = userEvent.setup()
    render(<ProfileEdit user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /supprimer mon compte/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /annuler/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(mockDelete).not.toHaveBeenCalled()
  })
})
