import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sonars'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('org_id').notNullable().references('id').inTable('orgs').onDelete('CASCADE')
      table.string('key').unique().notNullable()
      table.string('rule').notNullable()
      table.string('severity').notNullable()
      table.string('component').notNullable()
      table.string('project').notNullable()
      table.integer('line').nullable()
      table.string('hash').notNullable()
      table.json('text_range').nullable()
      table.json('flows').nullable()
      table.string('resolution').nullable()
      table.string('status').notNullable()
      table.text('message').notNullable()
      table.string('effort').nullable()
      table.string('debt').nullable()
      table.string('author').nullable()
      table.json('tags').nullable()
      table.timestamp('creation_date').notNullable()
      table.timestamp('update_date').notNullable()
      table.timestamp('close_date').nullable()
      table.string('type').notNullable()
      table.string('organization').notNullable()
      table.string('clean_code_attribute').nullable()
      table.string('clean_code_attribute_category').nullable()
      table.json('impacts').nullable()
      table.string('issue_status').notNullable()
      table.string('project_name').notNullable()
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
