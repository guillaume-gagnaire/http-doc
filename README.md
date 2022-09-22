# ORM2API

Simple library to create API, with your favorite ORM/ODM, http framework.

## Features

- Documentation on routes or controllers
- Automatic OpenAPI documentation generator
- Access control management
- Basic CRUD controllers embedded (with HATEOAS)
- MessagePack implementation
- Plugin system to handle additional ORM or HTTP frameworks

## Installation

Install @smart-moov/orm-to-api with `npm`

```bash
npm install @smart-moov/orm-to-api --save
```

or with `yarn`

```bash
yarn add @smart-moov/orm-to-api
```

## API instanciation

```js
import { Api, collection } from '@smart-moov/orm-to-api'

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

| Parameter       | Type                    | Description                                                                                                |
| :-------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------- |
| `getUserAccess` | `string/array/function` | List of user access list. Can be a single string, or a function returning a string or an array of strings. |
| `drivers`       | `object`                | Provides plugins to use for ORM or HTTP framework interaction.                                             |
| `drivers.orm`   | `class`                 | Provides plugin to use for ORM interaction.                                                                |
| `drivers.http`  | `class`                 | Provides plugin to use for HTTP framework interaction.                                                     |

## Route Options

| Parameter        | Type                    | Description                                                                                                                                                                                                                                |
| :--------------- | :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`          | `string`                | Endpoint name in documentation.                                                                                                                                                                                                            |
| `description`    | `string`                | Endpoint description in documentation.                                                                                                                                                                                                     |
| `access`         | `string/array/function` | List of user access list. Can be a single string, or a function returning a string or an array of strings.                                                                                                                                 |
| `accepts`        | `string/array/object`   | Restricts input with provided OpenAPI Schema (string representing file path from root folder, direct schema or an array of objects representing : `{schema: String, handler: Function}`, the result being a mix of all validated schemas.) |
| `returns`        | `object`                | List of possible returned data, by HTTP code                                                                                                                                                                                               |
| `returns.{code}` | `string`                | OpenAPI Schema path from root folder.                                                                                                                                                                                                      |
| `accessFns`      | `function/function[]`   | Provides a list of async functions called to check if user can or not access this document.                                                                                                                                                |

## Decorators

Decorators are provided to configure your routes, directly from the controllers :

```js
import {
  apiTitle,
  apiDescription,
  apiAccess,
  apiAccepts,
  apiReturns
} from '@smart-moov/orm-to-api'

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
} from '@smart-moov/orm-to-api'
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