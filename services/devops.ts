import * as azdev from 'azure-devops-node-api'
import Org from '#models/org'
export class AzureApiService {
  static async connection(org: Org) {
    const token = String(org.azurePersonalAccessToken)
    const orgUrl = String(org.azureOrgUrl)

    const authHandler = azdev.getPersonalAccessTokenHandler(token)
    const connection = new azdev.WebApi(orgUrl, authHandler)

    return connection
  }
}
