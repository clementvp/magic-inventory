import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom de la routine est requis',
})

export const updateRoutineValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    categoryIds: vine.array(vine.number()).optional(),
    content: vine.string().trim().maxLength(50000).optional().nullable(),
  })
)
updateRoutineValidator.messagesProvider = frenchMessages
