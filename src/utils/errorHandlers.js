export function extractApiError(axiosError) {
  if (!axiosError.response) {
    return { message: 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.', code: 'NETWORK_ERROR', details: [] };
  }
  const data = axiosError.response.data || {};
  return {
    message: data.message || 'Beklenmeyen bir hata oluştu.',
    code: data.error || 'UNKNOWN_ERROR',
    details: data.details || [],
  };
}

export function mapDetailsToFieldErrors(details) {
  if (!Array.isArray(details)) return {};
  return details.reduce((acc, item) => {
    if (item.field && item.message) acc[item.field] = item.message;
    return acc;
  }, {});
}

export function isNotFound(axiosError) {
  return axiosError.response?.data?.error === 'NOT_FOUND';
}
