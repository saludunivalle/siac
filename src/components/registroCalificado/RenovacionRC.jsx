import React, { useState, useMemo } from 'react';
import { Box, Card, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TableSortLabel } from '@mui/material';
import RuleIcon from '@mui/icons-material/Rule';
import SchoolIcon from '@mui/icons-material/School';
import { Tooltip } from '@mui/material';
import ModernRiskChip from '../common/ModernRiskChip';
import FilterPanel from '../common/FilterPanel';

const RenovacionRC = ({
  programDetails,
  selectedRisk,
  filteredByRisk,
  setSelectedRisk,
  setFilteredByRisk,
  handleNavigateToProgram,
  riskConfig
}) => {
  const procesoProgramas = programDetails?.RRC || [];
  
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
  const getUniqueOptions = (key, filteredPrograms = procesoProgramas) => {
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
      return procesoProgramas;
    }
    return procesoProgramas.filter(program => filters.escuela.includes(program.escuela));
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
    const filtered = filterPrograms(procesoProgramas);
    if (!orderBy) return filtered;
    
    return [...filtered].sort(getComparator(order, orderBy));
  }, [procesoProgramas, order, orderBy, filters]);

  return (
    <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)', width: '100%' }}>
      

      <Box sx={{ p: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #B22222 0%, #DC143C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RuleIcon sx={{ color: 'white', fontSize: '20px' }} />
          </Box>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', fontSize: '1.25rem' }}>
              Listado de Programas (Renovación RC)
              {selectedRisk && (
                <span style={{ color: riskConfig[selectedRisk]?.color, marginLeft: '10px' }}>
                  • Filtrado por: {selectedRisk === 'SinRegistro' ? 'Sin Registro' : `${selectedRisk} Riesgo`}
                </span>
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6C757D', mt: 0.5 }}>
              {filteredByRisk 
                ? `${sortedProgramas.filter(p => p.riesgo === selectedRisk).length} programa${sortedProgramas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''} encontrado${sortedProgramas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''}`
                : `${sortedProgramas.length} programa${sortedProgramas.length !== 1 ? 's' : ''} encontrado${sortedProgramas.length !== 1 ? 's' : ''}`
              }
            </Typography>
          </div>
        </Box>
        {selectedRisk && (
          <button
            onClick={() => { setSelectedRisk(null); setFilteredByRisk(false); }}
            style={{
              border: '1px solid #6C757D',
              color: '#6C757D',
              background: 'transparent',
              padding: '6px 12px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Limpiar filtro riesgo
          </button>
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
        title="Filtros de Programas Renovación RC"
      />

      {sortedProgramas.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: '#E9ECEF', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6C757D', fontWeight: 500, mb: 1 }}>
            No hay programas disponibles
          </Typography>
          <Typography variant="body2" sx={{ color: '#ADB5BD' }}>
            No se encontraron programas para este proceso
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ width: '100%', overflowX: 'auto' }}>
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
                    sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#495057', backgroundColor: '#F8F9FA', borderBottom: '2px solid rgba(0,0,0,0.06)', py: 2.5, px: { xs: 1, sm: 2 }, position: 'sticky', top: 0, zIndex: 10 }}
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
              {(filteredByRisk ? sortedProgramas.filter(program => program.riesgo === selectedRisk) : sortedProgramas).map((program) => (
                <TableRow key={program.id_programa} hover onClick={() => handleNavigateToProgram(program)} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                      {program['programa académico']}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                    <Typography variant="body2" sx={{ color: '#6C757D', fontSize: '0.875rem' }}>
                      {program.escuela}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                    <Typography variant="body2" sx={{ color: '#6C757D', fontSize: '0.875rem' }}>
                      {program['nivel de formación']}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
                    <ModernRiskChip riskLevel={program.riesgo} value={program.riesgo} configOverride={riskConfig} />
                  </TableCell>
                  <TableCell sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
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
      )}
    </Card>
  );
};

export default RenovacionRC;


