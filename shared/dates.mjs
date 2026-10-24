export function validDate(value) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return false
  const [day, month, year] = value.split('-').map(Number)
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  return year >= 1900 && year <= 9999 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function validEvent(event) {
  return validDate(event.date) && typeof event.title === 'string' && event.title.trim().length > 0 &&
    typeof event.description === 'string' && Array.isArray(event.images) && event.images.every(image => {
      try {
        const url = new URL(image.url)
        return url.protocol === 'https:' && url.hostname === 'ik.imagekit.io' && typeof image.alt === 'string'
      } catch { return false }
    })
}
