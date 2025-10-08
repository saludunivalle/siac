import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Collapse,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  filterOptions,
  isOpen,
  onToggle,
  title = "Filtros de Búsqueda"
}) => {
  const hasActiveFilters = Object.values(filters).some(filter => filter && filter.length > 0);

  // Filtrar opciones que deben mostrarse basadas en condiciones
  const visibleFilterOptions = filterOptions.filter(option => {
    // Si la opción tiene una condición, verificar si se cumple
    if (option.condition) {
      return option.condition(filters);
    }
    return true; // Mostrar por defecto si no hay condición
  });

  return (
    <Box sx={{ mb: 2 }}>
      {/* Botón para mostrar/ocultar filtros */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={onToggle}
          sx={{
            borderColor: hasActiveFilters ? '#B22222' : '#6C757D',
            color: hasActiveFilters ? '#B22222' : '#6C757D',
            '&:hover': {
              borderColor: hasActiveFilters ? '#8B1A1A' : '#495057',
              backgroundColor: hasActiveFilters ? 'rgba(178, 34, 34, 0.04)' : 'rgba(108, 117, 125, 0.04)',
            }
          }}
        >
          {title}
          {hasActiveFilters && (
            <Box sx={{ 
              ml: 1, 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: '#B22222' 
            }} />
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="text"
            size="small"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            sx={{
              color: '#B22222',
              '&:hover': {
                backgroundColor: 'rgba(178, 34, 34, 0.04)',
              }
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>

      {/* Panel de filtros */}
      <Collapse in={isOpen}>
        <Card sx={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#212529',
                fontSize: '1.1rem'
              }}>
                {title}
              </Typography>
              <IconButton 
                size="small" 
                onClick={onToggle}
                sx={{ color: '#6C757D' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Grid container spacing={3}>
              {visibleFilterOptions.map((option) => (
                <Grid item xs={12} sm={6} md={4} key={option.key}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      color: '#212529', 
                      mb: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {option.label}
                    </Typography>
                    <FormGroup>
                      {option.options.map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          control={
                            <Checkbox
                              checked={filters[option.key]?.includes(opt.value) || false}
                              onChange={(e) => {
                                const currentValues = filters[option.key] || [];
                                if (e.target.checked) {
                                  onFilterChange(option.key, [...currentValues, opt.value]);
                                } else {
                                  onFilterChange(option.key, currentValues.filter(v => v !== opt.value));
                                }
                              }}
                              sx={{
                                color: '#B22222',
                                '&.Mui-checked': {
                                  color: '#B22222',
                                },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {opt.label}
                              </Typography>
                              {opt.count !== undefined && (
                                <Chip
                                  label={opt.count}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#F8F9FA',
                                    color: '#6C757D',
                                    border: '1px solid #E9ECEF'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            {hasActiveFilters && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ color: '#6C757D', mb: 1.5, fontWeight: 500 }}>
                  Filtros activos:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(filters).map(([key, values]) => {
                    if (!values || values.length === 0) return null;
                    const option = filterOptions.find(opt => opt.key === key);
                    // Solo mostrar filtros activos para opciones que están visibles
                    if (!visibleFilterOptions.find(opt => opt.key === key)) return null;
                    return values.map((value) => {
                      const optionLabel = option?.options.find(opt => opt.value === value)?.label || value;
                      return (
                        <Chip
                          key={`${key}-${value}`}
                          label={`${option?.label}: ${optionLabel}`}
                          onDelete={() => {
                            const currentValues = filters[key] || [];
                            onFilterChange(key, currentValues.filter(v => v !== value));
                          }}
                          sx={{
                            backgroundColor: '#B22222',
                            color: 'white',
                            '& .MuiChip-deleteIcon': {
                              color: 'white',
                              '&:hover': {
                                color: 'rgba(255,255,255,0.8)'
                              }
                            }
                          }}
                        />
                      );
                    });
                  })}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
};

export default FilterPanel;
