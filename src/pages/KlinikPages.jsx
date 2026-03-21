import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Topbar from '../components/Topbar';
import { useToast } from '../hooks/useToast';
import { getDietPlans, createDietPlan, getDietPlan } from '../api/dietPlanService';
import { getClients, getClientMeasurements, addMeasurement } from '../api/clientService';
import { getRecipes, createRecipe } from '../api/recipeService';
import { useApi } from '../hooks/useApi';
import { COLOR_PALETTE, transformClient } from '../utils/dataTransformers';
import { extractApiError } from '../utils/errorHandlers';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// ─── BESLENME PROGRAMLARI ───────────────────────────────
export function Programlar() {
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newProg, setNewProg] = useState({ title: '', description: '', status: 'draft', client_id: '' });

  const { data: plans, isLoading, refetch } = useApi(getDietPlans, []);
  const { data: clientList } = useApi(getClients, []);

  useEffect(() => {
    if (plans?.length && !selected) setSelected(plans[0]);
  }, [plans]);

  useEffect(() => {
    if (selected?.id) {
      setSelectedDetail(null);
      getDietPlan(selected.id).then(setSelectedDetail).catch(() => {});
    }
  }, [selected?.id]);

  const handleCreate = async () => {
    if (!newProg.client_id) { toast('Lütfen bir danışan seçin', 'error'); return; }
    try {
      await createDietPlan({ ...newProg, client_id: parseInt(newProg.client_id) });
      refetch();
      toast('Program eklendi ✅', 'success');
      setShowAdd(false);
      setNewProg({ title: '', description: '', status: 'draft', client_id: '' });
    } catch (err) {
      const { message } = extractApiError(err);
      toast(message, 'error');
    }
  };

  const assignedClient = clientList?.find(c => c.id === selected?.client_id);

  return (
    <AppLayout>
      <Topbar title="Beslenme Programları" subtitle={`${(plans || []).length} aktif program`}
        actions={<button onClick={() => setShowAdd(true)} style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>➕ Yeni Program</button>}
      />
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Program list */}
        <div style={{width:280,flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border-light)',overflowY:'auto'}}>
          <div style={{padding:16}}>
            <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--muted)',marginBottom:12,padding:'0 4px'}}>Programlar</div>
            {isLoading && <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}>Yükleniyor...</div>}
            {!isLoading && (plans || []).length === 0 && <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}>Henüz program eklenmedi.</div>}
            {(plans || []).map(p => (
              <div key={p.id} onClick={() => setSelected(p)}
                style={{padding:'14px 16px',borderRadius:'var(--radius-md)',cursor:'pointer',marginBottom:6,border:`1px solid ${selected?.id===p.id?'var(--sage-200)':'var(--border-light)'}`,background:selected?.id===p.id?'var(--sage-50)':'white',transition:'all 0.15s'}}
                onMouseEnter={e=>{if(selected?.id!==p.id)e.currentTarget.style.background='var(--sage-50)'}} onMouseLeave={e=>{if(selected?.id!==p.id)e.currentTarget.style.background='white'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:COLOR_PALETTE[p.id % 8],flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{p.title}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{p.description || p.status}</div>
                  </div>
                  <span style={{fontSize:11,padding:'2px 8px',borderRadius:99,background:'var(--sage-100)',color:'var(--sage-700)'}}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program detail */}
        <div style={{flex:1,overflowY:'auto',padding:28}}>
          {selected && (
            <>
              <div style={{marginBottom:24}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:COLOR_PALETTE[selected.id % 8]}}/>
                  <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:500}}>{selected.title}</h2>
                </div>
                {selected.description && (
                  <div style={{fontSize:14,color:'var(--muted)',marginBottom:20}}>{selected.description}</div>
                )}

                {/* Info cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
                  {[['📅',selected.start_date||'—','Başlangıç'],['📅',selected.end_date||'—','Bitiş'],['🔖',selected.status||'—','Durum']].map(([ic,v,l])=>(
                    <div key={l} style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:'18px',textAlign:'center'}}>
                      <div style={{width:42,height:42,background:'var(--sage-100)',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,margin:'0 auto 10px'}}>{ic}</div>
                      <div style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:600,marginBottom:2}}>{v}</div>
                      <div style={{fontSize:12,color:'var(--muted)'}}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Meals */}
                <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:20}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Günlük Öğün Planı</div>
                  {!selectedDetail ? (
                    <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}>Yükleniyor...</div>
                  ) : (selectedDetail.meals || []).length > 0 ? (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {(selectedDetail.meals || []).map((m,i)=>(
                        <div key={m.id||i} style={{border:'1px solid var(--border-light)',borderRadius:'var(--radius-md)',padding:'14px 16px',transition:'all 0.15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-50)';e.currentTarget.style.borderColor='var(--sage-200)'}} onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.borderColor='var(--border-light)'}}>
                          <div style={{fontSize:13,fontWeight:600,color:'var(--primary)',marginBottom:4}}>{m.name} {m.scheduled_time ? `(${m.scheduled_time.slice(0,5)})` : ''}</div>
                          <div style={{fontSize:12,color:'var(--muted)'}}>{m.meal_type}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}>Bu program için öğün tanımlanmamış.</div>
                  )}
                </div>

                {/* Assigned client */}
                {assignedClient && (
                  <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:20,marginTop:16}}>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>Bu Programdaki Danışan</div>
                    <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px',background:'var(--sage-50)',borderRadius:'var(--radius-md)'}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:COLOR_PALETTE[assignedClient.id % 8],display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,color:'white'}}>
                        {(assignedClient.full_name||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500}}>{assignedClient.full_name}</div>
                        <div style={{fontSize:11,color:'var(--muted)'}}>{assignedClient.email}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>toast('Program düzenleme modu','info')} style={{padding:'10px 20px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>✏️ Programı Düzenle</button>
                <button onClick={()=>toast('Program PDF olarak indiriliyor...','info')} style={{padding:'10px 20px',borderRadius:99,background:'white',border:'1px solid var(--border)',fontSize:13,fontWeight:500,cursor:'pointer'}}>📄 PDF İndir</button>
                <button onClick={()=>toast('Program kopyalandı','success')} style={{padding:'10px 20px',borderRadius:99,background:'white',border:'1px solid var(--border)',fontSize:13,fontWeight:500,cursor:'pointer'}}>📋 Kopyala</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}} style={{position:'fixed',inset:0,background:'rgba(30,42,26,0.5)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',borderRadius:'var(--radius-xl)',padding:32,width:460,maxWidth:'95vw',boxShadow:'var(--shadow-xl)',animation:'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:500}}>Yeni Program</span>
              <button onClick={()=>setShowAdd(false)} style={{width:32,height:32,borderRadius:'50%',background:'var(--sage-50)',border:'none',cursor:'pointer'}}>✕</button>
            </div>
            {[['Program Adı','title','text'],['Açıklama','description','text']].map(([l,k,t])=>(
              <div key={k} style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>{l}</label>
                <input type={t} value={newProg[k]} onChange={e=>setNewProg(p=>({...p,[k]:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Danışan</label>
              <select value={newProg.client_id} onChange={e=>setNewProg(p=>({...p,client_id:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                <option value="">Seçiniz...</option>
                {(clientList||[]).map(c=><option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Durum</label>
              <select value={newProg.status} onChange={e=>setNewProg(p=>({...p,status:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                <option value="draft">Taslak</option>
                <option value="active">Aktif</option>
                <option value="paused">Duraklatıldı</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border-light)'}}>
              <button onClick={()=>setShowAdd(false)} style={{padding:'9px 20px',borderRadius:99,border:'1px solid var(--border)',background:'white',fontSize:13,fontWeight:500,cursor:'pointer'}}>İptal</button>
              <button onClick={handleCreate} style={{padding:'9px 20px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ─── ÖLÇÜM TAKİBİ ───────────────────────────────────────
export function Olcumler() {
  const toast = useToast();
  const [selectedClient, setSelectedClient] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [measLoading, setMeasLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeas, setNewMeas] = useState({ weight_kg:'', height_cm:'', body_fat_percentage:'', waist_cm:'', hip_cm:'', chest_cm:'', recorded_at:'', notes:'' });

  const { data: clientsRaw, isLoading: clientsLoading } = useApi(getClients, []);
  const clients = (clientsRaw || []).map(transformClient);

  useEffect(() => {
    if (clients.length && !selectedClient) setSelectedClient(clients[0]);
  }, [clientsRaw]);

  const fetchMeasurements = async (clientId) => {
    if (!clientId) return;
    setMeasLoading(true);
    try {
      const data = await getClientMeasurements(clientId);
      setMeasurements(data);
    } catch (e) {
      setMeasurements([]);
    } finally {
      setMeasLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient?.id) fetchMeasurements(selectedClient.id);
  }, [selectedClient?.id]);

  const handleAddMeasurement = async () => {
    try {
      const payload = {};
      if (newMeas.weight_kg) payload.weight_kg = parseFloat(newMeas.weight_kg);
      if (newMeas.height_cm) payload.height_cm = parseFloat(newMeas.height_cm);
      if (newMeas.body_fat_percentage) payload.body_fat_percentage = parseFloat(newMeas.body_fat_percentage);
      if (newMeas.waist_cm) payload.waist_cm = parseFloat(newMeas.waist_cm);
      if (newMeas.hip_cm) payload.hip_cm = parseFloat(newMeas.hip_cm);
      if (newMeas.chest_cm) payload.chest_cm = parseFloat(newMeas.chest_cm);
      if (newMeas.recorded_at) payload.recorded_at = newMeas.recorded_at;
      if (newMeas.notes) payload.notes = newMeas.notes;
      await addMeasurement(selectedClient.id, payload);
      await fetchMeasurements(selectedClient.id);
      toast('Ölçüm kaydedildi ✅', 'success');
      setShowAdd(false);
      setNewMeas({ weight_kg:'', height_cm:'', body_fat_percentage:'', waist_cm:'', hip_cm:'', chest_cm:'', recorded_at:'', notes:'' });
    } catch (err) {
      const { message } = extractApiError(err);
      toast(message, 'error');
    }
  };

  const chartData = {
    labels: measurements.map(m => {
      const d = new Date(m.recorded_at);
      return `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}`;
    }),
    datasets:[{ label:'Kilo (kg)', data:measurements.map(m=>m.weight_kg), borderColor:'var(--primary)', backgroundColor:'rgba(84,138,72,0.1)', fill:true, tension:0.4, pointRadius:5, pointBackgroundColor:'var(--primary)' }],
  };
  const chartOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1e2a1a', callbacks:{ label:ctx=>` ${ctx.raw} kg` } } }, scales:{ x:{grid:{display:false},ticks:{color:'#6b7a65',font:{size:11}}}, y:{grid:{color:'rgba(0,0,0,0.04)'},ticks:{color:'#6b7a65',font:{size:11},callback:v=>v+' kg'}} } };

  return (
    <AppLayout>
      <Topbar title="Ölçüm Takibi" subtitle="Danışan ölçümlerini takip edin"
        actions={<button onClick={()=>setShowAdd(true)} style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>➕ Ölçüm Ekle</button>}
      />
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Client selector */}
        <div style={{width:260,flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border-light)',overflowY:'auto',padding:12}}>
          <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--muted)',marginBottom:10,padding:'4px 8px'}}>Danışanlar</div>
          {clientsLoading && <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}>Yükleniyor...</div>}
          {!clientsLoading && clients.length === 0 && <div style={{textAlign:'center',padding:'20px',color:'var(--muted)'}}>Danışan bulunamadı.</div>}
          {clients.map(c=>(
            <div key={c.id} onClick={()=>setSelectedClient(c)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:'var(--radius-md)',cursor:'pointer',marginBottom:4,background:selectedClient?.id===c.id?'var(--sage-50)':'transparent',border:`1px solid ${selectedClient?.id===c.id?'var(--sage-200)':'transparent'}`,transition:'all 0.15s'}}
              onMouseEnter={e=>{if(selectedClient?.id!==c.id)e.currentTarget.style.background='var(--sage-50)'}} onMouseLeave={e=>{if(selectedClient?.id!==c.id)e.currentTarget.style.background='transparent'}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:c.color,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{c.initials}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>{c.weight ? c.weight+' kg' : '—'}{c.bmi ? ' · BMI '+c.bmi : ''}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Measurement detail */}
        <div style={{flex:1,overflowY:'auto',padding:28}}>
          {selectedClient && (
            <>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:selectedClient.color,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700}}>{selectedClient.initials}</div>
                <div>
                  <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:500,marginBottom:2}}>{selectedClient.name}</h2>
                  <div style={{fontSize:13,color:'var(--muted)'}}>{selectedClient.email}</div>
                </div>
              </div>

              {/* Current stats — derived from latest measurement */}
              {(() => {
                const lm = measurements.length > 0
                  ? [...measurements].sort((a,b)=>new Date(b.recorded_at)-new Date(a.recorded_at))[0]
                  : null;
                const waterMl = lm?.weight_kg ? Math.round(lm.weight_kg * 0.033 * 1000)+' ml' : '—';
                const kpiRows = [
                  [lm?.weight_kg ? lm.weight_kg+' kg' : '—','Kilo','var(--sage-100)','⚖️'],
                  [lm?.bmi ? Number(lm.bmi).toFixed(1) : '—','BMI','var(--bej-100)','📊'],
                  [lm?.body_fat_percentage ? lm.body_fat_percentage+'%' : '—','Yağ %','#ecfdf5','💧'],
                  [lm?.waist_cm ? lm.waist_cm+' cm' : '—','Bel','#e2f0f8','📐'],
                  [lm?.height_cm ? lm.height_cm+' cm' : '—','Boy','var(--sage-50)','📏'],
                  [waterMl,'Su İhtiyacı','var(--bej-100)','🫧'],
                ];
                return (
              <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:24}}>
                {kpiRows.map(([v,l,bg,em])=>(
                  <div key={l} style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:'16px',textAlign:'center'}}>
                    <div style={{width:36,height:36,background:bg,borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 8px',fontSize:14}}>{em}</div>
                    <div style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,marginBottom:2}}>{v}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{l}</div>
                  </div>
                ))}
              </div>
                );
              })()}

              {measLoading && <div style={{textAlign:'center',padding:'40px',color:'var(--muted)'}}>Yükleniyor...</div>}

              {/* Chart */}
              {!measLoading && measurements.length > 0 && (
                <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',padding:20,marginBottom:20}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Kilo Değişimi</div>
                  <div style={{height:200}}><Line data={chartData} options={chartOpts}/></div>
                </div>
              )}

              {/* History table */}
              {!measLoading && measurements.length > 0 && (
                <div style={{background:'white',border:'1px solid var(--border-light)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
                  <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border-light)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:14,fontWeight:600}}>Ölçüm Geçmişi</span>
                  </div>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr>{['Tarih','Kilo','BMI','Yağ %','Bel','Kalça','Göğüs'].map(h=><th key={h} style={{fontSize:11,fontWeight:600,padding:'10px 16px',textAlign:'left',background:'var(--sage-50)',color:'var(--muted)'}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {measurements.map((m,i)=>(
                        <tr key={m.id||i} onMouseEnter={e=>e.currentTarget.style.background='var(--sage-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          {[
                            new Date(m.recorded_at).toLocaleDateString('tr-TR'),
                            m.weight_kg ? m.weight_kg+' kg' : '—',
                            m.bmi || '—',
                            m.body_fat_percentage ? m.body_fat_percentage+'%' : '—',
                            m.waist_cm ? m.waist_cm+' cm' : '—',
                            m.hip_cm ? m.hip_cm+' cm' : '—',
                            m.chest_cm ? m.chest_cm+' cm' : '—',
                          ].map((v,j)=>(
                            <td key={j} style={{padding:'12px 16px',fontSize:13,borderBottom:i<measurements.length-1?'1px solid var(--border-light)':'none'}}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!measLoading && measurements.length === 0 && (
                <div style={{background:'white',border:'2px dashed var(--border)',borderRadius:'var(--radius-lg)',padding:60,textAlign:'center'}}>
                  <div style={{fontSize:40,marginBottom:12}}>📏</div>
                  <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>Henüz ölçüm yok</div>
                  <div style={{fontSize:14,color:'var(--muted)',marginBottom:20}}>Bu danışan için ilk ölçümü ekleyin.</div>
                  <button onClick={()=>setShowAdd(true)} style={{padding:'10px 24px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer'}}>➕ İlk Ölçümü Ekle</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add measurement modal */}
      {showAdd && (
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}} style={{position:'fixed',inset:0,background:'rgba(30,42,26,0.5)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',borderRadius:'var(--radius-xl)',padding:32,width:460,maxWidth:'95vw',boxShadow:'var(--shadow-xl)',animation:'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:500}}>Yeni Ölçüm</span>
              <button onClick={()=>setShowAdd(false)} style={{width:32,height:32,borderRadius:'50%',background:'var(--sage-50)',border:'none',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Danışan</label>
              <select value={selectedClient?.id || ''} onChange={e=>{const c=clients.find(x=>x.id===parseInt(e.target.value));if(c)setSelectedClient(c);}} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none'}}>
                <option value="">Seçiniz...</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['Kilo (kg)','weight_kg'],['Boy (cm)','height_cm'],['Vücut Yağ (%)','body_fat_percentage'],['Bel Çevresi (cm)','waist_cm'],['Kalça (cm)','hip_cm'],['Göğüs (cm)','chest_cm']].map(([l,k])=>(
                <div key={k} style={{marginBottom:12}}>
                  <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>{l}</label>
                  <input type="number" value={newMeas[k]} onChange={e=>setNewMeas(p=>({...p,[k]:e.target.value}))} step="0.1" style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Tarih</label>
              <input type="date" value={newMeas.recorded_at} onChange={e=>setNewMeas(p=>({...p,recorded_at:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Notlar</label>
              <input type="text" value={newMeas.notes} onChange={e=>setNewMeas(p=>({...p,notes:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border-light)'}}>
              <button onClick={()=>setShowAdd(false)} style={{padding:'9px 20px',borderRadius:99,border:'1px solid var(--border)',background:'white',fontSize:13,fontWeight:500,cursor:'pointer'}}>İptal</button>
              <button onClick={handleAddMeasurement} style={{padding:'9px 20px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ─── TARİF KÜTÜPHANESİ ─────────────────────────────────
export function Tarifler() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ title:'', description:'', instructions:'', preparation_time_minutes:'', calories:'' });

  const { data: recipes, isLoading, refetch } = useApi(getRecipes, []);
  const filtered = (recipes || []).filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || (r.description||'').toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    try {
      const payload = {
        title: newRecipe.title,
        description: newRecipe.description,
        instructions: newRecipe.instructions,
      };
      if (newRecipe.preparation_time_minutes) payload.preparation_time_minutes = parseInt(newRecipe.preparation_time_minutes);
      if (newRecipe.calories) payload.calories = parseFloat(newRecipe.calories);
      await createRecipe(payload);
      refetch();
      toast('Tarif eklendi ✅', 'success');
      setShowAdd(false);
      setNewRecipe({ title:'', description:'', instructions:'', preparation_time_minutes:'', calories:'' });
    } catch (err) {
      const { message } = extractApiError(err);
      toast(message, 'error');
    }
  };

  return (
    <AppLayout>
      <Topbar title="Tarif Kütüphanesi" subtitle={`${(recipes || []).length} sağlıklı tarif`}
        actions={<button onClick={()=>setShowAdd(true)} style={{padding:'8px 16px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>➕ Tarif Ekle</button>}
      />
      <div style={{padding:28,flex:1}}>
        {/* Search */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'white',border:'1px solid var(--border)',borderRadius:99,padding:'9px 18px',flex:1,minWidth:200,maxWidth:320}}>
            <span>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tarif ara..." style={{border:'none',outline:'none',fontSize:14,background:'transparent',width:'100%'}}/>
          </div>
        </div>

        {isLoading && <div style={{textAlign:'center',padding:'40px',color:'var(--muted)'}}>Yükleniyor...</div>}
        {!isLoading && (recipes||[]).length === 0 && <div style={{textAlign:'center',padding:'40px',color:'var(--muted)'}}>Henüz tarif eklenmedi.</div>}

        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
          {filtered.map(r=>(
            <div key={r.id} onClick={()=>setSelected(selected?.id===r.id?null:r)} style={{background:'white',border:`1px solid ${selected?.id===r.id?'var(--sage-300)':'var(--border-light)'}`,borderRadius:'var(--radius-lg)',padding:20,cursor:'pointer',transition:'all 0.2s',transform:selected?.id===r.id?'translateY(-2px)':'none',boxShadow:selected?.id===r.id?'var(--shadow-md)':'var(--shadow-sm)'}}
              onMouseEnter={e=>{if(selected?.id!==r.id){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-md)';}}} onMouseLeave={e=>{if(selected?.id!==r.id){e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}} >
              <div style={{fontSize:40,marginBottom:12,textAlign:'center'}}>🍽</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{r.title}</div>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:12}}>{r.description ? r.description.slice(0,60)+(r.description.length>60?'...':'') : ''}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
                {[[r.calories ? '🔥 '+r.calories : '—','kcal'],[r.preparation_time_minutes ? '⏱ '+r.preparation_time_minutes+' dk' : '—','hazırlık']].map(([v,l])=>(
                  <div key={l} style={{background:'var(--sage-50)',borderRadius:'var(--radius-sm)',padding:'5px 8px',fontSize:11,textAlign:'center'}}>
                    <div style={{fontWeight:600}}>{v}</div><div style={{color:'var(--muted)'}}>{l}</div>
                  </div>
                ))}
              </div>
              {selected?.id===r.id&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border-light)',display:'flex',gap:6}}>
                  <button onClick={e=>{e.stopPropagation();toast('Tarif danışana gönderildi ✅','success');}} style={{flex:1,padding:'7px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:12,fontWeight:500,cursor:'pointer'}}>Danışana Gönder</button>
                  <button onClick={e=>{e.stopPropagation();toast('Programa eklendi ✅','success');}} style={{flex:1,padding:'7px',borderRadius:99,background:'white',border:'1px solid var(--border)',fontSize:12,fontWeight:500,cursor:'pointer'}}>Programa Ekle</button>
                </div>
              )}
            </div>
          ))}
          {!isLoading && filtered.length===0&&(recipes||[]).length>0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'var(--muted)',fontSize:15}}>Tarif bulunamadı.</div>}
        </div>
      </div>

      {/* Add recipe modal */}
      {showAdd && (
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}} style={{position:'fixed',inset:0,background:'rgba(30,42,26,0.5)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',borderRadius:'var(--radius-xl)',padding:32,width:460,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'var(--shadow-xl)',animation:'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:500}}>Yeni Tarif</span>
              <button onClick={()=>setShowAdd(false)} style={{width:32,height:32,borderRadius:'50%',background:'var(--sage-50)',border:'none',cursor:'pointer'}}>✕</button>
            </div>
            {[['Tarif Adı','title','text'],['Açıklama','description','text'],['Hazırlık Süresi (dk)','preparation_time_minutes','number'],['Kalori (kcal)','calories','number']].map(([l,k,t])=>(
              <div key={k} style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>{l}</label>
                <input type={t} value={newRecipe[k]} onChange={e=>setNewRecipe(p=>({...p,[k]:e.target.value}))} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)',display:'block',marginBottom:5}}>Yapılış</label>
              <textarea value={newRecipe.instructions} onChange={e=>setNewRecipe(p=>({...p,instructions:e.target.value}))} rows={3} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:14,outline:'none',resize:'vertical',fontFamily:'var(--font-body)',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border-light)'}}>
              <button onClick={()=>setShowAdd(false)} style={{padding:'9px 20px',borderRadius:99,border:'1px solid var(--border)',background:'white',fontSize:13,fontWeight:500,cursor:'pointer'}}>İptal</button>
              <button onClick={handleCreate} style={{padding:'9px 20px',borderRadius:99,background:'var(--primary)',color:'white',border:'none',fontSize:13,fontWeight:500,cursor:'pointer'}}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
