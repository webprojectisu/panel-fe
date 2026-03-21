import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadCount } from '../api/notificationService';

export default function Topbar({ title, subtitle, actions }) {
  const toast = useToast();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(data => {
      const count = data?.count ?? data?.unread_count ?? (typeof data === 'number' ? data : 0);
      setUnreadCount(count);
    }).catch(() => {});
  }, []);

  const initials = user?.full_name
    ? user.full_name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
    : 'DK';

  return (
    <header style={{
      height: 'var(--nav-h)', background: 'var(--surface)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 40,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div>
        <div style={{ fontSize:18, fontWeight:600, color:'var(--charcoal)' }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:'var(--muted)' }}>{subtitle}</div>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {actions}
        <div onClick={() => toast(unreadCount > 0 ? `${unreadCount} yeni bildirim` : 'Yeni bildirim yok', 'info')} style={{
          width:38, height:38, borderRadius:'var(--radius-md)', background:'var(--sage-50)',
          border:'1px solid var(--border-light)', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:16, cursor:'pointer', position:'relative',
        }}>
          🔔
          {unreadCount > 0 && (
            <div style={{ position:'absolute', top:4, right:4, minWidth:16, height:16, borderRadius:99, background:'var(--danger)', border:'1.5px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'white', padding:'0 3px' }}>
              {unreadCount}
            </div>
          )}
        </div>
        <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,var(--sage-400),var(--sage-600))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:12, color:'white', cursor:'pointer' }}>
          {initials}
        </div>
      </div>
    </header>
  );
}
