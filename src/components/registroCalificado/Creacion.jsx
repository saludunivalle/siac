import React from 'react';
import { Box, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Tooltip } from '@mui/material';
import ModernRiskChip from '../common/ModernRiskChip';

const Creacion = ({
  programDetails,
  selectedRisk,
  filteredByRisk,
  setSelectedRisk,
  setFilteredByRisk,
  handleNavigateToProgram,
  riskConfig
}) => {
  const procesoProgramas = programDetails?.CREA || [];

  return (
    <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)', width: '100%' }}>
      <Box sx={{ p: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #B22222 0%, #DC143C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUpIcon sx={{ color: 'white', fontSize: '20px' }} />
          </Box>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', fontSize: '1.25rem' }}>
              Listado de Programas (Creación)
              {selectedRisk && (
                <span style={{ color: riskConfig[selectedRisk]?.color, marginLeft: '10px' }}>
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
        </Box>
        {selectedRisk && (
          <Box>
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
              Limpiar filtro
            </button>
          </Box>
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
  );
};

export default Creacion;


