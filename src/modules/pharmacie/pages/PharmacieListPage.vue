<script setup>
import { computed, onMounted } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import PharmacieSearchBar from '@/modules/pharmacie/components/PharmacieSearchBar.vue'
import PharmacieTable from '@/modules/pharmacie/components/PharmacieTable.vue'

import { usePharmacieStore } from '@/modules/pharmacie/stores/pharmacie.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = usePharmacieStore()
const toast = useToastStore()



const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 prescription'
  return `${store.pagination.total} prescription(s)`
})

onMounted(() => {
  loadPrescriptions({ page: 1 })
})

async function loadPrescriptions(params = {}) {
  try {
    await store.fetchPrescriptions({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Pharmacie] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les prescriptions.')
  }
}

async function goToPage(page) {
  await loadPrescriptions({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchPrescriptions(filters)
  } catch (error) {
    console.error('[Pharmacie] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche pharmacie impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
  }

  await loadPrescriptions({ page: 1 })
}







</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Pharmacie / Prescriptions</h1>

        <p class="his-page-subtitle">
          Consultation des prescriptions médicales et de leurs statuts.
        </p>
      </div>
    </header>

    <BaseCard>
      <PharmacieSearchBar
        :filters="store.filters"
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

      <PharmacieTable
        :prescriptions="store.prescriptions"
        :loading="store.loading"
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
  </div>
</template>

