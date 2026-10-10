<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  statut: {
    type: String,
    default: '',
  },
})

const normalized = computed(() => String(props.statut || '').toUpperCase())

const variant = computed(() => {
  if (normalized.value === 'SERVIE') return 'success'
  if (normalized.value === 'PARTIELLEMENT_SERVIE') return 'warning'
  if (normalized.value === 'ANNULEE') return 'danger'
  if (['VALIDEE', 'PRESCRITE'].includes(normalized.value)) return 'warning'
  return 'neutral'
})

const label = computed(() => {
  const labels = {
    VALIDEE: 'Validée',
    PRESCRITE: 'Prescrite',
    PARTIELLEMENT_SERVIE: 'Partiellement servie',
    SERVIE: 'Servie',
    ANNULEE: 'Annulée',
  }

  return labels[normalized.value] || 'Non défini'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
