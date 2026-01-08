import { useEffect, useState } from 'react'
import './App.css'
import Home from './components/Home';
import ProgramDetails from './components/ProgramDetails';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Seguimiento from './components/Seguimiento';
import Seguimientorac from './components/Seguimientorac';
import Programas from './components/Programas';
import GoogleLogin from './components/GoogleLogin';
import Cookies from 'js-cookie';
import SeguimientoInicio from './components/SeguimientoInicio';
import DocenciaServicio from './components/DocenciaServicio';
import CreacionPrograms from './components/CreacionPrograms';
import ProgramasVenc from './components/ProgramasVenc';
import Semaforo from './components/Semaforo';
import SemaforoAc from './components/SemaforoAc';
import Crea from './components/Crea';
import Aac from './components/Aac';
import Mod from './components/Mod';
import RegistroCalificado from './components/RegistroCalificado';
import AcreditacionAltaCalidad from './components/AltaCalidad';
import DashboardEstadisticas from './components/DashboardEstadisticas';
import ConsolidadoHistoricoPage from './components/ConsolidadoHistoricoPage';
import GlobalLoading from './components/GlobalLoading';
import { preloadCommonData } from './service/fetch';

function App() {
  const [isLogged, setLogged] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setLogged(true);
    }
  }, []);

  useEffect(() => {
    if (isLogged && !isPreloading) {
      setIsPreloading(true);
      preloadCommonData()
        .then(() => {
          console.log('✅ Datos pre-cargados correctamente');
        })
        .catch((error) => {
          console.error('⚠️ Error en pre-carga:', error);
        })
        .finally(() => {
          setIsPreloading(false);
        });
    }
  }, [isLogged]);

  return (
    <>
      <GlobalLoading />
      
      <Router>
        <Routes>
          {/* Rutas públicas - accesibles sin login */}
          <Route path="/" element={ <Home /> } />
          <Route path="/estadisticas" element={<DashboardEstadisticas />} />
          <Route path="/consolidado-historico" element={<ConsolidadoHistoricoPage />} />
          <Route path="/login" element={<GoogleLogin setIsLogin={setLogged} />} />
          {/* Rutas protegidas - solo si está logueado */}
          {isLogged ? (
            <>
              <Route path="/program_details" element={<ProgramDetails />} />
              <Route path="/seguimiento" element={<Seguimiento />} />
              <Route path="/seguimientorac" element={<Seguimientorac />} />
              <Route path="/programas" element={<Programas />} />
              <Route path="/seguimiento-inicio" element={<SeguimientoInicio />} />
              <Route path="/docencia-servicio" element={<DocenciaServicio />} />
              <Route path="/creacion-programa" element={<CreacionPrograms />} />
              <Route path="/programas-venc" element={<ProgramasVenc />} />
              <Route path="/semaforo-rc" element={<Semaforo />} />
              <Route path="/semaforo-ac" element={<SemaforoAc />} />
              <Route path="/crea" element={<Crea />} />
              <Route path="/aac" element={<Aac />} />
              <Route path="/mod" element={<Mod />} />
              <Route path="/registro-calificado" element={<RegistroCalificado />} />
              <Route path="/acreditacion-alta-calidad" element={<AcreditacionAltaCalidad />} />
              
            </>
          ) : (
            <Route path="*" element={<GoogleLogin setIsLogin={setLogged} />} />
          )}
        </Routes>
      </Router>
    </>
  )
}

export default App;