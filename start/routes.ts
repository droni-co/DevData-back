/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const ReposController = () => import('#controllers/repos_controller')
const SecretsController = () => import('#controllers/secrets_controller')
const CommitsController = () => import('#controllers/commits_controller')
const PullRequestsController = () => import('#controllers/pullrequests_controller')
const SonarsController = () => import('#controllers/sonars_controller')
const ReportsController = () => import('#controllers/reports_controller')
const CopilotsController = () => import('#controllers/copilots_controller')

router.get('/', async () => {
  return {
    version: '1.0.0',
    name: 'DevOps API',
    description: 'API for DevOps management',
  }
})
router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])
router.get('/auth/me', [AuthController, 'me']).use([middleware.auth()])
router.post('/auth/logout', [AuthController, 'logout']).use([middleware.auth()])

router
  .group(() => {
    router.get('/repos/import', [ReposController, 'import'])
    router.get('/repos/import/:id', [ReposController, 'importDetails'])
    router.get('/repos/filters', [ReposController, 'filters'])
    router.get('/repos', [ReposController, 'index'])
    router.get('/secrets/import/:id', [SecretsController, 'importDetails'])
    router.get('/secrets/:vaultName/import', [SecretsController, 'import'])
    router.resource('secrets', SecretsController).apiOnly()
    router.get('/commits/import/:id', [CommitsController, 'import'])
    router.get('/commits/filters', [CommitsController, 'filters'])
    router.get('/commits', [CommitsController, 'index'])
    router.get('/pullrequests/import/:id', [PullRequestsController, 'import'])
    router.get('/pullrequests/filters', [PullRequestsController, 'filters'])
    router.get('/pullrequests', [PullRequestsController, 'index'])
    router.get('/sonars/import', [SonarsController, 'import'])
    router.get('/sonars/filters', [SonarsController, 'filters'])
    router.get('/sonars', [SonarsController, 'index'])
    router.get('/copilots', [CopilotsController, 'index'])
    router.get('/copilots/import', [CopilotsController, 'import'])

    // Reportes Sonar
    router.get('/reports/sonar/issues-by-type', [ReportsController, 'sonar_issuesByType'])
    router.get('/reports/sonar/issues-by-severity', [ReportsController, 'sonar_issuesBySeverity'])
    router.get('/reports/sonar/open-vs-closed', [ReportsController, 'sonar_openVsClosed'])
    router.get('/reports/sonar/issues-by-project', [ReportsController, 'sonar_issuesByProject'])
    router.get('/reports/sonar/top-rules', [ReportsController, 'sonar_topRules'])
    router.get('/reports/sonar/security-issues', [ReportsController, 'sonar_securityIssues'])
    router.get('/reports/sonar/issues-over-time', [ReportsController, 'sonar_issuesOverTime'])
  })
  .use([middleware.auth()])
