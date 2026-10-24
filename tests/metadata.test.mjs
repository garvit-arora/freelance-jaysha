import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMetadata } from '../shared/metadata.mjs'

test('sharing metadata uses absolute URLs and strips URL paths and query strings', () => {
  const output = renderMetadata('<meta content="__SITE_ORIGIN__/anveshan/near-strength.jpeg"><link href="__SITE_ORIGIN__/">', 'https://birthday.example/explore?from=share')
  assert.ok(output.includes('https://birthday.example/anveshan/near-strength.jpeg'))
  assert.ok(output.includes('href="https://birthday.example/"'))
  assert.ok(!output.includes('__SITE_ORIGIN__'))
})
test('sharing URL cannot inject HTML or use an executable protocol', () => {
  assert.throws(() => renderMetadata('__SITE_ORIGIN__', 'javascript:alert(1)'))
  assert.throws(() => renderMetadata('__SITE_ORIGIN__', 'https://example.com"/><script>'))
})
