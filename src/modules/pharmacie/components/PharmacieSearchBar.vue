<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      q: '',
      statut: '',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  q: '',
  statut: '',
})

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'Validée', value: 'VALIDEE' },
  { label: 'Partiellement servie', value: 'PARTIELLEMENT_SERVIE' },
  { label: 'Servie', value: 'SERVIE' },
  { label: 'Annulée', value: 'ANNULEE' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.statut = ''
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 md:grid-cols-4" @submit.prevent="submit">
    <input
      v-model="form.q"
      type="search"
      placeholder="Rechercher patient, fiche, médicament, dosage..."
      class="min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus md:col-span-2"
    />

    <BaseSelect v-model="form.statut" :options="statutOptions" placeholder="Statut" />

    <div class="flex gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
