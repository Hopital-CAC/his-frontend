import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

function source(relativePath) {
  return fs.readFileSync(path.join(cwd(), relativePath), 'utf8')
}

describe('Patient archived status UI policy', () => {
  const patientForm = source(
    'src/modules/patients/components/PatientForm.vue',
  )

  it('ne propose pas ARCHIVED dans le formulaire patient générique', () => {
    expect(patientForm).not.toMatch(
      /label:\s*['"]Archivé['"]\s*,\s*value:\s*['"]archived['"]/,
    )
  })

  it('conserve les statuts modifiables ACTIVE et INACTIVE', () => {
    expect(patientForm).toMatch(
      /label:\s*['"]Actif['"]\s*,\s*value:\s*['"]active['"]/,
    )
    expect(patientForm).toMatch(
      /label:\s*['"]Inactif['"]\s*,\s*value:\s*['"]inactive['"]/,
    )
  })

  it('continue de normaliser le statut envoyé à l’API', () => {
    expect(patientForm).toMatch(
      /status:\s*String\(form\.statut\s*\|\|\s*['"]ACTIVE['"]\)\.toUpperCase\(\)/,
    )
  })
})