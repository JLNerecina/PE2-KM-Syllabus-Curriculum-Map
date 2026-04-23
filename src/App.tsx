import { Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          {/* Single Blank Route */}
          <Route path="/" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
