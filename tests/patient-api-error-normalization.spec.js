import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

function source(relativePath) {
  return fs.readFileSync(path.join(cwd(), relativePath), 'utf8')
}

describe('Patient API normalized error contract', () => {
  const patientFiles = [
    'src/modules/patients/stores/patients.store.js',
    'src/modules/patients/pages/PatientCreatePage.vue',
    'src/modules/patients/pages/PatientEditPage.vue',
    'src/modules/patients/pages/PatientDetailsPage.vue',
    'src/modules/patients/pages/PatientsListPage.vue',
  ]

  it('consomme error.message au lieu du payload Axios brut', () => {
    for (const file of patientFiles) {
      const content = source(file)

      expect(content).not.toContain('response?.data')
      expect(content).toMatch(/\b(?:error|err)\?\.message/)
    }
  })

  it('reste aligné avec le normalizer global de l’API', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toMatch(/function normalizeApiError\(error\)/)
    expect(api).toMatch(/message:\s*[\s\S]*response\?\.data\?\.message/)
    expect(api).toMatch(/return Promise\.reject\(normalized\)/)
  })
})