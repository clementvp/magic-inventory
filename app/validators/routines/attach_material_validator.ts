import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'minLength': 'Sélectionnez au moins un matériel',
})

export const attachMaterialValidator = vine.compile(
  vine.object({
    materialIds: vine.array(vine.number()).minLength(1),
  })
)
attachMaterialValidator.messagesProvider = frenchMessages
