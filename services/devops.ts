import * as azdev from 'azure-devops-node-api'

export class AzureApiService {
  static async connection() {
    const token = String(process.env.PERSONAL_ACCESS_TOKEN)
    const orgUrl = String(process.env.ORG_URL)

    const authHandler = azdev.getPersonalAccessTokenHandler(token)
    const connection = new azdev.WebApi(orgUrl, authHandler)

    return connection
  }
}
