import vine from '@vinejs/vine'

export const createNoteValidator = vine.compile(
  vine.object({
    title: vine.string().trim().optional(),
    content: vine.string().trim().optional(),
  })
)
