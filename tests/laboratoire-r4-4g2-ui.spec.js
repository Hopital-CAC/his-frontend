import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import process from 'node:process'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R4.4G2 — UI Laboratoire', () => {
  it('retire les routes de création et modification libres', () => {
    const router = source('src/app/router/index.js')

    expect(router).not.toContain("path: 'laboratoire/create'")
    expect(router).not.toContain("path: 'laboratoire/:id/edit'")
    expect(router).not.toContain('LaboratoireCreatePage')
    expect(router).not.toContain('LaboratoireEditPage')
  })

  it(
  'réserve l’espace opérationnel aux rôles laboratoire autorisés et à l’Admin',
  () => {
    const router = source(
      'src/app/router/index.js',
    )

    expect(router).toMatch(
      /path:\s*['"]\/?laboratoire['"][\s\S]*?roles:\s*\[\s*['"]admin['"]\s*,\s*['"]laborantin['"]\s*,\s*['"]lab_technician['"]\s*,\s*['"]lab_biologist['"]\s*\]/
    )
  },
)

  it('utilise ConfirmDialog et CONFIRMER pour la validation du résultat', () => {
    const details = source(
      'src/modules/laboratoire/pages/LaboratoireDetailsPage.vue',
    )

    expect(details).toContain('ConfirmDialog')
    expect(details).toContain('require-text="CONFIRMER"')
    expect(details).toContain('variant="success"')
    expect(details).toContain(
      "auth.hasPermission('examen:update_result')",
    )
    expect(details).toContain(
      "['admin', 'laborantin', 'lab_technician', 'lab_biologist'].includes(role)",
    )
  })

  it('rend le résultat validé en lecture seule', () => {
    const details = source(
      'src/modules/laboratoire/pages/LaboratoireDetailsPage.vue',
    )

    expect(details).toContain(
      "examen.statut === 'RESULTAT_DISPONIBLE'",
    )
    expect(details).toContain('Résultat validé')
  })

  it('affiche des KPI globaux dédiés et non un comptage de patients de page', () => {
    const dashboard = source(
      'src/modules/laboratoire/pages/LaboratoireDashboardPage.vue',
    )

    expect(dashboard).toContain('store.fetchKpis()')
    expect(dashboard).toContain('stats.examensEnAttente')
    expect(dashboard).toContain('stats.resultatsDisponibles')
    expect(dashboard).toContain('stats.enCours')
    expect(dashboard).not.toContain('stats.patientsExamines')
  })

  it('utilise le Design System et les statuts officiels dans les filtres', () => {
    const search = source(
      'src/modules/laboratoire/components/LaboratoireSearchBar.vue',
    )

    expect(search).toContain('BaseInput')
    expect(search).toContain('BaseSelect')
    expect(search).toContain("value: 'DEMANDE'")
    expect(search).toContain("value: 'EN_COURS'")
    expect(search).toContain(
      "value: 'RESULTAT_DISPONIBLE'",
    )
    expect(search).toContain("value: 'ANNULE'")
    expect(search).not.toContain("value: 'pending'")
    expect(search).not.toContain("value: 'completed'")
    expect(search).not.toContain("value: 'cancelled'")
  })

  it('ne propose plus suppression ou création libre dans la file', () => {
    const list = source(
      'src/modules/laboratoire/pages/LaboratoireListPage.vue',
    )
    const table = source(
      'src/modules/laboratoire/components/LaboratoireTable.vue',
    )

    expect(list).not.toContain('Nouvelle demande')
    expect(list).not.toContain('removeExamen')
    expect(table).not.toContain('Supprimer')
    expect(table).not.toContain('/edit')
  })
})
