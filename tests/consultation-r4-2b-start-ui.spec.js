import process from 'node:process'
import {
  readFileSync,
} from 'node:fs'
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
  ).replace(/\r\n?/g, '\n')
}

describe(
  'R4.2B — interface de démarrage Consultation',
  () => {
    it(
      'appelle le nouvel endpoint transactionnel',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        expect(service).toContain(
          "api.post(\n      '/consultations/start'",
        )
        expect(service).not.toContain(
          "api.post('/consultations', payload)",
        )
        expect(service).not.toContain(
          'async update(',
        )
        expect(service).not.toContain(
          'async remove(',
        )
      },
    )

    it(
      'gère l’ouverture et retire le patient de la file',
      () => {
        const store = source(
          'src/modules/consultations/stores/consultation-queue.store.js',
        )

        expect(store).toContain(
          'async startConsultation(item)',
        )
        expect(store).toContain(
          'startingEpisodeId',
        )
        expect(store).toContain(
          'createConsultationStartPayload',
        )
        expect(store).toContain(
          'this.items = this.items.filter',
        )
        expect(store).toContain(
          'this.pagination.count - 1',
        )
      },
    )

    it(
      'affiche un seul CTA principal par patient',
      () => {
        const table = source(
          'src/modules/consultations/components/ConsultationQueueTable.vue',
        )

        expect(table).toContain(
          'Commencer la consultation',
        )
        expect(table).toContain(
          'v-if="canStart"',
        )
        expect(table).toContain(
          "defineEmits(['start'])",
        )
        expect(table).toContain(
          'variant="secondary"',
        )
      },
    )

    it(
      'utilise ConfirmDialog avec contexte patient et CONFIRMER',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDashboardPage.vue',
        )

        expect(page).toContain(
          'ConfirmDialog',
        )
        expect(page).toContain(
          'title="Commencer la consultation médicale"',
        )
        expect(page).toContain(
          'require-text="CONFIRMER"',
        )
        expect(page).toContain(
          ':patient-name=',
        )
        expect(page).toContain(
          ':patient-id=',
        )
        expect(page).toContain(
          ':consequence="startConsequence"',
        )
        expect(page).toContain(
          'variant="primary"',
        )
      },
    )

    it(
      'réserve le CTA au médecin autorisé',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDashboardPage.vue',
        )

        expect(page).toContain(
          'canStartConsultation(auth)',
        )
        expect(page).toContain(
          ':can-start="canStart"',
        )
        expect(page).toContain(
          'Cette file est en lecture seule pour',
        )
      },
    )

    it(
      'ouvre le détail après succès sans exposer les actions futures',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDashboardPage.vue',
        )
        const details = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          "name: 'consultations.details'",
        )
        expect(details).toContain(
          'La consultation est en cours.',
        )
        expect(details).not.toContain(
          'Modifier consultation',
        )
        expect(details).not.toContain(
          'Demander laboratoire',
        )
        expect(details).not.toContain(
          'Prescrire médicaments',
        )
      },
    )

    it(
      'reconnaît EN_COURS, CLOTUREE et ANNULEE',
      () => {
        const badge = source(
          'src/modules/consultations/components/ConsultationStatusBadge.vue',
        )

        expect(badge).toContain(
          "en_cours: 'En cours'",
        )
        expect(badge).toContain(
          "cloturee: 'Clôturée'",
        )
        expect(badge).toContain(
          "annulee: 'Annulée'",
        )
      },
    )

    it(
      'normalise le contrat officiel du backend',
      () => {
        const store = source(
          'src/modules/consultations/stores/consultations.store.js',
        )

        expect(store).toMatch(
          /['"]patientCode['"]\s*,\s*['"]numero_patient['"]\s*,\s*['"]numeroPatient['"]/,
        )
        expect(store).toContain(
          'raw.chiefComplaint',
        )
        expect(store).toContain(
          'raw.finalDiagnosis',
        )
        expect(store).toContain(
          'payload?.item',
        )
        expect(store).toContain(
          'consultation_code',
        )
        expect(store).toContain(
          'normalizeSingleResponse',
        )
        expect(store).not.toContain(
          'async createConsultation(',
        )
        expect(store).not.toContain(
          'async updateConsultation(',
        )
        expect(store).not.toContain(
          'async removeConsultation(',
        )
        expect(store).not.toContain(
          'statusBroadcastService',
        )
      },
    )
  },
)
