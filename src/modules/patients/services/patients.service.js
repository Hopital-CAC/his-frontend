import api from '@/shared/services/api'

function unwrapResponse(response) {
  return response?.data ?? response
}

function unwrapItem(response) {
  return response?.data?.data?.item || response?.data?.item || response?.data?.data || response?.data
}

export const patientsService = {
  async list(params = {}) {
    const response = await api.get('/patients', {
      params: {
        page: params.page || 1,
        limit: params.limit || params.limite || 10,
        q: params.q || undefined,
      },
    })

    return unwrapResponse(response)
  },

  async search(query) {
    const response = await api.get('/patients', {
      params: {
        page: 1,
        limit: 20,
        q: query,
      },
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/patients/${id}`)
    return unwrapResponse(response)
  },

  async getDossier(id) {
    const response = await api.get(`/patients/${id}/dossier`)
    return unwrapItem(response)
  },

  async getTimeline(id) {
    const response = await api.get(`/patients/${id}/timeline`)
    return response?.data?.data?.items || response?.data?.items || []
  },

  async create(payload) {
    const response = await api.post('/patients', payload)
    return unwrapResponse(response)
  },

  async update(id, payload) {
    const response = await api.patch(`/patients/${id}`, payload)
    return unwrapResponse(response)
  },

  async archive(id) {
    const response = await api.delete(`/patients/${id}`)
    return unwrapResponse(response)
  },
}