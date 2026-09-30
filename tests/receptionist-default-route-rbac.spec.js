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

const sidebarSource = readFileSync(
  resolve(process.cwd(), 'src/shared/ui/layout/Sidebar.vue'),
  'utf8',
)

describe('RECEPTIONIST Reception RBAC', () => {
  it('autorise le rôle canonique sur le dashboard Réception choisi par reception:read', () => {
    expect(defaultRouteSource).toMatch(
      /permission:\s*["']reception:read["'][\s\S]*?path:\s*["']\/receptions\/dashboard["']/,
    )

    expect(routerSource).toMatch(
      /path:\s*["']receptions\/dashboard["'][\s\S]*?roles:\s*\[[^\]]*["']receptionist["'][^\]]*\][\s\S]*?permission:\s*["']reception:read["']/,
    )
  })

  it('aligne les surfaces Réception sur les permissions backend du RECEPTIONIST', () => {
    expect(routerSource).toMatch(
      /name:\s*["']receptions["'][\s\S]*?roles:\s*\[[^\]]*["']receptionist["'][^\]]*\][\s\S]*?permission:\s*["']reception:read["']/,
    )

    expect(routerSource).toMatch(
      /name:\s*["']receptions\.create["'][\s\S]*?roles:\s*\[[^\]]*["']receptionist["'][^\]]*\][\s\S]*?permission:\s*["']reception:create["']/,
    )

    expect(routerSource).toMatch(
      /name:\s*["']receptions\.details["'][\s\S]*?roles:\s*\[[^\]]*["']receptionist["'][^\]]*\][\s\S]*?permission:\s*["']reception:read["']/,
    )

    expect(routerSource).toMatch(
      /name:\s*["']receptions\.edit["'][\s\S]*?roles:\s*\[[^\]]*["']receptionist["'][^\]]*\][\s\S]*?permission:\s*["']reception:update["']/,
    )
  })

  it('expose la navigation Réceptions au rôle RECEPTIONIST', () => {
    expect(sidebarSource).toMatch(
      /label:\s*["']Réceptions["'][\s\S]*?to:\s*["']\/receptions["'][\s\S]*?roles:\s*\[[^\]]*["']receptionist["'][^\]]*\]/,
    )
  })
})