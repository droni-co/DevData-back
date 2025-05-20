import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import { AzureApiService } from '../../services/devops.js'
import {
  GitCommitRef,
  GitQueryCommitsCriteria,
} from 'azure-devops-node-api/interfaces/GitInterfaces.js'
import Repo from '#models/repo'
import Commit from '#models/commit'

export default class CommitsController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const q = request.input('q', '')
    const repositoryId = request.input('repositoryId', '')
    const projectId = request.input('projectId', '')
    const authorEmail = request.input('authorEmail', '')
    const committerEmail = request.input('committerEmail', '')
    const query = Commit.query()
    if (repositoryId) {
      query.where('repository_id', repositoryId)
    }
    if (projectId) {
      query.where('project_id', projectId)
    }
    if (authorEmail) {
      query.where('author_email', authorEmail)
    }
    if (committerEmail) {
      query.where('committer_email', committerEmail)
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
  async import({ params, request }: HttpContext) {
    const allCommits: Commit[] = []
    const projectId = params.id

    // Calcular fecha por defecto: hoy menos 30 días
    const defaultMinTime = DateTime.now().minus({ days: 30 }).toISO()
    const minTime = request.input('minTime', defaultMinTime)
    const repo = await Repo.findOrFail(projectId)

    const azureApiService = await AzureApiService.connection()
    const gitApi = await azureApiService.getGitApi()
    const fromDate = new Date(minTime)
    // add 1 day to from date
    const toDate = new Date(fromDate)
    toDate.setDate(toDate.getDate() + 1)

    const criteria: GitQueryCommitsCriteria = {
      fromDate: fromDate.toISOString().substring(0, 10),
      //toDate: toDate.toISOString().substring(0, 10),
    }

    const commits = await gitApi.getCommits(repo.id, criteria)

    if (commits && commits.length > 0) {
      // Buscar los ya existentes para evitar duplicados
      const existing = await Commit.query()
        .whereIn(
          'commit_id',
          commits.map((c) => String(c.commitId))
        )
        .where('repository_id', repo.id)
        .select('commit_id')
      const existingIds = new Set(existing.map((c) => c.commitId))
      commits.forEach((commit: GitCommitRef) => {
        if (
          commit.author?.date &&
          commit.committer?.date &&
          !existingIds.has(String(commit.commitId))
        ) {
          const commitInstance = new Commit()
          commitInstance.commitId = String(commit.commitId)
          commitInstance.repositoryId = repo.id
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
  async filters({}: HttpContext) {
    const projects = await Commit.query().distinct('projectName').select('projectName')
    const authors = await Commit.query().distinct('authorEmail').select('authorEmail')
    const committers = await Commit.query().distinct('committerEmail').select('committerEmail')
    return {
      projectName: projects
        .map((row) => row.projectName)
        .filter((name: string | null | undefined): name is string => !!name),
      authorEmail: authors
        .map((row) => row.authorEmail)
        .filter((email: string | null | undefined): email is string => !!email),
      committerEmail: committers
        .map((row) => row.committerEmail)
        .filter((email: string | null | undefined): email is string => !!email),
    }
  }
}
