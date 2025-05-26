import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('org_id').notNullable().references('id').inTable('orgs').onDelete('CASCADE')
      table.string('commit_id', 40).notNullable()
      table.unique(['commit_id', 'org_id'])
      table.uuid('repository_id').notNullable()
      table.string('repository_name', 500).notNullable()
      table.uuid('project_id').notNullable()
      table.string('project_name', 500).notNullable()
      table.string('author_name', 200).notNullable()
      table.string('author_email', 200).notNullable()
      table.dateTime('author_date').notNullable()
      table.string('committer_name', 200).notNullable()
      table.string('committer_email', 200).notNullable()
      table.dateTime('committer_date').notNullable()
      table.text('comment').notNullable()
      table.boolean('comment_truncated').notNullable()
      table.integer('change_add').notNullable()
      table.integer('change_edit').notNullable()
      table.integer('change_delete').notNullable()
      table.unique(['commit_id', 'repository_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
