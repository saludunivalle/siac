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
  CircularProgress,
  alpha,
  TableSortLabel
} from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PublicIcon from '@mui/icons-material/Public';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ModernRiskChip from '../common/ModernRiskChip';
import FilterPanel from '../common/FilterPanel';

// Vista específica del proceso de Acreditación Internacional (INT)
const AcreditacionInternacional = ({
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
  setFilteredByRisk,
  processConfig,
  getTotalByProcess,
  loading
}) => {
  const proceso = 'INT';
  const programas = programDetails[proceso] || [];
  
  // Estados para ordenamiento
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  
  // Estados para filtrado
  const [filters, setFilters] = useState({
    'programa académico': [],
    'escuela': [],
    'riesgo': []
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

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
      'riesgo': []
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
    {
      key: 'riesgo',
      label: 'Riesgo',
      options: getUniqueOptions('riesgo')
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

  return (
    <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
      <Fade in timeout={400}>
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '1200px' } }}>
          {/* Header con título y botón de regreso */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.04)',
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #B22222 0%, #DC143C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(178, 34, 34, 0.3)'
              }}>
                {processConfig[proceso]?.icon && React.cloneElement(processConfig[proceso].icon, {
                  sx: { color: 'white', fontSize: '24px' }
                })}
              </Box>
              <Box>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#B22222',
                  fontSize: '1.75rem',
                  letterSpacing: '-0.02em',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  lineHeight: 1.2
                }}>
                  Programas con Acreditación Internacional
                </Typography>
                <Typography variant="body1" sx={{
                  color: '#6C757D',
                  fontSize: '1rem',
                  mt: 0.5
                }}>
                  Análisis detallado de riesgos y programas
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SummarizeIcon />}
                onClick={() => handleGenerateReport(proceso)}
                disabled={isLoading}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                {isLoading ? 'Generando...' : 'Generar Reporte'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleBackClick}
                startIcon={<KeyboardBackspaceIcon />}
                sx={{
                  borderColor: '#B22222',
                  color: '#B22222',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: '#8B1A1A',
                    backgroundColor: 'rgba(178, 34, 34, 0.04)',
                    color: '#8B1A1A'
                  }
                }}
              >
                Volver
              </Button>
            </Box>
          </Box>

          {/* Cards de métricas */}
          <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
            {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk, index) => {
              const config = riskConfig[risk];
              const count = counts[proceso][risk];

              return (
                <Grid item xs={12} sm={6} md={3} key={risk}>
                  <Card
                    elevation={0}
                    onClick={() => handleRiskCardClick(risk)}
                    sx={{
                      borderRadius: '20px',
                      border: `2px solid ${selectedRisk === risk ? config.color : config.borderColor}`,
                      backgroundColor: selectedRisk === risk ? alpha(config.color, 0.15) : config.backgroundColor,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: selectedRisk === risk ? 'translateY(-8px)' : 'translateY(0)',
                      boxShadow: selectedRisk === risk
                        ? `0 12px 32px ${alpha(config.color, 0.15)}`
                        : `0 2px 8px ${alpha(config.color, 0.08)}`,
                      cursor: 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: config.gradient,
                        borderRadius: '20px 20px 0 0'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" sx={{
                          color: config.color,
                          fontWeight: 600,
                          fontSize: '1.125rem',
                          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                        }}>
                          {risk === 'SinRegistro' ? 'Sin Registro' : `${risk} Riesgo`}
                        </Typography>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '12px',
                          background: config.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${alpha(config.color, 0.2)}`
                        }}>
                          {React.cloneElement(config.icon, {
                            sx: { color: 'white', fontSize: '20px' }
                          })}
                        </Box>
                      </Box>
                      <Typography variant="h2" sx={{
                        fontWeight: 800,
                        color: config.color,
                        fontSize: '3rem',
                        lineHeight: 1,
                        mb: 1,
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: alpha(config.color, 0.7),
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        {count === 1 ? 'programa' : 'programas'}
                      </Typography>
                      {/* Mostrar porcentaje */}
                      <Typography variant="body1" sx={{
                        color: config.color,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        mt: 1
                      }}>
                        {getTotalByProcess(proceso) > 0
                          ? `${((count / getTotalByProcess(proceso)) * 100).toFixed(1)}%`
                          : '0%'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Tabla de programas */}
          <Card sx={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.02)'
          }}>
            <Box sx={{
              p: 3,
              background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: '#212529',
                  fontSize: '1.25rem',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Listado de Programas
                  {selectedRisk && (
                    <span style={{
                      color: riskConfig[selectedRisk].color,
                      marginLeft: '10px'
                    }}>
                      • Filtrado por: {selectedRisk === 'SinRegistro' ? 'Sin Registro' : `${selectedRisk} Riesgo`}
                    </span>
                  )}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#6C757D',
                  mt: 0.5
                }}>
                  {filteredByRisk
                    ? `${sortedProgramas.filter(p => p.riesgo === selectedRisk).length} programa${sortedProgramas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''} encontrado${sortedProgramas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''}`
                    : `${sortedProgramas.length} programa${sortedProgramas.length !== 1 ? 's' : ''} encontrado${sortedProgramas.length !== 1 ? 's' : ''}`
                  }
                </Typography>
              </div>
              {selectedRisk && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedRisk(null);
                    setFilteredByRisk(false);
                  }}
                  sx={{
                    borderColor: '#6C757D',
                    color: '#6C757D',
                    '&:hover': {
                      borderColor: '#495057',
                      backgroundColor: 'rgba(108, 117, 125, 0.04)',
                    }
                  }}
                >
                  Limpiar filtro riesgo
                </Button>
              )}
            </Box>

            {/* Panel de filtros */}
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
              filterOptions={filterOptions}
              isOpen={filterPanelOpen}
              onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
              title="Filtros de Programas Acreditación Internacional"
            />

            {programas.length === 0 ? (
              <Box sx={{ p: 8, textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 64, color: '#E9ECEF', mb: 2 }} />
                <Typography variant="h6" sx={{
                  color: '#6C757D',
                  fontWeight: 500,
                  mb: 1
                }}>
                  No hay programas disponibles
                </Typography>
                <Typography variant="body2" sx={{ color: '#ADB5BD' }}>
                  No se encontraron programas para este proceso de acreditación
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{
                width: '100%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.25)'
                  }
                }
              }}>
                <Table aria-label="lista de programas" sx={{ tableLayout: { xs: 'auto', md: 'fixed' }, width: '100%' }}>
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
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: '#495057',
                            backgroundColor: '#F8F9FA',
                            borderBottom: '2px solid rgba(0,0,0,0.06)',
                            py: 2.5,
                            px: { xs: 1, sm: 2 },
                            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                            position: 'sticky',
                            top: 0,
                            zIndex: 10
                          }}
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
                    {(filteredByRisk
                      ? sortedProgramas.filter(program => program.riesgo === selectedRisk)
                      : sortedProgramas
                    ).map((program, index) => (
                      <TableRow
                        key={program.id_programa}
                        hover
                        onClick={() => handleNavigateToProgram(program)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            backgroundColor: 'rgba(178, 34, 34, 0.02)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          },
                          '&:not(:last-child)': {
                            borderBottom: '1px solid rgba(0,0,0,0.04)'
                          }
                        }}
                      >
                        <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                          <Typography variant="body1" sx={{
                            fontWeight: 500,
                            color: '#212529',
                            fontSize: '0.9375rem',
                            lineHeight: 1.4
                          }}>
                            {program['programa académico']}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                          <Typography variant="body2" sx={{
                            color: '#6C757D',
                            fontSize: '0.875rem'
                          }}>
                            {program.escuela}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                          <Typography variant="body2" sx={{
                            color: '#6C757D',
                            fontSize: '0.875rem'
                          }}>
                            {program['nivel de formación']}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                          <ModernRiskChip riskLevel={program.riesgo} value={program.riesgo} />
                        </TableCell>
                        <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                          <Tooltip title={program.mensaje} arrow placement="top">
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 300,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: '#6C757D',
                                fontSize: '0.875rem',
                                cursor: 'help'
                              }}
                            >
                              {program.mensaje}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Box>
      </Fade>
    </Box>
  );
};

export default AcreditacionInternacional;
