import React, { useState, useMemo } from 'react';
import {
  Box,
  Fade,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SummarizeIcon from '@mui/icons-material/Summarize';
import StarIcon from '@mui/icons-material/Star';
import ModernRiskChip from '../common/ModernRiskChip';
import RiskValue from '../common/RiskValue';
import FilterPanel from '../common/FilterPanel';

// Vista específica del proceso de Acreditación (AAC)
const Acreditacion = ({
  counts,
  riskConfig,
  programDetails,
  isLoading,
  handleGenerateReport,
  handleBackClick,
  handleNavigateToProgram,
  handleRiskCardClick,
  selectedRisk,
  setSelectedRisk,
  filteredByRisk,
  setFilteredByRisk
}) => {
  const proceso = 'AAC';
  const programas = programDetails[proceso] || [];
  console.log('Programas AAC:', programas);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [filteredByEstado, setFilteredByEstado] = useState(false);
  
  // Estados para ordenamiento
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  
  // Estados para filtrado
  const [filters, setFilters] = useState({
    'programa académico': [],
    'escuela': [],
    // 'riesgo': [],
    'estadoaac': [],
    'tiempo':[],
    'pregrado/posgrado': []
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  // Función para manejar el ordenamiento
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Función de comparación para ordenamiento
  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  // Función para manejar filtros
  const handleFilterChange = (column, values) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [column]: values
      };
      
      // Si se cambia la escuela y no hay exactamente una escuela seleccionada,
      // limpiar el filtro de programa académico
      if (column === 'escuela' && (!values || values.length !== 1)) {
        newFilters['programa académico'] = [];
      }
      
      return newFilters;
    });
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
      'programa académico': [],
      'escuela': [],
      // 'riesgo': [],
      'estadoaac': [],
      'tiempo':[],
      'pregrado/posgrado': []
    });
  };

  // Obtener opciones únicas para los filtros
  const getUniqueOptions = (key, filteredPrograms = programas) => {
    const uniqueValues = [...new Set(filteredPrograms.map(p => p[key]).filter(Boolean))];
    return uniqueValues.map(value => ({
      value: value,
      label: value,
      count: filteredPrograms.filter(p => p[key] === value).length
    }));
  };

  // Obtener programas filtrados por escuela (para el filtro de programa)
  const getProgramsBySelectedSchools = () => {
    if (!filters.escuela || filters.escuela.length === 0) {
      return programas;
    }
    return programas.filter(program => filters.escuela.includes(program.escuela));
  };

  // Configuración de opciones para el filtro
  const filterOptions = [
    {
      key: 'programa académico',
      label: 'Programa Académico',
      options: getUniqueOptions('programa académico', getProgramsBySelectedSchools()),
      condition: (currentFilters) => {
        // Solo mostrar el filtro de programa si se ha seleccionado exactamente UNA escuela
        return currentFilters.escuela && currentFilters.escuela.length === 1;
      }
    },
    {
      key: 'escuela',
      label: 'Escuela',
      options: getUniqueOptions('escuela')
    },
    /* {
      key: 'riesgo',
      label: 'Riesgo',
      options: getUniqueOptions('riesgo')
    }, */
     {
          key: 'tiempo',
          label: 'Tiempo',
          options: [
            {value: '4Años', label: '4 Años antes del vencimiento', count: programas.filter(p => p['fase rrc'] === 'Fase 2' && (p.estadoaac === 'Vigente' || p.estadoaac === 'Vigente (En trámite)' || p.estadoaac === 'En trámite')).length },
            {value: '2Años', label: '2 Años antes del vencimiento', count: programas.filter(p => p['fase rrc'] === 'Fase 3' && (p.estadoaac === 'Vigente' || p.estadoaac === 'Vigente (En trámite)' || p.estadoaac === 'En trámite')).length },
            {value: '18Meses', label: '18 Meses antes del vencimiento', count: programas.filter(p => p['fase rrc'] === 'Fase 4' && (p.estadoaac === 'Vigente' || p.estadoaac === 'Vigente (En trámite)' || p.estadoaac === 'En trámite')).length },
            {value: '1Año', label: 'Año del vencimiento', count: programas.filter(p => p['fase rrc'] === 'Fase 5' && (p.estadoaac === 'Vigente' || p.estadoaac === 'Vigente (En trámite)' || p.estadoaac === 'En trámite')).length }
          ]
        },
        {
          key:'pregrado/posgrado',
          label:'Pregrado',
          options:[
            { value: 'Pregrado', label: 'Universitario', count: programas.filter(p => p['nivel de formación'] === 'Universitario' ).length },
            { value: 'Pregrado', label: 'Tecnológico', count: programas.filter(p => p['nivel de formación'] === 'Tecnológico').length }
              
            ]
          },
         {
          key:'pregrado/posgrado',
          label:'Posgrado',
          options:[
            { value: 'PosgradoM', label: 'Maestría', count: programas.filter(p => p['nivel de formación'] === 'Maestría' ).length },
            { value: 'PosgradoD', label: 'Doctorado', count: programas.filter(p => p['nivel de formación'] === 'Doctorado').length },
            { value: 'PosgradoE', label: 'Especialización Universitaria', count: programas.filter(p => p['nivel de formación'] === 'Especialización Universitaria').length },
            { value: 'PosgradoEspM', label: 'Especialización Médico Quirúrgica', count: programas.filter(p => p['nivel de formación'] === 'Especialización Médico Quirúrgica').length }
              
            ]
          }
  ];

  // Función para filtrar programas
  const filterPrograms = (programs) => {
    return programs.filter(program => {
      return Object.keys(filters).every(key => {
        const selectedValues = filters[key];
        if (!selectedValues || selectedValues.length === 0) return true;
        
        return selectedValues.includes(program[key]);
      });
    });
  };

  // Programas filtrados y ordenados
  const sortedProgramas = useMemo(() => {
    const filtered = filterPrograms(programas);
    if (!orderBy) return filtered;
    
    return [...filtered].sort(getComparator(order, orderBy));
  }, [programas, order, orderBy, filters]);

  const estadoCounts = useMemo(() => {
    const base = {
      vigentes: 0,
      noVigentes: 0,
      vigentesPregrado: 0,
      vigentesPosgrado: 0
    };
    programas.forEach(program => {
      const estado = program?.estadoaac;
      const isVigente =
        estado === 'Vigente' ||
        estado === 'Vigente (En trámite)' ||
        estado === 'En trámite';

      if (isVigente) {
        base.vigentes += 1;
        const nivel = program['pregrado/posgrado'];
        if (nivel === 'Pregrado') base.vigentesPregrado += 1;
        if (nivel === 'Posgrado') base.vigentesPosgrado += 1;
      } else {
        base.noVigentes += 1;
      }
    });
    return base;
  }, [programas]);

  const estadoLabelMap = {
    vigentes: 'Vigente / En trámite',
    noVigentes: 'No vigente / Sin registro',
    vigentesPregrado: 'Vigentes Pregrado',
    vigentesPosgrado: 'Vigentes Posgrado'
  };

  const handleEstadoCardClick = (estadoKey) => {
    if (selectedEstado === estadoKey) {
      setSelectedEstado(null);
      setFilteredByEstado(false);
      return;
    }

    setSelectedEstado(estadoKey);
    setFilteredByEstado(true);
  };

  const isVigenteEstado = (estado) => (
    estado === 'Vigente' ||
    estado === 'Vigente (En trámite)' ||
    estado === 'En trámite'
  );

  const statusFilteredProgramas = filteredByEstado
    ? sortedProgramas.filter(program => {
        const vigente = isVigenteEstado(program?.estadoaac);
        if (selectedEstado === 'vigentes') return vigente;
        if (selectedEstado === 'noVigentes') return !vigente;
        if (selectedEstado === 'vigentesPregrado') {
          return vigente && program['pregrado/posgrado'] === 'Pregrado';
        }
        if (selectedEstado === 'vigentesPosgrado') {
          return vigente && program['pregrado/posgrado'] === 'Posgrado';
        }
        return true;
      })
    : sortedProgramas;
  const visibleProgramas = filteredByRisk
    ? statusFilteredProgramas.filter(p => p.riesgo === selectedRisk)
    : statusFilteredProgramas;

  return (
    <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
      <Fade in timeout={400}>
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '1200px' } }}>
          {/* Header con título y acciones */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, #B22222 0%, #DC143C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(178, 34, 34, 0.3)' }}>
                <StarIcon sx={{ color: 'white', fontSize: '24px' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#B22222',
                  fontSize: '1.75rem',
                  letterSpacing: '-0.02em'
                }}>
                  Programas en Proceso de Acreditación
                </Typography>
                <Typography variant="body1" sx={{ color: '#6C757D', fontSize: '1rem', mt: 0.5 }}>
                  Análisis detallado de riesgos y programas (AAC)
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SummarizeIcon />}
                onClick={() => handleGenerateReport(proceso)}
                disabled={isLoading}
                sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
              >
                {isLoading ? 'Generando...' : 'Generar Reporte'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleBackClick}
                startIcon={<KeyboardBackspaceIcon />}
                sx={{ borderColor: '#B22222', color: '#B22222', fontWeight: 600 }}
              >
                Volver
              </Button>
            </Box>
          </Box>

          {/* Cards de métricas por estado */}
          <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
            {[
              {
                key: 'vigentes',
                label: 'Vigentes / En trámite',
                value: estadoCounts.vigentes,
                color: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                borderColor: 'rgba(46, 125, 50, 0.2)'
              },
              {
                key: 'noVigentes',
                label: 'No vigentes/Sin registro',
                value: estadoCounts.noVigentes,
                color: '#C62828',
                backgroundColor: 'rgba(198, 40, 40, 0.08)',
                borderColor: 'rgba(198, 40, 40, 0.2)'
              },
              {
                key: 'vigentesPregrado',
                label: 'Vigentes Pregrado',
                value: estadoCounts.vigentesPregrado,
                color: '#1565C0',
                backgroundColor: 'rgba(21, 101, 192, 0.08)',
                borderColor: 'rgba(21, 101, 192, 0.2)'
              },
              {
                key: 'vigentesPosgrado',
                label: 'Vigentes Posgrado',
                value: estadoCounts.vigentesPosgrado,
                color: '#00838F',
                backgroundColor: 'rgba(0, 131, 143, 0.08)',
                borderColor: 'rgba(0, 131, 143, 0.2)'
              }
            ].map((card) => {
              const isSelected = selectedEstado === card.key;
              return (
                <Grid item xs={12} sm={6} md={3} key={card.key}>
                  <Card
                    elevation={0}
                    onClick={() => handleEstadoCardClick(card.key)}
                    sx={{
                      borderRadius: '20px',
                      border: `2px solid ${isSelected ? card.color : card.borderColor}`,
                      backgroundColor: card.backgroundColor,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" sx={{ color: card.color, fontWeight: 600, fontSize: '1.125rem' }}>
                          {card.label}
                        </Typography>
                      </Box>
                      <Typography variant="h2" sx={{ fontWeight: 800, color: card.color, fontSize: '3rem', lineHeight: 1, mb: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: card.color, fontSize: '0.875rem', fontWeight: 500 }}>
                        {card.value === 1 ? 'programa' : 'programas'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Cards de métricas por riesgo */}
          {/* <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
            {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => {
              const config = riskConfig[risk];
              const count = counts[proceso][risk];
              const isSelected = selectedRisk === risk;
              return (
                <Grid item xs={12} sm={6} md={3} key={risk}>
                  <Card 
                    elevation={0}
                    onClick={() => handleRiskCardClick(risk)}
                    sx={{ 
                      borderRadius: '20px',
                      border: `2px solid ${isSelected ? config.color : config.borderColor}`,
                      backgroundColor: isSelected ? (config.backgroundColor || 'transparent') : (config.backgroundColor || 'transparent'),
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" sx={{ color: config.color, fontWeight: 600, fontSize: '1.125rem' }}>
                          {risk === 'SinRegistro' ? 'Sin Registro' : `${risk} Riesgo`}
                        </Typography>
                        <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: config.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {config.icon ? React.cloneElement(config.icon, { sx: { color: 'white', fontSize: '20px' } }) : null}
                        </Box>
                      </Box>
                      <Typography variant="h2" sx={{ fontWeight: 800, color: config.color, fontSize: '3rem', lineHeight: 1, mb: 1 }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" sx={{ color: config.color, fontSize: '0.875rem', fontWeight: 500 }}>
                        {count === 1 ? 'programa' : 'programas'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid> */}

          {/* Tabla de programas */}
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)' }}>
            <Box sx={{ p: 3, background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', fontSize: '1.25rem' }}>
                  Listado de Programas (AAC)
                  {filteredByRisk && selectedRisk && (
                    <span style={{ color: riskConfig[selectedRisk].color, marginLeft: '10px' }}>
                      • Filtrado por riesgo: {selectedRisk === 'SinRegistro' ? 'Sin Registro' : `${selectedRisk} Riesgo`}
                    </span>
                  )}
                  {filteredByEstado && selectedEstado && (
                    <span style={{ color: '#6C757D', marginLeft: '10px' }}>
                      • Estado: {estadoLabelMap[selectedEstado]}
                    </span>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6C757D', mt: 0.5 }}>
                  {`${visibleProgramas.length} programa${visibleProgramas.length !== 1 ? 's' : ''} encontrado${visibleProgramas.length !== 1 ? 's' : ''}`}
                </Typography>
              </div>
              {selectedRisk && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => { setSelectedRisk(null); setFilteredByRisk(false); }}
                  sx={{ borderColor: '#6C757D', color: '#6C757D' }}
                >
                  Limpiar filtro riesgo
                </Button>
              )}
            </Box>

            {/* Filtro de Riesgo (Radio Buttons) */}
            <Box sx={{ px: 3, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#495057' }}>
                Filtrar por Riesgo:
              </Typography>
              <RadioGroup
                row
                value={selectedRisk || 'Todos'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Todos') {
                    setSelectedRisk(null);
                    setFilteredByRisk(false);
                  } else {
                    setSelectedRisk(val);
                    setFilteredByRisk(true);
                  }
                }}
              >
                <FormControlLabel value="Todos" control={<Radio size="small" sx={{ color: '#6C757D', '&.Mui-checked': { color: '#6C757D' } }} />} label="Todos" />
                <FormControlLabel value="Alto" control={<Radio size="small" sx={{ color: '#DC3545', '&.Mui-checked': { color: '#DC3545' } }} />} label="Alto" />
                <FormControlLabel value="Medio" control={<Radio size="small" sx={{ color: '#FF8C00', '&.Mui-checked': { color: '#FF8C00' } }} />} label="Medio" />
                <FormControlLabel value="Bajo" control={<Radio size="small" sx={{ color: '#28A745', '&.Mui-checked': { color: '#28A745' } }} />} label="Bajo" />
                <FormControlLabel value="SinRegistro" control={<Radio size="small" sx={{ color: '#6C757D', '&.Mui-checked': { color: '#6C757D' } }} />} label="Sin Registro" />
              </RadioGroup>
            </Box>

            {/* Panel de filtros */}
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
              filterOptions={filterOptions}
              isOpen={filterPanelOpen}
              onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
              title="Filtros de Programas AAC"
            />

            <TableContainer component={Paper} elevation={0} sx={{ width: '100%', overflowX: 'auto' }}>
              <Table aria-label="lista de programas AAC" sx={{ tableLayout: { xs: 'auto', md: 'fixed' }, width: '100%' }}>
                <TableHead>
                  <TableRow>
                    {[
                      { key: 'programa académico', label: 'Programa Académico' },
                      { key: 'escuela', label: 'Escuela' },
                      { key: 'nivel de formación', label: 'Nivel' },
                      { key: 'riesgo', label: 'Riesgo' },
                      { key: 'mensaje', label: 'Observaciones' }
                    ].map((column) => (
                      <TableCell 
                        key={column.key} 
                        sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#495057', backgroundColor: '#F8F9FA' }}
                        sortDirection={orderBy === column.key ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === column.key}
                          direction={orderBy === column.key ? order : 'asc'}
                          onClick={() => handleSort(column.key)}
                          sx={{
                            '& .MuiTableSortLabel-icon': {
                              color: orderBy === column.key ? '#B22222' : 'inherit',
                            },
                            '&.Mui-active': {
                              color: '#B22222',
                              '& .MuiTableSortLabel-icon': {
                                color: '#B22222',
                              },
                            },
                          }}
                        >
                          {column.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleProgramas.map((program) => (
                    <TableRow 
                      key={program.id_programa}
                      hover 
                      onClick={() => handleNavigateToProgram(program)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                          {program['programa académico']}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6C757D', fontSize: '0.875rem' }}>
                          {program.escuela}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6C757D', fontSize: '0.875rem' }}>
                          {program['nivel de formación']}
                        </Typography>
                      </TableCell>
                      {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => program.riesgo === risk && (
                    <TableCell key={risk} sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                      <RiskValue risk={risk} value={program.riesgo} riskConfig={riskConfig} />
                    </TableCell>
                  ))}
                      <TableCell>
                        <Tooltip title={program.mensaje} arrow placement="top">
                          <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#6C757D', fontSize: '0.875rem', cursor: 'help' }}>
                            {program.mensaje}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Fade>
    </Box>
  );
};

export default Acreditacion;


