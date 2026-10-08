<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import LaboratoireIdentityCard from '@/modules/laboratoire/components/LaboratoireIdentityCard.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useLaboratoireStore } from '@/modules/laboratoire/stores/laboratoire.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useLaboratoireStore()
const toast = useToastStore()

const examenId = computed(() => route.params.id)
const examen = computed(() => store.selectedExamen)

const confirmOpen = ref(false)

const form = reactive({
  resultText: '',
  resultConclusion: '',
})

const errors = reactive({
  resultText: '',
})

const isPending = computed(() =>
  ['DEMANDE', 'EN_COURS'].includes(
    examen.value?.statut,
  ),
)

const canValidateResult = computed(() => {
  const role = String(
    auth.role || '',
  ).toLowerCase()

  return (
    ['admin', 'laborantin', 'lab_technician', 'lab_biologist'].includes(role) &&
    auth.hasPermission('examen:update_result') &&
    isPending.value
  )
})

const patientName = computed(() =>
  [
    examen.value?.nom,
    examen.value?.postnom,
    examen.value?.prenom,
  ]
    .filter(Boolean)
    .join(' '),
)

onMounted(async () => {
  try {
    await store.fetchExamenById(examenId.value)
  } catch (error) {
    toast.error(
      error?.message ||
        'Examen de laboratoire introuvable.',
    )
    router.push('/laboratoire')
  }
})

function validateDraft() {
  errors.resultText = ''

  if (form.resultText.trim().length < 2) {
    errors.resultText =
      'Le résultat doit contenir au moins 2 caractères.'
  }

  return !errors.resultText
}

function askValidation() {
  if (!validateDraft()) return
  confirmOpen.value = true
}

function closeConfirmation() {
  if (store.saving) return
  confirmOpen.value = false
}

async function confirmValidation() {
  if (!examen.value?.id) return

  try {
    await store.validateResult(
      examen.value.id,
      {
        resultText: form.resultText.trim(),
        resultConclusion:
          form.resultConclusion.trim(),
      },
    )

    confirmOpen.value = false
    form.resultText = ''
    form.resultConclusion = ''
  } catch (error) {
    toast.error(
      error?.message ||
        'Impossible de valider le résultat.',
    )
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">
          Détail laboratoire
        </h1>

        <p class="his-page-subtitle">
          Vérification de la demande et validation du résultat biologique.
        </p>
      </div>

      <RouterLink to="/laboratoire">
        <BaseButton variant="secondary">
          Retour à la file
        </BaseButton>
      </RouterLink>
    </header>

    <div
      v-if="store.loading"
      class="his-card p-8 text-center text-sm text-slate-500"
    >
      Chargement de l’examen...
    </div>

    <div
      v-else-if="examen"
      class="space-y-6"
    >
      <LaboratoireIdentityCard :examen="examen" />

      <BaseCard
        title="Résultat"
        subtitle="Le résultat validé devient définitif dans ce workflow et toute correction ultérieure nécessite un processus audité dédié."
      >
        <div
          v-if="examen.statut === 'RESULTAT_DISPONIBLE'"
          class="space-y-4"
        >
          <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p class="text-sm font-semibold text-emerald-900">
              Résultat validé
            </p>
            <p class="mt-2 whitespace-pre-wrap text-sm text-emerald-900">
              {{ examen.resultat }}
            </p>
          </div>

          <div
            v-if="examen.conclusion"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Conclusion
            </p>
            <p class="mt-2 whitespace-pre-wrap text-sm text-slate-800">
              {{ examen.conclusion }}
            </p>
          </div>
        </div>

        <form
          v-else-if="canValidateResult"
          class="space-y-4"
          @submit.prevent="askValidation"
        >
          <BaseTextarea
            v-model="form.resultText"
            label="Résultat de l’examen"
            placeholder="Saisir le résultat biologique..."
            :rows="6"
            :error="errors.resultText"
            required
          />

          <BaseTextarea
            v-model="form.resultConclusion"
            label="Conclusion"
            placeholder="Conclusion ou interprétation synthétique..."
            :rows="3"
          />

          <div class="flex justify-end">
            <BaseButton
              type="submit"
              variant="success"
            >
              Valider le résultat
            </BaseButton>
          </div>
        </form>

        <div
          v-else
          class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"
        >
          Ce résultat n’est pas modifiable avec votre rôle ou son statut actuel.
        </div>
      </BaseCard>

      <BaseCard
        title="Contexte de la demande"
        subtitle="Informations transmises par la consultation médicale."
      >
        <dl class="grid gap-4 md:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Examen
            </dt>
            <dd class="mt-1 text-sm font-medium text-slate-900">
              {{ examen.examen_principal }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Indication clinique
            </dt>
            <dd class="mt-1 text-sm text-slate-700">
              {{ examen.indication_clinique || 'Non renseignée' }}
            </dd>
          </div>
        </dl>
      </BaseCard>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="Valider définitivement le résultat"
      :message="`Examen : ${examen?.examen_principal || ''}`"
      :patient-name="patientName"
      :patient-id="examen?.numero_patient || examen?.patient_id"
      consequence="Après validation, ce résultat ne pourra plus être écrasé directement. Le backend déterminera automatiquement si l’épisode reste en attente ou retourne en consultation."
      confirm-text="Valider le résultat"
      require-text="CONFIRMER"
      variant="success"
      :loading="store.saving"
      @close="closeConfirmation"
      @confirm="confirmValidation"
    />
  </div>
</template>
