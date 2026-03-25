import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoriesIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/categories', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockCategories = [
  { id: 1, name: 'Cartomagie', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Mentalisme', createdAt: '2026-01-01T00:00:00.000Z' },
]

describe('CategoriesIndex Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title "Catégories"', async () => {
    render(<CategoriesIndex categories={mockCategories} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /catégories/i })).toBeInTheDocument()
    })
  })

  it('renders "Ajouter une catégorie" button', () => {
    render(<CategoriesIndex categories={mockCategories} />)

    expect(screen.getByRole('button', { name: /ajouter une catégorie/i })).toBeInTheDocument()
  })

  it('displays categories in the table', async () => {
    render(<CategoriesIndex categories={mockCategories} />)

    await waitFor(() => {
      expect(screen.getByText('Cartomagie')).toBeInTheDocument()
      expect(screen.getByText('Mentalisme')).toBeInTheDocument()
    })
  })

  it('opens create modal when clicking "Ajouter une catégorie"', async () => {
    const user = userEvent.setup()
    render(<CategoriesIndex categories={mockCategories} />)

    await user.click(screen.getByRole('button', { name: /ajouter une catégorie/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('opens edit modal pre-filled when clicking "Modifier"', async () => {
    const user = userEvent.setup()
    render(<CategoriesIndex categories={mockCategories} />)

    const modifierButtons = await screen.findAllByRole('button', { name: /modifier/i })
    await user.click(modifierButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Cartomagie')).toBeInTheDocument()
    })
  })

  it('renders "Supprimer" buttons as danger type for each category', async () => {
    render(<CategoriesIndex categories={mockCategories} />)

    const supprimerButtons = await screen.findAllByRole('button', { name: /supprimer/i })
    expect(supprimerButtons.length).toBeGreaterThanOrEqual(mockCategories.length)
    // Les boutons Supprimer doivent être de type danger
    supprimerButtons.slice(0, mockCategories.length).forEach((btn) => {
      expect(btn).toHaveClass('ant-btn-dangerous')
    })
  })

  it('calls router.post when submitting create form', async () => {
    const mockPost = vi.fn()
    vi.mocked(router).post = mockPost

    const user = userEvent.setup()
    render(<CategoriesIndex categories={mockCategories} />)

    await user.click(screen.getByRole('button', { name: /ajouter une catégorie/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText('Nom')
    await user.type(nameInput, 'Nouvelle catégorie')
    await user.click(screen.getByRole('button', { name: /créer/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/categories',
        { name: 'Nouvelle catégorie' },
        expect.any(Object)
      )
    })
  })

  it('calls router.put when submitting edit form', async () => {
    const mockPut = vi.fn()
    vi.mocked(router).put = mockPut

    const user = userEvent.setup()
    render(<CategoriesIndex categories={mockCategories} />)

    const modifierButtons = await screen.findAllByRole('button', { name: /modifier/i })
    await user.click(modifierButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Cartomagie')).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue('Cartomagie')
    await user.clear(nameInput)
    await user.type(nameInput, 'Cartomagie Updated')
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        '/categories/1',
        { name: 'Cartomagie Updated' },
        expect.any(Object)
      )
    })
  })

  it('renders empty table when no categories', async () => {
    render(<CategoriesIndex categories={[]} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /catégories/i })).toBeInTheDocument()
    })
  })

  it('renders title and button as siblings in the same flex container', () => {
    render(<CategoriesIndex categories={mockCategories} />)
    const heading = screen.getByRole('heading', { name: /catégories/i })
    const button = screen.getByRole('button', { name: /ajouter une catégorie/i })
    expect(heading.parentElement).toBe(button.parentElement)
  })
})
