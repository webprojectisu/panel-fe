import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { dietitian } from '../data/mockData';
import { getDashboardStats } from '../api/dashboardService';
import { getUnreadCount } from '../api/notificationService';

const navItems = [
  { section: 'Ana Menü' },
  { to: '/dashboard',    icon: '📊', label: 'Dashboard' },
  { to: '/danisanlar',   icon: '👥', label: 'Danışanlar',           badgeKey: 'clients' },
  { to: '/randevular',   icon: '📅', label: 'Randevular',           badgeKey: 'notifications' },
  { section: 'Klinik' },
  { to: '/programlar',   icon: '🥗', label: 'Beslenme Programları' },
  { to: '/olcumler',     icon: '📏', label: 'Ölçüm Takibi' },
  { to: '/tarifler',     icon: '📚', label: 'Tarif Kütüphanesi' },
  { section: 'İşletme' },
  { to: '/gelir-gider',  icon: '💰', label: 'Gelir & Gider' },
  { to: '/raporlar',     icon: '📄', label: 'Raporlar' },
  { to: '/web-sitem',    icon: '🌐', label: 'Web Sitem' },
  { section: 'Sistem' },
  { to: '/ayarlar',      icon: '⚙️', label: 'Ayarlar' },
];

export default function Sidebar() {
  const [clientCount, setClientCount] = useState(48);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    getDashboardStats().then(data => {
      if (data?.active_clients != null) setClientCount(data.active_clients);
    }).catch(() => {});

    getUnreadCount().then(data => {
      const count = data?.count ?? data?.unread_count ?? (typeof data === 'number' ? data : 0);
      setNotifCount(count);
    }).catch(() => {});
  }, []);

  const getBadge = (item) => {
    if (item.badgeKey === 'clients') return clientCount > 0 ? String(clientCount) : null;
    if (item.badgeKey === 'notifications') return notifCount > 0 ? String(notifCount) : null;
    return null;
  };

  return (
    <aside style={{width:'var(--sidebar-w)',background:'var(--charcoal)',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,bottom:0,zIndex:50}}>
      <div style={{padding:'22px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:34,height:34,background:'var(--primary)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>🌿</div>
        <span style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:600,color:'white'}}>Nutri<span style={{color:'var(--sage-400)'}}>Flow</span></span>
      </div>
      <nav style={{flex:1,padding:'16px 12px',overflowY:'auto'}}>
        {navItems.map((item, i) => {
          if (item.section) return (
            <div key={i} style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.3)',padding:'0 8px',margin:i===0?'0 0 6px':'16px 0 6px'}}>
              {item.section}
            </div>
          );
          const badge = getBadge(item);
          return (
            <NavLink key={i} to={item.to} style={({isActive})=>({
              display:'flex',alignItems:'center',gap:10,padding:'10px',borderRadius:'var(--radius-md)',
              color:isActive?'white':'rgba(255,255,255,0.6)',
              background:isActive?'var(--primary)':'transparent',
              fontSize:14,fontWeight:500,transition:'all 0.15s',textDecoration:'none',
            })}>
              <span style={{width:18,textAlign:'center',fontSize:15}}>{item.icon}</span>
              {item.label}
              {badge && <span style={{marginLeft:'auto',background:'var(--accent)',color:'white',fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:99}}>{badge}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:10,borderRadius:'var(--radius-md)',cursor:'pointer'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--sage-400),var(--sage-600))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:13,color:'white',flexShrink:0}}>{dietitian.initials}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'white',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{dietitian.name}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>{dietitian.title} · {dietitian.plan}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
