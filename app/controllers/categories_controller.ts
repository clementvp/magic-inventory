import Category from '#models/category'
import { createCategoryValidator } from '#validators/categories/create_category_validator'
import { updateCategoryValidator } from '#validators/categories/update_category_validator'
import logger from '@adonisjs/core/services/logger'
import { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  async index({ auth, inertia }: HttpContext) {
    const categories = await Category.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')
    return inertia.render('Categories/Index', { categories })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(createCategoryValidator)

    try {
      await Category.create({
        userId: auth.user!.id,
        name: data.name,
      })
      session.flash('success', 'Catégorie créée avec succès')
      return response.redirect().toRoute('categories.index')
    } catch (error) {
      logger.error('Category creation failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la création de la catégorie')
      return response.redirect().back()
    }
  }

  async update({ request, auth, response, session, params }: HttpContext) {
    const data = await request.validateUsing(updateCategoryValidator)

    try {
      const category = await Category.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      category.name = data.name
      await category.save()

      session.flash('success', 'Catégorie modifiée avec succès')
      return response.redirect().toRoute('categories.index')
    } catch (error) {
      logger.error('Category update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la modification de la catégorie')
      return response.redirect().back()
    }
  }

  async destroy({ auth, response, session, params }: HttpContext) {
    try {
      const category = await Category.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      await category.delete()
      session.flash('success', 'Catégorie supprimée avec succès')
    } catch (error) {
      if (error.status === 404) {
        // Catégorie inexistante ou n'appartenant pas à l'utilisateur → redirect silencieux
      } else {
        // En Epic 3+, FK violation (catégorie utilisée par des matériels)
        logger.error('Category deletion failed', { error, userId: auth.user?.id })
        session.flash('error', 'Cette catégorie est utilisée et ne peut pas être supprimée')
      }
    }
    return response.redirect().toRoute('categories.index')
  }
}
