import vine from '@vinejs/vine'

/**
 * Validator pour l'inscription d'un nouvel utilisateur
 */
export const registerValidator = vine.compile(
  vine.object({
    fullName: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(255),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    passwordConfirmation: vine
      .string()
      .confirmed()
  })
)

/**
 * Validator pour la connexion
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail(),
    password: vine
      .string()
      .minLength(1)
  })
)
