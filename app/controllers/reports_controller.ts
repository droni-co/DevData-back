import type { HttpContext } from '@adonisjs/core/http'
import Sonar from '#models/sonar'
import { DateTime } from 'luxon'

export default class ReportsController {
  /**
   * Reporte: Conteo de issues por tipo (BUG, VULNERABILITY, CODE_SMELL, etc)
   */
  async sonar_issuesByType({}: HttpContext) {
    const result = await Sonar.query().select('type').count('* as total').groupBy('type')
    return result
  }

  /**
   * Reporte: Conteo de issues por severidad (BLOCKER, CRITICAL, MAJOR, MINOR, INFO)
   */
  async sonar_issuesBySeverity({}: HttpContext) {
    const result = await Sonar.query().select('severity').count('* as total').groupBy('severity')
    return result
  }

  /**
   * Reporte: Issues abiertos vs cerrados
   */
  async sonar_openVsClosed({}: HttpContext) {
    const result = await Sonar.query().select('status').count('* as total').groupBy('status')
    return result
  }

  /**
   * Reporte: Issues por proyecto
   */
  async sonar_issuesByProject({}: HttpContext) {
    const result = await Sonar.query().select('project').count('* as total').groupBy('project')
    return result
  }

  /**
   * Reporte: Issues por regla (top 10)
   */
  async sonar_topRules({}: HttpContext) {
    const result = await Sonar.query()
      .select('rule')
      .count('* as total')
      .groupBy('rule')
      .orderBy('total', 'desc')
      .limit(10)
    return result
  }

  /**
   * Reporte: Issues de seguridad (tipo VULNERABILITY o reglas críticas)
   */
  async sonar_securityIssues({}: HttpContext) {
    const result = await Sonar.query()
      .where('type', 'VULNERABILITY')
      .orWhere('severity', 'CRITICAL')
      .orderBy('creation_date', 'desc')
      .limit(100)
    return result
  }

  /**
   * Reporte: Evolución de issues en el tiempo (últimos 6 meses)
   */
  async sonar_issuesOverTime({}: HttpContext) {
    const sixMonthsAgo = DateTime.now().minus({ months: 6 }).toISODate()
    const rows = await Sonar.query()
      .where('creation_date', '>=', sixMonthsAgo)
      .select('creationDate')
      .orderBy('creation_date', 'asc')
    const grouped: Record<string, number> = {}
    for (const row of rows) {
      const date = row.creationDate?.toISODate?.() ?? ''
      if (!date) continue
      grouped[date] = (grouped[date] || 0) + 1
    }
    return Object.entries(grouped).map(([date, total]) => ({ date, total }))
  }
}
