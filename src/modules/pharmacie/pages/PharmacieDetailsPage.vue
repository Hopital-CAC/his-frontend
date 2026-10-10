<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import PharmacieIdentityCard from '@/modules/pharmacie/components/PharmacieIdentityCard.vue'
import PharmacieStatusBadge from '@/modules/pharmacie/components/PharmacieStatusBadge.vue'

import { usePharmacieStore } from '@/modules/pharmacie/stores/pharmacie.store'

const route = useRoute()
const router = useRouter()
const store = usePharmacieStore()

const prescriptionId = computed(() => route.params.id)
const prescription = computed(() => store.selectedPrescription)

onMounted(async () => {
  try {
    await store.fetchPrescriptionById(prescriptionId.value)
  } catch {
    router.push('/pharmacie')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail prescription</h1>

        <p class="his-page-subtitle">
          Médicaments prescrits, quantité, dosage et statut de chaque ligne.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/pharmacie">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la prescription...
    </div>

    <div v-else-if="prescription" class="space-y-6">
      <PharmacieIdentityCard :prescription="prescription" />

      <BaseCard
        title="Médicaments prescrits"
        subtitle="Liste complète des médicaments et instructions."
      >
        <div class="space-y-3">
          <div
            v-for="(item, index) in prescription.medicaments"
            :key="index"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex flex-col justify-between gap-2 md:flex-row md:items-start">
              <div>
                <p class="font-semibold text-slate-900">
                  {{ item.medicament }}
                </p>

                <p class="mt-1 text-sm text-slate-500">
                  Dosage : {{ item.dosage || '—' }} · Quantité : {{ item.quantite || '—' }}
                </p>
              </div>

              <PharmacieStatusBadge :statut="item.status" />
            </div>

            <div class="mt-4 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
              <p>
                <strong class="text-slate-900">Fréquence :</strong>
                {{ item.frequence || '—' }}
              </p>

              <p>
                <strong class="text-slate-900">Durée :</strong>
                {{ item.duree || '—' }}
              </p>

              <p>
                <strong class="text-slate-900">Instructions :</strong>
                {{ item.instructions || '—' }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
