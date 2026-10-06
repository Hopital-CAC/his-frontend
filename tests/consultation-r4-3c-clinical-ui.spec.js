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
  'R4.3C — formulaire clinique médecin',
  () => {
    it(
      'appelle uniquement le PATCH clinique officiel',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        expect(service).toMatch(
          /api\.patch\(\s*`\/consultations\/\$\{id\}\/clinical`/,
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
      'normalise medicalHistory et updatedAt',
      () => {
        const store = source(
          'src/modules/consultations/stores/consultations.store.js',
        )

        expect(store).toContain(
          'raw.medicalHistory',
        )
        expect(store).toContain(
          "['updatedAt', 'updated_at']",
        )
        expect(store).toContain(
          'savingClinical',
        )
        expect(store).toContain(
          'async updateClinical(id, payload)',
        )
      },
    )

    it(
      'limite le formulaire aux cinq champs autorisés',
      () => {
        const form = source(
          'src/modules/consultations/components/ConsultationClinicalForm.vue',
        )

        for (const field of [
          'illnessHistory',
          'medicalHistory',
          'clinicalExam',
          'provisionalDiagnosis',
          'treatmentPlan',
        ]) {
          expect(form).toContain(field)
        }

        expect(form).not.toContain(
          'finalDiagnosis',
        )
        expect(form).not.toContain(
          'closedAt',
        )
        expect(form).not.toContain(
          'doctorUserId',
        )
      },
    )

    it(
      'garde le motif principal en lecture seule',
      () => {
        const form = source(
          'src/modules/consultations/components/ConsultationClinicalForm.vue',
        )

        expect(form).toContain(
          'Motif principal',
        )
        expect(form).toMatch(
          /consultation\.plaintes[\s\S]*disabled/,
        )
      },
    )

    it(
      'n’expose qu’un CTA clinique principal',
      () => {
        const form = source(
          'src/modules/consultations/components/ConsultationClinicalForm.vue',
        )

        expect(form).toContain(
          'Enregistrer les informations cliniques',
        )
        expect(form).not.toContain(
          'Clôturer',
        )
        expect(form).not.toContain(
          'Valider définitivement',
        )
        expect(form).not.toContain(
          'Prescrire',
        )
      },
    )

    it(
      'gère explicitement le conflit de version sans écrasement',
      () => {
        const form = source(
          'src/modules/consultations/components/ConsultationClinicalForm.vue',
        )
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(form).toContain(
          'Le dossier a changé depuis son chargement.',
        )
        expect(form).toContain(
          'Actualiser le dossier',
        )
        expect(page).toContain(
          'isClinicalVersionConflict',
        )
      },
    )

    it(
      'réserve la saisie au profil clinique autorisé',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'canEditClinicalConsultation',
        )
        expect(page).toContain(
          ':editable="canEditClinical"',
        )
      },
    )

    it(
      'sépare la saisie clinique de la clôture explicite',
      () => {
        const form = source(
          'src/modules/consultations/components/ConsultationClinicalForm.vue',
        )
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(form).not.toContain(
          'finalDiagnosis',
        )
        expect(form).not.toContain(
          'Clôturer la consultation',
        )
        expect(page).toContain(
          'ConsultationCloseDrawer',
        )
        expect(page).toContain(
          'canCloseConsultation',
        )
      },
    )
  },
)
