/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const ReposController = () => import('#controllers/repos_controller')
const SecretsController = () => import('#controllers/secrets_controller')
const CommitsController = () => import('#controllers/commits_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/repos/import', [ReposController, 'import'])
router.get('/repos/import/:id', [ReposController, 'importDetails'])
router.resource('repos', ReposController).apiOnly()
router.get('/secrets/import/:id', [SecretsController, 'importDetails'])
router.get('/secrets/import', [SecretsController, 'import'])
router.resource('secrets', SecretsController).apiOnly()
router.get('/commits/import/:id', [CommitsController, 'import'])
router.resource('commits', CommitsController).apiOnly()
