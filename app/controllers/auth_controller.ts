import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth_validator'
import logger from '@adonisjs/core/services/logger'

export default class AuthController {
  /**
   * Afficher le formulaire d'inscription
   */
  async showRegister({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  /**
   * Traiter l'inscription
   */
  async register({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    try {
      const user = await User.create({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      })

      await auth.use('web').login(user)

      session.flash('success', 'Compte créé avec succès ! Bienvenue sur Magic Inventory.')
      return response.redirect('/')
    } catch (error) {
      logger.error('User registration failed', { error, email: data.email })
      session.flash('error', 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.')
      return response.redirect().back()
    }
  }

  /**
   * Afficher le formulaire de connexion
   */
  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  /**
   * Traiter la connexion
   */
  async login({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(data.email, data.password)
      await auth.use('web').login(user)

      session.flash('success', 'Connexion réussie ! Bon retour sur Magic Inventory.')
      return response.redirect('/')
    } catch (error) {
      logger.error('User login failed', { error, email: data.email })
      session.flash('error', 'Email ou mot de passe incorrect.')
      return response.redirect().back()
    }
  }

  /**
   * Déconnexion
   */
  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()

    session.flash('info', 'Déconnexion réussie. À bientôt !')
    return response.redirect('/login')
  }
}
