# Modules frontend HIS CAC

## Patients

### Responsibility

Le module frontend `patients` présente et orchestre la fiche permanente d'un Patient.

Il couvre :
- la recherche et la liste des patients ;
- la création d'une fiche ;
- l'affichage du détail ;
- la modification d'une fiche ;
- l'archivage explicite ;
- la résolution UX des correspondances possibles lors de la création ;
- l'accès au dossier Patient et à la timeline.

Un Patient représente une personne et sa fiche permanente. Il ne doit pas être confondu avec un Episode de soins.

### Pages et composants

Pages principales :
- `src/modules/patients/pages/PatientsListPage.vue` ;
- `src/modules/patients/pages/PatientCreatePage.vue` ;
- `src/modules/patients/pages/PatientDetailsPage.vue` ;
- `src/modules/patients/pages/PatientEditPage.vue`.

Composants principaux :
- `PatientForm.vue` ;
- `PatientIdentityCard.vue` ;
- `PatientSearchBar.vue` ;
- `PatientStatusBadge.vue` ;
- `PatientTable.vue`.

L'accès au dossier médical est également utilisé par le module DME via `PatientMedicalRecordPage.vue`.

### Routing et RBAC

Le routing Patient est protégé par rôle et permission.

Permissions utilisées :
- `patient:read` pour la liste et le détail ;
- `patient:create` pour la création ;
- `patient:update` pour la modification et les actions d'archivage autorisées par l'UI.

Le rôle `receptionist` fait partie des rôles admis sur les routes Patient prévues pour la réception.

La sidebar Patient est conditionnée par `patient:read`.

### API frontend

Le service `src/modules/patients/services/patients.service.js` centralise les appels :
- `GET /patients` ;
- `GET /patients/:id` ;
- `GET /patients/:id/dossier` ;
- `GET /patients/:id/timeline` ;
- `POST /patients` ;
- `PATCH /patients/:id` ;
- `DELETE /patients/:id`.

L'archivage frontend utilise donc la route métier dédiée `DELETE /patients/:id` et ne simule pas l'archivage par un `PATCH` générique.

### Store et normalisation

Le store `src/modules/patients/stores/patients.store.js` :
- normalise les réponses API pour l'UI ;
- conserve notamment la compatibilité `middleName` / `postnom`, `birthDate` / `date_naissance` et `phone` / `telephone` ;
- orchestre recherche, chargement, création, modification et archivage ;
- traite les conflits anti-doublon remontés par l'API.

La fonction partagée `src/shared/utils/patient.js` construit le nom affiché à partir de `lastName`, `middleName` et `firstName`.

### Création et correspondances possibles

Le frontend ne décide pas lui-même qu'un doublon existe. Le backend reste l'autorité métier.

Lorsqu'un `POST /patients` retourne :
- `PATIENT_DUPLICATE_SUSPECTED`, ou
- `PATIENT_DUPLICATE_RECHECK_REQUIRED`,

la page de création affiche les correspondances possibles.

L'utilisateur peut :
- ouvrir/utiliser une fiche existante ;
- déclarer qu'aucune fiche proposée ne correspond.

La création d'une nouvelle fiche malgré les correspondances exige une confirmation explicite puis envoie :

```json
{
  "duplicateResolution": {
    "action": "CREATE_NEW",
    "confirmation": "AUCUNE_CORRESPONDANCE",
    "candidateIds": ["..."]
  }
}
```

Le frontend transmet les `candidateIds` correspondant à l'état affiché ; le backend recalcule et valide toujours les correspondances.

### Formulaire Patient

Le formulaire mappe notamment :
- `nom` vers `lastName` ;
- `postnom` vers `middleName` ;
- `prenom` vers `firstName` ;
- `date_naissance` vers `birthDate` ;
- `telephone` vers `phone` ;
- `telephone_urgence` vers `emergencyContactPhone`.

Le formulaire conserve ses validations UI, mais les règles métier persistantes restent autoritaires côté backend.

### Archivage

Depuis la liste, l'archivage passe par une confirmation explicite.

L'interface précise que :
- la fiche n'est pas supprimée physiquement ;
- elle ne doit plus être utilisée comme patient actif.

Après succès, le store reflète le statut `ARCHIVED` et l'action `PATIENT_ARCHIVED`.

### Dossier et contexte Patient

Le frontend peut charger :
- `/patients/:id/dossier` ;
- `/patients/:id/timeline` ;
- `/patients/:id/medical-record` via le module DME.

Le contexte Patient doit rester identifiable et distinct du contexte Episode conformément à la documentation frontend de clôture.

### Tests actifs

La couverture Patient active comprend notamment :
- `tests/patient-api-error-normalization.spec.js` ;
- `tests/patient-archived-status-ui.spec.js` ;
- `tests/patient-archive-semantics-ui.spec.js` ;
- `tests/patient-candidate-matching-ui.spec.js` ;
- `tests/patient-details-middle-name.spec.js` ;
- `tests/patient-display-name-policy.spec.js` ;
- `tests/patient-rbac-permissions.spec.js` ;
- `tests/patient-store-encoding.spec.js` ;
- `tests/reception-create-workflow.spec.js` ;
- `e2e/patient.spec.js`.

Le vrai E2E Patient valide notamment :
1. une création initiale avec réponse `201` ;
2. une création identique conduisant à `409` et à la sélection d'une fiche existante ;
3. une nouvelle tentative avec correspondances ;
4. le choix « Aucune de ces fiches ne correspond » ;
5. la confirmation `CONFIRMER` ;
6. l'envoi exact de `CREATE_NEW`, `AUCUNE_CORRESPONDANCE` et `candidateIds` ;
7. la création finale avec réponse `201`.

### Closure status

Le MVP Patient est techniquement fermé sur les branches `develop` backend et frontend.

Cette section réconcilie la documentation frontend avec le contrat Patient actuellement implémenté et validé par les tests ciblés et le vrai E2E.
