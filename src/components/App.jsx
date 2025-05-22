import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import RegistroCalificado from './components/RegistroCalificado';
import Crea from './components/Crea';
// ... other imports ...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro-calificado" element={<RegistroCalificado />} />
        <Route path="/creacion-programa" element={<Crea />} />
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
}

export default App; 