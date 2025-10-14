import React from 'react';
import { Box, Fade, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, alpha } from '@mui/material';
import ModernRiskChip from '../common/ModernRiskChip';

const GeneralProcessTable = ({ counts, riskConfig, processConfig, getTotalByProcess, getTotalByRisk, getGrandTotal, handleRowClick }) => {
  return (
    <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
      <Fade in timeout={600}>
        <Card sx={{ 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.02)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)',
          width: '100%',
          maxWidth: { xs: '100%', md: '1200px' }
        }}>
          <Box sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.06)'
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: '#B22222',
              fontSize: '2rem',
              letterSpacing: '-0.02em',
              textAlign: 'center',
              mb: 1
            }}>
              Registro Calificado
            </Typography>
            <Typography variant="body1" sx={{ color: '#6C757D', textAlign: 'center', fontSize: '1.125rem', fontWeight: 400 }}>
              Monitoreo de procesos y niveles de riesgo
            </Typography>
          </Box>

          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', width: '100%' }}>
              <Table aria-label="tabla de registro calificado" sx={{ tableLayout: { xs: 'auto', md: 'fixed' }, width: '100%', ml: 0 }}>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '1rem', color: '#495057', py: 3, px: { xs: 1, sm: 2, md: 3 }, borderBottom: '2px solid rgba(0,0,0,0.06)', width: { xs: '30%', sm: '35%', md: '40%' } }}>
                      Proceso
                    </TableCell>
                    {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => (
                      <TableCell key={risk} align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', color: riskConfig[risk].color, py: 3, px: 2, borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          {riskConfig[risk]?.icon && React.cloneElement(riskConfig[risk].icon, { sx: { fontSize: '18px' } })}
                          <span>{risk === 'SinRegistro' ? 'Sin Registro' : risk}</span>
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1rem', color: '#495057', py: 3, px: 3, borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(counts).map((proceso) => (
                    <TableRow 
                      key={proceso}
                      hover
                      onClick={() => handleRowClick(`option${proceso === 'CREA' ? '4' : proceso === 'MOD' ? '5' : '1'}`, proceso, proceso)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ py: 2, px: { xs: 1, sm: 2, md: 3 }, borderBottom: 'none' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{
                            width: { xs: 50, sm: 60, md: 76 },
                            height: { xs: 34, sm: 42, md: 51 },
                            borderRadius: '12px',
                            background: processConfig[proceso].color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 2px 8px ${alpha(processConfig[proceso].color, 0.25)}`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(processConfig[proceso].color, 0.35)}`
                            }
                          }}>
                            {processConfig[proceso]?.icon && React.cloneElement(processConfig[proceso].icon, {
                              sx: {
                                color: 'white',
                                fontSize: proceso === 'RRC' ? '32px' : '28px'
                              }
                            })}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', fontSize: '1.125rem' }}>
                              {processConfig[proceso].name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6C757D', fontSize: '0.875rem', mt: 0.5 }}>
                              {processConfig[proceso].description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => (
                        <TableCell key={risk} align="center" sx={{ py: 3, px: 2, borderBottom: 'none' }}>
                          <ModernRiskChip riskLevel={risk} value={counts[proceso][risk]} configOverride={riskConfig} />
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ py: 3, px: 3, borderBottom: 'none' }}>
                        <Chip 
                          label={getTotalByProcess(proceso)}
                          sx={{ 
                            background: 'linear-gradient(135deg, #495057 0%, #343A40 100%)', 
                            color: 'white', 
                            fontWeight: 800,
                            fontSize: '1.125rem',
                            height: 48,
                            minWidth: '100px',
                            borderRadius: '14px',
                            boxShadow: '0 4px 16px rgba(73, 80, 87, 0.3)',
                            '& .MuiChip-label': { color: 'white', fontWeight: 800 }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', borderTop: '2px solid rgba(0,0,0,0.06)' }}>
                    <TableCell sx={{ py: 3, px: 4, borderBottom: 'none' }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#212529', fontSize: '1.25rem' }}>
                          TOTAL GENERAL
                        </Typography>
                      </Box>
                    </TableCell>
                    {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => (
                      <TableCell key={risk} align="center" sx={{ py: 3, px: 2, borderBottom: 'none' }}>
                        <ModernRiskChip riskLevel={risk} value={getTotalByRisk(risk)} size="large" configOverride={riskConfig} />
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ py: 3, px: 3, borderBottom: 'none' }}>
                      <Chip 
                        label={getGrandTotal()}
                        sx={{ background: 'linear-gradient(135deg, #B22222 0%, #8B1A1A 100%)', color: 'white', fontWeight: 800, fontSize: '1.125rem', height: 48, minWidth: '100px', borderRadius: '14px', '& .MuiChip-label': { color: 'white', fontWeight: 800 } }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default GeneralProcessTable;


