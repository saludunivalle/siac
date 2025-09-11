import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Alert } from '@mui/material';
import LoadingSpinner from './common/LoadingSpinner';
import TabsContainer from './common/TabsContainer';
import IndicadoresDemanda from './dashboard/IndicadoresDemanda';
import NivelStatsCard from './common/NivelStatsCard';
import ChartCard from './common/ChartCard';
import DataTable from './common/DataTable';
import { useDashboardData, useMatriculaData, useProcessedMatriculaData, useCuposData, useProcessedCuposData } from '../hooks/useDashboardData';
import { useEstadisticasPorNivel } from '../hooks/useEstadisticasPorNivel';
import { useTablaMatriculaData } from '../hooks/useTablaMatriculaData';
import { useEstadisticasPorNivelCupos } from '../hooks/useEstadisticasPorNivelCupos';
import { useTablaCuposData } from '../hooks/useTablaCuposData';
import { useProgramasDistribucion } from '../hooks/useProgramasDistribucion';
import { useFilters } from '../hooks/useFilters';
import FiltersCard from './common/FiltersCard';
import { CHART_COLORS, YEARS_RANGE, NIVELES_ACADEMICOS } from '../constants/dashboardConstants';
import { filtrarDatosMatricula, filtrarDatosCupos, parsearPeriodo } from '../utils/dashboardUtils';
import '../utils/chartConfig'; // Configuración de Chart.js
import '../styles/dashboard.css';

const EstadisticasPrograma = ({ programaAcademico }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [yearRangeMatricula, setYearRangeMatricula] = useState([YEARS_RANGE.DEFAULT_MIN, YEARS_RANGE.DEFAULT_MAX]);
  const [yearRangeCupos, setYearRangeCupos] = useState([YEARS_RANGE.DEFAULT_MIN, YEARS_RANGE.DEFAULT_MAX]);

  // Usar el hook principal de dashboard data
  const { 
    estadisticas, 
    loading, 
    error, 
    years, 
    semesters, 
    minYear, 
    maxYear 
  } = useDashboardData();

  // Hook de filtros
  const {
    updateFilter,
    filters
  } = useFilters();

  // Filtrar datos específicamente para este programa
  // El campo 'plan' contiene el nombre del programa académico en los datos de estadísticas
  const filtrarPorPrograma = (datos) => {
    return datos.filter(item => item.plan === programaAcademico);
  };

  // Filtros específicos para matrícula de este programa
  const matriculaFilteredData = filtrarDatosMatricula(filtrarPorPrograma(estadisticas), {
    yearRange: yearRangeMatricula,
    selectedNivel: 'Todos', // Sin filtro de nivel
    selectedPrograma: 'Todos' // Ya está filtrado por programa
  });

  // Filtros específicos para cupos de este programa
  const cuposFilteredData = filtrarDatosCupos(filtrarPorPrograma(estadisticas), {
    yearRange: yearRangeCupos,
    selectedNivel: 'Todos', // Sin filtro de nivel
    selectedPrograma: 'Todos', // Ya está filtrado por programa
    selectedPeriodo: filters.selectedPeriodoCupos || 'Todos'
  });

  // Procesar datos de matrícula y cupos
  const datosMatriculaProcesados = useProcessedMatriculaData(matriculaFilteredData);
  const datosCuposProcesados = useProcessedCuposData(cuposFilteredData);

  // Hooks para estadísticas por nivel
  const estadisticasPorNivelMatricula = useEstadisticasPorNivel(matriculaFilteredData);
  const estadisticasPorNivelCupos = useEstadisticasPorNivelCupos(cuposFilteredData);

  // Hooks para tablas de datos
  const datosTablaMatricula = useTablaMatriculaData(matriculaFilteredData);
  const datosTablaCupos = useTablaCuposData(cuposFilteredData);

  // Hook para distribución de programas (aunque será limitado para un solo programa)
  const { chartData: programasDistribucionData } = useProgramasDistribucion(datosTablaMatricula, matriculaFilteredData);

  // Obtener períodos únicos para filtros de cupos (solo para este programa)
  const periodos = [...new Set(filtrarPorPrograma(estadisticas).map(item => item.periodo))].sort();

  // Opciones disponibles para los filtros
  const availableOptions = {
    years,
    semesters,
    niveles: NIVELES_ACADEMICOS,
    programas: [programaAcademico], // Solo este programa
    periodos
  };

  // Actualizar rangos de años cuando se cargan los datos
  useEffect(() => {
    if (estadisticas.length > 0) {
      const datosFiltrados = filtrarPorPrograma(estadisticas);
      if (datosFiltrados.length > 0) {
        const allYears = datosFiltrados
          .map(item => {
            const periodo = parsearPeriodo(item.periodo);
            return periodo ? periodo.año : null;
          })
          .filter(year => year !== null);
        
        if (allYears.length > 0) {
          const minYear = Math.min(...allYears);
          const maxYear = Math.max(...allYears);
          setYearRangeMatricula([minYear, maxYear]);
          setYearRangeCupos([minYear, maxYear]);
        }
      }
    }
  }, [estadisticas, programaAcademico]);

  // Configuración del gráfico combinado de matrícula
  const matriculaChartData = {
    labels: datosMatriculaProcesados.map(item => item.periodo),
    datasets: [
      {
        type: 'bar',
        label: 'Matriculados',
        data: datosMatriculaProcesados.map(item => item.matriculados),
        backgroundColor: CHART_COLORS.primary,
        borderColor: CHART_COLORS.primaryBorder,
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'TCA Anual (%)',
        data: datosMatriculaProcesados.map(item => item.tcaAnual),
        borderColor: CHART_COLORS.secondaryBorder,
        backgroundColor: CHART_COLORS.secondary,
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        yAxisID: 'y1'
      },
      {
        type: 'line',
        label: 'TCA Semestral (%)',
        data: datosMatriculaProcesados.map(item => item.tcaSemestral),
        borderColor: CHART_COLORS.tertiaryBorder,
        backgroundColor: CHART_COLORS.tertiary,
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const matriculaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Matriculados por Periodo y Tasas de Crecimiento - ${programaAcademico}`
      },
      legend: {
        position: 'top',
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Periodo'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Número de Matriculados'
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Tasa de Crecimiento (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Configuración del gráfico combinado de cupos
  const cuposChartData = {
    labels: datosCuposProcesados.map(item => item.periodo),
    datasets: [
      {
        type: 'bar',
        label: 'Cupos Máximos',
        data: datosCuposProcesados.map(item => item.cuposMax),
        backgroundColor: CHART_COLORS.primary,
        borderColor: CHART_COLORS.primaryBorder,
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'bar',
        label: 'Matrícula Primera Vez',
        data: datosCuposProcesados.map(item => item.primeraVez),
        backgroundColor: CHART_COLORS.secondary,
        borderColor: CHART_COLORS.secondaryBorder,
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Tasa de Asignación (%)',
        data: datosCuposProcesados.map(item => item.tasaAsignacion),
        borderColor: CHART_COLORS.tertiaryBorder,
        backgroundColor: CHART_COLORS.tertiary,
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const cuposChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Cupos Asignados por Periodo y Tasa de Asignación - ${programaAcademico}`
      },
      legend: {
        position: 'top',
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Periodo'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Número de Cupos/Estudiantes'
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Tasa de Asignación (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 120
      },
    },
  };

  // Configuración de columnas para las tablas
  const matriculaTableColumns = [
    { header: 'Código del Programa', key: 'codPrograma', type: 'text' },
    { header: 'Programa Académico', key: 'programa', type: 'text' },
    { header: 'Total Matriculados', key: 'totalMatriculados', type: 'number' },
    { header: 'TCA Promedio (%)', key: 'tcaAnualPromedio', type: 'tca' },
    { header: 'Indicador', key: 'indicador', type: 'indicador', sourceKey: 'tcaAnualPromedio' }
  ];

  const cuposTableColumns = [
    { header: 'Código del Programa', key: 'codPrograma', type: 'text' },
    { header: 'Programa Académico', key: 'programa', type: 'text' },
    { header: 'Tasa de Asignación (%)', key: 'tasaAsignacion', type: 'number' },
    { header: 'Indicador', key: 'indicador', type: 'indicadorAsignacion', sourceKey: 'tasaAsignacion' }
  ];

  // Función para renderizar el contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            {/* Filtros específicos para Indicadores de Matrícula */}
            <FiltersCard
              title="Filtros de Indicadores de Matrícula"
              filters={{}}
              onFilterChange={(filterName, value) => {
                // No hay filtros de select, solo año
              }}
              showYearRange={true}
              yearRange={yearRangeMatricula}
              onYearRangeChange={(e, newValue) => setYearRangeMatricula(newValue)}
              minYear={minYear}
              maxYear={maxYear}
              availableOptions={availableOptions}
              hidePrograma={true} // Ocultar filtro de programa
              hideNivel={true} // Ocultar filtro de nivel
            />

            {/* Verificar si hay datos de matrícula */}
            {matriculaFilteredData.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No se encontraron datos de matrícula para el programa: {programaAcademico}
              </Alert>
            ) : (
              <>
                {/* Tarjetas de resumen por nivel académico */}
                {estadisticasPorNivelMatricula.length > 0 && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {estadisticasPorNivelMatricula.map((nivel) => (
                      <Grid item xs={12} sm={6} md={2.4} lg={2.4} xl={2.4} key={nivel.nivel}>
                        <NivelStatsCard
                          nivel={nivel.nivel}
                          totalMatriculados={nivel.totalMatriculados}
                          tcaPromedio={nivel.tcaPromedio}
                          color={nivel.color}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Gráfico de matrícula */}
                {datosMatriculaProcesados.length > 0 && (
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <ChartCard
                        title={`Matriculados por Periodo y Tasas de Crecimiento - ${programaAcademico}`}
                        data={matriculaChartData}
                        options={matriculaChartOptions}
                        type="bar"
                        height={400}
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Tabla de datos detallados */}
                {datosTablaMatricula.length > 0 && (
                  <DataTable
                    title={`Indicadores Detallados de Matrícula`}
                    data={datosTablaMatricula}
                    columns={matriculaTableColumns}
                    maxRows={50}
                    showPagination={true}
                  />
                )}
              </>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            {/* Filtros específicos para Indicadores de Cupos */}
            <FiltersCard
              title="Filtros de Indicadores de Cupos Asignados"
              filters={{
                selectedPeriodo: filters.selectedPeriodoCupos
              }}
              onFilterChange={(filterName, value) => {
                if (filterName === 'selectedPeriodo') {
                  updateFilter('selectedPeriodoCupos', value);
                }
              }}
              showYearRange={true}
              yearRange={yearRangeCupos}
              onYearRangeChange={(e, newValue) => setYearRangeCupos(newValue)}
              minYear={minYear}
              maxYear={maxYear}
              availableOptions={availableOptions}
              showPeriodoFilter={true}
              hidePrograma={true} // Ocultar filtro de programa
              hideNivel={true} // Ocultar filtro de nivel
            />

            {/* Verificar si hay datos de cupos */}
            {cuposFilteredData.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No se encontraron datos de cupos para el programa: {programaAcademico}
              </Alert>
            ) : (
              <>
                {/* Tarjetas de resumen por nivel académico */}
                {estadisticasPorNivelCupos.length > 0 && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {estadisticasPorNivelCupos.map((nivel) => (
                      <Grid item xs={12} sm={6} md={2.4} lg={2.4} xl={2.4} key={nivel.nivel}>
                        <NivelStatsCard
                          nivel={nivel.nivel}
                          totalMatriculados={nivel.totalCuposMax}
                          tcaPromedio={nivel.tasaAsignacion}
                          color={nivel.color}
                          isCuposMode={true}
                          totalPrimeraVez={nivel.totalPrimeraVez}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Gráfico de cupos */}
                {datosCuposProcesados.length > 0 && (
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <ChartCard
                        title={`Cupos Asignados por Periodo y Tasa de Asignación - ${programaAcademico}`}
                        data={cuposChartData}
                        options={cuposChartOptions}
                        type="bar"
                        height={400}
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Tabla de datos detallados */}
                {datosTablaCupos.length > 0 && (
                  <DataTable
                    title={`Indicadores Detallados de Cupos`}
                    data={datosTablaCupos}
                    columns={cuposTableColumns}
                    maxRows={50}
                    showPagination={true}
                  />
                )}
              </>
            )}
          </Box>
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
            showPeriodoFilter={true}
            hidePrograma={true}
            hideNivel={true}
          />
        );
      default:
        return null;
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

  // Verificar si hay datos para este programa
  const datosProgramaTotal = filtrarPorPrograma(estadisticas);
  if (datosProgramaTotal.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No se encontraron datos estadísticos para el programa: <strong>{programaAcademico}</strong>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2, 
      width: '100%', 
      maxWidth: 'none',
      background: 'transparent',
      minHeight: 'auto',
      overflow: 'visible',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
        Estadísticas del Programa: {programaAcademico}
      </Typography>

      {/* Sistema de pestañas simplificado */}
      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        <TabsContainer 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          showGeneralTab={false} // No mostrar vista general para un programa específico
        />

        {/* Contenido dinámico según la pestaña seleccionada */}
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default EstadisticasPrograma;
