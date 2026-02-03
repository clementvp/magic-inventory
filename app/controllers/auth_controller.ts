import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

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
  async register({ request, auth, response }: HttpContext) {
    const { email, password, fullName } = request.only(['email', 'password', 'fullName'])

    const user = await User.create({
      email,
      password,
      fullName,
    })

    await auth.use('web').login(user)

    return response.redirect('/')
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
  async login({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    await auth.use('web').attempt(email, password)

    return response.redirect('/')
  }

  /**
   * Déconnexion
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.redirect('/login')
  }
}
