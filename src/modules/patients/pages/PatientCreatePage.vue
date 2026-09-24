<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PatientForm from '@/modules/patients/components/PatientForm.vue'
import { usePatientsStore } from '@/modules/patients/stores/patients.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { agentMedicalFileService } from '@/modules/agents/services/agent-medical-file.service'

const route = useRoute()
const router = useRouter()
const store = usePatientsStore()
const toast = useToastStore()

const serverError = ref('')
const prefillValue = ref(null)

const isAgentSource = computed(() => route.query.source === 'agent-cac')

const pageTitle = computed(() =>
  isAgentSource.value ? 'Créer une fiche bénéficiaire agent CAC' : 'Créer un patient',
)

const pageSubtitle = computed(() =>
  isAgentSource.value
    ? 'Ouverture d’une fiche médicale liée à un agent CAC confirmé. Les frais de fiche sont exonérés.'
    : 'Enregistrement d’un nouveau dossier patient avant réception ou consultation.',
)

onMounted(() => {
  if (isAgentSource.value) {
    prefillValue.value = agentMedicalFileService.readPrefill()
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    const created = await store.createPatient(payload)

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

    serverError.value =
      error?.message ||
      'Création du patient impossible. Vérifie les champs obligatoires.'

    toast.error(serverError.value)
  }
}

function cancel() {
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

    <PatientForm
      :prefill-value="prefillValue"
      submit-label="Créer patient"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
