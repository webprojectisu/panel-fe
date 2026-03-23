import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import AppLayout from '../components/AppLayout';
import Topbar from '../components/Topbar';
import { useToast } from '../hooks/useToast';
import { getPayments, createPayment, deletePayment, getPaymentSummary } from '../api/paymentService';
import { getClients } from '../api/clientService';
import { getDashboardStats } from '../api/dashboardService';
import { getMe, updateMe, changePassword } from '../api/userService';
import { useApi } from '../hooks/useApi';
import { PAYMENT_METHOD_TO_TR, transformRevenueHistory } from '../utils/dataTransformers';
import { extractApiError, mapDetailsToFieldErrors } from '../utils/errorHandlers';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

// ─── GELİR & GİDER ─────────────────────────────────────
export function GelirGider() {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client_id:'', amount:'', currency:'TRY', payment_date:'', payment_method:'cash', status:'completed', notes:'' });

  const { data: payments, isLoading, refetch } = useApi(getPayments, []);
  const { data: summary } = useApi(getPaymentSummary, []);
  const { data: clientList } = useApi(getClients, []);

  const totalGelir = summary?.total_income || 0;
  const paymentCount = (payments || []).length;
  const avgPayment = paymentCount > 0 ? totalGelir / paymentCount : 0;

  const revenueHistory = transformRevenueHistory(summary?.monthly_trend || []);
  const chartData = {
    labels: revenueHistory.labels,
    datasets: [
      { label: 'Income', data: revenueHistory.data, backgroundColor: 'rgba(84,138,72,0.7)', borderRadius: 5 },
    ],
  };
  const chartOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'top'}, tooltip:{ backgroundColor:'#1e2a1a', callbacks:{ label:ctx=>`${ctx.dataset.label}: ₺${(ctx.raw||0).toLocaleString('tr-TR')}` } } }, scales:{ x:{grid:{display:false},ticks:{color:'#6b7a65',font:{size:11}}}, y:{grid:{color:'rgba(0,0,0,0.04)'},ticks:{color:'#6b7a65',font:{size:11},callback:v=>'₺'+(v/1000)+'k'}} } };

  const filtered = filter === 'all' ? (payments || []) : (payments || []).filter(p => p.status === filter);

  const handleCreate = async () => {
    try {
      await createPayment({
        client_id: parseInt(form.client_id),
        amount: parseFloat(form.amount),
        currency: form.currency,
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        status: form.status,
        notes: form.notes,
      });
      refetch();
      toast('Payment saved ✅', 'success');
      setShowAdd(false);
      setForm({ client_id:'', amount:'', currency:'TRY', payment_date:'', payment_method:'cash', status:'completed', notes:'' });
    } catch (err) {
      const { message } = extractApiError(err);
      toast(message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try {
      await deletePayment(id);
      refetch();
      toast('Payment deleted', 'success');
    } catch (err) {
      const { message } = extractApiError(err);
      toast(message, 'error');
    }
  };

  return (
    <AppLayout>
      <Topbar title="Income & Expenses" subtitle="Financial tracking panel"
        actions={<button onClick={()=>setShowAdd(true)} style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>➕ Add Transaction</button>}
      />
      <div style={{padding:28,flex:1}}>
        {/* KPI */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[['💰','Total Income','₺'+totalGelir.toLocaleString('tr-TR'),'','#ecfdf5'],['📊','Payment Count',paymentCount+' transactions','','var(--bej-100)'],['📈','Average Payment','₺'+Math.round(avgPayment).toLocaleString('tr-TR'),'','#e2f0f8'],['🏦','Currency',summary?.currency||'TRY','','var(--sage-100)']].map(([ic,l,v,tr,bg])=>(
            <div key={l} style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:22}}>
              <div style={{width:42,height:42,background:bg,borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:12}}>{ic}</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:600,marginBottom:4}}>{v}</div>
              <div style={{fontSize:13,color:'var(--muted)',marginBottom:2}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {revenueHistory.labels.length > 0 && (
          <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:24,marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Monthly Revenue Trend</div>
            <div style={{height:220}}><Bar data={chartData} options={chartOpts}/></div>
          </div>
        )}

        {/* Payment list */}
        <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border-light)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
            <span style={{fontSize:14,fontWeight:600}}>Payment History</span>
            <div style={{display:'flex',gap:6}}>
              {[['all','All'],['completed','Completed'],['pending','Pending'],['failed','Failed']].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)} style={{padding:'6px 14px',borderRadius:99,fontSize:12,fontWeight:500,cursor:'pointer',border:'1px solid',borderColor:filter===v?'var(--sage-300)':'var(--border-light)',background:filter===v?'var(--sage-100)':'white',color:filter===v?'var(--sage-700)':'var(--muted)'}}>{l}</button>
              ))}
            </div>
          </div>

          {isLoading && <div style={{textAlign:'center',padding:'40px',color:'var(--muted)'}}>Loading...</div>}
          {!isLoading && (payments||[]).length === 0 && <div style={{textAlign:'center',padding:'40px',color:'var(--muted)'}}>No payment records yet.</div>}

          {!isLoading && filtered.length > 0 && (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Date','Client','Method','Status','Amount',''].map(h=><th key={h} style={{fontSize:11,fontWeight:600,padding:'10px 16px',textAlign:'left',background:'var(--sage-50)',color:'var(--muted)'}}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((p,i)=>(
                  <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background='var(--sage-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'12px 16px',fontSize:12,color:'var(--muted)',fontFamily:'var(--font-mono)',borderBottom:'1px solid var(--border-light)'}}>{p.payment_date}</td>
                    <td style={{padding:'12px 16px',fontSize:13,borderBottom:'1px solid var(--border-light)'}}>{p.client_name||'—'}</td>
                    <td style={{padding:'12px 16px',borderBottom:'1px solid var(--border-light)'}}><span style={{padding:'2px 8px',borderRadius:99,fontSize:11,background:'var(--sage-50)',color:'var(--sage-700)'}}>{PAYMENT_METHOD_TO_TR[p.payment_method]||p.payment_method}</span></td>
                    <td style={{padding:'12px 16px',borderBottom:'1px solid var(--border-light)'}}><span style={{padding:'2px 8px',borderRadius:99,fontSize:11,background:p.status==='completed'?'#ecfdf5':p.status==='pending'?'#fef3e2':'#fef2f2',color:p.status==='completed'?'#065f46':p.status==='pending'?'#92400e':'#991b1b'}}>{p.status==='completed'?'Completed':p.status==='pending'?'Pending':p.status==='failed'?'Failed':'Refunded'}</span></td>
                    <td style={{padding:'12px 16px',fontSize:14,fontWeight:700,color:'var(--success)',borderBottom:'1px solid var(--border-light)'}}>₺{(p.amount||0).toLocaleString('tr-TR')}</td>
                    <td style={{padding:'12px 16px',borderBottom:'1px solid var(--border-light)'}}><button onClick={()=>handleDelete(p.id)} style={{padding:'4px 10px',borderRadius:99,border:'none',background:'transparent',fontSize:12,color:'var(--danger)',cursor:'pointer'}}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}} style={{position:'fixed',inset:0,background:'rgba(30,42,26,0.5)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',borderRadius:'var(--radius-xl)',padding:32,width:460,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'var(--shadow-xl)',animation:'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:500}}>Add Payment</span>
              <button onClick={()=>setShowAdd(false)} style={{width:32,height:32,borderRadius:'50%',background:'var(--sage-50)',border:'none',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Client</label>
              <select value={form.client_id} onChange={e=>setForm(p=>({...p,client_id:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                <option value="">Select...</option>
                {(clientList||[]).map(c=><option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            {[['Amount (₺)','amount','number'],['Date','payment_date','date']].map(([l,k,t])=>(
              <div key={k} style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Payment Method</label>
              <select value={form.payment_method} onChange={e=>setForm(p=>({...p,payment_method:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                {Object.entries(PAYMENT_METHOD_TO_TR).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Status</label>
              <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Notes</label>
              <input type="text" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:16,paddingTop:16,borderTop:'1px solid var(--border-light)'}}>
              <button onClick={()=>setShowAdd(false)} style={{padding:'9px 20px',borderRadius:99,border:'1px solid var(--border)',background:'white',fontSize:13,fontWeight:500,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{padding:'9px 20px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ─── RAPORLAR ──────────────────────────────────────────
export function Raporlar() {
  const toast = useToast();
  const { data: stats } = useApi(getDashboardStats, []);
  const { data: summary } = useApi(getPaymentSummary, []);

  const revenueHistory = transformRevenueHistory(stats?.revenue_trend || []);
  const lineData = {
    labels: revenueHistory.labels,
    datasets: [
      { label: 'Income (₺)', data: revenueHistory.data, borderColor: '#548a48', backgroundColor: 'rgba(84,138,72,0.1)', fill: true, tension: 0.4 },
    ],
  };
  const lineOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'top'}, tooltip:{backgroundColor:'#1e2a1a'} }, scales:{ x:{grid:{display:false},ticks:{color:'#6b7a65',font:{size:11}}}, y:{grid:{color:'rgba(0,0,0,0.04)'},ticks:{color:'#6b7a65',font:{size:11}}} } };

  const reports = [
    { title:'March 2026 Monthly Report', desc:'Main report for March 2026', date:'17 Mar 2026', type:'Aylık', icon:'📅' },
    { title:'Q1 2026 Quarterly Report', desc:'Main report for Q1 2026', date:'31 Mar 2026', type:'Çeyreklik', icon:'📊' },
    { title:'Client Success Report', desc:'Main report for client success rates', date:'17 Mar 2026', type:'Analiz', icon:'🎯' },
    { title:'Income Analysis Report', desc:'Main report for income analysis', date:'17 Mar 2026', type:'Finansal', icon:'💰' },
  ];

  return (
    <AppLayout>
      <Topbar title="Reports" subtitle="Clinic performance analytics"
        actions={<button onClick={()=>toast('Creating report...','info')} style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>📄 New Report</button>}
      />
      <div style={{padding:28,flex:1}}>
        {/* Summary cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[['👥',stats?.active_clients??'—','Active Clients','Total active'],['🎯',stats?.success_rate!=null?'%'+stats.success_rate:'—','Success Rate','Client success'],['📅',stats?.weekly_appointments??'—','This Week Appointments','Scheduled'],['💰',summary?.total_income!=null?'₺'+summary.total_income.toLocaleString('tr-TR'):'—','Total Income','All time']].map(([ic,v,l,s])=>(
            <div key={l} style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:22}}>
              <div style={{fontSize:28,marginBottom:8}}>{ic}</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:600,marginBottom:4,lineHeight:1}}>{v}</div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{l}</div>
              <div style={{fontSize:12,color:'var(--muted)'}}>{s}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {revenueHistory.labels.length > 0 && (
          <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:24,marginBottom:24}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Revenue Trend</div>
            <div style={{height:220}}><Line data={lineData} options={lineOpts}/></div>
          </div>
        )}

        {/* Report list */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {reports.map((r,i)=>(
            <div key={i} style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:24,transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-md)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
              <div style={{fontSize:36,marginBottom:14}}>{r.icon}</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>{r.title}</div>
              <div style={{fontSize:13,color:'var(--muted)',marginBottom:12,lineHeight:1.5}}>{r.desc}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <span style={{padding:'2px 8px',borderRadius:99,fontSize:11,background:'var(--sage-100)',color:'var(--sage-700)'}}>{r.type}</span>
                <span style={{fontSize:11,color:'var(--muted)'}}>{r.date}</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>toast('Downloading report...','info')} style={{flex:1,padding:'8px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:12,fontWeight:500,cursor:'pointer'}}>📥 Download</button>
                <button onClick={()=>toast('Viewing report...','info')} style={{flex:1,padding:'8px',borderRadius:99,background:'white',border:'1px solid var(--border)',fontSize:12,fontWeight:500,cursor:'pointer'}}>👁 View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── WEB SİTEM ─────────────────────────────────────────
export function WebSitem() {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({ siteName:'Dr. Derya Koç Diyetisyenlik', slug:'derya-koc', tagline:'Sağlıklı beslenme için profesyonel rehberlik', about:'10 yılı aşkın deneyimim ile kişiye özel beslenme programları hazırlıyor, sağlıklı yaşam yolculuğunuzda size rehberlik ediyorum.', phone:'0532 000 0001', email:'derya@nutriflow.com', instagram:'', bookingEnabled:true, onlineEnabled:true });

  const sections = [['general','⚙️','General'],['content','✏️','Content'],['appearance','🎨','Appearance'],['booking','📅','Booking']];
  const themes = [['Yeşil & Bej','linear-gradient(135deg,#3e6b34,#b8924a)'],['Mavi & Beyaz','linear-gradient(135deg,#1e40af,#60a5fa)'],['Mor & Pembe','linear-gradient(135deg,#7c3aed,#ec4899)'],['Turuncu & Kahve','linear-gradient(135deg,#c2410c,#92400e)']];

  return (
    <AppLayout>
      <Topbar title="My Website" subtitle="Manage your clinic website"
        actions={
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>toast('Opening preview...','info')} style={{padding:'8px 16px',borderRadius:99,background:'white',border:'1px solid var(--border)',fontSize:13,fontWeight:500,cursor:'pointer'}}>👁 Preview</button>
            <button onClick={()=>toast('Changes saved ✅','success')} style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>💾 Publish</button>
          </div>
        }
      />
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Left nav */}
        <div style={{width:220,flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border-light)',padding:12}}>
          {sections.map(([k,ic,l])=>(
            <div key={k} onClick={()=>setActiveSection(k)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:'var(--radius-md)',cursor:'pointer',marginBottom:4,background:activeSection===k?'var(--sage-50)':'transparent',color:activeSection===k?'var(--primary)':'var(--muted)',fontWeight:activeSection===k?600:400,fontSize:14,transition:'all 0.15s',border:`1px solid ${activeSection===k?'var(--sage-200)':'transparent'}`}}
              onMouseEnter={e=>{if(activeSection!==k)e.currentTarget.style.background='var(--sage-50)'}} onMouseLeave={e=>{if(activeSection!==k)e.currentTarget.style.background='transparent'}}>
              {ic} {l}
            </div>
          ))}
          <div style={{marginTop:24,padding:'12px',background:'var(--sage-50)',borderRadius:'var(--radius-md)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',marginBottom:6}}>Your Site Address</div>
            <div style={{fontSize:12,color:'var(--primary)',wordBreak:'break-all'}}>nutriflow.app/{settings.slug}</div>
            <div style={{marginTop:8,display:'flex',alignItems:'center',gap:4}}><div style={{width:6,height:6,borderRadius:'50%',background:'var(--success)'}}></div><span style={{fontSize:11,color:'var(--success)'}}>Live</span></div>
          </div>
        </div>

        {/* Right content */}
        <div style={{flex:1,overflowY:'auto',padding:28}}>
          {activeSection==='general'&&(
            <>
              <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:500,marginBottom:20}}>General Settings</h2>
              {[['Site Title','siteName'],['URL Slug','slug'],['Short Description','tagline'],['Phone','phone'],['Email','email'],['Instagram','instagram']].map(([l,k])=>(
                <div key={k} style={{marginBottom:16}}>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:6}}>{l}</label>
                  <input value={settings[k]} onChange={e=>setSettings(p=>({...p,[k]:e.target.value}))} style={{width:'100%',maxWidth:480,padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}/>
                </div>
              ))}
            </>
          )}
          {activeSection==='content'&&(
            <>
              <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:500,marginBottom:20}}>Content Management</h2>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:6}}>About</label>
                <textarea value={settings.about} onChange={e=>setSettings(p=>({...p,about:e.target.value}))} rows={4} style={{width:'100%',maxWidth:560,padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',resize:'vertical',fontFamily:'var(--font-body)'}}/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:10}}>Specialties</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {['Kilo Yönetimi','Spor Beslenmesi','Çocuk Beslenmesi','Diyabet Diyeti','Kalp Sağlığı','Vegan Beslenme'].map(tag=>(
                    <span key={tag} onClick={()=>toast(`${tag} ${settings.about.includes(tag)?'kaldırıldı':'eklendi'}`,'info')} style={{padding:'6px 14px',borderRadius:99,fontSize:13,background:'var(--sage-100)',color:'var(--sage-700)',cursor:'pointer',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-200)'}} onMouseLeave={e=>{e.currentTarget.style.background='var(--sage-100)'}}>{tag} ✓</span>
                  ))}
                </div>
              </div>
            </>
          )}
          {activeSection==='appearance'&&(
            <>
              <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:500,marginBottom:20}}>Theme & Appearance</h2>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:12}}>Color Theme</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,maxWidth:480}}>
                  {themes.map(([name,grad],i)=>(
                    <div key={name} onClick={()=>toast(`"${name}" teması seçildi`,'success')} style={{cursor:'pointer',borderRadius:'var(--radius-md)',overflow:'hidden',border:`2px solid ${i===0?'var(--primary)':'var(--border-light)'}`,transition:'all 0.15s'}}>
                      <div style={{height:48,background:grad}}/>
                      <div style={{padding:'6px 8px',fontSize:11,fontWeight:500,textAlign:'center',background:'white'}}>{name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {activeSection==='booking'&&(
            <>
              <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:500,marginBottom:20}}>Booking Settings</h2>
              {[['Online Booking Active','bookingEnabled','Allow online booking from your website'],['Online Meeting','onlineEnabled','Show video call option']].map(([l,k,desc])=>(
                <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:16,background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',marginBottom:12}}>
                  <div><div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:12,color:'var(--muted)'}}>{desc}</div></div>
                  <div onClick={()=>setSettings(p=>({...p,[k]:!p[k]}))} style={{width:44,height:24,borderRadius:99,background:settings[k]?'var(--primary)':'var(--border)',cursor:'pointer',position:'relative',transition:'background 0.3s'}}>
                    <div style={{position:'absolute',top:3,left:settings[k]?22:3,width:18,height:18,borderRadius:'50%',background:'white',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.3s'}}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:16}}>
                <label style={{fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:10}}>Appointment Hours</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                  {['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'].map(t=>(
                    <button key={t} onClick={()=>toast(`${t} ${['09:00','10:00','14:00','16:00'].includes(t)?'kapatıldı':'açıldı'}`,'info')} style={{padding:'10px',borderRadius:'var(--radius-md)',fontSize:13,fontWeight:500,cursor:'pointer',border:`1px solid ${['09:00','10:00','14:00','16:00'].includes(t)?'var(--sage-200)':'var(--border)'}`,background:['09:00','10:00','14:00','16:00'].includes(t)?'var(--sage-50)':'white',color:['09:00','10:00','14:00','16:00'].includes(t)?'var(--sage-700)':'var(--muted)'}}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div style={{marginTop:24}}>
            <button onClick={()=>toast('Changes saved ✅','success')} style={{padding:'10px 24px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>💾 Save Changes</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── AYARLAR ───────────────────────────────────────────
export function Ayarlar() {
  const toast = useToast();
  const [tab, setTab] = useState('profile');
  const [profil, setProfil] = useState({ name:'', email:'', phone:'', title:'Diyetisyen', bio:'', city:'' });
  const [passwordForm, setPasswordForm] = useState({ current_password:'', new_password:'', confirmpw:'' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [notif, setNotif] = useState({ emailRandevu:true, smsRandevu:true, emailOlcum:false, emailRapor:true, pushBildirim:true });

  const { data: profile, refetch } = useApi(getMe, []);

  useEffect(() => {
    if (profile) {
      setProfil(p => ({
        ...p,
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    try {
      await updateMe({ full_name: profil.name, phone: profil.phone });
      refetch();
      toast('Profile updated ✅', 'success');
      setFieldErrors({});
    } catch (err) {
      const { message, details } = extractApiError(err);
      setFieldErrors(mapDetailsToFieldErrors(details));
      toast(message, 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirmpw) {
      toast('New passwords do not match', 'error');
      return;
    }
    try {
      await changePassword({ current_password: passwordForm.current_password, new_password: passwordForm.new_password });
      toast('Password changed ✅', 'success');
      setPasswordForm({ current_password:'', new_password:'', confirmpw:'' });
    } catch (err) {
      const { message } = extractApiError(err);
      toast(message, 'error');
    }
  };

  const tabs = [['profile','👤','Profile'],['notification','🔔','Notifications'],['security','🔒','Security'],['plan','💳','Plan & Billing']];
  const initials = profil.name.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('');

  return (
    <AppLayout>
      <Topbar title="Settings" subtitle="Account and system settings" />
      <div style={{padding:28,flex:1}}>
        <div style={{display:'flex',gap:24,flex:1}}>
          {/* Tab list */}
          <div style={{width:200,flexShrink:0}}>
            {tabs.map(([k,ic,l])=>(
              <div key={k} onClick={()=>setTab(k)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:'var(--radius-md)',cursor:'pointer',marginBottom:4,background:tab===k?'var(--sage-50)':'transparent',color:tab===k?'var(--primary)':'var(--muted)',fontWeight:tab===k?600:400,fontSize:14,border:`1px solid ${tab===k?'var(--sage-200)':'transparent'}`,transition:'all 0.15s'}}
                onMouseEnter={e=>{if(tab!==k)e.currentTarget.style.background='var(--sage-50)'}} onMouseLeave={e=>{if(tab!==k)e.currentTarget.style.background='transparent'}}>
                {ic} {l}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{flex:1,maxWidth:600}}>
            {tab==='profile'&&(
              <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-xl)',padding:28}}>
                <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border-light)'}}>
                  <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,var(--sage-400),var(--sage-600))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'white'}}>{initials||'—'}</div>
                  <div>
                    <div style={{fontSize:18,fontWeight:600,marginBottom:2}}>{profil.name||'—'}</div>
                    <div style={{fontSize:13,color:'var(--muted)',marginBottom:8}}>{profil.title}{profil.city ? ' · '+profil.city : ''}</div>
                    <button onClick={()=>toast('Opening photo upload...','info')} style={{padding:'6px 14px',borderRadius:99,border:'1px solid var(--border)',background:'white',fontSize:12,cursor:'pointer'}}>📷 Change Photo</button>
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Full Name</label>
                  <input value={profil.name} onChange={e=>setProfil(p=>({...p,name:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',transition:'border-color 0.15s',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                  {fieldErrors.full_name && <span style={{color:'#dc2626',fontSize:12,display:'block',marginTop:4}}>{fieldErrors.full_name}</span>}
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>E-posta</label>
                  <input value={profil.email} disabled style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',background:'var(--sage-50)',color:'var(--muted)',boxSizing:'border-box'}}/>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Phone</label>
                  <input value={profil.phone} onChange={e=>setProfil(p=>({...p,phone:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',transition:'border-color 0.15s',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                  {fieldErrors.phone && <span style={{color:'#dc2626',fontSize:12,display:'block',marginTop:4}}>{fieldErrors.phone}</span>}
                </div>
                <button onClick={handleUpdateProfile} style={{padding:'10px 24px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>💾 Save Changes</button>
              </div>
            )}
            {tab==='notification'&&(
              <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-xl)',padding:28}}>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:500,marginBottom:20}}>Notification Preferences</h3>
                {[['emailRandevu','Email','Appointment reminders'],['smsRandevu','SMS','Appointment reminders'],['emailOlcum','Email','Measurement entry reminders'],['emailRapor','Email','Weekly summary report'],['pushBildirim','App','Push notifications']].map(([k,ch,desc])=>(
                  <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid var(--border-light)'}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:500,marginBottom:2}}>{desc}</div>
                      <div style={{fontSize:12,color:'var(--muted)'}}>{ch}</div>
                    </div>
                    <div onClick={()=>setNotif(p=>({...p,[k]:!p[k]}))} style={{width:44,height:24,borderRadius:99,background:notif[k]?'var(--primary)':'var(--border)',cursor:'pointer',position:'relative',transition:'background 0.3s',flexShrink:0}}>
                      <div style={{position:'absolute',top:3,left:notif[k]?22:3,width:18,height:18,borderRadius:'50%',background:'white',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.3s'}}/>
                    </div>
                  </div>
                ))}
                <button onClick={()=>toast('Notification settings saved ✅','success')} style={{marginTop:20,padding:'10px 24px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>💾 Save</button>
              </div>
            )}
            {tab==='security'&&(
              <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-xl)',padding:28}}>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:500,marginBottom:20}}>Security</h3>
                {[['Current Password','current_password'],['New Password','new_password'],['Confirm Password','confirmpw']].map(([l,k])=>(
                  <div key={k} style={{marginBottom:14}}>
                    <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>{l}</label>
                    <input type="password" value={passwordForm[k]} onChange={e=>setPasswordForm(p=>({...p,[k]:e.target.value}))} placeholder="••••••••" style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='var(--primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                  </div>
                ))}
                <button onClick={handleChangePassword} style={{padding:'10px 24px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>🔒 Update Password</button>
                <div style={{marginTop:24,padding:16,background:'#fef2f2',borderRadius:'var(--radius-md)',border:'1px solid #fecaca'}}>
                  <div style={{fontSize:14,fontWeight:600,color:'var(--danger)',marginBottom:4}}>Danger Zone</div>
                  <div style={{fontSize:13,color:'var(--muted)',marginBottom:12}}>You can permanently delete your account. This action cannot be undone.</div>
                  <button onClick={()=>toast('Contact support team for this action','warning')} style={{padding:'8px 16px',borderRadius:99,background:'var(--danger)',color:'white',border:'none',fontSize:12,fontWeight:500,cursor:'pointer'}}>Delete Account</button>
                </div>
              </div>
            )}
            {tab==='plan'&&(
              <div>
                <div style={{background:'var(--charcoal)',borderRadius:'var(--radius-xl)',padding:28,marginBottom:16,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 70% 50%,rgba(84,138,72,0.3) 0%,transparent 60%)'}}/>
                  <div style={{position:'relative',zIndex:1}}>
                    <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1.5,color:'rgba(255,255,255,0.5)',marginBottom:8}}>Active Plan</div>
                    <div style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:600,color:'white',marginBottom:4}}>Pro Plan</div>
                    <div style={{fontSize:28,color:'white',marginBottom:16}}><span style={{fontFamily:'var(--font-display)',fontSize:48}}>₺890</span><span style={{fontSize:14,opacity:0.6}}>/ay</span></div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:20}}>Next billing: April 17, 2026</div>
                    <button onClick={()=>toast('Redirecting to billing management...','info')} style={{padding:'10px 22px',borderRadius:99,background:'rgba(255,255,255,0.15)',color:'white',border:'1px solid rgba(255,255,255,0.3)',fontSize:13,fontWeight:500,cursor:'pointer'}}>My Invoices →</button>
                  </div>
                </div>
                <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-xl)',padding:24}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Plan Features</div>
                  {['Unlimited clients','Advanced measurement analytics','Personal clinic website','Income & expense tracking','Excel integration','500+ recipe library','Priority support'].map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid var(--border-light)'}}>
                      <div style={{width:18,height:18,background:'var(--sage-100)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--sage-700)',flexShrink:0}}>✓</div>
                      <span style={{fontSize:14}}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
