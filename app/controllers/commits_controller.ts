import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import { AzureApiService } from '../../services/devops.js'
import {
  GitCommitRef,
  GitQueryCommitsCriteria,
} from 'azure-devops-node-api/interfaces/GitInterfaces.js'
import Repo from '#models/repo'
import Commit from '#models/commit'
import Org from '#models/org'

export default class CommitsController {
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
    const authorEmail = request.input('authorEmail', '')
    const query = Commit.query().where('orgId', org.id)
    if (repositoryId) {
      query.where('repository_id', repositoryId)
    }
    if (projectId) {
      query.where('project_id', projectId)
    }
    if (authorEmail) {
      query.where('author_email', authorEmail)
    }
    if (q) {
      query.where((subquery) => {
        subquery
          .whereILike('comment', `%${q}%`)
          .orWhereILike('author_name', `%${q}%`)
          .orWhereILike('committer_name', `%${q}%`)
      })
    }
    const commits = await query.orderBy('author_date', 'desc').paginate(page, perPage)
    return commits
  }

  /**
   * Import all resources
   */
  async import({ params, request, auth }: HttpContext) {
    if (auth.user!.role !== 'admin') {
      throw new Error('No tienes permisos para importar métricas de Commits')
    }
    const org = await Org.findOrFail(auth.user!.orgId)
    const allCommits: Commit[] = []
    const projectId = params.id

    // Calcular fecha por defecto: hoy menos 30 días
    const defaultMinTime = DateTime.now().minus({ days: 30 }).toISO()
    const minTime = request.input('minTime', defaultMinTime)
    const repo = await Repo.query().where('repoId', projectId).where('orgId', org.id).firstOrFail()

    const azureApiService = await AzureApiService.connection(org)
    const gitApi = await azureApiService.getGitApi()
    const fromDate = new Date(minTime)
    // add 1 day to from date
    const toDate = new Date(fromDate)
    toDate.setDate(toDate.getDate() + 1)

    const criteria: GitQueryCommitsCriteria = {
      fromDate: fromDate.toISOString().substring(0, 10),
      //toDate: toDate.toISOString().substring(0, 10),
    }

    const commits = await gitApi.getCommits(repo.repoId, criteria)

    if (commits && commits.length > 0) {
      // Buscar los ya existentes para evitar duplicados
      const existing = await Commit.query()
        .whereIn(
          'commit_id',
          commits.map((c) => String(c.commitId))
        )
        .where('repository_id', repo.repoId)
        .select('commit_id')
      const existingIds = new Set(existing.map((c) => c.commitId))
      commits.forEach((commit: GitCommitRef) => {
        if (
          commit.author?.date &&
          commit.committer?.date &&
          !existingIds.has(String(commit.commitId))
        ) {
          const commitInstance = new Commit()
          commitInstance.orgId = org.id
          commitInstance.commitId = String(commit.commitId)
          commitInstance.repositoryId = repo.repoId
          commitInstance.repositoryName = repo.name
          commitInstance.projectId = repo.projectId
          commitInstance.projectName = repo.projectName
          commitInstance.authorName = String(commit.author?.name)
          commitInstance.authorEmail = String(commit.author?.email)
          commitInstance.authorDate = DateTime.fromISO(
            typeof commit.author.date === 'string'
              ? commit.author.date
              : commit.author.date instanceof Date
                ? commit.author.date.toISOString()
                : String(commit.author.date)
          )
          commitInstance.committerName = String(commit.committer?.name)
          commitInstance.committerEmail = String(commit.committer?.email)
          commitInstance.committerDate = DateTime.fromISO(
            typeof commit.committer.date === 'string'
              ? commit.committer.date
              : commit.committer.date instanceof Date
                ? commit.committer.date.toISOString()
                : String(commit.committer.date)
          )
          commitInstance.comment = String(commit.comment)
          commitInstance.commentTruncated = Boolean(commit.commentTruncated)
          commitInstance.changeAdd = Number((commit as any).changeCounts?.Add ?? 0)
          commitInstance.changeEdit = Number((commit as any).changeCounts?.Edit ?? 0)
          commitInstance.changeDelete = Number((commit as any).changeCounts?.Delete ?? 0)
          allCommits.push(commitInstance)
        }
      })
    }
    // Save all commits to the database
    if (allCommits.length > 0) {
      try {
        await Commit.createMany(allCommits)
      } catch (e) {
        // Ignorar errores de duplicados
        if (!String(e).includes('ER_DUP_ENTRY')) throw e
      }
    }

    return { allCommits }
  }

  /**
   * Get unique projectName, authorEmail, and committerEmail
   */
  async filters({ auth }: HttpContext) {
    const org = await Org.findOrFail(auth.user!.orgId)
    const projects = await Commit.query()
      .where('orgId', org.id)
      .distinct('projectName', 'projectId')
      .select('projectName', 'projectId')
      .orderBy('projectName')
    const authors = await Commit.query()
      .where('orgId', org.id)
      .distinct('authorName', 'authorEmail')
      .select('authorName', 'authorEmail')
      .orderBy('authorName')
    return {
      projects,
      authors,
    }
  }
}
