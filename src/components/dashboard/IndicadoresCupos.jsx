import React from 'react';
import { Box, Grid } from '@mui/material';
import FiltersCard from '../common/FiltersCard';
import NivelStatsCard from '../common/NivelStatsCard';
import ChartCard from '../common/ChartCard';
import DataTable from '../common/DataTable';
import { useEstadisticasPorNivelCupos } from '../../hooks/useEstadisticasPorNivelCupos';
import { useTablaCuposData } from '../../hooks/useTablaCuposData';
import { CHART_COLORS } from '../../constants/dashboardConstants';

const IndicadoresCupos = ({
  filters,
  onFilterChange,
  yearRange,
  onYearRangeChange,
  minYear,
  maxYear,
  cuposFilteredData,
  datosCuposProcesados,
  availableOptions
}) => {
  const estadisticasPorNivel = useEstadisticasPorNivelCupos(cuposFilteredData);
  const datosTablaCupos = useTablaCuposData(cuposFilteredData);

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
        text: 'Cupos Asignados por Periodo y Tasa de Asignación'
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

  // Obtener períodos únicos para el filtro
  const periodosDisponibles = [...new Set(cuposFilteredData.map(item => item.periodo))].sort();
  const availableOptionsWithPeriods = {
    ...availableOptions,
    periodos: periodosDisponibles
  };

  // Configuración de columnas para la tabla
  const tableColumns = [
    { header: 'Código del Programa', key: 'codPrograma', type: 'text' },
    { header: 'Programa Académico', key: 'programa', type: 'text' },
    { header: 'Tasa de Asignación (%)', key: 'tasaAsignacion', type: 'number' },
    { header: 'Indicador', key: 'indicador', type: 'indicadorAsignacion', sourceKey: 'tasaAsignacion' }
  ];

  return (
    <Box>
      {/* Filtros específicos para Indicadores de Cupos */}
      <FiltersCard
        title="Filtros de Indicadores de Cupos Asignados"
        filters={{
          selectedNivel: filters.selectedNivelCupos,
          selectedPrograma: filters.selectedProgramaCupos,
          selectedPeriodo: filters.selectedPeriodoCupos
        }}
        onFilterChange={(filterName, value) => {
          if (filterName === 'selectedNivel') {
            onFilterChange('selectedNivelCupos', value);
          } else if (filterName === 'selectedPrograma') {
            onFilterChange('selectedProgramaCupos', value);
          } else if (filterName === 'selectedPeriodo') {
            onFilterChange('selectedPeriodoCupos', value);
          }
        }}
        showYearRange={true}
        yearRange={yearRange}
        onYearRangeChange={onYearRangeChange}
        minYear={minYear}
        maxYear={maxYear}
        availableOptions={availableOptionsWithPeriods}
        showPeriodoFilter={true}
      />

      {/* Tarjetas de resumen por nivel académico */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {estadisticasPorNivel.map((nivel) => (
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

      {/* Gráfico de cupos asignados */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <ChartCard
            title="Cupos Asignados por Periodo y Tasa de Asignación"
            data={cuposChartData}
            options={cuposChartOptions}
            type="bar"
            height={400}
          />
        </Grid>
      </Grid>

      {/* Tabla de datos detallados */}
      <DataTable
        title={`Indicadores Detallados de Cupos por Programa`}
        data={datosTablaCupos}
        columns={tableColumns}
        maxRows={50}
        showPagination={true}
      />
    </Box>
  );
};

export default IndicadoresCupos;
