import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotesIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), delete: vi.fn() },
  usePage: () => ({ url: '/notes', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleNotes = [
  {
    id: 1,
    title: 'Idée magie',
    content: 'Un tour avec des cartes',
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-01-15T12:00:00.000Z',
  },
  {
    id: 2,
    title: null,
    content: null,
    createdAt: '2026-02-20T12:00:00.000Z',
  },
]

const manyNotes = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  title: `Note ${i + 1}`,
  content: 'Contenu',
  createdAt: '2026-01-15T12:00:00.000Z',
}))

const exactlyTwentyNotes = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Note ${i + 1}`,
  content: 'Contenu',
  createdAt: '2026-01-15T12:00:00.000Z',
}))

describe('NotesIndex', () => {
  beforeEach(() => vi.clearAllMocks())

  it('affiche le titre "Mes Notes"', () => {
    render(<NotesIndex notes={sampleNotes} />)
    expect(screen.getByText('Mes Notes')).toBeDefined()
  })

  it('affiche le bouton "Nouvelle note"', () => {
    render(<NotesIndex notes={sampleNotes} />)
    expect(screen.getByText('Nouvelle note')).toBeDefined()
  })

  it('affiche les titres des notes', () => {
    render(<NotesIndex notes={sampleNotes} />)
    expect(screen.getByText('Idée magie')).toBeDefined()
  })

  it('affiche l\'extrait du contenu (100 premiers caractères)', () => {
    const longContent = 'A'.repeat(110)
    render(<NotesIndex notes={[{ id: 1, title: 'Test', content: longContent, createdAt: '2026-01-15T12:00:00.000Z' }]} />)
    expect(screen.getByText('A'.repeat(100) + '...')).toBeDefined()
  })

  it('n\'affiche pas "..." si contenu ≤ 100 chars', () => {
    const shortContent = 'A'.repeat(100)
    render(<NotesIndex notes={[{ id: 1, title: 'Test', content: shortContent, createdAt: '2026-01-15T12:00:00.000Z' }]} />)
    expect(screen.getByText('A'.repeat(100))).toBeDefined()
    expect(screen.queryByText('A'.repeat(100) + '...')).toBeNull()
  })

  it('affiche la date au format DD/MM/YYYY', () => {
    render(<NotesIndex notes={sampleNotes} />)
    expect(screen.getByText('15/01/2026')).toBeDefined()
  })

  it('clic sur une Card navigue vers /notes/:id/edit', async () => {
    render(<NotesIndex notes={sampleNotes} />)
    await userEvent.click(screen.getByTestId('note-card-1'))
    expect(router.visit).toHaveBeenCalledWith('/notes/1/edit')
  })

  it('affiche Empty state "Aucune note créée" quand 0 notes', () => {
    render(<NotesIndex notes={[]} />)
    expect(screen.getByText('Aucune note créée')).toBeDefined()
    expect(screen.getByText('Créer votre première note')).toBeDefined()
  })

  it('clic "Créer votre première note" navigue vers /notes/create', async () => {
    render(<NotesIndex notes={[]} />)
    await userEvent.click(screen.getByText('Créer votre première note'))
    expect(router.visit).toHaveBeenCalledWith('/notes/create')
  })

  it('clic "Nouvelle note" navigue vers /notes/create', async () => {
    render(<NotesIndex notes={sampleNotes} />)
    await userEvent.click(screen.getByText('Nouvelle note'))
    expect(router.visit).toHaveBeenCalledWith('/notes/create')
  })

  it('pagination absente si ≤ 20 notes (hideOnSinglePage)', () => {
    const { container } = render(<NotesIndex notes={sampleNotes} />)
    expect(container.querySelector('[class*="pagination"]')).toBeNull()
  })

  it('pagination absente avec exactement 20 notes (boundary hideOnSinglePage)', () => {
    const { container } = render(<NotesIndex notes={exactlyTwentyNotes} />)
    expect(container.querySelector('[class*="pagination"]')).toBeNull()
  })

  it('affiche la pagination avec 21+ notes', () => {
    const { container } = render(<NotesIndex notes={manyNotes} />)
    expect(container.querySelector('[class*="pagination"]')).not.toBeNull()
  })

  it('page 1 affiche 20 premières notes, pas la 21ème', () => {
    render(<NotesIndex notes={manyNotes} />)
    expect(screen.getByText('Note 1')).toBeDefined()
    expect(screen.getByText('Note 20')).toBeDefined()
    expect(screen.queryByText('Note 21')).toBeNull()
  })

  it('note sans titre affiche "(Sans titre)"', () => {
    render(<NotesIndex notes={sampleNotes} />)
    expect(screen.getByText('(Sans titre)')).toBeDefined()
  })

  it('note sans contenu n\'affiche pas d\'extrait', () => {
    render(<NotesIndex notes={[{ id: 2, title: null, content: null, createdAt: '2026-02-20T12:00:00.000Z' }]} />)
    expect(screen.getByText('(Sans titre)')).toBeDefined()
    expect(screen.queryByText('...')).toBeNull()
  })

  it('navigation clavier (Enter) sur une Card navigue vers /notes/:id/edit', async () => {
    render(<NotesIndex notes={sampleNotes} />)
    const card = screen.getByTestId('note-card-1')
    card.focus()
    await userEvent.keyboard('{Enter}')
    expect(router.visit).toHaveBeenCalledWith('/notes/1/edit')
  })

  it('navigation clavier (Space) sur une Card navigue vers /notes/:id/edit', async () => {
    render(<NotesIndex notes={sampleNotes} />)
    const card = screen.getByTestId('note-card-1')
    card.focus()
    await userEvent.keyboard(' ')
    expect(router.visit).toHaveBeenCalledWith('/notes/1/edit')
  })

  it('affiche le bouton Supprimer sur chaque note', () => {
    render(<NotesIndex notes={sampleNotes} />)
    expect(screen.getAllByRole('button', { name: /supprimer/i })).toHaveLength(2)
  })

  it("ouvre un Popconfirm au clic 'Supprimer' sur une note", async () => {
    render(<NotesIndex notes={sampleNotes} />)
    const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerBtns[0])
    expect(await screen.findByText("Êtes-vous sûr de vouloir supprimer cette note ?")).toBeInTheDocument()
  })

  it("appelle router.delete après confirmation dans le Popconfirm", async () => {
    render(<NotesIndex notes={sampleNotes} />)
    const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerBtns[0])
    const confirmBtns = await screen.findAllByRole('button', { name: /supprimer/i })
    await userEvent.click(confirmBtns[confirmBtns.length - 1])
    expect(router.delete).toHaveBeenCalledWith(
      '/notes/1',
      expect.objectContaining({ onError: expect.any(Function) })
    )
  })

  it("n'appelle pas router.delete après annulation dans le Popconfirm", async () => {
    render(<NotesIndex notes={sampleNotes} />)
    const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerBtns[0])
    const annulerButton = await screen.findByRole('button', { name: /annuler/i })
    await userEvent.click(annulerButton)
    expect(router.delete).not.toHaveBeenCalled()
  })

  it("clic 'Supprimer' ne navigue pas vers /notes/:id/edit (stopPropagation)", async () => {
    render(<NotesIndex notes={sampleNotes} />)
    const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerBtns[0])
    expect(router.visit).not.toHaveBeenCalled()
  })

  it("les boutons Supprimer sont de nouveau actifs après une erreur de suppression", async () => {
    vi.mocked(router.delete).mockImplementation((_url, callbacks) => {
      (callbacks as { onError?: () => void }).onError?.()
      return undefined as unknown as ReturnType<typeof router.delete>
    })
    render(<NotesIndex notes={sampleNotes} />)
    const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerBtns[0])
    const confirmBtns = await screen.findAllByRole('button', { name: /supprimer/i })
    await userEvent.click(confirmBtns[confirmBtns.length - 1])
    screen.getAllByRole('button', { name: /supprimer/i }).forEach((btn) => {
      expect(btn).not.toBeDisabled()
    })
  })
})
