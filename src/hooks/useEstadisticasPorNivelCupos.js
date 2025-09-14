import { useMemo } from 'react';
import { 
  calcularTasaAsignacion,
  getColorPorNivel 
} from '../utils/dashboardUtils';
import { NIVELES_ACADEMICOS } from '../constants/dashboardConstants';

export const useEstadisticasPorNivelCupos = (cuposFilteredData) => {
  return useMemo(() => {
    // Agregar "Total" como primer elemento para mostrar tarjeta general
    const nivelesConMatricula = ['Total', ...NIVELES_ACADEMICOS];
    
    // Obtener valores únicos de la columna nivel para debug
    const nivelesUnicos = [...new Set(cuposFilteredData.map(item => item.nivel).filter(Boolean))];
    console.log('Niveles únicos encontrados en los datos de cupos:', nivelesUnicos);
    
    return nivelesConMatricula.map(nivelActual => {
      let datosNivel;
      
      if (nivelActual === 'Total') {
        // Para "Total", incluir todos los datos sin filtrar por nivel
        datosNivel = cuposFilteredData;
      } else {
        // Para todos los demás niveles, usar coincidencia exacta
        datosNivel = cuposFilteredData.filter(item => 
          item.nivel && item.nivel === nivelActual
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
