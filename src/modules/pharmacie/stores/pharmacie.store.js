import { defineStore } from 'pinia'
import { pharmacieService } from '@/modules/pharmacie/services/pharmacie.service'

function normalizeLine(line = {}) {
  return {
    id: line.id,
    lineOrder: Number(line.lineOrder || 0),
    medicament: line.medicationName || '—',
    dosage: line.dosage || '',
    frequence: line.frequency || '',
    duree: line.duration || '',
    quantite: Number(line.quantity || 0),
    instructions: line.instructions || '',
    status: line.status || 'PRESCRITE',
    delivre: line.status === 'SERVIE',
  }
}

function normalizePrescription(raw) {
  if (!raw) return null

  const lines = Array.isArray(raw.lines)
    ? [...raw.lines]
        .sort((a, b) => Number(a.lineOrder || 0) - Number(b.lineOrder || 0))
        .map(normalizeLine)
    : []

  const firstLine = lines[0] || {}
  const patient = raw.patient || {}
  const episode = raw.episode || {}
  const consultation = raw.consultation || {}

  return {
    raw,
    id: raw.id,
    uuid: raw.uuid,
    prescriptionCode: raw.prescriptionCode || '',
    consultation_id: consultation.id || '',
    consultation_code: consultation.consultationCode || '',
    episode_id: episode.id || '',
    numero_fiche: episode.episodeCode || consultation.consultationCode || '—',
    numero_patient: patient.patientCode || '—',
    nom: patient.lastName || '',
    postnom: '',
    prenom: patient.firstName || '',
    patient,
    episode,
    consultation,
    medicament_principal: firstLine.medicament || '—',
    dosage: firstLine.dosage || '',
    frequence: firstLine.frequence || '',
    duree: firstLine.duree || '',
    quantite: firstLine.quantite || 0,
    medicaments: lines,
    lines,
    statut: raw.status || '',
    clinicalNotes: raw.clinicalNotes || '',
    prescribedByUser: raw.prescribedByUser || null,
    created_at: raw.createdAt || '',
    updated_at: raw.updatedAt || '',
  }
}

function normalizeListResponse(payload = {}) {
  const rawItems = Array.isArray(payload.items) ? payload.items : []
  const items = rawItems.map(normalizePrescription).filter(Boolean)

  const page = Number(payload.page || 1)
  const limite = Number(payload.limit || 20)
  const total = Number(payload.count || 0)
  const totalPages = Math.max(1, Math.ceil(total / limite))

  return {
    items,
    total,
    page,
    limite,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}


export const usePharmacieStore = defineStore('pharmacie', {
  state: () => ({
    prescriptions: [],
    selectedPrescription: null,
    loading: false,
    searching: false,
    error: '',
    pagination: {
      page: 1,
      limite: 20,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      q: '',
      statut: '',
    },
  }),

  getters: {
    pharmacieKpis: (state) => {
      const items = state.prescriptions || []

      return {
        total: state.pagination.total || items.length,
        prescriptionsToday: items.length,
        aServir: items.filter((item) => item.statut === 'VALIDEE').length,
        delivrees: items.filter((item) => item.statut === 'SERVIE').length,
        partielles: items.filter((item) => item.statut === 'PARTIELLEMENT_SERVIE').length,
        medicaments: items.reduce(
          (sum, item) => sum + (Array.isArray(item.lines) ? item.lines.length : 0),
          0,
        ),
        patients: new Set(items.map((item) => item.numero_patient).filter(Boolean)).size,
        alertesStock: 0,
      }
    },
  },

  actions: {
    async fetchPrescriptions(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await pharmacieService.listPrescriptions({
          q: params.q ?? this.filters.q,
          status: params.status ?? params.statut ?? this.filters.statut,
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.prescriptions = normalized.items
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
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Impossible de charger les prescriptions.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async searchPrescriptions(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? filters.status ?? '',
      }

      try {
        return await this.fetchPrescriptions({
          page: 1,
          q: this.filters.q,
          status: this.filters.statut,
        })
      } finally {
        this.searching = false
      }
    },

    async fetchPrescriptionById(id) {
      this.loading = true
      this.error = ''
      this.selectedPrescription = null

      try {
        const payload = await pharmacieService.getPrescriptionById(id)
        this.selectedPrescription = normalizePrescription(payload)
        return this.selectedPrescription
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Prescription introuvable.'

        throw error
      } finally {
        this.loading = false
      }
    },

  },
})
