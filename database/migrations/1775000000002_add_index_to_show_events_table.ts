import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'show_events'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.index(['user_id', 'date'], 'show_events_user_id_date_index')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropIndex(['user_id', 'date'], 'show_events_user_id_date_index')
    })
  }
}
