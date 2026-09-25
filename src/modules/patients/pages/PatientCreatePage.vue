<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PatientForm from '@/modules/patients/components/PatientForm.vue'
import { usePatientsStore } from '@/modules/patients/stores/patients.store'
import { agentMedicalFileService } from '@/modules/agents/services/agent-medical-file.service'
import { useToastStore } from '@/shared/stores/toast.store'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'
import { patientFullName } from '@/shared/utils/patient'

const route = useRoute()
const router = useRouter()
const store = usePatientsStore()
const toast = useToastStore()

const serverError = ref('')
const prefillValue = ref(null)
const possibleMatches = ref([])
const pendingPayload = ref(null)
const duplicateConfirmOpen = ref(false)
const duplicateConflictCode = ref('')

const DUPLICATE_CONFLICT_CODES = new Set([
  'PATIENT_DUPLICATE_SUSPECTED',
  'PATIENT_DUPLICATE_RECHECK_REQUIRED',
])

const isAgentSource = computed(() => route.query.source === 'agent-cac')

const pageTitle = computed(() =>
  isAgentSource.value ? 'Créer une fiche bénéficiaire agent CAC' : 'Créer un patient',
)

const pageSubtitle = computed(() =>
  isAgentSource.value
    ? 'Ouverture d’une fiche médicale liée à un agent CAC confirmé. Les frais de fiche sont exonérés.'
    : 'Enregistrement d’un nouveau dossier patient avant réception ou consultation.',
)

const duplicateNotice = computed(() =>
  duplicateConflictCode.value === 'PATIENT_DUPLICATE_RECHECK_REQUIRED'
    ? 'Les correspondances ont changé depuis votre dernière vérification. Vérifiez à nouveau chaque fiche avant de continuer.'
    : 'Des fiches patient similaires existent déjà. Vérifiez-les avant de créer une nouvelle fiche.',
)

const pendingPatientName = computed(() => patientFullName(pendingPayload.value || {}))

onMounted(() => {
  if (isAgentSource.value) {
    prefillValue.value = agentMedicalFileService.readPrefill()
  }
})

function resetDuplicateState() {
  possibleMatches.value = []
  pendingPayload.value = null
  duplicateConfirmOpen.value = false
  duplicateConflictCode.value = ''
}

function conflictMatches(error) {
  const matches = error?.details?.matches
  return Array.isArray(matches) ? matches.filter((match) => match?.id) : []
}

function handleDuplicateConflict(error, payload) {
  if (!DUPLICATE_CONFLICT_CODES.has(error?.code)) return false

  const matches = conflictMatches(error)

  duplicateConflictCode.value = error.code
  possibleMatches.value = matches
  pendingPayload.value = { ...payload }
  duplicateConfirmOpen.value = false

  if (matches.length) {
    serverError.value = ''
    return true
  }

  serverError.value =
    error?.message ||
    'Les correspondances patient ont changé. Relancez la création pour effectuer une nouvelle vérification.'

  toast.error(serverError.value)
  return true
}

async function submit(payload) {
  serverError.value = ''

  try {
    const created = await store.createPatient(payload)

    resetDuplicateState()

    if (isAgentSource.value) {
      agentMedicalFileService.clearPrefill()
    }

    if (created?.id) {
      router.push(`/patients/${created.id}`)
      return
    }

    router.push('/patients')
  } catch (error) {
    console.error('[Patients] Erreur création:', error)

    if (handleDuplicateConflict(error, payload)) {
      return
    }

    resetDuplicateState()

    serverError.value =
      error?.message ||
      'Création du patient impossible. Vérifie les champs obligatoires.'

    toast.error(serverError.value)
  }
}

function useExistingPatient(match) {
  if (!match?.id || store.saving) return

  if (isAgentSource.value) {
    agentMedicalFileService.clearPrefill()
  }

  resetDuplicateState()
  router.push(`/patients/${match.id}`)
}

function openDuplicateConfirmation() {
  if (!possibleMatches.value.length || store.saving) return
  duplicateConfirmOpen.value = true
}

function closeDuplicateConfirmation() {
  if (!store.saving) {
    duplicateConfirmOpen.value = false
  }
}

async function confirmNoMatchingPatient() {
  if (!pendingPayload.value || store.saving) return

  const candidateIds = [
    ...new Set(
      possibleMatches.value
        .map((match) => String(match.id))
        .filter(Boolean),
    ),
  ]

  if (!candidateIds.length) return

  duplicateConfirmOpen.value = false

  await submit({
    ...pendingPayload.value,
    duplicateResolution: {
      action: 'CREATE_NEW',
      confirmation: 'AUCUNE_CORRESPONDANCE',
      candidateIds,
    },
  })
}

function formatBirthDate(value) {
  if (!value) return 'Date inconnue'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-FR').format(date)
}

function cancel() {
  resetDuplicateState()

  if (isAgentSource.value) {
    agentMedicalFileService.clearPrefill()
  }

  router.push('/patients')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">
        {{ pageTitle }}
      </h1>

      <p class="his-page-subtitle">
        {{ pageSubtitle }}
      </p>
    </header>

    <div
      v-if="isAgentSource"
      class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      Bénéficiaire agent CAC confirmé : les frais de fiche sont automatiquement mis à 0.
    </div>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <section
      v-if="possibleMatches.length"
      class="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"
    >
      <div class="text-sm text-amber-900">
        <p class="font-semibold">Correspondances possibles détectées</p>
        <p class="mt-1">
          {{ duplicateNotice }}
        </p>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <article
          v-for="match in possibleMatches"
          :key="match.id"
          class="rounded-xl border border-slate-200 bg-white p-4"
        >
          <p class="font-semibold text-slate-950">
            {{ patientFullName(match) }}
          </p>

          <dl class="mt-2 space-y-1 text-sm text-slate-600">
            <div class="flex justify-between gap-3">
              <dt>Numéro patient</dt>
              <dd class="font-medium text-slate-900">
                {{ match.patientCode || '—' }}
              </dd>
            </div>

            <div class="flex justify-between gap-3">
              <dt>Naissance</dt>
              <dd class="font-medium text-slate-900">
                {{ formatBirthDate(match.birthDate) }}
              </dd>
            </div>

            <div class="flex justify-between gap-3">
              <dt>Sexe</dt>
              <dd class="font-medium text-slate-900">
                {{ match.gender || '—' }}
              </dd>
            </div>

            <div class="flex justify-between gap-3">
              <dt>Téléphone</dt>
              <dd class="font-medium text-slate-900">
                {{ match.phone || '—' }}
              </dd>
            </div>
          </dl>

          <BaseButton
            class="mt-4 w-full"
            variant="secondary"
            :disabled="store.saving"
            @click="useExistingPatient(match)"
          >
            Utiliser cette fiche
          </BaseButton>
        </article>
      </div>

      <div class="flex justify-end">
        <BaseButton
          variant="warning"
          :disabled="store.saving"
          @click="openDuplicateConfirmation"
        >
          Aucune de ces fiches ne correspond
        </BaseButton>
      </div>
    </section>

    <PatientForm
      :prefill-value="prefillValue"
      submit-label="Créer patient"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />

    <ConfirmDialog
      :open="duplicateConfirmOpen"
      title="Créer une nouvelle fiche malgré les correspondances"
      message="Confirmez que vous avez vérifié chaque fiche proposée et qu’aucune ne correspond à cette personne."
      :patient-name="pendingPatientName"
      patient-id="Nouvelle fiche"
      consequence="Une nouvelle fiche patient sera créée et cette confirmation sera enregistrée dans le journal d’audit."
      confirm-text="Confirmer la nouvelle fiche"
      require-text="CONFIRMER"
      variant="warning"
      :loading="store.saving"
      @close="closeDuplicateConfirmation"
      @confirm="confirmNoMatchingPatient"
    />
  </div>
</template>