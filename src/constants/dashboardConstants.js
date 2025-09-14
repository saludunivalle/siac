// Constantes para el Dashboard de Estadísticas

export const NIVELES_ACADEMICOS = [
  'Especialización', 
  'Especialidad médico quirúrgica', 
  'Maestría', 
  'Doctorado'
];

export const CHART_COLORS = {
  primary: 'rgba(178, 34, 34, 0.8)', // Rojo sangre toro
  primaryBorder: 'rgba(178, 34, 34, 1)',
  secondary: 'rgba(74, 74, 74, 0.8)', // Gris oscuro
  secondaryBorder: 'rgba(74, 74, 74, 1)',
  tertiary: 'rgba(46, 125, 50, 0.8)', // Verde oscuro
  tertiaryBorder: 'rgba(46, 125, 50, 1)',
  quaternary: 'rgba(230, 126, 34, 0.8)', // Naranja
  quaternaryBorder: 'rgba(230, 126, 34, 1)',
  pieColors: [
    '#B22222', // Rojo sangre toro
    '#4A4A4A', // Gris oscuro
    '#2E7D32', // Verde oscuro
    '#E67E22', // Naranja
    '#8E24AA', // Púrpura oscuro
    '#D32F2F'  // Rojo intenso
  ]
};

export const NIVEL_COLORS = {
  'Total': 'linear-gradient(135deg, #B22222 0%, #8B0000 100%)', // Rojo sangre toro
  'Especialización': 'linear-gradient(135deg, #4A4A4A 0%, #2F2F2F 100%)', // Gris oscuro
  'Especialidad médico quirúrgica': 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)', // Rojo intenso
  'Maestría': 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', // Verde oscuro
  'Doctorado': 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)', // Naranja
  'default': 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
};

export const TABS_CONFIG = [
  {
    id: 0,
    label: 'Indicadores de Matrícula',
    key: 'matricula'
  },
  {
    id: 1,
    label: 'Indicadores de Cupos Asignados',
    key: 'cupos'
  },
  {
    id: 2,
    label: 'Indicadores de demanda',
    key: 'demanda'
  },
  {
    id: 3,
    label: 'Vista General',
    key: 'general'
  }
];

export const THEME_COLORS = {
  primary: '#B22222',
  background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  cardShadowHover: '0 12px 40px rgba(0, 0, 0, 0.3)'
};

export const INDICADORES_CONFIG = {
  crecimiento: {
    label: 'Crecimiento',
    color: 'success',
    icon: '📈'
  },
  decrecimiento: {
    label: 'Decrecimiento',
    color: 'error',
    icon: '📉'
  },
  neutro: {
    label: 'Neutro',
    color: 'default',
    icon: '➖'
  }
};

export const YEARS_RANGE = {
  DEFAULT_MIN: 2020,
  DEFAULT_MAX: 2024
};

export const INDICADORES_ASIGNACION = {
  completa: {
    label: 'Completa',
    color: 'success',
    icon: '✅',
    threshold: 100
  },
  alta: {
    label: 'Alta',
    color: 'warning',
    icon: '⚠️',
    threshold: 50
  },
  baja: {
    label: 'Baja',
    color: 'error',
    icon: '❌',
    threshold: 0
  }
};

// Indicadores de Demanda según relación inscritos vs cupos
export const INDICADORES_DEMANDA = {
  alta: { label: 'Alta', color: 'success', icon: '📈' },
  moderada: { label: 'Moderada', color: 'warning', icon: '⚖️' },
  baja: { label: 'Baja', color: 'error', icon: '📉' },
  sinOferta: { label: 'Sin oferta', color: 'default', icon: '⛔' },
  sinInscritos: { label: 'Sin inscritos', color: 'default', icon: '➖' }
};
