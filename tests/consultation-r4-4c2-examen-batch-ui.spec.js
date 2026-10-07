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
  )
}

describe(
  'R4.4C2 — interface lots examens',
  () => {
    it(
      'utilise le endpoint batch',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        expect(service).toContain(
          '/examens/batch',
        )
      },
    )

    it(
      'permet ajout et retrait de lignes',
      () => {
        const drawer = source(
          'src/modules/consultations/components/ConsultationExamRequestDrawer.vue',
        )

        expect(drawer).toContain(
          'Ajouter un examen',
        )
        expect(drawer).toContain(
          'removeItem(index)',
        )
        expect(drawer).toContain(
          'v-for="(item, index) in form.items"',
        )
      },
    )

    it(
      'conserve les champs type nom indication par examen',
      () => {
        const drawer = source(
          'src/modules/consultations/components/ConsultationExamRequestDrawer.vue',
        )

        expect(drawer).toContain(
          'v-model="item.type"',
        )
        expect(drawer).toContain(
          'v-model="item.name"',
        )
        expect(drawer).toContain(
          'v-model="item.clinicalIndication"',
        )
      },
    )

    it(
      'confirme le lot globalement',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'title="Confirmer la demande d’examens"',
        )
        expect(page).toContain(
          'require-text="CONFIRMER"',
        )
        expect(page).toContain(
          'examenBatchSummary',
        )
      },
    )

    it(
      'explique que chaque examen reste indépendant',
      () => {
        const drawer = source(
          'src/modules/consultations/components/ConsultationExamRequestDrawer.vue',
        )
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(drawer).toContain(
          'Chaque examen restera',
        )
        expect(page).toContain(
          'Chaque examen restera indépendant',
        )
      },
    )
  },
)
