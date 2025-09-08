import { useMemo } from 'react';
import { 
  calcularTasaAsignacion,
  getColorPorNivel 
} from '../utils/dashboardUtils';
import { NIVELES_ACADEMICOS } from '../constants/dashboardConstants';

export const useEstadisticasPorNivelCupos = (cuposFilteredData) => {
  return useMemo(() => {
    return NIVELES_ACADEMICOS.map(nivelActual => {
      let datosNivel;
      
      if (nivelActual === 'Matrícula') {
        // Para "Matrícula", incluir todos los datos sin filtrar por nivel
        datosNivel = cuposFilteredData;
      } else if (nivelActual === 'Especialización Médico Quirúrgica') {
        // Filtrar específicamente para especialización médico quirúrgica
        datosNivel = cuposFilteredData.filter(item => 
          item.nivel && item.nivel.toLowerCase().includes('médico') && 
          item.nivel.toLowerCase().includes('quirúrgica')
        );
      } else if (nivelActual === 'Especialización') {
        // Filtrar especialización pero excluir médico quirúrgica
        datosNivel = cuposFilteredData.filter(item => 
          item.nivel && item.nivel.toLowerCase().includes('especialización') &&
          !item.nivel.toLowerCase().includes('médico') &&
          !item.nivel.toLowerCase().includes('quirúrgica')
        );
      } else {
        // Para otros niveles, filtrar normalmente
        datosNivel = cuposFilteredData.filter(item => 
          item.nivel && item.nivel.toLowerCase().includes(nivelActual.toLowerCase())
        );
      }
      
      // Calcular totales de cupos y primera vez
      const totalCuposMax = datosNivel.reduce((sum, item) => 
        sum + (parseInt(item.cupos_max) || 0), 0
      );
      
      const totalPrimeraVez = datosNivel.reduce((sum, item) => 
        sum + (parseInt(item.primera_vez) || 0), 0
      );
      
      // Calcular tasa de asignación promedio
      const tasaAsignacion = calcularTasaAsignacion(totalPrimeraVez, totalCuposMax);
      
      return {
        nivel: nivelActual,
        totalCuposMax,
        totalPrimeraVez,
        tasaAsignacion: Math.round(tasaAsignacion * 100) / 100, // Redondear a 2 decimales
        color: getColorPorNivel(nivelActual)
      };
    });
  }, [cuposFilteredData]);
};
