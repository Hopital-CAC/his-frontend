<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import PatientIdentityCard from '@/modules/patients/components/PatientIdentityCard.vue'

import { patientsService } from '@/modules/patients/services/patients.service'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import { useToastStore } from '@/shared/stores/toast.store'
import { formatDateTime } from '@/shared/utils/date'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const loading = ref(false)
const error = ref('')
const dossier = ref(null)

const patientId = computed(() => route.params.id)

const patient = computed(() => {
  const raw = dossier.value?.patient

  if (!raw) return null

  return {
    raw,
    id: raw.id,
    numero_patient: raw.patientCode || raw.numero_patient || raw.id,
    numero_fiche:
      dossier.value?.episodes?.[0]?.episodeCode ||
      raw.patientCode ||
      raw.id,
    nom: raw.lastName || raw.nom || '',
    postnom: raw.middleName || raw.postnom || '',
    prenom: raw.firstName || raw.prenom || '',
    sexe: raw.gender || raw.sexe || '—',
    date_naissance: raw.birthDate || raw.date_naissance || '',
    age: raw.age || '',
    telephone: raw.phone || raw.telephone || '',
    adresse: raw.address || raw.adresse || '',
    statut: raw.status || raw.statut || 'ACTIVE',
    type: raw.type || '',
    created_at: raw.createdAt || '',
  }
})

const stats = computed(() => dossier.value?.stats || {})

const timeline = computed(() => dossier.value?.timeline || [])
const episodes = computed(() => dossier.value?.episodes || [])
const receptions = computed(() => dossier.value?.receptions || [])
const factures = computed(() => dossier.value?.factures || [])
const paiements = computed(() => dossier.value?.paiements || [])
const triages = computed(() => dossier.value?.triages || [])
const consultations = computed(() => dossier.value?.consultations || [])
const examens = computed(() => dossier.value?.examens || [])
const prescriptions = computed(() => dossier.value?.prescriptions || [])
const pharmacieDispenses = computed(() => dossier.value?.pharmacieDispenses || [])
const sorties = computed(() => dossier.value?.sorties || [])

const hasNumeroFiche = computed(() => {
  return Boolean(patient.value?.numero_fiche && patient.value.numero_fiche !== '—')
})

function label(value, fallback = '—') {
  return value === null || value === undefined || value === '' ? fallback : value
}

function formatStatus(value) {
  return String(value || '—').replaceAll('_', ' ')
}

function formatMoney(value, currency = 'CDF') {
  const amount = Number(value || 0)
  return `${amount.toLocaleString('fr-FR')} ${currency}`
}

function openWorkflow(path) {
  if (!patient.value) {
    toast.error('Patient introuvable.')
    return
  }

  ficheWorkflowService.setActiveFiche({
    ...patient.value,
    source_module: 'patients',
  })

  router.push(path)
}

async function loadDossier() {
  loading.value = true
  error.value = ''

  try {
    dossier.value = await patientsService.getDossier(patientId.value)
  } catch (err) {
    console.error('[Patients] Dossier patient introuvable:', err)
    error.value = err.response?.data?.message || 'Dossier patient introuvable.'
    toast.error(error.value)
    router.push('/patients')
  } finally {
    loading.value = false
  }
}

onMounted(loadDossier)
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Fiche patient</h1>

        <p class="his-page-subtitle">
          Vue détaillée du patient, historique clinique et timeline médicale.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/patients">
          <BaseButton variant="secondary">Retour</BaseButton>
        </RouterLink>

        <RouterLink v-if="patient" :to="`/patients/${patient.id}/edit`">
          <BaseButton>Modifier patient</BaseButton>
        </RouterLink>
      </div>
    </header>

    <div
      v-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du dossier patient...
    </div>

    <div v-else-if="patient" class="space-y-6">
      <PatientIdentityCard :patient="patient" />

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <BaseCard title="Épisodes">
          <p class="text-3xl font-semibold text-slate-950">
            {{ stats.episodesCount || 0 }}
          </p>
        </BaseCard>

        <BaseCard title="Consultations">
          <p class="text-3xl font-semibold text-slate-950">
            {{ stats.consultationsCount || 0 }}
          </p>
        </BaseCard>

        <BaseCard title="Examens">
          <p class="text-3xl font-semibold text-slate-950">
            {{ stats.examensCount || 0 }}
          </p>
        </BaseCard>

        <BaseCard title="Prescriptions">
          <p class="text-3xl font-semibold text-slate-950">
            {{ stats.prescriptionsCount || 0 }}
          </p>
        </BaseCard>

        <BaseCard title="Sorties">
          <p class="text-3xl font-semibold text-slate-950">
            {{ stats.sortiesCount || 0 }}
          </p>
        </BaseCard>
      </section>

      <section class="grid gap-6 xl:grid-cols-3">
        <BaseCard
          class="xl:col-span-2"
          title="Parcours patient"
          subtitle="Données consolidées depuis le backend HIS."
        >
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Réceptions / Admissions</p>

              <div v-if="receptions.length" class="mt-3 space-y-3">
                <div
                  v-for="item in receptions"
                  :key="item.id"
                  class="rounded-xl bg-white p-3 text-sm text-slate-600"
                >
                  <p class="font-medium text-slate-900">
                    {{ item.receptionCode }}
                  </p>
                  <p>{{ formatStatus(item.status) }} · {{ formatStatus(item.priority) }}</p>
                  <p>{{ formatDateTime(item.createdAt) }}</p>
                </div>
              </div>

              <p v-else class="mt-2 text-sm text-slate-500">
                Aucun historique de réception.
              </p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Consultations</p>

              <div v-if="consultations.length" class="mt-3 space-y-3">
                <div
                  v-for="item in consultations"
                  :key="item.id"
                  class="rounded-xl bg-white p-3 text-sm text-slate-600"
                >
                  <p class="font-medium text-slate-900">
                    {{ item.consultationCode }}
                  </p>
                  <p>{{ label(item.chiefComplaint) }}</p>
                  <p>{{ formatStatus(item.status) }} · {{ formatDateTime(item.createdAt) }}</p>
                </div>
              </div>

              <p v-else class="mt-2 text-sm text-slate-500">
                Aucune consultation chargée.
              </p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Examens</p>

              <div v-if="examens.length" class="mt-3 space-y-3">
                <div
                  v-for="item in examens"
                  :key="item.id"
                  class="rounded-xl bg-white p-3 text-sm text-slate-600"
                >
                  <p class="font-medium text-slate-900">
                    {{ item.examenCode }} · {{ item.name }}
                  </p>
                  <p>{{ formatStatus(item.type) }} · {{ formatStatus(item.status) }}</p>
                  <p v-if="item.resultConclusion">
                    Résultat : {{ item.resultConclusion }}
                  </p>
                </div>
              </div>

              <p v-else class="mt-2 text-sm text-slate-500">
                Aucun examen chargé.
              </p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Paiements</p>

              <div v-if="paiements.length" class="mt-3 space-y-3">
                <div
                  v-for="item in paiements"
                  :key="item.id"
                  class="rounded-xl bg-white p-3 text-sm text-slate-600"
                >
                  <p class="font-medium text-slate-900">
                    {{ item.paiementNumber || item.receiptNumber }}
                  </p>
                  <p>{{ formatMoney(item.amount, item.currency) }} · {{ formatStatus(item.status) }}</p>
                  <p>{{ formatDateTime(item.createdAt) }}</p>
                </div>
              </div>

              <p v-else class="mt-2 text-sm text-slate-500">
                Aucun paiement chargé.
              </p>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Actions workflow" subtitle="Envoyer le patient vers un module.">
          <div class="space-y-3">
            <BaseButton class="w-full justify-start" @click="openWorkflow('/receptions/create')">
              Créer réception
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/triage/create')"
            >
              Envoyer au triage
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/consultations/create')"
            >
              Ouvrir consultation
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/laboratoire/create')"
            >
              Demande laboratoire
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/imagerie/create')"
            >
              Demande imagerie
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/pharmacie/create')"
            >
              Prescription pharmacie
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/caisse/create')"
            >
              Paiement caisse
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/sorties/create')"
            >
              Préparer sortie
            </BaseButton>
          </div>
        </BaseCard>
      </section>

      <section class="grid gap-6 xl:grid-cols-2">
        <BaseCard title="Prescriptions et pharmacie">
          <div v-if="prescriptions.length" class="space-y-4">
            <div
              v-for="prescription in prescriptions"
              :key="prescription.id"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="font-semibold text-slate-900">
                {{ prescription.prescriptionCode }}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                {{ formatStatus(prescription.status) }} · {{ formatDateTime(prescription.createdAt) }}
              </p>

              <ul class="mt-3 space-y-2 text-sm text-slate-600">
                <li
                  v-for="line in prescription.lines || []"
                  :key="line.id"
                  class="rounded-xl bg-white p-3"
                >
                  <span class="font-medium text-slate-900">
                    {{ line.medicationName }}
                  </span>
                  — {{ line.dosage }}, {{ line.frequency }}, {{ line.duration }}
                </li>
              </ul>
            </div>
          </div>

          <p v-else class="text-sm text-slate-500">
            Aucune prescription chargée.
          </p>

          <div v-if="pharmacieDispenses.length" class="mt-6 border-t border-slate-200 pt-4">
            <p class="font-semibold text-slate-900">Dispensations pharmacie</p>

            <div
              v-for="dispense in pharmacieDispenses"
              :key="dispense.id"
              class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
            >
              <p class="font-medium text-slate-900">
                {{ dispense.dispenseCode }}
              </p>
              <p>{{ formatStatus(dispense.status) }} · {{ formatDateTime(dispense.createdAt) }}</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Sorties patient">
          <div v-if="sorties.length" class="space-y-4">
            <div
              v-for="sortie in sorties"
              :key="sortie.id"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
            >
              <p class="font-semibold text-slate-900">
                {{ sortie.sortieCode }}
              </p>
              <p>{{ formatStatus(sortie.sortieType) }} · {{ formatStatus(sortie.finalState) }}</p>
              <p>{{ label(sortie.destination, 'Destination non précisée') }}</p>
              <p>{{ formatDateTime(sortie.dischargedAt || sortie.createdAt) }}</p>
            </div>
          </div>

          <p v-else class="text-sm text-slate-500">
            Aucune sortie enregistrée.
          </p>
        </BaseCard>
      </section>

      <BaseCard title="Timeline médicale" subtitle="Historique chronologique complet du patient.">
        <div v-if="timeline.length" class="space-y-4">
          <div
            v-for="event in timeline"
            :key="event.id"
            class="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <p class="font-semibold text-slate-900">
                  {{ event.title }}
                </p>

                <p class="mt-1 text-sm text-slate-500">
                  {{ event.description }}
                </p>
              </div>

              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {{ formatStatus(event.type) }}
              </span>
            </div>

            <p class="mt-3 text-xs text-slate-400">
              {{ formatDateTime(event.occurredAt) }}
            </p>
          </div>
        </div>

        <p v-else class="text-sm text-slate-500">
          Aucun événement timeline disponible.
        </p>
      </BaseCard>

      <BaseCard title="Épisodes de soins">
        <div v-if="episodes.length" class="space-y-4">
          <div
            v-for="episode in episodes"
            :key="episode.id"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
          >
            <p class="font-semibold text-slate-900">
              {{ episode.episodeCode }}
            </p>
            <p>
              {{ formatStatus(episode.type) }} · {{ formatStatus(episode.priority) }} ·
              {{ formatStatus(episode.status) }}
            </p>
            <p>Paiement : {{ formatStatus(episode.paymentStatus) }}</p>
            <p>Service : {{ episode.service?.name || '—' }}</p>
            <p>Ouvert le : {{ formatDateTime(episode.createdAt) }}</p>
          </div>
        </div>

        <p v-else class="text-sm text-slate-500">
          Aucun épisode chargé.
        </p>
      </BaseCard>
    </div>
  </div>
</template>