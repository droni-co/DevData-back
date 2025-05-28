import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Org from '#models/org'
import string from '@adonisjs/core/helpers/string'
import { randomUUID } from 'node:crypto'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    const org = new Org()
    org.id = process.env.ORG_ID ?? randomUUID()
    org.name = 'Default Organization'
    org.secret = process.env.ORG_SECRET ?? string.generateRandom(32)
    org.azureOrgUrl = process.env.AZURE_ORG_URL ?? 'https://dev.azure.com/default-org'
    org.azurePersonalAccessToken = process.env.AZURE_PERSONAL_ACCESS_TOKEN ?? 'your-default-token'
    org.azureWorkspaceId = process.env.AZURE_WORKSPACE_ID ?? 'default-workspace-id'
    org.sonarToken = process.env.SONAR_TOKEN ?? 'your-default-sonar-token'
    org.sonarOrg = process.env.SONAR_ORG ?? 'default-sonar-org'
    org.copilotToken = process.env.COPILOT_TOKEN ?? 'your-default-copilot-token'

    await org.save()
  }
}
