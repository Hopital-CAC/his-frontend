import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canServePrescription,
  createServePrescriptionPayload,
  dispenseErrorMessage,
  dispenseSummary,
  normalizeDispenseQuantity,
} from '../src/modules/pharmacie/policies/pharmacie-dispensation-ui.policy'

describe(
  'pharmacy dispensation ui policy',
  () => {
    it(
      'autorise uniquement la permission pharmacie sur prescription active en pharmacie',
      () => {
        const granted = {
          hasPermission: vi.fn(
            (permission) =>
              permission ===
              'pharmacie:serve_prescription',
          ),
        }

        const denied = {
          hasPermission: () => false,
        }

        const prescription = {
          statut: 'VALIDEE',
          episode: {
            status: 'EN_PHARMACIE',
          },
        }

        expect(
          canServePrescription(
            granted,
            prescription,
          ),
        ).toBe(true)

        expect(
          canServePrescription(
            denied,
            prescription,
          ),
        ).toBe(false)

        expect(
          canServePrescription(
            granted,
            {
              ...prescription,
              statut: 'SERVIE',
            },
          ),
        ).toBe(false)

        expect(
          canServePrescription(
            granted,
            {
              ...prescription,
              episode: {
                status: 'PRET_SORTIE',
              },
            },
          ),
        ).toBe(false)
      },
    )

    it(
      'rejette les quantités invalides ou supérieures au restant',
      () => {
        expect(
          normalizeDispenseQuantity(
            3,
            5,
          ),
        ).toBe(3)

        expect(
          normalizeDispenseQuantity(
            6,
            5,
          ),
        ).toBeNull()

        expect(
          normalizeDispenseQuantity(
            0,
            5,
          ),
        ).toBeNull()

        expect(
          normalizeDispenseQuantity(
            1.5,
            5,
          ),
        ).toBeNull()
      },
    )

    it(
      'construit un payload partiel canonique sans ligne déjà servie',
      () => {
        const prescription = {
          id: '12',
          lines: [
            {
              id: '21',
              quantite: 10,
              status: 'PRESCRITE',
            },
            {
              id: '22',
              quantite: 4,
              status: 'SERVIE',
            },
          ],
        }

        const payload =
          createServePrescriptionPayload(
            prescription,
            {
              21: 3,
              22: 1,
            },
            (lineId) =>
              lineId === '21'
                ? 2
                : 4,
          )

        expect(payload).toEqual({
          prescriptionId: '12',
          lines: [
            {
              prescriptionLineId:
                '21',
              quantityServed: 3,
            },
          ],
          nextEpisodeStatus:
            'PRET_SORTIE',
        })
      },
    )

    it(
      'retourne null quand aucune quantité valide n’est sélectionnée',
      () => {
        expect(
          createServePrescriptionPayload(
            {
              id: '12',
              lines: [
                {
                  id: '21',
                  quantite: 5,
                  status:
                    'PRESCRITE',
                },
              ],
            },
            {
              21: 7,
            },
            () => 0,
          ),
        ).toBeNull()
      },
    )

    it(
      'mappe les conflits métier de dispensation',
      () => {
        expect(
          dispenseErrorMessage({
            code:
              'SERVED_QUANTITY_EXCEEDS_REMAINING',
          }),
        ).toContain(
          'quantité saisie dépasse',
        )

        expect(
          dispenseErrorMessage({
            code:
              'PRESCRIPTION_ALREADY_SERVED',
          }),
        ).toContain(
          'déjà entièrement servie',
        )
      },
    )

    it(
      'résume la conséquence avant confirmation',
      () => {
        expect(
          dispenseSummary({
            lines: [
              {
                quantityServed: 2,
              },
              {
                quantityServed: 3,
              },
            ],
          }),
        ).toContain(
          '2 ligne(s), 5 unité(s)',
        )
      },
    )
  },
)
