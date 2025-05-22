import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filtro5, Filtro6, Filtro7, Filtro10, clearSheetExceptFirstRow, sendDataToSheetNew } from '../service/data';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/altaCalidad.css';
import * as XLSX from 'xlsx';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Grid,
  CircularProgress,
  Box,
  Chip,
  Fade,
  Button,
  Tooltip,
  Divider,
  Grow,
  useTheme,
  alpha
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningIcon from '@mui/icons-material/Warning';
import MediumIcon from '@mui/icons-material/ReportProblem';
import LowIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import StarIcon from '@mui/icons-material/Star';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PublicIcon from '@mui/icons-material/Public';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SummarizeIcon from '@mui/icons-material/Summarize';

const AltaCalidad = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [counts, setCounts] = useState({
    AAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    RAAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    INT: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 }
  });
  const [filteredData, setFilteredData] = useState(null);
  const [isCargo, setCargo] = useState([' ']);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [programDetails, setProgramDetails] = useState([]);
  const [globalVariable, setGlobalVariable] = useState('');
  const [programasVisible, setProgramasVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState('');

  // RAAC phase button states
  const [clickedRaacButton, setClickedRaacButton] = useState(null);
  const [selectedRaacOptions, setSelectedRaacOptions] = useState([]);
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');
  const [raacProgramCounts, setRaacProgramCounts] = useState({
    white: 0,  // PROGRAMAS VENCIDOS
    green: 0,  // AÑO Y 6 MESES
    yellow: 0, // 4 AÑOS ANTES DEL VENCIMIENTO
    orange: 0, // 2 AÑOS ANTES DEL VENCIMIENTO
    orange2: 0, // 18 MESES ANTES DEL VENCIMIENTO
    red: 0     // AÑO DE VENCIMIENTO
  });

  // Obtener los permisos del usuario
  useEffect(() => {
    if (sessionStorage.getItem('logged')) {
      const res = JSON.parse(sessionStorage.getItem('logged'));
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
      if (res.length > 0) {
        setUser(res[0].usuario || '');
      }
    }
  }, []);

  // Cargar datos de programas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let programas;
        if (isCargo.includes('Posgrados')) {
          const filtered = await Filtro5();
          programas = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        } else {
          programas = await Filtro5();
        }
        
        setFilteredData(programas);
        
        // Load RAAC program counts
        try {
          let raacResponse;
          if (isCargo.includes('Posgrados')) {
            const filtered = await Filtro6({ searchTerm: '' });
            raacResponse = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
          } else {
            raacResponse = await Filtro6({ searchTerm: '' });
          }
          
          setRaacProgramCounts({
            white: raacResponse.filter(item => item['fase rac'] === 'Vencido' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
            green: raacResponse.filter(item => item['fase rac'] === 'Fase 1' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
            yellow: raacResponse.filter(item => item['fase rac'] === 'Fase 2' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
            orange: raacResponse.filter(item => item['fase rac'] === 'Fase 3' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
            orange2: raacResponse.filter(item => item['fase rac'] === 'Fase 4' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
            red: raacResponse.filter(item => item['fase rac'] === 'Fase 5' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
          });
        } catch (error) {
          console.error('Error al cargar conteos de programas RAAC:', error);
        }
        
        const seguimientos = await Filtro7();
        processSeguimientos(seguimientos, programas);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCargo]);

  // Procesar los niveles de riesgo para diferentes procesos
  const processSeguimientos = useCallback((seguimientos, programas) => {
    if (!seguimientos || !Array.isArray(seguimientos)) return;

    const estados = {
      AAC: programas.filter(item => item['aac_1a'] === 'SI').map(item => item.id_programa),
      RAAC: programas.filter(item => item['ac vigente'] === 'SI' && item['fase rac'] !== 'N/A').map(item => item.id_programa),
      INT: programas.filter(item => item['acreditacion internacional'] === 'SI').map(item => item.id_programa)
    };

    const newCounts = {
      AAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      RAAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      INT: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 }
    };

    const programDetails = {};

    Object.keys(estados).forEach((estado) => {
      const filtered = seguimientos.filter((item) => estados[estado].includes(item.id_programa));
      const latestSeguimientos = {};
      
      filtered.forEach(item => {
        const idPrograma = item.id_programa;
        if (!latestSeguimientos[idPrograma] || new Date(item.timestamp) > new Date(latestSeguimientos[idPrograma].timestamp)) {
          latestSeguimientos[idPrograma] = item;
        }
      });

      estados[estado].forEach(programId => {
        const programa = programas.find(p => p.id_programa === programId);
        if (programa) {
          const seguimiento = latestSeguimientos[programId];
          if (!programDetails[estado]) {
            programDetails[estado] = [];
          }
          
          programDetails[estado].push({
            ...programa,
            riesgo: seguimiento ? seguimiento.riesgo : 'SinRegistro',
            mensaje: seguimiento ? seguimiento.mensaje : 'Sin información'
          });
        }
      });

      Object.values(latestSeguimientos).forEach(item => {
        const riesgo = item.riesgo;
        if (riesgo === 'Alto') {
          newCounts[estado].Alto += 1;
        } else if (riesgo === 'Medio') {
          newCounts[estado].Medio += 1;
        } else if (riesgo === 'Bajo') {
          newCounts[estado].Bajo += 1;
        }
      });

      const sinRegistro = estados[estado].length - Object.keys(latestSeguimientos).length;
      newCounts[estado].SinRegistro += sinRegistro;
    });

    setCounts(newCounts);
    setProgramDetails(programDetails);
  }, []);

  // Configuración moderna de colores e iconos para niveles de riesgo
  const riskConfig = {
    Alto: {
      color: '#DC3545',
      backgroundColor: 'rgba(220, 53, 69, 0.08)',
      borderColor: 'rgba(220, 53, 69, 0.2)',
      icon: <WarningIcon />,
      gradient: 'linear-gradient(135deg, #DC3545 0%, #B02A37 100%)'
    },
    Medio: {
      color: '#FF8C00',
      backgroundColor: 'rgba(255, 140, 0, 0.08)',
      borderColor: 'rgba(255, 140, 0, 0.2)',
      icon: <MediumIcon />,
      gradient: 'linear-gradient(135deg, #FF8C00 0%, #E07600 100%)'
    },
    Bajo: {
      color: '#28A745',
      backgroundColor: 'rgba(40, 167, 69, 0.08)',
      borderColor: 'rgba(40, 167, 69, 0.2)',
      icon: <LowIcon />,
      gradient: 'linear-gradient(135deg, #28A745 0%, #218838 100%)'
    },
    SinRegistro: {
      color: '#6C757D',
      backgroundColor: 'rgba(108, 117, 125, 0.08)',
      borderColor: 'rgba(108, 117, 125, 0.2)',
      icon: <HelpOutlineIcon />,
      gradient: 'linear-gradient(135deg, #6C757D 0%, #495057 100%)'
    }
  };

  const processConfig = {
    AAC: {
      name: 'Acreditación',
      icon: <StarIcon />,
      color: '#B22222',
      description: 'Programas en proceso de acreditación'
    },
    RAAC: {
      name: 'Renovación Acreditación',
      icon: <AutorenewIcon />,
      color: '#B22222',
      description: 'Renovación de acreditación de alta calidad'
    },
    INT: {
      name: 'Acreditación Internacional',
      icon: <PublicIcon />,
      color: '#B22222',
      description: 'Programas con acreditación internacional'
    }
  };

  const getRiskColor = (riskLevel) => riskConfig[riskLevel]?.backgroundColor || 'white';
  const getRiskIcon = (riskLevel) => riskConfig[riskLevel]?.icon || null;
  
  const getTotalByProcess = (proceso) => {
    return counts[proceso].Alto + counts[proceso].Medio + counts[proceso].Bajo + counts[proceso].SinRegistro;
  };
  
  const getTotalByRisk = (riskLevel) => {
    return counts.AAC[riskLevel] + counts.RAAC[riskLevel] + counts.INT[riskLevel];
  };
  
  const getGrandTotal = () => {
    return Object.keys(counts).reduce((total, proceso) => {
      return total + getTotalByProcess(proceso);
    }, 0);
  };

  const handleRowClick = (buttonValue, globalVar, rowKey) => {
    setSelectedValue(buttonValue);
    
    const validRowKeys = ['AAC', 'RAAC', 'INT'];
    if (validRowKeys.includes(rowKey)) {
      setSelectedRow(rowKey);
      
      // Reset selected options when changing sections
      if (rowKey === 'RAAC') {
        setSelectedRaacOptions([]);
      }
    } else {
      setSelectedRow(null);
    }
    
    setProgramasVisible(false);
    setGlobalVariable(globalVar);
  };

  const handleBackClick = () => {
    setSelectedRow(null);
    setSelectedValue(null);
    setProgramasVisible(false);
  };

  const handleNavigateToProgram = (program) => {
    const programData = {
      ...program,
      globalVariable: selectedRow,
      userEmail: sessionStorage.getItem('userEmail')
    };

    navigate('/program_details', { 
      state: programData,
      replace: true
    });
  };

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

  // Componente ModernRiskChip
  const ModernRiskChip = ({ riskLevel, value, size = 'medium' }) => {
    const config = riskConfig[riskLevel];
    
    return (
      <Chip 
        icon={config.icon}
        label={value}
        sx={{
          background: config.gradient,
          color: 'white',
          fontWeight: 600,
          fontSize: size === 'large' ? '1rem' : '0.875rem',
          height: size === 'large' ? 40 : 32,
          minWidth: size === 'large' ? '80px' : '60px',
          borderRadius: '10px',
          boxShadow: `0 2px 8px ${alpha(config.color, 0.2)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 16px ${alpha(config.color, 0.3)}`,
          },
          '& .MuiChip-icon': {
            color: 'white',
            fontSize: size === 'large' ? '18px' : '16px'
          }
        }}
      />
    );
  };

  // Componente para mostrar la vista detallada de un proceso
  const DetailedProcessView = () => {
    const procesoProgramas = programDetails[selectedRow] || [];
    
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
            
            {/* Botones de fases para RAAC (Semáforo) */}
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
                  { type: 'red', label: 'AÑO DEL VENCIMIENTO', count: raacProgramCounts.red }
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
            
            {/* Cards de métricas */}
            <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
              {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk, index) => {
                const config = riskConfig[risk];
                const count = counts[selectedRow][risk];
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={risk}>
                    <Grow in timeout={600 + index * 100}>
                      <Card 
                        elevation={0}
                        onMouseEnter={() => setHoveredCard(risk)}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{ 
                          borderRadius: '20px',
                          border: `2px solid ${config.borderColor}`,
                          backgroundColor: config.backgroundColor,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: hoveredCard === risk ? 'translateY(-8px)' : 'translateY(0)',
                          boxShadow: hoveredCard === risk 
                            ? `0 12px 32px ${alpha(config.color, 0.15)}`
                            : `0 2px 8px ${alpha(config.color, 0.08)}`,
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
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>

            {/* Tabla de Nivel de Riesgo */}
            <Card sx={{ 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.02)',
              width: '100%',
              maxWidth: '600px',
              mb: 4,
              mx: 'auto'
            }}>
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
                borderBottom: '1px solid rgba(0,0,0,0.06)'
              }}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: '#212529',
                  fontSize: '1.25rem',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Nivel de Riesgo
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#6C757D',
                  mt: 0.5
                }}>
                  Distribución de programas por nivel de riesgo
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#495057',
                        backgroundColor: '#F8F9FA',
                        borderBottom: '2px solid rgba(0,0,0,0.06)',
                        py: 2.5,
                        px: { xs: 1, sm: 2 }
                      }}>
                        Nivel de Riesgo
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#495057',
                        backgroundColor: '#F8F9FA',
                        borderBottom: '2px solid rgba(0,0,0,0.06)',
                        py: 2.5,
                        px: { xs: 1, sm: 2 }
                      }}>
                        Cantidad
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#495057',
                        backgroundColor: '#F8F9FA',
                        borderBottom: '2px solid rgba(0,0,0,0.06)',
                        py: 2.5,
                        px: { xs: 1, sm: 2 }
                      }}>
                        Porcentaje
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => {
                      const config = riskConfig[risk];
                      const count = counts[selectedRow][risk];
                      const total = getTotalByProcess(selectedRow);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <TableRow key={risk} sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.01)',
                            transform: 'translateX(2px)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                          }
                        }}>
                          <TableCell sx={{ 
                            py: 2,
                            px: { xs: 1, sm: 2 },
                            borderBottom: '1px solid rgba(0,0,0,0.04)'
                          }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {React.cloneElement(config.icon, { 
                                sx: { color: config.color, fontSize: '20px' } 
                              })}
                              <Typography sx={{ 
                                color: config.color,
                                fontWeight: 500,
                                fontSize: '0.9375rem'
                              }}>
                                {risk === 'SinRegistro' ? 'Sin Registro' : risk}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            py: 2,
                            px: { xs: 1, sm: 2 },
                            borderBottom: '1px solid rgba(0,0,0,0.04)'
                          }}>
                            <Typography sx={{ 
                              fontWeight: 600,
                              color: '#212529',
                              fontSize: '1rem'
                            }}>
                              {count}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            py: 2,
                            px: { xs: 1, sm: 2 },
                            borderBottom: '1px solid rgba(0,0,0,0.04)'
                          }}>
                            <Typography sx={{ 
                              fontWeight: 600,
                              color: config.color,
                              fontSize: '1rem'
                            }}>
                              {percentage}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Fila de total */}
                    <TableRow sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        transform: 'translateX(2px)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }}>
                      <TableCell sx={{ 
                        py: 2,
                        px: { xs: 1, sm: 2 },
                        borderBottom: 'none',
                        fontWeight: 600,
                        color: '#212529'
                      }}>
                        Total
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        py: 2,
                        px: { xs: 1, sm: 2 },
                        borderBottom: 'none',
                        fontWeight: 700,
                        color: '#B22222',
                        fontSize: '1.125rem'
                      }}>
                        {getTotalByProcess(selectedRow)}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        py: 2,
                        px: { xs: 1, sm: 2 },
                        borderBottom: 'none',
                        fontWeight: 700,
                        color: '#B22222',
                        fontSize: '1.125rem'
                      }}>
                        100%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
            
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
                borderBottom: '1px solid rgba(0,0,0,0.06)'
              }}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: '#212529',
                  fontSize: '1.25rem',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Listado de Programas
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#6C757D',
                  mt: 0.5
                }}>
                  {procesoProgramas.length} programa{procesoProgramas.length !== 1 ? 's' : ''} encontrado{procesoProgramas.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              
              {procesoProgramas.length === 0 ? (
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
                          'Programa Académico',
                          'Escuela',
                          'Nivel',
                          'Riesgo',
                          'Observaciones'
                        ].map((header) => (
                          <TableCell 
                            key={header}
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
                              top: 80,
                              zIndex: 10
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {procesoProgramas.map((program, index) => (
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

  // Componentes para mantener compatibilidad con versiones anteriores
  const Aac = () => {
    if (selectedRow !== 'AAC') return null;
    return <DetailedProcessView />;
  };

  const SemaforoAc = () => {
    if (selectedRow !== 'RAAC') return null;
    return <DetailedProcessView />;
  };

  // Componente para mostrar la tabla general de procesos
  const GeneralProcessTable = () => (
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                Alta Calidad
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: '#B22222',
              fontSize: '2rem',
              letterSpacing: '-0.02em',
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              textAlign: 'center',
              mb: 1
            }}>
              Acreditación de Alta Calidad
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#6C757D',
              textAlign: 'center',
              fontSize: '1.125rem',
              fontWeight: 400
            }}>
              Monitoreo de procesos y niveles de riesgo
            </Typography>
          </Box>

          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ 
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: '0'
              },
              overflowX: 'auto',
              maxWidth: '100%',
              width: '100%',
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
              <Table aria-label="tabla de alta calidad" sx={{ 
                tableLayout: { xs: 'auto', md: 'fixed' }, 
                width: '100%',
                ml: 0
              }}>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)'
                  }}>
                    <TableCell sx={{ 
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#495057',
                      py: 3,
                      px: { xs: 1, sm: 2, md: 3 },
                      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      borderBottom: '2px solid rgba(0,0,0,0.06)',
                      width: { xs: '20%', sm: '25%', md: '30%' }
                    }}>
                      Proceso
                    </TableCell>
                    {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => (
                      <TableCell 
                        key={risk}
                        align="center" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: riskConfig[risk].color,
                          py: 3,
                          px: 2,
                          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                          borderBottom: '2px solid rgba(0,0,0,0.06)'
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          {getRiskIcon(risk)}
                          <span>{risk === 'SinRegistro' ? 'Sin Registro' : risk}</span>
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ 
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#495057',
                      py: 3,
                      px: 3,
                      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      borderBottom: '2px solid rgba(0,0,0,0.06)'
                    }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(counts).map((proceso, index) => (
                    <TableRow 
                      key={proceso}
                      hover
                      onClick={() => handleRowClick(`option${proceso === 'AAC' ? '3' : proceso === 'RAAC' ? '2' : '6'}`, proceso, proceso)}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          backgroundColor: 'rgba(178, 34, 34, 0.04)',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        },
                        '&:not(:last-child)': {
                          borderBottom: '1px solid rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <TableCell sx={{ 
                        py: 3,
                        px: { xs: 1, sm: 2, md: 3 },
                        borderBottom: 'none'
                      }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: processConfig[proceso].color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${alpha(processConfig[proceso].color, 0.2)}`
                          }}>
                            {React.cloneElement(processConfig[proceso].icon, { 
                              sx: { color: 'white', fontSize: '20px' } 
                            })}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{
                              fontWeight: 600,
                              color: '#212529',
                              fontSize: '1.125rem',
                              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            }}>
                              {processConfig[proceso].name}
                            </Typography>
                            <Typography variant="body2" sx={{
                              color: '#6C757D',
                              fontSize: '0.875rem',
                              mt: 0.5
                            }}>
                              {processConfig[proceso].description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => (
                        <TableCell key={risk} align="center" sx={{ py: 3, px: 2, borderBottom: 'none' }}>
                          <ModernRiskChip riskLevel={risk} value={counts[proceso][risk]} />
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ py: 3, px: 3, borderBottom: 'none' }}>
                        <Chip 
                          label={getTotalByProcess(proceso)}
                          sx={{ 
                            background: 'linear-gradient(135deg, #495057 0%, #343A40 100%)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            height: 40,
                            minWidth: '80px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(73, 80, 87, 0.2)'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Fila de totales */}
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                    borderTop: '2px solid rgba(0,0,0,0.06)'
                  }}>
                    <TableCell sx={{ 
                      py: 3,
                      px: 4,
                      borderBottom: 'none'
                    }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #B22222 0%, #DC143C 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(178, 34, 34, 0.2)'
                        }}>
                          <EmojiEventsIcon sx={{ color: 'white', fontSize: '20px' }} />
                        </Box>
                        <Typography variant="h6" sx={{
                          fontWeight: 700,
                          color: '#212529',
                          fontSize: '1.25rem',
                          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                        }}>
                          TOTAL GENERAL
                        </Typography>
                      </Box>
                    </TableCell>
                    {['Alto', 'Medio', 'Bajo', 'SinRegistro'].map((risk) => (
                      <TableCell key={risk} align="center" sx={{ py: 3, px: 2, borderBottom: 'none' }}>
                        <ModernRiskChip riskLevel={risk} value={getTotalByRisk(risk)} size="large" />
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ py: 3, px: 3, borderBottom: 'none' }}>
                      <Chip 
                        label={getGrandTotal()}
                        sx={{ 
                          background: 'linear-gradient(135deg, #B22222 0%, #8B1A1A 100%)',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '1.125rem',
                          height: 48,
                          minWidth: '100px',
                          borderRadius: '14px',
                          boxShadow: '0 4px 16px rgba(178, 34, 34, 0.3)'
                        }}
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

  const prepareReportData = async () => {
    try {
      const seguimientos = await Filtro7();
      const programas = await Filtro5();
      const fases = await Filtro10();

      const filteredSeguimientos = seguimientos.filter(seg => seg.usuario === user);

      const reportData = filteredSeguimientos.map(seg => {
        const programa = programas.find(prog => prog.id_programa === seg.id_programa);
        const fase = fases.find(f => f.id === seg.fase);

        return {
          timeStamp: seg.timestamp || '', 
          programaAcademico: programa ? programa['programa académico'] : '', 
          topic: seg.topic || '', 
          mensaje: seg.mensaje || '', 
          riesgo: seg.riesgo || '', 
          urlAdjunto: seg.url_adjunto || '', 
          fase: fase ? fase.fase : '' 
        };
      });

      return reportData;
    } catch (error) {
      console.error('Error al preparar datos del reporte:', error);
      throw error;
    }
  };

  const downloadSheet = (spreadsheetId) => {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    window.open(url, '_blank');
  };

  const handleGenerateReport = async (processType) => {
    setIsLoading(true);
    try {
      if (processType === 'AAC' || processType === 'RAAC' || processType === 'INT') {
        // Use the programDetails data which already includes risk information
        const programsData = programDetails[processType] || [];
        
        // Generate Excel file using XLSX
        const worksheet = XLSX.utils.json_to_sheet(programsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Filtrados');
        
        // Use specific filename for each process type
        const filename = processType === 'AAC' ? 'datos_AAC.xlsx' :
                        processType === 'RAAC' ? 'datos_RAAC.xlsx' :
                        processType === 'INT' ? 'datos_INT.xlsx' :
                        `datos_${processType}.xlsx`;
        XLSX.writeFile(workbook, filename);
      } else {
        // Original report generation for other process types
        const spreadsheetId = '1R4Ugfx43AoBjxjsEKYl7qZsAY8AfFNUN_gwcqETwgio';
        const sheetName = 'REPORTE';

        await clearSheetExceptFirstRow(spreadsheetId, sheetName);

        const reportData = await prepareReportData();
        const dataToSend = reportData.map(item => [
          item.timeStamp,
          item.programaAcademico,
          item.topic,
          item.mensaje,
          item.riesgo,
          item.urlAdjunto,
          item.fase
        ]);

        await sendDataToSheetNew(dataToSend);
        downloadSheet(spreadsheetId);
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Estilos para los botones del semáforo RAAC
  const getRaacButtonStyles = (buttonType) => {
    const isSelected = selectedRaacOptions.includes(buttonType);
    const styles = {
      white: { 
        backgroundColor: isSelected ? '#7e7e7e' : '#fff', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#7e7e7e',
        '&:hover': {
          backgroundColor: isSelected ? '#6c6c6c' : '#f5f5f5',
        }
      },
      green: { 
        backgroundColor: isSelected ? '#4caf50' : '#4caf4f36', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#4caf50',
        '&:hover': {
          backgroundColor: isSelected ? '#3d9140' : '#e8f5e9',
        }
      },
      yellow: { 
        backgroundColor: isSelected ? '#ffe600' : 'rgba(255, 235, 59, 0.288)', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#ffe600',
        '&:hover': {
          backgroundColor: isSelected ? '#d4c000' : '#fffde7',
        }
      },
      orange: { 
        backgroundColor: isSelected ? '#ff9800' : '#ff990079', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#ff9800',
        '&:hover': {
          backgroundColor: isSelected ? '#e68900' : '#fff8e1',
        }
      },
      orange2: { 
        backgroundColor: isSelected ? '#ff5722' : '#ff562275', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#ff5722',
        '&:hover': {
          backgroundColor: isSelected ? '#e64a19' : '#fbe9e7',
        }
      },
      red: { 
        backgroundColor: isSelected ? '#ee1809' : '#f443368e', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#ee1809',
        '&:hover': {
          backgroundColor: isSelected ? '#d81b60' : '#fce4ec',
        }
      }
    };

    return {
      color: styles[buttonType].color,
      backgroundColor: styles[buttonType].backgroundColor,
      borderColor: styles[buttonType].borderColor,
      border: `2px solid ${styles[buttonType].borderColor}`,
      borderRadius: '12px',
      fontWeight: 600,
      height: '80px',
      width: { xs: '100%', sm: '160px', md: '190px' },
      marginTop: '10px',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      px: 1,
      textAlign: 'center',
      '&:hover': styles[buttonType]['&:hover']
    };
  };

  // Manejador de clic para los botones del semáforo RAAC
  const handleRaacButtonClick = async (buttonType) => {
    if (selectedRow !== 'RAAC') return;
    
    try {
      setLoading(true);
      
      // Update selected options array
      setSelectedRaacOptions(prev => {
        if (prev.includes(buttonType)) {
          return prev.filter(item => item !== buttonType);
        } else {
          return [...prev, buttonType];
        }
      });
      
      const searchTermMap = {
        white: 'Vencido',
        green: 'Fase 1',
        yellow: 'Fase 2',
        orange: 'Fase 3',
        orange2: 'Fase 4',
        red: 'Fase 5',
        default: ''
      };
      
      // Get all programs
      let response;
      if (isCargo.includes('Posgrados')) {
        const filtered = await Filtro6({ searchTerm: '' });
        response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      } else {
        response = await Filtro6({ searchTerm: '' });
      }
      
      // Filter only those with ac_vigente = SI
      const allRaacPrograms = response.filter(item => item['ac vigente'] === 'SI');
      
      // Get all seguimientos to assign risk levels
      const seguimientos = await Filtro7();
      
      // Prepare updated selected options after the click
      const updatedSelectedOptions = prev => {
        if (prev.includes(buttonType)) {
          return prev.filter(item => item !== buttonType);
        } else {
          return [...prev, buttonType];
        }
      };
      
      const newSelectedOptions = updatedSelectedOptions(selectedRaacOptions);
      
      // If no button is selected after this click, show all programs
      if (newSelectedOptions.length === 0) {
        // Get all RRC programs with risk information
        const programsWithRisk = await loadProgramsWithRisk(allRaacPrograms, seguimientos);
        
        // Update programDetails state with all RRC programs
        setProgramDetails(prev => ({
          ...prev,
          RAAC: programsWithRisk
        }));
      } else {
        // Filter programs based on selected buttons
        const filteredResult = allRaacPrograms.filter(program => {
          return newSelectedOptions.some(option => {
            const searchTerm = searchTermMap[option];
            return program['fase rac'] === searchTerm;
          });
        });
        
        // Get RRC programs with risk information
        const programsWithRisk = await loadProgramsWithRisk(filteredResult, seguimientos);
        
        // Update programDetails state with filtered RRC programs
        setProgramDetails(prev => ({
          ...prev,
          RAAC: programsWithRisk
        }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al filtrar programas RAAC:', error);
      setLoading(false);
    }
  };
  
  // Helper function to load programs with risk information
  const loadProgramsWithRisk = async (programs, seguimientos) => {
    return programs.map(program => {
      // Find the latest seguimiento for this program
      const programSeguimientos = seguimientos.filter(seg => seg.id_programa === program.id_programa);
      let latestSeguimiento = null;
      
      if (programSeguimientos.length > 0) {
        latestSeguimiento = programSeguimientos.reduce((prev, current) => {
          return new Date(current.timestamp) > new Date(prev.timestamp) ? current : prev;
        });
      }
      
      // Return program with risk information
      return {
        ...program,
        riesgo: latestSeguimiento ? latestSeguimiento.riesgo : 'SinRegistro',
        mensaje: latestSeguimiento ? latestSeguimiento.mensaje : 'Sin información'
      };
    });
  };

  // Load RAAC programs when RAAC section is first viewed
  useEffect(() => {
    if (selectedRow === 'RAAC') {
      const loadRaacPrograms = async () => {
        try {
          setLoading(true);
          
          // Reset selected options so no buttons are preselected
          setSelectedRaacOptions([]);
          
          // Get all programs
          let response;
          if (isCargo.includes('Posgrados')) {
            const filtered = await Filtro6({ searchTerm: '' });
            response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
          } else {
            response = await Filtro6({ searchTerm: '' });
          }
          
          // Filter only those with ac_vigente = SI
          const allRaacPrograms = response.filter(item => item['ac vigente'] === 'SI');
          
          // Get all seguimientos to assign risk levels
          const seguimientos = await Filtro7();
          
          // Get all RAAC programs with risk information
          const programsWithRisk = await loadProgramsWithRisk(allRaacPrograms, seguimientos);
          
          // Update programDetails state with all RAAC programs
          setProgramDetails(prev => ({
            ...prev,
            RAAC: programsWithRisk
          }));
          
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar programas RAAC:', error);
          setLoading(false);
        }
      };
      
      loadRaacPrograms();
    }
  }, [selectedRow, isCargo]);

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box className="content content-with-sidebar" sx={{ 
        background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
        minHeight: '100vh',
        pt: 4,
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 'calc(100% - 10px)',
        maxWidth: '100%',
        ml: { xs: 0, sm: 0, md: '20px', lg: '40px' },
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ 
          width: '100%', 
          maxWidth: { xs: '100%', sm: '100%', md: '1280px', lg: '1450px' },
          px: { xs: 1, sm: 2, md: 2, lg: 2 },
          margin: '0 auto',
          position: 'relative',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '60vh' 
            }}>
              <CircularProgress sx={{ color: '#B22222' }} />
              <Typography sx={{ mt: 2, color: '#6C757D' }}>Cargando información...</Typography>
            </Box>
          ) : (
            selectedRow ? <DetailedProcessView /> : <GeneralProcessTable />
          )}
        </Box>
      </Box>
    </>
  );
};

export default AltaCalidad;