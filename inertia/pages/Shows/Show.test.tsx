import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import ShowsShow from './Show'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), delete: vi.fn() },
  usePage: () => ({ url: '/shows/1', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}))

const sampleShow = {
  id: 1,
  name: 'Spectacle Cocktail',
  notes: 'Note de préparation\nDeuxième ligne',
  createdAt: '2026-01-15T12:00:00.000Z',
  routines: [
    { id: 10, name: 'Routine Cartes', categories: [{ id: 1, name: 'Magie des cartes' }] },
    { id: 11, name: 'Routine Pièces', categories: [] },
  ],
}

const showNoRoutines = {
  id: 2,
  name: 'Soirée Corporate',
  notes: null,
  createdAt: '2026-02-01T12:00:00.000Z',
  routines: [],
}

describe('ShowsShow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le nom du spectacle en titre h1', () => {
    render(<ShowsShow show={sampleShow} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Spectacle Cocktail' })).toBeDefined()
  })

  it('passe le nom du spectacle au Layout pour le breadcrumb', () => {
    render(<ShowsShow show={sampleShow} />)
    expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Spectacle Cocktail')
  })

  it('affiche les notes du spectacle', () => {
    render(<ShowsShow show={sampleShow} />)
    expect(screen.getByText(/Note de préparation/)).toBeDefined()
  })

  it('préserve les retours à la ligne dans les notes (style pre-wrap)', () => {
    render(<ShowsShow show={sampleShow} />)
    const notesEl = screen.getByText(/Note de préparation/)
    const styledEl = notesEl.closest('[style]') as HTMLElement
    expect(styledEl?.style.whiteSpace).toBe('pre-wrap')
  })

  it("n'affiche pas la section notes si notes est null", () => {
    render(<ShowsShow show={showNoRoutines} />)
    expect(screen.queryByText('Notes')).toBeNull()
  })

  it('affiche les noms des routines', () => {
    render(<ShowsShow show={sampleShow} />)
    expect(screen.getByText('Routine Cartes')).toBeDefined()
    expect(screen.getByText('Routine Pièces')).toBeDefined()
  })

  it('affiche les catégories des routines en Tags', () => {
    render(<ShowsShow show={sampleShow} />)
    expect(screen.getByText('Magie des cartes')).toBeDefined()
  })

  it('affiche "—" pour une routine sans catégories', () => {
    render(<ShowsShow show={sampleShow} />)
    expect(screen.getByText('—')).toBeDefined()
  })

  it("affiche l'empty state quand il n'y a aucune routine", () => {
    render(<ShowsShow show={showNoRoutines} />)
    expect(screen.getByText('Aucune routine dans ce spectacle')).toBeDefined()
  })

  it('clic sur une routine navigue vers /routines/:id', async () => {
    render(<ShowsShow show={sampleShow} />)
    await userEvent.click(screen.getByTestId('routine-item-10'))
    expect(router.visit).toHaveBeenCalledWith('/routines/10')
  })

  it('entrée clavier sur une routine navigue vers /routines/:id', async () => {
    render(<ShowsShow show={sampleShow} />)
    screen.getByTestId('routine-item-10').focus()
    await userEvent.keyboard('{Enter}')
    expect(router.visit).toHaveBeenCalledWith('/routines/10')
  })

  it('clic "Modifier" navigue vers /shows/:id/edit', async () => {
    render(<ShowsShow show={sampleShow} />)
    await userEvent.click(screen.getByRole('button', { name: /modifier/i }))
    expect(router.visit).toHaveBeenCalledWith('/shows/1/edit')
  })

  it('clic "Générer checklist" navigue vers /shows/:id/checklist', async () => {
    render(<ShowsShow show={sampleShow} />)
    await userEvent.click(screen.getByRole('button', { name: /générer checklist/i }))
    expect(router.visit).toHaveBeenCalledWith('/shows/1/checklist')
  })

  it("ouvre un Popconfirm au clic 'Supprimer'", async () => {
    render(<ShowsShow show={sampleShow} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    expect(await screen.findByText("Êtes-vous sûr de vouloir supprimer ce spectacle ?")).toBeInTheDocument()
  })

  it("appelle router.delete après confirmation dans le Popconfirm", async () => {
    render(<ShowsShow show={sampleShow} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    const confirmBtn = await screen.findByRole('button', { name: /oui, supprimer/i })
    await userEvent.click(confirmBtn)
    expect(router.delete).toHaveBeenCalledWith(
      '/shows/1',
      expect.objectContaining({ onError: expect.any(Function), onFinish: expect.any(Function) })
    )
  })

  it("n'appelle pas router.delete après annulation dans le Popconfirm", async () => {
    render(<ShowsShow show={sampleShow} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    const annulerButton = await screen.findByRole('button', { name: /annuler/i })
    await userEvent.click(annulerButton)
    expect(router.delete).not.toHaveBeenCalled()
  })

  it("onError affiche message.error et réinitialise l'état loading", async () => {
    const messageSpy = vi.spyOn(message, 'error').mockImplementation(() => {})
    vi.mocked(router.delete).mockImplementationOnce((_url: string, options: any) => {
      options?.onError?.()
    })
    render(<ShowsShow show={sampleShow} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    const confirmBtn = await screen.findByRole('button', { name: /oui, supprimer/i })
    await userEvent.click(confirmBtn)
    expect(messageSpy).toHaveBeenCalledWith('Une erreur est survenue lors de la suppression du spectacle')
    messageSpy.mockRestore()
  })
})
