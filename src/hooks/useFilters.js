import { useState } from 'react';

const getUserEscuela = () => {
  try {
    const logged = sessionStorage.getItem('logged');
    if (!logged) return null;

    const res = JSON.parse(logged);
    if (!Array.isArray(res) || res.length === 0) return null;

    const directorEscuela = res.find((item) => {
      const permiso = item.permiso;
      if (Array.isArray(permiso)) return permiso.includes('Director Escuela');
      return permiso === 'Director Escuela';
    });

    return directorEscuela?.escuela || res[0]?.escuela || null;
  } catch {
    return null;
  }
};

const getInitialEscuela = () => getUserEscuela() || 'Todos';

export const useFilters = () => {
  const initialEscuela = getInitialEscuela();

  // Estados para filtros generales
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedSemester, setSelectedSemester] = useState('Todos');
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [selectedEscuela, setSelectedEscuela] = useState(initialEscuela);
  
  // Estados para el sistema de pestañas
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados específicos para Indicadores de Matrícula
  const [selectedNivelMatricula, setSelectedNivelMatricula] = useState('Todos');
  const [selectedEscuelaMatricula, setSelectedEscuelaMatricula] = useState(initialEscuela);
  const [selectedProgramaMatricula, setSelectedProgramaMatricula] = useState('Todos');
  const [selectedPeriodoMatricula, setSelectedPeriodoMatricula] = useState('Todos');
  
  // Estados específicos para Indicadores de Cupos
  const [selectedNivelCupos, setSelectedNivelCupos] = useState('Todos');
  const [selectedEscuelaCupos, setSelectedEscuelaCupos] = useState(initialEscuela);
  const [selectedProgramaCupos, setSelectedProgramaCupos] = useState('Todos');
  const [selectedPeriodoCupos, setSelectedPeriodoCupos] = useState('Todos');

  const updateFilter = (filterName, value) => {
    switch (filterName) {
      case 'selectedYear':
        setSelectedYear(value);
        break;
      case 'selectedSemester':
        setSelectedSemester(value);
        break;
      case 'selectedNivel':
        setSelectedNivel(value);
        break;
      case 'selectedEscuela':
        setSelectedEscuela(value);
        break;
      case 'selectedNivelMatricula':
        setSelectedNivelMatricula(value);
        break;
      case 'selectedEscuelaMatricula':
        setSelectedEscuelaMatricula(value);
        break;
      case 'selectedProgramaMatricula':
        setSelectedProgramaMatricula(value);
        break;
      case 'selectedPeriodoMatricula':
        setSelectedPeriodoMatricula(value);
        break;
      case 'selectedNivelCupos':
        setSelectedNivelCupos(value);
        break;
      case 'selectedEscuelaCupos':
        setSelectedEscuelaCupos(value);
        break;
      case 'selectedProgramaCupos':
        setSelectedProgramaCupos(value);
        break;
      case 'selectedPeriodoCupos':
        setSelectedPeriodoCupos(value);
        break;
      default:
        break;
    }
  };

  const resetFilters = () => {
    setSelectedYear('Todos');
    setSelectedSemester('Todos');
    setSelectedNivel('Todos');
    setSelectedEscuela(initialEscuela);
    setSelectedNivelMatricula('Todos');
    setSelectedEscuelaMatricula(initialEscuela);
    setSelectedProgramaMatricula('Todos');
    setSelectedPeriodoMatricula('Todos');
    setSelectedNivelCupos('Todos');
    setSelectedEscuelaCupos(initialEscuela);
    setSelectedProgramaCupos('Todos');
    setSelectedPeriodoCupos('Todos');
  };

  return {
    // Estados
    selectedYear,
    selectedSemester,
    selectedNivel,
    selectedEscuela,
    activeTab,
    selectedNivelMatricula,
    selectedEscuelaMatricula,
    selectedProgramaMatricula,
    selectedPeriodoMatricula,
    selectedNivelCupos,
    selectedEscuelaCupos,
    selectedProgramaCupos,
    selectedPeriodoCupos,
    
    // Funciones
    setActiveTab,
    updateFilter,
    resetFilters,
    
    // Objeto de filtros para fácil acceso
    filters: {
      selectedYear,
      selectedSemester,
      selectedNivel,
      selectedEscuela,
      selectedNivelMatricula,
      selectedEscuelaMatricula,
      selectedProgramaMatricula,
      selectedPeriodoMatricula,
      selectedNivelCupos,
      selectedEscuelaCupos,
      selectedProgramaCupos,
      selectedPeriodoCupos
    }
  };
};
