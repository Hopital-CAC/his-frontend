<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import PharmacieStatusBadge from '@/modules/pharmacie/components/PharmacieStatusBadge.vue'

defineProps({
  prescriptions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})


function fullName(item) {
  return [item.nom, item.postnom, item.prenom].filter(Boolean).join(' ') || '—'
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Patient
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Médicament
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Dosage
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Quantité
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Statut
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des prescriptions...
            </td>
          </tr>

          <tr v-else-if="prescriptions.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucune prescription trouvée.
            </td>
          </tr>

          <tr v-for="item in prescriptions" v-else :key="item.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(item) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Patient N° {{ item.numero_patient }} · Fiche {{ item.numero_fiche }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.medicament_principal }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.dosage || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.quantite || '—' }}
            </td>

            <td class="px-4 py-4">
              <PharmacieStatusBadge :statut="item.statut" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/pharmacie/${item.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        Chargement des prescriptions...
      </div>

      <div
        v-else-if="prescriptions.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucune prescription trouvée.
      </div>

      <article
        v-for="item in prescriptions"
        v-else
        :key="item.id"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ item.medicament_principal }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{ fullName(item) }}
            </p>
          </div>

          <PharmacieStatusBadge :statut="item.statut" />
        </div>

        <p class="mt-4 text-sm text-slate-600">
          Dosage :
          <span class="font-medium text-slate-900">
            {{ item.dosage || '—' }}
          </span>
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="`/pharmacie/${item.id}`">
            <BaseButton variant="secondary" size="sm">Voir</BaseButton>
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>

