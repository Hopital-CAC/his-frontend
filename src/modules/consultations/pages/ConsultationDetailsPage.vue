<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  RouterLink,
  useRoute,
  useRouter,
} from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import ConsultationClinicalForm from '@/modules/consultations/components/ConsultationClinicalForm.vue'
import ConsultationClinicalHistoryDrawer from '@/modules/consultations/components/ConsultationClinicalHistoryDrawer.vue'
import ConsultationExamRequestDrawer from '@/modules/consultations/components/ConsultationExamRequestDrawer.vue'
import ConsultationPrescriptionDrawer from '@/modules/consultations/components/ConsultationPrescriptionDrawer.vue'
import ConsultationCloseDrawer from '@/modules/consultations/components/ConsultationCloseDrawer.vue'
import ConsultationIdentityCard from '@/modules/consultations/components/ConsultationIdentityCard.vue'
import {
  canEditClinicalConsultation,
  clinicalUpdateErrorMessage,
  isClinicalVersionConflict,
} from '@/modules/consultations/policies/consultation-clinical-ui.policy'
import {
  canReadClinicalHistory,
} from '@/modules/consultations/policies/consultation-clinical-history-ui.policy'
import {
  canRequestConsultationExamen,
  createConfirmedExamenBatch,
  examenBatchSummary,
  examenRequestErrorMessage,
} from '@/modules/consultations/policies/consultation-examen-request-ui.policy'
import {
  canCreateConsultationPrescription,
  createConfirmedPrescription,
  prescriptionErrorMessage,
  prescriptionSummary,
} from '@/modules/consultations/policies/consultation-prescription-ui.policy'
import {
  canCloseConsultation,
  consultationCloseDecisionLabel,
  consultationCloseErrorMessage,
  createConfirmedConsultationClose,
  isConsultationCloseVersionConflict,
} from '@/modules/consultations/policies/consultation-close-ui.policy'
import { useConsultationsStore } from '@/modules/consultations/stores/consultations.store'

import { useToastStore } from '@/shared/stores/toast.store'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useConsultationsStore()
const toast = useToastStore()

const consultationId = computed(
  () => route.params.id,
)

const consultation = computed(
  () => store.selectedConsultation,
)

const versionConflict = ref(false)
const clinicalHistoryOpen = ref(false)
const examenDrawerOpen = ref(false)
const examenConfirmOpen = ref(false)
const examenDraft = ref(null)
const prescriptionDrawerOpen = ref(false)
const prescriptionConfirmOpen = ref(false)
const prescriptionDraft = ref(null)
const closeDrawerOpen = ref(false)
const closeConfirmOpen = ref(false)
const closeDraft = ref(null)
const closeVersionConflict = ref(false)
const clinicalDirty = ref(false)

const isActive = computed(
  () =>
    String(
      consultation.value?.statut || '',
    ).toUpperCase() === 'EN_COURS',
)

const canEditClinical = computed(() =>
  canEditClinicalConsultation(
    auth,
    consultation.value,
  ),
)

const canReadHistory = computed(() =>
  canReadClinicalHistory(auth),
)

const canRequestExamen = computed(() =>
  canRequestConsultationExamen(
    auth,
    consultation.value,
  ),
)

const examenRequestDisabled = computed(
  () =>
    !canRequestExamen.value ||
    clinicalDirty.value ||
    store.requestingExamen ||
    store.creatingPrescription ||
    store.closingConsultation,
)

const canCreatePrescription = computed(() =>
  canCreateConsultationPrescription(
    auth,
    consultation.value,
  ),
)

const prescriptionDisabled = computed(
  () =>
    !canCreatePrescription.value ||
    clinicalDirty.value ||
    store.creatingPrescription ||
    store.requestingExamen ||
    store.closingConsultation,
)

const canClose = computed(() =>
  canCloseConsultation(
    auth,
    consultation.value,
  ),
)

const closeDisabled = computed(
  () =>
    !canClose.value ||
    clinicalDirty.value ||
    store.savingClinical ||
    store.requestingExamen ||
    store.creatingPrescription ||
    store.closingConsultation ||
    closeVersionConflict.value,
)

const patientDisplayName = computed(() =>
  [
    consultation.value?.nom,
    consultation.value?.postnom,
    consultation.value?.prenom,
  ]
    .filter(Boolean)
    .join(' ')
    .trim(),
)

const examenConfirmationConsequence = computed(
  () => {
    if (!examenDraft.value) return ''

    return (
      `Examens demandés : ${examenBatchSummary(examenDraft.value)}. ` +
      'Chaque examen restera indépendant. L’épisode passera ou restera en attente de résultats jusqu’à ce que tous les examens actifs disposent de leur résultat.'
    )
  },
)

const prescriptionConfirmationConsequence =
  computed(() => {
    if (!prescriptionDraft.value) return ''

    const notes =
      prescriptionDraft.value.clinicalNotes
        ? ` Notes cliniques : ${prescriptionDraft.value.clinicalNotes}.`
        : ''

    return (
      `Prescription : ${prescriptionSummary(prescriptionDraft.value)}.` +
      notes +
      ' Après confirmation, la prescription sera validée et l’épisode passera en pharmacie.'
    )
  })

const closeConfirmationConsequence = computed(
  () => {
    if (!closeDraft.value) return ''

    return (
      `Diagnostic final : ${closeDraft.value.finalDiagnosis}. ` +
      `Décision : ${consultationCloseDecisionLabel(closeDraft.value.decision)}. ` +
      'Après confirmation, la consultation sera clôturée et l’épisode sera orienté selon cette décision.'
    )
  },
)

async function loadConsultation() {
  versionConflict.value = false
  closeVersionConflict.value = false

  try {
    await store.fetchConsultationById(
      consultationId.value,
    )
  } catch {
    router.push(
      '/consultations/dashboard',
    )
  }
}

async function openClinicalHistory() {
  if (!canReadHistory.value) return

  clinicalHistoryOpen.value = true
  store.clearClinicalHistory()

  try {
    await store.fetchClinicalHistory(
      consultationId.value,
      {
        page: 1,
        limit: 20,
      },
    )
  } catch (error) {
    toast.error(
      error?.message ||
        'Historique clinique indisponible.',
    )
  }
}

function closeClinicalHistory() {
  clinicalHistoryOpen.value = false
  store.clearClinicalHistory()
}

async function changeClinicalHistoryPage(page) {
  try {
    await store.fetchClinicalHistory(
      consultationId.value,
      {
        page,
        limit: store.clinicalHistoryLimit,
      },
    )
  } catch (error) {
    toast.error(
      error?.message ||
        'Historique clinique indisponible.',
    )
  }
}

function openExamenDrawer() {
  if (examenRequestDisabled.value) return

  examenDrawerOpen.value = true
}

function closeExamenDrawer() {
  if (store.requestingExamen) return

  examenDrawerOpen.value = false
  examenDraft.value = null
}

function reviewExamenRequest(draft) {
  examenDraft.value = draft
  examenConfirmOpen.value = true
}

function closeExamenConfirmation() {
  if (store.requestingExamen) return

  examenConfirmOpen.value = false
}

async function confirmExamenRequest() {
  if (!examenDraft.value) return

  try {
    await store.requestExamen(
      consultationId.value,
      createConfirmedExamenBatch(
        examenDraft.value,
      ),
    )

    examenConfirmOpen.value = false
    examenDrawerOpen.value = false
    examenDraft.value = null

    toast.success(
      'Demande d’examens enregistrée.',
    )

    await loadConsultation()
  } catch (error) {
    toast.error(
      examenRequestErrorMessage(error),
    )
  }
}

function openPrescriptionDrawer() {
  if (prescriptionDisabled.value) return

  prescriptionDrawerOpen.value = true
}

function closePrescriptionDrawer() {
  if (store.creatingPrescription) return

  prescriptionDrawerOpen.value = false
  prescriptionDraft.value = null
}

function reviewPrescription(draft) {
  prescriptionDraft.value = draft
  prescriptionConfirmOpen.value = true
}

function closePrescriptionConfirmation() {
  if (store.creatingPrescription) return

  prescriptionConfirmOpen.value = false
}

async function confirmPrescription() {
  if (!prescriptionDraft.value) return

  try {
    await store.createPrescription(
      consultationId.value,
      createConfirmedPrescription(
        prescriptionDraft.value,
      ),
    )

    prescriptionConfirmOpen.value = false
    prescriptionDrawerOpen.value = false
    prescriptionDraft.value = null

    toast.success(
      'Prescription enregistrée et transmise à la pharmacie.',
    )

    await loadConsultation()
  } catch (error) {
    toast.error(
      prescriptionErrorMessage(error),
    )
  }
}

function openCloseDrawer() {
  if (closeDisabled.value) return

  closeDrawerOpen.value = true
}

function closeCloseDrawer() {
  if (store.closingConsultation) return

  closeDrawerOpen.value = false
  closeDraft.value = null
}

function reviewClose(draft) {
  closeDraft.value = draft
  closeConfirmOpen.value = true
}

function closeCloseConfirmation() {
  if (store.closingConsultation) return

  closeConfirmOpen.value = false
}

async function confirmClose() {
  if (!closeDraft.value) return

  try {
    await store.closeConsultation(
      consultationId.value,
      createConfirmedConsultationClose(
        closeDraft.value,
      ),
    )

    closeConfirmOpen.value = false
    closeDrawerOpen.value = false
    closeDraft.value = null
    closeVersionConflict.value = false

    toast.success(
      'Consultation clôturée avec succès.',
    )

    await loadConsultation()
  } catch (error) {
    closeVersionConflict.value =
      isConsultationCloseVersionConflict(
        error,
      )

    if (closeVersionConflict.value) {
      closeConfirmOpen.value = false
    }

    toast.error(
      consultationCloseErrorMessage(error),
    )
  }
}

function handleClinicalDirtyChange(value) {
  clinicalDirty.value = Boolean(value)
}

async function saveClinical(payload) {
  try {
    await store.updateClinical(
      consultationId.value,
      payload,
    )

    versionConflict.value = false

    toast.success(
      'Informations cliniques enregistrées.',
    )
  } catch (error) {
    versionConflict.value =
      isClinicalVersionConflict(error)

    toast.error(
      clinicalUpdateErrorMessage(error),
    )
  }
}

onMounted(loadConsultation)
</script>

<template>
  <div class="space-y-6">
    <header
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
    >
      <div>
        <h1 class="his-page-title">
          Dossier clinique
        </h1>

        <p class="his-page-subtitle">
          Saisie médicale progressive de la
          consultation en cours.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink
          to="/consultations/dashboard"
        >
          <BaseButton variant="secondary">
            Retour à la file
          </BaseButton>
        </RouterLink>

        <BaseButton
          v-if="canReadHistory"
          variant="secondary"
          @click="openClinicalHistory"
        >
          Historique clinique
        </BaseButton>

        <RouterLink to="/consultations">
          <BaseButton variant="secondary">
            Historique des consultations
          </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div
      v-if="store.loading"
      class="his-card p-8 text-center text-sm text-slate-500"
    >
      Chargement de la consultation...
    </div>

    <div
      v-else-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      role="alert"
    >
      {{ store.error }}
    </div>

    <div
      v-else-if="consultation"
      class="space-y-6"
    >
      <ConsultationIdentityCard
        :consultation="consultation"
      />

      <div
        v-if="isActive"
        class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
      >
        La consultation est en cours. Les
        informations ci-dessous peuvent être
        enregistrées progressivement sans
        clôturer le dossier.
      </div>

      <div
        v-else
        class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
      >
        Cette consultation n’est plus en cours.
        Le dossier clinique est affiché en
        lecture seule.
      </div>

      <ConsultationClinicalForm
        :consultation="consultation"
        :editable="canEditClinical"
        :saving="store.savingClinical"
        :conflict="versionConflict"
        @save="saveClinical"
        @reload="loadConsultation"
        @dirty-change="handleClinicalDirtyChange"
      />

      <section
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2
              class="text-base font-bold text-slate-950"
            >
              Examens complémentaires
            </h2>

            <p
              class="mt-1 text-sm text-slate-600"
            >
              Demandez un examen depuis cette
              consultation. Le patient, l’épisode,
              le service et le médecin sont
              déterminés par le backend.
            </p>

            <p
              v-if="clinicalDirty"
              class="mt-2 text-sm font-medium text-amber-700"
            >
              Enregistrez d’abord les modifications
              cliniques en cours avant de demander
              un examen.
            </p>

            <p
              v-else-if="
                consultation.episode_status ===
                'EN_ATTENTE_RESULTATS'
              "
              class="mt-2 text-sm text-blue-700"
            >
              Des résultats sont déjà attendus.
              Une demande complémentaire reste
              possible pour le médecin affecté.
            </p>
          </div>

          <BaseButton
            v-if="canRequestExamen"
            variant="secondary"
            :disabled="examenRequestDisabled"
            @click="openExamenDrawer"
          >
            Demander des examens
          </BaseButton>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2
              class="text-base font-bold text-slate-950"
            >
              Prescription
            </h2>

            <p
              class="mt-1 text-sm text-slate-600"
            >
              Prescrivez un traitement depuis la
              consultation active. Le patient,
              l’épisode, le service et le médecin
              prescripteur sont déterminés par le
              backend.
            </p>

            <p
              v-if="clinicalDirty"
              class="mt-2 text-sm font-medium text-amber-700"
            >
              Enregistrez d’abord les modifications
              cliniques en cours avant de prescrire.
            </p>

            <p
              v-else-if="
                consultation.episode_status ===
                  'EN_ATTENTE_RESULTATS'
              "
              class="mt-2 text-sm font-medium text-amber-700"
            >
              Des résultats sont encore attendus.
              La prescription sera disponible
              lorsque l’épisode sera revenu en
              consultation.
            </p>

            <p
              v-else-if="
                consultation.episode_status ===
                  'EN_PHARMACIE'
              "
              class="mt-2 text-sm text-blue-700"
            >
              Le patient est actuellement orienté
              vers la pharmacie.
            </p>
          </div>

          <BaseButton
            v-if="canCreatePrescription"
            :disabled="prescriptionDisabled"
            @click="openPrescriptionDrawer"
          >
            Prescrire
          </BaseButton>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h2
              class="text-base font-bold text-slate-950"
            >
              Clôture de la consultation
            </h2>

            <p
              class="mt-1 text-sm text-slate-600"
            >
              Enregistrez un diagnostic final et une
              décision terminale. La transition de
              l’épisode est contrôlée par le backend.
            </p>

            <p
              v-if="clinicalDirty"
              class="mt-2 text-sm font-medium text-amber-700"
            >
              Enregistrez d’abord les modifications
              cliniques en cours avant de clôturer.
            </p>

            <div
              v-if="closeVersionConflict"
              class="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
            >
              <p
                class="text-sm font-medium text-amber-800"
              >
                La consultation a changé depuis son
                chargement. Actualisez le dossier avant
                de recommencer la clôture.
              </p>

              <BaseButton
                class="mt-3"
                variant="secondary"
                @click="loadConsultation"
              >
                Actualiser le dossier
              </BaseButton>
            </div>
          </div>

          <BaseButton
            v-if="canClose"
            variant="danger"
            :disabled="closeDisabled"
            @click="openCloseDrawer"
          >
            Clôturer la consultation
          </BaseButton>
        </div>

        <div
          v-if="
            !isActive &&
            (
              consultation.closed_at ||
              consultation.decision ||
              consultation.diagnostique
            )
          "
          class="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Diagnostic final
            </p>
            <p
              class="mt-1 text-sm font-medium text-slate-900"
            >
              {{ consultation.diagnostique || '—' }}
            </p>
          </div>

          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Décision finale
            </p>
            <p
              class="mt-1 text-sm font-medium text-slate-900"
            >
              {{
                consultation.decision
                  ? consultationCloseDecisionLabel(
                      consultation.decision,
                    )
                  : '—'
              }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <ConsultationExamRequestDrawer
      :open="examenDrawerOpen"
      :consultation="consultation"
      :loading="store.requestingExamen"
      @close="closeExamenDrawer"
      @review="reviewExamenRequest"
    />

    <ConfirmDialog
      :open="examenConfirmOpen"
      title="Confirmer la demande d’examens"
      message="Vérifiez les informations avant de transmettre cette demande."
      :patient-name="patientDisplayName"
      :patient-id="consultation?.numero_patient || ''"
      :consequence="examenConfirmationConsequence"
      confirm-text="Demander les examens"
      require-text="CONFIRMER"
      variant="primary"
      :loading="store.requestingExamen"
      @close="closeExamenConfirmation"
      @confirm="confirmExamenRequest"
    />

    <ConsultationPrescriptionDrawer
      :open="prescriptionDrawerOpen"
      :consultation="consultation"
      :loading="store.creatingPrescription"
      @close="closePrescriptionDrawer"
      @review="reviewPrescription"
    />

    <ConfirmDialog
      :open="prescriptionConfirmOpen"
      title="Confirmer la prescription"
      message="Vérifiez attentivement chaque médicament avant validation."
      :patient-name="patientDisplayName"
      :patient-id="consultation?.numero_patient || ''"
      :consequence="prescriptionConfirmationConsequence"
      confirm-text="Valider la prescription"
      require-text="CONFIRMER"
      variant="success"
      :loading="store.creatingPrescription"
      @close="closePrescriptionConfirmation"
      @confirm="confirmPrescription"
    />

    <ConsultationCloseDrawer
      :open="closeDrawerOpen"
      :consultation="consultation"
      :loading="store.closingConsultation"
      @close="closeCloseDrawer"
      @review="reviewClose"
    />

    <ConfirmDialog
      :open="closeConfirmOpen"
      title="Confirmer la clôture"
      message="Vérifiez le diagnostic final et la décision avant cette action définitive."
      :patient-name="patientDisplayName"
      :patient-id="consultation?.numero_patient || ''"
      :consequence="closeConfirmationConsequence"
      confirm-text="Clôturer la consultation"
      require-text="CONFIRMER"
      variant="danger"
      :loading="store.closingConsultation"
      @close="closeCloseConfirmation"
      @confirm="confirmClose"
    />

    <ConsultationClinicalHistoryDrawer
      :open="clinicalHistoryOpen"
      :consultation="consultation"
      :items="store.clinicalHistoryItems"
      :loading="store.clinicalHistoryLoading"
      :error="store.clinicalHistoryError"
      :page="store.clinicalHistoryPage"
      :limit="store.clinicalHistoryLimit"
      :count="store.clinicalHistoryCount"
      :has-prev="store.clinicalHistoryHasPrev"
      :has-next="store.clinicalHistoryHasNext"
      @close="closeClinicalHistory"
      @page-change="changeClinicalHistoryPage"
    />
  </div>
</template>
