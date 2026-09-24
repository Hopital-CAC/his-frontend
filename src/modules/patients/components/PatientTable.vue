<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import PatientStatusBadge from '@/modules/patients/components/PatientStatusBadge.vue'

defineProps({
  patients: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['archive'])

function fullName(patient) {
  return [patient.nom, patient.postnom, patient.prenom].filter(Boolean).join(' ') || '—'
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
              N° patient
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Sexe / Âge
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Téléphone
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

        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des patients...
            </td>
          </tr>

          <tr v-else-if="patients.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun patient trouvé.
            </td>
          </tr>

          <tr
            v-for="patient in patients"
            v-else
            :key="patient.id || patient.numero_patient"
            class="hover:bg-slate-50"
          >
            <td class="px-4 py-4">
              <div>
                <p class="font-medium text-slate-950">
                  {{ fullName(patient) }}
                </p>
                <p class="mt-1 text-xs text-slate-500">Fiche : {{ patient.numero_fiche || '—' }}</p>
              </div>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ patient.numero_patient || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ patient.sexe || '—' }} / {{ patient.age || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ patient.telephone || '—' }}
            </td>

            <td class="px-4 py-4">
              <PatientStatusBadge :status="patient.statut" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/patients/${patient.id}`">
                  <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
                </RouterLink>

                <RouterLink :to="`/patients/${patient.id}/edit`">
                  <BaseButton variant="secondary" size="sm"> Modifier </BaseButton>
                </RouterLink>

                <BaseButton variant="danger" size="sm" @click="$emit('archive', patient)">
                  Archiver
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        Chargement des patients...
      </div>

      <div
        v-else-if="patients.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucun patient trouvé.
      </div>

      <article
        v-for="patient in patients"
        v-else
        :key="patient.id || patient.numero_patient"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ fullName(patient) }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">N° {{ patient.numero_patient || '—' }}</p>
          </div>

          <PatientStatusBadge :status="patient.statut" />
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <p class="text-slate-500">
            Sexe : <span class="font-medium text-slate-800">{{ patient.sexe || '—' }}</span>
          </p>

          <p class="text-slate-500">
            Âge : <span class="font-medium text-slate-800">{{ patient.age || '—' }}</span>
          </p>

          <p class="col-span-2 text-slate-500">
            Téléphone :
            <span class="font-medium text-slate-800">{{ patient.telephone || '—' }}</span>
          </p>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="`/patients/${patient.id}`">
            <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
          </RouterLink>

          <RouterLink :to="`/patients/${patient.id}/edit`">
            <BaseButton variant="secondary" size="sm"> Modifier </BaseButton>
          </RouterLink>

          <BaseButton variant="danger" size="sm" @click="$emit('archive', patient)">
            Archiver
          </BaseButton>
        </div>
      </article>
    </div>
  </div>
</template>
