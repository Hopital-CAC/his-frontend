<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PatientForm from '@/modules/patients/components/PatientForm.vue'
import { usePatientsStore } from '@/modules/patients/stores/patients.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = usePatientsStore()
const toast = useToastStore()

const serverError = ref('')

const patientId = computed(() => route.params.id)
const patient = computed(() => store.selectedPatient)

onMounted(async () => {
  try {
    await store.fetchPatientById(patientId.value)
  } catch {
    router.push('/patients')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updatePatient(patientId.value, payload)
    router.push(`/patients/${patientId.value}`)
  } catch (error) {
    console.error('[Patients] Erreur modification:', error)

    serverError.value =
      error?.message ||
      'Modification du patient impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/patients/${patientId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier patient</h1>

      <p class="his-page-subtitle">Modification contrôlée des informations du patient.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du patient...
    </div>

    <PatientForm
      v-else-if="patient"
      :initial-value="patient"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
