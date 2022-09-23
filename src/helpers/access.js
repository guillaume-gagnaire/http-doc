export default function apiAccess (access) {
  return (value, { kind }) => {
    if (kind === 'method') {
      value.prototype.apiAccess = access
    }
  }
}
