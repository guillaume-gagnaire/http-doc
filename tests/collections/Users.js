import useCreateModel from '../../src/helpers/useCreateModel'
import useDeleteModel from '../../src/helpers/useDeleteModel'
import useGetModel from '../../src/helpers/useGetModel'
import useListModel from '../../src/helpers/useListModel'
import useReplaceModel from '../../src/helpers/useReplaceModel'
import useUpdateModel from '../../src/helpers/useUpdateModel'

import { controller } from '../../src'

controller(
  'Users',
  route => {
    route.get('/', useListModel, {
      access: 'admin',
      returns: {
        200: 'UserLite',
        403: 'Error',
        500: 'Error'
      }
    })

    route.post('/', useCreateModel, {
      accepts: request => {
        const fields = ['name', 'email', 'avatar']
        if (request.user?.admin) fields.push('admin')
        return fields
      },
      returns: {
        201: 'User',
        500: 'Error'
      }
    })

    route.get('/:id', useGetModel, {
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      returns: {
        200: 'User',
        403: 'Error',
        500: 'Error'
      }
    })

    route.put('/:id', useReplaceModel, {
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      returns: {
        200: 'User',
        403: 'Error',
        500: 'Error'
      }
    })

    route.patch('/:id', useUpdateModel, {
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      returns: {
        200: 'User',
        403: 'Error',
        500: 'Error'
      }
    })

    route.delete('/:id', useDeleteModel, {
      access: request => {
        return ['admin', `user:${request.params.id}`]
      },
      returns: {
        200: 'User',
        403: 'Error',
        500: 'Error'
      }
    })
  },
  {
    title: 'Users',
    description: 'Manages app users',
    prefix: '/users'
  }
)
