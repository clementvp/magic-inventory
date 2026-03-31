import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ShowsCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  usePage: () => ({ url: '/shows/create', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children, title }: { children: ReactNode; title?: string }) => (
    <div data-testid="layout" data-title={title}>{children}</div>
  ),
}))

vi.mock('~/components/SectionAccordion', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('~/components/RoutineSetlistBuilder', () => ({
  default: () => <div data-testid="routine-setlist-builder" />,
}))

const mockAllRoutines = [
  { id: 1, name: 'La pièce voyageuse', categories: [] },
  { id: 2, name: 'Le détective', categories: [] },
]

describe('ShowsCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passe le titre "Créer un spectacle" au Layout', () => {
    render(<ShowsCreate allRoutines={mockAllRoutines} />)
    expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Créer un spectacle')
  })

  it('affiche le champ Nom', () => {
    render(<ShowsCreate allRoutines={mockAllRoutines} />)
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
  })

  it('affiche le bouton "Créer le spectacle"', () => {
    render(<ShowsCreate allRoutines={mockAllRoutines} />)
    expect(screen.getByRole('button', { name: /créer le spectacle/i })).toBeInTheDocument()
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    render(<ShowsCreate allRoutines={mockAllRoutines} />)
    const submitButton = screen.getByRole('button', { name: /créer le spectacle/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.post si le Nom est vide", async () => {
    const user = userEvent.setup()
    render(<ShowsCreate allRoutines={mockAllRoutines} />)
    const submitButton = screen.getByRole('button', { name: /créer le spectacle/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.post).not.toHaveBeenCalled()
  })

  it('appelle router.post /shows avec le nom à la soumission', async () => {
    const user = userEvent.setup()
    render(<ShowsCreate allRoutines={mockAllRoutines} />)
    const nameInput = screen.getByLabelText('Nom')
    await user.type(nameInput, 'Soirée mariage')
    const submitButton = screen.getByRole('button', { name: /créer le spectacle/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith(
        '/shows',
        expect.objectContaining({ name: 'Soirée mariage' }),
        expect.objectContaining({ onFinish: expect.any(Function), onError: expect.any(Function) })
      )
    })
  })
})
