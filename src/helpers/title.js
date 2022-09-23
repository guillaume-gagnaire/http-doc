export default function apiTitle (title) {
  return (value, { kind }) => {
    if (kind === 'method') {
      value.prototype.apiTitle = title
    }
  }
}
