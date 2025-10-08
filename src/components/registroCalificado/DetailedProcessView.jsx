import React from 'react';
import { 
  Box,
  Fade,
  Typography,
  Button,
  Grid,
  Grow,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  alpha
} from '@mui/material';
import { Tooltip } from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RuleIcon from '@mui/icons-material/Rule';
import ModernRiskChip from '../common/ModernRiskChip';
import Creacion from './Creacion';
import Modificacion from './Modificacion';
import RenovacionRC from './RenovacionRC';

const DetailedProcessView = ({
  selectedRow,
  riskConfig,
  counts,
  selectedRisk,
  hoveredCard,
  loading,
  rrcProgramCounts,
  programDetails,
  getTitle,
  handleGenerateReport,
  isLoading,
  handleBackClick,
  handleModButtonClick,
  getModButtonStyles,
  handleRrcButtonClick,
  getRrcButtonStyles,
  handleRiskCardClick,
  setHoveredCard,
  filteredByRisk,
  setSelectedRisk,
  setFilteredByRisk,
  handleNavigateToProgram
}) => {
  const procesoProgramas = programDetails[selectedRow] || [];
  const riskCounts = React.useMemo(() => {
    const base = { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 };
    procesoProgramas.forEach(p => {
      if (base[p.riesgo] !== undefined) base[p.riesgo] += 1;
    });
    return base;
  }, [procesoProgramas]);

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
                {selectedRow === 'CREA' && <TrendingUpIcon sx={{ color: 'white', fontSize: '24px' }} />}
                {selectedRow === 'MOD' && <AssignmentIcon sx={{ color: 'white', fontSize: '24px' }} />}
                {selectedRow === 'RRC' && <RuleIcon sx={{ color: 'white', fontSize: '24px' }} />}
              </Box>
              <Box>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#B22222',
                  fontSize: '1.75rem',
                  letterSpacing: '-0.02em',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  mb: 0.5
                }}>
                  {getTitle()}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#6C757D',
                  fontSize: '1rem'
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

          {selectedRow === 'MOD' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: '10px' }}>
                <Button value="option1" sx={getModButtonStyles('option1')} onClick={() => handleModButtonClick('option1')}>
                  Sustanciales
                </Button>
                <Button value="option2" sx={getModButtonStyles('option2')} onClick={() => handleModButtonClick('option2')}>
                  No Sustanciales
                </Button>
              </Box>
            </Box>
          )}

          {selectedRow === 'RRC' && (
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2,
              mb: 4,
              mt: 2
            }}>
              {(() => {
                const combined18 = (rrcProgramCounts.orange || 0) + (rrcProgramCounts.orange2 || 0);
                return [
                  { type: 'white', label: 'PROGRAMAS VENCIDOS', count: rrcProgramCounts.white },
                  { type: 'green', label: '4 AÑOS ANTES DEL VENCIMIENTO', count: rrcProgramCounts.green },
                  { type: 'yellow', label: '2 AÑOS ANTES DEL VENCIMIENTO', count: rrcProgramCounts.yellow },
                  { type: 'orange2', label: '18 MESES ANTES DEL VENCIMIENTO', count: combined18 },
                  { type: 'red', label: 'AÑO DEL VENCIMIENTO', count: rrcProgramCounts.red },
                  { type: 'gray', label: 'SIN REGISTRO', count: counts.RRC.SinRegistro }
                ];
              })().map(({ type, label, count }) => (
                <Button 
                  key={type} 
                  onClick={() => handleRrcButtonClick(type)} 
                  sx={{
                    ...getRrcButtonStyles(type),
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
          )}

          <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
            {['Bajo', 'Medio', 'Alto', 'SinRegistro'].map((risk, index) => {
              const config = riskConfig[risk];
              const count = riskCounts[risk];
              return (
                <Grid item xs={12} sm={6} md={3} key={risk}>
                  <Grow in timeout={600 + index * 100}>
                    <Card 
                      elevation={0}
                      onClick={() => handleRiskCardClick(risk)}
                      onMouseEnter={() => setHoveredCard(risk)}
                      onMouseLeave={() => setHoveredCard(null)}
                      sx={{ 
                        borderRadius: '20px',
                        border: `2px solid ${selectedRisk === risk ? config.color : config.borderColor}`,
                        backgroundColor: selectedRisk === risk ? config.color + '26' : config.backgroundColor,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: hoveredCard === risk || selectedRisk === risk ? 'translateY(-8px)' : 'translateY(0)',
                        cursor: 'pointer'
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
                              {rrcProgramCounts.white > 0 && (
                                <Typography variant="caption" sx={{ color: config.color, opacity: 0.6, fontSize: '0.65rem', lineHeight: 1 }}>
                                  {rrcProgramCounts.white} vencidos
                                </Typography>
                              )}
                              {(rrcProgramCounts.red > 0) && (
                                <Typography variant="caption" sx={{ color: config.color, opacity: 0.6, fontSize: '0.65rem', lineHeight: 1 }}>
                                  {rrcProgramCounts.red} próximos
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

          {selectedRow === 'CREA' ? (
            <Creacion
              programDetails={programDetails}
              selectedRisk={selectedRisk}
              filteredByRisk={filteredByRisk}
              setSelectedRisk={setSelectedRisk}
              setFilteredByRisk={setFilteredByRisk}
              handleNavigateToProgram={handleNavigateToProgram}
              riskConfig={riskConfig}
            />
          ) : selectedRow === 'MOD' ? (
            <Modificacion
              programDetails={programDetails}
              selectedRisk={selectedRisk}
              filteredByRisk={filteredByRisk}
              setSelectedRisk={setSelectedRisk}
              setFilteredByRisk={setFilteredByRisk}
              handleNavigateToProgram={handleNavigateToProgram}
              riskConfig={riskConfig}
              handleModButtonClick={handleModButtonClick}
              getModButtonStyles={getModButtonStyles}
            />
          ) : selectedRow === 'RRC' ? (
            <RenovacionRC
              programDetails={programDetails}
              selectedRisk={selectedRisk}
              filteredByRisk={filteredByRisk}
              setSelectedRisk={setSelectedRisk}
              setFilteredByRisk={setFilteredByRisk}
              handleNavigateToProgram={handleNavigateToProgram}
              riskConfig={riskConfig}
              rrcProgramCounts={rrcProgramCounts}
              handleRrcButtonClick={handleRrcButtonClick}
              getRrcButtonStyles={getRrcButtonStyles}
              loading={loading}
            />
          ) : (
            <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)', width: '100%' }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Button variant="outlined" size="small" onClick={() => { setSelectedRisk(null); setFilteredByRisk(false); }}>
                  Limpiar filtro
                </Button>
              )}
            </Box>

            {procesoProgramas.length === 0 ? (
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
                      {['Programa Académico', 'Escuela', 'Nivel', 'Riesgo', 'Observaciones'].map((header) => (
                        <TableCell key={header} sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#495057', backgroundColor: '#F8F9FA', borderBottom: '2px solid rgba(0,0,0,0.06)', py: 2.5, px: { xs: 1, sm: 2 }, position: 'sticky', top: 0, zIndex: 10 }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filteredByRisk ? procesoProgramas.filter(program => program.riesgo === selectedRisk) : procesoProgramas).map((program) => (
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
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default DetailedProcessView;


