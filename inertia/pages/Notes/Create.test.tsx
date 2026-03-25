import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import NotesCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  usePage: () => ({ url: '/notes/create', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('NotesCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('affiche le titre "Nouvelle note"', () => {
    render(<NotesCreate />)
    expect(screen.getByText('Nouvelle note')).toBeDefined()
  })

  it('affiche le champ Titre avec autoFocus et le TextArea Contenu', () => {
    render(<NotesCreate />)
    expect(screen.getByRole('textbox', { name: /titre/i })).toBeDefined()
    expect(screen.getByRole('textbox', { name: /contenu/i })).toBeDefined()
  })

  it("affiche le bouton 'Retour aux notes'", () => {
    render(<NotesCreate />)
    expect(screen.getByText('Retour aux notes')).toBeDefined()
  })

  it("'Retour aux notes' navigue vers /notes", () => {
    render(<NotesCreate />)
    fireEvent.click(screen.getByText('Retour aux notes'))
    expect(router.visit).toHaveBeenCalledWith('/notes')
  })

  it("auto-save NON déclenché si titre ET contenu sont vides", () => {
    render(<NotesCreate />)
    vi.advanceTimersByTime(3000)
    expect(router.post).not.toHaveBeenCalled()
  })

  it("auto-save NON déclenché avant 2000ms", () => {
    render(<NotesCreate />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Mon idée' },
    })
    vi.advanceTimersByTime(1999)
    expect(router.post).not.toHaveBeenCalled()
  })

  it("auto-save déclenché après 2000ms avec le titre saisi", () => {
    render(<NotesCreate />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Mon idée' },
    })
    vi.advanceTimersByTime(2000)
    expect(router.post).toHaveBeenCalledWith(
      '/notes',
      { title: 'Mon idée', content: '' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })

  it("affiche 'Sauvegarde en cours...' pendant le traitement", () => {
    vi.mocked(router.post).mockImplementation((_url, _data, callbacks) => {
      void callbacks
      return undefined as unknown as ReturnType<typeof router.post>
    })
    render(<NotesCreate />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Test' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Sauvegarde en cours...')).toBeDefined()
  })

  it("affiche 'Sauvegardé' après succès de l'auto-save", () => {
    vi.mocked(router.post).mockImplementation((_url, _data, callbacks: { onSuccess?: () => void } = {}) => {
      callbacks.onSuccess?.()
      return undefined as unknown as ReturnType<typeof router.post>
    })
    render(<NotesCreate />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Test' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Sauvegardé')).toBeDefined()
  })

  it("affiche 'Erreur de sauvegarde' si l'auto-save échoue", () => {
    vi.mocked(router.post).mockImplementation((_url, _data, callbacks: { onError?: () => void } = {}) => {
      callbacks.onError?.()
      return undefined as unknown as ReturnType<typeof router.post>
    })
    render(<NotesCreate />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Test' },
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Erreur de sauvegarde')).toBeDefined()
  })

  it("auto-save déclenché après 2000ms avec le contenu seul (titre vide)", () => {
    render(<NotesCreate />)
    fireEvent.change(screen.getByRole('textbox', { name: /contenu/i }), {
      target: { value: 'Mon contenu seulement' },
    })
    vi.advanceTimersByTime(2000)
    expect(router.post).toHaveBeenCalledWith(
      '/notes',
      { title: '', content: 'Mon contenu seulement' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })
})
