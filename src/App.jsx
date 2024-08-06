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

function App() {
  const [isLogged, setLogged] = useState(false);

  useEffect(
    () =>{
      const token = Cookies.get('token');
      if (token) {
        setLogged(true);
      }
    }
  )  
  return (
    <>
    
    {
      isLogged ? (
        <Router>
            <Routes>
              <Route path="/" element={<Home /> } />
              <Route path="/program_details" element={<ProgramDetails />} />
              <Route path="/seguimiento" element={<Seguimiento />} />
              <Route path="/seguimientorac" element={<Seguimientorac />} />
              <Route path="/programas" element={<Programas />} />
              <Route path="/seguimiento-inicio" element={<SeguimientoInicio />} />
              <Route path="/docencia-servicio" element={<DocenciaServicio />} />
              <Route path="/creacion-programa" element={<CreacionPrograms />} />
              <Route path="/programas-venc" element={<ProgramasVenc />} />
              <Route
                        path="*"
                        element={
                            <>
                                <h1>No Found Route</h1>
                            </>
                        }
                    />
          </Routes>
      </Router>
      ):(
        <Router>
            <Routes>
              <Route path="/" element={<GoogleLogin setIsLogin={setLogged} /> } />
              <Route
                        path="*"
                        element={
                            <>
                                <h1>No loggin</h1>
                            </>
                        }
                    />
              </Routes>
        </Router>
      )
    }
      
    </>
  )
}

export default App;
