import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('Phase 10 - stale exam creation workflow policy', () => {
  it('does not expose patient actions toward removed exam create routes', () => {
    const source = read(
      'src/modules/patients/pages/PatientDetailsPage.vue',
    )

    expect(source).not.toContain('/laboratoire/create')
    expect(source).not.toContain('/imagerie/create')
  })

  it('does not register standalone laboratory or imaging create routes', () => {
    const source = read('src/app/router/index.js')

    expect(source).not.toContain('laboratoire/create')
    expect(source).not.toContain('imagerie/create')
    expect(source).not.toContain('LaboratoireCreatePage')
    expect(source).not.toContain('ImagerieCreatePage')
  })

  it('does not keep unreachable standalone exam create pages', () => {
    expect(
      fs.existsSync(
        path.join(
          root,
          'src/modules/laboratoire/pages/LaboratoireCreatePage.vue',
        ),
      ),
    ).toBe(false)

    expect(
      fs.existsSync(
        path.join(
          root,
          'src/modules/imagerie/pages/ImagerieCreatePage.vue',
        ),
      ),
    ).toBe(false)
  })

  it('keeps exam creation owned by the consultation workflow', () => {
    const policy = read(
      'src/modules/consultations/policies/consultation-examen-request-ui.policy.js',
    )

    expect(policy).toContain("auth.hasPermission('examen:create')")
    expect(policy).toContain('createConfirmedExamenRequest')
    expect(policy).toContain('createConfirmedExamenBatch')
  })

  it('keeps operational laboratory creation explicitly disabled', () => {
    const service = read(
      'src/modules/laboratoire/services/laboratoire.service.js',
    )

    expect(service).toContain('async create()')
    expect(service).toContain(
      'La création d’un examen est réservée à la consultation médicale.',
    )
  })
})