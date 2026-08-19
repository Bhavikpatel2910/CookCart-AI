export function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function timeAgo(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  return `${hours} hr${hours > 1 ? 's' : ''}`
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

export function sumBy(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0)
}

export function getCartTotals(items) {
  const subtotal = sumBy(items, (item) => item.price * item.quantity)
  const pantrySavings = sumBy(items, (item) => (item.fromPantry ? item.price * item.quantity : 0))
  const total = Math.max(0, subtotal - pantrySavings)
  return { subtotal, pantrySavings, total }
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
