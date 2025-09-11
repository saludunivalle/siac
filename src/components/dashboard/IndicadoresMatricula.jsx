import React from 'react';
import { Box, Grid } from '@mui/material';
import FiltersCard from '../common/FiltersCard';
import NivelStatsCard from '../common/NivelStatsCard';
import ChartCard from '../common/ChartCard';
import DataTable from '../common/DataTable';
import { useEstadisticasPorNivel } from '../../hooks/useEstadisticasPorNivel';
import { useTablaMatriculaData } from '../../hooks/useTablaMatriculaData';
import { useProgramasDistribucion } from '../../hooks/useProgramasDistribucion';
import { CHART_COLORS } from '../../constants/dashboardConstants';

const IndicadoresMatricula = ({
  filters,
  onFilterChange,
  yearRange,
  onYearRangeChange,
  minYear,
  maxYear,
  matriculaFilteredData,
  datosMatriculaProcesados,
  availableOptions
}) => {
  const estadisticasPorNivel = useEstadisticasPorNivel(matriculaFilteredData);
  const datosTablaMatricula = useTablaMatriculaData(matriculaFilteredData);
  const { chartData: programasDistribucionData } = useProgramasDistribucion(datosTablaMatricula, matriculaFilteredData);

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
        text: 'Matriculados por Periodo y Tasas de Crecimiento'
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

  // Configuración del gráfico de distribución de programas por nivel y crecimiento
  const programasDistribucionOptions = {
    indexAxis: 'y', // Hace que las barras sean horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Distribución de Programas por Nivel y Categoría de Crecimiento'
      },
      legend: {
        position: 'top',
      },
      datalabels: {
        display: true,
        anchor: 'center',
        align: 'center',
        formatter: (value) => value > 0 ? value : '',
        font: {
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Programas'
        },
        stacked: true
      },
      y: {
        title: {
          display: true,
          text: 'Nivel de Formación'
        },
        stacked: true
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  // Configuración de columnas para la tabla
  const tableColumns = [
    { header: 'Código del Programa', key: 'codPrograma', type: 'text' },
    { header: 'Programa Académico', key: 'programa', type: 'text' },
    { header: 'Total Matriculados', key: 'totalMatriculados', type: 'number' },
    { header: 'TCA Promedio (%)', key: 'tcaAnualPromedio', type: 'tca' },
    { header: 'Indicador', key: 'indicador', type: 'indicador', sourceKey: 'tcaAnualPromedio' }
  ];

  return (
    <Box>
      {/* Filtros específicos para Indicadores de Matrícula */}
      <FiltersCard
        title="Filtros de Indicadores de Matrícula"
        filters={{
          selectedNivel: filters.selectedNivelMatricula,
          selectedPrograma: filters.selectedProgramaMatricula,
          selectedPeriodo: filters.selectedPeriodoMatricula
        }}
        onFilterChange={(filterName, value) => {
          if (filterName === 'selectedNivel') {
            onFilterChange('selectedNivelMatricula', value);
          } else if (filterName === 'selectedPrograma') {
            onFilterChange('selectedProgramaMatricula', value);
          } else if (filterName === 'selectedPeriodo') {
            onFilterChange('selectedPeriodoMatricula', value);
          }
        }}
        showYearRange={true}
        yearRange={yearRange}
        onYearRangeChange={onYearRangeChange}
        minYear={minYear}
        maxYear={maxYear}
        availableOptions={availableOptions}
        showPeriodoFilter={true}
      />

      {/* Tarjetas de resumen por nivel académico */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {estadisticasPorNivel.map((nivel) => (
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

      {/* Gráficos lado a lado */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Matriculados por Periodo y Tasas de Crecimiento"
            data={matriculaChartData}
            options={matriculaChartOptions}
            type="bar"
            height={400}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Distribución de Programas por Nivel y Categoría de Crecimiento"
            data={programasDistribucionData}
            options={programasDistribucionOptions}
            type="bar"
            height={400}
          />
        </Grid>
      </Grid>

      {/* Tabla de datos detallados */}
      <DataTable
        title={`Indicadores Detallados por Programa`}
        data={datosTablaMatricula}
        columns={tableColumns}
        maxRows={50}
        showPagination={true}
      />
    </Box>
  );
};

export default IndicadoresMatricula;
