import { useMemo } from 'react';
import { 
  parsearPeriodo, 
  calcularTasaCrecimientoAnual,
  getColorPorNivel,
  getColorPorEscuela
} from '../utils/dashboardUtils';
import { ESCUELAS } from '../constants/dashboardConstants';

export const useEstadisticasPorEscuela = (matriculaFilteredData) => {
  return useMemo(() => {
    // Agregar "Total" como primer elemento para mostrar tarjeta general
    const escuelasConMatricula = ['Total', ...ESCUELAS];
    
    // Obtener valores únicos de la columna nivel para debug
    const escuelasUnicas = [...new Set(matriculaFilteredData.map(item => item.escuela).filter(Boolean))];
    console.log('Escuelas únicas encontrados en los datos:', escuelasUnicas);
    
    return escuelasConMatricula.map(escuelaActual => {
      let datosEscuela;
      
      if (escuelaActual === 'Total') {
        // Para "Total", incluir todos los datos sin filtrar por nivel
        datosEscuela = matriculaFilteredData;
      } else {
        // Para todos los demás niveles, usar coincidencia exacta
        datosEscuela = matriculaFilteredData.filter(item => 
          item.escuela && item.escuela === escuelaActual
        );
      }
      
      // Calcular total matriculados
      const totalMatriculados = datosEscuela.reduce((sum, item) => 
        sum + (parseInt(item.matriculados) || 0), 0
      );
      
      // Agrupar por periodo para calcular TCA
      const datosPorPeriodo = {};
      datosEscuela.forEach(item => {
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
        escuela: escuelaActual,
        totalMatriculados,
        tcaPromedio: tcaPromedio.toFixed(2),
        color: getColorPorEscuela(escuelaActual)
      };
    });
  }, [matriculaFilteredData]);
};
