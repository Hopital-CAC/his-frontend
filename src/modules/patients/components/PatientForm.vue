<script setup>
import { computed, reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

const props = defineProps({
  initialValue: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: 'Enregistrer patient',
  },
  prefillValue: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

//const todayIso = new Date().toISOString()

const form = reactive({
  numero_patient: '',
  numero_fiche: '',
  nom: '',
  postnom: '',
  prenom: '',
  sexe: '',
  date_naissance: '',
  age: '',
  telephone: '',
  adresse: '',
  personne_contacter: '',
  telephone_urgence: '',
  etat_civil: '',
  montant_fiche: 0,
  paiement_effectue: false,
  mode_paiement: '',
  agent_cac_id: '',
  type_relation: '',
  nom_du_beneficiaire: '',
  statut: 'active',
  lien_contact_urgence: '',
})

const errors = reactive({})

const sexeOptions = [
  { label: 'Masculin', value: 'M' },
  { label: 'Féminin', value: 'F' },
]

const etatCivilOptions = [
  { label: 'Célibataire', value: 'Célibataire' },
  { label: 'Marié(e)', value: 'Marié' },
  { label: 'Divorcé(e)', value: 'Divorcé' },
  { label: 'Veuf / Veuve', value: 'Veuf' },
]

const lienContactOptions = [
  { label: 'Père', value: 'Père' },
  { label: 'Mère', value: 'Mère' },
  { label: 'Conjoint(e)', value: 'Conjoint(e)' },
  { label: 'Frère', value: 'Frère' },
  { label: 'Sœur', value: 'Sœur' },
  { label: 'Enfant', value: 'Enfant' },
  { label: 'Tuteur', value: 'Tuteur' },
  { label: 'Ami(e)', value: 'Ami(e)' },
  { label: 'Autre', value: 'Autre' },
]

const paiementOptions = [
  { label: 'Espèces', value: 'CASH' },
  { label: 'Mobile Money', value: 'MM' },
  { label: 'Carte bancaire', value: 'CARD' },
  { label: 'Chèque', value: 'CHEQUE' },
  { label: 'Virement', value: 'VIREMENT' },
]

const relationOptions = [
  { label: 'Agent lui-même', value: 'SELF' },
  { label: 'Conjoint(e)', value: 'SPOUSE' },
  { label: 'Enfant', value: 'CHILD' },
  { label: 'Parent', value: 'PARENT' },
]

const statutOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

const isEdit = computed(() => Boolean(props.initialValue))
const isAgentBeneficiary = computed(() => Boolean(form.agent_cac_id))

const agentBeneficiaryLabel = computed(() => {
  if (!isAgentBeneficiary.value) return ''

  const labels = {
    SELF: 'Agent lui-même',
    SPOUSE: 'Conjoint(e)',
    CHILD: 'Enfant',
    PARENT: 'Parent',
  }

  return labels[form.type_relation] || 'Bénéficiaire agent CAC'
})

watch(
  () => props.initialValue || props.prefillValue,
  (patient) => {
    if (!patient) return

    form.numero_patient = patient.numero_patient || patient.patientCode || ''
    form.numero_fiche = patient.numero_fiche || patient.patientCode || ''
    form.nom = patient.nom || patient.lastName || ''
    form.postnom = patient.postnom || patient.middleName || ''
    form.prenom = patient.prenom || patient.firstName || ''
    form.sexe = patient.sexe || patient.gender || ''
    form.date_naissance = patient.date_naissance || patient.birthDate || ''
    form.age = patient.age || patient.estimatedAge || ''
    form.telephone = patient.telephone || patient.phone || ''
    form.adresse = patient.adresse || patient.address || ''
    form.statut = patient.statut || patient.status || 'ACTIVE'

    form.personne_contacter =
      patient.emergencyContactName ||
      patient.personne_contacter ||
      ''

    form.telephone_urgence =
      patient.emergencyContactPhone ||
      patient.telephone_urgence ||
      ''

    form.lien_contact_urgence = patient.lien_contact_urgence || ''
    form.etat_civil = patient.etat_civil || ''

    form.agent_cac_id = patient.agentReference || patient.agent_cac_id || ''
    form.type_relation = patient.relationToAgent || patient.type_relation || ''

    form.nom_du_beneficiaire =
      patient.nom_du_beneficiaire ||
      [form.nom, form.postnom, form.prenom].filter(Boolean).join(' ')
  },
  {
    immediate: true,
  },
)

watch(
  () => [form.agent_cac_id, form.type_relation],
  () => {
    if (!form.agent_cac_id) return

    form.montant_fiche = 0
    form.paiement_effectue = true
    form.mode_paiement = 'AGENT_CAC'

    if (!form.nom_du_beneficiaire) {
      form.nom_du_beneficiaire = [form.nom, form.postnom, form.prenom].filter(Boolean).join(' ')
    }
  },
  {
    immediate: true,
  },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validate() {
  clearErrors()

  if (!form.nom) errors.nom = 'Nom obligatoire.'
  if (!form.prenom) errors.prenom = 'Prénom obligatoire.'
  if (!form.sexe) errors.sexe = 'Sexe obligatoire.'

  if (!form.date_naissance && !form.age) {
    errors.date_naissance = 'Date de naissance ou âge obligatoire.'
    errors.age = 'Date de naissance ou âge obligatoire.'
  }

  if (!form.telephone) errors.telephone = 'Téléphone obligatoire.'
  if (!form.adresse) errors.adresse = 'Adresse obligatoire.'

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  const payload = {
    firstName: form.prenom,
    lastName: form.nom,
    middleName: form.postnom || null,
    gender: form.sexe,
    birthDate: form.date_naissance || null,
    estimatedAge: form.date_naissance ? null : Number(form.age) || null,
    phone: form.telephone || null,
    address: form.adresse || null,
    type: form.agent_cac_id ? 'AGENT_CAC' : 'PUBLIC',
    agentReference: form.agent_cac_id || null,
    relationToAgent: form.agent_cac_id ? form.type_relation || 'SELF' : null,
    emergencyContactName: form.personne_contacter || null,
    emergencyContactPhone: form.telephone_urgence || null,
    status: String(form.statut || 'ACTIVE').toUpperCase(),
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === '') {
      payload[key] = null
    }
  })

  return payload
}

function submit() {
  if (!validate()) return

  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard
      title="Identité du patient"
      subtitle="Informations civiles indispensables à l'identification du patient."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput
          v-model="form.numero_patient"
          label="Numéro patient"
          placeholder="PAT-0001"
          required
          :error="errors.numero_patient"
        />

        <BaseInput
          v-model="form.numero_fiche"
          label="Numéro fiche"
          placeholder="FICHE-0001"
          required
          :error="errors.numero_fiche"
        />

        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" required />

        <BaseInput v-model="form.nom" label="Nom" required :error="errors.nom" />

        <BaseInput v-model="form.postnom" label="Postnom" />

        <BaseInput v-model="form.prenom" label="Prénom" required :error="errors.prenom" />

        <BaseSelect
          v-model="form.sexe"
          label="Sexe"
          :options="sexeOptions"
          required
          :error="errors.sexe"
        />

        <BaseInput v-model="form.date_naissance" label="Date de naissance" type="date" />

        <BaseInput v-model="form.age" label="Âge" type="number" required :error="errors.age" />

        <BaseInput v-model="form.telephone" label="Téléphone" required :error="errors.telephone" />

        <BaseSelect
          v-model="form.etat_civil"
          label="État civil"
          :options="etatCivilOptions"
          required
          :error="errors.etat_civil"
        />

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea v-model="form.adresse" label="Adresse" required :error="errors.adresse" />
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Contact d'urgence" subtitle="Personne à contacter en cas de nécessité.">
      <div class="grid gap-4 md:grid-cols-2">
        <BaseInput v-model="form.personne_contacter" label="Personne à contacter" />
        <BaseSelect
          v-model="form.lien_contact_urgence"
          label="Lien avec le patient"
          :options="lienContactOptions"
          placeholder="Sélectionner le lien"
          required
          :error="errors.lien_contact_urgence"
        />
        <BaseInput v-model="form.telephone_urgence" label="Téléphone urgence" />
      </div>
    </BaseCard>
    <div
      v-if="isAgentBeneficiary"
      class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      <strong>{{ agentBeneficiaryLabel }}</strong> confirmé via agent CAC
      <span v-if="form.agent_cac_id">({{ form.agent_cac_id }})</span>. Frais de fiche
      automatiquement exonérés.
    </div>

    <BaseCard
      title="Paiement de la fiche"
      subtitle="Informations financières liées à l'ouverture du dossier."
    >
      <div class="grid gap-4 md:grid-cols-3">
        <BaseInput
          v-model="form.montant_fiche"
          label="Montant fiche"
          type="number"
          :disabled="isAgentBeneficiary"
        />

        <BaseSelect
          v-model="form.mode_paiement"
          label="Mode de paiement"
          :options="paiementOptions"
          :disabled="isAgentBeneficiary"
        />

        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.paiement_effectue"
            type="checkbox"
            :disabled="isAgentBeneficiary"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <span class="text-sm font-medium text-slate-700"> Paiement effectué </span>
        </label>
      </div>
    </BaseCard>

    <BaseCard title="Lien agent CAC" subtitle="Optionnel : rattachement du patient à un agent CAC.">
      <div class="grid gap-4 md:grid-cols-3">
        <BaseInput v-model="form.agent_cac_id" label="ID agent CAC" />

        <BaseSelect v-model="form.type_relation" label="Relation" :options="relationOptions" />

        <BaseInput v-model="form.nom_du_beneficiaire" label="Nom du bénéficiaire" />
      </div>
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton type="submit" :loading="loading">
        {{ isEdit ? submitLabel : submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
