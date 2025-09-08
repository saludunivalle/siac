import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Slider
} from '@mui/material';
import { NIVELES_ACADEMICOS } from '../../constants/dashboardConstants';

const FiltersCard = ({
  title,
  filters,
  onFilterChange,
  showYearRange = false,
  yearRange,
  onYearRangeChange,
  minYear,
  maxYear,
  availableOptions = {},
  showPeriodoFilter = false
}) => {
  const {
    years = [],
    semesters = [],
    niveles = NIVELES_ACADEMICOS,
    programas = [],
    periodos = []
  } = availableOptions;

  const handleFilterChange = (filterName, value) => {
    onFilterChange(filterName, value);
  };

  return (
    <Card className="card-shadow" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" className="filters-title">
          {title}
        </Typography>
        <Grid container spacing={3}>
          {/* Filtro de Año */}
          {filters.hasOwnProperty('selectedYear') && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Año</InputLabel>
                <Select
                  value={filters.selectedYear}
                  label="Año"
                  onChange={(e) => handleFilterChange('selectedYear', e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Filtro de Semestre */}
          {filters.hasOwnProperty('selectedSemester') && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Semestre</InputLabel>
                <Select
                  value={filters.selectedSemester}
                  label="Semestre"
                  onChange={(e) => handleFilterChange('selectedSemester', e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {semesters.map(semester => (
                    <MenuItem key={semester} value={semester}>{semester}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Filtro de Nivel */}
          {filters.hasOwnProperty('selectedNivel') && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Formación</InputLabel>
                <Select
                  value={filters.selectedNivel}
                  label="Nivel de Formación"
                  onChange={(e) => handleFilterChange('selectedNivel', e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {niveles.map(nivel => (
                    <MenuItem key={nivel} value={nivel}>{nivel}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Filtro de Programa */}
          {filters.hasOwnProperty('selectedPrograma') && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Programa Académico</InputLabel>
                <Select
                  value={filters.selectedPrograma}
                  label="Programa Académico"
                  onChange={(e) => handleFilterChange('selectedPrograma', e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {programas.map(programa => (
                    <MenuItem key={programa} value={programa}>{programa}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Filtro de Periodo - Solo para Cupos */}
          {showPeriodoFilter && filters.hasOwnProperty('selectedPeriodo') && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Periodo</InputLabel>
                <Select
                  value={filters.selectedPeriodo}
                  label="Periodo"
                  onChange={(e) => handleFilterChange('selectedPeriodo', e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {periodos.map(periodo => (
                    <MenuItem key={periodo} value={periodo}>{periodo}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Slider de Rango de Años */}
          {showYearRange && yearRange && (
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" className="year-range-container">
                  Rango de Años: {yearRange[0]} - {yearRange[1]}
                </Typography>
                <Slider
                  value={yearRange}
                  onChange={onYearRangeChange}
                  valueLabelDisplay="auto"
                  min={minYear}
                  max={maxYear}
                  marks={[
                    { value: minYear, label: minYear.toString() },
                    { value: maxYear, label: maxYear.toString() }
                  ]}
                  className="slider-primary"
                  sx={{
                    color: '#B22222',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#B22222',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#B22222',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                    }
                  }}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FiltersCard;
