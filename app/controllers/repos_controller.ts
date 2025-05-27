import type { HttpContext } from '@adonisjs/core/http'
import Repo from '#models/repo'
import { AzureApiService } from '../../services/devops.js'
import { UUID } from 'node:crypto'
import Org from '#models/org'

export default class ReposController {
  /**
   * Display a list of resource
   */
  async index({ request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const q = request.input('q', '')
    const projectId = request.input('projectId', '')
    const qPackage = request.input('qPackage', '')
    const isApi = request.input('isApi', '')
    const isExp = request.input('isExp', '')
    const query = Repo.query().where('orgId', auth.user!.orgId)
    if (projectId) {
      query.where('project_id', projectId)
    }
    if (isApi === 'true') {
      query.where('is_api', true)
    } else if (isApi === 'false') {
      query.where('is_api', false)
    }
    if (isExp === 'true') {
      query.where('is_exp', true)
    } else if (isExp === 'false') {
      query.where('is_exp', false)
    }
    if (q) {
      query.where((subquery) =>
        subquery
          .whereILike('name', `%${q}%`)
          .orWhereILike('project_name', `%${q}%`)
          .orWhereILike('appservice', `%${q}%`)
          .orWhereILike('pipeline', `%${q}%`)
      )
    }
    if (qPackage) {
      query.whereILike('package', `%${qPackage}%`)
    }
    const repos = await query.paginate(page, perPage)
    return repos
  }

  /**
   * Import all resources
   */
  async import({ auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const azureApiService = await AzureApiService.connection(org)
    const gitApi = await azureApiService.getGitApi()
    const repositories = await gitApi.getRepositories()

    repositories.forEach(async (repo) => {
      Repo.firstOrCreate(
        {
          repoId: repo.id as UUID,
          orgId: auth.user!.orgId,
        },
        {
          repoId: repo.id as UUID,
          projectId: repo.project?.id as UUID,
          projectName: repo.project?.name,
          name: repo.name,
          url: repo.webUrl,
          size: Number(repo.size),
          defaultBranch: repo.defaultBranch,
          isApi: String(repo.name).toLowerCase().includes('api'),
          isExp:
            String(repo.name).toLowerCase().includes('-expe') ||
            String(repo.name).toLowerCase().includes('-exp-'),
        }
      )
    })

    return repositories
  }

  /**
   * Import detail resource
   */
  async importDetails({ params, auth }: HttpContext) {
    const { id } = params
    const org = await Org.findOrFail(auth.user!.orgId)
    const repo = await Repo.query().where('repoId', id).where('orgId', org.id).firstOrFail()
    const azureApiService = await AzureApiService.connection(org)
    const gitApi = await azureApiService.getGitApi()
    const filePackage = await gitApi.getItemContent(repo.repoId, 'package.json')
    const filePipeline = await gitApi.getItemContent(repo.repoId, 'azure-pipelines.yml')

    let contentPackage = ''
    for await (const chunk of filePackage) {
      contentPackage += chunk.toString()
    }
    let contentPipeline = ''
    for await (const chunk of filePipeline) {
      contentPipeline += chunk.toString()
    }
    // si el contentPackage no contiene el string 'could not be found in the repository' no es un contentPackage
    const jsonContent = JSON.parse(contentPackage)
    repo.package = contentPackage.includes('could not be found in the repository')
      ? null
      : JSON.stringify(jsonContent)
    // si pipeline contiene el string 'innerException' no es un pipeline
    repo.pipeline = contentPipeline.includes('innerException') ? '' : contentPipeline

    const appServices = contentPipeline.match(/appServiceName:\s*(\S+)/)
    repo.appservice = appServices ? appServices[1].replaceAll("'", '') : ''
    await repo.save()
    return repo
  }

  /**
   * Get unique project names
   */
  async filters({ auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const projects = await Repo.query()
      .where('orgId', org.id)
      .distinct('projectName', 'projectId')
      .select('projectName', 'projectId')
      .orderBy('projectName', 'asc')
    return {
      projects,
    }
  }
}
