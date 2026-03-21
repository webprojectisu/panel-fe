import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Danisanlar from './pages/Danisanlar';
import Randevular from './pages/Randevular';
import { Programlar, Olcumler, Tarifler } from './pages/KlinikPages';
import { GelirGider, Raporlar, WebSitem, Ayarlar } from './pages/IsletmePages';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/danisanlar"  element={<Danisanlar />} />
              <Route path="/randevular"  element={<Randevular />} />
              <Route path="/programlar"  element={<Programlar />} />
              <Route path="/olcumler"    element={<Olcumler />} />
              <Route path="/tarifler"    element={<Tarifler />} />
              <Route path="/gelir-gider" element={<GelirGider />} />
              <Route path="/raporlar"    element={<Raporlar />} />
              <Route path="/web-sitem"   element={<WebSitem />} />
              <Route path="/ayarlar"     element={<Ayarlar />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
