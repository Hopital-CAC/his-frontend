import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

function source(relativePath) {
  return fs.readFileSync(path.join(cwd(), relativePath), 'utf8')
}

describe('Patient details middle name mapping', () => {
  const detailsPage = source(
    'src/modules/patients/pages/PatientDetailsPage.vue',
  )

  it('préserve middleName dans le postnom affiché', () => {
    expect(detailsPage).toMatch(
      /postnom:\s*raw\.middleName\s*\|\|\s*raw\.postnom\s*\|\|\s*''/,
    )
    expect(detailsPage).not.toMatch(/postnom:\s*''/)
  })

  it('transmet le patient normalisé aux workflows', () => {
    expect(detailsPage).toMatch(
      /ficheWorkflowService\.setActiveFiche\(\{\s*\.\.\.patient\.value,\s*source_module:\s*'patients'/s,
    )
  })
})