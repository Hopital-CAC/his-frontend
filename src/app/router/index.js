import { createRouter, createWebHistory } from 'vue-router'

import AuthLayout from '@/app/layouts/AuthLayout.vue'
import AppLayout from '@/app/layouts/AppLayout.vue'

import LoginPage from '@/modules/auth/pages/LoginPage.vue'
//import ModulePlaceholderPage from '@/modules/_shared/pages/ModulePlaceholderPage.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { getDefaultRoute } from '@/shared/rbac/default-route'

// route Dashboard
import DashboardPage from '@/modules/dashboard/pages/DashboardPage.vue'

// route Patient
import PatientsListPage from '@/modules/patients/pages/PatientsListPage.vue'
import PatientCreatePage from '@/modules/patients/pages/PatientCreatePage.vue'
import PatientDetailsPage from '@/modules/patients/pages/PatientDetailsPage.vue'
import PatientEditPage from '@/modules/patients/pages/PatientEditPage.vue'

// route Réceptions
import ReceptionDashboardPage from '@/modules/receptions/pages/ReceptionDashboardPage.vue'
import ReceptionsListPage from '@/modules/receptions/pages/ReceptionsListPage.vue'
import ReceptionCreatePage from '@/modules/receptions/pages/ReceptionCreatePage.vue'
import ReceptionDetailsPage from '@/modules/receptions/pages/ReceptionDetailsPage.vue'
import ReceptionEditPage from '@/modules/receptions/pages/ReceptionEditPage.vue'

// route Triage
import TriageDashboardPage from '@/modules/triage/pages/TriageDashboardPage.vue'
import TriageListPage from '@/modules/triage/pages/TriageListPage.vue'
import TriageCreatePage from '@/modules/triage/pages/TriageCreatePage.vue'
import TriageDetailsPage from '@/modules/triage/pages/TriageDetailsPage.vue'
import TriageEditPage from '@/modules/triage/pages/TriageEditPage.vue'

// route Consultations
import ConsultationDashboardPage from '@/modules/consultations/pages/ConsultationDashboardPage.vue'
import ConsultationsListPage from '@/modules/consultations/pages/ConsultationsListPage.vue'
import ConsultationDetailsPage from '@/modules/consultations/pages/ConsultationDetailsPage.vue'

// route Laboratoire
import LaboratoireDashboardPage from '@/modules/laboratoire/pages/LaboratoireDashboardPage.vue'
import LaboratoireListPage from '@/modules/laboratoire/pages/LaboratoireListPage.vue'
import LaboratoireDetailsPage from '@/modules/laboratoire/pages/LaboratoireDetailsPage.vue'

// route imagerie
import ImagerieListPage from '@/modules/imagerie/pages/ImagerieListPage.vue'
import ImagerieDetailsPage from '@/modules/imagerie/pages/ImagerieDetailsPage.vue'

// route pharmacie
import PharmacieDashboardPage from '@/modules/pharmacie/pages/PharmacieDashboardPage.vue'
import PharmacieListPage from '@/modules/pharmacie/pages/PharmacieListPage.vue'
import PharmacieCreatePage from '@/modules/pharmacie/pages/PharmacieCreatePage.vue'
import PharmacieDetailsPage from '@/modules/pharmacie/pages/PharmacieDetailsPage.vue'
import PharmacieEditPage from '@/modules/pharmacie/pages/PharmacieEditPage.vue'

// route caisse
import CaisseListPage from '@/modules/caisse/pages/CaisseListPage.vue'
import CaisseCreatePage from '@/modules/caisse/pages/CaisseCreatePage.vue'
import CaisseDetailsPage from '@/modules/caisse/pages/CaisseDetailsPage.vue'
import CaisseEditPage from '@/modules/caisse/pages/CaisseEditPage.vue'

// route sortie
import SortieDetailsPage from '@/modules/sorties/pages/SortieDetailsPage.vue'
import SortieEditPage from '@/modules/sorties/pages/SortieEditPage.vue'

// route agent
import AgentsListPage from '@/modules/agents/pages/AgentsListPage.vue'
import AgentDetailsPage from '@/modules/agents/pages/AgentDetailsPage.vue'
import AgentsStatsPage from '@/modules/agents/pages/AgentsStatsPage.vue'

// route user
import UsersListPage from '@/modules/users/pages/UsersListPage.vue'
import UserCreatePage from '@/modules/users/pages/UserCreatePage.vue'
import UserDetailsPage from '@/modules/users/pages/UserDetailsPage.vue'
import UserEditPage from '@/modules/users/pages/UserEditPage.vue'

// route service
import ServicesListPage from '@/modules/services/pages/ServicesListPage.vue'
import ServiceCreatePage from '@/modules/services/pages/ServiceCreatePage.vue'
import ServiceDetailsPage from '@/modules/services/pages/ServiceDetailsPage.vue'
import ServiceEditPage from '@/modules/services/pages/ServiceEditPage.vue'

// route audit
import AuditListPage from '@/modules/audit/pages/AuditListPage.vue'
import AuditDetailsPage from '@/modules/audit/pages/AuditDetailsPage.vue'

// route settings
import SettingsPage from '@/modules/settings/pages/SettingsPage.vue'

// route rapport
import ReportsDashboardPage from '@/modules/reports/pages/ReportsDashboardPage.vue'

// route notification
import NotificationsListPage from '@/modules/notifications/pages/NotificationsListPage.vue'
import NotificationDetailsPage from '@/modules/notifications/pages/NotificationDetailsPage.vue'

// route rendez-vous
import RendezVousListPage from '@/modules/rendez-vous/pages/RendezVousListPage.vue'
import RendezVousCreatePage from '@/modules/rendez-vous/pages/RendezVousCreatePage.vue'
import RendezVousDetailsPage from '@/modules/rendez-vous/pages/RendezVousDetailsPage.vue'
import RendezVousEditPage from '@/modules/rendez-vous/pages/RendezVousEditPage.vue'

// route stock pharmacie
import PharmacyStockListPage from '@/modules/pharmacy-stock/pages/PharmacyStockListPage.vue'
import PharmacyStockCreatePage from '@/modules/pharmacy-stock/pages/PharmacyStockCreatePage.vue'
import PharmacyStockDetailsPage from '@/modules/pharmacy-stock/pages/PharmacyStockDetailsPage.vue'
import PharmacyStockEditPage from '@/modules/pharmacy-stock/pages/PharmacyStockEditPage.vue'

// route paiements / caisse
import CaisseDashboardPage from '@/modules/paiements/pages/CaisseDashboardPage.vue'
import PaiementsListPage from '@/modules/paiements/pages/PaiementsListPage.vue'
import PaiementCreatePage from '@/modules/paiements/pages/PaiementCreatePage.vue'

      // route facturation
import FacturationDashboardPage from '@/modules/facturation/pages/FacturationDashboardPage.vue'
import FacturesListPage from '@/modules/facturation/pages/FacturesListPage.vue'
import FactureCreatePage from '@/modules/facturation/pages/FactureCreatePage.vue'
import FactureDetailsPage from '@/modules/facturation/pages/FactureDetailsPage.vue'
import FactureEditPage from '@/modules/facturation/pages/FactureEditPage.vue'


  // route centre de commande
import SortieDashboardPage from "@/modules/sorties/pages/SortieDashboardPage.vue"
import PatientMedicalRecordPage from "@/modules/dme/pages/PatientMedicalRecordPage.vue"
import DmeDashboardPage from "@/modules/dme/pages/DmeDashboardPage.vue"
import ClinicalDashboardPage from "@/modules/clinical-dashboard/pages/ClinicalDashboardPage.vue"
import CommandCenterPage from "@/modules/clinical-dashboard/pages/CommandCenterPage.vue"

import AdministrationPage from "@/modules/administration/pages/AdministrationPage.vue"
import HospitalisationCreatePage from "@/modules/hospitalisation/pages/HospitalisationCreatePage.vue"
import HospitalisationDashboardPage from "@/modules/hospitalisation/pages/HospitalisationDashboardPage.vue"
import HospitalisationsListPage from "@/modules/hospitalisation/pages/HospitalisationsListPage.vue"
import SortieCreatePage from "@/modules/sorties/pages/SortieCreatePage.vue"
import SortiesListPage from "@/modules/sorties/pages/SortiesListPage.vue"


import AccessDeniedPage from "@/modules/errors/pages/AccessDeniedPage.vue";
const routes = [
  {
    path: "/acces-refuse",
    name: "access.denied",
    component: AccessDeniedPage,
    meta: {
      title: "Accès refusé",
      public: false,
    },
  },
  {
    path: '/login',
    component: AuthLayout,
    meta: {
      public: true,
    },
    children: [
      {
        path: '',
        name: 'login',
        component: LoginPage,
        meta: {
          title: 'Connexion',
          public: true,
        },
      },
    ],
  },

  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      // route Dashboard
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardPage,
        meta: {
          title: 'Tableau de bord',
          roles: ['admin', 'direction', 'medecin', 'secretaire', 'infirmier', 'caissier'],
        },
      },

      // Routes Patients
      {
        path: 'patients',
        name: 'patients',
        component: PatientsListPage,
        meta: {
          title: 'Patients',
          roles: ['admin', 'direction', 'medecin', 'secretaire', 'infirmier'],
          permission: 'patient:read',
        },
      },
      {
        path: 'patients/create',
        name: 'patients.create',
        component: PatientCreatePage,
        meta: {
          title: 'Créer patient',
          roles: ['admin', 'secretaire', 'infirmier'],
          permission: 'patient:create',
        },
      },
      {
        path: 'patients/:id',
        name: 'patients.details',
        component: PatientDetailsPage,
        meta: {
          title: 'Fiche patient',
          roles: ['admin', 'direction', 'medecin', 'secretaire', 'infirmier'],
          permission: 'patient:read',
        },
      },
      {
        path: 'patients/:id/edit',
        name: 'patients.edit',
        component: PatientEditPage,
        meta: {
          title: 'Modifier patient',
          roles: ['admin', 'secretaire', 'infirmier'],
          permission: 'patient:update',
        },
      },

      // Routes Réceptions
      {
        path: 'receptions/dashboard',
        name: 'receptions.dashboard',
        component: ReceptionDashboardPage,
        meta: {
          title: 'Dashboard Réception',
          roles: ['admin', 'secretaire', 'infirmier'],
          permission: 'reception:read',
        },
      },
      {
        path: 'receptions',
        name: 'receptions',
        component: ReceptionsListPage,
        meta: {
          title: 'Réception / Admissions',
          roles: ['admin', 'secretaire', 'infirmier'],
        },
      },
      {
        path: 'receptions/create',
        name: 'receptions.create',
        component: ReceptionCreatePage,
        meta: {
          title: 'Nouvelle réception',
          roles: ['admin', 'secretaire'],
        },
      },
      {
        path: 'receptions/:id',
        name: 'receptions.details',
        component: ReceptionDetailsPage,
        meta: {
          title: 'Détail réception',
          roles: ['admin', 'secretaire', 'infirmier', 'medecin'],
        },
      },
      {
        path: 'receptions/:id/edit',
        name: 'receptions.edit',
        component: ReceptionEditPage,
        meta: {
          title: 'Modifier réception',
          roles: ['admin', 'secretaire'],
        },
      },

      // Routes Triage
      {
        path: 'triage/dashboard',
        name: 'triage.dashboard',
        component: TriageDashboardPage,
        meta: {
          title: 'Dashboard Triage',
          roles: ['admin', 'infirmier', 'medecin'],
          permission: 'triage:read',
        },
      },
      {
        path: 'triage',
        name: 'triage',
        component: TriageListPage,
        meta: {
          title: 'Triage / Urgences',
          roles: ['admin', 'infirmier', 'medecin'],
        },
      },
      {
        path: 'triage/create',
        name: 'triage.create',
        component: TriageCreatePage,
        meta: {
          title: 'Nouveau triage',
          roles: ['admin', 'infirmier'],
        },
      },
      {
        path: 'triage/:id/edit',
        name: 'triage.edit',
        component: TriageEditPage,
        meta: {
          title: 'Modifier triage',
          roles: ['admin', 'infirmier'],
        },
      },
      {
        path: 'triage/:id',
        name: 'triage.details',
        component: TriageDetailsPage,
        meta: {
          title: 'Détail triage',
          roles: ['admin', 'infirmier', 'medecin'],
        },
      },

      // Routes Consultations
      {
        path: 'consultations/dashboard',
        name: 'consultations.dashboard',
        component: ConsultationDashboardPage,
        meta: {
          title: 'Dashboard Consultation',
          roles: ['admin', 'medecin'],
          permission: 'consultation:read',
        },
      },
      {
        path: 'consultations',
        name: 'consultations',
        component: ConsultationsListPage,
        meta: {
          title: 'Historique des consultations',
          roles: ['admin', 'medecin'],
          permission: 'consultation:read',
        },
      },
      {
        path: 'consultations/create',
        name: 'consultations.create',
        redirect: {
          name: 'consultations.dashboard',
        },
        meta: {
          title: 'File médicale',
          roles: ['admin', 'medecin'],
          permission: 'consultation:read',
        },
      },
      {
        path: 'consultations/:id/edit',
        name: 'consultations.edit',
        redirect: (to) => ({
          name: 'consultations.details',
          params: {
            id: to.params.id,
          },
        }),
        meta: {
          title: 'Détail consultation',
          roles: ['admin', 'medecin'],
          permission: 'consultation:read',
        },
      },
      {
        path: 'consultations/:id',
        name: 'consultations.details',
        component: ConsultationDetailsPage,
        meta: {
          title: 'Détail consultation',
          roles: ['admin', 'medecin', 'infirmier'],
          permission: 'consultation:read',
        },
      },

      // route rendez6vous
      {
        path: 'rendez-vous',
        name: 'rendez-vous',
        component: RendezVousListPage,
        meta: {
          title: 'Rendez-vous',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },
      {
        path: 'rendez-vous/create',
        name: 'rendez-vous.create',
        component: RendezVousCreatePage,
        meta: {
          title: 'Nouveau rendez-vous',
          roles: ['admin', 'secretaire'],
        },
      },
      {
        path: 'rendez-vous/:id/edit',
        name: 'rendez-vous.edit',
        component: RendezVousEditPage,
        meta: {
          title: 'Modifier rendez-vous',
          roles: ['admin', 'secretaire'],
        },
      },
      {
        path: 'rendez-vous/:id',
        name: 'rendez-vous.details',
        component: RendezVousDetailsPage,
        meta: {
          title: 'Détail rendez-vous',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },

      // route Laboratoire — file opérationnelle alimentée par /examens
      {
        path: 'laboratoire/dashboard',
        name: 'laboratoire.dashboard',
        component: LaboratoireDashboardPage,
        meta: {
          title: 'Dashboard Laboratoire',
          roles: ['admin', 'laborantin'],
          permission: 'examen:read',
        },
      },
      {
        path: 'laboratoire',
        name: 'laboratoire',
        component: LaboratoireListPage,
        meta: {
          title: 'Laboratoire',
          roles: ['admin', 'laborantin'],
          permission: 'examen:read',
        },
      },
      {
        path: 'laboratoire/:id',
        name: 'laboratoire.details',
        component: LaboratoireDetailsPage,
        meta: {
          title: 'Détail laboratoire',
          roles: ['admin', 'laborantin'],
          permission: 'examen:read',
        },
      },

      // route imagerie

      {
        path: 'imagerie',
        name: 'imagerie',
        component: ImagerieListPage,
        meta: {
          title: 'Imagerie',
          roles: ['admin', 'imagerie'],
          permission: 'examen:read',
        },
      },
      {
        path: 'imagerie/:id',
        name: 'imagerie.details',
        component: ImagerieDetailsPage,
        meta: {
          title: 'Détail imagerie',
          roles: ['admin', 'imagerie'],
          permission: 'examen:read',
        },
      },

      // route pharmacie
      {
        path: 'pharmacie/dashboard',
        name: 'pharmacie.dashboard',
        component: PharmacieDashboardPage,
        meta: {
          title: 'Dashboard Pharmacie',
          roles: ['admin', 'pharmacien', 'medecin'],
          permission: 'pharmacie:read',
        },
      },
      {
        path: 'pharmacie',
        name: 'pharmacie',
        component: PharmacieListPage,
        meta: {
          title: 'Pharmacie / Prescriptions',
          roles: ['admin', 'medecin', 'pharmacien'],
        },
      },
      {
        path: 'pharmacie/create',
        name: 'pharmacie.create',
        component: PharmacieCreatePage,
        meta: {
          title: 'Nouvelle prescription',
          roles: ['admin', 'medecin', 'pharmacien'],
        },
      },
      {
        path: 'pharmacie/:id/edit',
        name: 'pharmacie.edit',
        component: PharmacieEditPage,
        meta: {
          title: 'Modifier prescription',
          roles: ['admin', 'medecin', 'pharmacien'],
        },
      },
      {
        path: 'pharmacie/:id',
        name: 'pharmacie.details',
        component: PharmacieDetailsPage,
        meta: {
          title: 'Détail prescription',
          roles: ['admin', 'medecin', 'pharmacien'],
        },
      },

      // route stock pharmacie
      {
        path: 'stock-pharmacie',
        name: 'stock-pharmacie',
        component: PharmacyStockListPage,
        meta: {
          title: 'Stock pharmacie',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },
      {
        path: 'stock-pharmacie/create',
        name: 'stock-pharmacie.create',
        component: PharmacyStockCreatePage,
        meta: {
          title: 'Nouveau produit stock',
          roles: ['admin', 'secretaire'],
        },
      },
      {
        path: 'stock-pharmacie/:id/edit',
        name: 'stock-pharmacie.edit',
        component: PharmacyStockEditPage,
        meta: {
          title: 'Modifier produit stock',
          roles: ['admin', 'secretaire'],
        },
      },
      {
        path: 'stock-pharmacie/:id',
        name: 'stock-pharmacie.details',
        component: PharmacyStockDetailsPage,
        meta: {
          title: 'Détail produit stock',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },

      // route caisse

      {
        path: 'caisse',
        name: 'caisse',
        component: CaisseListPage,
        meta: {
          title: 'Caisse / Paiements',
          roles: ['admin', 'caissier', 'secretaire'],
        },
      },
      {
        path: 'caisse/create',
        name: 'caisse.create',
        component: CaisseCreatePage,
        meta: {
          title: 'Nouveau paiement',
          roles: ['admin', 'caissier'],
        },
      },
      {
        path: 'caisse/:id/edit',
        name: 'caisse.edit',
        component: CaisseEditPage,
        meta: {
          title: 'Modifier paiement',
          roles: ['admin', 'caissier'],
        },
      },
      {
        path: 'caisse/:id',
        name: 'caisse.details',
        component: CaisseDetailsPage,
        meta: {
          title: 'Détail paiement',
          roles: ['admin', 'caissier', 'secretaire'],
        },
      },

      // route paiements / caisse
      {
        path: 'paiements/dashboard',
        name: 'paiements.dashboard',
        component: CaisseDashboardPage,
        meta: {
          title: 'Dashboard Caisse',
          roles: ['admin', 'caissier', 'comptable'],
          permission: 'paiement:read',
        },
      },
      {
        path: 'paiements',
        name: 'paiements',
        component: PaiementsListPage,
        meta: {
          title: 'Paiements',
          roles: ['admin', 'caissier', 'comptable'],
          permission: 'paiement:read',
        },
      },
      {
        path: 'paiements/create',
        name: 'paiements.create',
        component: PaiementCreatePage,
        meta: {
          title: 'Enregistrer paiement',
          roles: ['admin', 'caissier'],
          permission: 'paiement:create',
        },
      },
      // route facturation
      {
        path: 'facturation/dashboard',
        name: 'facturation.dashboard',
        component: FacturationDashboardPage,
        meta: {
          title: 'Dashboard Facturation',
          roles: ['admin', 'caissier', 'comptable', 'secretaire'],
          permission: 'facture:read',
        },
      },
      {
        path: 'facturation',
        name: 'facturation',
        component: FacturesListPage,
        meta: {
          title: 'Facturation',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },
      {
        path: 'facturation/create',
        name: 'facturation.create',
        component: FactureCreatePage,
        meta: {
          title: 'Nouvelle facture',
          roles: ['admin', 'secretaire'],
        },
      },
      {
        path: 'facturation/:id/edit',
        name: 'facturation.edit',
        component: FactureEditPage,
        meta: {
          title: 'Modifier facture',
          roles: ['admin', 'secretaire'],
        },
      },
      {
        path: 'facturation/:id',
        name: 'facturation.details',
        component: FactureDetailsPage,
        meta: {
          title: 'Détail facture',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },

      // route clinical dashboard


// route dme
      // route clinical dashboard
      {
        path: 'clinical-dashboard',
        name: 'clinical-dashboard',
        component: ClinicalDashboardPage,
        meta: {
          title: 'Dashboard clinique global',
          roles: ['admin', 'medecin', 'infirmier'],
          permission: 'clinical_dashboard:read',
        },
      },

      {
        path: 'dme/dashboard',
        name: 'dme.dashboard',
        component: DmeDashboardPage,
        meta: {
          title: 'Dashboard DME',
          roles: ['admin', 'medecin', 'infirmier'],
          permission: 'dme:read',
        },
      },
      {
        path: 'dme/patients/:patientId',
        name: 'dme.patient',
        component: PatientMedicalRecordPage,
        meta: {
          title: 'Dossier médical électronique',
          roles: ['admin', 'medecin', 'infirmier'],
          permission: 'dme:read',
        },
      },


// route sorties dashboard
      {
        path: 'sorties/dashboard',
        name: 'sorties.dashboard',
        component: SortieDashboardPage,
        meta: {
          title: 'Dashboard Sorties',
          roles: ['admin', 'medecin', 'secretaire'],
          permission: 'sortie:read',
        },
      },
      // route sortie

      {
        path: 'sorties',
        name: 'sorties',
        component: SortiesListPage,
        meta: {
          title: 'Sorties patient',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },
      {
        path: 'sorties/create',
        name: 'sorties.create',
        component: SortieCreatePage,
        meta: {
          title: 'Nouvelle sortie patient',
          roles: ['admin', 'medecin'],
        },
      },
      {
        path: 'sorties/:id/edit',
        name: 'sorties.edit',
        component: SortieEditPage,
        meta: {
          title: 'Modifier sortie patient',
          roles: ['admin', 'medecin'],
        },
      },
      {
        path: 'sorties/:id',
        name: 'sorties.details',
        component: SortieDetailsPage,
        meta: {
          title: 'Détail sortie patient',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },

      // route agent
      {
        path: 'agents',
        name: 'agents',
        component: AgentsListPage,
        meta: {
          title: 'Agents CAC',
          roles: ['admin', 'secretaire'],
          permission: 'agent:read',
        },
      },
      {
        path: 'agents/statistiques',
        name: 'agents.stats',
        component: AgentsStatsPage,
        meta: {
          title: 'Statistiques agents CAC',
          roles: ['admin', 'secretaire'],
          permission: 'agent:read',
        },
      },
      {
        path: 'agents/:id',
        name: 'agents.details',
        component: AgentDetailsPage,
        meta: {
          title: 'Détail agent CAC',
          roles: ['admin', 'secretaire'],
          permission: 'agent:read',
        },
      },

      // route user
      {
        path: 'users',
        name: 'users',
        component: UsersListPage,
        meta: {
          title: 'Utilisateurs système',
          roles: ['admin'],
        },
      },
      {
        path: 'users/create',
        name: 'users.create',
        component: UserCreatePage,
        meta: {
          title: 'Nouvel utilisateur',
          roles: ['admin'],
        },
      },
      {
        path: 'users/:id/edit',
        name: 'users.edit',
        component: UserEditPage,
        meta: {
          title: 'Modifier utilisateur',
          roles: ['admin'],
        },
      },
      {
        path: 'users/:id',
        name: 'users.details',
        component: UserDetailsPage,
        meta: {
          title: 'Détail utilisateur',
          roles: ['admin'],
        },
      },

      // route service
      {
        path: 'services',
        name: 'services',
        component: ServicesListPage,
        meta: {
          title: 'Services hospitaliers',
          roles: ['admin'],
        },
      },
      {
        path: 'services/create',
        name: 'services.create',
        component: ServiceCreatePage,
        meta: {
          title: 'Nouveau service',
          roles: ['admin'],
        },
      },
      {
        path: 'services/:id/edit',
        name: 'services.edit',
        component: ServiceEditPage,
        meta: {
          title: 'Modifier service',
          roles: ['admin'],
        },
      },
      {
        path: 'services/:id',
        name: 'services.details',
        component: ServiceDetailsPage,
        meta: {
          title: 'Détail service',
          roles: ['admin'],
        },
      },

      // route audit
      {
        path: 'audit',
        name: 'audit',
        component: AuditListPage,
        meta: {
          title: 'Audit / Historique',
          roles: ['admin'],
        },
      },
      {
        path: 'audit/:id',
        name: 'audit.details',
        component: AuditDetailsPage,
        meta: {
          title: 'Détail audit',
          roles: ['admin'],
        },
      },

      // route clinical dashboard


// route dme

// route sorties dashboard
      // route clinical dashboard


// route dme

// route sorties
// route hospitalisation
      {
        path: 'hospitalisation/dashboard',
        name: 'hospitalisation.dashboard',
        component: HospitalisationDashboardPage,
        meta: {
          title: 'Dashboard Hospitalisation',
          roles: ['admin', 'medecin', 'infirmier'],
          permission: 'hospitalisation:read',
        },
      },
      {
        path: 'hospitalisation',
        name: 'hospitalisation',
        component: HospitalisationsListPage,
        meta: {
          title: 'Hospitalisations',
          roles: ['admin', 'medecin', 'infirmier'],
          permission: 'hospitalisation:read',
        },
      },
      {
        path: 'hospitalisation/create',
        name: 'hospitalisation.create',
        component: HospitalisationCreatePage,
        meta: {
          title: 'Nouvelle hospitalisation',
          roles: ['admin', 'medecin'],
          permission: 'hospitalisation:create',
        },
      },
      // route administration
      {
        path: 'administration',
        name: 'administration',
        component: AdministrationPage,
        meta: {
          title: 'Administration',
          roles: ['admin'],
        },
      },

      // route settings
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
        meta: {
          title: 'Paramètres système',
          roles: ['admin'],
        },
      },

      // route notification
      {
        path: 'notifications',
        name: 'notifications',
        component: NotificationsListPage,
        meta: {
          title: 'Notifications',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },
      {
        path: 'notifications/:id',
        name: 'notifications.details',
        component: NotificationDetailsPage,
        meta: {
          title: 'Détail notification',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },

      {
        path: "/command-center",
        name: "command-center",
        component: CommandCenterPage,
        meta: {
            permission: "clinical_dashboard:read",
            title: "Centre de Commande"
        }
      },

      // route rapport
      {
        path: 'reports',
        name: 'reports',
        component: ReportsDashboardPage,
        meta: {
          title: 'Rapports / Statistiques',
          roles: ['admin', 'medecin', 'secretaire'],
        },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

/**
function createModuleRoute(path, title, description, actions = []) {
  return {
    path,
    name: path,
    component: ModulePlaceholderPage,
    meta: {
      title,
      description,
      actions,
      roles: ['admin', 'direction', 'medecin', 'secretaire', 'infirmier', 'caissier'],
    },
  }
}*/

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.initialized) {
    await auth.initialize();
  }

  if (to.meta.public) {
    if (auth.isAuthenticated && to.name === "login") {
      return getDefaultRoute(auth);
    }

    return true;
  }

  if (!auth.isAuthenticated) {
    return {
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    };
  }
  // Un utilisateur authentifié sans permission doit pouvoir voir la page
  // d'accès refusé sans être redirigé en boucle.
  if (to.path === "/acces-refuse") {
    return true;
  }

  const defaultRoute = getDefaultRoute(auth);

  // /dashboard est institutionnel. Les profils opérationnels sont dirigés
  // vers leur espace métier.
  if (to.path === "/dashboard" && defaultRoute !== "/dashboard") {
    return defaultRoute;
  }

  const allowedRoles = Array.isArray(to.meta.roles)
    ? to.meta.roles.map((role) => String(role).toLowerCase())
    : [];

  const userRole = auth.role ? String(auth.role).toLowerCase() : null;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return defaultRoute;
  }

  const requiredPermission = to.meta.permission;

  if (requiredPermission && !auth.hasPermission(requiredPermission)) {
    return defaultRoute;
  }

  return true;
});

export default router

