import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom du matériel est requis',
})

export const createMaterialValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    typeId: vine.number().optional().nullable(),
    storageLocationId: vine.number().optional().nullable(),
    author: vine.string().trim().maxLength(255).optional().nullable(),
    categoryIds: vine.array(vine.number()).optional(),
  })
)
createMaterialValidator.messagesProvider = frenchMessages
