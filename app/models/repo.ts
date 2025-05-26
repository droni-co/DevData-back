import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import * as crypto from 'node:crypto'

export default class Repo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare repoId: crypto.UUID

  @column()
  declare orgId: string

  @column()
  declare projectId: crypto.UUID

  @column()
  declare projectName: string

  @column()
  declare name: string

  @column()
  declare url: string

  @column()
  declare size: number

  @column()
  declare defaultBranch: string

  @column()
  declare isApi: boolean

  @column()
  declare isExp: boolean

  @column()
  declare package: any

  @column()
  declare pipeline: string

  @column()
  declare appservice: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
