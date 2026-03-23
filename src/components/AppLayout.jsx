import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useToast } from '../hooks/useToast';

export default function AppLayout({ children }) {
  const showToast = useToast();

  useEffect(() => {
    const handler = () => showToast('Server error. Please refresh the page.', 'error');
    window.addEventListener('api-error', handler);
    return () => window.removeEventListener('api-error', handler);
  }, []);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--sage-50)' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:'var(--sidebar-w)', display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  );
}
