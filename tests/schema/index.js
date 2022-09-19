export default {
  collections: require('./collections'),
  getUserAccess: request => {
    return ['admin', `user:${request.user?.id}`]
  },
  drivers: {
    orm: _ => {},
    http: _ => {}
  }
}
