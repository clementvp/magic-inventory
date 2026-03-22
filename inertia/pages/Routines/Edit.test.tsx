import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import RoutinesEdit from './Edit'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/routines/1/edit', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockRoutine = {
  id: 1,
  name: 'La pièce voyageuse',
  content: 'Acte 1 : Le magicien présente une pièce...',
  categoryIds: [1, 2],
}

const mockRoutineNoContent = {
  id: 1,
  name: 'La pièce voyageuse',
  content: null,
  categoryIds: [],
}

const mockCategories = [
  { id: 1, name: 'Close-up' },
  { id: 2, name: 'Mentalisme' },
]

function renderEdit(routineOverrides = {}) {
  return render(
    <RoutinesEdit
      routine={{ ...mockRoutine, ...routineOverrides }}
      categories={mockCategories}
    />
  )
}

describe('RoutinesEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Modifier la routine"', () => {
    renderEdit()
    expect(screen.getByRole('heading', { name: /modifier la routine/i })).toBeInTheDocument()
  })

  it('affiche les 3 champs (Nom, Catégorie(s), Contenu)', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Catégorie(s)')).toBeInTheDocument()
    expect(screen.getByText('Contenu')).toBeInTheDocument()
  })

  it('pré-remplit le champ Nom avec le nom de la routine', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toHaveValue('La pièce voyageuse')
  })

  it('pré-remplit le champ Contenu avec le contenu existant', () => {
    renderEdit()
    expect(
      screen.getByPlaceholderText('Écrivez votre script, mise en scène, déroulé technique...')
    ).toHaveValue('Acte 1 : Le magicien présente une pièce...')
  })

  it('affiche le champ Contenu vide si content est null', () => {
    render(<RoutinesEdit routine={mockRoutineNoContent} categories={mockCategories} />)
    expect(
      screen.getByPlaceholderText('Écrivez votre script, mise en scène, déroulé technique...')
    ).toHaveValue('')
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.put si le Nom est vide", async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.put).not.toHaveBeenCalled()
  })

  it('appelle router.put avec les bonnes données à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.type(nameInput, 'Le détective')
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/routines/1',
        expect.objectContaining({
          name: 'Le détective',
          content: 'Acte 1 : Le magicien présente une pièce...',
          categoryIds: [1, 2],
        }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('appelle router.visit vers /routines/1 au clic Annuler', async () => {
    const user = userEvent.setup()
    renderEdit()
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)
    expect(router.visit).toHaveBeenCalledWith('/routines/1')
  })

  it('appelle router.visit vers /routines/1 au clic "Liaison matériel"', async () => {
    const user = userEvent.setup()
    renderEdit()
    const liaisonButton = screen.getByRole('button', { name: /liaison matériel/i })
    await user.click(liaisonButton)
    expect(router.visit).toHaveBeenCalledWith('/routines/1')
  })
})
