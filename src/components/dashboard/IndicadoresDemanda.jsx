import React from 'react';
import { Box, Grid } from '@mui/material';
import FiltersCard from '../common/FiltersCard';
import ChartCard from '../common/ChartCard';
import DataTable from '../common/DataTable';
import { CHART_COLORS } from '../../constants/dashboardConstants';
import { parsearPeriodo, calcularTasaInscripcion } from '../../utils/dashboardUtils';

const IndicadoresDemanda = ({
  filters,
  onFilterChange,
  yearRange,
  onYearRangeChange,
  minYear,
  maxYear,
  datos,
  availableOptions,
  hidePrograma = false,
  hideNivel = false,
  showPeriodoFilter = true
}) => {
  // Agrupar por periodo para construir los gráficos de barras + línea
  const agruparPorPeriodo = (source, cupoKey) => {
    const porPeriodo = {};
    source.forEach(item => {
      const periodo = item.periodo;
      if (!porPeriodo[periodo]) {
        porPeriodo[periodo] = { periodo, inscritos: 0, cupos: 0 };
      }
      porPeriodo[periodo].inscritos += parseInt(item.inscritos) || 0;
      porPeriodo[periodo].cupos += parseInt(item[cupoKey]) || 0;
    });

    const ordenados = Object.values(porPeriodo).sort((a, b) => {
      const aP = parsearPeriodo(a.periodo);
      const bP = parsearPeriodo(b.periodo);
      if (!aP || !bP) return 0;
      if (aP.año !== bP.año) return aP.año - bP.año;
      return aP.semestre - bP.semestre;
    });

    const conTasa = ordenados.map(row => ({
      ...row,
      tasa: Math.round(calcularTasaInscripcion(row.inscritos, row.cupos) * 100) / 100
    }));

    return conTasa;
  };

  const datosMin = agruparPorPeriodo(datos, 'cupos_min');
  const datosMax = agruparPorPeriodo(datos, 'cupos_max');

  const chartDataFrom = (rows, tituloBarra, tituloLinea) => ({
    labels: rows.map(r => r.periodo),
    datasets: [
      {
        type: 'bar',
        label: 'Inscritos',
        data: rows.map(r => r.inscritos),
        backgroundColor: CHART_COLORS.primary,
        borderColor: CHART_COLORS.primaryBorder,
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'bar',
        label: tituloBarra,
        data: rows.map(r => r.cupos),
        backgroundColor: CHART_COLORS.secondary,
        borderColor: CHART_COLORS.secondaryBorder,
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: tituloLinea,
        data: rows.map(r => r.tasa),
        borderColor: CHART_COLORS.tertiaryBorder,
        backgroundColor: CHART_COLORS.tertiary,
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  });

  const options = (title, y1Label = 'Tasa de inscripción (%)') => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      title: { display: true, text: title },
      legend: { position: 'top' },
      datalabels: { display: false }
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Periodo' } },
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Cantidad' }, beginAtZero: true },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: y1Label }, grid: { drawOnChartArea: false }, min: 0 }
    }
  });

  // Tabla: cod, programa, porcentaje min y max, e indicador
  const construirTabla = (source) => {
    const porPrograma = {};
    source.forEach(item => {
      const codPrograma = (item.codPlan !== undefined && item.codPlan !== null && item.codPlan !== '')
        ? String(item.codPlan)
        : String(item.cod_plan || item.codplan || 'N/A');
      const programa = item.plan;
      const inscritos = parseInt(item.inscritos) || 0;
      const cMin = parseInt(item.cupos_min) || 0;
      const cMax = parseInt(item.cupos_max) || 0;

      if (!porPrograma[codPrograma]) {
        porPrograma[codPrograma] = { codPrograma, programa, inscritos: 0, cuposMin: 0, cuposMax: 0 };
      }
      porPrograma[codPrograma].inscritos += inscritos;
      porPrograma[codPrograma].cuposMin += cMin;
      porPrograma[codPrograma].cuposMax += cMax;
    });

    return Object.values(porPrograma).map(p => ({
      ...p,
      porcentajeMin: Math.round((p.cuposMin ? (p.inscritos / p.cuposMin) * 100 : 0) * 100) / 100,
      porcentajeMax: Math.round((p.cuposMax ? (p.inscritos / p.cuposMax) * 100 : 0) * 100) / 100,
      indicador: '' // se renderiza con indicadorDemanda usando los campos
    }));
  };

  const tablaData = construirTabla(datos);

  // Periodos disponibles a partir de los datos actuales
  const periodosDisponibles = [...new Set(datos.map(item => item.periodo))].sort();
  const availableOptionsWithPeriods = {
    ...availableOptions,
    periodos: periodosDisponibles
  };

  const tableColumns = [
    { header: 'Código del Programa', key: 'codPrograma', type: 'text' },
    { header: 'Programa Académico', key: 'programa', type: 'text' },
    { header: 'Porcentaje Min (%)', key: 'porcentajeMin', type: 'number' },
    { header: 'Porcentaje Max (%)', key: 'porcentajeMax', type: 'number' },
    { header: 'Indicador', key: 'indicador', type: 'indicadorDemanda' }
  ];

  return (
    <Box>
      <FiltersCard
        title="Filtros de Indicadores de demanda"
        filters={{
          selectedNivel: filters?.selectedNivelCupos,
          selectedPrograma: filters?.selectedProgramaCupos,
          selectedPeriodo: filters?.selectedPeriodoCupos
        }}
        onFilterChange={(filterName, value) => {
          if (!onFilterChange) return;
          if (filterName === 'selectedNivel') onFilterChange('selectedNivelCupos', value);
          else if (filterName === 'selectedPrograma') onFilterChange('selectedProgramaCupos', value);
          else if (filterName === 'selectedPeriodo') onFilterChange('selectedPeriodoCupos', value);
        }}
        showYearRange={true}
        yearRange={yearRange}
        onYearRangeChange={onYearRangeChange}
        minYear={minYear}
        maxYear={maxYear}
        availableOptions={availableOptionsWithPeriods}
        showPeriodoFilter={showPeriodoFilter}
        hidePrograma={hidePrograma}
        hideNivel={hideNivel}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Inscripción y cupo mínimo (con tasa de inscripción)"
            data={chartDataFrom(datosMin, 'Cupo mínimo', 'Tasa inscripción (min)')}
            options={options('Inscripción y cupo mínimo (con tasa de inscripción)')}
            type="bar"
            height={400}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Inscripción y cupo máximo (con tasa de inscripción)"
            data={chartDataFrom(datosMax, 'Cupo máximo', 'Tasa inscripción (max)')}
            options={options('Inscripción y cupo máximo (con tasa de inscripción)')}
            type="bar"
            height={400}
          />
        </Grid>
      </Grid>

      <DataTable
        title={`Indicadores de demanda por programa`}
        data={tablaData}
        columns={tableColumns}
        maxRows={50}
        showPagination={true}
      />
    </Box>
  );
};

export default IndicadoresDemanda;


