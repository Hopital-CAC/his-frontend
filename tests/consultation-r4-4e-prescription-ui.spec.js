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
  'R4.4E — interface prescription',
  () => {
    it(
      'appelle exclusivement le nouvel endpoint consultation',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        expect(service).toMatch(
          /api\.post\(\s*`\/consultations\/\$\{id\}\/prescriptions`/,
        )
        expect(service).not.toContain(
          "api.post('/prescriptions'",
        )
      },
    )

    it(
      'gère un état de création dédié dans le store',
      () => {
        const store = source(
          'src/modules/consultations/stores/consultations.store.js',
        )

        expect(store).toContain(
          'creatingPrescription',
        )
        expect(store).toContain(
          'async createPrescription(id, payload)',
        )
      },
    )

    it(
      'utilise Drawer et le design system',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationPrescriptionDrawer.vue',
        )

        expect(component).toContain(
          "@/shared/ui/overlay/Drawer.vue",
        )
        expect(component).toContain(
          'BaseInput',
        )
        expect(component).toContain(
          'BaseTextarea',
        )
        expect(component).toContain(
          'BaseButton',
        )
      },
    )

    it(
      'permet plusieurs lignes avec ajout et retrait',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationPrescriptionDrawer.vue',
        )

        expect(component).toContain(
          'Ajouter un médicament',
        )
        expect(component).toContain(
          'removeLine(index)',
        )
        expect(component).toContain(
          'v-for="(line, index) in form.lines"',
        )
      },
    )

    it(
      'ne demande aucun identifiant métier au médecin',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationPrescriptionDrawer.vue',
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
        expect(component).not.toContain(
          'v-model="form.doctorUserId"',
        )
      },
    )

    it(
      'exige le ConfirmDialog et CONFIRMER',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'title="Confirmer la prescription"',
        )
        expect(page).toContain(
          'require-text="CONFIRMER"',
        )
        expect(page).toContain(
          'confirm-text="Valider la prescription"',
        )
        expect(page).toContain(
          'variant="success"',
        )
      },
    )

    it(
      'bloque la prescription en cas de modifications cliniques locales',
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
      },
    )

    it(
      'maintient un seul CTA principal visible',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'variant="secondary"'
        )
        expect(page).toContain(
          'Demander des examens'
        )
        expect(page).toContain(
          'Prescrire'
        )
      },
    )

    it(
      'maintient la prescription indépendante de la clôture',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationPrescriptionDrawer.vue',
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
          'Clôturer la consultation',
        )
      },
    )
  },
)
