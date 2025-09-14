import { INDICADORES_CONFIG, INDICADORES_ASIGNACION, INDICADORES_DEMANDA } from '../constants/dashboardConstants';

/**
 * Función para calcular tasa de crecimiento anual
 * @param {number} datosActuales - Datos del período actual
 * @param {number} datosAnteriores - Datos del período anterior
 * @returns {number} Tasa de crecimiento en porcentaje
 */
export const calcularTasaCrecimientoAnual = (datosActuales, datosAnteriores) => {
  if (!datosAnteriores || datosAnteriores === 0) return 0;
  return ((datosActuales - datosAnteriores) / datosAnteriores) * 100;
};

/**
 * Función para calcular tasa de crecimiento semestral
 * @param {number} datosActuales - Datos del período actual
 * @param {number} datosAnteriores - Datos del período anterior
 * @returns {number} Tasa de crecimiento en porcentaje
 */
export const calcularTasaCrecimientoSemestral = (datosActuales, datosAnteriores) => {
  if (!datosAnteriores || datosAnteriores === 0) return 0;
  return ((datosActuales - datosAnteriores) / datosAnteriores) * 100;
};

/**
 * Función para parsear periodo (ej: "2024-1" -> {año: 2024, semestre: 1})
 * @param {string} periodo - Periodo en formato "YYYY-S"
 * @returns {Object|null} Objeto con año y semestre o null si es inválido
 */
export const parsearPeriodo = (periodo) => {
  if (!periodo) return null;
  const partes = periodo.toString().split('-');
  if (partes.length !== 2) return null;
  return {
    año: parseInt(partes[0]),
    semestre: parseInt(partes[1])
  };
};

/**
 * Función para determinar el indicador basado en TCA
 * @param {number} tcaAnualPromedio - Tasa de crecimiento anual promedio
 * @returns {Object} Objeto con label, color e icon del indicador
 */
export const getIndicadorMatricula = (tcaAnualPromedio) => {
  const tca = parseFloat(tcaAnualPromedio);
  
  if (tca > 0) {
    return INDICADORES_CONFIG.crecimiento;
  } else if (tca < 0) {
    return INDICADORES_CONFIG.decrecimiento;
  } else {
    return INDICADORES_CONFIG.neutro;
  }
};

/**
 * Función para asignar colores por nivel académico
 * @param {string} nivel - Nivel académico
 * @returns {string} Color gradient CSS
 */
export const getColorPorNivel = (nivel) => {
  const colorMap = {
    'Total': 'linear-gradient(135deg, #B22222 0%, #8B0000 100%)', // Rojo sangre toro
    'Especialización': 'linear-gradient(135deg, #4A4A4A 0%, #2F2F2F 100%)', // Gris oscuro
    'Especialidad médico quirúrgica': 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)', // Rojo intenso
    'Maestría': 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', // Verde oscuro
    'Doctorado': 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)', // Naranja
  };
  
  return colorMap[nivel] || 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
};

/**
 * Función para filtrar datos según criterios específicos
 * @param {Array} datos - Array de datos a filtrar
 * @param {Object} filtros - Objeto con criterios de filtrado
 * @returns {Array} Datos filtrados
 */
export const filtrarDatos = (datos, filtros) => {
  return datos.filter(item => {
    const {
      selectedYear = 'Todos',
      selectedSemester = 'Todos',
      selectedNivel = 'Todos'
    } = filtros;

    const yearMatch = selectedYear === 'Todos' || item.año === selectedYear;
    const semesterMatch = selectedSemester === 'Todos' || item.semestre === selectedSemester;
    const nivelMatch = selectedNivel === 'Todos' || item.nivel === selectedNivel;
    
    return yearMatch && semesterMatch && nivelMatch;
  });
};

/**
 * Función para filtrar datos de matrícula con criterios específicos
 * @param {Array} datos - Array de datos a filtrar
 * @param {Object} filtros - Objeto con criterios de filtrado específicos para matrícula
 * @returns {Array} Datos filtrados
 */
export const filtrarDatosMatricula = (datos, filtros) => {
  return datos.filter(item => {
    const {
      yearRange,
      selectedNivel = 'Todos',
      selectedPrograma = 'Todos',
      selectedPeriodo = 'Todos'
    } = filtros;

    const parsedPeriodo = parsearPeriodo(item.periodo);
    if (!parsedPeriodo) return false;
    
    const yearInRange = parsedPeriodo.año >= yearRange[0] && parsedPeriodo.año <= yearRange[1];
    const nivelMatch = selectedNivel === 'Todos' || item.nivel === selectedNivel;
    const programaMatch = selectedPrograma === 'Todos' || item.plan === selectedPrograma;
    const periodoMatch = selectedPeriodo === 'Todos' || item.periodo === selectedPeriodo;
    
    return yearInRange && nivelMatch && programaMatch && periodoMatch;
  });
};

/**
 * Función para obtener arrays únicos de propiedades
 * @param {Array} datos - Array de datos
 * @param {string} propiedad - Propiedad a extraer
 * @returns {Array} Array único y ordenado
 */
export const obtenerValoresUnicos = (datos, propiedad) => {
  return [...new Set(datos.map(item => item[propiedad]).filter(Boolean))].sort();
};

/**
 * Función para calcular estadísticas básicas
 * @param {Array} datos - Array de datos
 * @param {string} campo - Campo numérico a sumar
 * @returns {number} Suma total
 */
export const calcularTotal = (datos, campo) => {
  return datos.reduce((sum, item) => sum + (parseInt(item[campo]) || 0), 0);
};

/**
 * Función para calcular la tasa de asignación de cupos
 * @param {number} primeraVez - Número de estudiantes matriculados por primera vez
 * @param {number} cuposMax - Número máximo de cupos disponibles
 * @returns {number} Tasa de asignación en porcentaje
 */
export const calcularTasaAsignacion = (primeraVez, cuposMax) => {
  if (!cuposMax || cuposMax === 0) return 0;
  return (primeraVez / cuposMax) * 100;
};

/**
 * Función para determinar el indicador de asignación basado en la tasa
 * @param {number} tasaAsignacion - Tasa de asignación en porcentaje
 * @returns {Object} Objeto con label, color e icon del indicador
 */
export const getIndicadorAsignacion = (tasaAsignacion) => {
  const tasa = parseFloat(tasaAsignacion);
  
  if (tasa >= 100) {
    return INDICADORES_ASIGNACION.completa;
  } else if (tasa >= 50) {
    return INDICADORES_ASIGNACION.alta;
  } else {
    return INDICADORES_ASIGNACION.baja;
  }
};

/**
 * Función para filtrar datos de cupos con criterios específicos
 * @param {Array} datos - Array de datos a filtrar
 * @param {Object} filtros - Objeto con criterios de filtrado específicos para cupos
 * @returns {Array} Datos filtrados
 */
export const filtrarDatosCupos = (datos, filtros) => {
  return datos.filter(item => {
    const {
      yearRange,
      selectedNivel = 'Todos',
      selectedPrograma = 'Todos',
      selectedPeriodo = 'Todos'
    } = filtros;

    const parsedPeriodo = parsearPeriodo(item.periodo);
    if (!parsedPeriodo) return false;
    
    const yearInRange = parsedPeriodo.año >= yearRange[0] && parsedPeriodo.año <= yearRange[1];
    const nivelMatch = selectedNivel === 'Todos' || item.nivel === selectedNivel;
    const programaMatch = selectedPrograma === 'Todos' || item.plan === selectedPrograma;
    const periodoMatch = selectedPeriodo === 'Todos' || item.periodo === selectedPeriodo;
    
    return yearInRange && nivelMatch && programaMatch && periodoMatch;
  });
};

/**
 * Calcula tasa de inscripción = inscritos / cupos * 100
 */
export const calcularTasaInscripcion = (inscritos, cupos) => {
  const inscritosNum = parseInt(inscritos) || 0;
  const cuposNum = parseInt(cupos) || 0;
  if (!cuposNum || cuposNum === 0) return 0;
  return (inscritosNum / cuposNum) * 100;
};

/**
 * Determina indicador de demanda para un agregado (inscritos vs cupos mínimos/máximos)
 */
export const getIndicadorDemanda = ({ inscritos = 0, cuposMin = 0, cuposMax = 0 }) => {
  const ins = parseInt(inscritos) || 0;
  const cMin = parseInt(cuposMin) || 0;
  const cMax = parseInt(cuposMax) || 0;

  if (cMin === 0 && cMax === 0) return INDICADORES_DEMANDA.sinOferta;
  if (ins === 0) return INDICADORES_DEMANDA.sinInscritos;
  if (ins > cMax && cMax > 0) return INDICADORES_DEMANDA.alta;
  if (ins >= cMin && ins <= cMax && cMin > 0 && cMax > 0) return INDICADORES_DEMANDA.moderada;
  if (ins < cMin && cMin > 0) return INDICADORES_DEMANDA.baja;
  // Fallback
  return INDICADORES_DEMANDA.moderada;
};
