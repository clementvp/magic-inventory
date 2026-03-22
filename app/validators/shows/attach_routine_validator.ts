import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'array.minLength': 'Sélectionnez au moins une routine',
})

export const attachRoutineValidator = vine.compile(
  vine.object({
    routineIds: vine.array(vine.number()).minLength(1),
  })
)
attachRoutineValidator.messagesProvider = frenchMessages
