import process from 'node:process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R4.1C — neutralisation des créations libres', () => {
  it('redirige la création libre vers la file médicale', () => {
    const router = source('src/app/router/index.js')

    expect(router).toContain("path: 'consultations/create'")
    expect(router).toContain("name: 'consultations.dashboard'")
    expect(router).not.toContain(
      "component: ConsultationCreatePage",
    )
  })

  it('redirige la modification vers le détail en lecture seule', () => {
    const router = source('src/app/router/index.js')

    expect(router).toContain("path: 'consultations/:id/edit'")
    expect(router).toContain("name: 'consultations.details'")
    expect(router).not.toContain(
      "component: ConsultationEditPage",
    )
  })

  it('protège les routes Consultation par permission', () => {
    const router = source('src/app/router/index.js')

    const consultationSection = router.slice(
      router.indexOf('// Routes Consultations'),
      router.indexOf('// route rendez6vous'),
    )

    expect(
      consultationSection.match(
        /permission: 'consultation:read'/g,
      ),
    ).toHaveLength(5)
  })

  it('ouvre la file médicale depuis la sidebar', () => {
    const sidebar = source(
      'src/shared/ui/layout/Sidebar.vue',
    )

    expect(sidebar).toContain(
      'to: "/consultations/dashboard"',
    )
    expect(sidebar).toContain(
      'permission: "consultation:read"',
    )
  })

  it('supprime les actions Modifier et Supprimer de la liste', () => {
    const table = source(
      'src/modules/consultations/components/ConsultationTable.vue',
    )

    expect(table).not.toContain('Modifier')
    expect(table).not.toContain('Supprimer')
    expect(table).not.toContain("defineEmits(['remove'])")
    expect(table).toContain('Consulter')
  })

  it('remplace la création libre par le retour à la file', () => {
    const page = source(
      'src/modules/consultations/pages/ConsultationsListPage.vue',
    )

    expect(page).toContain(
      'to="/consultations/dashboard"',
    )
    expect(page).toContain('Ouvrir la file médicale')
    expect(page).not.toContain('Nouvelle consultation')
    expect(page).not.toContain('ConfirmDialog')
  })
})
