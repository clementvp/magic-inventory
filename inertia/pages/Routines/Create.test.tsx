import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RoutinesCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/routines/create', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children, title }: { children: ReactNode; title?: string }) => (
    <div data-testid="layout" data-title={title}>{children}</div>
  ),
}))

vi.mock('~/components/MaterialPickerBuilder', () => ({
  default: () => <div data-testid="material-picker" />,
}))

const mockCategories = [
  { id: 1, name: 'Cartomagie' },
  { id: 2, name: 'Close-up' },
]

const mockAllMaterials = [
  { id: 1, name: 'Jeu de cartes' },
]

describe('RoutinesCreate', () => {
  it('passe le titre "Créer une routine" au Layout (AC1 breadcrumb)', () => {
    render(<RoutinesCreate categories={mockCategories} allMaterials={mockAllMaterials} />)
    expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Créer une routine')
  })

  it('affiche le champ Nom', () => {
    render(<RoutinesCreate categories={mockCategories} allMaterials={mockAllMaterials} />)
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
  })

  it('affiche la section Catégories avec les catégories disponibles', () => {
    render(<RoutinesCreate categories={mockCategories} allMaterials={mockAllMaterials} />)
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Cartomagie')).toBeInTheDocument()
    expect(screen.getByText('Close-up')).toBeInTheDocument()
  })

  it('affiche le bouton Créer la routine', () => {
    render(<RoutinesCreate categories={mockCategories} allMaterials={mockAllMaterials} />)
    expect(screen.getByRole('button', { name: /Créer la routine/i })).toBeInTheDocument()
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    render(<RoutinesCreate categories={mockCategories} allMaterials={mockAllMaterials} />)
    const submitButton = screen.getByRole('button', { name: /Créer la routine/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.post si le Nom est vide", async () => {
    const user = userEvent.setup()
    render(<RoutinesCreate categories={mockCategories} allMaterials={mockAllMaterials} />)
    const submitButton = screen.getByRole('button', { name: /Créer la routine/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.post).not.toHaveBeenCalled()
  })

  it('appelle router.post avec les bonnes données à la soumission', async () => {
    const user = userEvent.setup()
    render(<RoutinesCreate categories={mockCategories} allMaterials={mockAllMaterials} />)
    const nameInput = screen.getByLabelText('Nom')
    await user.type(nameInput, 'La pièce voyageuse')
    const submitButton = screen.getByRole('button', { name: /Créer la routine/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith(
        '/routines',
        expect.objectContaining({ name: 'La pièce voyageuse', categoryIds: [] }),
        expect.objectContaining({ onFinish: expect.any(Function), onError: expect.any(Function) })
      )
    })
  })
})
