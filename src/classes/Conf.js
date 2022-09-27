import { getProperty, setProperty } from 'dot-prop'

const options = {
  documentationPath: '/docs',
  prefix: '/',
  http: null,
  drivers: {
    orm: null,
    http: null
  },
  getUserAccess: _ => [],
  schemasFolder: 'schemas',
  monitor: false,
  monitorAccess: _ => true
}

export default class Conf {
  static get (key, defaultValue = null) {
    return getProperty(options, key, defaultValue)
  }

  static set (key, value) {
    setProperty(options, key, value)
  }

  static setMany (obj) {
    for (let key in obj) {
      Conf.set(key, obj[value])
    }
  }

  static append (key, value) {
    const arr = Conf.get(key, [])
    if (!arr || arr instanceof Array === false) {
      arr = []
    }
    arr.push(value)
    Conf.set(key, arr)
  }
}
