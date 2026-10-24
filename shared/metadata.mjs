export function renderMetadata(html, siteUrl) {
  if (/[<>"'\s]/.test(siteUrl)) throw new Error('SITE_URL contains invalid characters')
  const url = new URL(siteUrl)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('SITE_URL must be an HTTP or HTTPS website URL')
  return html.replaceAll('__SITE_ORIGIN__', url.origin)
}
