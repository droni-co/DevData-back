import type { HttpContext } from '@adonisjs/core/http'
import Org from '#models/org'

export default class CopilotsController {
  /**
   * Import all resources
   */
  async import({ params, request, auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    return org
  }
}
