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
  'R4.3D-C — historique clinique frontend',
  () => {
    it(
      'appelle uniquement le GET métier dédié',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        expect(service).toMatch(
          /api\.get\(\s*`\/consultations\/\$\{id\}\/clinical-history`/,
        )
        expect(service).not.toContain(
          '/audit-logs',
        )
      },
    )

    it(
      'normalise les changements et la pagination',
      () => {
        const store = source(
          'src/modules/consultations/stores/consultations.store.js',
        )

        expect(store).toContain(
          'CLINICAL_HISTORY_FIELD_LABELS',
        )
        expect(store).toContain(
          'normalizeClinicalHistoryResponse',
        )
        expect(store).toContain(
          'clinicalHistoryHasNext',
        )
        expect(store).toContain(
          'fetchClinicalHistory',
        )
      },
    )

    it(
      'utilise le Drawer du design system',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationClinicalHistoryDrawer.vue',
        )

        expect(component).toContain(
          "@/shared/ui/overlay/Drawer.vue",
        )
        expect(component).toContain(
          'Historique clinique',
        )
      },
    )

    it(
      'affiche date médecin champ ancienne et nouvelle valeur',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationClinicalHistoryDrawer.vue',
        )

        expect(component).toContain(
          'formatDateTime',
        )
        expect(component).toContain(
          'clinicalHistoryActorLabel',
        )
        expect(component).toContain(
          'change.label',
        )
        expect(component).toContain(
          'Ancienne valeur',
        )
        expect(component).toContain(
          'Nouvelle valeur',
        )
      },
    )

    it(
      'n’expose ni IP ni user-agent ni requestId',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationClinicalHistoryDrawer.vue',
        )

        expect(component).not.toMatch(
          /ipAddress|userAgent|requestId/,
        )
      },
    )

    it(
      'affiche explicitement un journal en lecture seule',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationClinicalHistoryDrawer.vue',
        )

        expect(component).toContain(
          'Journal clinique en lecture seule.',
        )
        expect(component).not.toContain(
          'Modifier',
        )
        expect(component).not.toContain(
          'Supprimer',
        )
      },
    )

    it(
      'intègre une pagination réutilisable',
      () => {
        const component = source(
          'src/modules/consultations/components/ConsultationClinicalHistoryDrawer.vue',
        )
        const pagination = source(
          'src/shared/ui/data/DataPagination.vue',
        )

        expect(component).toContain(
          'DataPagination',
        )
        expect(pagination).toContain(
          'Précédent',
        )
        expect(pagination).toContain(
          'Suivant',
        )
      },
    )

    it(
      'n’affiche le bouton qu’avec la politique de lecture',
      () => {
        const page = source(
          'src/modules/consultations/pages/ConsultationDetailsPage.vue',
        )

        expect(page).toContain(
          'canReadClinicalHistory',
        )
        expect(page).toContain(
          'v-if="canReadHistory"',
        )
        expect(page).toContain(
          'Historique clinique',
        )
      },
    )
  },
)
