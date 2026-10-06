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
  )
}

describe(
  'R4.4C — interface demande examen',
  () => {
    it(
      'appelle uniquement le nouvel endpoint consultation',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        expect(service).toMatch(
          /api\.post\(\s*`\/consultations\/\$\{id\}\/examens\/batch`/,
        )
        expect(service).not.toContain(
          "api.post('/examens'",
        )
      },
    )

    it(
      'utilise le store pour la demande',
      () => {
        const store = source(
          'src/modules/consultations/stores/consultations.store.js',
        )

        expect(store).toContain(
          'requestingExamen',
        )
        expect(store).toContain(
          'async requestExamen(id, payload)',
        )
      },
    )

    it(
      'utilise Drawer et les composants du design system',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationExamRequestDrawer.vue',
        )

        expect(component).toContain(
          "@/shared/ui/overlay/Drawer.vue",
        )
        expect(component).toContain(
          'BaseSelect',
        )
        expect(component).toContain(
          'BaseInput',
        )
        expect(component).toContain(
          'BaseTextarea',
        )
      },
    )

    it(
      'ne demande pas les identifiants patient épisode ou consultation',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationExamRequestDrawer.vue',
        )

        expect(component).not.toContain(
          'v-model="form.patientId"',
        )
        expect(component).not.toContain(
          'v-model="form.episodeId"',
        )
        expect(component).not.toContain(
          'v-model="form.consultationId"',
        )
      },
    )

    it(
      'exige un ConfirmDialog avec CONFIRMER',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'ConfirmDialog',
        )
        expect(page).toContain(
          'require-text="CONFIRMER"',
        )
        expect(page).toContain(
          'Demander les examens',
        )
      },
    )

    it(
      'empêche la demande si des données cliniques ne sont pas enregistrées',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )
        const form = source(
          'src/modules/consultations/components/ConsultationClinicalForm.vue',
        )

        expect(page).toContain(
          'clinicalDirty',
        )
        expect(page).toContain(
          'Enregistrez d’abord les modifications',
        )
        expect(form).toContain(
          "'dirty-change'",
        )
      },
    )

    it(
      'aligne l’édition clinique sur EN_CONSULTATION',
      () => {
        const policy = source(
          'src/modules/consultations/policies/consultation-clinical-ui.policy.js',
        )

        expect(policy).toContain(
          "episodeStatus === 'EN_CONSULTATION'",
        )
      },
    )

    it(
      'réserve le CTA au médecin autorisé',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'canRequestConsultationExamen',
        )
        expect(page).toContain(
          'v-if="canRequestExamen"',
        )
      },
    )
    it(
      'maintient la demande examen indépendante de la clôture',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationExamRequestDrawer.vue',
        )
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(component).not.toContain(
          'finalDiagnosis',
        )
        expect(component).not.toContain(
          'consultation:close',
        )
        expect(page).toContain(
          'ConsultationCloseDrawer',
        )
        expect(page).toContain(
          'Demander des examens',
        )
      },
    )
  },
)
