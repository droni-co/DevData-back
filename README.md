# DevData API

## Descripción General

DevData es una API diseñada para consumir y analizar datos de diferentes fuentes con el fin de generar métricas sobre el rendimiento de equipos de trabajo de TI. La plataforma permite recopilar información desde repositorios de código, secretos en Azure Key Vault y otros servicios relacionados con el desarrollo de software, facilitando el análisis del desempeño de equipos de desarrollo.

## Características Principales

- **Recopilación de datos de repositorios**: Integración con Azure DevOps para importar información de repositorios Git.
- **Gestión de secretos**: Integración con Azure Key Vault para la gestión segura de secretos.
- **Análisis de métricas**: Procesamiento de datos para generar indicadores de rendimiento.
- **API RESTful**: Endpoints para acceder a la información de forma estructurada.

## Tecnologías Utilizadas

- [AdonisJS](https://adonisjs.com/): Framework MVC para Node.js
- [TypeScript](https://www.typescriptlang.org/): Tipado estático para JavaScript
- [MySQL](https://www.mysql.com/): Base de datos relacional
- [Azure DevOps Node API](https://github.com/microsoft/azure-devops-node-api): SDK para integración con Azure DevOps
- [Azure Key Vault](https://azure.microsoft.com/es-es/services/key-vault/): Servicio de almacenamiento seguro para secretos

## Estructura del Proyecto

```
backend/
├── app/                    # Código principal de la aplicación
│   ├── controllers/        # Controladores para manejar las peticiones HTTP
│   ├── exceptions/         # Manejadores de excepciones
│   ├── middleware/         # Middleware para las peticiones HTTP
│   └── models/             # Modelos de datos
├── bin/                    # Archivos ejecutables y entradas de la aplicación
├── config/                 # Archivos de configuración
├── database/               # Migraciones y semillas de base de datos
│   └── migrations/         # Migraciones para creación de tablas
├── services/               # Servicios externos e integraciones
│   └── devops.ts           # Servicio de integración con Azure DevOps
├── start/                  # Archivos de inicialización
│   ├── env.ts              # Configuración de variables de entorno
│   ├── kernel.ts           # Configuración del kernel HTTP
│   └── routes.ts           # Definición de rutas
└── tests/                  # Pruebas automatizadas
```

## API Endpoints

### Repositorios

- `GET /repos`: Obtiene la lista de todos los repositorios
- `GET /repos/import`: Importa repositorios desde Azure DevOps
- `GET /repos/import/:id`: Importa detalles específicos de un repositorio
- `POST /repos`: Crea un nuevo repositorio
- `GET /repos/:id`: Obtiene un repositorio específico
- `PUT /repos/:id`: Actualiza un repositorio específico
- `DELETE /repos/:id`: Elimina un repositorio específico

### Secretos

- `GET /secrets`: Obtiene la lista de todos los secretos
- `GET /secrets/import`: Importa secretos desde Azure Key Vault
- `GET /secrets/import/:id`: Importa detalles específicos de un secreto
- `POST /secrets`: Crea un nuevo secreto
- `GET /secrets/:id`: Obtiene un secreto específico
- `PUT /secrets/:id`: Actualiza un secreto específico
- `DELETE /secrets/:id`: Elimina un secreto específico

## Requisitos Previos

- Node.js >= 18
- MySQL >= 8.0
- Cuenta de Azure con acceso a DevOps y Key Vault

## Configuración del Entorno

1. Clone el repositorio:
```bash
git clone https://github.com/tu-usuario/devdata.git
cd devdata/backend
```

2. Instale las dependencias:
```bash
npm install
```

3. Configure el archivo .env basado en el ejemplo:
```bash
cp .env.example .env
```

4. Configure las variables de entorno necesarias:
```
APP_KEY=<su_clave_secreta>
DB_HOST=<host_de_su_bd>
DB_PORT=<puerto_de_su_bd>
DB_USER=<usuario_de_su_bd>
DB_PASSWORD=<contraseña_de_su_bd>
DB_DATABASE=<nombre_de_su_bd>
PERSONAL_ACCESS_TOKEN=<token_de_azure_devops>
ORG_URL=<url_de_la_organizacion_azure>
```

5. Ejecute las migraciones:
```bash
node ace migration:run
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

La API estará disponible en `http://localhost:3333`.

### Producción

```bash
npm run build
npm start
```

## Pruebas

```bash
npm test
```

## Casos de Uso

- **Análisis de rendimiento de equipos**: Recopila datos sobre la actividad de los repositorios y genera métricas del desempeño.
- **Gestión centralizada de secretos**: Accede y administra secretos desde Azure Key Vault de manera segura.
- **Monitoreo de despliegues**: Rastrea información sobre despliegues y pipelines.
- **Seguimiento de proyectos**: Proporciona una vista centralizada de todos los proyectos y sus repositorios asociados.

## Contribuciones

Para contribuir al proyecto, por favor siga estos pasos:

1. Haga fork del repositorio
2. Cree una rama para su característica (`git checkout -b feature/amazing-feature`)
3. Haga commit de sus cambios (`git commit -m 'Add some amazing feature'`)
4. Haga push a la rama (`git push origin feature/amazing-feature`)
5. Abra un Pull Request

## Licencia

Este proyecto está licenciado bajo la licencia GPL (GNU General Public License).
