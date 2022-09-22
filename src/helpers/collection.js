import Conf from '../classes/Conf'

export default function collection (name, cb, options = {}) {
  Conf.set(`collections.${name}`, {
    routes: [],
    options
  })

  const router = (method, path, controller, opts = {}) => {
    const optsFromController = extractOptionsFromController(controller)
    if (opts.title === undefined && optsFromController.title !== undefined)
      opts.title = optsFromController.title
    if (
      opts.description === undefined &&
      optsFromController.description !== undefined
    )
      opts.description = optsFromController.description
    if (
      opts.accepts === undefined &&
      [null, undefined].includes(optsFromController.accepts) === false
    )
      opts.accepts = optsFromController.accepts
    if (opts.returns === undefined) opts.returns = {}
    for (let code in optsFromController.returns ?? {}) {
      if (opts.returns[code] === undefined)
        opts.returns[code] = optsFromController.returns[code]
    }

    Conf.append(`collections.${name}.routes`, {
      method,
      path,
      controller,
      options: opts
    })
  }

  cb({
    get: (p, c, o = {}) => router('GET', p, c, o),
    post: (p, c, o = {}) => router('POST', p, c, o),
    put: (p, c, o = {}) => router('PUT', p, c, o),
    patch: (p, c, o = {}) => router('PATCH', p, c, o),
    delete: (p, c, o = {}) => router('DELETE', p, c, o)
  })
}
