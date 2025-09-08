import { useMemo } from 'react';
import { 
  parsearPeriodo, 
  calcularTasaCrecimientoAnual,
  getColorPorNivel 
} from '../utils/dashboardUtils';
import { NIVELES_ACADEMICOS } from '../constants/dashboardConstants';

export const useEstadisticasPorNivel = (matriculaFilteredData) => {
  return useMemo(() => {
    return NIVELES_ACADEMICOS.map(nivelActual => {
      let datosNivel;
      
      if (nivelActual === 'Matrícula') {
        // Para "Matrícula", incluir todos los datos sin filtrar por nivel
        datosNivel = matriculaFilteredData;
      } else if (nivelActual === 'Especialización Médico Quirúrgica') {
        // Filtrar específicamente para especialización médico quirúrgica
        datosNivel = matriculaFilteredData.filter(item => 
          item.nivel && item.nivel.toLowerCase().includes('médico') && 
          item.nivel.toLowerCase().includes('quirúrgica')
        );
      } else if (nivelActual === 'Especialización') {
        // Filtrar especialización pero excluir médico quirúrgica
        datosNivel = matriculaFilteredData.filter(item => 
          item.nivel && item.nivel.toLowerCase().includes('especialización') &&
          !item.nivel.toLowerCase().includes('médico') &&
          !item.nivel.toLowerCase().includes('quirúrgica')
        );
      } else {
        // Para otros niveles, filtrar normalmente
        datosNivel = matriculaFilteredData.filter(item => 
          item.nivel && item.nivel.toLowerCase().includes(nivelActual.toLowerCase())
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
