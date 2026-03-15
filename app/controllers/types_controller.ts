import Type from '#models/type'
import { createTypeValidator } from '#validators/types/create_type_validator'
import { updateTypeValidator } from '#validators/types/update_type_validator'
import logger from '@adonisjs/core/services/logger'
import { HttpContext } from '@adonisjs/core/http'

export default class TypesController {
  async index({ auth, inertia }: HttpContext) {
    const types = await Type.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')
    return inertia.render('Types/Index', { types })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(createTypeValidator)

    try {
      await Type.create({
        userId: auth.user!.id,
        name: data.name,
      })
      session.flash('success', 'Type créé avec succès')
      return response.redirect().toRoute('types.index')
    } catch (error) {
      logger.error('Type creation failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la création du type')
      return response.redirect().back()
    }
  }

  async update({ request, auth, response, session, params }: HttpContext) {
    const data = await request.validateUsing(updateTypeValidator)

    try {
      const type = await Type.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      type.name = data.name
      await type.save()

      session.flash('success', 'Type modifié avec succès')
      return response.redirect().toRoute('types.index')
    } catch (error) {
      logger.error('Type update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la modification du type')
      return response.redirect().back()
    }
  }

  async destroy({ auth, response, session, params }: HttpContext) {
    try {
      const type = await Type.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      await type.delete()
      session.flash('success', 'Type supprimé avec succès')
    } catch (error) {
      if (error.status === 404) {
        // Type inexistant ou n'appartenant pas à l'utilisateur → redirect silencieux
      } else {
        // En Epic 3+, FK violation (type utilisé par des matériels)
        logger.error('Type deletion failed', { error, userId: auth.user?.id })
        session.flash('error', 'Ce type est utilisé et ne peut pas être supprimé')
      }
    }
    return response.redirect().toRoute('types.index')
  }
}
