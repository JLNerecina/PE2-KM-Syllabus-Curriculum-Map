import { Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';

// Pages
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Single Blank Route */}
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
