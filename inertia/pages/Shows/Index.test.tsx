import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShowsIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/shows', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleShows = [
  { id: 1, name: 'Spectacle Cocktail', routinesCount: 2, createdAt: '2026-01-15T12:00:00.000Z' },
  { id: 2, name: 'Soirée Mariage', routinesCount: 0, createdAt: '2026-02-20T12:00:00.000Z' },
]

const manyShows = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  name: `Spectacle ${i + 1}`,
  routinesCount: i,
  createdAt: '2026-01-15T12:00:00.000Z',
}))

describe('ShowsIndex', () => {
  beforeEach(() => vi.clearAllMocks())

  it('affiche le titre "Mes Spectacles"', () => {
    render(<ShowsIndex shows={sampleShows} />)
    expect(screen.getByText('Mes Spectacles')).toBeDefined()
  })

  it('affiche le bouton "Créer un spectacle"', () => {
    render(<ShowsIndex shows={sampleShows} />)
    expect(screen.getByText('Créer un spectacle')).toBeDefined()
  })

  it('affiche les noms des spectacles', () => {
    render(<ShowsIndex shows={sampleShows} />)
    expect(screen.getByText('Spectacle Cocktail')).toBeDefined()
    expect(screen.getByText('Soirée Mariage')).toBeDefined()
  })

  it('affiche le nombre de routines', () => {
    render(<ShowsIndex shows={sampleShows} />)
    expect(screen.getByText('2 routine(s)')).toBeDefined()
    expect(screen.getByText('0 routine(s)')).toBeDefined()
  })

  it('affiche la date de création au format DD/MM/YYYY', () => {
    render(<ShowsIndex shows={sampleShows} />)
    expect(screen.getByText('15/01/2026')).toBeDefined()
  })

  it('clic sur une Card navigue vers /shows/:id', async () => {
    render(<ShowsIndex shows={sampleShows} />)
    await userEvent.click(screen.getByTestId('show-card-1'))
    expect(router.visit).toHaveBeenCalledWith('/shows/1')
  })

  it('clic "Créer un spectacle" (toolbar) navigue vers /shows/create', async () => {
    render(<ShowsIndex shows={sampleShows} />)
    await userEvent.click(screen.getByText('Créer un spectacle'))
    expect(router.visit).toHaveBeenCalledWith('/shows/create')
  })

  it('affiche Empty state quand aucun spectacle', () => {
    render(<ShowsIndex shows={[]} />)
    expect(screen.getByText('Aucun spectacle créé')).toBeDefined()
    expect(screen.getByText('Créer votre premier spectacle')).toBeDefined()
  })

  it('clic "Créer votre premier spectacle" navigue vers /shows/create', async () => {
    render(<ShowsIndex shows={[]} />)
    await userEvent.click(screen.getByText('Créer votre premier spectacle'))
    expect(router.visit).toHaveBeenCalledWith('/shows/create')
  })

  it('pagination absente si ≤ 12 spectacles (hideOnSinglePage)', () => {
    const { container } = render(<ShowsIndex shows={sampleShows} />)
    expect(container.querySelector('[class*="pagination"]')).toBeNull()
  })

  it('affiche la pagination avec 13+ spectacles', () => {
    const { container } = render(<ShowsIndex shows={manyShows} />)
    expect(container.querySelector('[class*="pagination"]')).not.toBeNull()
  })

  it('page 1 affiche 12 premiers spectacles, pas le 13ème', () => {
    render(<ShowsIndex shows={manyShows} />)
    expect(screen.getByText('Spectacle 1')).toBeDefined()
    expect(screen.getByText('Spectacle 12')).toBeDefined()
    expect(screen.queryByText('Spectacle 13')).toBeNull()
  })
})
