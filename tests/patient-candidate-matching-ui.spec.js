import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

function source(relativePath) {
  return fs.readFileSync(path.join(cwd(), relativePath), 'utf8')
}

describe('Patient candidate matching UI', () => {
  const page = source(
    'src/modules/patients/pages/PatientCreatePage.vue',
  )
  const store = source(
    'src/modules/patients/stores/patients.store.js',
  )

  it('intercepte les deux conflits de matching Patient normalisés', () => {
    expect(page).toContain('PATIENT_DUPLICATE_SUSPECTED')
    expect(page).toContain('PATIENT_DUPLICATE_RECHECK_REQUIRED')
    expect(page).toMatch(/error\?\.details\?\.matches/)
  })

  it('affiche les candidats et permet d’utiliser une fiche existante', () => {
    expect(page).toContain('Correspondances possibles détectées')
    expect(page).toContain('v-for="match in possibleMatches"')
    expect(page).toContain('patientFullName(match)')
    expect(page).toContain('Utiliser cette fiche')
    expect(page).toMatch(
      /router\.push\(`\/patients\/\$\{match\.id\}`\)/,
    )
  })

  it('exige une confirmation explicite avant CREATE_NEW', () => {
    expect(page).toContain('Aucune de ces fiches ne correspond')
    expect(page).toContain("action: 'CREATE_NEW'")
    expect(page).toContain(
      "confirmation: 'AUCUNE_CORRESPONDANCE'",
    )
    expect(page).toContain('candidateIds')
    expect(page).toContain('require-text="CONFIRMER"')
  })

  it('réutilise exactement les candidats présentés lors de la confirmation', () => {
    expect(page).toMatch(
      /possibleMatches\.value[\s\S]*?map\(\(match\) => String\(match\.id\)\)/,
    )
    expect(page).toMatch(
      /duplicateResolution:\s*\{[\s\S]*?candidateIds/,
    )
  })

  it('ne transforme pas les conflits de matching en toast générique dans le store', () => {
    expect(store).toContain('handledByCandidateMatching')
    expect(store).toContain('PATIENT_DUPLICATE_SUSPECTED')
    expect(store).toContain('PATIENT_DUPLICATE_RECHECK_REQUIRED')
    expect(store).toMatch(
      /if\s*\(!handledByCandidateMatching\)\s*\{\s*toast\.error\(message\)/,
    )
  })
})