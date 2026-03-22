import Routine from '#models/routine'
import Category from '#models/category'
import { createRoutineValidator } from '#validators/routines/create_routine_validator'
import { updateRoutineValidator } from '#validators/routines/update_routine_validator'
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

  async edit({ params, auth, inertia }: HttpContext) {
    const routine = await Routine.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('categories')
      .firstOrFail()

    const categories = await Category.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    return inertia.render('Routines/Edit', {
      routine: {
        id: routine.id,
        name: routine.name,
        content: routine.content,
        categoryIds: routine.categories.map((c) => c.id),
      },
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async update({ params, request, auth, session, response }: HttpContext) {
    const routine = await Routine.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(updateRoutineValidator)

    try {
      if (data.categoryIds && data.categoryIds.length > 0) {
        const ownedCategories = await Category.query()
          .whereIn('id', data.categoryIds)
          .where('user_id', auth.user!.id)
        if (ownedCategories.length !== data.categoryIds.length) {
          session.flash('error', 'Catégorie(s) invalide(s)')
          return response.redirect().back()
        }
      }

      routine.name = data.name
      routine.content = data.content || null
      await routine.save()

      await routine.related('categories').sync(data.categoryIds ?? [])

      session.flash('success', 'Routine enregistrée avec succès')
      return response.redirect().toPath(`/routines/${routine.id}`)
    } catch (error) {
      logger.error('Failed to update routine', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
      return response.redirect().back()
    }
  }
}
