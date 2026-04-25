import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Tracker from './pages/Tracker';
import Map from './pages/Map';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/tracker" replace />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/map" element={<Map />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
