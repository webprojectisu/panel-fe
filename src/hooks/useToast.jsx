import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type==='success'?'#3a7d44':t.type==='warning'?'#c8872a':t.type==='error'?'#b84040':'#1e2a1a',
            color:'white', padding:'12px 20px', borderRadius:12, fontSize:14,
            display:'flex', alignItems:'center', gap:10, boxShadow:'0 12px 40px rgba(30,42,26,0.2)',
            animation:'slideRight 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            minWidth:240
          }}>
            <span>{t.type==='success'?'✅':t.type==='warning'?'⚠️':t.type==='error'?'❌':'ℹ️'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
