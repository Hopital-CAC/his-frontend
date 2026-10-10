import process from 'node:process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('prescription pharmacy frontend contract', () => {
  it('utilise les routes canoniques de lecture prescription', () => {
    const service = source('src/modules/pharmacie/services/pharmacie.service.js')

    expect(service).toContain("api.get('/prescriptions'")
    expect(service).toContain('api.get(`/prescriptions/${id}`)')

    expect(service).not.toContain("api.get('/pharmacie'")
    expect(service).not.toContain('api.get(`/pharmacie/${id}`)')
  })

  it('supprime les mutations pharmacie historiques non supportées', () => {
    const service = source('src/modules/pharmacie/services/pharmacie.service.js')
    const store = source('src/modules/pharmacie/stores/pharmacie.store.js')
    const router = source('src/app/router/index.js')
    const dashboard = source(
      'src/modules/pharmacie/pages/PharmacieDashboardPage.vue',
    )

    expect(service).not.toContain("api.post('/pharmacie'")
    expect(service).not.toContain('api.patch(`/pharmacie/${id}`')
    expect(service).not.toContain('api.delete(`/pharmacie/${id}`')

    expect(store).not.toContain('async createPrescription(')
    expect(store).not.toContain('async updatePrescription(')
    expect(store).not.toContain('async removePrescription(')

    expect(router).not.toContain('PharmacieCreatePage')
    expect(router).not.toContain('PharmacieEditPage')
    expect(router).not.toContain("path: 'pharmacie/create'")
    expect(router).not.toContain("path: 'pharmacie/:id/edit'")

    expect(dashboard).not.toContain('/pharmacie/create')
  })

  it('conserve la création médicale depuis la consultation', () => {
    const service = source(
      'src/modules/consultations/services/consultations.service.js',
    )
    const store = source(
      'src/modules/consultations/stores/consultations.store.js',
    )

    expect(service).toContain('async createPrescription(id, payload)')
    expect(service).toContain('`/consultations/${id}/prescriptions`')
    expect(store).toContain('async createPrescription(id, payload)')
  })

  it('utilise les statuts canoniques du backend', () => {
    const badge = source(
      'src/modules/pharmacie/components/PharmacieStatusBadge.vue',
    )
    const search = source(
      'src/modules/pharmacie/components/PharmacieSearchBar.vue',
    )
    const details = source(
      'src/modules/pharmacie/pages/PharmacieDetailsPage.vue',
    )

    for (const status of [
      'VALIDEE',
      'SERVIE',
      'PARTIELLEMENT_SERVIE',
      'ANNULEE',
    ]) {
      expect(badge).toContain(status)
      expect(search).toContain(status)
    }

    expect(badge).toContain('PRESCRITE')
    expect(details).toContain(
      '<PharmacieStatusBadge :statut="item.status" />',
    )
  })

  it('n’embarque aucune dispensation Phase 12', () => {
    const service = source('src/modules/pharmacie/services/pharmacie.service.js')
    const store = source('src/modules/pharmacie/stores/pharmacie.store.js')
    const list = source(
      'src/modules/pharmacie/pages/PharmacieListPage.vue',
    )
    const table = source(
      'src/modules/pharmacie/components/PharmacieTable.vue',
    )

    expect(service).not.toContain('/pharmacie/dispenses')
    expect(service).not.toContain('/pharmacie/serve-prescription')
    expect(service).not.toContain('listDispenses')
    expect(service).not.toContain('servePrescription')

    expect(store).not.toContain('deliverPrescription')
    expect(store).not.toContain('servedQuantityByLine')
    expect(store).not.toContain('quantityServed')
    expect(store).not.toContain('prescriptionLineId')

    expect(list).not.toContain('pharmacie:serve_prescription')
    expect(list).not.toContain('Délivrer cette prescription')
    expect(table).not.toContain('Délivrer')
    expect(table).not.toContain('canDeliver')
  })
})
