export default function apiParameter (name, schemaPath, description = null) {
  return (value, { kind }) => {
    if (kind === 'method') {
      if (description === null) description = `${name} field`
      if (value.prototype.apiParameters === undefined)
        value.prototype.apiParameters = {}
      value.prototype.apiParameters[name] = { schema: schemaPath, description }
    }
  }
}
