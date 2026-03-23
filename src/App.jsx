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
              <Route path="/clients"  element={<Danisanlar />} />
              <Route path="/appointments"  element={<Randevular />} />
              <Route path="/programs"  element={<Programlar />} />
              <Route path="/measurements"    element={<Olcumler />} />
              <Route path="/recipes"    element={<Tarifler />} />
              <Route path="/income-expenses" element={<GelirGider />} />
              <Route path="/reports"    element={<Raporlar />} />
              <Route path="/my-website"   element={<WebSitem />} />
              <Route path="/settings"     element={<Ayarlar />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
