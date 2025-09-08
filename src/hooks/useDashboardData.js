import { useState, useEffect } from 'react';
import { FiltroEstadisticas } from '../service/data';
import { 
  parsearPeriodo, 
  calcularTasaCrecimientoAnual, 
  calcularTasaCrecimientoSemestral,
  filtrarDatos,
  filtrarDatosMatricula,
  obtenerValoresUnicos,
  calcularTotal
} from '../utils/dashboardUtils';
import { YEARS_RANGE } from '../constants/dashboardConstants';

export const useDashboardData = () => {
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await FiltroEstadisticas();
        setEstadisticas(data);
        console.log('=== DEBUG DATOS ESTADISTICAS ===');
        console.log('Total registros:', data.length);
        console.log('Primer registro:', data[0]);
        console.log('Campos disponibles:', data[0] ? Object.keys(data[0]) : 'No hay datos');
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtener valores únicos para filtros
  const years = obtenerValoresUnicos(estadisticas, 'año');
  const semesters = obtenerValoresUnicos(estadisticas, 'semestre');
  const programas = obtenerValoresUnicos(estadisticas, 'plan');

  // Calcular rango de años
  const allYears = years.map(y => parseInt(y)).filter(y => !isNaN(y));
  const minYear = allYears.length > 0 ? Math.min(...allYears) : YEARS_RANGE.DEFAULT_MIN;
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : YEARS_RANGE.DEFAULT_MAX;

  return {
    estadisticas,
    loading,
    error,
    years,
    semesters,
    programas,
    minYear,
    maxYear
  };
};

export const useMatriculaData = (estadisticas, filtros) => {
  const [yearRangeMatricula, setYearRangeMatricula] = useState([YEARS_RANGE.DEFAULT_MIN, YEARS_RANGE.DEFAULT_MAX]);

  // Actualizar rango de años automáticamente cuando se cargan los datos
  useEffect(() => {
    if (estadisticas.length > 0) {
      const allYears = estadisticas
        .map(item => {
          const periodo = parsearPeriodo(item.periodo);
          return periodo ? periodo.año : null;
        })
        .filter(year => year !== null);
      
      if (allYears.length > 0) {
        const minYear = Math.min(...allYears);
        const maxYear = Math.max(...allYears);
        setYearRangeMatricula([minYear, maxYear]);
      }
    }
  }, [estadisticas]);

  // Filtrar datos para indicadores de matrícula
  const matriculaFilteredData = filtrarDatosMatricula(estadisticas, {
    yearRange: yearRangeMatricula,
    selectedNivel: filtros.selectedNivelMatricula,
    selectedPrograma: filtros.selectedProgramaMatricula
  });

  return {
    yearRangeMatricula,
    setYearRangeMatricula,
    matriculaFilteredData
  };
};

export const useProcessedMatriculaData = (matriculaFilteredData) => {
  // Procesar datos para el gráfico de matrícula con tasas de crecimiento
  const procesarDatosMatricula = () => {
    // Agrupar por periodo
    const datosPorPeriodo = {};
    
    matriculaFilteredData.forEach(item => {
      const periodo = item.periodo;
      if (!datosPorPeriodo[periodo]) {
        datosPorPeriodo[periodo] = {
          periodo,
          matriculados: 0,
          programas: new Set()
        };
      }
      datosPorPeriodo[periodo].matriculados += parseInt(item.matriculados) || 0;
      datosPorPeriodo[periodo].programas.add(item.plan);
    });

    // Convertir a array y ordenar por periodo
    const periodosOrdenados = Object.values(datosPorPeriodo).sort((a, b) => {
      const periodoA = parsearPeriodo(a.periodo);
      const periodoB = parsearPeriodo(b.periodo);
      if (!periodoA || !periodoB) return 0;
      
      if (periodoA.año !== periodoB.año) {
        return periodoA.año - periodoB.año;
      }
      return periodoA.semestre - periodoB.semestre;
    });

    // Calcular tasas de crecimiento
    const datosConTasas = periodosOrdenados.map((item, index) => {
      let tcaAnual = 0;
      let tcaSemestral = 0;

      // Tasa de crecimiento semestral (comparar con periodo anterior)
      if (index > 0) {
        const periodoAnterior = periodosOrdenados[index - 1];
        tcaSemestral = calcularTasaCrecimientoSemestral(item.matriculados, periodoAnterior.matriculados);
      }

      // Tasa de crecimiento anual (comparar con mismo semestre del año anterior)
      const periodoActual = parsearPeriodo(item.periodo);
      if (periodoActual) {
        const periodoMismoSemestreAñoAnterior = periodosOrdenados.find(p => {
          const parsedP = parsearPeriodo(p.periodo);
          return parsedP && 
                 parsedP.año === periodoActual.año - 1 && 
                 parsedP.semestre === periodoActual.semestre;
        });

        if (periodoMismoSemestreAñoAnterior) {
          tcaAnual = calcularTasaCrecimientoAnual(item.matriculados, periodoMismoSemestreAñoAnterior.matriculados);
        }
      }

      return {
        ...item,
        tcaAnual,
        tcaSemestral
      };
    });

    return datosConTasas;
  };

  return procesarDatosMatricula();
};
