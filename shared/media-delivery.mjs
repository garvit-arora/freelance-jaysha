// Bypass ImageKit video optimization for already prepared files.
export function originalVideoUrl(value) {
  try {
    const url = new URL(value)
    if (url.hostname !== 'ik.imagekit.io') return value
    url.pathname = url.pathname.replace(/\/tr:[^/]+/g, '')
    url.searchParams.set('tr', 'orig-true')
    return url.toString()
  } catch { return value }
}
export function safeVideoThumbnail(value) {
  return !value || value.includes('/ik-thumbnail.') ? '/video-placeholder.svg' : value
}
