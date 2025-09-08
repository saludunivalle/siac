import { INDICADORES_CONFIG } from '../constants/dashboardConstants';

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
    'Matrícula': 'linear-gradient(135deg, #B22222 0%, #8B0000 100%)', // Rojo sangre toro
    'Especialización': 'linear-gradient(135deg, #4A4A4A 0%, #2F2F2F 100%)', // Gris oscuro
    'Especialización Médico Quirúrgica': 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)', // Rojo intenso
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
      selectedPrograma = 'Todos'
    } = filtros;

    const parsedPeriodo = parsearPeriodo(item.periodo);
    if (!parsedPeriodo) return false;
    
    const yearInRange = parsedPeriodo.año >= yearRange[0] && parsedPeriodo.año <= yearRange[1];
    const nivelMatch = selectedNivel === 'Todos' || item.nivel === selectedNivel;
    const programaMatch = selectedPrograma === 'Todos' || item.plan === selectedPrograma;
    
    return yearInRange && nivelMatch && programaMatch;
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
