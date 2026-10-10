<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";

import BaseBadge from "@/shared/ui/base/BaseBadge.vue";
import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import DataTable from "@/shared/ui/data/DataTable.vue";

import { usePharmacieStore } from "@/modules/pharmacie/stores/pharmacie.store";

const store = usePharmacieStore();

const columns = [
  { key: "numero_fiche", label: "Fiche" },
  { key: "patient", label: "Patient" },
  { key: "medicament", label: "Médicament" },
  { key: "statut", label: "Statut" }
];

const recentRows = computed(() => {
  return store.prescriptions.slice(0, 6).map((item) => ({
    id: item.id,
    numero_fiche: item.numero_fiche,
    patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
    medicament: item.medicament_principal || "Prescription",
    statut: item.statut || "VALIDEE"
  }));
});

const pendingRows = computed(() => {
  return store.prescriptions
    .filter((item) =>
      ["VALIDEE", "PARTIELLEMENT_SERVIE"].includes(String(item.statut || "").toUpperCase())
    )
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      numero_fiche: item.numero_fiche,
      patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
      medicament: item.medicament_principal || "Prescription",
      statut: item.statut || "VALIDEE"
    }));
});

const stats = computed(() => store.pharmacieKpis);

onMounted(() => {
  store.fetchPrescriptions({ page: 1, limit: 10 });
});
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="success">Service Pharmacie</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Pharmacie</h1>

        <p class="his-page-subtitle">
          Consultation en lecture des prescriptions médicales et de leurs statuts.
        </p>
      </div>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
      <BaseCard title="Prescriptions">
        <p class="text-3xl font-bold text-slate-950">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Chargées</p>
      </BaseCard>

      <BaseCard title="Validées">
        <p class="text-3xl font-bold text-amber-600">{{ stats.aServir }}</p>
        <p class="mt-1 text-sm text-slate-500">Statut VALIDEE</p>
      </BaseCard>

      <BaseCard title="Servies">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.delivrees }}</p>
        <p class="mt-1 text-sm text-slate-500">Statut SERVIE</p>
      </BaseCard>

      <BaseCard title="Partiellement servies">
        <p class="text-3xl font-bold text-blue-700">{{ stats.partielles }}</p>
        <p class="mt-1 text-sm text-slate-500">Statut PARTIELLEMENT_SERVIE</p>
      </BaseCard>

      <BaseCard title="Médicaments">
        <p class="text-3xl font-bold text-slate-700">{{ stats.medicaments }}</p>
        <p class="mt-1 text-sm text-slate-500">Lignes prescrites</p>
      </BaseCard>

      <BaseCard title="Patients">
        <p class="text-3xl font-bold text-indigo-700">{{ stats.patients }}</p>
        <p class="mt-1 text-sm text-slate-500">Concernés</p>
      </BaseCard>

      <BaseCard title="Alertes stock">
        <p class="text-3xl font-bold text-rose-700">{{ stats.alertesStock }}</p>
        <p class="mt-1 text-sm text-slate-500">À connecter au stock</p>
      </BaseCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <BaseCard title="Prescriptions actives" subtitle="Prescriptions validées ou partiellement servies.">
        <DataTable
          :columns="columns"
          :rows="pendingRows"
          empty-text="Aucune prescription active."
        />
      </BaseCard>

      <BaseCard title="Activité récente" subtitle="Dernières prescriptions chargées.">
        <DataTable
          :columns="columns"
          :rows="recentRows"
          empty-text="Aucune prescription chargée."
        />

        <div class="mt-5 flex justify-end">
          <RouterLink to="/pharmacie">
            <BaseButton variant="secondary">Voir toutes les prescriptions</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </section>

    <BaseCard title="Règles métier Prescription" subtitle="Consultation en lecture seule des prescriptions.">
      <ul class="space-y-2 text-sm text-slate-600">
        <li>• Vérifier l’identité du patient avant délivrance.</li>
        <li>• Délivrance complète ou partielle doit être traçable.</li>
        <li>• Toute sortie de médicament doit être auditée côté backend.</li>
        <li>• Les alertes stock seront connectées au module stock pharmacie.</li>
      </ul>
    </BaseCard>
  </div>
</template>


