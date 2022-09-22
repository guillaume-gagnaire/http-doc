export default function apiReturns (code, schemaPath) {
  return (value, { kind }) => {
    if (kind === 'method') {
      if (value.prototype.apiReturns === undefined)
        value.prototype.apiReturns = {}
      value.prototype.apiReturns[code] = schemaPath
    }
  }
}
