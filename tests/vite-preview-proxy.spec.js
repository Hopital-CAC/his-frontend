import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('Vite preview API proxy', () => {
  it('keeps API and socket proxy configuration in preview mode', () => {
    const source = readFileSync(resolve(process.cwd(), 'vite.config.js'), 'utf8')

    expect(source).toContain('preview: {')
    expect(source).toContain('port: 5173')

    const previewStart = source.indexOf('preview: {')
    const buildStart = source.indexOf('build: {', previewStart)

    expect(previewStart).toBeGreaterThanOrEqual(0)
    expect(buildStart).toBeGreaterThan(previewStart)

    const previewBlock = source.slice(previewStart, buildStart)

    expect(previewBlock).toContain("'/api': {")
    expect(previewBlock).toContain("'/socket.io': {")
    expect(previewBlock.match(/target: proxyTarget/g)).toHaveLength(2)
    expect(previewBlock.match(/changeOrigin: true/g)).toHaveLength(2)
    expect(previewBlock.match(/secure: false/g)).toHaveLength(2)
    expect(previewBlock).toContain('ws: true')
  })

  it('keeps Playwright CI and preview on the backend-approved origin', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'playwright.config.js'),
      'utf8',
    )

    expect(source).toContain('http://localhost:5173')
    expect(source).toContain('port: 5173,')
    expect(source).not.toContain('4173')
  })
})