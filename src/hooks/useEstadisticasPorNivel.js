import { useMemo } from 'react';
import { 
  parsearPeriodo, 
  calcularTasaCrecimientoAnual,
  getColorPorNivel 
} from '../utils/dashboardUtils';
import { NIVELES_ACADEMICOS } from '../constants/dashboardConstants';

export const useEstadisticasPorNivel = (matriculaFilteredData) => {
  return useMemo(() => {
    // Agregar "Total" como primer elemento para mostrar tarjeta general
    const nivelesConMatricula = ['Total', ...NIVELES_ACADEMICOS];
    
    // Obtener valores únicos de la columna nivel para debug
    const nivelesUnicos = [...new Set(matriculaFilteredData.map(item => item.nivel).filter(Boolean))];
    console.log('Niveles únicos encontrados en los datos:', nivelesUnicos);
    
    return nivelesConMatricula.map(nivelActual => {
      let datosNivel;
      
      if (nivelActual === 'Total') {
        // Para "Total", incluir todos los datos sin filtrar por nivel
        datosNivel = matriculaFilteredData;
      } else {
        // Para todos los demás niveles, usar coincidencia exacta
        datosNivel = matriculaFilteredData.filter(item => 
          item.nivel && item.nivel === nivelActual
        );
      }
      
      // Calcular total matriculados
      const totalMatriculados = datosNivel.reduce((sum, item) => 
        sum + (parseInt(item.matriculados) || 0), 0
      );
      
      // Agrupar por periodo para calcular TCA
      const datosPorPeriodo = {};
      datosNivel.forEach(item => {
        const periodo = item.periodo;
        if (!datosPorPeriodo[periodo]) {
          datosPorPeriodo[periodo] = 0;
        }
        datosPorPeriodo[periodo] += parseInt(item.matriculados) || 0;
      });
      
      // Calcular TCA promedio
      const periodos = Object.keys(datosPorPeriodo).sort();
      let tcaTotal = 0;
      let contadorTCA = 0;
      
      periodos.forEach(periodo => {
        const periodoActual = parsearPeriodo(periodo);
        if (periodoActual) {
          const periodoAnterior = `${periodoActual.año - 1}-${periodoActual.semestre}`;
          if (datosPorPeriodo[periodoAnterior]) {
            const tca = calcularTasaCrecimientoAnual(
              datosPorPeriodo[periodo], 
              datosPorPeriodo[periodoAnterior]
            );
            tcaTotal += tca;
            contadorTCA++;
          }
        }
      });
      
      const tcaPromedio = contadorTCA > 0 ? tcaTotal / contadorTCA : 0;
      
      return {
        nivel: nivelActual,
        totalMatriculados,
        tcaPromedio: tcaPromedio.toFixed(2),
        color: getColorPorNivel(nivelActual)
      };
    });
  }, [matriculaFilteredData]);
};
