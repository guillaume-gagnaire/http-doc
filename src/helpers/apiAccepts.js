export default function apiAccepts (accepts) {
  return (value, { kind }) => {
    if (kind === 'method') {
      value.prototype.apiAccepts = accepts
    }
  }
}
