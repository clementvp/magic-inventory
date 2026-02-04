import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  /**
   * Affiche la page d'accueil publique (landing page)
   * ou redirige vers le dashboard si l'utilisateur est connecté
   */
  async index({ auth, inertia, response }: HttpContext) {
    // Vérifier si l'utilisateur est connecté
    if (await auth.check()) {
      return response.redirect().toRoute('dashboard')
    }

    // Afficher la landing page publique
    return inertia.render('Home/Index')
  }
}
