<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import PatientSearchBar from '@/modules/patients/components/PatientSearchBar.vue'
import PatientTable from '@/modules/patients/components/PatientTable.vue'

import { usePatientsStore } from '@/modules/patients/stores/patients.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = usePatientsStore()
const toast = useToastStore()

const patientToArchive = ref(null)
const confirmOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 patient'
  return `${store.pagination.total} patient(s)`
})

onMounted(() => {
  loadPatients({
    page: 1,
    limit: store.pagination.limite || 10,
  })
})

async function loadPatients(params = {}) {
  try {
    await store.fetchPatients({
      page: params.page || 1,
      limit: params.limit || params.limite || 10,
    })
  } catch (error) {
    console.error('[Patients] Erreur chargement liste:', error)

    toast.error(
      error?.message ||
        'Impossible de charger la liste des patients.',
    )
  }
}

async function goToPage(page) {
  await loadPatients({
    page,
    limit: store.pagination.limite || 10,
  })
}

async function search(query) {
  try {
    await store.searchPatients(query)
  } catch (error) {
    console.error('[Patients] Erreur recherche:', error)

    toast.error(
      error?.message ||
        'Recherche patient impossible.',
    )
  }
}

async function resetSearch() {
  store.searchQuery = ''

  await loadPatients({
    page: 1,
    limit: store.pagination.limite || 10,
  })
}

function askArchive(patient) {
  patientToArchive.value = patient
  confirmOpen.value = true
}

function closeConfirm() {
  patientToArchive.value = null
  confirmOpen.value = false
}

async function confirmArchive() {
  if (!patientToArchive.value?.id) return

  try {
    await store.archivePatient(patientToArchive.value.id)
    closeConfirm()
  } catch (error) {
    console.error('[Patients] Erreur archivage:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Patients</h1>

        <p class="his-page-subtitle">
          Gestion des dossiers patients, recherche, création, modification et archivage.
        </p>
      </div>

      <RouterLink to="/patients/create">
        <BaseButton> Créer patient </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <PatientSearchBar
        v-model="store.searchQuery"
        :loading="store.searching"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <PatientTable
        :patients="store.patients"
        :loading="store.loading"
        @archive="askArchive"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || store.pagination.page <= 1"
            @click="goToPage(store.pagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasNext"
            @click="goToPage(store.pagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <ConfirmDialog
      :open="confirmOpen"
      title="Archiver ce patient"
      :message="`Cette action va archiver le patient ${patientToArchive?.nom || ''} ${patientToArchive?.prenom || ''}. Le dossier ne sera pas supprimé physiquement, mais il ne devra plus être utilisé comme patient actif.`"
      confirm-label="Archiver patient"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.archiving"
      @cancel="closeConfirm"
      @confirm="confirmArchive"
    />
  </div>
</template>
