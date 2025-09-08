import { useMemo } from 'react';
import { calcularTasaAsignacion } from '../utils/dashboardUtils';

export const useTablaCuposData = (cuposFilteredData) => {
  return useMemo(() => {
    // Validar que tenemos datos
    if (!cuposFilteredData || cuposFilteredData.length === 0) {
      return [];
    }
    
    // Detectar claves reales según el dataset recibido
    const sample = cuposFilteredData[0] || {};
    const normalize = (value) => (value || '').toString().toLowerCase().replace(/\s|_/g, '');
    const findKey = (target) => Object.keys(sample).find(k => normalize(k) === target) || null;

    const codPlanKey = findKey('codplan') || 'codPlan';
    const planKey = findKey('plan') || 'plan';
    const nivelKey = findKey('nivel') || 'nivel';
    const periodoKey = findKey('periodo') || 'periodo';
    const cuposMaxKey = findKey('cuposmax') || 'cupos_max';
    const primeraVezKey = findKey('primeravez') || 'primera_vez';

    const datosPorPrograma = {};
    
    cuposFilteredData.forEach(item => {
      // Separar correctamente código del programa y nombre del programa
      const rawCodPrograma = item[codPlanKey];
      const codPrograma = (rawCodPrograma !== undefined && rawCodPrograma !== null && rawCodPrograma !== '')
        ? String(rawCodPrograma)
        : 'N/A'; // Código del programa
      const programa = item[planKey]; // Nombre del programa académico
      const nivel = item[nivelKey] || item.Nivel;
      
      if (!datosPorPrograma[codPrograma]) {
        datosPorPrograma[codPrograma] = {
          codPrograma,
          programa,
          nivel,
          totalCuposMax: 0,
          totalPrimeraVez: 0
        };
      }
      
      const cuposMax = parseInt(item[cuposMaxKey]) || 0;
      const primeraVez = parseInt(item[primeraVezKey]) || 0;
      
      datosPorPrograma[codPrograma].totalCuposMax += cuposMax;
      datosPorPrograma[codPrograma].totalPrimeraVez += primeraVez;
    });

    // Calcular tasa de asignación para cada programa
    return Object.values(datosPorPrograma).map(programa => {
      const tasaAsignacion = calcularTasaAsignacion(programa.totalPrimeraVez, programa.totalCuposMax);

      return {
        ...programa,
        tasaAsignacion: Math.round(tasaAsignacion * 100) / 100 // Redondear a 2 decimales
      };
    });
  }, [cuposFilteredData]);
};
