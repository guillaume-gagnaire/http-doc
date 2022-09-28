import Conf from '../src/classes/Conf'
import SchemaValidator from '../src/classes/SchemaValidator'

beforeAll(() => {
  Conf.set('schemasFolder', 'tests/schemas')
})

describe('Schema Load', () => {
  test('Existing schema can load', async () => {
    const validator = await SchemaValidator.init('User')
    expect(validator.schema?.type).toBe('object')

    // Uses cache to avoid calling FS two times
    const validator2 = await SchemaValidator.init('User')
    expect(validator2.schema?.type).toBe('object')
    expect(validator).toStrictEqual(validator2)
  })

  test('Non existing schema cannot load', async () => {
    expect(SchemaValidator.init('UserButNotExisting')).rejects.toThrow(
      'does not exists'
    )
  })

  test('Wrong JSON throws an error', async () => {
    expect(SchemaValidator.init('WrongJson')).rejects.toThrow(
      'not a valid JSON'
    )
  })
})
