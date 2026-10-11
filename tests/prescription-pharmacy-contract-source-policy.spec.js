import process from 'node:process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  describe,
  expect,
  it,
} from 'vitest'

function source(path) {
  return readFileSync(
    resolve(process.cwd(), path),
    'utf8',
  )
}

describe(
  'prescription pharmacy frontend contract',
  () => {
    it(
      'conserve les routes canoniques de lecture prescription',
      () => {
        const service = source(
          'src/modules/pharmacie/services/pharmacie.service.js',
        )

        expect(service).toContain(
          "api.get('/prescriptions'",
        )

        expect(service).toContain(
          'api.get(`/prescriptions/${id}`)',
        )

        expect(service).not.toContain(
          "api.get('/pharmacie'",
        )

        expect(service).not.toContain(
          'api.get(`/pharmacie/${id}`)',
        )
      },
    )

    it(
      'active les routes canoniques Phase 12 de dispensation',
      () => {
        const service = source(
          'src/modules/pharmacie/services/pharmacie.service.js',
        )

        expect(service).toContain(
          "api.get('/pharmacie/dispenses'",
        )

        expect(service).toContain(
          "'/pharmacie/serve-prescription'",
        )

        expect(service).toContain(
          'async listDispenses(',
        )

        expect(service).toContain(
          'async servePrescription(',
        )
      },
    )

    it(
      'conserve la création médicale exclusivement côté consultation',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        const store = source(
          'src/modules/consultations/stores/consultations.store.js',
        )

        expect(service).toContain(
          'async createPrescription(id, payload)',
        )

        expect(service).toContain(
          '`/consultations/${id}/prescriptions`',
        )

        expect(store).toContain(
          'async createPrescription(id, payload)',
        )
      },
    )

    it(
      'utilise les statuts canoniques du backend',
      () => {
        const badge = source(
          'src/modules/pharmacie/components/PharmacieStatusBadge.vue',
        )

        const search = source(
          'src/modules/pharmacie/components/PharmacieSearchBar.vue',
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

        expect(badge).toContain(
          'PRESCRITE',
        )
      },
    )

    it(
      'branche le store sur les quantités réellement servies',
      () => {
        const store = source(
          'src/modules/pharmacie/stores/pharmacie.store.js',
        )

        expect(store).toContain(
          'servedQuantityByLine',
        )

        expect(store).toContain(
          'quantityServed',
        )

        expect(store).toContain(
          'prescriptionLineId',
        )

        expect(store).toContain(
          'async fetchDispenses(',
        )

        expect(store).toContain(
          'async servePrescription(payload)',
        )
      },
    )

    it(
      'protège la dispensation par permission et confirmation explicite',
      () => {
        const policy = source(
          'src/modules/pharmacie/policies/pharmacie-dispensation-ui.policy.js',
        )

        const details = source(
          'src/modules/pharmacie/pages/PharmacieDetailsPage.vue',
        )

        expect(policy).toContain(
          "auth.hasPermission('pharmacie:serve_prescription')",
        )

        expect(policy).toContain(
          "'EN_PHARMACIE'",
        )

        expect(details).toContain(
          'Délivrer cette prescription',
        )

        expect(details).toContain(
          'title="Confirmer la dispensation"',
        )

        expect(details).toContain(
          'require-text="CONFIRMER"',
        )
      },
    )

    it(
      'n’introduit pas de CRUD prescription pharmacie historique',
      () => {
        const service = source(
          'src/modules/pharmacie/services/pharmacie.service.js',
        )

        const store = source(
          'src/modules/pharmacie/stores/pharmacie.store.js',
        )

        const router = source(
          'src/app/router/index.js',
        )

        expect(service).not.toContain(
          'api.patch(`/pharmacie/${id}`',
        )

        expect(service).not.toContain(
          'api.delete(`/pharmacie/${id}`',
        )

        expect(store).not.toContain(
          'async createPrescription(',
        )

        expect(store).not.toContain(
          'async updatePrescription(',
        )

        expect(store).not.toContain(
          'async removePrescription(',
        )

        expect(router).not.toContain(
          'PharmacieCreatePage',
        )

        expect(router).not.toContain(
          'PharmacieEditPage',
        )
      },
    )
  },
)
