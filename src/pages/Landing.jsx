import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon:'👥', title:'Advanced Client Management', desc:'All client history, measurements, nutrition programs and notes in one profile. Find instantly with filtering and search.' },
  { icon:'📅', title:'Smart Appointment System', desc:'Online booking, automatic SMS/email reminders, calendar sync and conflict control for zero cancellations.' },
  { icon:'📊', title:'Measurement & Progress Analysis', desc:'Weight, BMI, body fat percentage, muscle mass and circumference measurements. Show progress to your clients with visual charts.' },
  { icon:'🥗', title:'Nutrition Program Builder', desc:'Smart program builder with calorie calculation, macro balance display, 500+ recipes. Share as PDF with one click.' },
  { icon:'💰', title:'Income & Expense Tracking', desc:'Invoice creation, payment tracking, monthly/yearly financial reports. See your business profitability anytime.' },
  { icon:'🌐', title:'Personal Clinic Website', desc:'Professional website with online booking, customized to your brand. Publish in minutes without coding.' },
];

const testimonials = [
  { initials:'AK', color:'linear-gradient(135deg,#548a48,#3e6b34)', name:'Arzu Koçak, RD', title:'Istanbul · Using for 3 years', text:'Before NutriFlow, I was doing everything in Excel. Now all my tracking is automatic, client satisfaction increased by 40%.' },
  { initials:'MY', color:'linear-gradient(135deg,#e0c898,#b8924a)', name:'Merve Yıldız, RD', title:'Ankara · Using for 18 months', text:'Thanks to appointment reminders, my no-show rate dropped to zero. My clinic website made it so easy to get new clients.' },
  { initials:'SE', color:'linear-gradient(135deg,#7aaa6d,#548a48)', name:'Selin Erdoğan, RD', title:'Izmir · Using for 2 years', text:'The nutrition program builder is amazing. Tasks that took hours now take minutes. Incredible value for the price.' },
];

const plans = [
  { tier:'Starter', price:'0', orig:null, desc:'To start digitalizing your clinic.', featured:false,
    features:['Unlimited appointment management','Basic calendar view','5 active clients','SMS reminders'] },
  { tier:'Pro', price:'890', orig:'1.200', desc:'Complete solution for growing clinics.', featured:true, badge:'Most Popular',
    features:['All Starter features','Unlimited clients','Advanced measurement analytics','Income & expense tracking','Personal clinic website','Excel integration','Nutrition program builder','500+ recipe library'] },
  { tier:'Clinic', price:'2.400', orig:null, desc:'Team solution for multi-dietitian clinics.', featured:false,
    features:['All Pro features','5 dietitian accounts','Team calendar management','Advanced reporting','Priority support','Custom integrations'] },
];

const stats = [['500+','Active Dietitians'],['48k','Managed Clients'],['60%','Less Manual Work'],['4.9★','User Rating']];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ fontFamily:'var(--font-body)', color:'var(--charcoal)', background:'var(--cream)' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, height:72, zIndex:100,
        background: scrolled ? 'rgba(253,250,244,0.97)' : 'rgba(253,250,244,0.85)',
        backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border-light)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none', transition:'all 0.3s',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'var(--primary)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, color:'var(--primary-dark)' }}>
              Nutri<span style={{ color:'var(--accent)' }}>Flow</span>
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {[['#features','Features'],['#pricing','Pricing'],['#testimonials','Testimonials']].map(([h,l])=>(
              <a key={h} href={h} style={{ padding:'8px 14px', borderRadius:99, fontSize:14, fontWeight:500, color:'var(--muted)', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.target.style.color='var(--primary)';e.target.style.background='var(--sage-50)'}}
                onMouseLeave={e=>{e.target.style.color='var(--muted)';e.target.style.background='transparent'}}>{l}</a>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <Link to="/dashboard" style={{ padding:'8px 18px', borderRadius:99, fontSize:14, fontWeight:500, color:'var(--muted)', transition:'all 0.15s' }}>Sign In</Link>
            <Link to="/dashboard" style={{ padding:'10px 22px', borderRadius:99, background:'var(--primary)', color:'white', fontSize:14, fontWeight:500, boxShadow:'0 4px 16px rgba(62,107,52,0.35)', transition:'all 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>Start Free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', paddingTop:72, display:'flex', alignItems:'center', position:'relative', overflow:'hidden' }}>
        {/* bg gradients */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168,201,158,0.25) 0%, transparent 70%), radial-gradient(circle at 85% 60%, rgba(207,173,110,0.12) 0%, transparent 50%)', pointerEvents:'none' }}/>
        {/* grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border-light) 1px,transparent 1px),linear-gradient(90deg,var(--border-light) 1px,transparent 1px)', backgroundSize:'60px 60px', opacity:0.4, maskImage:'radial-gradient(ellipse 70% 70% at 50% 50%,black,transparent)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 32px 60px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', position:'relative', zIndex:1, width:'100%' }}>
          {/* Left */}
          <div style={{ animation:'fadeUp 0.7s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--sage-100)', border:'1px solid var(--sage-200)', color:'var(--sage-700)', padding:'6px 14px', borderRadius:99, fontSize:12.5, fontWeight:500, marginBottom:24 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--sage-500)', animation:'pulse 2s infinite', display:'inline-block' }}/>
              #1 Platform for Dietitians
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(44px,5vw,68px)', fontWeight:500, lineHeight:1.1, letterSpacing:'-1px', marginBottom:20 }}>
              Transform your<br/>
              clinic to <em style={{ fontStyle:'italic', color:'var(--primary)' }}>digital</em>,<br/>
              <span style={{ position:'relative', display:'inline-block' }}>grow bigger
                <span style={{ position:'absolute', bottom:4, left:0, right:0, height:3, background:'var(--accent)', borderRadius:2, display:'block' }}/>
              </span>
            </h1>
            <p style={{ fontSize:17, color:'var(--muted)', lineHeight:1.7, marginBottom:36, maxWidth:480 }}>
              Client management, appointment system, nutrition programs and financial tracking — dietitian software that combines everything in one smart platform.
            </p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
              <Link to="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'16px 32px', borderRadius:99, background:'var(--primary)', color:'white', fontSize:15, fontWeight:500, boxShadow:'0 4px 20px rgba(62,107,52,0.4)', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(62,107,52,0.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 20px rgba(62,107,52,0.4)'}}>
                ▶ Watch Demo
              </Link>
              <a href="#features" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'16px 32px', borderRadius:99, background:'transparent', border:'1.5px solid var(--border)', color:'var(--charcoal)', fontSize:15, fontWeight:500, transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)';e.currentTarget.style.background='var(--sage-50)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--charcoal)';e.currentTarget.style.background='transparent'}}>
                Explore Features
              </a>
            </div>
            {/* Trust */}
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ display:'flex' }}>
                {['AK','MY','SE','+'].map((ini,i)=>(
                  <div key={i} style={{ width:36, height:36, borderRadius:'50%', border:'2px solid var(--cream)', background:['#548a48','#e0c898','#7aaa6d','var(--sage-200)'][i], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:i===1?'#7a5b2a':'white', marginLeft:i>0?-10:0 }}>{ini}</div>
                ))}
              </div>
              <div>
                <div style={{ color:'var(--accent)', fontSize:12 }}>★★★★★</div>
                <div style={{ fontSize:13, color:'var(--muted)' }}>Used by <strong style={{ color:'var(--charcoal)' }}>500+</strong> dietitians</div>
              </div>
            </div>
          </div>

          {/* Right — mock dashboard */}
          <div style={{ animation:'float 4s ease-in-out infinite', position:'relative' }}>
            <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:32, boxShadow:'var(--shadow-xl)', overflow:'hidden' }}>
              <div style={{ background:'var(--sage-50)', borderBottom:'1px solid var(--border-light)', padding:'14px 20px', display:'flex', alignItems:'center', gap:8 }}>
                {['#ff5f56','#ffbd2e','#27c93f'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
                <span style={{ marginLeft:'auto', fontSize:12, color:'var(--muted)', fontFamily:'var(--font-mono)' }}>nutriflow.app/dashboard</span>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
                  {[['48','Clients','↑ +6'],['12','Appointments','this week'],['₺24k','Revenue','↑ %18']].map(([v,l,t])=>(
                    <div key={l} style={{ background:'var(--sage-50)', borderRadius:12, padding:12 }}>
                      <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4 }}>{l}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, color:'var(--primary-dark)' }}>{v}</div>
                      <div style={{ fontSize:10, color:'var(--success)' }}>{t}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:70, marginBottom:14 }}>
                  {[40,65,45,80,55,70,90].map((h,i)=>(
                    <div key={i} style={{ flex:1, height:h+'%', borderRadius:'4px 4px 0 0', background:i===6||i===3?'var(--primary)':'var(--sage-200)' }}/>
                  ))}
                </div>
                {[['AY','#548a48','Ayşe Yılmaz','Today 14:00','Confirmed','var(--sage-100)','var(--sage-700)'],
                  ['MK','#b8924a','Mert Kaya','Today 15:30','Pending','#fef3e2','var(--warning)'],
                  ['SÇ','#7aaa6d','Selin Çelik','Tomorrow 10:00','New','#e2f0f8','var(--info)']].map(([ini,c,name,time,st,sbg,sc])=>(
                  <div key={name} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 8px', background:'var(--sage-50)', borderRadius:10, marginBottom:6 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', flexShrink:0 }}>{ini}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:600 }}>{name}</div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>{time}</div>
                    </div>
                    <span style={{ fontSize:9, padding:'2px 7px', borderRadius:99, background:sbg, color:sc, fontWeight:500 }}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Float cards */}
            <div style={{ position:'absolute', bottom:-16, left:-24, background:'white', border:'1px solid var(--border-light)', borderRadius:12, padding:'10px 14px', boxShadow:'var(--shadow-lg)', fontSize:12, animation:'float 3.5s 0.5s ease-in-out infinite' }}>
              <div style={{ fontSize:10, color:'var(--muted)' }}>Monthly Success</div>
              <div style={{ fontSize:18, fontWeight:700 }}>94%</div>
              <div style={{ fontSize:10, color:'var(--success)' }}>↑ target weight rate</div>
            </div>
            <div style={{ position:'absolute', top:24, right:-20, background:'white', border:'1px solid var(--border-light)', borderRadius:12, padding:'10px 14px', boxShadow:'var(--shadow-lg)', fontSize:12, animation:'float 4s 1s ease-in-out infinite' }}>
              <div style={{ fontSize:10, color:'var(--muted)' }}>New Clients</div>
              <div style={{ fontSize:18, fontWeight:700 }}>+8</div>
              <div style={{ fontSize:10, color:'var(--success)' }}>this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'100px 0', background:'white' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px' }}>
          <div style={{ marginBottom:60 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, color:'var(--primary)', fontSize:12.5, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:16 }}>
              <span style={{ width:20, height:2, background:'var(--primary)', borderRadius:1, display:'inline-block' }}/>Features
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,4vw,52px)', fontWeight:500, lineHeight:1.15, letterSpacing:'-0.5px', marginBottom:16 }}>
              <em style={{ fontStyle:'italic', color:'var(--primary)' }}>Everything</em> you need<br/>in one place
            </h2>
            <p style={{ fontSize:17, color:'var(--muted)', maxWidth:520, lineHeight:1.7 }}>From appointments to nutrition programs, measurement tracking to invoice management — all your clinic operations from one panel.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {features.map((f,i)=>(
              <FeatureCard key={i} {...f}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background:'var(--charcoal)', padding:'80px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 50%,rgba(84,138,72,0.2) 0%,transparent 60%),radial-gradient(circle at 70% 50%,rgba(184,146,74,0.1) 0%,transparent 60%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px', position:'relative', zIndex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40 }}>
            {stats.map(([v,l])=>(
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, color:'white', lineHeight:1, marginBottom:8 }}>{v}</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:'100px 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, color:'var(--primary)', fontSize:12.5, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:16 }}>
              <span style={{ width:20, height:2, background:'var(--primary)', borderRadius:1, display:'inline-block' }}/>Pricing
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,4vw,52px)', fontWeight:500, marginBottom:14 }}>Choose the plan that fits you</h2>
            <p style={{ fontSize:17, color:'var(--muted)' }}>Try free for 21 days. No credit card required. Cancel anytime.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, alignItems:'center' }}>
            {plans.map((p,i)=><PricingCard key={i} {...p}/>)}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding:'100px 0', background:'var(--sage-50)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, color:'var(--primary)', fontSize:12.5, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:16 }}>
              <span style={{ width:20, height:2, background:'var(--primary)', borderRadius:1, display:'inline-block' }}/>Testimonials
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,4vw,52px)', fontWeight:500 }}>What dietitians are saying?</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {testimonials.map((t,i)=><TestimonialCard key={i} {...t}/>)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px' }}>
          <div style={{ background:'linear-gradient(135deg,var(--sage-700) 0%,var(--sage-900) 100%)', borderRadius:32, padding:'80px 64px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 50%,rgba(168,201,158,0.2) 0%,transparent 60%)', pointerEvents:'none' }}/>
            <div style={{ position:'relative', zIndex:1 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,4vw,56px)', fontWeight:500, color:'white', marginBottom:16 }}>
                <em style={{ fontStyle:'italic' }}>Transform</em> your clinic<br/>today
              </h2>
              <p style={{ fontSize:17, color:'rgba(255,255,255,0.7)', marginBottom:40 }}>Try free for 21 days. Setup takes 5 minutes.</p>
              <div style={{ display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap' }}>
                <Link to="/dashboard" style={{ padding:'16px 32px', borderRadius:99, background:'white', color:'var(--primary-dark)', fontSize:15, fontWeight:600, transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                  🌿 Start Free
                </Link>
                <Link to="/dashboard" style={{ padding:'16px 32px', borderRadius:99, background:'transparent', border:'1.5px solid rgba(255,255,255,0.35)', color:'white', fontSize:15, fontWeight:500, transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.borderColor='rgba(255,255,255,0.6)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(255,255,255,0.35)'}}>
                  Watch Demo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--charcoal)', color:'white', padding:'60px 0 32px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:48, paddingBottom:48, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:600, marginBottom:12 }}>🌿 NutriFlow</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.7, maxWidth:280, marginBottom:24 }}>Comprehensive digital clinic management platform developed for dietitians.</div>
            </div>
            {[['Product',['Features','Pricing','Dashboard Demo','Changelog']],['Company',['About','Blog','Careers','Contact']],['Legal',['Privacy Policy','Terms of Service','GDPR','Refund Policy']]].map(([title,links])=>(
              <div key={title}>
                <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(255,255,255,0.4)', marginBottom:20 }}>{title}</div>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
                  {links.map(l=><li key={l}><a href="#" style={{ fontSize:14, color:'rgba(255,255,255,0.65)', transition:'color 0.15s' }} onMouseEnter={e=>e.target.style.color='white'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.65)'}>{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ paddingTop:28, display:'flex', justifyContent:'space-between', fontSize:13, color:'rgba(255,255,255,0.4)' }}>
            <span>© 2026 NutriFlow. All rights reserved.</span>
            <span>Made in Turkey 🇹🇷 with ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'white', border:'1px solid var(--border-light)', borderRadius:20, padding:32, position:'relative', overflow:'hidden', transition:'all 0.25s', transform:hov?'translateY(-4px)':'none', boxShadow:hov?'var(--shadow-lg)':'none', cursor:'default' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--primary),var(--accent))', transform:hov?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.25s', borderRadius:'20px 20px 0 0' }}/>
      <div style={{ width:52, height:52, background:'var(--sage-50)', border:'1px solid var(--sage-100)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, fontSize:22, transition:'all 0.2s', transform:hov?'scale(1.05)':'none' }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:600, marginBottom:10 }}>{title}</div>
      <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65 }}>{desc}</div>
    </div>
  );
}

function PricingCard({ tier, price, orig, desc, featured, badge, features }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:featured?'var(--charcoal)':'white', border:`1px solid ${featured?'var(--charcoal)':'var(--border-light)'}`, borderRadius:32, padding:36, position:'relative', transition:'all 0.25s', transform:featured?'scale(1.04)':hov?'translateY(-4px)':'none', boxShadow:featured?'var(--shadow-xl)':hov?'var(--shadow-lg)':'var(--shadow-sm)', color:featured?'white':'inherit' }}>
      {badge&&<div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'var(--primary)', color:'white', padding:'4px 14px', borderRadius:99, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{badge}</div>}
      <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', color:featured?'rgba(255,255,255,0.6)':'var(--muted)', marginBottom:8 }}>{tier}</div>
      {orig&&<div style={{ fontSize:13, color:featured?'rgba(255,255,255,0.4)':'var(--muted)', textDecoration:'line-through', marginBottom:4 }}>₺{orig}/ay</div>}
      <div style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:600, lineHeight:1, marginBottom:6, color:featured?'white':'var(--charcoal)' }}>
        <sup style={{ fontSize:22, verticalAlign:'super', marginRight:2 }}>₺</sup>{price}<small style={{ fontSize:14, fontWeight:400, opacity:0.6, fontFamily:'var(--font-body)' }}>/ay</small>
      </div>
      <div style={{ fontSize:14, color:featured?'rgba(255,255,255,0.65)':'var(--muted)', marginBottom:24, lineHeight:1.6 }}>{desc}</div>
      <div style={{ height:1, background:featured?'rgba(255,255,255,0.1)':'var(--border-light)', marginBottom:24 }}/>
      <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
        {features.map(f=>(
          <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:14, color:featured?'rgba(255,255,255,0.85)':'var(--charcoal)' }}>
            <span style={{ width:18, height:18, background:featured?'rgba(168,201,158,0.2)':'var(--sage-100)', color:featured?'var(--sage-300)':'var(--sage-700)', borderRadius:'50%', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link to="/dashboard" style={{ display:'block', textAlign:'center', padding:'14px', borderRadius:99, background:featured?'var(--primary)':'transparent', border:featured?'none':'1.5px solid var(--border)', color:featured?'white':'var(--charcoal)', fontSize:14, fontWeight:500, transition:'all 0.2s', boxShadow:featured?'0 4px 20px rgba(84,138,72,0.4)':'none' }}>
        {featured?'Try Free for 21 Days':price==='0'?'Start Free':'Request Demo'}
      </Link>
    </div>
  );
}

function TestimonialCard({ initials, color, name, title, text }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'white', border:'1px solid var(--border-light)', borderRadius:20, padding:28, transition:'all 0.25s', transform:hov?'translateY(-3px)':'none', boxShadow:hov?'var(--shadow-md)':'var(--shadow-sm)' }}>
      <div style={{ color:'var(--accent)', fontSize:14, marginBottom:14 }}>★★★★★</div>
      <p style={{ fontSize:15, lineHeight:1.7, fontStyle:'italic', fontFamily:'var(--font-display)', marginBottom:20, color:'var(--charcoal)' }}>"{text}"</p>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, color:'white', fontSize:14, flexShrink:0 }}>{initials}</div>
        <div>
          <div style={{ fontWeight:600, fontSize:14 }}>{name}</div>
          <div style={{ fontSize:12, color:'var(--muted)' }}>{title}</div>
        </div>
      </div>
    </div>
  );
}
