import { defineStore } from 'pinia'
import { patientsService } from '@/modules/patients/services/patients.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'
import { patientFullName } from '@/shared/utils/patient'

function normalizePatient(patient) {
  if (!patient) return null

  const identification =
    patient.identification_patient || patient.identificationPatient || patient.patient || patient

  const firstName =
    patient.firstName ||
    patient.prenom ||
    patient.prenom ||
    identification.firstName ||
    identification.prenom ||
    identification.prenom ||
    ''

  const lastName =
    patient.lastName ||
    patient.nom ||
    identification.lastName ||
    identification.nom ||
    ''

  const middleName =
    patient.middleName ||
    patient.postnom ||
    identification.middleName ||
    identification.postnom ||
    ''

  const patientCode =
    patient.patientCode ||
    patient.numero_patient ||
    patient.numero_patient ||
    patient.numeroPatient ||
    patient.code ||
    identification.patientCode ||
    identification.numero_patient ||
    identification.numero_patient ||
    'Â'

  return {
    raw: patient,

    id:
      patient.id ||
      patient.identifiant ||
      patient.patient_id ||
      identification.id ||
      identification.identifiant ||
      identification.patient_id,

    uuid: patient.uuid || identification.uuid || '',

    numero_patient: patientCode,
    numero_fiche: patientCode,

    nom: lastName,
    postnom: middleName,
    prenom: firstName,

    sexe: patient.gender || patient.sexe || identification.gender || identification.sexe || 'Â',

    date_naissance:
      patient.birthDate ||
      patient.date_naissance ||
      patient.dateNaissance ||
      identification.birthDate ||
      identification.date_naissance ||
      identification.dateNaissance ||
      '',

    age:
      patient.estimatedAge ||
      patient.age ||
      patient.age ||
      identification.estimatedAge ||
      identification.age ||
      identification.age ||
      '',

    telephone:
      patient.phone ||
      patient.telephone ||
      patient.telephone ||
      identification.phone ||
      identification.telephone ||
      identification.telephone ||
      '',

    adresse:
      patient.address ||
      patient.adresse ||
      identification.address ||
      identification.adresse ||
      '',

    type: patient.type || 'PUBLIC',

    emergencyContactName:
      patient.emergencyContactName ||
      patient.personne_contacter ||
      patient.contact_urgence?.nom ||
      identification.emergencyContactName ||
      identification.personne_contacter ||
      identification.contact_urgence?.nom ||
      '',

    emergencyContactPhone:
      patient.emergencyContactPhone ||
      patient.telephone_urgence ||
      patient.contact_urgence?.telephone ||
      identification.emergencyContactPhone ||
      identification.telephone_urgence ||
      identification.contact_urgence?.telephone ||
      '',

    statut: patient.status || patient.statut || 'ACTIVE',

    created_at:
      patient.createdAt ||
      patient.created_at ||
      patient.cree||
      patient.date_creation ||
      patient.dateCreation ||
      '',

    updated_at:
      patient.updatedAt ||
      patient.updated_at ||
      '',

    paiement_fiche: patient.paiement_fiche || patient.paiementFiche || {},
    agent_cac: patient.agent_cac || patient.agentCac || {},
  }
}

function normalizeListResponse(payload) {
  const container = payload?.data || payload

  const rawItems =
    container?.items ||
    container?.patients ||
    container?.results ||
    container?.resultats ||
    container?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizePatient).filter(Boolean) : []

  return {
    items,
    total: Number(container?.count || container?.total || items.length || 0),
    page: Number(container?.page || 1),
    limite: Number(container?.limit || container?.limite || 10),
    hasNext: Number(container?.page || 1) * Number(container?.limit || container?.limite || 10) < Number(container?.count || container?.total || items.length || 0),
    hasPrev: Number(container?.page || 1) > 1,
  }
}

function normalizeSingleResponse(payload) {
  const container = payload?.data || payload
  const patient =
    container?.item ||
    container?.patient ||
    container?.result ||
    container

  return normalizePatient(patient)
}

export const usePatientsStore = defineStore('patients', {
  state: () => ({
    patients: [],
    selectedPatient: null,

    loading: false,
    saving: false,
    archiving: false,
    searching: false,

    error: '',

    pagination: {
      page: 1,
      limite: 10,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    searchQuery: '',
  }),

  getters: {
    hasPatients: (state) => state.patients.length > 0,
  },

  actions: {
    async fetchPatients(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await patientsService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.patients = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error?.message || 'Impossible de charger les patients.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchPatients(query) {
      this.searchQuery = query

      if (!query || query.trim().length < 2) {
        return this.fetchPatients({
          page: 1,
        })
      }

      this.searching = true
      this.error = ''

      try {
        const payload = await patientsService.search(query.trim())
        const normalized = normalizeListResponse(payload)

        this.patients = normalized.items
        this.pagination = {
          page: 1,
          limite: normalized.items.length || 10,
          total: normalized.total || normalized.items.length,
          hasNext: false,
          hasPrev: false,
        }

        return normalized
      } catch (error) {
        this.error = error?.message || 'Recherche patient impossible.'
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchPatientById(id) {
      this.loading = true
      this.error = ''
      this.selectedPatient = null

      try {
        const payload = await patientsService.getById(id)
        this.selectedPatient = normalizeSingleResponse(payload)

        return this.selectedPatient
      } catch (error) {
        this.error = error?.message || 'Patient introuvable.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPatient(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await patientsService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Patient crÃÂ©ÃÂ© avec succÃÂ¨s.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PATIENTS,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'PATIENT_CREATED',
            message: 'Patient crÃÂ©ÃÂ©',
          },
        })

        return created
      } catch (error) {
        const message = error?.message || 'CrÃÂ©ation du patient impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePatient(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await patientsService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedPatient = updated
        }

        toast.success('Patient mis ÃÂ  jour avec succÃÂ¨s.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PATIENTS,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'PATIENT_UPDATED',
            message: 'Patient mis ÃÂ  jour',
          },
        })

        return updated
      } catch (error) {
        const message = error?.message || 'Mise ÃÂ  jour du patient impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async archivePatient(id) {
      const toast = useToastStore()

      this.archiving = true
      this.error = ''

      try {
        await patientsService.archive(id)

        this.patients = this.patients.filter((patient) => String(patient.id) !== String(id))

        toast.success('Patient archivé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PATIENTS,
          id,
          status: HIS_STATUSES.ARCHIVED,
          details: {
            action: 'PATIENT_ARCHIVED',
            message: 'Patient archivé',
          },
        })
      } catch (error) {
        const message = error?.message || 'Archivage du patient impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.archiving = false
      }
    },
  },
})
