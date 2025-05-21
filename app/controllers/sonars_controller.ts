import type { HttpContext } from '@adonisjs/core/http'
import Sonar from '#models/sonar'
import { DateTime } from 'luxon'

export default class SonarsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const q = request.input('q', '')
    const rule = request.input('rule', '')
    const project = request.input('project', '')
    const severity = request.input('severity', '')
    const status = request.input('status', '')
    const type = request.input('type', '')

    const query = Sonar.query()
    if (q) {
      query.where((sub) => {
        sub
          .whereILike('message', `%${q}%`)
          .orWhereILike('component', `%${q}%`)
          .orWhereILike('rule', `%${q}%`)
          .orWhereILike('project', `%${q}%`)
          .orWhereILike('author', `%${q}%`)
      })
    }
    if (rule) query.where('rule', rule)
    if (project) query.where('project', project)
    if (severity) query.where('severity', severity)
    if (status) query.where('status', status)
    if (type) query.where('type', type)

    const results = await query.orderBy('creation_date', 'desc').paginate(page, perPage)
    return results
  }

  async import({}: HttpContext) {
    const SONAR_TOKEN = process.env.SONAR_TOKEN || ''
    const ORGANIZATION = process.env.SONAR_ORG || 'YOUR_SONAR_ORGANIZATION'
    const url = `https://sonarcloud.io/api/issues/search?organization=${ORGANIZATION}&ps=500`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SONAR_TOKEN}`,
        Accept: 'application/json',
      },
    })
    const data = (await response.json()) as any
    if (!data.issues || !Array.isArray(data.issues)) {
      return { message: 'No issues found in response' }
    }
    const results = []
    for (const issue of data.issues) {
      const hashValue = issue.hash ? issue.hash : 'no-hash'
      const sonar = await Sonar.updateOrCreate(
        { key: issue.key },
        {
          key: issue.key,
          rule: issue.rule,
          severity: issue.severity,
          component: issue.component,
          project: issue.project,
          line: issue.line ?? null,
          hash: hashValue,
          textRange: issue.textRange ? JSON.stringify(issue.textRange) : null,
          flows: issue.flows ? JSON.stringify(issue.flows) : null,
          resolution: issue.resolution ?? null,
          status: issue.status,
          message: issue.message,
          effort: issue.effort ?? null,
          debt: issue.debt ?? null,
          author: issue.author ?? null,
          tags: issue.tags ? JSON.stringify(issue.tags) : null,
          creationDate: issue.creationDate ? DateTime.fromISO(issue.creationDate) : DateTime.now(),
          updateDate: issue.updateDate ? DateTime.fromISO(issue.updateDate) : DateTime.now(),
          closeDate: issue.closeDate ? DateTime.fromISO(issue.closeDate) : null,
          type: issue.type,
          organization: issue.organization,
          cleanCodeAttribute: issue.cleanCodeAttribute ?? null,
          cleanCodeAttributeCategory: issue.cleanCodeAttributeCategory ?? null,
          impacts: issue.impacts ? JSON.stringify(issue.impacts) : null,
          issueStatus: issue.issueStatus ?? '',
          projectName: issue.projectName ?? '',
        }
      )
      results.push(sonar)
    }
    return { imported: results.length }
  }

  async filters({}: HttpContext) {
    const rules = await Sonar.query().distinct('rule').select('rule')
    const projects = await Sonar.query().distinct('project').select('project')
    const severities = await Sonar.query().distinct('severity').select('severity')
    const statuses = await Sonar.query().distinct('status').select('status')
    const types = await Sonar.query().distinct('type').select('type')
    return {
      rule: rules.map((row) => row.rule).filter((v) => !!v),
      project: projects.map((row) => row.project).filter((v) => !!v),
      severity: severities.map((row) => row.severity).filter((v) => !!v),
      status: statuses.map((row) => row.status).filter((v) => !!v),
      type: types.map((row) => row.type).filter((v) => !!v),
    }
  }
}
