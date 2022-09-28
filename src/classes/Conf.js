import objectPath from 'object-path'

/* istanbul ignore next */
const options = {
  documentationPath: '/swagger.json',
  documentationAccess: _ => true,
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
    return objectPath.get(options, key, defaultValue)
  }

  static set (key, value) {
    objectPath.set(options, key, value)
  }

  static setMany (obj) {
    for (let key in obj) {
      Conf.set(key, obj[key])
    }
  }

  static append (key, value) {
    let arr = Conf.get(key, [])
    if (!arr || arr instanceof Array === false) {
      arr = []
    }
    arr.push(value)
    Conf.set(key, arr)
  }
}
