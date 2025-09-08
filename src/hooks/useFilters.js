import { useState } from 'react';

export const useFilters = () => {
  // Estados para filtros generales
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedSemester, setSelectedSemester] = useState('Todos');
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  
  // Estados para el sistema de pestañas
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados específicos para Indicadores de Matrícula
  const [selectedNivelMatricula, setSelectedNivelMatricula] = useState('Todos');
  const [selectedProgramaMatricula, setSelectedProgramaMatricula] = useState('Todos');

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
      case 'selectedNivelMatricula':
        setSelectedNivelMatricula(value);
        break;
      case 'selectedProgramaMatricula':
        setSelectedProgramaMatricula(value);
        break;
      default:
        break;
    }
  };

  const resetFilters = () => {
    setSelectedYear('Todos');
    setSelectedSemester('Todos');
    setSelectedNivel('Todos');
    setSelectedNivelMatricula('Todos');
    setSelectedProgramaMatricula('Todos');
  };

  return {
    // Estados
    selectedYear,
    selectedSemester,
    selectedNivel,
    activeTab,
    selectedNivelMatricula,
    selectedProgramaMatricula,
    
    // Funciones
    setActiveTab,
    updateFilter,
    resetFilters,
    
    // Objeto de filtros para fácil acceso
    filters: {
      selectedYear,
      selectedSemester,
      selectedNivel,
      selectedNivelMatricula,
      selectedProgramaMatricula
    }
  };
};
