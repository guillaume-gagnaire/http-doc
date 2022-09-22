# orm-to-api

Simple library to create API, with your favorite ORM/ODM, http framework.

## Features

- Documentation on routes or controllers
- Automatic OpenAPI documentation generator
- Access control management
- Basic CRUD controllers embedded (with HATEOAS)
- MessagePack implementation
- Plugin system to handle additional ORM or HTTP frameworks

## Installation

Install orm-to-api with `npm`

```bash
npm install orm-to-api --save
```

or with `yarn`

```bash
yarn add orm-to-api
```

## API instanciation

```js
import { Api, collection } from 'orm-to-api'

const api = new Api({
  // options, see Api Options section
})

// Register routes
collection(
  'Users',
  router => {
    router.get('/', UserController.list, {
      // options, see Route Options section
    })
  },
  {
    title: 'Users',
    description: 'Managing users',
    prefix: '/users'
  }
)

// Apply configuration to your HTTP framework
api.setup()
```

## Api Options

| Parameter           | Type                    | Description                                                                                                |
| :------------------ | :---------------------- | :--------------------------------------------------------------------------------------------------------- |
| `getUserAccess`     | `string/array/function` | List of user access list. Can be a single string, or a function returning a string or an array of strings. |
| `drivers`           | `object`                | Provides plugins to use for ORM or HTTP framework interaction.                                             |
| `drivers.orm`       | `class`                 | Provides plugin to use for ORM interaction.                                                                |
| `drivers.http`      | `class`                 | Provides plugin to use for HTTP framework interaction.                                                     |
| `documentationPath` | `string`                | Documentation display path (Default: /docs)                                                                |
| `prefix`            | `string`                | Prefix for all routes                                                                                      |
| `http`              | `object`                | HTTP framework instance                                                                                    |

## Route Options

| Parameter        | Type                    | Description                                                                                                                                                                                                                                                                                                    |
| :--------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`          | `string`                | Endpoint name in documentation.                                                                                                                                                                                                                                                                                |
| `description`    | `string`                | Endpoint description in documentation.                                                                                                                                                                                                                                                                         |
| `access`         | `string/array/function` | List of user access requirements. Can be a string, a function or an array of string or functions. Functions will return a boolean.                                                                                                                                                                             |
| `accepts`        | `string/array/object`   | Restricts input with provided OpenAPI Schema. Can be a string (file path to schema), an object (OpenAPI schema), or an array of strings (file path to schema) or objects (direct schema or conditional object : `{schema: String, handler: Function, description: String}`). Validated schemas will be merged. |
| `returns`        | `object`                | List of possible returned data, by HTTP code                                                                                                                                                                                                                                                                   |
| `returns.{code}` | `string`                | OpenAPI Schema path from root folder.                                                                                                                                                                                                                                                                          |

## Decorators

Decorators are provided to configure your routes, directly from the controllers :

```js
import {
  apiTitle,
  apiDescription,
  apiAccess,
  apiAccepts,
  apiReturns
} from 'orm-to-api'

export default class UsersController {
  @apiTitle('Login')
  @apiDescription('Logs in a user')
  @apiAccess(true)
  @apiAccepts('schemas/Login')
  @apiReturns(200, 'schemas/UserJwt')
  @apiReturns(403, 'schemas/Error')
  @apiReturns(500, 'schemas/Error')
  static async login (request, reply, routeConf) {
    // Handling login
    return { loggedIn: true }
  }
}
```

You need to add babel configuration to handle ES6 decorators (experimental for now):

```json
{
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "2022-03" }]]
}
```

## CRUD

CRUD methods are provided to quickly implement CRUD on your ORM models :

```js
import {
  controller,
  useCreateModel,
  useDeleteModel,
  useGetModel,
  useListModel,
  useReplaceModel,
  useUpdateModel
} from 'orm-to-api'
import UserModel from '../models/User'

controller(
  'Users',
  router => {
    router.get('/', useListModel(UserModel))
    router.post('/', useCreateModel(UserModel))
    router.get('/:id', useGetModel(UserModel))
    router.put('/:id', useReplaceModel(UserModel))
    router.patch('/:id', useUpdateModel(UserModel))
    router.delete('/:id', useDeleteModel(UserModel))
  },
  {
    prefix: '/users'
  }
)
```

The `id` param, in the route, is mandatory to allow theses generic controllers to find correct documents.

## Access Control Lists

ACL is based on custom strings, like `admin`, `users:list`, per example. You define which permissions a user have, and he'll be able to access only routes with correct permissions.

### Examples

```js
import { Api, collection } from 'orm-to-api'

const api = new Api({
  getUserAccess: request => {
    // Logged in user :
    /* {
      permissions: ['users:list', 'users:create']
    } */
    return request.user.permissions
  }
})

controller('Users', router => {
  router.get('/', listController, {
    access: 'users:list' // Will have access to this endpoint
  })
  router.post('/', createController, {
    access: ['admin', 'users:create'] // Will have access to this endpoint, because one of the requirements is fulfilled
  })
  router.put('/:id', updateController, {
    access: [
      'admin',
      'users:edit',
      request => request.params.id === request.user.id
    ] // Will not have access to this endpoint if he tries to edit another user
  })
})
```

## OpenAPI Schemas

Input data and returned data filtering works with OpenAPI Schemas, stored where you want on your project folder in `JSON` format. References are relative to index script location.

Example :

```json
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string"
    },
    "address": {
      "$ref": "schemas/Address"
    },
    "age": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    }
  }
}
```

## Input data filtering

You can filter input data with `accepts` configuration field on routes.

### Examples

```js
import { collection } from 'orm-to-api'
import UserGetFilter from '../schemas/UserGetFilter.json'

controller('Users', router => {
  router.get('/', listController, {
    accepts: 'schemas/UserListFilters'
  })
  router.get('/:id', listController, {
    accepts: UserGetFilter
  })
  router.post('/', createController, {
    accepts: [
      'schemas/UserCreate',
      {
        schema: 'schemas/UserCreateAdmin',
        handler: request => !!request.user?.admin,
        description: 'If user is admin'
      }
    ]
  })
})
```

## Authors

- [@guillaume-gagnaire](https://www.github.com/guillaume-gagnaire)
