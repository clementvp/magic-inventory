import { faker } from '@faker-js/faker/locale/fr'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Category from '#models/category'

const DEFAULT_CATEGORIES = ['Cartomagie', 'Mentalisme', 'Pièces', 'Close-up', 'Scène', 'Enfants']

async function createUserWithDefaults(
  trx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  data: { fullName: string; email: string; password: string }
) {
  const user = await User.create(data, { client: trx })
  await Category.createMany(
    DEFAULT_CATEGORIES.map((name) => ({ userId: user.id, name })),
    { client: trx }
  )
  return user
}

export default class MainSeeder extends BaseSeeder {
  async run() {
    // Utilisateur de développement avec credentials connus
    const devUser = await db.transaction((trx) =>
      createUserWithDefaults(trx, {
        fullName: 'Dev User',
        email: 'dev@magic-inventory.com',
        password: 'password',
      })
    )
    console.log(`✅ Dev user : ${devUser.email} / password`)

    // Utilisateurs faker (pour tester l'isolation multi-tenant)
    for (let i = 0; i < 3; i++) {
      await db.transaction((trx) =>
        createUserWithDefaults(trx, {
          fullName: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password: 'password',
        })
      )
    }
    console.log('✅ 3 utilisateurs faker créés')
  }
}
