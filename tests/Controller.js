import { apiTitle, apiDescription, apiReturns } from '../src'

export default class Controller {
  @apiTitle('Login')
  @apiDescription('Logs in a user')
  @apiReturns(200, 'schemas/SchemaName')
  static async login (request, reply) {
    return { status: true }
  }
}
