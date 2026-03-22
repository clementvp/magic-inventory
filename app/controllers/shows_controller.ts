import Show from '#models/show'
import Routine from '#models/routine'
import { createShowValidator } from '#validators/shows/create_show_validator'
import { updateShowValidator } from '#validators/shows/update_show_validator'
import { attachRoutineValidator } from '#validators/shows/attach_routine_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowsController {
  async create({ inertia }: HttpContext) {
    return inertia.render('Shows/Create')
  }

  async store({ auth, request, session, response }: HttpContext) {
    const data = await request.validateUsing(createShowValidator)

    try {
      const show = await Show.create({
        userId: auth.user!.id,
        name: data.name,
      })

      session.flash('success', 'Spectacle créé avec succès')
      return response.redirect().toPath(`/shows/${show.id}/edit`)
    } catch (error) {
      logger.error('Failed to create show', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la création du spectacle')
      return response.redirect().back()
    }
  }

  async edit({ params, auth, inertia }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('routines', (q) => q.preload('categories'))
      .firstOrFail()

    const allRoutines = await Routine.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    return inertia.render('Shows/Edit', {
      show: {
        id: show.id,
        name: show.name,
        notes: show.notes,
        routines: show.routines.map((r) => ({
          id: r.id,
          name: r.name,
          categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
        })),
      },
      allRoutines: allRoutines.map((r) => ({ id: r.id, name: r.name })),
    })
  }

  async update({ params, request, auth, session, response }: HttpContext) {
    const data = await request.validateUsing(updateShowValidator)

    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    try {
      show.name = data.name
      show.notes = data.notes?.trim() || null
      await show.save()

      session.flash('success', 'Spectacle enregistré avec succès')
      return response.redirect().toPath(`/shows/${show.id}/edit`)
    } catch (error) {
      logger.error('Failed to update show', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
      return response.redirect().back()
    }
  }

  async attachRoutine({ params, request, auth, session, response }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(attachRoutineValidator)

    const uniqueRoutineIds = [...new Set(data.routineIds)]

    // Vérification ownership IDOR
    const ownedRoutines = await Routine.query()
      .whereIn('id', uniqueRoutineIds)
      .where('user_id', auth.user!.id)
    if (ownedRoutines.length !== uniqueRoutineIds.length) {
      session.flash('error', 'Routine invalide')
      return response.redirect().back()
    }

    try {
      await show.related('routines').sync(uniqueRoutineIds, false)
      session.flash('success', 'Routines ajoutées au spectacle')
      return response.redirect().toPath(`/shows/${show.id}/edit`)
    } catch (error) {
      logger.error('Failed to attach routine to show', { error })
      session.flash('error', "Une erreur est survenue lors de l'ajout des routines")
      return response.redirect().back()
    }
  }

  async detachRoutine({ params, auth, session, response }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    // Vérifier que la routine appartient à l'utilisateur
    await Routine.query()
      .where('id', params.routineId)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    try {
      await show.related('routines').detach([parseInt(params.routineId, 10)])
      session.flash('success', 'Routine retirée du spectacle')
      return response.redirect().toPath(`/shows/${show.id}/edit`)
    } catch (error) {
      logger.error('Failed to detach routine from show', { error })
      session.flash('error', 'Une erreur est survenue lors du retrait de la routine')
      return response.redirect().back()
    }
  }
}
