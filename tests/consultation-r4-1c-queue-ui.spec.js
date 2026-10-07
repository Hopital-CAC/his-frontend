import process from 'node:process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R4.1C — interface de la file médicale', () => {
  it('appelle le nouvel endpoint de file', () => {
    const service = source(
      'src/modules/consultations/services/consultations.service.js',
    )

    expect(service).toMatch(
      /api\.get\(\s*['"]\/consultations\/queue['"]/,
    )
    expect(service).toContain('priority: params.priority')
    expect(service).toContain('serviceId: params.serviceId')
  })

  it('centralise la normalisation et la pagination dans Pinia', () => {
    const store = source(
      'src/modules/consultations/stores/consultation-queue.store.js',
    )

    expect(store).toContain("defineStore(")
    expect(store).toContain("'consultationQueue'")
    expect(store).toContain('normalizeQueuePayload')
    expect(store).toContain('hasNext: page * limit < count')
    expect(store).toContain('patientDisplayName')
  })

  it('affiche les priorités selon les tokens sémantiques', () => {
    const table = source(
      'src/modules/consultations/components/ConsultationQueueTable.vue',
    )

    expect(table).toContain("VITALE: 'emergency'")
    expect(table).toContain("TRES_URGENT: 'danger'")
    expect(table).toContain("URGENT: 'warning'")
    expect(table).toContain("ROUTINE: 'neutral'")
  })

  it('affiche table desktop et cartes mobiles', () => {
    const table = source(
      'src/modules/consultations/components/ConsultationQueueTable.vue',
    )

    expect(table).toContain('class="hidden')
    expect(table).toContain('lg:block')
    expect(table).toContain('lg:hidden')
    expect(table).toContain('Consulter le triage')
  })

  it('présente la file comme une page en lecture seule', () => {
    const page = source(
      'src/modules/consultations/pages/ConsultationDashboardPage.vue',
    )

    expect(page).toContain('File d’attente médicale')
    expect(page).toContain('Historique')
    expect(page).toContain(
      'Commencer une consultation exige une',
    )
    expect(page).not.toContain('Nouvelle consultation')
  })

  it('conserve la recherche, le filtre et la pagination', () => {
    const page = source(
      'src/modules/consultations/pages/ConsultationDashboardPage.vue',
    )

    expect(page).toContain('v-model="store.filters.q"')
    expect(page).toContain('v-model="store.filters.priority"')
    expect(page).toContain('goToPage')
    expect(page).toContain('Réinitialiser')
  })
})
