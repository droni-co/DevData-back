import type { HttpContext } from '@adonisjs/core/http'
import PullRequest from '#models/pullrequest'
import { AzureApiService } from '../../services/devops.js'
import {
  GitPullRequestSearchCriteria,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces.js'
import { DateTime } from 'luxon'
import Org from '#models/org'

export default class PullrequestsController {
  /**
   * Display a list of resource
   */
  async index({ request, auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const q = request.input('q', '')
    const repositoryId = request.input('repositoryId', '')
    const projectId = request.input('projectId', '')
    const creatorName = request.input('creatorName', '')
    const sourceRefName = request.input('sourceRefName', '')
    const targetRefName = request.input('targetRefName', '')
    const status = request.input('status', '')
    const mergeStatus = request.input('mergeStatus', '')
    const query = PullRequest.query().where('orgId', org.id)
    if (repositoryId) {
      query.where('repository_id', repositoryId)
    }
    if (projectId) {
      query.where('project_id', projectId)
    }
    if (creatorName) {
      query.where('creator_name', creatorName)
    }
    if (sourceRefName) {
      query.where('source_ref_name', sourceRefName)
    }
    if (targetRefName) {
      query.where('target_ref_name', targetRefName)
    }
    if (status) {
      query.where('status', status)
    }
    if (mergeStatus) {
      query.where('merge_status', mergeStatus)
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
  async import({ params, request, auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const allPRS: PullRequest[] = []
    const projectId = params.id
    const azureApiService = await AzureApiService.connection(org)
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
          pullRequestId: pr.pullRequestId,
          orgId: org.id,
        },
        {
          pullRequestId: pr.pullRequestId,
          orgId: org.id,
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
  async filters({ auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const creators = await PullRequest.query()
      .where('orgId', org.id)
      .distinct('creatorName')
      .select('creatorName')
      .orderBy('creatorName', 'asc')
    const repos = await PullRequest.query()
      .where('orgId', org.id)
      .distinct('repositoryName', 'repositoryId')
      .select('repositoryName', 'repositoryId')
      .orderBy('repositoryName', 'asc')
    const projects = await PullRequest.query()
      .where('orgId', org.id)
      .distinct('projectName', 'projectId')
      .select('projectName', 'projectId')
      .orderBy('projectName', 'asc')
    const sources = await PullRequest.query()
      .where('orgId', org.id)
      .distinct('sourceRefName')
      .select('sourceRefName')
      .orderBy('sourceRefName', 'asc')
    const targets = await PullRequest.query()
      .where('orgId', org.id)
      .distinct('targetRefName')
      .select('targetRefName')
      .orderBy('targetRefName', 'asc')
    const statuses = await PullRequest.query()
      .where('orgId', org.id)
      .distinct('status')
      .select('status')
      .orderBy('status', 'asc')
    const mergeStatus = await PullRequest.query()
      .where('orgId', org.id)
      .distinct('mergeStatus')
      .select('mergeStatus')
      .orderBy('mergeStatus', 'asc')
    return {
      creators,
      repositories: repos,
      projects,
      sources,
      targets,
      statuses,
      mergeStatus,
    }
  }
}
