import Note from '#models/note'
import { createNoteValidator } from '#validators/notes/create_note_validator'
import { updateNoteValidator } from '#validators/notes/update_note_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotesController {
  async index({ auth, inertia }: HttpContext) {
    const notes = await Note.query()
      .where('user_id', auth.user!.id)
      .orderBy('updated_at', 'desc')
      .limit(200)

    return inertia.render('Notes/Index', {
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: n.createdAt.toISO() ?? '',
        updatedAt: n.updatedAt.toISO() ?? '',
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('Notes/Create')
  }

  async store({ auth, request, session, response }: HttpContext) {
    const data = await request.validateUsing(createNoteValidator)

    try {
      const note = await Note.create({
        userId: auth.user!.id,
        title: data.title || null,
        content: data.content || null,
      })

      session.flash('success', 'Note créée avec succès')
      return response.redirect().toPath(`/notes/${note.id}/edit`)
    } catch (error) {
      logger.error('Failed to create note', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la création de la note')
      return response.redirect().back()
    }
  }

  async show({ params, auth, inertia }: HttpContext) {
    const note = await Note.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    return inertia.render('Notes/Show', {
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt.toISO() ?? '',
        updatedAt: note.updatedAt.toISO() ?? '',
      },
    })
  }

  async edit({ params, auth, inertia }: HttpContext) {
    const note = await Note.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    return inertia.render('Notes/Edit', {
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
      },
    })
  }

  async update({ params, request, auth, session, response }: HttpContext) {
    const note = await Note.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(updateNoteValidator)

    try {
      note.title = data.title || null
      note.content = data.content || null
      await note.save()

      session.flash('success', 'Note sauvegardée')
      return response.redirect().toPath(`/notes/${note.id}/edit`)
    } catch (error) {
      logger.error('Failed to update note', { error })
      session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
      return response.redirect().back()
    }
  }

  async destroy({ params, auth, session, response }: HttpContext) {
    try {
      const note = await Note.query()
        .where('user_id', auth.user!.id)
        .where('id', params.id)
        .firstOrFail()

      await note.delete()

      session.flash('success', 'Note supprimée avec succès')
      return response.redirect().toRoute('notes.index')
    } catch (error) {
      if (error.status === 404) {
        return response.redirect().toRoute('notes.index')
      }
      logger.error('Note deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la suppression de la note')
      return response.redirect().toRoute('notes.index')
    }
  }
}
