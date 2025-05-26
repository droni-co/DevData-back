import type { HttpContext } from '@adonisjs/core/http'
import { DefaultAzureCredential } from '@azure/identity'
import { SecretClient } from '@azure/keyvault-secrets'

import Secret from '#models/secret'
import Org from '#models/org'

export default class SecretsController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const secrets = await Secret.query().where('orgId', org.id).orderBy('name', 'asc')
    return secrets
  }

  /**
   * Import all resources
   */
  async import({ params, auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const { vaultName } = params
    if (!vaultName) {
      throw new Error('Vault name is required')
    }
    const credential = new DefaultAzureCredential()
    const url = `https://${vaultName}.vault.azure.net`
    const client = new SecretClient(url, credential)

    const secrets = await client.listPropertiesOfSecrets()
    const allSecrets = []
    for await (const secretProperties of secrets) {
      Secret.firstOrCreate(
        {
          orgId: org.id,
          keyvault: vaultName,
          name: secretProperties.name.toUpperCase(),
        },
        {
          orgId: org.id,
          keyvault: vaultName,
          name: secretProperties.name.toUpperCase(),
          updatedOn: secretProperties.updatedOn ?? new Date(),
        }
      )
      allSecrets.push(secretProperties)
    }
    return allSecrets
  }

  /**
   * Import detail resource
   */
  async importDetails({ params, auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const { id } = params
    const secret = await Secret.query().where('id', id).where('orgId', org.id).firstOrFail()
    const credential = new DefaultAzureCredential()

    // Build the URL to reach your key vault
    const vaultName = secret.keyvault
    const url = `https://${vaultName}.vault.azure.net`
    const client = new SecretClient(url, credential)

    const secretValue = await client.getSecret(secret.name)
    secret.value = String(secretValue.value).length > 250 ? '' : String(secretValue.value)
    await secret.save()

    return secret
  }
}
