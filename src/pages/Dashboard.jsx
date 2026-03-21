import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import AppLayout from '../components/AppLayout';
import Topbar from '../components/Topbar';
import { useToast } from '../hooks/useToast';
import { getDashboardStats } from '../api/dashboardService';
import { useApi } from '../hooks/useApi';
import { transformRevenueHistory, transformClientDistribution, formatTime, APPOINTMENT_STATUS_TO_TR } from '../utils/dataTransformers';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const S = {
  body: { padding:28, flex:1 },
  greeting: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, gap:20, flexWrap:'wrap' },
  h1: { fontFamily:'var(--font-display)', fontSize:32, fontWeight:500, color:'var(--charcoal)', marginBottom:4 },
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  kpiCard: { background:'var(--surface)', border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:22, cursor:'default', transition:'all 0.3s' },
  chartsRow: { display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 },
  chartCard: { background:'var(--surface)', border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:24 },
  bottomRow: { display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16 },
  panel: { background:'var(--surface)', border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', overflow:'hidden' },
  panelHeader: { padding:'16px 20px', borderBottom:'1px solid var(--border-light)', display:'flex', alignItems:'center', justifyContent:'space-between' },
  th: { fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--muted)', padding:'12px 16px', textAlign:'left', background:'var(--sage-50)', whiteSpace:'nowrap' },
  td: { padding:'13px 16px', fontSize:13, color:'var(--charcoal)', borderBottom:'1px solid var(--border-light)' },
};

function KpiCard({ icon, iconBg, value, label, sub, trend, trendUp }) {
  return (
    <div style={{...S.kpiCard}} onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-md)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{width:42,height:42,background:iconBg,borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
        <span style={{fontSize:12,fontWeight:600,padding:'3px 8px',borderRadius:99,background:trendUp?'#ecfdf5':'#fef2f2',color:trendUp?'#065f46':'#991b1b'}}>{trend}</span>
      </div>
      <div style={{fontFamily:'var(--font-display)',fontSize:36,fontWeight:600,color:'var(--charcoal)',lineHeight:1,marginBottom:4}}>{value}</div>
      <div style={{fontSize:13,color:'var(--muted)',marginBottom:2}}>{label}</div>
      <div style={{fontSize:12,color:'var(--muted)'}}>{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const toast = useToast();
  const [revenueTab, setRevenueTab] = useState('monthly');
  const { data: stats, isLoading, error, refetch } = useApi(getDashboardStats, []);

  const [tasks, setTasks] = useState([
    { id:1, text:'Ayşe Yılmaz - program güncelle', done:true, priority:'Tamamlandı', pc:'badge-bej' },
    { id:2, text:'Mert Kaya - anamnez formu hazırla', done:false, priority:'Yüksek', pc:'badge-warn' },
    { id:3, text:'Haftalık ölçüm raporlarını gönder', done:false, priority:'Normal', pc:'badge-info' },
    { id:4, text:'Yeni tarif kütüphanesi güncelle', done:false, priority:'Düşük', pc:'badge-green' },
    { id:5, text:'Mart faturalarını kontrol et', done:true, priority:'Tamamlandı', pc:'badge-bej' },
    { id:6, text:'Selin Çelik - ölçüm takibi gir', done:false, priority:'Yüksek', pc:'badge-warn' },
  ]);

  const todayAppts = stats?.today_appointments || [];

  const revenueTrend = stats?.revenue_trend || [];
  const revenueChartData = transformRevenueHistory(revenueTrend);

  const barData = {
    labels: revenueChartData.labels,
    datasets: [{ label:'Gelir (₺)', data: revenueChartData.data, backgroundColor: revenueChartData.data.map((_,i) => i === revenueChartData.data.length-1 ? '#3e6b34':'#ccdfc5'), borderRadius:6 }],
  };
  const barOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1e2a1a', callbacks:{ label: ctx => ` ₺${ctx.raw.toLocaleString('tr-TR')}` } } },
    scales:{ x:{grid:{display:false},ticks:{color:'#6b7a65',font:{size:11}}}, y:{grid:{color:'rgba(0,0,0,0.04)'},ticks:{color:'#6b7a65',font:{size:11},callback:v=>'₺'+(v/1000).toFixed(0)+'k'}} },
  };

  const donutChartData = transformClientDistribution(stats?.client_distribution || {});
  const donutData = {
    labels: donutChartData.labels,
    datasets:[{ data:donutChartData.data, backgroundColor:['#548a48','#b8924a','#7aaa6d','#ccdfc5'], borderWidth:0, hoverOffset:6 }],
  };
  const donutOpts = { responsive:true, maintainAspectRatio:false, cutout:'72%', plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1e2a1a', callbacks:{ label: ctx => ` ${ctx.label}: ${ctx.raw} danışan` } } } };

  const statusColors = { onaylı:'var(--success)', bekliyor:'var(--warning)', iptal:'var(--danger)' };
  const badgeStyle = { green:{background:'var(--sage-100)',color:'var(--sage-700)'}, warn:{background:'#fef3e2',color:'var(--warning)'}, info:{background:'#e2f0f8',color:'var(--info)'}, bej:{background:'var(--bej-100)',color:'var(--bej-700)'} };

  return (
    <AppLayout>
      <Topbar title="Dashboard" subtitle="Salı, 17 Mart 2026"
        actions={<>
          <button onClick={()=>toast('Excel raporu hazırlanıyor...','info')} style={{padding:'8px 16px',borderRadius:99,border:'1px solid var(--border)',background:'white',fontSize:13,fontWeight:500,cursor:'pointer'}}>📥 Rapor İndir</button>
          <Link to="/danisanlar" style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',fontSize:13,fontWeight:500}}>➕ Yeni Danışan</Link>
        </>}
      />
      <div style={S.body}>
        {error && (
          <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px 16px',borderRadius:'8px',marginBottom:'16px'}}>
            Veriler yüklenemedi: {error} <button onClick={refetch}>Tekrar dene</button>
          </div>
        )}

        {/* Greeting */}
        <div style={S.greeting}>
          <div><h1 style={S.h1}>Merhaba, Derya Hanım 👋</h1><p style={{fontSize:14,color:'var(--muted)'}}>Bugün 5 randevunuz var. Son 30 günde 8 yeni danışan eklediniz.</p></div>
        </div>

        {/* KPI */}
        <div style={S.kpiGrid}>
          <KpiCard icon="👥" iconBg="var(--sage-100)" value={stats?.active_clients ?? '—'} label="Aktif Danışan" sub="Bu ay 6 yeni kayıt" trend="↑ +6" trendUp />
          <KpiCard icon="📅" iconBg="var(--bej-100)" value={stats?.weekly_appointments ?? '—'} label="Bu Haftaki Randevu" sub="5 bugün, 7 hafta içi" trend="↑ +2" trendUp />
          <KpiCard icon="💰" iconBg="#ecfdf5" value={stats?.monthly_revenue ? stats.monthly_revenue.toLocaleString('tr-TR') + ' ₺' : '—'} label="Aylık Gelir" sub="Geçen aya göre +₺3.6k" trend="↑ %18" trendUp />
          <KpiCard icon="📊" iconBg="#e2f0f8" value={stats?.success_rate ? stats.success_rate + '%' : '—'} label="Hedef Başarı Oranı" sub="45 / 48 danışan hedefe ulaştı" trend="↑ %4" trendUp />
        </div>

        {/* Charts */}
        <div style={S.chartsRow}>
          <div style={S.chartCard}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div><div style={{fontSize:15,fontWeight:600}}>Gelir Analizi</div><div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Son 7 dönemin gelir grafiği</div></div>
              <div style={{display:'flex',gap:4}}>
                {['monthly','weekly'].map(t=>(
                  <button key={t} onClick={()=>setRevenueTab(t)} style={{padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:500,cursor:'pointer',border:'1px solid',borderColor:revenueTab===t?'var(--sage-200)':'transparent',background:revenueTab===t?'var(--sage-100)':'transparent',color:revenueTab===t?'var(--primary)':'var(--muted)'}}>
                    {t==='monthly'?'Aylık':'Haftalık'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{height:220}}><Bar data={barData} options={barOpts} /></div>
          </div>
          <div style={S.chartCard}>
            <div style={{marginBottom:20}}><div style={{fontSize:15,fontWeight:600}}>Danışan Dağılımı</div><div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Programa göre</div></div>
            <div style={{height:150}}><Doughnut data={donutData} options={donutOpts} /></div>
            <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:8}}>
              {[['#548a48','Kilo Verme'],['#b8924a','Kilo Alma'],['#7aaa6d','Sağlıklı Beslenme'],['#ccdfc5','Spor Beslenmesi']].map(([c,l],idx)=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:c,flexShrink:0}}/>
                  <span style={{fontSize:12,color:'var(--muted)',flex:1}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:600}}>{donutChartData.data[idx] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={S.bottomRow}>
          {/* Today's appointments */}
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={{fontSize:14,fontWeight:600}}>Bugünkü Randevular</span>
              <Link to="/randevular" style={{fontSize:12,color:'var(--primary)',fontWeight:500}}>Tüm randevular →</Link>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={S.th}>Danışan</th><th style={S.th}>Saat</th><th style={S.th}>Tür</th><th style={S.th}>Durum</th><th style={S.th}></th></tr></thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={5} style={{...S.td,textAlign:'center',color:'var(--muted)'}}>Yükleniyor...</td></tr>
                )}
                {!isLoading && todayAppts.length === 0 && (
                  <tr><td colSpan={5} style={{...S.td,textAlign:'center',color:'var(--muted)'}}>Bugün randevu yok.</td></tr>
                )}
                {!isLoading && todayAppts.map(apt=>{
                  const statusTr = APPOINTMENT_STATUS_TO_TR[apt.status] || apt.status;
                  return (
                    <tr key={apt.id} style={{cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='var(--sage-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={S.td}><div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'var(--sage-100)',color:'var(--sage-700)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>
                          {(apt.client_name||'').split(' ').slice(0,2).map(w=>w[0]||'').join('')}
                        </div>
                        <div><div style={{fontWeight:500}}>{apt.client_name}</div><div style={{fontSize:11,color:'var(--muted)'}}>{apt.type||'Danışmanlık'}</div></div>
                      </div></td>
                      <td style={{...S.td,fontFamily:'var(--font-mono)'}}>{formatTime(apt.start_time)}</td>
                      <td style={S.td}><span style={{padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:500,background:apt.mode==='Online'?'#e2f0f8':'var(--sage-100)',color:apt.mode==='Online'?'var(--info)':'var(--sage-700)'}}>{apt.mode||'Yüz yüze'}</span></td>
                      <td style={S.td}><span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:statusColors[statusTr]||'var(--muted)'}}><span style={{width:7,height:7,borderRadius:'50%',background:statusColors[statusTr]||'var(--muted)'}}></span>{statusTr ? statusTr.charAt(0).toUpperCase()+statusTr.slice(1) : apt.status}</span></td>
                      <td style={S.td}><button onClick={()=>toast(`${apt.client_name} randevusu açılıyor`,'info')} style={{padding:'6px 12px',borderRadius:99,border:'none',background:'transparent',fontSize:12,fontWeight:500,color:'var(--primary)',cursor:'pointer'}}>Detay</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tasks */}
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={{fontSize:14,fontWeight:600}}>Görevler</span>
              <span style={{fontSize:12,color:'var(--primary)',fontWeight:500,cursor:'pointer'}} onClick={()=>toast('Tüm görevler','info')}>Tümü →</span>
            </div>
            <div style={{padding:'8px 12px',display:'flex',flexDirection:'column',gap:2}}>
              {tasks.map(t=>(
                <div key={t.id} onClick={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,done:!x.done}:x))}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:'var(--radius-md)',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--sage-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:18,height:18,borderRadius:5,border:t.done?'none':'2px solid var(--border)',background:t.done?'var(--primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'white',flexShrink:0,transition:'all 0.15s'}}>
                    {t.done?'✓':''}
                  </div>
                  <span style={{flex:1,fontSize:13,color:'var(--charcoal)',textDecoration:t.done?'line-through':'none',opacity:t.done?0.5:1}}>{t.text}</span>
                  <span style={{fontSize:10,padding:'2px 7px',borderRadius:99,...(badgeStyle[t.pc.replace('badge-','')]||{})}}>{t.priority}</span>
                </div>
              ))}
            </div>
            <div onClick={()=>{const n=prompt('Yeni görev:');if(n)setTasks(p=>[...p,{id:Date.now(),text:n,done:false,priority:'Normal',pc:'badge-info'}]);}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 22px',margin:'4px 12px 12px',borderRadius:'var(--radius-md)',cursor:'pointer',border:'1.5px dashed var(--border)',color:'var(--muted)',fontSize:13,transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)';e.currentTarget.style.background='var(--sage-50)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)';e.currentTarget.style.background='transparent'}}>
              <span>➕</span> Yeni görev ekle
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
