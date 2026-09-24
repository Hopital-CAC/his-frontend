import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

function source(relativePath) {
  return fs.readFileSync(path.join(cwd(), relativePath), 'utf8')
}

describe('Patient archive semantics UI policy', () => {
  const service = source(
    'src/modules/patients/services/patients.service.js',
  )
  const store = source(
    'src/modules/patients/stores/patients.store.js',
  )
  const listPage = source(
    'src/modules/patients/pages/PatientsListPage.vue',
  )
  const table = source(
    'src/modules/patients/components/PatientTable.vue',
  )

  it('nomme DELETE /patients/:id comme une opération archive', () => {
    expect(service).toMatch(/async archive\(id\)/)
    expect(service).toMatch(/api\.delete\(`\/patients\/\$\{id\}`\)/)
    expect(service).not.toMatch(/async deactivate\(id\)/)
  })

  it('archive le patient avec le statut et l’action métier corrects', () => {
    expect(store).toMatch(/async archivePatient\(id\)/)
    expect(store).toMatch(/patientsService\.archive\(id\)/)
    expect(store).toMatch(/status:\s*HIS_STATUSES\.ARCHIVED/)
    expect(store).toMatch(/action:\s*'PATIENT_ARCHIVED'/)
    expect(store).toMatch(/archiving:\s*false/)
    expect(store).not.toMatch(/PATIENT_DEACTIVATED/)
    expect(store).not.toMatch(/HIS_STATUSES\.DELETED/)
  })

  it('présente l’action comme archivage dans la liste patient', () => {
    expect(listPage).toMatch(/@archive="askArchive"/)
    expect(listPage).toMatch(/store\.archivePatient/)
    expect(listPage).toMatch(/title="Archiver ce patient"/)
    expect(listPage).toMatch(/confirm-label="Archiver patient"/)
    expect(listPage).toMatch(/:loading="store\.archiving"/)
    expect(listPage).not.toMatch(/Désactiver/)
  })

  it('émet archive depuis le tableau patient', () => {
    expect(table).toMatch(/defineEmits\(\['archive'\]\)/)
    expect(table).toMatch(/\$emit\('archive', patient\)/)
    expect(table).toMatch(/>\s*Archiver\s*</)
    expect(table).not.toMatch(/deactivate/)
    expect(table).not.toMatch(/Désactiver/)
  })
})