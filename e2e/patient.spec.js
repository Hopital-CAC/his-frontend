import { expect, test } from '@playwright/test'

const email = process.env.E2E_USER_EMAIL
const password = process.env.E2E_USER_PASSWORD

function uniqueIdentity() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`

  return {
    localCode: `E2E-${suffix}`,
    lastName: `PatientE2E${suffix}`,
    middleName: 'Duplicate',
    firstName: 'Integration',
    age: '34',
    address: 'Lubumbashi E2E',
    phone1: `+24381${suffix.replace(/\D/g, '').slice(-7).padStart(7, '0')}`,
    phone2: `+24382${suffix.replace(/\D/g, '').slice(-7).padStart(7, '0')}`,
    phone3: `+24383${suffix.replace(/\D/g, '').slice(-7).padStart(7, '0')}`,
  }
}

async function login(page) {
  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL et E2E_USER_PASSWORD sont obligatoires pour le scénario Patient réel.',
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

async function fillPatientForm(page, identity, phone) {
  await page.getByLabel('Numéro patient').fill(identity.localCode)
  await page.getByLabel('Numéro fiche').fill(identity.localCode)

  await page.getByLabel(/^Nom\s*\*?$/).fill(identity.lastName)
  await page.getByLabel('Postnom', { exact: true }).fill(identity.middleName)
  await page.getByLabel(/^Prénom\s*\*?$/).fill(identity.firstName)

  await page.getByLabel('Sexe').selectOption('M')
  await page.getByLabel('Âge').fill(identity.age)
  await page.getByLabel(/^Téléphone\s*\*?$/).fill(phone)
  await page.getByLabel('État civil').selectOption('Célibataire')

  await page.getByLabel('Adresse').fill(identity.address)

  await page.getByLabel('Personne à contacter').fill('Contact E2E')
  await page.getByLabel('Lien avec le patient').selectOption('Ami(e)')
  await page.getByLabel('Téléphone urgence').fill('+243990000001')
}

function patientPost(response) {
  return (
    response.request().method() === 'POST' &&
    new URL(response.url()).pathname === '/api/v1/patients'
  )
}

async function submitPatient(page, expectedStatus) {
  const responsePromise = page.waitForResponse(
    (response) =>
      patientPost(response) &&
      response.status() === expectedStatus,
  )

  await page.getByRole('button', { name: 'Créer patient' }).click()

  return responsePromise
}

test.describe('Patient — intégration navigateur réelle', () => {
  test.setTimeout(60_000)

  test('création, sélection d’une fiche existante et CREATE_NEW auditable', async ({ page }) => {
    const identity = uniqueIdentity()

    await login(page)

    // 1. Création initiale.
    await page.goto('/patients/create')
    await fillPatientForm(page, identity, identity.phone1)

    const initialResponse = await submitPatient(page, 201)

    expect(initialResponse.status()).toBe(201)

    await expect(page).toHaveURL(/\/patients\/[^/]+$/)

    const firstPatientId = new URL(page.url()).pathname.split('/').pop()

    expect(firstPatientId).toBeTruthy()

    // 2. Même identité, téléphone différent :
    // le backend doit proposer la fiche existante.
    await page.goto('/patients/create')
    await fillPatientForm(page, identity, identity.phone2)

    const duplicateResponse = await submitPatient(page, 409)

    expect(duplicateResponse.status()).toBe(409)

    await expect(
      page.getByText('Correspondances possibles détectées'),
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Utiliser cette fiche' }),
    ).toHaveCount(1)

    await page
      .getByRole('button', { name: 'Utiliser cette fiche' })
      .click()

    await expect(page).toHaveURL(
      new RegExp(`/patients/${firstPatientId}$`),
    )

    // 3. Même identité encore, autre téléphone :
    // l’utilisateur confirme explicitement qu’aucune fiche ne correspond.
    await page.goto('/patients/create')
    await fillPatientForm(page, identity, identity.phone3)

    const secondDuplicateResponse = await submitPatient(page, 409)

    expect(secondDuplicateResponse.status()).toBe(409)

    await expect(
      page.getByText('Correspondances possibles détectées'),
    ).toBeVisible()

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

    const createNewRequestPromise = page.waitForRequest((request) => {
      if (request.method() !== 'POST') return false

      const pathname = new URL(request.url()).pathname

      if (pathname !== '/api/v1/patients') return false

      const payload = request.postDataJSON()

      return payload?.duplicateResolution?.action === 'CREATE_NEW'
    })

    const createNewResponsePromise = page.waitForResponse(
      (response) =>
        patientPost(response) &&
        response.status() === 201,
    )

    await dialog
      .getByRole('button', { name: 'Confirmer la nouvelle fiche' })
      .click()

    const [createNewRequest, createNewResponse] = await Promise.all([
      createNewRequestPromise,
      createNewResponsePromise,
    ])

    const createNewPayload = createNewRequest.postDataJSON()

    expect(createNewPayload.duplicateResolution).toEqual({
      action: 'CREATE_NEW',
      confirmation: 'AUCUNE_CORRESPONDANCE',
      candidateIds: [String(firstPatientId)],
    })

    expect(createNewResponse.status()).toBe(201)

    await expect(page).toHaveURL(/\/patients\/[^/]+$/)

    const secondPatientId = new URL(page.url()).pathname.split('/').pop()

    expect(secondPatientId).toBeTruthy()
    expect(secondPatientId).not.toBe(firstPatientId)
  })
})
