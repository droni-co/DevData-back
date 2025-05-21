import type { HttpContext } from '@adonisjs/core/http'
import PullRequest from '#models/pullrequest'
import { AzureApiService } from '../../services/devops.js'
import {
  GitPullRequestSearchCriteria,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces.js'
import { DateTime } from 'luxon'

export default class PullrequestsController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const q = request.input('q', '')
    const repositoryId = request.input('repositoryId', '')
    const projectId = request.input('projectId', '')
    const targetRefName = request.input('targetRefName', '')
    const query = PullRequest.query()
    if (repositoryId) {
      query.where('repository_id', repositoryId)
    }
    if (projectId) {
      query.where('project_id', projectId)
    }
    if (targetRefName) {
      query.where('target_ref_name', targetRefName)
    }
    if (q) {
      query.where((subquery) => {
        subquery.whereILike('title', `%${q}%`).orWhereILike('description', `%${q}%`)
      })
    }
    const pullRequests = await query.orderBy('creation_date', 'desc').paginate(page, perPage)
    return pullRequests
  }
  /**
   * Import all resources
   */
  async import({ params, request }: HttpContext) {
    const allPRS: PullRequest[] = []
    const projectId = params.id
    const azureApiService = await AzureApiService.connection()
    const gitApi = await azureApiService.getGitApi()

    const defaultMinTime = DateTime.now().minus({ days: 30 }).toISO()
    const minTime = request.input('minTime', defaultMinTime)
    const fromDate = new Date(minTime)
    // add 1 day to from date
    const toDate = new Date(fromDate)
    toDate.setDate(toDate.getDate() + 1)

    const criteria: GitPullRequestSearchCriteria = {
      status: PullRequestStatus.Completed,
      // minTime: new Date('2024-01-01'),
      // maxTime: new Date('2024-03-02')
      minTime: fromDate,
      // maxTime: toDate,
      // targetRefName: 'refs/heads/qa'
    }
    console.log('ProjectId', projectId)
    const prs = await gitApi.getPullRequestsByProject(projectId, criteria)

    // Cambiar forEach por for...of para evitar deadlocks
    for (const pr of prs) {
      const pullRequest = await PullRequest.updateOrCreate(
        {
          id: pr.pullRequestId,
        },
        {
          id: pr.pullRequestId,
          repositoryId: pr.repository?.id,
          repositoryName: pr.repository?.name,
          projectId: pr.repository?.project?.id,
          projectName: pr.repository?.project?.name,
          creatorId: pr.createdBy?.id,
          creatorName: pr.createdBy?.displayName,
          status: pr.status,
          creationDate: DateTime.fromISO(
            typeof pr.creationDate === 'string'
              ? pr.creationDate
              : pr.creationDate instanceof Date
                ? pr.creationDate.toISOString()
                : String(pr.creationDate)
          ),
          closedDate: DateTime.fromISO(
            typeof pr.closedDate === 'string'
              ? pr.closedDate
              : pr.closedDate instanceof Date
                ? pr.closedDate.toISOString()
                : String(pr.closedDate)
          ),
          title: pr.title,
          description: pr.description,
          sourceRefName: pr.sourceRefName,
          targetRefName: pr.targetRefName,
          mergeStatus: pr.mergeStatus,
          completionQueueTime: DateTime.fromISO(
            typeof pr.completionQueueTime === 'string'
              ? pr.completionQueueTime
              : pr.completionQueueTime instanceof Date
                ? pr.completionQueueTime.toISOString()
                : String(pr.completionQueueTime)
          ),
        }
      )
      allPRS.push(pullRequest)
    }
    return { allPRS }
  }
  /**
   * Display a list of filters
   */
  async filters({}: HttpContext) {
    const creators = await PullRequest.query().distinct('creatorName').select('creatorName')
    const repos = await PullRequest.query()
      .distinct('repositoryName', 'repositoryId')
      .select('repositoryName', 'repositoryId')
    const projects = await PullRequest.query()
      .distinct('projectName', 'projectId')
      .select('projectName', 'projectId')
    const sources = await PullRequest.query().distinct('sourceRefName').select('sourceRefName')
    const targets = await PullRequest.query().distinct('targetRefName').select('targetRefName')
    const statuses = await PullRequest.query().distinct('status').select('status')
    const merges = await PullRequest.query().distinct('mergeStatus').select('mergeStatus')
    return {
      creatorName: creators,
      repositoryName: repos,
      projectName: projects,
      sourceRefName: sources,
      targetRefName: targets,
      status: statuses,
      mergeStatus: merges
        .map((row) => row.mergeStatus)
        .filter((v) => v !== undefined && v !== null),
    }
  }
}
