import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Collapse,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

  const visibleFilterOptions = filterOptions.filter(option => {
    if (option.condition) {
      return option.condition(filters);
    }
    return true;
  });

  const getCategoryKey = (option, index) => `${option.key}-${option.label}-${index}`;

  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    setExpandedCategories((prev) => {
      const next = { ...prev };
      visibleFilterOptions.forEach((option, index) => {
        const categoryKey = getCategoryKey(option, index);
        const hasSelection = (filters[option.key] || []).length > 0;
        if (hasSelection) {
          next[categoryKey] = true;
        } else if (next[categoryKey] === undefined) {
          next[categoryKey] = false;
        }
      });
      return next;
    });
  }, [visibleFilterOptions.length, filters]);

  const handleCategoryToggle = (categoryKey) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  return (
    <Box sx={{ mb: 2 }}>
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

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
              {visibleFilterOptions.map((option, index) => {
                const categoryKey = getCategoryKey(option, index);
                const selectedCount = (filters[option.key] || []).length;

                return (
                  <Accordion
                    key={categoryKey}
                    expanded={expandedCategories[categoryKey] || false}
                    onChange={() => handleCategoryToggle(categoryKey)}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '8px !important',
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': { margin: 0 },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#6C757D' }} />}
                      sx={{
                        minHeight: 48,
                        px: 2,
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          gap: 1,
                          my: 1,
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{
                        fontWeight: 600,
                        color: '#212529',
                        fontSize: '0.875rem',
                      }}>
                        {option.label}
                      </Typography>
                      {selectedCount > 0 && (
                        <Chip
                          label={selectedCount}
                          size="small"
                          sx={{
                            height: '22px',
                            fontSize: '0.75rem',
                            backgroundColor: '#B22222',
                            color: 'white',
                          }}
                        />
                      )}
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                      <FormGroup>
                        {option.options.map((opt) => (
                          <FormControlLabel
                            key={`${categoryKey}-${opt.value}-${opt.label}`}
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
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>

            {hasActiveFilters && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ color: '#6C757D', mb: 1.5, fontWeight: 500 }}>
                  Filtros activos:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(filters).map(([key, values]) => {
                    if (!values || values.length === 0) return null;
                    const option = filterOptions.find(opt => opt.key === key);
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
