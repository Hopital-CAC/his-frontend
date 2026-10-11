<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'
import {
  RouterLink,
  useRoute,
  useRouter,
} from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import {
  canServePrescription,
  createServePrescriptionPayload,
  dispenseErrorMessage,
  dispenseSummary,
  lineCanBeServed,
} from '@/modules/pharmacie/policies/pharmacie-dispensation-ui.policy'
import { usePharmacieStore } from '@/modules/pharmacie/stores/pharmacie.store'
import { useToastStore } from '@/shared/stores/toast.store'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'
import PharmacieIdentityCard from '@/modules/pharmacie/components/PharmacieIdentityCard.vue'
import PharmacieStatusBadge from '@/modules/pharmacie/components/PharmacieStatusBadge.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = usePharmacieStore()
const toast = useToastStore()

const prescriptionId = computed(
  () => route.params.id,
)

const prescription = computed(
  () => store.selectedPrescription,
)

const quantities = reactive({})
const confirmOpen = ref(false)

const canDeliver = computed(() =>
  canServePrescription(
    auth,
    prescription.value,
  ),
)

function servedQuantity(lineId) {
  return store.servedQuantityByLine(
    lineId,
  )
}

function remainingQuantity(line) {
  return Math.max(
    0,
    Number(line?.quantite || 0) -
      servedQuantity(line?.id),
  )
}

const servePayload = computed(() =>
  createServePrescriptionPayload(
    prescription.value,
    quantities,
    servedQuantity,
  ),
)

const confirmationConsequence =
  computed(() =>
    dispenseSummary(
      servePayload.value,
    ),
  )

function resetQuantities() {
  for (
    const key of Object.keys(quantities)
  ) {
    delete quantities[key]
  }
}

async function loadPrescription() {
  await store.fetchPrescriptionById(
    prescriptionId.value,
  )

  await store.fetchDispenses({
    prescriptionId:
      prescriptionId.value,
    page: 1,
    limit: 100,
  })

  resetQuantities()
}

function openDispenseConfirmation() {
  if (
    !canDeliver.value ||
    !servePayload.value ||
    store.dispensing
  ) {
    return
  }

  confirmOpen.value = true
}

function closeDispenseConfirmation() {
  if (store.dispensing) return

  confirmOpen.value = false
}

async function confirmDispense() {
  const payload = servePayload.value

  if (!payload) return

  try {
    await store.servePrescription(
      payload,
    )

    confirmOpen.value = false
    resetQuantities()

    toast.success(
      'Dispensation enregistrée avec succès.',
    )
  } catch (error) {
    toast.error(
      dispenseErrorMessage(error),
    )
  }
}

onMounted(async () => {
  try {
    await loadPrescription()
  } catch (error) {
    toast.error(
      error?.message ||
        'Prescription introuvable.',
    )

    router.push('/pharmacie')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
    >
      <div>
        <h1 class="his-page-title">
          Détail prescription
        </h1>

        <p class="his-page-subtitle">
          Médicaments prescrits, quantités
          restantes et dispensation pharmacie.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/pharmacie">
          <BaseButton variant="secondary">
            Retour
          </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div
      v-if="store.loading"
      class="his-card p-8 text-center text-sm text-slate-500"
    >
      Chargement de la prescription...
    </div>

    <div
      v-else-if="prescription"
      class="space-y-6"
    >
      <PharmacieIdentityCard
        :prescription="prescription"
      />

      <BaseCard
        title="Médicaments prescrits"
        subtitle="Saisissez uniquement les quantités effectivement délivrées."
      >
        <div class="space-y-3">
          <div
            v-for="item in prescription.medicaments"
            :key="item.id"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div
              class="flex flex-col justify-between gap-3 md:flex-row md:items-start"
            >
              <div>
                <p
                  class="font-semibold text-slate-900"
                >
                  {{ item.medicament }}
                </p>

                <p
                  class="mt-1 text-sm text-slate-500"
                >
                  Dosage :
                  {{ item.dosage || '—' }}
                  · Prescrite :
                  {{ item.quantite || 0 }}
                  · Déjà servie :
                  {{ servedQuantity(item.id) }}
                  · Restante :
                  {{ remainingQuantity(item) }}
                </p>
              </div>

              <PharmacieStatusBadge
                :statut="item.status"
              />
            </div>

            <div
              class="mt-4 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3"
            >
              <p>
                <strong
                  class="text-slate-900"
                >
                  Fréquence :
                </strong>
                {{ item.frequence || '—' }}
              </p>

              <p>
                <strong
                  class="text-slate-900"
                >
                  Durée :
                </strong>
                {{ item.duree || '—' }}
              </p>

              <p>
                <strong
                  class="text-slate-900"
                >
                  Instructions :
                </strong>
                {{ item.instructions || '—' }}
              </p>
            </div>

            <div
              v-if="
                canDeliver &&
                lineCanBeServed(item) &&
                remainingQuantity(item) > 0
              "
              class="mt-4 max-w-xs"
            >
              <label
                :for="`serve-${item.id}`"
                class="mb-1 block text-sm font-medium text-slate-700"
              >
                Quantité à délivrer
              </label>

              <input
                :id="`serve-${item.id}`"
                v-model.number="quantities[item.id]"
                type="number"
                min="1"
                :max="remainingQuantity(item)"
                step="1"
                :disabled="store.dispensing"
                class="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus"
              />

              <p
                class="mt-1 text-xs text-slate-500"
              >
                Maximum :
                {{ remainingQuantity(item) }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard
        v-if="canDeliver"
        title="Dispensation"
        subtitle="L’opération est transactionnelle et auditée côté serveur."
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p
            class="text-sm text-slate-600"
          >
            Sélectionnez au moins une quantité
            valide puis confirmez explicitement
            la délivrance.
          </p>

          <BaseButton
            variant="success"
            :loading="store.dispensing"
            :disabled="
              !servePayload ||
              store.dispensing
            "
            @click="openDispenseConfirmation"
          >
            Délivrer cette prescription
          </BaseButton>
        </div>
      </BaseCard>

      <div
        v-else
        class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
      >
        La dispensation n’est pas disponible
        pour votre rôle ou pour l’état actuel
        de cette prescription.
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="Confirmer la dispensation"
      message="Vérifiez les médicaments et les quantités avant de valider cette sortie pharmacie."
      :patient-name="
        [
          prescription?.nom,
          prescription?.postnom,
          prescription?.prenom,
        ]
          .filter(Boolean)
          .join(' ')
      "
      :patient-id="
        prescription?.numero_patient || ''
      "
      :consequence="
        confirmationConsequence
      "
      confirm-text="Valider la dispensation"
      require-text="CONFIRMER"
      variant="success"
      :loading="store.dispensing"
      @close="closeDispenseConfirmation"
      @confirm="confirmDispense"
    />
  </div>
</template>
