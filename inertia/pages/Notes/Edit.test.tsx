import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotesEdit from './Edit'
import { router } from '@inertiajs/react'
import Layout from '~/components/Layout'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn(), delete: vi.fn() },
  usePage: () => ({ url: '/notes/1/edit', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: vi.fn(({ children }: { children: ReactNode }) => <div>{children}</div>),
}))

const MockLayout = vi.mocked(Layout)

const sampleNote = {
  id: 1,
  title: 'Mon idée magique',
  content: 'Description du tour',
}

const emptyNote = { id: 2, title: null, content: null }

describe('NotesEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('le formulaire est pré-rempli avec le titre de la note', () => {
    render(<NotesEdit note={sampleNote} />)
    const titleInput = screen.getByRole('textbox', { name: /titre/i }) as HTMLInputElement
    expect(titleInput.value).toBe('Mon idée magique')
  })

  it('le formulaire est pré-rempli avec le contenu de la note', () => {
    render(<NotesEdit note={sampleNote} />)
    const contentInput = screen.getByRole('textbox', { name: /contenu/i }) as HTMLInputElement
    expect(contentInput.value).toBe('Description du tour')
  })

  it('le formulaire est pré-rempli avec des chaînes vides si la note a des valeurs nulles', () => {
    render(<NotesEdit note={emptyNote} />)
    const titleInput = screen.getByRole('textbox', { name: /titre/i }) as HTMLInputElement
    const contentInput = screen.getByRole('textbox', { name: /contenu/i }) as HTMLInputElement
    expect(titleInput.value).toBe('')
    expect(contentInput.value).toBe('')
  })

  it("'Retour aux notes' navigue vers /notes", () => {
    render(<NotesEdit note={sampleNote} />)
    fireEvent.click(screen.getByText('Retour aux notes'))
    expect(router.visit).toHaveBeenCalledWith('/notes')
  })

  it('le Layout reçoit title="Modifier" (breadcrumb correct)', () => {
    render(<NotesEdit note={sampleNote} />)
    expect(MockLayout).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Modifier' }),
      undefined
    )
  })

  it('le Layout reçoit breadcrumbLabels avec le titre de la note', () => {
    render(<NotesEdit note={sampleNote} />)
    expect(MockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbLabels: { '1': 'Mon idée magique' },
      }),
      undefined
    )
  })

  it('le Layout reçoit breadcrumbLabels avec "Note sans titre" quand le titre est null', () => {
    render(<NotesEdit note={emptyNote} />)
    expect(MockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbLabels: { '2': 'Note sans titre' },
      }),
      undefined
    )
  })

  it('auto-save NON déclenché au chargement initial (sans modification)', () => {
    render(<NotesEdit note={sampleNote} />)
    vi.advanceTimersByTime(3000)
    expect(router.put).not.toHaveBeenCalled()
  })

  it('auto-save NON déclenché avant 2000ms après une modification', () => {
    render(<NotesEdit note={sampleNote} />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Nouveau titre' },
    })
    vi.advanceTimersByTime(1999)
    expect(router.put).not.toHaveBeenCalled()
  })

  it('auto-save déclenché après 2000ms quand le titre change', () => {
    render(<NotesEdit note={sampleNote} />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Nouveau titre' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(router.put).toHaveBeenCalledWith(
      '/notes/1',
      { title: 'Nouveau titre', content: 'Description du tour' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })

  it('auto-save déclenché après 2000ms quand le contenu change', () => {
    render(<NotesEdit note={sampleNote} />)
    fireEvent.change(screen.getByRole('textbox', { name: /contenu/i }), {
      target: { value: 'Nouveau contenu' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(router.put).toHaveBeenCalledWith(
      '/notes/1',
      { title: 'Mon idée magique', content: 'Nouveau contenu' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })

  it("affiche 'Sauvegarde en cours...' pendant le traitement", () => {
    vi.mocked(router.put).mockImplementation((_url, _data, callbacks) => {
      void callbacks
      return undefined as unknown as ReturnType<typeof router.put>
    })
    render(<NotesEdit note={sampleNote} />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Test' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Sauvegarde en cours...')).toBeInTheDocument()
  })

  it("affiche 'Sauvegardé' après succès de l'auto-save", () => {
    vi.mocked(router.put).mockImplementation((_url, _data, callbacks: { onSuccess?: () => void } = {}) => {
      callbacks.onSuccess?.()
      return undefined as unknown as ReturnType<typeof router.put>
    })
    render(<NotesEdit note={sampleNote} />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Test' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Sauvegardé')).toBeInTheDocument()
  })

  it("affiche 'Erreur de sauvegarde' si l'auto-save échoue", () => {
    vi.mocked(router.put).mockImplementation((_url, _data, callbacks: { onError?: () => void } = {}) => {
      callbacks.onError?.()
      return undefined as unknown as ReturnType<typeof router.put>
    })
    render(<NotesEdit note={sampleNote} />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Test' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Erreur de sauvegarde')).toBeInTheDocument()
  })

  describe('suppression', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.useRealTimers()
    })

    it('affiche le bouton "Supprimer"', () => {
      render(<NotesEdit note={sampleNote} />)
      expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
    })

    it("ouvre un Popconfirm au clic 'Supprimer'", async () => {
      render(<NotesEdit note={sampleNote} />)
      await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
      expect(await screen.findByText("Êtes-vous sûr de vouloir supprimer cette note ?")).toBeInTheDocument()
    })

    it("appelle router.delete après confirmation dans le Popconfirm", async () => {
      render(<NotesEdit note={sampleNote} />)
      await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
      const supprimerButtons = await screen.findAllByRole('button', { name: /supprimer/i })
      await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
      expect(router.delete).toHaveBeenCalledWith(
        '/notes/1',
        expect.objectContaining({ onError: expect.any(Function) })
      )
    })

    it("n'appelle pas router.delete après annulation dans le Popconfirm", async () => {
      render(<NotesEdit note={sampleNote} />)
      await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
      const annulerButton = await screen.findByRole('button', { name: /annuler/i })
      await userEvent.click(annulerButton)
      expect(router.delete).not.toHaveBeenCalled()
    })

    it("le bouton Supprimer redevient actif après une erreur de suppression", async () => {
      vi.mocked(router.delete).mockImplementation((_url, callbacks) => {
        (callbacks as { onError?: () => void }).onError?.()
        return undefined as unknown as ReturnType<typeof router.delete>
      })
      render(<NotesEdit note={sampleNote} />)
      await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
      const supprimerButtons = await screen.findAllByRole('button', { name: /supprimer/i })
      await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
      expect(screen.getByRole('button', { name: /supprimer/i })).not.toBeDisabled()
    })
  })
})
