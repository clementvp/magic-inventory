import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { FieldContext } from '@vinejs/vine'

/**
 * Messages d'erreur en français pour le validator profil
 */
const frenchMessages = new SimpleMessagesProvider({
  // Messages génériques
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'email': 'Veuillez saisir une adresse email valide',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractères',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'database.unique': 'Cet email est déjà utilisé',

  // Messages spécifiques par champ
  'fullName.required': 'Veuillez saisir votre nom complet',
  'fullName.minLength': 'Le nom doit contenir au moins {{ min }} caractères',
  'fullName.maxLength': 'Le nom ne peut pas dépasser {{ max }} caractères',
  'email.required': 'Veuillez saisir votre email',
  'email.email': 'Email invalide',
  'email.database.unique': 'Cet email est déjà utilisé',
})

/**
 * Validator pour la mise à jour du profil utilisateur
 * Note: userId doit être passé via meta pour l'unicité email (exclude current user)
 */
export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .unique(async (db, value, field: FieldContext) => {
        const userId = field.meta.userId as number
        const user = await db.from('users').where('email', value).whereNot('id', userId).first()
        return !user
      }),
  })
)

updateProfileValidator.messagesProvider = frenchMessages
