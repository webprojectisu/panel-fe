export const COLOR_PALETTE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

const TR_MONTHS = { 1: 'Oca', 2: 'Şub', 3: 'Mar', 4: 'Nis', 5: 'May', 6: 'Haz', 7: 'Tem', 8: 'Ağu', 9: 'Eyl', 10: 'Eki', 11: 'Kas', 12: 'Ara' };

export const APPOINTMENT_STATUS_TO_TR = { scheduled: 'onaylı', cancelled: 'iptal', completed: 'tamamlandi', no_show: 'gelmedi' };
export const APPOINTMENT_STATUS_FROM_TR = { 'onaylı': 'scheduled', 'iptal': 'cancelled', 'tamamlandi': 'completed', 'gelmedi': 'no_show' };
export const CLIENT_STATUS_TO_API = { 'aktif': 'active', 'beklemede': 'pending', 'tamamlandi': 'completed', '': '' };
export const CLIENT_STATUS_FROM_API = { active: 'aktif', pending: 'beklemede', completed: 'tamamlandi' };
export const PAYMENT_METHOD_TO_TR = { cash: 'Nakit', bank_transfer: 'Banka Havalesi', credit_card: 'Kredi Kartı', debit_card: 'Debit Kart', online: 'Online' };

export function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatTime(timeString) {
  if (!timeString) return '';
  return timeString.slice(0, 5); // "09:00:00" → "09:00"
}

export function formatDateShort(date) {
  const d = new Date(date);
  return `${d.getDate()} ${TR_MONTHS[d.getMonth() + 1]}`;
}

export function transformClient(apiClient) {
  const words = (apiClient.full_name || '').trim().split(/\s+/);
  const initials = words.slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  let age = null;
  if (apiClient.date_of_birth) {
    age = new Date().getFullYear() - new Date(apiClient.date_of_birth).getFullYear();
  }
  const genderMap = { female: 'Kadın', male: 'Erkek', other: 'Diğer' };
  return {
    ...apiClient,
    name: apiClient.full_name,
    initials,
    color: COLOR_PALETTE[apiClient.id % COLOR_PALETTE.length],
    age,
    gender: genderMap[apiClient.gender] || apiClient.gender,
    status: CLIENT_STATUS_FROM_API[apiClient.status] || 'aktif',
    progress: 0,
  };
}

export function transformAppointment(apiAppointment, weekStart) {
  const aptDate = new Date(apiAppointment.appointment_date);
  const wStart = new Date(weekStart);
  wStart.setHours(0, 0, 0, 0);
  aptDate.setHours(0, 0, 0, 0);
  const diffMs = aptDate - wStart;
  const day = Math.round(diffMs / 86400000) + 1; // 1=Mon

  const [sh, sm] = (apiAppointment.start_time || '00:00:00').split(':').map(Number);
  let duration = 60;
  if (apiAppointment.end_time) {
    const [eh, em] = apiAppointment.end_time.split(':').map(Number);
    duration = (eh * 60 + em) - (sh * 60 + sm);
  }

  return {
    ...apiAppointment,
    day,
    startH: sh,
    startM: sm,
    duration,
    type: 'Danışmanlık',
    mode: 'Yüz yüze',
    status: APPOINTMENT_STATUS_TO_TR[apiAppointment.status] || apiAppointment.status,
    color: COLOR_PALETTE[(apiAppointment.client_id || 0) % COLOR_PALETTE.length],
  };
}

export function transformRevenueHistory(revenueTrend) {
  if (!revenueTrend?.length) return { labels: [], data: [] };
  return {
    labels: revenueTrend.map(item => {
      const monthNum = parseInt(item.month.split('-')[1], 10);
      return TR_MONTHS[monthNum] || item.month;
    }),
    data: revenueTrend.map(item => item.amount),
  };
}

export function transformClientDistribution(apiDist) {
  if (!apiDist) return { labels: [], data: [] };
  const labelMap = {
    weight_loss: 'Kilo Verme',
    weight_gain: 'Kilo Alma',
    healthy_eating: 'Sağlıklı Beslenme',
    sports_nutrition: 'Spor Beslenmesi',
    other: 'Diğer',
  };
  const keys = Object.keys(labelMap);
  return {
    labels: keys.map(k => labelMap[k]),
    data: keys.map(k => apiDist[k] || 0),
  };
}
