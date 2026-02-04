import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  /**
   * Affiche le tableau de bord de l'utilisateur connecté
   */
  async index({ inertia }: HttpContext) {
    return inertia.render('Dashboard/Index')
  }
}
