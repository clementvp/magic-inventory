import vine, { SimpleMessagesProvider } from '@vinejs/vine'

/**
 * Messages d'erreur en français pour les validators
 */
const frenchMessages = new SimpleMessagesProvider({
  // Messages génériques
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'email': 'Veuillez saisir une adresse email valide',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractères',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'confirmed': 'Les mots de passe ne correspondent pas',
  'regex': 'Le format de ce champ est invalide',
  'database.unique': 'Cette adresse email est déjà utilisée',

  // Messages spécifiques par champ
  'fullName.required': 'Veuillez saisir votre nom complet',
  'fullName.minLength': 'Le nom doit contenir au moins {{ min }} caractères',
  'fullName.maxLength': 'Le nom ne peut pas dépasser {{ max }} caractères',
  'email.required': 'Veuillez saisir votre adresse email',
  'email.email': 'Veuillez saisir une adresse email valide',
  'email.database.unique': 'Cette adresse email est déjà utilisée',
  'password.required': 'Veuillez saisir votre mot de passe',
  'password.minLength': 'Le mot de passe doit contenir au moins {{ min }} caractères',
  'password.maxLength': 'Le mot de passe ne peut pas dépasser {{ max }} caractères',
  'password.regex': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
  'passwordConfirmation.required': 'Veuillez confirmer votre mot de passe',
  'passwordConfirmation.confirmed': 'Les mots de passe ne correspondent pas',
})

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

// Appliquer les messages français au validator register
registerValidator.messagesProvider = frenchMessages

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

// Appliquer les messages français au validator login
loginValidator.messagesProvider = frenchMessages
