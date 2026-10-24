import test from 'node:test'
import assert from 'node:assert/strict'
import { originalVideoUrl, safeVideoThumbnail } from '../shared/media-delivery.mjs'
test('video requests bypass automatic and explicit video optimization', () => {
 const url = new URL(originalVideoUrl('https://ik.imagekit.io/account/tr:w-500/movie.mp4?tr=f-webm&updatedAt=123'))
 assert.equal(url.pathname, '/account/movie.mp4')
 assert.equal(url.searchParams.get('tr'), 'orig-true')
 assert.equal(url.searchParams.get('updatedAt'), '123')
 assert.equal(originalVideoUrl(url.toString()), url.toString())
})
test('video thumbnails never trigger ImageKit frame extraction', () => {
 assert.equal(safeVideoThumbnail('https://ik.imagekit.io/account/movie.mp4/ik-thumbnail.jpg?tr=w-500'), '/video-placeholder.svg')
 assert.equal(safeVideoThumbnail(''), '/video-placeholder.svg')
 assert.equal(safeVideoThumbnail('https://ik.imagekit.io/account/uploaded-poster.jpg'), 'https://ik.imagekit.io/account/uploaded-poster.jpg')
})
