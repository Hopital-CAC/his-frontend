<script setup>
import {
  computed,
  reactive,
  ref,
  watch,
} from 'vue'

import {
  consultationCloseDecisionOptions,
  createConsultationCloseDraft,
} from '@/modules/consultations/policies/consultation-close-ui.policy'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import Drawer from '@/shared/ui/overlay/Drawer.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  consultation: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'close',
  'review',
])

const form = reactive({
  finalDiagnosis: '',
  decision: '',
})

const localError = ref('')

const decisionOptions = computed(() =>
  consultationCloseDecisionOptions(
    props.consultation,
  ),
)

function reset() {
  form.finalDiagnosis = ''
  form.decision = ''
  localError.value = ''
}

watch(
  () => props.open,
  (open) => {
    if (open) reset()
  },
)

function submit() {
  localError.value = ''

  try {
    emit(
      'review',
      createConsultationCloseDraft(
        form,
        props.consultation,
      ),
    )
  } catch (error) {
    localError.value =
      error?.message ||
      'Informations de clôture invalides.'
  }
}
</script>

<template>
  <Drawer
    :open="open"
    title="Clôturer la consultation"
    :subtitle="
      consultation
        ? `${consultation.consultation_code} · ${consultation.nom || ''} ${consultation.postnom || ''} ${consultation.prenom || ''}`.trim()
        : ''
    "
    width-class="max-w-2xl"
    @close="emit('close')"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <div
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        La clôture est définitive pour cette consultation.
        Renseignez le diagnostic final et choisissez la
        décision correspondant à l’orientation clinique
        réelle du patient. L’état de l’épisode sera contrôlé
        par le backend.
      </div>

      <BaseTextarea
        v-model="form.finalDiagnosis"
        label="Diagnostic final"
        placeholder="Saisissez le diagnostic final retenu..."
        :rows="5"
        required
        :disabled="loading"
      />

      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>500 caractères maximum.</span>
        <span>
          {{ form.finalDiagnosis.trim().length }}/500
        </span>
      </div>

      <BaseSelect
        v-model="form.decision"
        label="Décision finale"
        :options="decisionOptions"
        placeholder="Sélectionner la décision finale"
        required
        :disabled="loading"
      />

      <div
        v-if="decisionOptions.length === 0"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
      >
        Aucune décision de clôture n’est disponible pour
        l’état actuel de l’épisode.
      </div>

      <div
        v-if="localError"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        role="alert"
      >
        {{ localError }}
      </div>

      <div
        class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end"
      >
        <BaseButton
          variant="secondary"
          :disabled="loading"
          @click="emit('close')"
        >
          Annuler
        </BaseButton>

        <BaseButton
          type="submit"
          variant="danger"
          :disabled="
            loading ||
            decisionOptions.length === 0
          "
        >
          Vérifier la clôture
        </BaseButton>
      </div>
    </form>
  </Drawer>
</template>