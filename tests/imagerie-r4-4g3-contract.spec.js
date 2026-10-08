import process from 'node:process'
import {
  readFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import {
  describe,
  expect,
  it,
} from 'vitest'

function source(path) {
  return readFileSync(
    resolve(process.cwd(), path),
    'utf8',
  )
}

describe(
  'R4.4G3 — contrat frontend Imagerie',
  () => {
    it('utilise uniquement le module officiel examens', () => {
      const service = source(
        'src/modules/imagerie/services/imagerie.service.js',
      )

      expect(service).toContain(
        "api.get('/examens'",
      )
      expect(service).toContain(
        'api.get(`/examens/${id}`)',
      )
      expect(service).toContain(
        'api.patch(`/examens/${id}/result`',
      )

      expect(service).not.toContain(
        "api.get('/imagerie'",
      )
      expect(service).not.toContain(
        "api.post('/imagerie'",
      )
      expect(service).not.toContain(
        "api.delete('/imagerie'",
      )
    })

    it('ne transmet jamais nextEpisodeStatus', () => {
      const service = source(
        'src/modules/imagerie/services/imagerie.service.js',
      )

      expect(service).not.toContain(
        'nextEpisodeStatus',
      )
    })

    it('déclare uniquement les quatre modalités backend', () => {
      const service = source(
        'src/modules/imagerie/services/imagerie.service.js',
      )

      expect(service).toContain(
        "'RADIOLOGIE'",
      )
      expect(service).toContain(
        "'ECHOGRAPHIE'",
      )
      expect(service).toContain(
        "'SCANNER'",
      )
      expect(service).toContain(
        "'IRM'",
      )

      expect(service).not.toContain(
        "'AUTRE'",
      )
      expect(service).not.toContain(
        "'ECG'",
      )
    })

    it('aligne le routage frontend sur examen:read et les rôles opérationnels imagerie', () => {
      const router = source(
        'src/app/router/index.js',
      )
      const sidebar = source(
        'src/shared/ui/layout/Sidebar.vue',
      )
      const defaultRoute = source(
        'src/shared/rbac/default-route.js',
      )

      expect(router).toMatch(
        /path: 'imagerie'[\s\S]*?roles: \['admin', 'imagerie', 'radiology_technician', 'radiologist'\][\s\S]*?permission: 'examen:read'/,
      )
      expect(sidebar).toMatch(
        /label: "Imagerie"[\s\S]*?permission: "examen:read"/,
      )
      expect(defaultRoute).toMatch(
        /imagerie:[\s\S]*?permission: "examen:read"[\s\S]*?path: "\/imagerie"/,
      )
      expect(defaultRoute).not.toContain(
        'permission: "imagerie:read"',
      )
    })

    it('retire les routes de création et édition imagerie', () => {
      const router = source(
        'src/app/router/index.js',
      )

      expect(router).not.toContain(
        "path: 'imagerie/create'",
      )
      expect(router).not.toContain(
        "path: 'imagerie/:id/edit'",
      )
    })
  },
)
