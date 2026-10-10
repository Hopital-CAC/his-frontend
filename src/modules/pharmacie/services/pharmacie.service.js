import api from '@/shared/services/api'

function unwrapResponse(response) {
  return response?.data ?? response
}

function unwrapData(response) {
  const payload = unwrapResponse(response)
  return payload?.data ?? payload
}

export const pharmacieService = {
  async listPrescriptions(params = {}) {
    const response = await api.get('/prescriptions', {
      params: {
        q: params.q || undefined,
        episodeId: params.episodeId || undefined,
        consultationId: params.consultationId || undefined,
        patientId: params.patientId || undefined,
        status: params.status || undefined,
        page: params.page || 1,
        limit: params.limit || 20,
      },
    })

    return unwrapData(response)
  },

  async getPrescriptionById(id) {
    const response = await api.get(`/prescriptions/${id}`)
    const payload = unwrapData(response)
    return payload?.item ?? payload
  },
}
