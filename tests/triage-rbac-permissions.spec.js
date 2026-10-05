import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(
    resolve(cwd(), path),
    'utf8',
  ).replace(/\r\n?/g, '\n')
}

function routeBlock(router, name) {
  const marker = `name: '${name}'`
  const markerIndex = router.indexOf(marker)

  if (markerIndex === -1) return ''

  const start = router.lastIndexOf(
    '      {',
    markerIndex,
  )

  const next = router.indexOf(
    '\n      {',
    markerIndex + marker.length,
  )

  return router.slice(
    start,
    next === -1 ? router.length : next,
  )
}

describe('RBAC frontend Triage', () => {
  const router = source(
    'src/app/router/index.js',
  )

  const editPage = source(
    'src/modules/triage/pages/TriageEditPage.vue',
  )

  it('protège dashboard, liste et détail par triage:read', () => {
    for (const name of [
      'triage.dashboard',
      'triage',
      'triage.details',
    ]) {
      const block = routeBlock(router, name)

      expect(block).toContain(
        `name: '${name}'`,
      )

      expect(block).toContain(
        "permission: 'triage:read'",
      )
    }
  })

  it('protège la création par triage:create', () => {
    const block =
      routeBlock(router, 'triage.create')

    expect(block).toContain(
      "name: 'triage.create'",
    )

    expect(block).toContain(
      "permission: 'triage:create'",
    )
  })

  it('traite la pseudo-édition comme une surface de lecture', () => {
    const block =
      routeBlock(router, 'triage.edit')

    expect(block).toContain(
      "name: 'triage.edit'",
    )

    expect(block).toContain(
      "permission: 'triage:read'",
    )

    expect(block).not.toContain(
      "permission: 'triage:update'",
    )
  })

  it('conserve la page edit explicitement en lecture seule', () => {
    expect(editPage).toContain(
      'Modification du triage indisponible',
    )

    expect(editPage).toContain(
      'Lecture seule',
    )

    expect(editPage).not.toContain(
      'store.update',
    )

    expect(editPage).not.toContain(
      'api.patch',
    )

    expect(editPage).not.toContain(
      'api.put',
    )
  })

  it('réserve triage:update à la réévaluation clinique', () => {
    const details = source(
      'src/modules/triage/pages/TriageDetailsPage.vue',
    )

    expect(details).toContain(
      "auth.hasPermission('triage:update')",
    )

    expect(details).toContain(
      'store.createReevaluation',
    )
  })
})