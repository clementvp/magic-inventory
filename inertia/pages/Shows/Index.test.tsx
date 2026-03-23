import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

  it('affiche l\'input de recherche dans le toolbar', () => {
    render(<ShowsIndex shows={sampleShows} />)
    expect(screen.getByPlaceholderText('Rechercher par nom...')).toBeDefined()
  })

  describe('Recherche par nom', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('filtre par nom après debounce 300ms', () => {
      render(<ShowsIndex shows={sampleShows} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      fireEvent.change(searchInput, { target: { value: 'Cocktail' } })
      // Avant le debounce : tous les spectacles encore affichés
      expect(screen.getByText('Soirée Mariage')).toBeDefined()
      // Avancer le timer
      act(() => vi.advanceTimersByTime(300))
      // Après le debounce : seul "Spectacle Cocktail" reste
      expect(screen.queryByText('Soirée Mariage')).toBeNull()
      expect(screen.getByText('Spectacle Cocktail')).toBeDefined()
    })

    it('efface la recherche est immédiat (sans attendre le debounce)', () => {
      render(<ShowsIndex shows={sampleShows} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      // Appliquer une recherche via debounce
      fireEvent.change(searchInput, { target: { value: 'Cocktail' } })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.queryByText('Soirée Mariage')).toBeNull()
      // Effacer → doit être immédiat, sans avancer le timer
      fireEvent.change(searchInput, { target: { value: '' } })
      expect(screen.getByText('Soirée Mariage')).toBeDefined()
    })

    it('efface la recherche → tous les spectacles réapparaissent', () => {
      render(<ShowsIndex shows={sampleShows} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      fireEvent.change(searchInput, { target: { value: 'Cocktail' } })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.queryByText('Soirée Mariage')).toBeNull()
      // Effacer
      fireEvent.change(searchInput, { target: { value: '' } })
      expect(screen.getByText('Soirée Mariage')).toBeDefined()
    })

    it('affiche le compteur de résultats quand la recherche est active', () => {
      render(<ShowsIndex shows={sampleShows} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      // Avant recherche : pas de compteur
      expect(screen.queryByText('1 résultat(s)')).toBeNull()
      fireEvent.change(searchInput, { target: { value: 'Cocktail' } })
      act(() => vi.advanceTimersByTime(300))
      // Après debounce : compteur affiché (1 seul résultat pour "Cocktail")
      expect(screen.getByText('1 résultat(s)')).toBeDefined()
      // Effacer : compteur disparaît
      fireEvent.change(searchInput, { target: { value: '' } })
      expect(screen.queryByText('1 résultat(s)')).toBeNull()
    })

    it('affiche Empty state "Aucun spectacle ne correspond" quand aucun résultat', () => {
      render(<ShowsIndex shows={sampleShows} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.getByText('Aucun spectacle ne correspond à votre recherche')).toBeDefined()
      expect(screen.getByText('Réinitialiser la recherche')).toBeDefined()
    })

    it('reset la pagination à la page 1 quand la recherche change', () => {
      const { container } = render(<ShowsIndex shows={manyShows} />)
      act(() => vi.runAllTimers())
      // Naviguer vers la page 2 (Spectacle 13 visible)
      const page2Btn = container.querySelector('[class*="pagination"] li[title="2"]')
      expect(page2Btn).not.toBeNull()
      fireEvent.click(page2Btn!)
      expect(screen.getByText('Spectacle 13')).toBeDefined()
      expect(screen.queryByText('Spectacle 1')).toBeNull()
      // Appliquer une recherche → doit revenir à la page 1
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      fireEvent.change(searchInput, { target: { value: 'Spectacle' } })
      act(() => vi.advanceTimersByTime(300))
      // Toutes les shows matchent "Spectacle" → retour page 1, Spectacle 1 visible
      expect(screen.getByText('Spectacle 1')).toBeDefined()
    })
  })
})
