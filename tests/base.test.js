import { Api } from '../src'

// Initialize collections
require('./collections')

const api = new Api({
  getUserAccess: request => {
    return ['admin', `user:${request.user?.id}`]
  },
  driver: _ => {}
})

// test('adds 1 + 2 to equal 3', () => {
//   expect(sum(1, 2)).toBe(3)
// })
