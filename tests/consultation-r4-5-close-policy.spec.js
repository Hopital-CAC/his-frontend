import {
  readFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canCloseConsultation,
  consultationCloseDecisionOptions,
  consultationCloseErrorMessage,
  createConfirmedConsultationClose,
  createConsultationCloseDraft,
  isConsultationCloseVersionConflict,
} from '../src/modules/consultations/policies/consultation-close-ui.policy'

function source(path) {
  return readFileSync(
    resolve(process.cwd(), path),
    'utf8',
  ).replace(/\r\n/g, '\n')
}

function consultation(overrides = {}) {
  return {
    statut: 'EN_COURS',
    episode_status: 'EN_CONSULTATION',
    updated_at: '2026-10-06T12:00:00.000Z',
    raw: {
      doctorUser: {
        id: '42',
      },
    },
    ...overrides,
  }
}

function auth(overrides = {}) {
  return {
    roleCode: 'MEDECIN',
    user: {
      id: '42',
    },
    hasPermission: vi.fn(
      (permission) =>
        permission === 'consultation:close',
    ),
    ...overrides,
  }
}

describe(
  'R4.5 — contrat frontend clôture consultation',
  () => {
    it(
      'appelle exclusivement l endpoint officiel de clôture',
      () => {
        const service = source(
          'src/modules/consultations/services/consultations.service.js',
        )

        expect(service).toMatch(
          /api\.post\(\s*`\/consultations\/\$\{id\}\/close`,\s*payload/,
        )
      },
    )

    it(
      'gère un état et une action store dédiés',
      () => {
        const store = source(
          'src/modules/consultations/stores/consultations.store.js',
        )

        expect(store).toContain(
          'closingConsultation: false',
        )
        expect(store).toContain(
          "consultationCloseError: ''",
        )
        expect(store).toContain(
          'async closeConsultation(id, payload)',
        )
        expect(store).toContain(
          'await consultationsService.close(',
        )
      },
    )

    it(
      'réserve la clôture au médecin affecté avec consultation:close',
      () => {
        const granted = auth()

        expect(
          canCloseConsultation(
            granted,
            consultation(),
          ),
        ).toBe(true)

        expect(
          granted.hasPermission,
        ).toHaveBeenCalledWith(
          'consultation:close',
        )

        expect(
          canCloseConsultation(
            auth({
              user: {
                id: '99',
              },
            }),
            consultation(),
          ),
        ).toBe(false)

        expect(
          canCloseConsultation(
            auth({
              roleCode: 'INFIRMIER',
            }),
            consultation(),
          ),
        ).toBe(false)
      },
    )

    it(
      'exclut DEMANDER_EXAMENS des décisions terminales',
      () => {
        const options =
          consultationCloseDecisionOptions(
            consultation(),
          )

        expect(
          options.map((option) => option.value),
        ).toEqual([
          'FACTURATION_ACTE',
          'HOSPITALISATION_RECOMMANDEE',
          'SORTIE_AUTORISEE',
        ])

        expect(
          options.some(
            (option) =>
              option.value ===
              'DEMANDER_EXAMENS',
          ),
        ).toBe(false)
      },
    )

    it(
      'autorise PRESCRIPTION_DIRECTE uniquement après passage pharmacie ou préparation sortie',
      () => {
        expect(
          consultationCloseDecisionOptions(
            consultation({
              episode_status: 'EN_PHARMACIE',
            }),
          ),
        ).toEqual([
          {
            value: 'PRESCRIPTION_DIRECTE',
            label: 'Prescription directe',
          },
        ])

        expect(
          consultationCloseDecisionOptions(
            consultation({
              episode_status:
                'EN_ATTENTE_RESULTATS',
            }),
          ),
        ).toEqual([])
      },
    )

    it(
      'construit le payload avec version diagnostic et décision',
      () => {
        const draft =
          createConsultationCloseDraft(
            {
              finalDiagnosis:
                '  Paludisme simple traité  ',
              decision: 'SORTIE_AUTORISEE',
            },
            consultation(),
          )

        expect(draft).toEqual({
          expectedUpdatedAt:
            '2026-10-06T12:00:00.000Z',
          finalDiagnosis:
            'Paludisme simple traité',
          decision: 'SORTIE_AUTORISEE',
        })

        expect(
          createConfirmedConsultationClose(
            draft,
          ),
        ).toEqual({
          ...draft,
          confirmationAcknowledged: true,
        })
      },
    )

    it(
      'refuse diagnostic vide décision incompatible et version absente',
      () => {
        expect(() =>
          createConsultationCloseDraft(
            {
              finalDiagnosis: ' ',
              decision: 'SORTIE_AUTORISEE',
            },
            consultation(),
          ),
        ).toThrow(
          'Le diagnostic final est obligatoire',
        )

        expect(() =>
          createConsultationCloseDraft(
            {
              finalDiagnosis:
                'Diagnostic final',
              decision: 'PRESCRIPTION_DIRECTE',
            },
            consultation(),
          ),
        ).toThrow(
          'Sélectionnez une décision finale compatible',
        )

        expect(() =>
          createConsultationCloseDraft(
            {
              finalDiagnosis:
                'Diagnostic final',
              decision: 'SORTIE_AUTORISEE',
            },
            consultation({
              updated_at: '',
              raw: {
                doctorUser: {
                  id: '42',
                },
              },
            }),
          ),
        ).toThrow(
          'Version de la consultation absente',
        )
      },
    )

    it(
      'gère explicitement le conflit de version',
      () => {
        const error = {
          code:
            'CONSULTATION_CLOSE_VERSION_CONFLICT',
        }

        expect(
          isConsultationCloseVersionConflict(
            error,
          ),
        ).toBe(true)

        expect(
          consultationCloseErrorMessage(
            error,
          ),
        ).toContain(
          'Actualisez le dossier',
        )
      },
    )
  },
)