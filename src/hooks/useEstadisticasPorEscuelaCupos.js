import { useMemo } from 'react';
import { 
  calcularTasaAsignacion,
  getColorPorEscuela 
} from '../utils/dashboardUtils';
import { ESCUELAS } from '../constants/dashboardConstants';

export const useEstadisticasPorEscuelaCupos = (cuposFilteredData) => {
  return useMemo(() => {
    // Agregar "Total" como primer elemento para mostrar tarjeta general
    const escuelasConMatricula = ['Total', ...ESCUELAS];
    
    // Obtener valores únicos de la columna nivel para debug
    const escuelasUnicas = [...new Set(cuposFilteredData.map(item => item.escuela).filter(Boolean))];
    console.log('Escuelas únicas encontrados en los datos de cupos:', escuelasUnicas);
    
    return escuelasConMatricula.map(escuelaActual => {
      let datosEscuela;
      
      if (escuelaActual === 'Total') {
        // Para "Total", incluir todos los datos sin filtrar por nivel
        datosEscuela = cuposFilteredData;
      } else {
        // Para todos los demás niveles, usar coincidencia exacta
        datosEscuela = cuposFilteredData.filter(item => 
          item.escuela && item.escuela === escuelaActual
        );
      }
      
      // Calcular totales de cupos y primera vez
      const totalCuposMax = datosEscuela.reduce((sum, item) => 
        sum + (parseInt(item.cupos_max) || 0), 0
      );
      
      const totalPrimeraVez = datosEscuela.reduce((sum, item) => 
        sum + (parseInt(item.primera_vez) || 0), 0
      );
      
      // Calcular tasa de asignación promedio
      const tasaAsignacion = calcularTasaAsignacion(totalPrimeraVez, totalCuposMax);
      
      return {
        escuela: escuelaActual,
        totalCuposMax,
        totalPrimeraVez,
        tasaAsignacion: Math.round(tasaAsignacion * 100) / 100, // Redondear a 2 decimales
        color: getColorPorEscuela(escuelaActual)
      };
    });
  }, [cuposFilteredData]);
};
