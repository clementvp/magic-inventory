import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  categories: [],
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
})
