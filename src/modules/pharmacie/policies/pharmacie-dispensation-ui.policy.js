function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeStatus(value) {
  return normalizeText(value).toUpperCase()
}

export function canServePrescription(auth, prescription) {
  const prescriptionStatus = normalizeStatus(
    prescription?.statut || prescription?.status,
  )

  const episodeStatus = normalizeStatus(
    prescription?.episode?.status ||
      prescription?.raw?.episode?.status,
  )

  return (
    typeof auth?.hasPermission === 'function' &&
    auth.hasPermission('pharmacie:serve_prescription') &&
    ['VALIDEE', 'PARTIELLEMENT_SERVIE'].includes(
      prescriptionStatus,
    ) &&
    episodeStatus === 'EN_PHARMACIE'
  )
}

export function lineCanBeServed(line) {
  const status = normalizeStatus(line?.status)

  return (
    Boolean(normalizeText(line?.id)) &&
    !['SERVIE', 'ANNULEE'].includes(status)
  )
}

export function normalizeDispenseQuantity(
  value,
  remainingQuantity,
) {
  const quantity = Number(value)
  const remaining = Number(remainingQuantity)

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    !Number.isFinite(remaining) ||
    remaining < 1 ||
    quantity > remaining
  ) {
    return null
  }

  return quantity
}

export function createServePrescriptionPayload(
  prescription,
  quantities = {},
  servedQuantityByLine = () => 0,
) {
  const prescriptionId =
    normalizeText(prescription?.id)

  if (!prescriptionId) {
    return null
  }

  const lines = Array.isArray(prescription?.lines)
    ? prescription.lines
    : []

  const selectedLines = []

  for (const line of lines) {
    if (!lineCanBeServed(line)) continue

    const alreadyServed =
      Number(servedQuantityByLine(line.id) || 0)

    const requested =
      Number(line.quantite || line.quantity || 0)

    const remaining =
      Math.max(0, requested - alreadyServed)

    const quantityServed =
      normalizeDispenseQuantity(
        quantities[line.id],
        remaining,
      )

    if (!quantityServed) continue

    selectedLines.push({
      prescriptionLineId: String(line.id),
      quantityServed,
    })
  }

  if (selectedLines.length === 0) {
    return null
  }

  return {
    prescriptionId,
    lines: selectedLines,
    nextEpisodeStatus: 'PRET_SORTIE',
  }
}

export function dispenseErrorMessage(error) {
  const messages = {
    PRESCRIPTION_NOT_FOUND:
      'Prescription introuvable.',
    PRESCRIPTION_CANCELLED:
      'Cette prescription est annulée.',
    PRESCRIPTION_ALREADY_SERVED:
      'Cette prescription est déjà entièrement servie.',
    EPISODE_NOT_READY_FOR_PHARMACIE:
      'Le patient n’est plus dans la file pharmacie.',
    PRESCRIPTION_LINE_NOT_FOUND:
      'Une ligne de prescription est introuvable.',
    PRESCRIPTION_LINE_CANCELLED:
      'Une ligne sélectionnée est annulée.',
    PRESCRIPTION_LINE_ALREADY_SERVED:
      'Une ligne sélectionnée est déjà servie.',
    PRESCRIPTION_LINE_DUPLICATED:
      'Une même ligne ne peut être servie deux fois dans la même opération.',
    SERVED_QUANTITY_EXCEEDS_REMAINING:
      'La quantité saisie dépasse la quantité restante.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Dispensation impossible.'
  )
}

export function dispenseSummary(payload) {
  if (
    !payload ||
    !Array.isArray(payload.lines) ||
    payload.lines.length === 0
  ) {
    return ''
  }

  const total = payload.lines.reduce(
    (sum, line) =>
      sum + Number(line.quantityServed || 0),
    0,
  )

  return (
    `${payload.lines.length} ligne(s), ` +
    `${total} unité(s) à délivrer. ` +
    'Si toutes les lignes sont entièrement servies, ' +
    'le patient sera orienté vers la sortie.'
  )
}
