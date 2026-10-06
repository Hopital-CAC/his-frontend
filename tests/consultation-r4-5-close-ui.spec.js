import {
  readFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import {
  describe,
  expect,
  it,
} from 'vitest'

function source(path) {
  return readFileSync(
    resolve(process.cwd(), path),
    'utf8',
  ).replace(/\r\n/g, '\n')
}

describe(
  'R4.5 — interface clôture Consultation',
  () => {
    it(
      'utilise Drawer BaseTextarea BaseSelect et BaseButton',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationCloseDrawer.vue',
        )

        expect(component).toContain(
          "@/shared/ui/overlay/Drawer.vue",
        )
        expect(component).toContain(
          'BaseTextarea',
        )
        expect(component).toContain(
          'BaseSelect',
        )
        expect(component).toContain(
          'BaseButton',
        )
      },
    )

    it(
      'demande seulement diagnostic final et décision',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationCloseDrawer.vue',
        )

        expect(component).toContain(
          'form.finalDiagnosis',
        )
        expect(component).toContain(
          'form.decision',
        )

        for (const forbidden of [
          'v-model="form.patientId"',
          'v-model="form.episodeId"',
          'v-model="form.consultationId"',
          'v-model="form.doctorUserId"',
        ]) {
          expect(component).not.toContain(
            forbidden,
          )
        }
      },
    )

    it(
      'construit le brouillon avec la policy officielle',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationCloseDrawer.vue',
        )

        expect(component).toContain(
          'consultationCloseDecisionOptions',
        )
        expect(component).toContain(
          'createConsultationCloseDraft',
        )
        expect(component).toContain(
          "'review'",
        )
      },
    )

    it(
      'réserve le CTA à canCloseConsultation',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'canCloseConsultation',
        )
        expect(page).toContain(
          'v-if="canClose"',
        )
        expect(page).toContain(
          ':disabled="closeDisabled"',
        )
      },
    )

    it(
      'bloque la clôture pendant une modification clinique locale',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'clinicalDirty.value',
        )
        expect(page).toContain(
          'Enregistrez d’abord les modifications',
        )
        expect(page).toContain(
          'avant de clôturer',
        )
      },
    )

    it(
      'confirme explicitement la clôture avec CONFIRMER',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'title="Confirmer la clôture"',
        )
        expect(page).toContain(
          'confirm-text="Clôturer la consultation"',
        )
        expect(page).toContain(
          'require-text="CONFIRMER"',
        )
        expect(page).toContain(
          'variant="danger"',
        )
      },
    )

    it(
      'ajoute confirmationAcknowledged seulement lors de la confirmation',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )
        const policy = source(
          'src/modules/consultations/policies/consultation-close-ui.policy.js',
        )

        expect(page).toContain(
          'createConfirmedConsultationClose',
        )
        expect(page).toContain(
          'await store.closeConsultation(',
        )
        expect(policy).toContain(
          'confirmationAcknowledged: true',
        )
      },
    )

    it(
      'gère explicitement le conflit de version',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'isConsultationCloseVersionConflict',
        )
        expect(page).toContain(
          'closeVersionConflict',
        )
        expect(page).toContain(
          'Actualiser le dossier',
        )
      },
    )

    it(
      'sérialise les autres actions pendant la clôture',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'store.closingConsultation',
        )
        expect(page).toMatch(
          /examenRequestDisabled[\s\S]*store\.closingConsultation/,
        )
        expect(page).toMatch(
          /prescriptionDisabled[\s\S]*store\.closingConsultation/,
        )
      },
    )

    it(
      'affiche le résultat final en lecture seule après clôture',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'Diagnostic final',
        )
        expect(page).toContain(
          'Décision finale',
        )
        expect(page).toContain(
          'consultation.closed_at',
        )
        expect(page).toContain(
          'consultationCloseDecisionLabel',
        )
      },
    )
  },
)