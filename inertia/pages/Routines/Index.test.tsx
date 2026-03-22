import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutinesIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/routines', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleRoutines = [
  {
    id: 1,
    name: 'Apparition du foulard',
    // Noon UTC — même date dans tous les fuseaux horaires UTC-11 à UTC+11
    categories: [
      { id: 1, name: 'Close-up' },
      { id: 2, name: 'Scène' },
    ],
    createdAt: '2026-01-15T12:00:00.000Z',
  },
  {
    id: 2,
    name: 'Disparition de pièce',
    categories: [],
    createdAt: '2026-02-20T12:00:00.000Z',
  },
]

// 13 routines pour tester la pagination (> PAGE_SIZE=12)
const manyRoutines = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  name: `Routine ${i + 1}`,
  categories: i === 0 ? [{ id: 1, name: 'Close-up' }] : [],
  createdAt: '2026-01-15T12:00:00.000Z',
}))

describe('RoutinesIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre et le bouton de création', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Mes Routines')).toBeDefined()
    expect(screen.getByText('Créer une routine')).toBeDefined()
  })

  it('clique "Créer une routine" navigue vers /routines/create', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    await userEvent.click(screen.getByText('Créer une routine'))
    expect(router.visit).toHaveBeenCalledWith('/routines/create')
  })

  it('affiche les noms des routines', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Apparition du foulard')).toBeDefined()
    expect(screen.getByText('Disparition de pièce')).toBeDefined()
  })

  it('affiche les catégories en Tags (y compris plusieurs)', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Close-up')).toBeDefined()
    expect(screen.getByText('Scène')).toBeDefined()
  })

  it('affiche "Aucune catégorie" si la routine n\'a pas de catégorie', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Aucune catégorie')).toBeDefined()
  })

  it('affiche la date de création au format DD/MM/YYYY', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('15/01/2026')).toBeDefined()
  })

  it('clic sur une Card navigue vers /routines/:id', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    const cardEl = screen.getByText('Apparition du foulard').closest('.ant-card')!
    await userEvent.click(cardEl)
    expect(router.visit).toHaveBeenCalledWith('/routines/1')
  })

  it('affiche Empty state quand aucune routine', () => {
    render(<RoutinesIndex routines={[]} />)
    expect(screen.getByText('Aucune routine créée')).toBeDefined()
    expect(screen.getByText('Créer votre première routine')).toBeDefined()
  })

  it('clique "Créer votre première routine" navigue vers /routines/create', async () => {
    render(<RoutinesIndex routines={[]} />)
    await userEvent.click(screen.getByText('Créer votre première routine'))
    expect(router.visit).toHaveBeenCalledWith('/routines/create')
  })

  it('Pagination absente si moins de 12 routines (hideOnSinglePage)', () => {
    const { container } = render(<RoutinesIndex routines={sampleRoutines} />)
    // hideOnSinglePage retourne null quand total <= pageSize — aucun nœud pagination dans le DOM
    expect(container.querySelector('[class*="pagination"]')).toBeNull()
  })

  it('affiche la pagination avec 13+ routines (AC 4)', () => {
    const { container } = render(<RoutinesIndex routines={manyRoutines} />)
    expect(container.querySelector('[class*="pagination"]')).not.toBeNull()
  })

  it('la page 1 affiche les 12 premières routines, pas la 13ème (AC 4)', () => {
    render(<RoutinesIndex routines={manyRoutines} />)
    expect(screen.getByText('Routine 1')).toBeDefined()
    expect(screen.getByText('Routine 12')).toBeDefined()
    expect(screen.queryByText('Routine 13')).toBeNull()
  })

  // --- Nouveaux tests Story 4.8 ---

  it('affiche l\'input de recherche dans le toolbar (AC: 1)', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByPlaceholderText('Rechercher par nom...')).toBeDefined()
  })

  it('affiche le bouton "Filtres" (AC: 1)', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Filtres')).toBeDefined()
  })

  describe('Recherche par nom (debounce)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('filtre par nom après debounce 300ms (AC: 2)', async () => {
      render(<RoutinesIndex routines={sampleRoutines} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      fireEvent.change(searchInput, { target: { value: 'Apparition' } })
      // Avant le debounce : les deux routines encore affichées
      expect(screen.getByText('Disparition de pièce')).toBeDefined()
      // Avancer le timer
      act(() => vi.advanceTimersByTime(300))
      // Après le debounce : seule la routine "Apparition" reste
      expect(screen.queryByText('Disparition de pièce')).toBeNull()
      expect(screen.getByText('Apparition du foulard')).toBeDefined()
    })

    it('effacer la recherche réaffiche toutes les routines (AC: 3)', async () => {
      render(<RoutinesIndex routines={sampleRoutines} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      // Filtrer
      fireEvent.change(searchInput, { target: { value: 'Apparition' } })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.queryByText('Disparition de pièce')).toBeNull()
      // Effacer
      fireEvent.change(searchInput, { target: { value: '' } })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.getByText('Disparition de pièce')).toBeDefined()
      expect(screen.getByText('Apparition du foulard')).toBeDefined()
    })

    it('la recherche est case-insensitive (AC: 2)', () => {
      render(<RoutinesIndex routines={sampleRoutines} />)
      const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
      fireEvent.change(searchInput, { target: { value: 'apparition' } })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.getByText('Apparition du foulard')).toBeDefined()
      expect(screen.queryByText('Disparition de pièce')).toBeNull()
    })
  })

  it('ouvre le Drawer au clic "Filtres" (AC: 4)', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    await userEvent.click(screen.getByText('Filtres'))
    expect(screen.getByText('Catégorie(s)')).toBeDefined()
  })

  // [L1] Bouton "Réinitialiser les filtres" désactivé quand aucun filtre actif
  it('bouton "Réinitialiser les filtres" est désactivé si aucun filtre Drawer actif (AC: 6)', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    await userEvent.click(screen.getByText('Filtres'))
    const resetBtn = screen.getByText('Réinitialiser les filtres').closest('button')!
    expect(resetBtn.disabled).toBe(true)
  })

  it('filtre par Catégorie via le Select Drawer (AC: 5)', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    // Ouvrir le Drawer
    await userEvent.click(screen.getByText('Filtres'))
    // Ouvrir le Select
    fireEvent.mouseDown(screen.getByLabelText('Catégories'))
    // Sélectionner la catégorie
    const option = await screen.findByTitle('Close-up')
    fireEvent.click(option)
    // La routine sans catégorie ne doit plus être affichée
    expect(screen.queryByText('Disparition de pièce')).toBeNull()
    expect(screen.getByText('Apparition du foulard')).toBeDefined()
  })

  it('"Réinitialiser les filtres" remet à zéro catégories ET recherche (AC: 6)', async () => {
    vi.useFakeTimers()
    render(<RoutinesIndex routines={sampleRoutines} />)
    // Appliquer une recherche
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
    fireEvent.change(searchInput, { target: { value: 'Apparition' } })
    act(() => vi.advanceTimersByTime(300))
    expect(screen.queryByText('Disparition de pièce')).toBeNull()
    // Ouvrir le Drawer avec fireEvent (compatible avec fake timers)
    fireEvent.click(screen.getByText('Filtres'))
    fireEvent.mouseDown(screen.getByLabelText('Catégories'))
    // virtual={false} → options déjà dans le DOM, pas besoin d'attente async
    const option = screen.getByTitle('Close-up')
    fireEvent.click(option)
    // Réinitialiser via le bouton Drawer — doit tout effacer (AC: 6 "toutes les routines réapparaissent")
    fireEvent.click(screen.getByText('Réinitialiser les filtres'))
    act(() => vi.runAllTimers())
    expect(screen.getByText('Disparition de pièce')).toBeDefined()
    expect(screen.getByText('Apparition du foulard')).toBeDefined()
    vi.useRealTimers()
  })

  // [H1 + L3] Test AC7 unique et complet (le test mort précédent supprimé)
  it('affiche Empty state "Aucune routine ne correspond" via recherche sans résultat (AC: 7)', () => {
    vi.useFakeTimers()
    render(<RoutinesIndex routines={sampleRoutines} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
    fireEvent.change(searchInput, { target: { value: 'ZZZ_INEXISTANT' } })
    act(() => vi.advanceTimersByTime(300))
    expect(screen.getByText('Aucune routine ne correspond à vos critères de recherche')).toBeDefined()
    expect(screen.getByText('Réinitialiser la recherche')).toBeDefined()
    vi.useRealTimers()
  })

  // [M1] Test reset pagination : assertion stricte sur le bouton page 2
  it('reset pagination à la page 1 quand les filtres changent (AC: 8)', async () => {
    vi.useFakeTimers()
    const { container } = render(<RoutinesIndex routines={manyRoutines} />)
    act(() => vi.runAllTimers())
    const page2Btn = container.querySelector('[class*="pagination"] li[title="2"]')
    expect(page2Btn).not.toBeNull()
    fireEvent.click(page2Btn!)
    // Appliquer une recherche → doit revenir à la page 1
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
    fireEvent.change(searchInput, { target: { value: 'Routine' } })
    act(() => vi.advanceTimersByTime(300))
    // Toutes les routines matchent "Routine" → page 1, Routine 1 visible
    expect(screen.getByText('Routine 1')).toBeDefined()
    vi.useRealTimers()
  })
})
