import Conf from '../src/classes/Conf'
import SchemaValidator from '../src/classes/SchemaValidator'

beforeAll(() => {
  Conf.set('schemasFolder', 'tests/schemas')
})

describe('Schema Validation', () => {
  test('Validate normal object', async () => {
    const res = await SchemaValidator.filter(
      {
        id: null,
        firstname: 'John',
        lastname: 'Doe',
        pattern: 'Absolutely',
        mongoId: '633437c0d39198575e0e04c5',
        uniqueId: 'd701b2ce-77c7-4e97-87c7-da2d0ca2ab1a',
        email: 'john@doe.com',
        avatar: 'example.com/image.png',
        tags: ['foo'],
        birthday: '1990-09-07',
        createdAt: '2022-09-28 12:00:24',
        cars: 2,
        money: 287.29,
        avatarBase64: 'b2s=',
        welcomed: false
      },
      'User'
    )
    expect(typeof res).toBe('object')
    expect(res.firstname).toBe('John')
    expect(res.lastname).toBe('Doe')
    expect(res.email).toBe('john@doe.com')
    expect(res.avatar).toBe('http://example.com/image.png')
    expect(res.welcomed).toBe(false)
    expect(res.tags).toStrictEqual(['foo'])
    expect(res.birthday).toBe('1990-09-07')
    expect(res.createdAt).toMatch(/^2022-09-28/)
    expect(res.avatarBase64).toBe('b2s=')
    expect(res.cars).toBe(2)
    expect(res.money).toBe(287.29)
  })

  test('Missing required key', async () => {
    expect(
      SchemaValidator.filter(
        {
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('is required')
  })

  test('Must be a number', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 'two',
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must be a number')
  })

  test('MultipleOf', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 3,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('multiple of')
  })

  test('Minimum', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: -2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('greater than')
  })

  test('Maximum', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 20000002
        },
        'User'
      )
    ).rejects.toThrow('lesser than')
  })

  test('Exclusive minimum', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 0
        },
        'User'
      )
    ).rejects.toThrow('strictly greater than')
  })

  test('Exclusive maximum', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 10,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('strictly lesser than')
  })

  test('Enum', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo', 'fett'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('not a valid value')
  })

  test('Invalid date', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: 'Anything but a date',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('not a valid date')
  })

  test('Invalid datetime', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          createdAt: 'Not a date',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('not a valid date')
  })

  test('Base64', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29,
          avatarBase64: 'Not a base64 string'
        },
        'User'
      )
    ).rejects.toThrow('not a valid Base64 encoded string')
  })

  test('Email', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'johndoe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('not a valid email')
  })

  test('UUID', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          uniqueId: 'not a uuid',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('not a valid UUID')
  })

  test('ObjectID', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          mongoId: 'not a valid object ID',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('not a valid ObjectID')
  })

  test('URI', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'Not an URI',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('not a valid URI')
  })

  test('Non allowed field', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          mongoId: 'not a valid object ID',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'NoOtherFields'
      )
    ).rejects.toThrow('not an allowed field')
  })

  test('Allowed other field', async () => {
    const ret = await SchemaValidator.filter(
      {
        lastname: 'Doe'
      },
      'OtherStringFields'
    )
    expect(ret.lastname).toBe('Doe')
  })

  test('Allowed field but not good type', async () => {
    expect(
      SchemaValidator.filter(
        {
          lastname: 'Doe',
          money: 287.29
        },
        'OtherStringFields'
      )
    ).rejects.toThrow('must be a string')
  })

  test('Min Properties', async () => {
    expect(SchemaValidator.filter({}, 'OtherStringFields')).rejects.toThrow(
      'must not be shorter than'
    )
  })

  test('Max Properties', async () => {
    expect(
      SchemaValidator.filter(
        {
          test1: 'foo',
          test2: 'foo',
          test3: 'foo',
          test4: 'foo',
          test5: 'foo'
        },
        'OtherStringFields'
      )
    ).rejects.toThrow('must not be longer than')
  })

  test('Min items', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: [],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must not be shorter than')
  })

  test('Max items', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo', 'bar', 'zoo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must not be longer than')
  })

  test('Unique items', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo', 'foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must only contains unique items')
  })

  test('String', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 42,
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must be a string')
  })

  test('Min Length', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'J',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must be longer than')
  })

  test('Max Length', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'Jiibfzeibfezizfze',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must be shorter than')
  })

  test('Pattern', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          pattern: 'B',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('does not match required pattern')
  })

  test('Integer', async () => {
    expect(
      SchemaValidator.filter(
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          children: 2.2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must be an integer')
  })

  test('Null', async () => {
    expect(
      SchemaValidator.filter(
        {
          id: 'iubefziubfezibfez',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2.2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must be null')
  })

  test('Boolean', async () => {
    expect(
      SchemaValidator.filter(
        {
          welcomed: 'yes',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@doe.com',
          avatar: 'example.com/image.png',
          tags: ['foo'],
          birthday: '1990-09-07',
          cars: 2.2,
          money: 287.29
        },
        'User'
      )
    ).rejects.toThrow('must be a boolean')
  })
})
