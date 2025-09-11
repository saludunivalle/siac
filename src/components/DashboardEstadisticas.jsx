import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import LoadingSpinner from './common/LoadingSpinner';
import TabsContainer from './common/TabsContainer';
import IndicadoresMatricula from './dashboard/IndicadoresMatricula';
import IndicadoresCupos from './dashboard/IndicadoresCupos';
import VistaGeneral from './dashboard/VistaGeneral';
import IndicadoresDemanda from './dashboard/IndicadoresDemanda';
import { useDashboardData, useMatriculaData, useProcessedMatriculaData, useCuposData, useProcessedCuposData } from '../hooks/useDashboardData';
import { useFilters } from '../hooks/useFilters';
import { NIVELES_ACADEMICOS } from '../constants/dashboardConstants';
import '../utils/chartConfig'; // Configuración de Chart.js
import '../styles/dashboard.css';

const DashboardEstadisticas = () => {
  const [isCargo, setCargo] = useState([' ']);
  
  // Custom hooks para datos y filtros
  const { 
    estadisticas, 
    loading, 
    error, 
    years, 
    semesters, 
    programas, 
    minYear, 
    maxYear 
  } = useDashboardData();
  
  const {
    activeTab,
    setActiveTab,
    updateFilter,
    filters
  } = useFilters();

  const {
    yearRangeMatricula,
    setYearRangeMatricula,
    matriculaFilteredData
  } = useMatriculaData(estadisticas, filters);

  const datosMatriculaProcesados = useProcessedMatriculaData(matriculaFilteredData);

  const {
    yearRangeCupos,
    setYearRangeCupos,
    cuposFilteredData
  } = useCuposData(estadisticas, filters);

  const datosCuposProcesados = useProcessedCuposData(cuposFilteredData);

  useEffect(() => {
    const cargo = sessionStorage.getItem('cargo');
    if (cargo) {
      setCargo(JSON.parse(cargo));
    }
  }, []);

  // Obtener períodos únicos para filtros de cupos
  const periodos = [...new Set(estadisticas.map(item => item.periodo))].sort();

  // Opciones disponibles para los filtros
  const availableOptions = {
    years,
    semesters,
    niveles: NIVELES_ACADEMICOS,
    programas,
    periodos
  };

  // Función para renderizar el contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <IndicadoresMatricula
            filters={filters}
            onFilterChange={updateFilter}
            yearRange={yearRangeMatricula}
            onYearRangeChange={(e, newValue) => setYearRangeMatricula(newValue)}
            minYear={minYear}
            maxYear={maxYear}
            matriculaFilteredData={matriculaFilteredData}
            datosMatriculaProcesados={datosMatriculaProcesados}
            availableOptions={availableOptions}
          />
        );
      case 1:
        return (
          <IndicadoresCupos
            filters={filters}
            onFilterChange={updateFilter}
            yearRange={yearRangeCupos}
            onYearRangeChange={(e, newValue) => setYearRangeCupos(newValue)}
            minYear={minYear}
            maxYear={maxYear}
            cuposFilteredData={cuposFilteredData}
            datosCuposProcesados={datosCuposProcesados}
            availableOptions={availableOptions}
          />
        );
      case 2:
        return (
          <IndicadoresDemanda
            filters={filters}
            onFilterChange={updateFilter}
            yearRange={yearRangeCupos}
            onYearRangeChange={(e, newValue) => setYearRangeCupos(newValue)}
            minYear={minYear}
            maxYear={maxYear}
            datos={cuposFilteredData}
            availableOptions={availableOptions}
          />
        );
      case 3:
        return <VistaGeneral />;
      default:
        return (
          <IndicadoresMatricula
            filters={filters}
            onFilterChange={updateFilter}
            yearRange={yearRangeMatricula}
            onYearRangeChange={(e, newValue) => setYearRangeMatricula(newValue)}
            minYear={minYear}
            maxYear={maxYear}
            matriculaFilteredData={matriculaFilteredData}
            datosMatriculaProcesados={datosMatriculaProcesados}
            availableOptions={availableOptions}
          />
        );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box className="loading-container">
        <Typography variant="h6" color="error">
          Error al cargar las estadísticas: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box className="dashboard-container">
        <Box className="dashboard-content" sx={{ maxWidth: '1300px', margin: '0 auto', px: 2 }}>
          <Fade in timeout={800}>
            <Box>
              <Typography variant="h4" className="dashboard-title">
                Dashboard de Estadísticas Académicas
              </Typography>

              {/* Sistema de pestañas */}
              <TabsContainer 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
              />

              {/* Contenido dinámico según la pestaña seleccionada */}
              {renderTabContent()}
            </Box>
          </Fade>
        </Box>
      </Box>
    </>
  );
};

export default DashboardEstadisticas;
