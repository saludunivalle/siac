import { useMemo } from 'react';
import { parsearPeriodo, calcularTasaCrecimientoAnual } from '../utils/dashboardUtils';

export const useTablaMatriculaData = (matriculaFilteredData) => {
  return useMemo(() => {
    // Validar que tenemos datos
    if (!matriculaFilteredData || matriculaFilteredData.length === 0) {
      return [];
    }
    
    // Detectar claves reales según el dataset recibido
    const sample = matriculaFilteredData[0] || {};
    const normalize = (value) => (value || '').toString().toLowerCase().replace(/\s|_/g, '');
    const findKey = (target) => Object.keys(sample).find(k => normalize(k) === target) || null;

    const codPlanKey = findKey('codplan') || 'codPlan';
    const planKey = findKey('plan') || 'plan';
    const nivelKey = findKey('nivel') || 'nivel';
    const periodoKey = findKey('periodo') || 'periodo';
    const matriculadosKey = findKey('matriculados') || 'matriculados';

    const datosPorPrograma = {};
    
    matriculaFilteredData.forEach(item => {
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
          periodos: {},
          totalMatriculados: 0
        };
      }
      
      const periodo = item[periodoKey];
      const matriculados = parseInt(item[matriculadosKey]) || 0;
      datosPorPrograma[codPrograma].periodos[periodo] = matriculados;
      datosPorPrograma[codPrograma].totalMatriculados += matriculados;
    });

    // Calcular TCA para cada programa
    return Object.values(datosPorPrograma).map(programa => {
      const periodos = Object.keys(programa.periodos).sort();
      let tcaAnualPromedio = 0;
      let contadorTCA = 0;

      // Calcular TCA anual promedio
      periodos.forEach(periodo => {
        const periodoActual = parsearPeriodo(periodo);
        if (periodoActual) {
          const periodoAnterior = `${periodoActual.año - 1}-${periodoActual.semestre}`;
          if (programa.periodos[periodoAnterior]) {
            const tca = calcularTasaCrecimientoAnual(
              programa.periodos[periodo], 
              programa.periodos[periodoAnterior]
            );
            tcaAnualPromedio += tca;
            contadorTCA++;
          }
        }
      });

      tcaAnualPromedio = contadorTCA > 0 ? tcaAnualPromedio / contadorTCA : 0;

      return {
        ...programa,
        tcaAnualPromedio: tcaAnualPromedio.toFixed(2)
      };
    });
  }, [matriculaFilteredData]);
};
