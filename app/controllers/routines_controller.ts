import Routine from '#models/routine'
import Category from '#models/category'
import { createRoutineValidator } from '#validators/routines/create_routine_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class RoutinesController {
  async create({ auth, inertia }: HttpContext) {
    const categories = await Category.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    return inertia.render('Routines/Create', {
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async store({ auth, request, session, response }: HttpContext) {
    const data = await request.validateUsing(createRoutineValidator)

    try {
      const routine = await Routine.create({
        userId: auth.user!.id,
        name: data.name,
        content: null,
      })

      if (data.categoryIds && data.categoryIds.length > 0) {
        await routine.related('categories').attach(data.categoryIds)
      }

      session.flash('success', 'Routine créée avec succès')
      return response.redirect().toPath(`/routines/${routine.id}/edit`)
    } catch (error) {
      logger.error('Failed to create routine', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la création de la routine')
      return response.redirect().back()
    }
  }
}
