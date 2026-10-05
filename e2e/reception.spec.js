import { expect, test } from '@playwright/test'

const email = process.env.E2E_USER_EMAIL
const password = process.env.E2E_USER_PASSWORD

function uniqueIdentity(prefix = 'ReceptionE2E') {
  const digits = `${Date.now()}${Math.floor(Math.random() * 100000)}`
  const suffix = digits.slice(-10)

  return {
    localCode: `REC-E2E-${suffix}`,
    firstName: 'Integration',
    middleName: 'Reception',
    lastName: `${prefix}${suffix}`,
    gender: 'M',
    birthDate: '1988-07-12',
    phone: `+24381${suffix.slice(-7).padStart(7, '0')}`,
    alternatePhone: `+24382${suffix.slice(-7).padStart(7, '0')}`,
    address: 'Lubumbashi Reception E2E',
  }
}

function apiPath(url) {
  return new URL(url).pathname
}

function isApiRequest(request, method, pathname) {
  return request.method() === method && apiPath(request.url()) === pathname
}

function isApiResponse(response, method, pathname) {
  return isApiRequest(response.request(), method, pathname)
}

function responseItem(body) {
  return body?.data?.item ?? body?.item ?? body?.data ?? body ?? null
}

async function login(page) {
  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL et E2E_USER_PASSWORD sont obligatoires pour le scénario Réception réel.',
    )
  }

  await page.goto('/login')

  await page.getByLabel('Adresse e-mail').fill(email)
  await page.getByLabel('Mot de passe').fill(password)

  await Promise.all([
    page.waitForURL((url) => url.pathname !== '/login'),
    page.getByRole('button', { name: 'Se connecter' }).click(),
  ])
}

async function createStandalonePatient(page, identity) {
  await page.goto('/patients/create')

  await page.getByLabel('Numéro patient').fill(identity.localCode)
  await page.getByLabel('Numéro fiche').fill(identity.localCode)

  await page.getByLabel(/^Nom\s*\*?$/).fill(identity.lastName)
  await page.getByLabel('Postnom', { exact: true }).fill(identity.middleName)
  await page.getByLabel(/^Prénom\s*\*?$/).fill(identity.firstName)

  await page.getByLabel('Sexe').selectOption(identity.gender)
  await page.getByLabel('Date de naissance').fill(identity.birthDate)

  const birthDate = new Date(`${identity.birthDate}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const birthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate())

  if (!birthdayPassed) age -= 1

  await page.getByLabel('Âge').fill(String(age))
  await page.getByLabel(/^Téléphone\s*\*?$/).fill(identity.phone)

  await page.getByLabel('État civil').selectOption('Célibataire')
  await page.getByLabel('Adresse').fill(identity.address)
  await page.getByLabel('Personne à contacter').fill('Contact Reception E2E')
  await page.getByLabel('Lien avec le patient').selectOption('Ami(e)')
  await page.getByLabel('Téléphone urgence').fill('+243990000002')

  const responsePromise = page.waitForResponse(
    (response) =>
      isApiResponse(response, 'POST', '/api/v1/patients') &&
      response.status() === 201,
  )

  await page.getByRole('button', { name: 'Créer patient' }).click()

  const response = await responsePromise

  expect(response.status()).toBe(201)

  const body = await response.json()
  const created = responseItem(body)
  const patientId = created?.id

  expect(patientId).toBeTruthy()

  await page.waitForURL(
    (url) => url.pathname === `/patients/${String(patientId)}`,
  )

  return String(patientId)
}

async function openPublicReceptionForm(page) {
  await page.goto('/receptions/create')

  await expect(
    page.getByRole('heading', { name: 'Nouvelle réception' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Patient public' }).click()
  await page.getByRole('button', { name: 'Suivant' }).click()

  await expect(
    page.getByRole('heading', { name: 'Informations patient' }),
  ).toBeVisible()
}

async function fillReceptionIdentity(page, identity, overrides = {}) {
  const data = {
    ...identity,
    ...overrides,
  }

  await page.getByLabel('Nom', { exact: true }).fill(data.lastName)
  await page.getByLabel('Postnom', { exact: true }).fill(data.middleName)
  await page.getByLabel('Prénom', { exact: true }).fill(data.firstName)
  await page.getByLabel('Sexe').selectOption(data.gender)
  await page.getByLabel('Date de naissance').fill(data.birthDate)
  await page.getByLabel('Téléphone', { exact: true }).fill(data.phone)
  await page.getByLabel('Adresse / Site').fill(data.address)
}

async function verifyReceptionIdentity(page) {
  const responsePromise = page.waitForResponse(
    (response) =>
      isApiResponse(response, 'POST', '/api/v1/receptions/preflight') &&
      response.status() === 200,
  )

  await page.getByRole('button', { name: 'Vérifier la fiche' }).click()

  const response = await responsePromise

  expect(response.status()).toBe(200)

  return response
}

async function goToOrientation(page) {
  await page.getByRole('button', { name: 'Suivant' }).click()

  await expect(
    page.getByText('Destination : Triage'),
  ).toBeVisible()

  await expect(
    page.getByText('En attente de triage', { exact: false }),
  ).toBeVisible()
}

async function configureCashPayment(page) {
  await page.getByRole('button', { name: 'Renseigner le paiement' }).click()

  const dialog = page.getByRole('dialog', {
    name: 'Paiement des frais d’ouverture de fiche',
  })

  await expect(dialog).toBeVisible()

  await expect(
    dialog.getByText('paiement en espèces uniquement', { exact: false }),
  ).toBeVisible()

  const mode = dialog.getByLabel('Mode de paiement')

  await expect(mode.locator('option[value="CASH"]')).toHaveCount(1)
  await expect(mode.locator('option[value="MOBILE_MONEY"]')).toHaveCount(0)
  await mode.selectOption('CASH')

  await dialog.getByLabel('Devise').selectOption('CDF')

  await dialog
    .getByRole('button', { name: 'Confirmer les informations de paiement' })
    .click()

  await expect(dialog).toBeHidden()

  await expect(
    page.getByText(/Paiement renseigné/),
  ).toBeVisible()

  await expect(
    page.getByText(/Espèces/),
  ).toBeVisible()
}

async function goToConfirmation(page) {
  await page.getByRole('button', { name: 'Suivant' }).click()

  await expect(
    page.getByRole('heading', { name: 'Confirmation' }),
  ).toBeVisible()

  await expect(
    page.getByText('Triage', { exact: true }),
  ).toBeVisible()

  await expect(
    page.getByText('En attente de triage', { exact: true }),
  ).toBeVisible()
}

async function submitReception(page, expectedStatus) {
  const requestPromise = page.waitForRequest(
    (request) => isApiRequest(request, 'POST', '/api/v1/receptions'),
  )

  const responsePromise = page.waitForResponse(
    (response) =>
      isApiResponse(response, 'POST', '/api/v1/receptions') &&
      response.status() === expectedStatus,
  )

  await page
    .getByRole('button', {
      name: /Créer .*réception et l’épisode/,
    })
    .click()

  const [request, response] = await Promise.all([
    requestPromise,
    responsePromise,
  ])

  return {
    request,
    response,
  }
}

test.describe('Réception + Episode — intégration navigateur réelle', () => {
  test.describe.configure({ mode: 'serial' })
  test.setTimeout(120_000)

  test('New Patient + Cash payment → Réception et Episode EN_TRIAGE', async ({ page }) => {
    const identity = uniqueIdentity('NewPatient')

    await login(page)
    await openPublicReceptionForm(page)
    await fillReceptionIdentity(page, identity)

    await verifyReceptionIdentity(page)

    await expect(
      page.getByText('Nouvelle fiche confirmée'),
    ).toBeVisible()

    await expect(
      page.getByText(
        'Pour ce patient public, les frais d’ouverture devront être payés avant la création.',
      ),
    ).toBeVisible()

    await goToOrientation(page)
    await configureCashPayment(page)
    await goToConfirmation(page)

    const { request, response } = await submitReception(page, 201)
    const payload = request.postDataJSON()

    expect(payload.patientId).toBeUndefined()
    expect(payload.patient.lastName).toBe(identity.lastName)
    expect(payload.fichePayment).toEqual({
      currency: 'CDF',
      mode: 'CASH',
    })

    expect(payload.orientation).toEqual({
      targetModule: 'TRIAGE',
    })

    expect(payload.priority).toBeUndefined()
    expect(payload.typePassage).toBeUndefined()
    expect(payload.motifInitial).toBeUndefined()
    expect(payload.requestedServiceId).toBeUndefined()

    const body = await response.json()
    const created = responseItem(body)

    expect(created?.id).toBeTruthy()
    expect(created?.episode?.id).toBeTruthy()
    expect(created?.episode?.status).toBe('EN_TRIAGE')
    expect(created?.orientation?.targetModule).toBe('TRIAGE')

    await expect(page).toHaveURL(/\/receptions\/[^/]+$/)

    await expect(
      page.getByText('Transmis au triage'),
    ).toBeVisible()

    await expect(
      page.getByText('EN_TRIAGE', { exact: true }),
    ).toBeVisible()
  })

  test('Existing Patient → réutilise patientId sans nouveaux frais de fiche', async ({ page }) => {
    const identity = uniqueIdentity('ExistingPatient')

    await login(page)

    const patientId = await createStandalonePatient(page, identity)

    await openPublicReceptionForm(page)

    await fillReceptionIdentity(page, identity, {
      phone: identity.alternatePhone,
    })

    await verifyReceptionIdentity(page)

    await expect(
      page.getByText('Fiche existante sélectionnée'),
    ).toBeVisible()

    await goToOrientation(page)

    await expect(
      page.getByText('Fiche existante — aucun frais d’ouverture'),
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Renseigner le paiement' }),
    ).toHaveCount(0)

    await goToConfirmation(page)

    const { request, response } = await submitReception(page, 201)
    const payload = request.postDataJSON()

    expect(payload.patientId).toBe(patientId)
    expect(payload.patient).toBeUndefined()
    expect(payload.fichePayment).toBeUndefined()
    expect(payload.orientation).toEqual({
      targetModule: 'TRIAGE',
    })

    const body = await response.json()
    const created = responseItem(body)

    expect(String(created?.patient?.id ?? created?.patientId)).toBe(patientId)
    expect(created?.episode?.status).toBe('EN_TRIAGE')

    await expect(page).toHaveURL(/\/receptions\/[^/]+$/)
  })

  test('Rejected candidates → CREATE_NEW auditable avec candidateIds', async ({ page }) => {
    const candidate = uniqueIdentity('RejectedCandidate')

    await login(page)

    const candidateId = await createStandalonePatient(page, candidate)

    const alteredLastName = `${candidate.lastName.slice(
      0,
      Math.floor(candidate.lastName.length / 2),
    )}${candidate.lastName.slice(
      Math.floor(candidate.lastName.length / 2) + 1,
    )}`

    await openPublicReceptionForm(page)

    await fillReceptionIdentity(page, candidate, {
      lastName: alteredLastName,
      birthDate: '1988-07-28',
      phone: candidate.alternatePhone,
    })

    await verifyReceptionIdentity(page)

    await expect(
      page.getByText('Correspondances possibles détectées'),
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Utiliser cette fiche' }),
    ).toHaveCount(1)

    await page
      .getByRole('button', {
        name: 'Aucune de ces fiches ne correspond',
      })
      .click()

    const dialog = page.getByRole('dialog', {
      name: 'Créer une nouvelle fiche malgré les correspondances',
    })

    await expect(dialog).toBeVisible()

    await dialog
      .getByLabel('Saisir CONFIRMER pour confirmer')
      .fill('CONFIRMER')

    await dialog
      .getByRole('button', { name: 'Confirmer la nouvelle fiche' })
      .click()

    await expect(dialog).toBeHidden()

    await expect(
      page.getByText('Destination : Triage'),
    ).toBeVisible()

    await configureCashPayment(page)
    await goToConfirmation(page)

    const { request, response } = await submitReception(page, 201)
    const payload = request.postDataJSON()

    expect(payload.patientId).toBeUndefined()
    expect(payload.patient.lastName).toBe(alteredLastName)

    expect(payload.duplicateResolution?.action).toBe('CREATE_NEW')
    expect(payload.duplicateResolution?.confirmation).toBe(
      'AUCUNE_CORRESPONDANCE',
    )

    expect(
      payload.duplicateResolution?.candidateIds?.map(String),
    ).toContain(candidateId)

    expect(payload.fichePayment).toEqual({
      currency: 'CDF',
      mode: 'CASH',
    })

    expect(response.status()).toBe(201)
    await expect(page).toHaveURL(/\/receptions\/[^/]+$/)
  })

  test('Mobile Money direct rejection → HTTP 400 FICHE_PAYMENT_MODE_NOT_ALLOWED', async ({ page }) => {
    const identity = uniqueIdentity('MobileMoneyRejected')

    await login(page)
    await openPublicReceptionForm(page)
    await fillReceptionIdentity(page, identity)

    await verifyReceptionIdentity(page)

    await expect(
      page.getByText('Nouvelle fiche confirmée'),
    ).toBeVisible()

    await goToOrientation(page)
    await configureCashPayment(page)
    await goToConfirmation(page)

    let mutated = false

    await page.route('**/api/v1/receptions', async (route) => {
      const request = route.request()

      if (!isApiRequest(request, 'POST', '/api/v1/receptions')) {
        await route.continue()
        return
      }

      const payload = request.postDataJSON()

      payload.fichePayment = {
        currency: 'CDF',
        mode: 'MOBILE_MONEY',
        mobileMoneyProvider: 'Airtel Money',
        payerPhone: '+243990000003',
        reference: `MM-E2E-${Date.now()}`,
      }

      const headers = {
        ...request.headers(),
        'content-type': 'application/json',
      }

      delete headers['content-length']

      mutated = true

      await route.continue({
        headers,
        postData: JSON.stringify(payload),
      })
    })

    const { response } = await submitReception(page, 400)

    expect(mutated).toBe(true)
    expect(response.status()).toBe(400)

    const body = await response.json()

    expect(JSON.stringify(body)).toContain(
      'FICHE_PAYMENT_MODE_NOT_ALLOWED',
    )

    await expect(page).toHaveURL(/\/receptions\/create$/)

    await page.unroute('**/api/v1/receptions')
  })
})
