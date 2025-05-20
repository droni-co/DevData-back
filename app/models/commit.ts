import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Commit extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare commitId: string

  @column()
  declare repositoryId: string

  @column()
  declare repositoryName: string

  @column()
  declare projectId: string

  @column()
  declare projectName: string

  @column()
  declare authorName: string

  @column()
  declare authorEmail: string

  @column.dateTime()
  declare authorDate: DateTime

  @column()
  declare committerName: string

  @column()
  declare committerEmail: string

  @column.dateTime()
  declare committerDate: DateTime

  @column()
  declare comment: string

  @column()
  declare commentTruncated: boolean

  @column()
  declare changeAdd: number

  @column()
  declare changeEdit: number

  @column()
  declare changeDelete: number
}
/*
  table.increments('id')
  table.string('commit_id', 40).notNullable()
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
*/
