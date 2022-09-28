import Conf from '../src/classes/Conf'
import SchemaValidator from '../src/classes/SchemaValidator'

beforeAll(() => {
  Conf.set('schemasFolder', 'tests/schemas')
})

describe('SchemaLoad', () => {
  test('Existing schema can load', async () => {
    const validator = await SchemaValidator.init('User')
    expect(validator.schema?.type).toBe('object')
  })

  test('Non existing schema cannot load', async () => {
    expect(SchemaValidator.init('UserButNotExisting')).rejects.toMatch(
      'does not exists'
    )
  })

  test('Wrong JSON throws an error', async () => {
    expect(SchemaValidator.init('WrongJson')).rejects.toMatch(
      'not a valid JSON'
    )
  })
})
