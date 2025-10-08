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
  alpha,
  Grow
} from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SummarizeIcon from '@mui/icons-material/Summarize';
import WarningIcon from '@mui/icons-material/Warning';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ModernRiskChip from '../common/ModernRiskChip';

// Vista específica del proceso de Renovación de Acreditación (RAAC)
const RenovacionAcreditacion = ({
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
  raacProgramCounts,
  handleRaacButtonClick,
  getRaacButtonStyles,
  loading
}) => {
  const proceso = 'RAAC';
  const programas = programDetails[proceso] || [];

  return (
    <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
      <Fade in timeout={400}>
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '1200px' } }}>
          {/* Header */}
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
                <AutorenewIcon sx={{ color: 'white', fontSize: '24px' }} />
              </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#B22222', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                Programas en Proceso de Renovación de Acreditación
              </Typography>
              <Typography variant="body1" sx={{ color: '#6C757D', fontSize: '1rem', mt: 0.5 }}>
                Semáforo por fase RAC, riesgos y listado de programas (RAAC)
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

          {/* Botones de fases (Semáforo) */}
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
              { type: 'green', label: '4 AÑOS ANTES DEL VENCIMIENTO', count: raacProgramCounts.green },
              { type: 'yellow', label: '2 AÑOS ANTES DEL VENCIMIENTO', count: raacProgramCounts.yellow },
              { type: 'orange2', label: '18 MESES ANTES DEL VENCIMIENTO', count: raacProgramCounts.orange2 },
              { type: 'red', label: 'AÑO DEL VENCIMIENTO', count: raacProgramCounts.red },
              { type: 'gray', label: 'SIN REGISTRO', count: counts.RAAC.SinRegistro }
            ].map(({ type, label, count }) => (
              <Button
                key={type}
                onClick={() => handleRaacButtonClick(type)}
                sx={{
                  ...getRaacButtonStyles(type),
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 2,
                  px: 2
                }}
              >
                <Box sx={{ mb: 1 }}>
                  {label}
                </Box>
                <Box sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  color: 'inherit'
                }}>
                  {count !== 0 ? count : loading ? <CircularProgress size={20} /> : '0'}
                </Box>
              </Button>
            ))}
          </Box>

          {/* Tarjetas de riesgo */}
          <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
            {['Bajo', 'Medio', 'Alto', 'SinRegistro'].map((risk) => {
              const config = riskConfig[risk];
              const count = counts[proceso][risk];
              const isSelected = selectedRisk === risk;
              return (
                <Grid item xs={12} sm={6} md={3} key={risk}>
                  <Grow in timeout={600}>
                    <Card 
                      elevation={0}
                      onClick={() => handleRiskCardClick(risk)}
                      sx={{ 
                        borderRadius: '20px',
                        border: `2px solid ${isSelected ? config.color : config.borderColor}`,
                        backgroundColor: isSelected ? config.color + '26' : config.backgroundColor,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'translateY(-8px)' : 'translateY(0)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 8px 24px ${alpha(config.color, 0.2)}`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" sx={{ color: config.color, fontWeight: 600, fontSize: '1.125rem' }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 1 }}>
                          <Typography variant="h2" sx={{ fontWeight: 800, color: config.color, fontSize: '3rem', lineHeight: 1 }}>
                            {count}
                          </Typography>
                          {risk === 'Alto' && count > 0 && (
                            <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              {raacProgramCounts.white > 0 && (
                                <Typography variant="caption" sx={{ color: config.color, opacity: 0.6, fontSize: '0.65rem', lineHeight: 1 }}>
                                  {raacProgramCounts.white} vencidos
                                </Typography>
                              )}
                              {(raacProgramCounts.red > 0) && (
                                <Typography variant="caption" sx={{ color: config.color, opacity: 0.6, fontSize: '0.65rem', lineHeight: 1 }}>
                                  {raacProgramCounts.red} próximos
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: config.color, opacity: 0.7, fontSize: '0.875rem', fontWeight: 500 }}>
                          {count === 1 ? 'programa' : 'programas'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>

          {/* Tabla de programas RAAC */}
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)' }}>
            <Box sx={{ p: 3, background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', fontSize: '1.25rem' }}>
                  Listado de Programas (RAAC)
                  {selectedRisk && (
                    <span style={{ color: riskConfig[selectedRisk].color, marginLeft: '10px' }}>
                      • Filtrado por: {selectedRisk === 'SinRegistro' ? 'Sin Registro' : `${selectedRisk} Riesgo`}
                    </span>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6C757D', mt: 0.5 }}>
                  {filteredByRisk 
                    ? `${programas.filter(p => p.riesgo === selectedRisk).length} programa${programas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''} encontrado${programas.filter(p => p.riesgo === selectedRisk).length !== 1 ? 's' : ''}`
                    : `${programas.length} programa${programas.length !== 1 ? 's' : ''} encontrado${programas.length !== 1 ? 's' : ''}`
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

            <TableContainer component={Paper} elevation={0} sx={{ width: '100%', overflowX: 'auto' }}>
              <Table aria-label="lista de programas RAAC" sx={{ tableLayout: { xs: 'auto', md: 'fixed' }, width: '100%' }}>
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
                  {(filteredByRisk ? programas.filter(program => program.riesgo === selectedRisk) : programas).map((program) => (
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
          </Card>
        </Box>
      </Fade>
    </Box>
  );
};

export default RenovacionAcreditacion;


