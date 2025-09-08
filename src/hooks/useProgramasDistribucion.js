import { useMemo } from 'react';

/**
 * Hook personalizado para procesar la distribución de programas por nivel de formación
 * y categoría de crecimiento usando los datos de la tabla de indicadores y datos originales
 */
export const useProgramasDistribucion = (datosTablaMatricula, matriculaFilteredData) => {
  return useMemo(() => {
    if (!datosTablaMatricula || datosTablaMatricula.length === 0 || !matriculaFilteredData) {
      return {
        distributionData: [],
        chartData: {
          labels: [],
          datasets: []
        }
      };
    }

    // Debug básico
    console.log('Procesando distribución:', datosTablaMatricula.length, 'programas');
    
    // Niveles de formación que queremos analizar
    const nivelesFormacion = [
      'Especialización',
      'Especialización Médico Quirúrgica', 
      'Maestría',
      'Doctorado'
    ];

    // Inicializar contadores para cada nivel
    const distribucion = {
      'Especialización': { crecimiento: 0, decrecimiento: 0, neutro: 0 },
      'Especialización Médico Quirúrgica': { crecimiento: 0, decrecimiento: 0, neutro: 0 },
      'Maestría': { crecimiento: 0, decrecimiento: 0, neutro: 0 },
      'Doctorado': { crecimiento: 0, decrecimiento: 0, neutro: 0 }
    };

    // Procesar cada programa de la tabla
    datosTablaMatricula.forEach(programa => {
      const tcaPromedio = parseFloat(programa.tcaAnualPromedio) || 0;
      
      // Obtener el nivel del programa directamente de la tabla
      let nivelPrograma = programa.nivel;
      
      // Si no está disponible, intentar determinar por nombre
      if (!nivelPrograma) {
        nivelPrograma = determinarNivelPrograma(programa.programa);
      }
      
      if (!nivelesFormacion.includes(nivelPrograma)) {
        return; // Saltar si no es un nivel de posgrado
      }

      // Categorizar según TCA promedio
      if (tcaPromedio > 5) {
        distribucion[nivelPrograma].crecimiento++;
      } else if (tcaPromedio < -5) {
        distribucion[nivelPrograma].decrecimiento++;
      } else {
        distribucion[nivelPrograma].neutro++;
      }
    });

    // Log final de distribución
    console.log('Distribución calculada:', distribucion);

    // Preparar datos para el gráfico de barras horizontal
    const chartData = {
      labels: nivelesFormacion,
      datasets: [
        {
          label: 'Crecimiento',
          data: nivelesFormacion.map(nivel => distribucion[nivel].crecimiento),
          backgroundColor: 'rgba(46, 125, 50, 0.8)', // Verde oscuro
          borderColor: 'rgba(46, 125, 50, 1)',
          borderWidth: 1
        },
        {
          label: 'Neutro',
          data: nivelesFormacion.map(nivel => distribucion[nivel].neutro),
          backgroundColor: 'rgba(230, 126, 34, 0.8)', // Naranja
          borderColor: 'rgba(230, 126, 34, 1)',
          borderWidth: 1
        },
        {
          label: 'Decrecimiento',
          data: nivelesFormacion.map(nivel => distribucion[nivel].decrecimiento),
          backgroundColor: 'rgba(178, 34, 34, 0.8)', // Rojo sangre toro
          borderColor: 'rgba(178, 34, 34, 1)',
          borderWidth: 1
        }
      ]
    };

    return {
      distributionData: distribucion,
      chartData
    };
  }, [datosTablaMatricula, matriculaFilteredData]);
};

/**
 * Función para determinar el nivel de un programa basado en su nombre
 * Esta es una aproximación - idealmente se debería tener el campo nivel directamente
 */
const determinarNivelPrograma = (nombrePrograma) => {
  if (!nombrePrograma) return 'Otros';
  
  const nombre = nombrePrograma.toLowerCase();
  
  if (nombre.includes('especialización médico') || nombre.includes('especialización medico')) {
    return 'Especialización Médico Quirúrgica';
  } else if (nombre.includes('especialización')) {
    return 'Especialización';
  } else if (nombre.includes('maestría') || nombre.includes('maestria') || nombre.includes('magister')) {
    return 'Maestría';
  } else if (nombre.includes('doctorado') || nombre.includes('phd') || nombre.includes('doctor')) {
    return 'Doctorado';
  }
  
  return 'Otros';
};
