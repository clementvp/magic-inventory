import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'number': 'Ce champ doit être un nombre',
  'showId.required': 'Veuillez sélectionner un spectacle',
  'date.required': 'La date est requise',
  'date.regex': 'Format de date invalide (attendu : YYYY-MM-DD)',
})

export const createShowEventValidator = vine.compile(
  vine.object({
    showId: vine.number().positive(),
    date: vine.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: vine.string().trim().nullable().optional(),
    venue: vine.string().trim().maxLength(255).nullable().optional(),
    contact: vine.string().trim().maxLength(255).nullable().optional(),
    notes: vine.string().trim().nullable().optional(),
  })
)
createShowEventValidator.messagesProvider = frenchMessages
