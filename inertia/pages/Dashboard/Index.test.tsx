import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import DashboardIndex from './Index'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/dashboard', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('~/components/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

const defaultCounts = { categories: 3, routines: 5, materials: 12, shows: 2, notes: 7 }

describe('DashboardIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les 5 labels de cartes', () => {
    render(<DashboardIndex counts={defaultCounts} />)
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Routines')).toBeInTheDocument()
    expect(screen.getByText('Matériels')).toBeInTheDocument()
    expect(screen.getByText('Spectacles')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('affiche les comptages corrects', () => {
    render(<DashboardIndex counts={defaultCounts} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it("appelle router.visit('/categories') au clic sur la carte Catégories", async () => {
    const { router } = await import('@inertiajs/react')
    render(<DashboardIndex counts={defaultCounts} />)
    await userEvent.click(screen.getByTestId('stat-card-categories'))
    expect(router.visit).toHaveBeenCalledWith('/categories')
  })

  it("appelle router.visit('/materials') au clic sur la carte Matériels", async () => {
    const { router } = await import('@inertiajs/react')
    render(<DashboardIndex counts={defaultCounts} />)
    await userEvent.click(screen.getByTestId('stat-card-materials'))
    expect(router.visit).toHaveBeenCalledWith('/materials')
  })

  it('affiche 0 pour tous les comptages quand counts sont tous à 0', () => {
    const zeroCounts = { categories: 0, routines: 0, materials: 0, shows: 0, notes: 0 }
    render(<DashboardIndex counts={zeroCounts} />)
    expect(screen.getByTestId('stat-card-categories')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-card-routines')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-card-materials')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-card-shows')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-card-notes')).toHaveTextContent('0')
  })
})
