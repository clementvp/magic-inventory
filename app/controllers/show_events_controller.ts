import { DateTime } from 'luxon'
import Show from '#models/show'
import ShowEvent from '#models/show_event'
import { createShowEventValidator } from '#validators/show_events/create_show_event_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEventsController {
  async index({ auth, inertia, request }: HttpContext) {
    const now = new Date()
    const rawMonth = Number(request.input('month', now.getMonth() + 1))
    const rawYear = Number(request.input('year', now.getFullYear()))
    const month = Math.min(12, Math.max(1, rawMonth))
    const year = Math.min(2100, Math.max(2000, rawYear))

    const events = await ShowEvent.query()
      .where('user_id', auth.user!.id)
      .whereRaw('EXTRACT(MONTH FROM date) = ?', [month])
      .whereRaw('EXTRACT(YEAR FROM date) = ?', [year])
      .preload('show')
      .orderBy('date', 'asc')
      .orderBy('start_time', 'asc')

    const shows = await Show.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    return inertia.render('Calendar/Index', {
      events: events.map((e) => ({
        id: e.id,
        date: e.date.toFormat('yyyy-MM-dd'),
        startTime: e.startTime,
        venue: e.venue,
        contact: e.contact,
        notes: e.notes,
        show: { id: e.show.id, name: e.show.name },
      })),
      shows: shows.map((s) => ({ id: s.id, name: s.name })),
      currentMonth: month,
      currentYear: year,
    })
  }

  async store({ auth, request, session, response }: HttpContext) {
    const data = await request.validateUsing(createShowEventValidator)

    const show = await Show.query()
      .where('id', data.showId)
      .where('user_id', auth.user!.id)
      .first()

    if (!show) {
      session.flash('error', 'Spectacle invalide')
      return response.redirect().back()
    }

    try {
      await ShowEvent.create({
        userId: auth.user!.id,
        showId: data.showId,
        date: DateTime.fromISO(data.date),
        startTime: data.startTime || null,
        venue: data.venue || null,
        contact: data.contact || null,
        notes: data.notes || null,
      })

      const month = Number(request.input('month', now.getMonth() + 1))
      const year = Number(request.input('year', now.getFullYear()))
      session.flash('success', 'Représentation ajoutée au calendrier')
      return response.redirect().toPath(`/calendar?month=${month}&year=${year}`)
    } catch (error) {
      logger.error('Failed to create show event', { error, data })
      session.flash('error', "Une erreur est survenue lors de l'ajout")
      return response.redirect().back()
    }
  }

  async destroy({ params, auth, session, response }: HttpContext) {
    try {
      const event = await ShowEvent.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      await event.delete()

      const now = new Date()
      const month = Number(request.input('month', now.getMonth() + 1))
      const year = Number(request.input('year', now.getFullYear()))
      session.flash('success', 'Représentation supprimée')
      return response.redirect().toPath(`/calendar?month=${month}&year=${year}`)
    } catch (error) {
      if ((error as any).status === 404) {
        return response.redirect().back()
      }
      logger.error('Failed to delete show event', { error })
      session.flash('error', 'Une erreur est survenue lors de la suppression')
      return response.redirect().back()
    }
  }
}
