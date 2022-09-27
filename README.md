# http-doc

Creates your HTTP routes with ACL, data filtering and automatic documentation.

## Features

- Documentation on routes or controllers
- Automatic OpenAPI documentation generator
- Access control management
- Plugin system to handle additional HTTP frameworks

## Installation

Install http-doc with `npm`

```bash
npm install http-doc --save
```

or with `yarn`

```bash
yarn add http-doc
```

## API instanciation

```js
import { Api, collection } from 'http-doc'

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

| Parameter           | Type                    | Description                                                                                                                         |
| :------------------ | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `getUserAccess`     | `string/array/function` | List of user access list. Can be a single string, or a function returning a string or an array of strings.                          |
| `driver`            | `class`                 | Provides plugin to use for HTTP framework interaction.                                                                              |
| `documentationPath` | `string`                | Documentation display path (Default: /docs)                                                                                         |
| `prefix`            | `string`                | Prefix for all routes                                                                                                               |
| `http`              | `object`                | HTTP framework instance                                                                                                             |
| `schemasFolder`     | `string`                | Path to folder containing all OpenAPI Schemas (default: schemas)                                                                    |
| `monitor`           | `boolean`               | Monitor all API calls (count, time metrics). Creates a set of monitoring API endpoints (See Monitoring section). (default: `false`) |
| `monitorAccess`     | `function`              | Function used to restrict access to the monitoring API. (default: `request => true`)                                                |

## Route Options

| Parameter                       | Type                    | Description                                                                                                                                                                                                                                                                                                    |
| :------------------------------ | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                         | `string`                | Endpoint name in documentation.                                                                                                                                                                                                                                                                                |
| `description`                   | `string`                | Endpoint description in documentation.                                                                                                                                                                                                                                                                         |
| `access`                        | `string/array/function` | List of user access requirements. Can be a string, a function or an array of string or functions. Functions will return a boolean.                                                                                                                                                                             |
| `accepts`                       | `string/array/object`   | Restricts input with provided OpenAPI Schema. Can be a string (file path to schema), an object (OpenAPI schema), or an array of strings (file path to schema) or objects (direct schema or conditional object : `{schema: String, handler: Function, description: String}`). Validated schemas will be merged. |
| `returns`                       | `object`                | List of possible returned data, by HTTP code.                                                                                                                                                                                                                                                                  |
| `returns.{code}`                | `object`                | Object describing returned data.                                                                                                                                                                                                                                                                               |
| `returns.{code}.schema`         | `string`                | OpenAPI Schema path, relative to `schemasFolder` Api configuration field.                                                                                                                                                                                                                                      |
| `returns.{code}.description`    | `string`                | Description of returned data.                                                                                                                                                                                                                                                                                  |
| `parameters.{name}`             | `object`                | Object describing parameter.                                                                                                                                                                                                                                                                                   |
| `parameters.{name}.schema`      | `string`                | OpenAPI Schema path, relative to `schemasFolder` Api configuration field.                                                                                                                                                                                                                                      |
| `parameters.{name}.description` | `string`                | Description of parameter.                                                                                                                                                                                                                                                                                      |

## Access Control Lists

ACL is based on custom strings, like `admin`, `users:list`, per example. You define which permissions a user have, and he'll be able to access only routes with correct permissions.

### Example

```js
import { Api, collection } from 'http-doc'

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

Input data and returned data filtering works with OpenAPI Schemas, stored where you want on your project folder in `JSON` format. References are relative to the provided schemas folder when initializing API.

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
      "$ref": "Address"
    },
    "age": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    }
  }
}
```

More info on OpenAPI Schemas [here](https://swagger.io/specification/#schema-object).

Handled string formats :

- date
- date-time
- byte (or base64)
- email
- uuid
- objectid
- uri

Unsupported features :

- allOf
- anyOf
- oneOf
- not

## Parameters

With `parameters` route configuration parameter, you can describe and filter parameters located in query, path, headers or cookies.

### Example

```js
import { collection } from 'http-doc'

controller('Users', router => {
  router.get('/', listController, {
    parameters: {
      page: { schema: 'params/Page', description: 'Page' },
      limit: { schema: 'params/Limit', description: 'Limit' }
    }
  })
})
```

## Input data filtering

You can filter input data with `accepts` configuration field on routes.

### Example

```js
import { collection } from 'http-doc'
import UserGetFilter from '../UserGetFilter.json'

controller('Users', router => {
  router.get('/', listController, {
    accepts: 'UserListFilters'
  })
  router.get('/:id', listController, {
    accepts: UserGetFilter
  })
  router.post('/', createController, {
    accepts: [
      'UserCreate',
      {
        schema: 'UserCreateAdmin',
        handler: request => !!request.user?.admin,
        description: 'If user is admin'
      }
    ]
  })
})
```

## Returned data filtering

With `returns` route configuration parameter, you can automatically filter data returned by your controller according to an OpenAPI Schema, accordingly to the returned HTTP code.

### Example

```js
import { collection } from 'http-doc'
import UserGetFilter from '../UserGetFilter.json'

controller('Users', router => {
  router.get('/', listController, {
    returns: {
      200: { schema: 'UserLite', description: 'User data' },
      403: { schema: 'Error', description: 'Not authorized' },
      500: { schema: 'Error', description: 'Unknown error' }
    }
  })
  router.get('/:id', listController, {
    returns: {
      200: { schema: 'User', description: 'User data' },
      403: { schema: 'Error', description: 'Not authorized' },
      500: { schema: 'Error', description: 'Unknown error' }
    }
  })
  router.post('/', createController, {
    returns: {
      201: { schema: 'User', description: 'User data' },
      400: { schema: 'Error', description: 'Bad input data' },
      403: { schema: 'Error', description: 'Not authorized' },
      500: { schema: 'Error', description: 'Unknown error' }
    }
  })
})
```

## Decorators

Decorators are provided to configure your routes, directly from the controllers :

```js
import {
  title,
  description,
  access,
  accepts,
  returns,
  parameter
} from 'http-doc'

export default class UsersController {
  @title('Login')
  @description('Logs in a user')
  @access(true)
  @accepts('Login')
  @parameter('source', 'Source', 'Accepted auth source')
  @returns(200, 'UserJwt', 'Authorized JWT token')
  @returns(403, 'Error', 'Invalid credentials')
  @returns(500, 'Error', 'System error')
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

## Authors

- [@guillaume-gagnaire](https://www.github.com/guillaume-gagnaire)
