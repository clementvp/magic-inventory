import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ShowsEdit from './Edit'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn() },
  usePage: () => ({ url: '/shows/1/edit', props: {} }),
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

const mockShow = {
  id: 1,
  name: 'Soirée mariage',
  notes: null,
  routineIds: [],
}

const mockAllRoutines = [
  { id: 10, name: 'La pièce voyageuse', categories: [{ id: 1, name: 'Close-up' }] },
  { id: 11, name: 'Le détective', categories: [] },
  { id: 12, name: 'Ambitious Card', categories: [] },
]

function renderEdit(showOverrides = {}) {
  return render(
    <ShowsEdit
      show={{ ...mockShow, ...showOverrides }}
      allRoutines={mockAllRoutines}
    />
  )
}

describe('ShowsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Modifier le spectacle"', () => {
    renderEdit()
    expect(screen.getByRole('heading', { name: /modifier le spectacle/i })).toBeInTheDocument()
  })

  it('affiche le champ Nom', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
  })

  it('pré-remplit le champ Nom avec le nom du spectacle', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toHaveValue('Soirée mariage')
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.put si le Nom est vide", async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.put).not.toHaveBeenCalled()
  })

  it('appelle router.put /shows/1 avec le nom à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.type(nameInput, 'Festival été')
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/shows/1',
        expect.objectContaining({ name: 'Festival été' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('affiche les erreurs serveur via onError dans router.put', async () => {
    const user = userEvent.setup()
    vi.mocked(router.put).mockImplementationOnce((_url: string, _data: unknown, options: any) => {
      options?.onError?.({ name: 'Le nom est déjà utilisé' })
      options?.onFinish?.()
    })
    renderEdit()
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Le nom est déjà utilisé')).toBeInTheDocument()
    })
  })

  it('affiche le placeholder du champ Notes', () => {
    renderEdit()
    expect(
      screen.getByPlaceholderText('Contexte, consignes de scène, timing, notes techniques...')
    ).toBeInTheDocument()
  })

  it('pré-remplit le TextArea Notes si notes non null', () => {
    renderEdit({ notes: 'Mes notes de spectacle' })
    expect(
      screen.getByPlaceholderText('Contexte, consignes de scène, timing, notes techniques...')
    ).toHaveValue('Mes notes de spectacle')
  })

  it('affiche le TextArea Notes vide si notes est null', () => {
    renderEdit({ notes: null })
    expect(
      screen.getByPlaceholderText('Contexte, consignes de scène, timing, notes techniques...')
    ).toHaveValue('')
  })

  it('envoie notes vide comme chaîne vide à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit({ notes: null })
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/shows/1',
        expect.objectContaining({ notes: '' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('inclut notes dans router.put à la soumission', async () => {
    const user = userEvent.setup()
    render(<ShowsEdit show={{ ...mockShow, notes: 'Mes notes de spectacle' }} allRoutines={mockAllRoutines} />)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/shows/1',
        expect.objectContaining({ notes: 'Mes notes de spectacle' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })
})
