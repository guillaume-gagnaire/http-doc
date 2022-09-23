export default function apiDescription (description) {
  return (value, { kind }) => {
    if (kind === 'method') {
      value.prototype.apiDescription = description
    }
  }
}
