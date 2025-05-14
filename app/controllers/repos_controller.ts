import type { HttpContext } from '@adonisjs/core/http'
import Repo from '#models/repo'
import { AzureApiService } from '../../services/devops.js'
import { UUID } from 'node:crypto'

export default class ReposController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    const repos = await Repo.all()
    return repos
  }

  /**
   * Import all resources
   */
  async import({}: HttpContext) {
    const azureApiService = await AzureApiService.connection()
    const gitApi = await azureApiService.getGitApi()
    const repositories = await gitApi.getRepositories()

    repositories.forEach(async (repo) => {
      Repo.firstOrCreate(
        {
          id: repo.id as UUID,
        },
        {
          id: repo.id as UUID,
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
  async importDetails({ params }: HttpContext) {
    const { id } = params
    const repo = await Repo.findOrFail(id)
    const azureApiService = await AzureApiService.connection()
    const gitApi = await azureApiService.getGitApi()
    const filePackage = await gitApi.getItemContent(id, 'package.json')
    const filePipeline = await gitApi.getItemContent(id, 'azure-pipelines.yml')

    let contentPackage = ''
    for await (const chunk of filePackage) {
      contentPackage += chunk.toString()
    }
    let contentPipeline = ''
    for await (const chunk of filePipeline) {
      contentPipeline += chunk.toString()
    }
    const jsonContent = JSON.parse(contentPackage)
    repo.package = JSON.stringify(jsonContent)
    repo.pipeline = contentPipeline
    const appServices = contentPipeline.match(/appServiceName:\s*(\S+)/)
    repo.appservice = appServices ? appServices[1].replaceAll("'", '') : ''
    await repo.save()
    return repo
  }
}
