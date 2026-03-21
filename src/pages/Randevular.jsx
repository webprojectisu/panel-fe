import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Topbar from '../components/Topbar';
import { useToast } from '../hooks/useToast';
import { getAppointments, createAppointment, deleteAppointment, updateAppointment } from '../api/appointmentService';
import { getClients } from '../api/clientService';
import { transformAppointment, getWeekStart, formatDateShort, APPOINTMENT_STATUS_TO_TR } from '../utils/dataTransformers';
import { extractApiError, mapDetailsToFieldErrors } from '../utils/errorHandlers';

const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
const DAYS_SHORT = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const HOURS = Array.from({length:12},(_,i)=>i+8);
const evColors = { 'ev-green':{bg:'#e8f0e4',color:'#2f5227',border:'#548a48'}, 'ev-bej':{bg:'#f8f1e0',color:'#7a5b2a',border:'#b8924a'}, 'ev-blue':{bg:'#e2f0f8',color:'#0c4a6e',border:'#3b82f6'}, 'ev-red':{bg:'#fde8e8',color:'#7f1d1d',border:'#ef4444'} };
const COLOR_TO_EV = ['ev-green','ev-bej','ev-blue','ev-red','ev-green','ev-bej','ev-blue','ev-red'];
const statusColors = { onaylı:'var(--success)', bekliyor:'var(--warning)', iptal:'var(--danger)' };

export default function Randevular() {
  const toast = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id:'', date:'', start_time:'10:00', end_time:'', notes:'', mode:'Yüz yüze', type:'Kontrol' });
  const [formFieldErrors, setFormFieldErrors] = useState({});

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [clientList, setClientList] = useState([]);

  // Week dates (all 7 days for mini calendar column headers)
  const weekDates = Array.from({length:7},(_,i)=>{
    const d = new Date(currentWeekStart.getTime() + i * 86400000);
    return d;
  });

  // Column dates for Mon–Fri only
  const columnDates = DAYS_TR.map((name, i) => {
    const d = new Date(currentWeekStart.getTime() + i * 86400000);
    return { name, dateStr: formatDateShort(d), date: d };
  });

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const startStr = currentWeekStart.toISOString().split('T')[0];
      const endDate = new Date(currentWeekStart.getTime() + 4 * 86400000);
      const endStr = endDate.toISOString().split('T')[0];
      const data = await getAppointments({ start_date: startStr, end_date: endStr, limit: 100 });
      const transformed = data
        .map(apt => transformAppointment(apt, currentWeekStart))
        .filter(apt => apt.day >= 1 && apt.day <= 5);
      setAppointments(transformed);
    } catch (e) {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [currentWeekStart]);

  useEffect(() => {
    getClients({ limit: 100 }).then(data => setClientList(data)).catch(() => {});
  }, []);

  // Mini calendar
  const [miniMonth, setMiniMonth] = useState(new Date());
  const miniYear = miniMonth.getFullYear(), miniMon = miniMonth.getMonth();
  const firstDay = new Date(miniYear,miniMon,1).getDay();
  const daysInMonth = new Date(miniYear,miniMon+1,0).getDate();
  const startOffset = firstDay===0?6:firstDay-1;

  const handleCreateAppointment = async () => {
    try {
      await createAppointment({
        client_id: Number(form.client_id),
        appointment_date: form.date,
        start_time: form.start_time + ':00',
        end_time: form.end_time ? form.end_time + ':00' : undefined,
        notes: form.notes,
      });
      fetchAppointments();
      setShowModal(false);
      setForm({ client_id:'', date:'', start_time:'10:00', end_time:'', notes:'', mode:'Yüz yüze', type:'Kontrol' });
      setFormFieldErrors({});
      toast('Randevu oluşturuldu', 'success');
    } catch (err) {
      const { message, details } = extractApiError(err);
      setFormFieldErrors(mapDetailsToFieldErrors(details));
      toast(message, 'error');
    }
  };

  const today = new Date();

  return (
    <AppLayout>
      <Topbar title="Randevu Takvimi" subtitle={`${MONTHS[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`}
        actions={<button onClick={()=>{setShowModal(true);setFormFieldErrors({});}} style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>➕ Yeni Randevu</button>}
      />
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Left panel */}
        <div style={{width:280,flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border-light)',display:'flex',flexDirection:'column',overflowY:'auto'}}>
          {/* Mini calendar */}
          <div style={{padding:20,borderBottom:'1px solid var(--border-light)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:600}}>{MONTHS[miniMon]} {miniYear}</span>
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>setMiniMonth(d=>{const n=new Date(d);n.setMonth(d.getMonth()-1);return n;})} style={{width:26,height:26,borderRadius:'50%',background:'var(--sage-50)',border:'none',cursor:'pointer',fontSize:12}}>‹</button>
                <button onClick={()=>setMiniMonth(d=>{const n=new Date(d);n.setMonth(d.getMonth()+1);return n;})} style={{width:26,height:26,borderRadius:'50%',background:'var(--sage-50)',border:'none',cursor:'pointer',fontSize:12}}>›</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
              {['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].map(d=><div key={d} style={{fontSize:9,fontWeight:600,textAlign:'center',color:'var(--muted)',padding:'3px 0',textTransform:'uppercase'}}>{d}</div>)}
              {Array.from({length:startOffset},(_,i)=>{
                const prev = new Date(miniYear,miniMon,0).getDate();
                return <div key={'p'+i} style={{aspectRatio:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--border)',borderRadius:'50%'}}>{prev-startOffset+i+1}</div>;
              })}
              {Array.from({length:daysInMonth},(_,i)=>{
                const d=i+1, isToday=d===today.getDate()&&miniMon===today.getMonth()&&miniYear===today.getFullYear();
                return (
                  <div key={d} onClick={()=>{
                    const clicked = new Date(miniYear, miniMon, d);
                    setCurrentWeekStart(getWeekStart(clicked));
                    toast(`${d} ${MONTHS[miniMon]} seçildi`,'info');
                  }} style={{aspectRatio:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,cursor:'pointer',borderRadius:'50%',background:isToday?'var(--primary)':'transparent',color:isToday?'white':'var(--charcoal)',fontWeight:isToday?700:400,transition:'all 0.15s',position:'relative'}}
                    onMouseEnter={e=>{if(!isToday)e.currentTarget.style.background='var(--sage-100)'}} onMouseLeave={e=>{if(!isToday)e.currentTarget.style.background='transparent'}}>
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Upcoming - show from current appointments */}
          <div style={{padding:16,flex:1}}>
            <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--muted)',marginBottom:12}}>Yaklaşan Randevular</div>
            {appointments.slice(0, 5).map((u,i)=>(
              <div key={u.id||i} onClick={()=>toast(`${u.client_name||''} · ${u.type||''}`,'info')} style={{display:'flex',gap:10,padding:10,borderRadius:'var(--radius-md)',cursor:'pointer',marginBottom:4,transition:'background 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--sage-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:3,borderRadius:2,background:'var(--primary)',flexShrink:0}}/>
                <div>
                  <div style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--muted)',marginBottom:1}}>{columnDates[u.day-1]?.dateStr || ''} · {String(u.startH).padStart(2,'0')}:{String(u.startM).padStart(2,'0')}</div>
                  <div style={{fontSize:13,fontWeight:500}}>{u.client_name||'Danışan'}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{u.type||'Danışmanlık'}</div>
                </div>
              </div>
            ))}
            {!isLoading && appointments.length === 0 && (
              <div style={{fontSize:13,color:'var(--muted)',textAlign:'center',padding:'20px 0'}}>Bu hafta randevu yok.</div>
            )}
          </div>
        </div>

        {/* Calendar main */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Toolbar */}
          <div style={{background:'white',borderBottom:'1px solid var(--border-light)',padding:'12px 24px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>setCurrentWeekStart(d=>new Date(d.getTime()-7*86400000))} style={{padding:'6px 12px',borderRadius:'var(--radius-md)',background:'var(--sage-50)',border:'1px solid var(--border-light)',cursor:'pointer',fontSize:14}}>‹</button>
              <button onClick={()=>setCurrentWeekStart(getWeekStart(new Date()))} style={{padding:'6px 12px',borderRadius:'var(--radius-md)',background:'var(--sage-50)',border:'1px solid var(--border-light)',cursor:'pointer',fontSize:13,fontWeight:500}}>Bugün</button>
              <button onClick={()=>setCurrentWeekStart(d=>new Date(d.getTime()+7*86400000))} style={{padding:'6px 12px',borderRadius:'var(--radius-md)',background:'var(--sage-50)',border:'1px solid var(--border-light)',cursor:'pointer',fontSize:14}}>›</button>
            </div>
            <span style={{fontSize:17,fontWeight:600,minWidth:200}}>
              {weekDates[0].getDate()}–{weekDates[6].getDate()} {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getFullYear()}
            </span>
            <div style={{marginLeft:'auto',display:'flex',background:'var(--sage-50)',border:'1px solid var(--border-light)',borderRadius:99,overflow:'hidden'}}>
              {['Gün','Hafta','Ay'].map(v=>(
                <button key={v} onClick={()=>toast(`${v} görünümüne geçildi`,'info')} style={{padding:'6px 14px',fontSize:13,fontWeight:500,border:'none',background:v==='Hafta'?'var(--primary)':'transparent',color:v==='Hafta'?'white':'var(--muted)',cursor:'pointer',transition:'all 0.15s'}}>{v}</button>
              ))}
            </div>
          </div>

          {/* Week grid */}
          <div style={{flex:1,overflowY:'auto',position:'relative'}}>
            {isLoading && (
              <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10,borderRadius:'8px'}}>
                <div style={{color:'var(--muted)'}}>Yükleniyor...</div>
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'52px repeat(5,1fr)',minWidth:600}}>
              {/* Header */}
              <div style={{gridColumn:'1/-1',display:'grid',gridTemplateColumns:'52px repeat(5,1fr)',borderBottom:'1px solid var(--border-light)',background:'white',position:'sticky',top:0,zIndex:10}}>
                <div style={{borderRight:'1px solid var(--border-light)'}}/>
                {columnDates.map((col, i)=>{
                  const isToday = col.date.toDateString() === today.toDateString();
                  return (
                    <div key={i} style={{padding:'10px 8px',textAlign:'center',borderRight:'1px solid var(--border-light)'}}>
                      <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',color:'var(--muted)',letterSpacing:'0.8px'}}>{DAYS_SHORT[i]}</div>
                      <div style={{fontSize:isToday?15:20,fontWeight:600,color:isToday?'white':'var(--charcoal)',...(isToday?{background:'var(--primary)',width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'2px auto 0'}:{})}}>{col.date.getDate()}</div>
                      <div style={{fontSize:10,color:'var(--muted)',marginTop:1}}>{col.dateStr}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time col */}
              <div style={{borderRight:'1px solid var(--border-light)',background:'white'}}>
                {HOURS.map(h=><div key={h} style={{height:60,borderBottom:'1px solid var(--border-light)',display:'flex',alignItems:'flex-start',padding:'4px 6px',fontSize:10,color:'var(--muted)',fontFamily:'var(--font-mono)',flexShrink:0}}>{String(h).padStart(2,'0')}:00</div>)}
              </div>

              {/* Day cols Mon–Fri */}
              {columnDates.map((col, di)=>{
                const isToday = col.date.toDateString() === today.toDateString();
                const dayAppts = appointments.filter(a=>a.day===di+1);
                return (
                  <div key={di} style={{borderRight:'1px solid var(--border-light)',background:isToday?'rgba(84,138,72,0.02)':'white',position:'relative'}}>
                    {HOURS.map(h=><div key={h} onClick={()=>{
                      const dateStr = col.date.toISOString().split('T')[0];
                      setForm(p=>({...p, date: dateStr, start_time: String(h).padStart(2,'0')+':00'}));
                      setShowModal(true);
                    }} style={{height:60,borderBottom:'1px solid var(--border-light)',cursor:'pointer',transition:'background 0.1s'}} onMouseEnter={e=>e.currentTarget.style.background='var(--sage-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}/>)}
                    {/* Events */}
                    {dayAppts.map(a=>{
                      const top = (a.startH-8)*60+a.startM;
                      const height = ((a.duration||60)/60)*60-4;
                      const colorKey = COLOR_TO_EV[(a.client_id || 0) % COLOR_TO_EV.length] || 'ev-green';
                      const ec = evColors[colorKey];
                      return (
                        <div key={a.id} onClick={()=>toast(`${a.client_name||'Danışan'} · ${String(a.startH).padStart(2,'0')}:${String(a.startM).padStart(2,'0')} · ${a.type||''}`,'info')}
                          style={{position:'absolute',left:3,right:3,top:top,height:Math.max(height,20),background:ec.bg,color:ec.color,borderLeft:`3px solid ${ec.border}`,borderRadius:'var(--radius-sm)',padding:'3px 6px',fontSize:11,cursor:'pointer',overflow:'hidden',zIndex:5,transition:'all 0.15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.zIndex=10;e.currentTarget.style.boxShadow='var(--shadow-md)';}}
                          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.zIndex=5;e.currentTarget.style.boxShadow='none';}}>
                          <div style={{fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.client_name||'Danışan'}</div>
                          <div style={{opacity:0.8,fontSize:9,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(a.startH).padStart(2,'0')}:{String(a.startM).padStart(2,'0')} · {a.type||''}</div>
                        </div>
                      );
                    })}
                    {/* Time indicator */}
                    {isToday&&<div style={{position:'absolute',left:0,right:0,top:(today.getHours()-8)*60+today.getMinutes(),height:2,background:'var(--danger)',zIndex:6,pointerEvents:'none'}}><div style={{position:'absolute',left:-4,top:-4,width:10,height:10,borderRadius:'50%',background:'var(--danger)'}}/></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* New appointment modal */}
      {showModal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowModal(false);}} style={{position:'fixed',inset:0,background:'rgba(30,42,26,0.5)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',borderRadius:'var(--radius-xl)',padding:32,width:480,maxWidth:'95vw',boxShadow:'var(--shadow-xl)',animation:'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:500}}>Yeni Randevu</span>
              <button onClick={()=>setShowModal(false)} style={{width:32,height:32,borderRadius:'50%',background:'var(--sage-50)',border:'none',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Danışan</label>
              <select value={form.client_id} onChange={e=>setForm(p=>({...p,client_id:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                <option value="">Danışan seçin...</option>
                {clientList.map(c=><option key={c.id} value={c.id}>{c.full_name} (#{c.id})</option>)}
              </select>
              {formFieldErrors.client_id && <span style={{color:'#dc2626',fontSize:'12px',display:'block',marginTop:'4px'}}>{formFieldErrors.client_id}</span>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div>
                <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Tarih</label>
                <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
                {formFieldErrors.appointment_date && <span style={{color:'#dc2626',fontSize:'12px',display:'block',marginTop:'4px'}}>{formFieldErrors.appointment_date}</span>}
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Başlangıç Saati</label>
                <input type="time" value={form.start_time} onChange={e=>setForm(p=>({...p,start_time:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
                {formFieldErrors.start_time && <span style={{color:'#dc2626',fontSize:'12px',display:'block',marginTop:'4px'}}>{formFieldErrors.start_time}</span>}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div>
                <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Bitiş Saati</label>
                <input type="time" value={form.end_time} onChange={e=>setForm(p=>({...p,end_time:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Tür</label>
                <select value={form.mode} onChange={e=>setForm(p=>({...p,mode:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                  <option>Yüz yüze</option><option>Online</option>
                </select>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Randevu Tipi</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                {['İlk Görüşme','Kontrol','Ölçüm Güncellemesi','Program Revizyonu','Takip'].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Notlar</label>
              <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',resize:'vertical',minHeight:60,boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:24,paddingTop:20,borderTop:'1px solid var(--border-light)'}}>
              <button onClick={()=>setShowModal(false)} style={{padding:'9px 20px',borderRadius:99,border:'1px solid var(--border)',background:'white',fontSize:13,fontWeight:500,cursor:'pointer'}}>İptal</button>
              <button onClick={handleCreateAppointment} style={{padding:'9px 20px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>✅ Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
