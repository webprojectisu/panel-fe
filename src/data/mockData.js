// DEPRECATED: All data is now served from the API. This file is kept for reference only.

// ── ENTITY 1: Diyetisyen (Dietitian)
export const dietitian = {
  id: 1,
  name: 'Dr. Derya Koç',
  initials: 'DK',
  title: 'Diyetisyen',
  plan: 'Pro Plan',
  email: 'derya.koc@nutriflow.com',
  phone: '0532 000 0001',
};

// ── ENTITY 2: Danışan (Client)
export const clients = [
  { id:'P001', name:'Ayşe Yılmaz',    initials:'AY', color:'#548a48', age:28, gender:'K', weight:72,  height:165, bmi:26.4, program_id:1, status:'aktif',      progress:68,  since:'10 Oca 2026', phone:'0532 123 4567', email:'ayse@mail.com',     next_appt:'24 Mar 2026', goal:'65 kg',  body_fat:'31%', muscle:'42.1 kg' },
  { id:'P002', name:'Mert Kaya',      initials:'MK', color:'#b8924a', age:34, gender:'E', weight:88,  height:178, bmi:27.8, program_id:1, status:'aktif',      progress:30,  since:'3 Mar 2026',  phone:'0544 987 6543', email:'mert@mail.com',     next_appt:'17 Mar 2026', goal:'80 kg',  body_fat:'24%', muscle:'65.4 kg' },
  { id:'P003', name:'Selin Çelik',    initials:'SÇ', color:'#7aaa6d', age:26, gender:'K', weight:54,  height:162, bmi:20.6, program_id:3, status:'aktif',      progress:82,  since:'5 Kas 2025',  phone:'0506 234 5678', email:'selin@mail.com',    next_appt:'28 Mar 2026', goal:'Sağlıklı kalori dengesi', body_fat:'22%', muscle:'36.2 kg' },
  { id:'P004', name:'Emre Öztürk',   initials:'EÖ', color:'#3e6b34', age:29, gender:'E', weight:76,  height:180, bmi:23.5, program_id:4, status:'beklemede',  progress:45,  since:'1 Şub 2026',  phone:'0555 321 6547', email:'emre@mail.com',     next_appt:'20 Mar 2026', goal:'Kas kütlesi artışı',    body_fat:'18%', muscle:'58.8 kg' },
  { id:'P005', name:'Neslihan Baş',  initials:'NB', color:'#a8c99e', colorText:'#2f5227', age:41, gender:'K', weight:80, height:160, bmi:31.3, program_id:1, status:'aktif', progress:22, since:'1 Mar 2026', phone:'0532 567 8901', email:'neslihan@mail.com', next_appt:'17 Mar 2026', goal:'70 kg', body_fat:'38%', muscle:'38.6 kg' },
  { id:'P006', name:'Can Doğan',     initials:'CD', color:'#ccdfc5', colorText:'#2f5227', age:22, gender:'E', weight:65, height:175, bmi:21.2, program_id:2, status:'aktif', progress:55, since:'15 Ara 2025', phone:'0541 654 3210', email:'can@mail.com', next_appt:'25 Mar 2026', goal:'72 kg', body_fat:'12%', muscle:'52.1 kg' },
  { id:'P007', name:'Zeynep Arslan', initials:'ZA', color:'#9a7538', age:35, gender:'K', weight:68,  height:168, bmi:24.1, program_id:3, status:'tamamlandi', progress:100, since:'1 Eyl 2025', phone:'0507 876 5432', email:'zeynep@mail.com',   next_appt:'—',           goal:'Diyet alışkanlığı',     body_fat:'25%', muscle:'40.3 kg' },
  { id:'P008', name:'Kerem Şahin',   initials:'KŞ', color:'#548a48', age:45, gender:'E', weight:95,  height:182, bmi:28.7, program_id:1, status:'aktif',      progress:40,  since:'20 Şub 2026', phone:'0533 456 7890', email:'kerem@mail.com',    next_appt:'22 Mar 2026', goal:'85 kg',  body_fat:'28%', muscle:'63.7 kg' },
];

// ── ENTITY 3: Randevu (Appointment)
export const appointments = [
  { id:1,  client_id:'P001', client_name:'Ayşe Yılmaz',    day:1, startH:10, startM:0,  dur:45, type:'Kontrol · 3. ay',       mode:'Online',    status:'onaylı',    color:'ev-green' },
  { id:2,  client_id:'P002', client_name:'Mert Kaya',      day:1, startH:11, startM:30, dur:60, type:'İlk Görüşme',            mode:'Yüz yüze',  status:'onaylı',    color:'ev-bej'   },
  { id:3,  client_id:'P003', client_name:'Selin Çelik',    day:1, startH:14, startM:0,  dur:45, type:'Ölçüm Güncellemesi',    mode:'Online',    status:'bekliyor',  color:'ev-blue'  },
  { id:4,  client_id:'P004', client_name:'Emre Öztürk',   day:1, startH:15, startM:30, dur:45, type:'Program Revizyonu',     mode:'Yüz yüze',  status:'iptal',     color:'ev-red'   },
  { id:5,  client_id:'P008', client_name:'Kerem Şahin',   day:2, startH:9,  startM:0,  dur:60, type:'Kontrol · 1. ay',       mode:'Online',    status:'onaylı',    color:'ev-green' },
  { id:6,  client_id:'P006', client_name:'Can Doğan',     day:2, startH:14, startM:30, dur:45, type:'Ölçüm Güncellemesi',    mode:'Yüz yüze',  status:'onaylı',    color:'ev-bej'   },
  { id:7,  client_id:'P005', client_name:'Neslihan Baş',  day:3, startH:10, startM:0,  dur:45, type:'Kontrol',               mode:'Online',    status:'onaylı',    color:'ev-green' },
  { id:8,  client_id:'P007', client_name:'Zeynep Arslan', day:3, startH:16, startM:0,  dur:60, type:'Beslenme Danışmanlığı', mode:'Online',    status:'onaylı',    color:'ev-blue'  },
  { id:9,  client_id:'P001', client_name:'Ayşe Yılmaz',   day:4, startH:11, startM:0,  dur:45, type:'Kontrol',               mode:'Yüz yüze',  status:'onaylı',    color:'ev-green' },
  { id:10, client_id:'P002', client_name:'Mert Kaya',     day:5, startH:13, startM:0,  dur:45, type:'Takip',                 mode:'Online',    status:'onaylı',    color:'ev-green' },
];

// ── ENTITY 4: Beslenme Programı (Nutrition Program)
export const programs = [
  { id:1, name:'Kilo Verme Programı',     calories:1650, protein:120, carbs:180, fat:55,  type:'kilo-verme',  color:'#548a48' },
  { id:2, name:'Kilo Alma Programı',      calories:2800, protein:160, carbs:360, fat:90,  type:'kilo-alma',   color:'#b8924a' },
  { id:3, name:'Sağlıklı Beslenme',       calories:2000, protein:100, carbs:250, fat:70,  type:'saglikli',    color:'#7aaa6d' },
  { id:4, name:'Spor Beslenmesi',         calories:3200, protein:200, carbs:400, fat:80,  type:'spor',        color:'#3e6b34' },
];

// ── ENTITY 5: Ölçüm (Measurement)
export const measurements = [
  { id:1,  client_id:'P001', date:'2026-01-10', weight:74.3, bmi:27.3, body_fat:32.5, muscle:41.7, waist:82 },
  { id:2,  client_id:'P001', date:'2026-02-10', weight:73.1, bmi:26.9, body_fat:31.8, muscle:42.0, waist:80 },
  { id:3,  client_id:'P001', date:'2026-03-10', weight:72.0, bmi:26.4, body_fat:31.0, muscle:42.1, waist:78 },
  { id:4,  client_id:'P002', date:'2026-03-03', weight:91.2, bmi:28.8, body_fat:26.0, muscle:64.8, waist:98 },
  { id:5,  client_id:'P002', date:'2026-03-17', weight:88.0, bmi:27.8, body_fat:24.0, muscle:65.4, waist:94 },
  { id:6,  client_id:'P003', date:'2026-11-05', weight:56.2, bmi:21.4, body_fat:23.5, muscle:35.8, waist:70 },
  { id:7,  client_id:'P003', date:'2026-03-17', weight:54.0, bmi:20.6, body_fat:22.0, muscle:36.2, waist:67 },
];

// Dashboard stats
export const dashboardStats = {
  activeClients: 48,
  weeklyAppointments: 12,
  monthlyRevenue: 24000,
  successRate: 94,
  revenueHistory: {
    monthly: { labels:['Eylül','Ekim','Kasım','Aralık','Ocak','Şubat','Mart'], data:[14200,16800,15400,19200,21000,20400,24000] },
    weekly:  { labels:['Hf 1','Hf 2','Hf 3','Hf 4','Hf 5','Hf 6','Hf 7'],    data:[4800,6200,5600,7400,5900,6800,7200] },
  },
  clientDistribution: { labels:['Kilo Verme','Kilo Alma','Sağlıklı','Spor'], data:[22,8,13,5] },
};
