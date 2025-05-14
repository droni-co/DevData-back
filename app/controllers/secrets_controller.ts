import type { HttpContext } from '@adonisjs/core/http'
import { DefaultAzureCredential } from '@azure/identity'
import { SecretClient } from '@azure/keyvault-secrets'

import Secret from '#models/secret'

export default class SecretsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    const secrets = await Secret.query().orderBy('name', 'asc')
    return secrets
  }

  /**
   * Import all resources
   */
  async import({}: HttpContext) {
    const credential = new DefaultAzureCredential()

    // Build the URL to reach your key vault
    /*
      KVLTDSLAB001
      KVLTDSPORTALPVPSSS001
      KVLTDSPORTALPVPSSS002
      KVLTDSPGP001
      KVLTDSPGDAPSSS001
    */
    const vaultName = 'KVLTDSPGDAPSSS001'
    const url = `https://${vaultName}.vault.azure.net`
    const client = new SecretClient(url, credential)

    const secrets = await client.listPropertiesOfSecrets()
    const allSecrets = []
    for await (const secretProperties of secrets) {
      Secret.firstOrCreate(
        {
          keyvault: vaultName,
          name: secretProperties.name.toUpperCase(),
        },
        {
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
  async importDetails({ params }: HttpContext) {
    const { id } = params
    const secret = await Secret.findOrFail(id)
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
