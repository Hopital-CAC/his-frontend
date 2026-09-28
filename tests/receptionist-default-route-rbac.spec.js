import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const routerSource = readFileSync(
  resolve(process.cwd(), 'src/app/router/index.js'),
  'utf8',
)

const defaultRouteSource = readFileSync(
  resolve(process.cwd(), 'src/shared/rbac/default-route.js'),
  'utf8',
)

describe('RECEPTIONIST default route RBAC', () => {
  it('autorise le rôle canonique sur le dashboard Réception choisi par reception:read', () => {
    expect(defaultRouteSource).toMatch(
      /permission:\s*["']reception:read["'][\s\S]*?path:\s*["']\/receptions\/dashboard["']/,
    )

    expect(routerSource).toMatch(
      /path:\s*["']receptions\/dashboard["'][\s\S]*?roles:\s*\[[^\]]*["']receptionist["'][^\]]*\][\s\S]*?permission:\s*["']reception:read["']/,
    )
  })
})