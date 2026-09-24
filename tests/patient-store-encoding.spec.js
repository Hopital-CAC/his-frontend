import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

function source(relativePath) {
  return fs.readFileSync(path.join(cwd(), relativePath), 'utf8')
}

describe('Patient store UTF-8 encoding', () => {
  const store = source(
    'src/modules/patients/stores/patients.store.js',
  )

  it('ne conserve aucun marqueur de mojibake connu', () => {
    const forbiddenCodePoints = [
      0x00c3,
      0x0083,
      0x00c2,
      0x0097,
      0x00a9,
      0x00a8,
      0x00a0,
    ]

    for (const codePoint of forbiddenCodePoints) {
      expect(store).not.toContain(String.fromCodePoint(codePoint))
    }
  })

  it('conserve les caracteres UTF-8 attendus', () => {
    expect(store).toContain(String.fromCodePoint(0x2014))
    expect(store).toContain(String.fromCodePoint(0x00e9))
    expect(store).toContain(String.fromCodePoint(0x00e8))
    expect(store).toContain(String.fromCodePoint(0x00e0))
  })
})