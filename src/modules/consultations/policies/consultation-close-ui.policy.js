const TERMINAL_DECISIONS = Object.freeze([
  {
    value: 'PRESCRIPTION_DIRECTE',
    label: 'Prescription directe',
    allowedEpisodeStatuses: [
      'EN_PHARMACIE',
      'PRET_SORTIE',
    ],
  },
  {
    value: 'FACTURATION_ACTE',
    label: 'Facturation de l’acte',
    allowedEpisodeStatuses: [
      'EN_CONSULTATION',
    ],
  },
  {
    value: 'HOSPITALISATION_RECOMMANDEE',
    label: 'Hospitalisation recommandée',
    allowedEpisodeStatuses: [
      'EN_CONSULTATION',
    ],
  },
  {
    value: 'SORTIE_AUTORISEE',
    label: 'Sortie autorisée',
    allowedEpisodeStatuses: [
      'EN_CONSULTATION',
    ],
  },
])

const CLOSABLE_EPISODE_STATUSES = Object.freeze([
  'EN_CONSULTATION',
  'EN_PHARMACIE',
  'PRET_SORTIE',
])

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizedEpisodeStatus(consultation) {
  return normalizeText(
    consultation?.episode_status,
  ).toUpperCase()
}

function normalizedConsultationStatus(consultation) {
  return normalizeText(
    consultation?.statut,
  ).toUpperCase()
}

function consultationDoctorId(consultation) {
  return normalizeText(
    consultation?.raw?.doctorUser?.id,
  )
}

function consultationUpdatedAt(consultation) {
  return normalizeText(
    consultation?.updated_at ||
      consultation?.updatedAt ||
      consultation?.raw?.updatedAt ||
      consultation?.raw?.updated_at,
  )
}

export function consultationCloseDecisionOptions(
  consultation,
) {
  const episodeStatus =
    normalizedEpisodeStatus(consultation)

  return TERMINAL_DECISIONS
    .filter((option) =>
      option.allowedEpisodeStatuses.includes(
        episodeStatus,
      ),
    )
    .map(({ value, label }) => ({
      value,
      label,
    }))
}

export function canCloseConsultation(
  auth,
  consultation,
) {
  const roleCode = normalizeText(
    auth?.roleCode,
  ).toUpperCase()

  const actorId = normalizeText(
    auth?.user?.id,
  )

  const doctorId =
    consultationDoctorId(consultation)

  const episodeStatus =
    normalizedEpisodeStatus(consultation)

  return (
    roleCode === 'MEDECIN' &&
    typeof auth?.hasPermission === 'function' &&
    auth.hasPermission('consultation:close') &&
    normalizedConsultationStatus(consultation) ===
      'EN_COURS' &&
    CLOSABLE_EPISODE_STATUSES.includes(
      episodeStatus,
    ) &&
    Boolean(actorId) &&
    Boolean(doctorId) &&
    actorId === doctorId &&
    consultationCloseDecisionOptions(
      consultation,
    ).length > 0
  )
}

export function createConsultationCloseDraft(
  form,
  consultation,
) {
  const finalDiagnosis = normalizeText(
    form?.finalDiagnosis,
  )

  if (
    finalDiagnosis.length < 1 ||
    finalDiagnosis.length > 500
  ) {
    throw new Error(
      'Le diagnostic final est obligatoire et limité à 500 caractères.',
    )
  }

  const decision = normalizeText(
    form?.decision,
  ).toUpperCase()

  const allowedDecisions =
    consultationCloseDecisionOptions(
      consultation,
    ).map((option) => option.value)

  if (!allowedDecisions.includes(decision)) {
    throw new Error(
      'Sélectionnez une décision finale compatible avec l’état actuel de l’épisode.',
    )
  }

  const expectedUpdatedAt =
    consultationUpdatedAt(consultation)

  if (!expectedUpdatedAt) {
    throw new Error(
      'Version de la consultation absente. Actualisez le dossier avant de clôturer.',
    )
  }

  return {
    expectedUpdatedAt,
    finalDiagnosis,
    decision,
  }
}

export function createConfirmedConsultationClose(
  draft,
) {
  return {
    ...draft,
    confirmationAcknowledged: true,
  }
}

export function consultationCloseDecisionLabel(
  decision,
) {
  const normalized =
    normalizeText(decision).toUpperCase()

  return (
    TERMINAL_DECISIONS.find(
      (option) => option.value === normalized,
    )?.label ||
    normalized
  )
}

export function consultationCloseErrorMessage(
  error,
) {
  const messages = {
    CONSULTATION_CLOSE_VERSION_CONFLICT:
      'La consultation a changé depuis son chargement. Actualisez le dossier avant de réessayer.',
    CONSULTATION_CLOSE_ROLE_DENIED:
      'Seul un médecin peut clôturer une consultation.',
    CONSULTATION_CLOSE_DOCTOR_REQUIRED:
      'Aucun médecin n’est affecté à cette consultation.',
    CONSULTATION_CLOSE_DOCTOR_SCOPE_DENIED:
      'Seul le médecin affecté peut clôturer cette consultation.',
    CONSULTATION_CLOSE_SERVICE_REQUIRED:
      'Votre compte médecin n’est affecté à aucun service clinique.',
    CONSULTATION_CLOSE_SERVICE_SCOPE_DENIED:
      'Cette consultation appartient à un autre service clinique.',
    CONSULTATION_CLOSE_NOT_IN_PROGRESS:
      'Cette consultation n’est plus en cours.',
    CONSULTATION_CLOSE_PATIENT_NOT_ACTIVE:
      'La fiche patient n’est plus active.',
    CONSULTATION_CLOSE_SERVICE_UNAVAILABLE:
      'Le service clinique ou son site est indisponible.',
    CONSULTATION_CLOSE_EXAMS_PENDING:
      'Une demande d’examens ne constitue pas une décision de clôture.',
    CONSULTATION_CLOSE_PRESCRIPTION_REQUIRED:
      'La prescription doit être créée avant cette clôture.',
    CONSULTATION_CLOSE_EPISODE_STATE_INVALID:
      'L’état actuel de l’épisode ne permet pas cette décision de clôture.',
    CONSULTATION_CLOSE_DECISION_INVALID:
      'La décision de clôture est invalide.',
    INVALID_CONSULTATION_CLOSE_PAYLOAD:
      'Les informations de clôture sont invalides.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Clôture de la consultation impossible.'
  )
}

export function isConsultationCloseVersionConflict(
  error,
) {
  return (
    error?.code ===
    'CONSULTATION_CLOSE_VERSION_CONFLICT'
  )
}

export {
  CLOSABLE_EPISODE_STATUSES,
  TERMINAL_DECISIONS,
}