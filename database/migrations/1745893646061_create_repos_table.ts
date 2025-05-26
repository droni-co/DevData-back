import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'repos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('org_id').notNullable().references('id').inTable('orgs').onDelete('CASCADE')
      table.uuid('project_id').notNullable()
      table.string('project_name').notNullable()
      table.string('name').notNullable()
      table.string('url').nullable()
      table.integer('size').nullable()
      table.string('default_branch').nullable()
      table.boolean('is_api').defaultTo(false)
      table.boolean('is_exp').defaultTo(false)
      table.json('package').nullable()
      table.text('pipeline').nullable()
      table.string('appservice').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
