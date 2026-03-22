import Show from '#models/show'
import Routine from '#models/routine'
import { createShowValidator } from '#validators/shows/create_show_validator'
import { updateShowValidator } from '#validators/shows/update_show_validator'
import { attachRoutineValidator } from '#validators/shows/attach_routine_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowsController {
  async index({ auth, inertia }: HttpContext) {
    const shows = await Show.query()
      .where('user_id', auth.user!.id)
      .withCount('routines')
      .orderBy('created_at', 'desc')
      .limit(200)

    return inertia.render('Shows/Index', {
      shows: shows.map((s) => ({
        id: s.id,
        name: s.name,
        routinesCount: Number(s.$extras.routinesCount),
        createdAt: s.createdAt.toISO() ?? '',
      })),
    })
  }

  async show({ params, auth, inertia }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('routines', (q) => q.preload('categories'))
      .firstOrFail()

    return inertia.render('Shows/Show', {
      show: {
        id: show.id,
        name: show.name,
        notes: show.notes,
        createdAt: show.createdAt.toISO() ?? '',
        routines: show.routines.map((r) => ({
          id: r.id,
          name: r.name,
          categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
        })),
      },
    })
  }

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
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(updateShowValidator)

    try {
      show.name = data.name
      show.notes = data.notes || null
      await show.save()

      session.flash('success', 'Spectacle modifié avec succès')
      return response.redirect().toPath(`/shows/${show.id}`)
    } catch (error) {
      logger.error('Failed to update show', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
      return response.redirect().back()
    }
  }

  async checklist({ params, auth, inertia }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('routines', (q) =>
        q.preload('materials', (mq) => mq.preload('type').preload('storageLocation'))
      )
      .firstOrFail()

    const materialsMap = new Map<
      number,
      {
        id: number
        name: string
        type: { id: number; name: string } | null
        storageLocation: { id: number; name: string } | null
      }
    >()

    for (const routine of show.routines) {
      for (const material of routine.materials) {
        if (!materialsMap.has(material.id)) {
          materialsMap.set(material.id, {
            id: material.id,
            name: material.name,
            type: material.type ? { id: material.type.id, name: material.type.name } : null,
            storageLocation: material.storageLocation
              ? { id: material.storageLocation.id, name: material.storageLocation.name }
              : null,
          })
        }
      }
    }

    return inertia.render('Shows/Checklist', {
      show: { id: show.id, name: show.name },
      materials: [...materialsMap.values()],
      hasRoutines: show.routines.length > 0,
    })
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
