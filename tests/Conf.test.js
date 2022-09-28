import Conf from '../src/classes/Conf'

describe('Conf', () => {
  test('Get (empty value)', async () => {
    expect(Conf.get('nonExistantValue')).toBe(null)
    expect(Conf.get('nonExistantValue', 'default')).toBe('default')
  })

  test('Set', async () => {
    expect(Conf.get('myKey')).toBe(null)
    Conf.set('myKey', 'foo')
    expect(Conf.get('myKey', 'bar')).toBe('foo')
  })

  test('SetMany', async () => {
    expect(Conf.get('foo')).toBe(null)
    expect(Conf.get('bar')).toBe(null)
    Conf.setMany({
      foo: 'test',
      bar: 'test2'
    })
    expect(Conf.get('foo')).toBe('test')
    expect(Conf.get('bar')).toBe('test2')
  })

  test('Append', async () => {
    expect(Conf.get('myArray')).toBe(null)
    Conf.set('myArray', 'wrong array')
    Conf.append('myArray', 'foo')
    expect(Conf.get('myArray')?.length).toBe(1)
    expect(Conf.get('myArray')[0]).toBe('foo')
    Conf.append('myArray', 'bar')
    expect(Conf.get('myArray')?.length).toBe(2)
    expect(Conf.get('myArray')[1]).toBe('bar')
  })
})
