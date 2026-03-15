import { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile_validator'
import logger from '@adonisjs/core/services/logger'

export default class ProfileController {
  /**
   * Afficher le formulaire de modification du profil
   */
  async edit({ inertia, auth }: HttpContext) {
    const user = auth.user!
    return inertia.render('profile/edit', { user })
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async update({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator, {
      meta: { userId: auth.user!.id },
    })

    try {
      const user = auth.user!
      user.email = data.email
      user.fullName = data.fullName
      await user.save()

      session.flash('success', 'Profil mis à jour avec succès')
      return response.redirect('/profile')
    } catch (error) {
      logger.error('Profile update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la mise à jour du profil')
      return response.redirect().back()
    }
  }

  /**
   * Exporter les données utilisateur (RGPD - droit à la portabilité)
   */
  async export({ auth, response, session }: HttpContext) {
    try {
      const user = auth.user!

      const now = new Date()
      const exportData = {
        exportedAt: now.toISOString(),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        // Tables futures (Epic 2+) — seule la table users existe en Epic 1
        materials: [],
        storageLocations: [],
        categories: [],
        materialTypes: [],
        routines: [],
        shows: [],
        notes: [],
      }

      const json = JSON.stringify(exportData, null, 2)
      const date = now.toISOString().split('T')[0]
      const fileName = `magic-inventory-export-${user.id}-${date}.json`

      response.header('Content-Type', 'application/json; charset=utf-8')
      response.header('Content-Disposition', `attachment; filename="${fileName}"`)
      return response.send(json)
    } catch (error) {
      logger.error('Data export failed', { error, userId: auth.user?.id })
      session.flash('error', "Une erreur est survenue lors de l'export de vos données")
      return response.redirect().back()
    }
  }

  /**
   * Supprimer le compte utilisateur (RGPD - droit à l'effacement)
   */
  async destroy({ auth, response, session }: HttpContext) {
    try {
      const user = auth.user!
      await auth.use('web').logout()
      await user.delete()

      session.flash('info', 'Votre compte a été supprimé')
      return response.redirect('/login')
    } catch (error) {
      logger.error('Account deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la suppression de votre compte')
      return response.redirect().back()
    }
  }
}
