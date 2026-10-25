export function songEmbedUrl(song) {
  if (!/^[\w-]{11}$/.test(song.id)) throw new Error('Invalid YouTube video ID')
  const params = new URLSearchParams({ autoplay: '1', playsinline: '1', controls: '1', rel: '0' })
  if (song.start) params.set('start', String(song.start))
  if (song.end) params.set('end', String(song.end))
  return `https://www.youtube.com/embed/${song.id}?${params}`
}
