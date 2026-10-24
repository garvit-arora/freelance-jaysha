import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { renderMetadata } from './shared/metadata.mjs'

export default defineConfig(({ mode }) => {
  const { SITE_URL } = loadEnv(mode, '.', 'SITE_URL')
  return {
    plugins: [react(), {
      name: 'site-sharing-metadata',
      transformIndexHtml(html, context) {
        // The Node server fills the public origin at runtime when no build URL is configured.
        return SITE_URL ? renderMetadata(html, SITE_URL) : context.server ? renderMetadata(html, 'http://127.0.0.1:5173') : html
      },
    }],
  }
})
