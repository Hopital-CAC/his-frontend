import process from 'node:process'

import { expect, test } from '@playwright/test'

const receptionEmail =
  process.env.E2E_RECEPTION_USER_EMAIL
const receptionPassword =
  process.env.E2E_RECEPTION_USER_PASSWORD

const triageEmail =
  process.env.E2E_TRIAGE_USER_EMAIL
const triagePassword =
  process.env.E2E_TRIAGE_USER_PASSWORD

const physicianEmail =
  process.env.E2E_MEDECIN_EMAIL
const physicianPassword =
  process.env.E2E_MEDECIN_PASSWORD

function uniqueIdentity() {
  const digits =
    `${Date.now()}${Math.floor(Math.random() * 100000)}`

  const suffix = digits.slice(-10)

  return {
    firstName: 'Integration',
    middleName: 'Consultation',
    lastName: `ConsultationE2E${suffix}`,
    gender: 'M',
    birthDate: '1987-04-16',
    phone: `+24381${suffix.slice(-7).padStart(7, '0')}`,
    address: 'Lubumbashi Consultation E2E',
  }
}

function apiPath(url) {
  return new URL(url).pathname
}

function isApiRequest(request, method, pathname) {
  return (
    request.method() === method &&
    apiPath(request.url()) === pathname
  )
}

function isApiResponse(response, method, pathname) {
  return isApiRequest(
    response.request(),
    method,
    pathname,
  )
}

function responseItem(body) {
  return (
    body?.data?.item ??
    body?.item ??
    body?.data ??
    body ??
    null
  )
}

async function login(
  page,
  email,
  password,
  expectedRole,
) {
  if (!email || !password) {
    throw new Error(
      `Identifiants E2E manquants pour le rôle ${expectedRole}.`,
    )
  }

  await page.goto('/login')

  await page
    .getByLabel('Adresse e-mail')
    .fill(email)

  await page
    .getByLabel('Mot de passe')
    .fill(password)

  await Promise.all([
    page.waitForURL(
      (url) => url.pathname !== '/login',
    ),
    page
      .getByRole('button', {
        name: 'Se connecter',
      })
      .click(),
  ])

  const session =
    await page.evaluate(async () => {
      const response =
        await fetch('/api/v1/auth/me', {
          credentials: 'include',
        })

      const body =
        await response.json()

      const user =
        body?.data?.user ??
        body?.data ??
        body?.user ??
        body ??
        {}

      return {
        status: response.status,
        role:
          user?.role?.code ??
          user?.roleCode ??
          '',
        permissions:
          Array.isArray(user?.permissions)
            ? user.permissions
            : [],
      }
    })

  expect(session.status).toBe(200)
  expect(session.role).toBe(expectedRole)

  return session
}

async function switchUser(
  page,
  email,
  password,
  expectedRole,
) {
  await page.context().clearCookies()

  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  return login(
    page,
    email,
    password,
    expectedRole,
  )
}

async function createReceptionForTriage(
  page,
  identity,
) {
  await page.goto('/receptions/create')

  await expect(
    page.getByRole('heading', {
      name: 'Nouvelle réception',
    }),
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: 'Patient public',
    })
    .click()

  await page
    .getByRole('button', {
      name: 'Suivant',
    })
    .click()

  await expect(
    page.getByRole('heading', {
      name: 'Informations patient',
    }),
  ).toBeVisible()

  await page
    .getByLabel('Nom', { exact: true })
    .fill(identity.lastName)

  await page
    .getByLabel('Postnom', { exact: true })
    .fill(identity.middleName)

  await page
    .getByLabel('Prénom', { exact: true })
    .fill(identity.firstName)

  await page
    .getByLabel('Sexe')
    .selectOption(identity.gender)

  await page
    .getByLabel('Date de naissance')
    .fill(identity.birthDate)

  await page
    .getByLabel('Téléphone', { exact: true })
    .fill(identity.phone)

  await page
    .getByLabel('Adresse / Site')
    .fill(identity.address)

  const preflightPromise =
    page.waitForResponse(
      (response) =>
        isApiResponse(
          response,
          'POST',
          '/api/v1/receptions/preflight',
        ) &&
        response.status() === 200,
    )

  await page
    .getByRole('button', {
      name: 'Vérifier la fiche',
    })
    .click()

  const preflightResponse =
    await preflightPromise

  expect(preflightResponse.status()).toBe(200)

  await expect(
    page.getByText('Nouvelle fiche confirmée'),
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: 'Suivant',
    })
    .click()

  await expect(
    page.getByText('Destination : Triage'),
  ).toBeVisible()

  await expect(
    page.getByText(
      'En attente de triage',
      { exact: false },
    ),
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: 'Renseigner le paiement',
    })
    .click()

  const paymentDialog =
    page.getByRole('dialog', {
      name: 'Paiement des frais d’ouverture de fiche',
    })

  await expect(paymentDialog).toBeVisible()

  await paymentDialog
    .getByLabel('Mode de paiement')
    .selectOption('CASH')

  await paymentDialog
    .getByLabel('Devise')
    .selectOption('CDF')

  await paymentDialog
    .getByRole('button', {
      name: 'Confirmer les informations de paiement',
    })
    .click()

  await expect(paymentDialog).toBeHidden()

  await page
    .getByRole('button', {
      name: 'Suivant',
    })
    .click()

  await expect(
    page.getByRole('heading', {
      name: 'Confirmation',
    }),
  ).toBeVisible()

  const requestPromise =
    page.waitForRequest(
      (request) =>
        isApiRequest(
          request,
          'POST',
          '/api/v1/receptions',
        ),
    )

  const responsePromise =
    page.waitForResponse(
      (response) =>
        isApiResponse(
          response,
          'POST',
          '/api/v1/receptions',
        ) &&
        response.status() === 201,
    )

  await page
    .getByRole('button', {
      name: /Créer .*réception et l’épisode/,
    })
    .click()

  const [request, response] =
    await Promise.all([
      requestPromise,
      responsePromise,
    ])

  expect(response.status()).toBe(201)

  const payload = request.postDataJSON()

  expect(payload.orientation).toEqual({
    targetModule: 'TRIAGE',
  })

  const body = await response.json()
  const created = responseItem(body)

  const episodeId =
    String(created?.episode?.id || '')

  expect(episodeId).toBeTruthy()
  expect(created?.episode?.status).toBe(
    'EN_TRIAGE',
  )

  await expect(
    page.getByText('Transmis au triage'),
  ).toBeVisible()

  return episodeId
}

async function openEpisodeFromQueue(
  page,
  identity,
  episodeId,
) {
  const initialQueueResponse =
    page.waitForResponse(
      (response) =>
        isApiResponse(
          response,
          'GET',
          '/api/v1/triages/queue',
        ) &&
        response.status() === 200,
    )

  await page.goto('/triage')

  await expect(
    page.getByRole('heading', {
      name: 'File d’attente Triage',
    }),
  ).toBeVisible()

  await initialQueueResponse

  const searchResponse =
    page.waitForResponse(
      (response) => {
        if (
          !isApiResponse(
            response,
            'GET',
            '/api/v1/triages/queue',
          ) ||
          response.status() !== 200
        ) {
          return false
        }

        const url =
          new URL(response.url())

        return (
          url.searchParams.get('q') ===
          identity.lastName
        )
      },
    )

  await page
    .getByLabel('Rechercher dans la file')
    .fill(identity.lastName)

  await page
    .getByRole('button', {
      name: 'Rechercher',
      exact: true,
    })
    .click()

  await searchResponse

  const row =
    page
      .getByRole('row')
      .filter({
        hasText: identity.lastName,
      })

  await expect(row).toHaveCount(1, {
    timeout: 15_000,
  })

  await expect(
    row.getByRole('button', {
      name: 'Commencer le triage',
    }),
  ).toBeVisible()

  await row
    .getByRole('button', {
      name: 'Commencer le triage',
    })
    .click()

  await page.waitForURL(
    (url) =>
      url.pathname === '/triage/create' &&
      url.searchParams.get('episodeId') ===
        episodeId,
  )
}

async function fillInitialTriage(page) {
  await page
    .getByLabel('Motif initial')
    .fill(
      'Douleur abdominale modérée depuis ce matin',
    )

  await page
    .getByLabel('Type de passage')
    .selectOption('CONSULTATION')

  await page
    .getByLabel('Priorité clinique')
    .selectOption('ROUTINE')

  await page
    .getByLabel('Température °C')
    .fill('36.8')

  await page
    .getByLabel('Tension systolique')
    .fill('120')

  await page
    .getByLabel('Tension diastolique')
    .fill('80')

  await page
    .getByLabel('Fréquence cardiaque')
    .fill('72')

  await page
    .getByLabel('Fréquence respiratoire')
    .fill('18')

  await page
    .getByLabel('Saturation SpO₂ %')
    .fill('98')

  const serviceSelect =
    page.getByLabel(
      'Service clinique demandé',
    )

  await expect(serviceSelect).toBeEnabled()

  const serviceValue =
    await serviceSelect
      .locator('option')
      .evaluateAll((options) => {
        const target =
          options.find((option) =>
            String(option.textContent || '')
              .toLocaleLowerCase('fr')
              .includes('médecine générale'),
          )

        return target?.value || ''
      })

  expect(serviceValue).toBeTruthy()

  await serviceSelect.selectOption(
    serviceValue,
  )

  await page
    .getByLabel('Destination')
    .selectOption('CONSULTATION')

  return serviceValue
}

async function submitInitialTriage(
  page,
  episodeId,
  serviceValue,
) {
  const requestPromise =
    page.waitForRequest(
      (request) =>
        isApiRequest(
          request,
          'POST',
          '/api/v1/triages',
        ),
    )

  const responsePromise =
    page.waitForResponse(
      (response) =>
        isApiResponse(
          response,
          'POST',
          '/api/v1/triages',
        ) &&
        response.status() === 201,
    )

  await page
    .getByRole('button', {
      name: 'Valider le triage',
    })
    .click()

  const dialog =
    page.getByRole('dialog', {
      name: 'Valider définitivement le triage',
    })

  await expect(dialog).toBeVisible()

  await dialog
    .getByLabel(
      'Saisir CONFIRMER pour confirmer',
    )
    .fill('CONFIRMER')

  await dialog
    .getByRole('button', {
      name: 'Valider et orienter',
    })
    .click()

  const [request, response] =
    await Promise.all([
      requestPromise,
      responsePromise,
    ])

  expect(response.status()).toBe(201)

  const payload = request.postDataJSON()

  expect(payload).toMatchObject({
    episodeId,
    motifInitial:
      'Douleur abdominale modérée depuis ce matin',
    typePassage: 'CONSULTATION',
    priority: 'ROUTINE',
    requestedServiceId: serviceValue,
    vitals: {
      temperatureCelsius: 36.8,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      respiratoryRate: 18,
      oxygenSaturation: 98,
    },
    firstAid: {
      performed: false,
      notes: null,
    },
    orientation: {
      targetModule: 'CONSULTATION',
      targetServiceId: serviceValue,
      appointmentRequired: false,
      appointmentDateTime: null,
    },
  })

  const body = await response.json()
  const created = responseItem(body)

  const triageId =
    String(created?.id || '')

  expect(triageId).toBeTruthy()

  await page.waitForURL(
    (url) =>
      url.pathname ===
      `/triage/${triageId}`,
  )

  return triageId
}

async function startConsultation(
  page,
  identity,
  episodeId,
) {
  await page.goto(
    '/consultations/dashboard',
  )

  await expect(
    page.getByRole('heading', {
      name: 'File d’attente médicale',
    }),
  ).toBeVisible()

  const searchResponse =
    page.waitForResponse(
      (response) => {
        if (
          !isApiResponse(
            response,
            'GET',
            '/api/v1/consultations/queue',
          ) ||
          response.status() !== 200
        ) {
          return false
        }

        const url =
          new URL(response.url())

        return (
          url.searchParams.get('q') ===
          identity.lastName
        )
      },
    )

  await page
    .getByLabel('Recherche', {
      exact: true,
    })
    .fill(identity.lastName)

  await page
    .getByRole('button', {
      name: 'Rechercher',
      exact: true,
    })
    .click()

  await searchResponse

  const row =
    page
      .getByRole('row')
      .filter({
        hasText: identity.lastName,
      })

  await expect(row).toHaveCount(1, {
    timeout: 15_000,
  })

  await row
    .getByRole('button', {
      name: 'Commencer la consultation',
    })
    .click()

  const dialog =
    page.getByRole('dialog', {
      name: 'Commencer la consultation médicale',
    })

  await expect(dialog).toBeVisible()

  await dialog
    .getByLabel(
      'Saisir CONFIRMER pour confirmer',
    )
    .fill('CONFIRMER')

  const requestPromise =
    page.waitForRequest(
      (request) =>
        isApiRequest(
          request,
          'POST',
          '/api/v1/consultations/start',
        ),
    )

  const responsePromise =
    page.waitForResponse(
      (response) =>
        isApiResponse(
          response,
          'POST',
          '/api/v1/consultations/start',
        ) &&
        response.ok(),
    )

  await dialog
    .getByRole('button', {
      name: 'Commencer la consultation',
    })
    .click()

  const [request, response] =
    await Promise.all([
      requestPromise,
      responsePromise,
    ])

  expect(
    request.postDataJSON(),
  ).toEqual({
    episodeId,
    confirmationAcknowledged: true,
  })

  const consultation =
    responseItem(
      await response.json(),
    )

  const consultationId =
    String(
      consultation?.id || '',
    )

  expect(consultationId).toBeTruthy()

  await page.waitForURL(
    (url) =>
      url.pathname ===
      `/consultations/${consultationId}`,
  )

  return consultationId
}

async function saveClinicalData(
  page,
  consultationId,
) {
  const illnessHistory =
    'Douleur abdominale apparue ce matin, sans vomissements.'

  const medicalHistory =
    'Aucun antécédent majeur connu.'

  const clinicalExam =
    'Patient conscient, stable, abdomen souple avec sensibilité modérée.'

  const provisionalDiagnosis =
    'Douleur abdominale non compliquée'

  const treatmentPlan =
    'Surveillance clinique et conseils de retour en cas d’aggravation.'

  await page
    .getByLabel('Histoire de la maladie')
    .fill(illnessHistory)

  await page
    .getByLabel('Antécédents médicaux')
    .fill(medicalHistory)

  await page
    .getByLabel('Examen clinique')
    .fill(clinicalExam)

  await page
    .getByLabel('Diagnostic provisoire')
    .fill(provisionalDiagnosis)

  await page
    .getByLabel('Plan de prise en charge')
    .fill(treatmentPlan)

  const path =
    `/api/v1/consultations/${consultationId}/clinical`

  const requestPromise =
    page.waitForRequest(
      (request) =>
        isApiRequest(
          request,
          'PATCH',
          path,
        ),
    )

  const responsePromise =
    page.waitForResponse(
      (response) =>
        isApiResponse(
          response,
          'PATCH',
          path,
        ) &&
        response.status() === 200,
    )

  await page
    .getByRole('button', {
      name: 'Enregistrer les informations cliniques',
    })
    .click()

  const [request, response] =
    await Promise.all([
      requestPromise,
      responsePromise,
    ])

  expect(response.status()).toBe(200)

  expect(
    request.postDataJSON(),
  ).toMatchObject({
    illnessHistory,
    medicalHistory,
    clinicalExam,
    provisionalDiagnosis,
    treatmentPlan,
  })
}

async function closeConsultation(
  page,
  consultationId,
) {
  const finalDiagnosis =
    'Douleur abdominale simple sans signe de gravité'

  await page
    .getByRole('button', {
      name: 'Clôturer la consultation',
    })
    .click()

  await page
    .getByLabel('Diagnostic final')
    .fill(finalDiagnosis)

  await page
    .getByLabel('Décision finale')
    .selectOption(
      'SORTIE_AUTORISEE',
    )

  await page
    .getByRole('button', {
      name: 'Vérifier la clôture',
    })
    .click()

  const dialog =
    page.getByRole('dialog', {
      name: 'Confirmer la clôture',
    })

  await expect(dialog).toBeVisible()

  await dialog
    .getByLabel(
      'Saisir CONFIRMER pour confirmer',
    )
    .fill('CONFIRMER')

  const path =
    `/api/v1/consultations/${consultationId}/close`

  const requestPromise =
    page.waitForRequest(
      (request) =>
        isApiRequest(
          request,
          'POST',
          path,
        ),
    )

  const responsePromise =
    page.waitForResponse(
      (response) =>
        isApiResponse(
          response,
          'POST',
          path,
        ) &&
        response.status() === 200,
    )

  await dialog
    .getByRole('button', {
      name: 'Clôturer la consultation',
    })
    .click()

  const [request, response] =
    await Promise.all([
      requestPromise,
      responsePromise,
    ])

  expect(response.status()).toBe(200)

  const payload =
    request.postDataJSON()

  expect(payload).toMatchObject({
    finalDiagnosis,
    decision: 'SORTIE_AUTORISEE',
    confirmationAcknowledged: true,
  })

  expect(
    String(
      payload.expectedUpdatedAt || '',
    ),
  ).toBeTruthy()

  await expect(
    page.getByText(finalDiagnosis),
  ).toBeVisible()

  await expect(
    page.getByText('Sortie autorisée'),
  ).toBeVisible()
}

test.describe(
  'Consultation — intégration navigateur réelle',
  () => {
    test.describe.configure({
      mode: 'serial',
    })

    test.setTimeout(180_000)

    test(
      'Réception → Triage → Consultation → clinique → clôture sortie',
      async ({ page }) => {
        const identity =
          uniqueIdentity()

        const receptionSession =
          await login(
            page,
            receptionEmail,
            receptionPassword,
            'RECEPTIONIST',
          )

        expect(
          receptionSession.permissions,
        ).toEqual(
          expect.arrayContaining([
            'patient:create',
            'reception:create',
            'episode:create',
          ]),
        )

        const episodeId =
          await createReceptionForTriage(
            page,
            identity,
          )

        const triageSession =
          await switchUser(
            page,
            triageEmail,
            triagePassword,
            'INFIRMIER',
          )

        expect(
          triageSession.permissions,
        ).toEqual(
          expect.arrayContaining([
            'triage:read',
            'triage:create',
            'triage:update',
          ]),
        )

        await openEpisodeFromQueue(
          page,
          identity,
          episodeId,
        )

        const serviceValue =
          await fillInitialTriage(
            page,
          )

        await submitInitialTriage(
          page,
          episodeId,
          serviceValue,
        )

        const physicianSession =
          await switchUser(
            page,
            physicianEmail,
            physicianPassword,
            'MEDECIN',
          )

        expect(
          physicianSession.permissions,
        ).toEqual(
          expect.arrayContaining([
            'consultation:read',
            'consultation:create',
            'consultation:update',
            'consultation:close',
          ]),
        )

        const consultationId =
          await startConsultation(
            page,
            identity,
            episodeId,
          )

        await saveClinicalData(
          page,
          consultationId,
        )

        await closeConsultation(
          page,
          consultationId,
        )
      },
    )
  },
)