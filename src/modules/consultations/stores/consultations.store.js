import { defineStore } from 'pinia'

import { consultationsService } from '@/modules/consultations/services/consultations.service'

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (
      obj &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ''
    ) {
      return obj[key]
    }
  }

  return fallback
}

function readText(value, fallback = '') {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object') {
    return (
      value.resume ||
      value.résumé ||
      value.description ||
      value.valeur ||
      value.value ||
      JSON.stringify(value)
    )
  }

  return String(value)
}

function readDiagnostic(value, fallback = '') {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  if (typeof value === 'string') {
    try {
      return readDiagnostic(
        JSON.parse(value),
        fallback,
      )
    } catch {
      return value
    }
  }

  if (typeof value !== 'object') {
    return String(value)
  }

  const retained =
    value.diagnostic_retenu ||
    value.diagnosticRetenu ||
    value.resume ||
    value.résumé ||
    value.description ||
    ''

  const hypotheses =
    value.hypotheses_diagnostiques ||
    value.hypothèses_diagnostiques ||
    value.hypotheses ||
    value.hypothèses ||
    ''

  const severity =
    value.gravite ||
    value.gravité ||
    {}

  const severityLabel = severity.grave
    ? 'Grave'
    : severity.moderee || severity.modérée
      ? 'Modérée'
      : severity.legere || severity.légère
        ? 'Légère'
        : ''

  return [
    retained
      ? `Diagnostic retenu : ${retained}`
      : '',
    hypotheses
      ? `Hypothèses : ${hypotheses}`
      : '',
    severityLabel
      ? `Gravité : ${severityLabel}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ') || fallback
}

function normalizeConsultation(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const raw = item
  const patient =
    raw.patient ||
    raw.identification_patient ||
    raw.identificationPatient ||
    raw.reception?.identification_patient ||
    raw.triage?.identification_patient ||
    {}

  const episode =
    raw.episode ||
    raw.reception?.episode ||
    {}

  const doctorUser =
    raw.doctorUser ||
    raw.medecin ||
    raw.médecin ||
    {}

  const pgad = raw.pgad || {}
  const generalState =
    raw.etat_general ||
    raw.état_général ||
    {}

  const anamnesis =
    raw.anamnese ||
    raw.anamnèse ||
    {}

  const clinicalExam =
    raw.examen_clinique ||
    raw.examenClinique ||
    {}

  const legacyDiagnosis =
    raw.diagnostique ||
    raw.diagnostic ||
    {}

  const legacyPlan =
    raw.plan_prise_en_charge ||
    raw.planPriseEnCharge ||
    {}

  return {
    raw,

    id: pick(
      raw,
      ['id', 'identifiant', 'consultation_id'],
    ),

    consultation_code: pick(
      raw,
      ['consultationCode', 'consultation_code'],
      '—',
    ),

    reception_id: pick(
      raw,
      ['reception_id', 'receptionId'],
      pick(raw.reception, ['id']),
    ),

    triage_id: pick(
      raw,
      ['triage_id', 'triageId'],
      pick(raw.triage, ['id']),
    ),

    numero_patient: pick(
      patient,
      [
        'patientCode',
        'numero_patient',
        'numeroPatient',
      ],
      pick(
        raw,
        ['numero_patient', 'numeroPatient'],
        '—',
      ),
    ),

    numero_fiche: pick(
      episode,
      ['episodeCode'],
      pick(
        raw,
        ['numero_fiche', 'numeroFiche'],
        pick(
          raw.reception,
          ['numero_fiche'],
          '—',
        ),
      ),
    ),

    nom: pick(
      patient,
      ['lastName', 'nom'],
      pick(raw, ['nom']),
    ),

    postnom: pick(
      patient,
      ['middleName', 'postnom'],
      pick(raw, ['postnom']),
    ),

    prenom: pick(
      patient,
      ['firstName', 'prenom', 'prénom'],
      pick(raw, ['prenom', 'prénom']),
    ),

    sexe: pick(
      patient,
      ['gender', 'sexe'],
      pick(raw, ['sexe'], '—'),
    ),

    age: pick(
      patient,
      ['estimatedAge', 'age', 'âge'],
      pick(raw, ['age', 'âge'], ''),
    ),

    plaintes: readText(
      raw.chiefComplaint ||
      pgad.plaintes ||
      raw.plaintes,
    ),

    histoire: readText(
      raw.illnessHistory ||
      pgad.histoire ||
      raw.histoire,
    ),

    antecedents: readText(
      raw.medicalHistory ||
      pgad.antecedents ||
      pgad.antécédents ||
      raw.antecedents,
    ),

    deroulement: readText(
      pgad.deroulement ||
      pgad.déroulement ||
      raw.deroulement,
    ),

    etat_general: readText(
      generalState.resume ||
      generalState.résumé ||
      generalState.description ||
      raw.etat_general,
    ),

    anamnese: readText(
      anamnesis.resume ||
      anamnesis.résumé ||
      anamnesis.description ||
      raw.anamnese,
    ),

    examen_clinique: readText(
      raw.clinicalExam ||
      clinicalExam.resume ||
      clinicalExam.résumé ||
      clinicalExam.description ||
      raw.examen_clinique,
    ),

    diagnostique: readDiagnostic(
      raw.finalDiagnosis ||
      raw.provisionalDiagnosis ||
      raw.diagnostique ||
      raw.diagnostic ||
      legacyDiagnosis,
    ),

    plan_prise_en_charge: readText(
      raw.treatmentPlan ||
      legacyPlan.resume ||
      legacyPlan.résumé ||
      legacyPlan.description ||
      raw.plan_prise_en_charge,
    ),

    medecin:
      [
        pick(doctorUser, ['firstName']),
        pick(doctorUser, ['lastName']),
      ]
        .filter(Boolean)
        .join(' ') ||
      pick(
        raw,
        ['medecin_nom', 'medecinName'],
        '—',
      ),

    service: pick(
      raw,
      ['service', 'service_entree', 'serviceEntree'],
      'Consultation',
    ),

    episode_status: pick(
      episode,
      ['status'],
      '—',
    ),

    decision: pick(
      raw,
      ['decision'],
      null,
    ),

    statut: pick(
      raw,
      ['status', 'statut'],
      'EN_COURS',
    ),

    created_at: pick(
      raw,
      [
        'startedAt',
        'created_at',
        'createdAt',
        'date_creation',
      ],
      '',
    ),

    closed_at: pick(
      raw,
      ['closedAt', 'closed_at'],
      null,
    ),

    updated_at: pick(
      raw,
      ['updatedAt', 'updated_at'],
      '',
    ),
  }
}

function normalizeListResponse(payload) {
  const container =
    payload?.data &&
    !Array.isArray(payload.data)
      ? payload.data
      : payload || {}

  const rawItems =
    container.items ||
    container.consultations ||
    container.results ||
    container.resultats ||
    container.données ||
    (Array.isArray(payload?.data)
      ? payload.data
      : [])

  const items = Array.isArray(rawItems)
    ? rawItems
        .map(normalizeConsultation)
        .filter(Boolean)
    : []

  const pagination =
    container.pagination ||
    container.meta ||
    {}

  const page = Math.max(
    1,
    Number(
      container.page ||
      pagination.page ||
      pagination.currentPage ||
      1,
    ),
  )

  const limite = Math.max(
    1,
    Number(
      container.limit ||
      container.limite ||
      pagination.limit ||
      pagination.limite ||
      pagination.perPage ||
      10,
    ),
  )

  const total = Math.max(
    0,
    Number(
      container.count ??
      container.total ??
      pagination.total ??
      pagination.totalItems ??
      items.length,
    ),
  )

  const totalPages = Math.max(
    1,
    Number(
      container.pages ||
      container.totalPages ||
      pagination.pages ||
      pagination.totalPages ||
      Math.ceil(total / limite) ||
      1,
    ),
  )

  return {
    items,
    total,
    page,
    limite,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  const consultation =
    payload?.item ||
    payload?.data?.item ||
    payload?.consultation ||
    payload?.data?.consultation ||
    payload?.data ||
    payload?.données ||
    payload?.result ||
    payload

  return normalizeConsultation(
    consultation,
  )
}

const CLINICAL_HISTORY_FIELD_LABELS = Object.freeze({
  illnessHistory: 'Histoire de la maladie',
  medicalHistory: 'Antécédents médicaux',
  clinicalExam: 'Examen clinique',
  provisionalDiagnosis: 'Diagnostic provisoire',
  treatmentPlan: 'Plan de prise en charge',
})

function normalizeClinicalHistoryChange(change) {
  if (!change || typeof change !== 'object') {
    return null
  }

  const field = String(change.field || '').trim()

  if (!CLINICAL_HISTORY_FIELD_LABELS[field]) {
    return null
  }

  return {
    field,
    label: CLINICAL_HISTORY_FIELD_LABELS[field],
    oldValue:
      change.oldValue === undefined
        ? null
        : change.oldValue,
    newValue:
      change.newValue === undefined
        ? null
        : change.newValue,
  }
}

function normalizeClinicalHistoryItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const actor = item.actor || {}
  const actorName = [
    actor.firstName,
    actor.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  const changes = Array.isArray(item.changes)
    ? item.changes
        .map(normalizeClinicalHistoryChange)
        .filter(Boolean)
    : []

  return {
    id: String(item.id || ''),
    occurredAt: item.occurredAt || '',
    actor: {
      id: actor.id || null,
      name: actorName || 'Utilisateur non identifié',
    },
    roleCode: item.roleCode || null,
    changes,
  }
}

function normalizeClinicalHistoryResponse(payload) {
  const container =
    payload?.data &&
    !Array.isArray(payload.data)
      ? payload.data
      : payload || {}

  const rawItems = Array.isArray(container.items)
    ? container.items
    : []

  const items = rawItems
    .map(normalizeClinicalHistoryItem)
    .filter(
      (item) =>
        item?.id &&
        item.changes.length > 0,
    )

  const page = Math.max(
    1,
    Number(container.page || 1),
  )
  const limit = Math.max(
    1,
    Number(container.limit || 20),
  )
  const count = Math.max(
    0,
    Number(container.count ?? items.length),
  )

  return {
    items,
    page,
    limit,
    count,
    hasPrev: page > 1,
    hasNext: page * limit < count,
  }
}

export const useConsultationsStore =
  defineStore('consultations', {
    state: () => ({
      consultations: [],
      selectedConsultation: null,
      loading: false,
      searching: false,
      savingClinical: false,
      requestingExamen: false,
      examenRequestError: '',
      creatingPrescription: false,
      prescriptionCreateError: '',
      closingConsultation: false,
      consultationCloseError: '',
      clinicalHistoryLoading: false,
      clinicalHistoryError: '',
      clinicalHistoryItems: [],
      clinicalHistoryPage: 1,
      clinicalHistoryLimit: 20,
      clinicalHistoryCount: 0,
      clinicalHistoryHasPrev: false,
      clinicalHistoryHasNext: false,
      error: '',
      clinicalSaveError: '',

      pagination: {
        page: 1,
        limite: 10,
        total: 0,
        hasNext: false,
        hasPrev: false,
      },

      filters: {
        q: '',
        service: '',
        statut: '',
      },
    }),

    actions: {
      async fetchConsultations(
        params = {},
      ) {
        this.loading = true
        this.error = ''

        try {
          const payload =
            await consultationsService.list({
              page:
                params.page ||
                this.pagination.page,
              limit:
                params.limit ||
                params.limite ||
                this.pagination.limite,
            })

          const normalized =
            normalizeListResponse(payload)

          this.consultations =
            normalized.items

          this.pagination = {
            page: normalized.page,
            limite: normalized.limite,
            total: normalized.total,
            hasNext: normalized.hasNext,
            hasPrev: normalized.hasPrev,
          }

          return normalized
        } catch (error) {
          this.error =
            error?.message ||
            'Impossible de charger les consultations.'

          throw error
        } finally {
          this.loading = false
        }
      },

      async searchConsultations(
        filters = {},
      ) {
        this.searching = true
        this.error = ''

        this.filters = {
          q: filters.q ?? '',
          service: filters.service ?? '',
          statut: filters.statut ?? '',
        }

        try {
          await this.fetchConsultations({
            page: 1,
          })

          const query = String(
            this.filters.q || '',
          )
            .toLowerCase()
            .trim()

          this.consultations =
            this.consultations.filter(
              (item) => {
                const fullName = [
                  item.nom,
                  item.postnom,
                  item.prenom,
                ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()

                const matchesQuery =
                  !query ||
                  fullName.includes(query) ||
                  String(
                    item.numero_patient || '',
                  )
                    .toLowerCase()
                    .includes(query) ||
                  String(
                    item.numero_fiche || '',
                  )
                    .toLowerCase()
                    .includes(query) ||
                  String(
                    item.consultation_code || '',
                  )
                    .toLowerCase()
                    .includes(query) ||
                  String(
                    item.diagnostique || '',
                  )
                    .toLowerCase()
                    .includes(query) ||
                  String(
                    item.plaintes || '',
                  )
                    .toLowerCase()
                    .includes(query)

                const matchesService =
                  !this.filters.service ||
                  item.service ===
                    this.filters.service

                const matchesStatus =
                  !this.filters.statut ||
                  item.statut ===
                    this.filters.statut

                return (
                  matchesQuery &&
                  matchesService &&
                  matchesStatus
                )
              },
            )

          this.pagination = {
            page: 1,
            limite:
              this.consultations.length ||
              10,
            total:
              this.consultations.length,
            hasNext: false,
            hasPrev: false,
          }

          return this.consultations
        } catch (error) {
          this.error =
            error?.message ||
            'Recherche consultation impossible.'

          throw error
        } finally {
          this.searching = false
        }
      },

      async fetchConsultationById(id) {
        this.loading = true
        this.error = ''
        this.selectedConsultation = null

        try {
          const payload =
            await consultationsService.getById(
              id,
            )

          this.selectedConsultation =
            normalizeSingleResponse(payload)

          if (!this.selectedConsultation?.id) {
            throw new Error(
              'Consultation introuvable.',
            )
          }

          return this.selectedConsultation
        } catch (error) {
          this.error =
            error?.message ||
            'Consultation introuvable.'

          throw error
        } finally {
          this.loading = false
        }
      },

      async updateClinical(id, payload) {
        this.savingClinical = true
        this.clinicalSaveError = ''

        try {
          const response =
            await consultationsService.updateClinical(
              id,
              payload,
            )

          const updated =
            normalizeSingleResponse(response)

          if (!updated?.id) {
            throw new Error(
              'Le serveur n’a pas retourné le dossier clinique actualisé.',
            )
          }

          this.selectedConsultation = updated

          const index =
            this.consultations.findIndex(
              (item) =>
                String(item.id) === String(updated.id),
            )

          if (index >= 0) {
            this.consultations[index] = updated
          }

          return updated
        } catch (error) {
          this.clinicalSaveError =
            error?.message ||
            'Enregistrement clinique impossible.'

          throw error
        } finally {
          this.savingClinical = false
        }
      },

      async requestExamen(id, payload) {
        this.requestingExamen = true
        this.examenRequestError = ''

        try {
          return await consultationsService.requestExamen(
            id,
            payload,
          )
        } catch (error) {
          this.examenRequestError =
            error?.message ||
            'Demande d’examen impossible.'

          throw error
        } finally {
          this.requestingExamen = false
        }
      },

      async createPrescription(id, payload) {
        this.creatingPrescription = true
        this.prescriptionCreateError = ''

        try {
          return await consultationsService.createPrescription(
            id,
            payload,
          )
        } catch (error) {
          this.prescriptionCreateError =
            error?.message ||
            'Prescription impossible.'

          throw error
        } finally {
          this.creatingPrescription = false
        }
      },

      async closeConsultation(id, payload) {
        this.closingConsultation = true
        this.consultationCloseError = ''

        try {
          const response =
            await consultationsService.close(
              id,
              payload,
            )

          const updated =
            normalizeSingleResponse(response)

          if (!updated?.id) {
            throw new Error(
              'Le serveur n’a pas retourné la consultation clôturée.',
            )
          }

          this.selectedConsultation = updated

          const index =
            this.consultations.findIndex(
              (item) =>
                String(item.id) === String(updated.id),
            )

          if (index >= 0) {
            this.consultations[index] = updated
          }

          return updated
        } catch (error) {
          this.consultationCloseError =
            error?.message ||
            'Clôture de la consultation impossible.'

          throw error
        } finally {
          this.closingConsultation = false
        }
      },

      async fetchClinicalHistory(
        id,
        params = {},
      ) {
        this.clinicalHistoryLoading = true
        this.clinicalHistoryError = ''

        try {
          const response =
            await consultationsService.clinicalHistory(
              id,
              {
                page: params.page || 1,
                limit:
                  params.limit ||
                  this.clinicalHistoryLimit ||
                  20,
              },
            )

          const normalized =
            normalizeClinicalHistoryResponse(response)

          this.clinicalHistoryItems =
            normalized.items
          this.clinicalHistoryPage =
            normalized.page
          this.clinicalHistoryLimit =
            normalized.limit
          this.clinicalHistoryCount =
            normalized.count
          this.clinicalHistoryHasPrev =
            normalized.hasPrev
          this.clinicalHistoryHasNext =
            normalized.hasNext

          return normalized
        } catch (error) {
          this.clinicalHistoryError =
            error?.message ||
            'Historique clinique indisponible.'

          throw error
        } finally {
          this.clinicalHistoryLoading = false
        }
      },

      clearClinicalHistory() {
        this.clinicalHistoryError = ''
        this.clinicalHistoryItems = []
        this.clinicalHistoryPage = 1
        this.clinicalHistoryCount = 0
        this.clinicalHistoryHasPrev = false
        this.clinicalHistoryHasNext = false
      },
    },
  })

export {
  normalizeConsultation,
  normalizeListResponse,
  normalizeSingleResponse,
}
