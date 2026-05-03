import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Tracker from './pages/Tracker';
import Map from './pages/Map';
import MapPrint from './pages/MapPrint';
import Monitor from './pages/Monitor';
import ManageUsers from './pages/ManageUsers';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        {/* Print pages — no navbar wrapper */}
        <Route path="/map-print" element={<MapPrint />} />
        <Route path="/map-print/:studentId" element={<MapPrint />} />

        <Route element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/tracker" replace />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/tracker/:studentId" element={<Tracker />} />
          <Route path="/map" element={<Map />} />
          <Route path="/map/:studentId" element={<Map />} />

          {/* Faculty, Admin, Superadmin only */}
          <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin', 'superadmin']} />}>
            <Route path="/monitor" element={<Monitor />} />
          </Route>

          {/* Admin, Superadmin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
            <Route path="/manage-users" element={<ManageUsers />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
