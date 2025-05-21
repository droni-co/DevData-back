import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Pullrequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pullRequestId: number

  @column()
  declare repositoryId: string

  @column()
  declare repositoryName: string

  @column()
  declare projectId: string

  @column()
  declare projectName: string

  @column()
  declare creatorId: string

  @column()
  declare creatorName: string

  @column()
  declare status: number

  @column.dateTime({ autoCreate: true })
  declare creationDate: DateTime

  @column.dateTime()
  declare closedDate: DateTime | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare sourceRefName: string

  @column()
  declare targetRefName: string

  @column()
  declare mergeStatus: number

  @column.dateTime()
  declare completionQueueTime: DateTime | null
}
