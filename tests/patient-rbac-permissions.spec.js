import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

function source(relativePath) {
  return fs.readFileSync(path.join(cwd(), relativePath), 'utf8')
}

describe('RBAC frontend Patient', () => {
  const router = source('src/app/router/index.js')
  const sidebar = source('src/shared/ui/layout/Sidebar.vue')

  it('protège la liste et le détail par patient:read', () => {
    expect(router).toMatch(
      /name:\s*'patients'[\s\S]*?permission:\s*'patient:read'/,
    )
    expect(router).toMatch(
      /name:\s*'patients\.details'[\s\S]*?permission:\s*'patient:read'/,
    )
  })

  it('protège la création par patient:create', () => {
    expect(router).toMatch(
      /name:\s*'patients\.create'[\s\S]*?permission:\s*'patient:create'/,
    )
  })

  it('protège la modification par patient:update', () => {
    expect(router).toMatch(
      /name:\s*'patients\.edit'[\s\S]*?permission:\s*'patient:update'/,
    )
  })

  it('masque l’entrée Patients sans patient:read', () => {
    expect(sidebar).toMatch(
      /label:\s*["']Patients["'][\s\S]*?permission:\s*["']patient:read["']/,
    )
  })
})
