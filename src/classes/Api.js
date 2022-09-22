import Conf from './Conf'

export default class Api {
  constructor (conf = {}) {
    Conf.setMany(conf)
  }

  setup () {
    // Create routes
  }
}
