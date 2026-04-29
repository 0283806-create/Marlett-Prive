import { Routes, Route } from 'react-router-dom';
import MarlettHome from './pages/MarlettHome';
import AdminLogin from './pages/AdminLogin';
import AdminReservaciones from './pages/AdminReservaciones';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarlettHome />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/admin/reservaciones"
        element={
          <ProtectedRoute>
            <AdminReservaciones />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
