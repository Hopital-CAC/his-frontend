import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('Phase 10 Exams — operational role aliases', () => {
  const router = read('src/app/router/index.js')
  const sidebar = read('src/shared/ui/layout/Sidebar.vue')
  const defaultRoute = read('src/shared/rbac/default-route.js')
  const labDetails = read(
    'src/modules/laboratoire/pages/LaboratoireDetailsPage.vue',
  )

  it('autorise tous les rôles opérationnels laboratoire dans le routage', () => {
    expect(router).toContain(
      "roles: ['admin', 'laborantin', 'lab_technician', 'lab_biologist']",
    )
  })

  it('autorise tous les rôles opérationnels imagerie dans le routage', () => {
    expect(router).toContain(
      "roles: ['admin', 'imagerie', 'radiology_technician', 'radiologist']",
    )
  })

  it('expose les alias opérationnels dans la navigation', () => {
    expect(sidebar).toContain(
      'roles: ["admin", "laborantin", "lab_technician", "lab_biologist"]',
    )
    expect(sidebar).toContain(
      'roles: ["admin", "imagerie", "radiology_technician", "radiologist"]',
    )
  })

  it('redirige chaque alias vers son espace métier', () => {
    expect(defaultRoute).toMatch(
      /lab_technician:\s*\{[\s\S]*?path:\s*"\/laboratoire\/dashboard"/,
    )
    expect(defaultRoute).toMatch(
      /lab_biologist:\s*\{[\s\S]*?path:\s*"\/laboratoire\/dashboard"/,
    )
    expect(defaultRoute).toMatch(
      /radiology_technician:\s*\{[\s\S]*?path:\s*"\/imagerie"/,
    )
    expect(defaultRoute).toMatch(
      /radiologist:\s*\{[\s\S]*?path:\s*"\/imagerie"/,
    )
  })

  it('autorise les rôles laboratoire à valider un résultat selon la permission', () => {
    expect(labDetails).toContain(
      "['admin', 'laborantin', 'lab_technician', 'lab_biologist'].includes(role)",
    )
    expect(labDetails).toContain(
      "auth.hasPermission('examen:update_result')",
    )
  })
})