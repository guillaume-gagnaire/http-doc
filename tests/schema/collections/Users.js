import createModel from '../../../src/helpers/createModel'
import deleteModel from '../../../src/helpers/deleteModel'
import getModel from '../../../src/helpers/GetModel'
import listModel from '../../../src/helpers/listModel'
import replaceModel from '../../../src/helpers/replaceModel'
import updateModel from '../../../src/helpers/updateModel'

export default {
  name: 'Users',
  description: 'Contains app users',
  routes: [
    {
      method: 'GET',
      path: '/users',
      access: 'admin',
      controller: listModel(null),
      includeFields: ['id', 'name', 'email', 'avatar', 'admin']
    },
    {
      method: 'POST',
      path: '/users',
      allowedBodyFields: request => {
        const fields = ['name', 'email', 'avatar']
        if (request.user?.admin) fields.push('admin')
        return fields
      },
      controller: createModel(null),
      includeFields: ['id', 'name', 'email', 'avatar']
    },
    {
      method: 'GET',
      path: '/users/:id',
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      controller: getModel(null)
    },
    {
      method: 'PUT',
      path: '/users/:id',
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      controller: replaceModel(null)
    },
    {
      method: 'PATCH',
      path: '/users/:id',
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      controller: updateModel(null)
    },
    {
      method: 'DELETE',
      path: '/users/:id',
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      controller: deleteModel(null)
    }
  ]
}
