import api from '@/shared/services/api'

function unwrapResponse(response) {
  return response?.data ?? response
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '',
    ),
  )
}

export const consultationsService = {
  async queue(params = {}) {
    const response = await api.get(
      '/consultations/queue',
      {
        params: cleanParams({
          q: params.q,
          priority: params.priority,
          serviceId: params.serviceId,
          page: params.page || 1,
          limit: params.limit || 20,
        }),
      },
    )

    return unwrapResponse(response)
  },

  async start(payload) {
    const response = await api.post(
      '/consultations/start',
      payload,
    )

    return unwrapResponse(response)
  },

  async list(params = {}) {
    const limit =
      params.limit ||
      params.limite ||
      10

    const response = await api.get('/consultations', {
      params: cleanParams({
        page: params.page || 1,
        limit,
        limite: limit,
      }),
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(
      `/consultations/${id}`,
    )

    return unwrapResponse(response)
  },

  async updateClinical(id, payload) {
    const response = await api.patch(
      `/consultations/${id}/clinical`,
      payload,
    )

    return unwrapResponse(response)
  },

  async clinicalHistory(id, params = {}) {
    const response = await api.get(
      `/consultations/${id}/clinical-history`,
      {
        params: cleanParams({
          page: params.page || 1,
          limit: params.limit || 20,
        }),
      },
    )

    return unwrapResponse(response)
  },

  async requestExamen(id, payload) {
    const response = await api.post(
      `/consultations/${id}/examens/batch`,
      payload,
    )

    return unwrapResponse(response)
  },

  async createPrescription(id, payload) {
    const response = await api.post(
      `/consultations/${id}/prescriptions`,
      payload,
    )

    return unwrapResponse(response)
  },

  async close(id, payload) {
    const response = await api.post(
      `/consultations/${id}/close`,
      payload,
    )

    return unwrapResponse(response)
  },
}
