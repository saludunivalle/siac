import React from 'react';
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
  alpha
} from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SummarizeIcon from '@mui/icons-material/Summarize';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ModernRiskChip from '../common/ModernRiskChip';

const DetailedProcessView = ({
  selectedRow,
  counts,
  riskConfig,
  processConfig,
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
  raacProgramCounts,
  handleRaacButtonClick,
  getRaacButtonStyles,
  loading
}) => {
  const procesoProgramas = programDetails[selectedRow] || [];

  const getTitle = () => {
    switch (selectedRow) {
      case 'AAC':
        return 'Programas en Proceso de Acreditación';
      case 'RAAC':
        return 'Programas en Proceso de Renovación de Acreditación';
      case 'INT':
        return 'Programas con Acreditación Internacional';
      default:
        return 'Procesos de Acreditación de Alta Calidad';
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
      <Fade in timeout={400}>
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '1200px' } }}>
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
                {processConfig[selectedRow]?.icon && React.cloneElement(processConfig[selectedRow].icon, { 
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
                  {getTitle()}
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
                onClick={() => handleGenerateReport(selectedRow)}
                disabled={isLoading}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
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

          {selectedRow === 'RAAC' && (
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2,
              mb: 4,
              mt: 2
            }}>
              {[
                { type: 'white', label: 'PROGRAMAS VENCIDOS', count: raacProgramCounts.white },
                { type: 'green', label: 'AÑO Y 6 MESES', count: raacProgramCounts.green },
                { type: 'yellow', label: '4 AÑOS ANTES DEL VENCIMIENTO', count: raacProgramCounts.yellow },
                { type: 'orange', label: '2 AÑOS ANTES DEL VENCIMIENTO', count: raacProgramCounts.orange },
                { type: 'orange2', label: '18 MESES ANTES DEL VENCIMIENTO', count: raacProgramCounts.orange2 },
                { type: 'red', label: 'AÑO DEL VENCIMIENTO', count: raacProgramCounts.red },
                { type: 'gray', label: 'SIN REGISTRO', count: counts.RAAC.SinRegistro }
              ].map(({ type, label, count }) => (
                <Button
                  key={type}
                  onClick={() => handleRaacButtonClick(type)}
                  sx={getRaacButtonStyles(type)}
                >
                  {label}
                  <Box sx={{ mt: 1, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {count}
                      </Typography>
                    )}
                  </Box>
                </Button>
              ))}
            </Box>
          )}

          <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
            {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk, index) => {
              const config = riskConfig[risk];
              const count = counts[selectedRow][risk];
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
                          fontSize: '1.125rem'
                        }}>
                          {risk === 'SinRegistro' ? 'Sin Registro' : `${risk} Riesgo`}
                        </Typography>
                        <Box sx={{ 
                          width: 100, 
                          height: 48, 
                          borderRadius: '14px', 
                          background: config.gradient, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          boxShadow: `0 4px 16px ${alpha(config.color, 0.3)}`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 20px ${alpha(config.color, 0.4)}`
                          }
                        }}>
                          {riskConfig[risk]?.icon ? React.cloneElement(riskConfig[risk].icon, { sx: { color: 'white', fontSize: '20px' } }) : null}
                        </Box>
                      </Box>
                      <Typography variant="h2" sx={{ 
                        fontWeight: 800,
                        color: config.color,
                        fontSize: '3rem',
                        lineHeight: 1,
                        mb: 1
                      }}>
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
          </Grid>

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
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', fontSize: '1.25rem' }}>
                  Listado de Programas
                  {selectedRisk && (
                    <span style={{ color: riskConfig[selectedRisk].color, marginLeft: '10px' }}>
                      • Filtrado por: {selectedRisk === 'SinRegistro' ? 'Sin Registro' : `${selectedRisk} Riesgo`}
                    </span>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6C757D', mt: 0.5 }}>
                  {filteredByRisk 
                    ? `${procesoProgramas.filter(p => p.riesgo === selectedRisk).length} programa${procesoProgramas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''} encontrado${procesoProgramas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''}`
                    : `${procesoProgramas.length} programa${procesoProgramas.length !== 1 ? 's' : ''} encontrado${procesoProgramas.length !== 1 ? 's' : ''}`
                  }
                </Typography>
              </div>
              {selectedRisk && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => { setSelectedRisk(null); setFilteredByRisk(false); }}
                  sx={{ borderColor: '#6C757D', color: '#6C757D' }}
                >
                  Limpiar filtro
                </Button>
              )}
            </Box>

            {procesoProgramas.length === 0 ? (
              <Box sx={{ p: 8, textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 64, color: '#E9ECEF', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6C757D', fontWeight: 500, mb: 1 }}>
                  No hay programas disponibles
                </Typography>
                <Typography variant="body2" sx={{ color: '#ADB5BD' }}>
                  No se encontraron programas para este proceso de acreditación
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ width: '100%', overflowX: 'auto' }}>
                <Table aria-label="lista de programas" sx={{ tableLayout: { xs: 'auto', md: 'fixed' }, width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      {['Programa Académico','Escuela','Nivel','Riesgo','Observaciones'].map((header) => (
                        <TableCell key={header} sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#495057', backgroundColor: '#F8F9FA' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filteredByRisk ? procesoProgramas.filter(program => program.riesgo === selectedRisk) : procesoProgramas).map((program) => (
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
                        <TableCell>
                          <ModernRiskChip riskLevel={program.riesgo} value={program.riesgo} />
                        </TableCell>
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
            )}
          </Card>
        </Box>
      </Fade>
    </Box>
  );
};

export default DetailedProcessView;


