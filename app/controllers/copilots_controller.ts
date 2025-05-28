import type { HttpContext } from '@adonisjs/core/http'
import Org from '#models/org'
import axios from 'axios'
import CopilotDay from '#models/copilot_day'
import { DateTime } from 'luxon'
import { CopilotDayResponse } from '../../types/copilot.js'

export default class CopilotsController {
  /**
   * Paginated listing of CopilotDay
   */
  async index({ auth, request, response }: HttpContext) {
    // Obtener organización del usuario autenticado
    const org = await Org.findOrFail(auth.user!.orgId)
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 10)

    const paginated = await CopilotDay.query()
      .where('org_id', org.id)
      .orderBy('date', 'desc')
      .paginate(page, perPage)

    return response.json(paginated)
  }

  /**
   * Import all resources
   */
  async import({ auth, response }: HttpContext) {
    // Obtener organización del usuario autenticado
    const org = await Org.findOrFail(auth.user!.orgId)
    if (auth.user!.role !== 'admin') {
      throw new Error('No tienes permisos para importar métricas de Copilot')
    }
    const copilotToken = org.copilotToken
    const copilotEndpoint = 'https://api.github.com/orgs/credicorp-capital-copilot/copilot/metrics'

    try {
      // Llamada a la API y obtención de datos
      const { data } = await axios.get<CopilotDayResponse[]>(copilotEndpoint, {
        headers: {
          Authorization: `Bearer ${copilotToken}`,
          Accept: 'application/json',
        },
      })

      // Guardar los datos en la base de datos
      for (const dayData of data) {
        // verificar si el registro existe

        const existingRecord = await CopilotDay.query()
          .where('orgId', org.id)
          .where('date', dayData.date)
          .first()
        // Si ya existe, no lo guardamos de nuevo
        if (existingRecord) {
          continue
        }
        const copilotDay = new CopilotDay()
        copilotDay.orgId = org.id
        copilotDay.date = DateTime.fromISO(dayData.date)
        copilotDay.totalActiveUsers = dayData.total_active_users
        copilotDay.totalEngagedUsers = dayData.total_engaged_users
        copilotDay.copilotIdeChat = dayData.copilot_ide_chat
        copilotDay.copilotDotcomChat = dayData.copilot_dotcom_chat
        copilotDay.copilotDotcomPullRequests = dayData.copilot_dotcom_pull_requests
        copilotDay.copilotIdeCodeCompletions = dayData.copilot_ide_code_completions
        await copilotDay.save()
      }
      // Devolver los datos originales tras guardar
      return response.json(data)
    } catch (err: any) {
      const status = err.response?.status || 500
      const details = err.response?.data || err.message
      return response.status(status).json({
        error: 'Error al obtener métricas de Copilot',
        details,
      })
    }
  }
}
