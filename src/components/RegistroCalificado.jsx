import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filtro2, Filtro4, Filtro5, Filtro7, Filtro10, clearSheetExceptFirstRow, sendDataToSheetNew } from '../service/data';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/registroCalificado.css';
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
  ButtonGroup,
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
import PieChartIcon from '@mui/icons-material/PieChart';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RuleIcon from '@mui/icons-material/Rule';
import SummarizeIcon from '@mui/icons-material/Summarize';
import * as XLSX from 'xlsx';

const RegistroCalificado = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [counts, setCounts] = useState({
    CREA: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    MOD: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    RRC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 }
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
  const [selectedModOptions, setSelectedModOptions] = useState(['option1', 'option2']);
  
  // RRC phase button states
  const [clickedRrcButton, setClickedRrcButton] = useState(null);
  const [selectedRrcOptions, setSelectedRrcOptions] = useState([]);
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');
  const [rrcProgramCounts, setRrcProgramCounts] = useState({
    white: 0,  // PROGRAMAS VENCIDOS
    green: 0,  // AÑO Y 6 MESES
    yellow: 0, // 4 AÑOS ANTES DEL VENCIMIENTO
    orange: 0, // 2 AÑOS ANTES DEL VENCIMIENTO
    orange2: 0, // 18 MESES ANTES DEL VENCIMIENTO
    red: 0     // AÑO DE VENCIMIENTO
  });

  const [selectedRisk, setSelectedRisk] = useState(null);
  const [filteredByRisk, setFilteredByRisk] = useState(false);

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
      CREA: programas.filter(item => item['estado'] === 'En Creación').map(item => item.id_programa),
      MOD: programas.filter(item => item['mod'] === 'SI').map(item => item.id_programa),
      RRC: programas.filter(item => item['rc vigente'] === 'SI' && item['fase rrc'] !== 'N/A').map(item => item.id_programa)
    };

    const newCounts = {
      CREA: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      MOD: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      RRC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 }
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
  const riskConfig = useMemo(() => ({
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
  }), []);

  const processConfig = useMemo(() => ({
    CREA: {
      name: 'Creación',
      icon: <TrendingUpIcon />,
      color: '#B22222',
      description: 'Programas en proceso de creación'
    },
    MOD: {
      name: 'Modificación',
      icon: <AssignmentIcon />,
      color: '#B22222',
      description: 'Programas en proceso de modificación'
    },
    RRC: {
      name: 'Renovación RC',
      icon: <RuleIcon />,
      color: '#B22222',
      description: 'Renovación de Registro Calificado'
    }
  }), []);

  const getRiskColor = useCallback((riskLevel) => riskConfig[riskLevel]?.backgroundColor || 'white', [riskConfig]);
  const getRiskIcon = useCallback((riskLevel) => riskConfig[riskLevel]?.icon || null, [riskConfig]);
  
  const getTotalByProcess = useCallback((proceso) => {
    return counts[proceso].Alto + counts[proceso].Medio + counts[proceso].Bajo + counts[proceso].SinRegistro;
  }, [counts]);
  
  const getTotalByRisk = useCallback((riskLevel) => {
    return counts.CREA[riskLevel] + counts.MOD[riskLevel] + counts.RRC[riskLevel];
  }, [counts]);
  
  const getGrandTotal = useCallback(() => {
    return Object.keys(counts).reduce((total, proceso) => {
      return total + getTotalByProcess(proceso);
    }, 0);
  }, [counts, getTotalByProcess]);

  const handleRowClick = useCallback((buttonValue, globalVar, rowKey) => {
    if (buttonValue === 'Creación') {
      navigate('/creacion-programa');
      return;
    }
    
    setSelectedRow(rowKey);
    setSelectedValue(buttonValue);
    setProgramasVisible(false);
    setGlobalVariable(globalVar);
  }, [navigate]);

  const handleBackClick = useCallback(() => {
    setSelectedRow(null);
    setSelectedValue(null);
    setProgramasVisible(false);
  }, []);

  const handleNavigateToProgram = useCallback((program) => {
    const programData = {
        ...program,
        globalVariable: selectedRow,
      userEmail: sessionStorage.getItem('userEmail')
    };

    navigate('/program_details', { 
      state: programData,
      replace: true
    });
  }, [navigate, selectedRow]);

  // Manejar clic en tarjeta de riesgo para filtrar programas
  const handleRiskCardClick = useCallback((risk) => {
    if (selectedRisk === risk) {
      // Si ya está seleccionado, deseleccionar y mostrar todos
      setSelectedRisk(null);
      setFilteredByRisk(false);
    } else {
      // Seleccionar y filtrar por este riesgo
      setSelectedRisk(risk);
      setFilteredByRisk(true);
    }
  }, [selectedRisk]);

  const getTitle = useCallback(() => {
    switch (selectedRow) {
      case 'CREA':
        return 'Programas en Proceso de Creación';
      case 'MOD':
        return 'Programas en Proceso de Modificación';
      case 'RRC':
        return 'Programas en Proceso de Renovación Registro Calificado';
      default:
        return 'Procesos de Calidad - Registro Calificado';
    }
  }, [selectedRow]);

  // Componente ModernRiskChip
  const ModernRiskChip = ({ riskLevel, value, size = 'medium' }) => {
    // Default to SinRegistro if riskLevel is undefined or not in riskConfig
    const config = riskLevel && riskConfig[riskLevel] ? riskConfig[riskLevel] : riskConfig['SinRegistro'];
    
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
            
            {/* Botones de filtro para MOD (Sustanciales/No Sustanciales) */}
            {selectedRow === 'MOD' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <ButtonGroup sx={{ gap: '10px' }}>
                  <Button
                    value="option1"
                    sx={getModButtonStyles('option1')}
                    onClick={() => handleModButtonClick('option1')}
                  >
                    Sustanciales
                  </Button>
                  <Button
                    value="option2"
                    sx={getModButtonStyles('option2')}
                    onClick={() => handleModButtonClick('option2')}
                  >
                    No Sustanciales
                  </Button>
                </ButtonGroup>
              </Box>
            )}
            
            {/* Botones de fases para RRC (Semáforo) */}
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
                {[
                  { type: 'white', label: 'PROGRAMAS VENCIDOS', count: rrcProgramCounts.white },
                  { type: 'green', label: 'AÑO Y 6 MESES', count: rrcProgramCounts.green },
                  { type: 'yellow', label: '4 AÑOS ANTES DEL VENCIMIENTO', count: rrcProgramCounts.yellow },
                  { type: 'orange', label: '2 AÑOS ANTES DEL VENCIMIENTO', count: rrcProgramCounts.orange },
                  { type: 'orange2', label: '18 MESES ANTES DEL VENCIMIENTO', count: rrcProgramCounts.orange2 },
                  { type: 'red', label: 'AÑO DE VENCIMIENTO', count: rrcProgramCounts.red }
                ].map(({ type, label, count }) => (
                  <Button
                    key={type}
                    onClick={() => handleRrcButtonClick(type)}
                    sx={getRrcButtonStyles(type)}
                  >
                    {label}
                    <Box component="span" sx={{ 
                      display: 'block',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      mt: 0.5
                    }}>
                      {count !== 0 ? count : loading ? <CircularProgress size={20} /> : '0'}
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
                        onClick={() => handleRiskCardClick(risk)}
                        onMouseEnter={() => setHoveredCard(risk)}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{ 
                          borderRadius: '20px',
                          border: `2px solid ${selectedRisk === risk ? config.color : config.borderColor}`,
                          backgroundColor: selectedRisk === risk ? alpha(config.color, 0.15) : config.backgroundColor,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: hoveredCard === risk || selectedRisk === risk ? 'translateY(-8px)' : 'translateY(0)',
                          boxShadow: hoveredCard === risk || selectedRisk === risk
                            ? `0 12px 32px ${alpha(config.color, 0.15)}`
                            : `0 2px 8px ${alpha(config.color, 0.08)}`,
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

            {/* Tabla de programas */}
            <Card sx={{ 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.02)',
              width: '100%'
            }}>
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: '#212529',
                    fontSize: '1.25rem',
                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    Listado de Programas
                    {selectedRisk && (
                      <span style={{ 
                        color: riskConfig[selectedRisk].color,
                        marginLeft: '10px'
                      }}>
                        • Filtrado por: {selectedRisk === 'SinRegistro' ? 'Sin Registro' : `${selectedRisk} Riesgo`}
                      </span>
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6C757D',
                    mt: 0.5
                  }}>
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
                    onClick={() => {
                      setSelectedRisk(null);
                      setFilteredByRisk(false);
                    }}
                    sx={{
                      borderColor: '#6C757D',
                      color: '#6C757D',
                      '&:hover': {
                        borderColor: '#495057',
                        backgroundColor: 'rgba(108, 117, 125, 0.04)',
                      }
                    }}
                  >
                    Limpiar filtro
                  </Button>
                )}
              </Box>
              
              {procesoProgramas.length === 0 ? (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 64, color: '#E9ECEF', mb: 2 }} />
                  <Typography variant="h6" sx={{ 
                    color: '#6C757D',
                    fontWeight: 500,
                    mb: 1
                  }}>
                    No hay programas disponibles
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ADB5BD' }}>
                    No se encontraron programas para este proceso
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
                              top: 0,
                              zIndex: 10
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(filteredByRisk 
                        ? procesoProgramas.filter(program => program.riesgo === selectedRisk)
                        : procesoProgramas
                      ).map((program, index) => (
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

  // Componente Crea para mantener compatibilidad
  const Crea = () => {
    if (selectedRow !== 'CREA') return null;
    return <DetailedProcessView />;
  };

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
      if (processType === 'CREA' || processType === 'MOD' || processType === 'RRC') {
        // Use the programDetails data which already includes risk information
        const programsData = programDetails[processType] || [];
        
        // Generate Excel file using XLSX
        const worksheet = XLSX.utils.json_to_sheet(programsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Filtrados');
        
        // Use specific filename for RRC to match Semaforo component
        const filename = processType === 'RRC' ? 'datos_RRC.xlsx' : `datos_${processType}.xlsx`;
        XLSX.writeFile(workbook, filename);
      } else {
        // Original report generation for other process types
        const spreadsheetId = '1R4Ugfx43AoBjxjsEKYl7qZsAY8AfFNUN_gwcqETwgio';
        const sheetName = `datos_${processType}`;

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

  // Función para manejar clics en los botones SUSTANCIALES y NO SUSTANCIALES
  const handleModButtonClick = async (buttonValue) => {
    if (selectedRow !== 'MOD') return;
    
    try {
      setLoading(true);
      
      // Get all programs
      let response;
      if (isCargo.includes('Posgrados')) {
        const filtered = await Filtro5();
        response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      } else {
        response = await Filtro5();
      }
      
      // Filter only those with mod = SI
      const allModPrograms = response.filter(item => item['mod'] === 'SI');
      
      // Get all seguimientos to assign risk levels
      const seguimientos = await Filtro7();
      
      // Show all MOD programs initially, without filtering by mod_sus
      const filteredResult = allModPrograms;
      
      // Assign risk levels to filtered programs
      setSelectedModOptions(prevSelectedValues => {
        let newSelectedValues;

        if (prevSelectedValues.includes(buttonValue)) {
          newSelectedValues = prevSelectedValues.filter(val => val !== buttonValue);
        } else {
          newSelectedValues = [...prevSelectedValues, buttonValue];
        }

        // If no options selected, show all MOD programs with risk information
        if (newSelectedValues.length === 0) {
          const allProgramsWithRisk = allModPrograms.map(program => {
            const programSeguimientos = seguimientos.filter(s => s.id_programa === program.id_programa);
            
            if (programSeguimientos.length === 0) {
              return {
                ...program,
                riesgo: 'SinRegistro',
                mensaje: 'Sin información'
              };
            }
            
            const latestSeguimiento = programSeguimientos.reduce((prev, current) =>
              new Date(current.timestamp.split('/').reverse().join('-')) > 
              new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
            );
            
            return {
              ...program,
              riesgo: latestSeguimiento.riesgo || 'SinRegistro',
              mensaje: latestSeguimiento.mensaje || 'Sin información'
            };
          });
          
          const updatedProgramDetails = { ...programDetails };
          updatedProgramDetails.MOD = allProgramsWithRisk;
          setProgramDetails(updatedProgramDetails);
          setLoading(false);
          return newSelectedValues;
        }

        // Filter programs based on selected options
        let filteredResult = allModPrograms.filter(item => {
          if (newSelectedValues.includes('option1') && item['mod_sus'] === 'SI') {
            return true;
          }
          if (newSelectedValues.includes('option2') && item['mod_sus'] === 'NO') {
            return true;
          }
          return false;
        });

        // Assign risk levels to filtered programs
        const programsWithRisk = filteredResult.map(program => {
          // Find the latest seguimiento for this program
          const programSeguimientos = seguimientos.filter(s => s.id_programa === program.id_programa);
          
          if (programSeguimientos.length === 0) {
            return {
              ...program,
              riesgo: 'SinRegistro',
              mensaje: 'Sin información'
            };
          }
          
          // Get the most recent seguimiento
          const latestSeguimiento = programSeguimientos.reduce((prev, current) =>
            new Date(current.timestamp.split('/').reverse().join('-')) > 
            new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
          );
          
          return {
            ...program,
            riesgo: latestSeguimiento.riesgo || 'SinRegistro',
            mensaje: latestSeguimiento.mensaje || 'Sin información'
          };
        });

        // Update programDetails with the filtered data
        const updatedProgramDetails = { ...programDetails };
        updatedProgramDetails.MOD = programsWithRisk;
        
        setProgramDetails(updatedProgramDetails);
        setLoading(false);
        return newSelectedValues;
      });
    } catch (error) {
      console.error('Error al filtrar datos de modificación:', error);
      setLoading(false);
    }
  };
  
  // Función para comprobar si un botón está seleccionado
  const isModButtonSelected = (buttonValue) => {
    return selectedModOptions.includes(buttonValue);
  };

  // Estilos para los botones SUSTANCIALES y NO SUSTANCIALES
  const getModButtonStyles = (buttonValue) => {
    return {
      color: isModButtonSelected(buttonValue) ? 'white' : '#B22222',
      backgroundColor: isModButtonSelected(buttonValue) ? '#B22222' : 'transparent',
      border: `2px solid #B22222`,
      borderRadius: '12px',
      fontWeight: 600,
      width: '300px',
      height: '50px',
      marginTop: '10px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: isModButtonSelected(buttonValue) ? '#8B1A1A' : 'rgba(178, 34, 34, 0.08)'
      }
    };
  };

  // Estilos para los botones del semáforo RRC
  const getRrcButtonStyles = (buttonType) => {
    const isSelected = selectedRrcOptions.includes(buttonType);
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
          backgroundColor: isSelected ? '#e6cf00' : '#fffde7',
        }
      },
      orange: { 
        backgroundColor: isSelected ? '#ff9800' : '#ff990079', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#ff9800',
        '&:hover': {
          backgroundColor: isSelected ? '#e68900' : '#fff3e0',
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
          backgroundColor: isSelected ? '#d81508' : '#ffebee',
        }
      }
    };

    return {
      fontWeight: 600,
      padding: '12px 20px',
      borderRadius: '8px',
      border: '2px solid',
      margin: '0 5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textTransform: 'none',
      minWidth: '200px',
      ...styles[buttonType]
    };
  };

  // Manejador de clic para los botones del semáforo RRC
  const handleRrcButtonClick = async (buttonType) => {
    if (selectedRow !== 'RRC') return;
    
    try {
      setLoading(true);
      
      // Get all programs
      let response;
      if (isCargo.includes('Posgrados')) {
        const filtered = await Filtro2({ searchTerm: '' });
        response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      } else {
        response = await Filtro2({ searchTerm: '' });
      }
      
      // Filter only those with rc_vigente = SI
      const allRrcPrograms = response.filter(item => item['rc vigente'] === 'SI');
      
      // Get all seguimientos to assign risk levels
      const seguimientos = await Filtro7();
      
      // Process selected options
      setSelectedRrcOptions(prevSelectedValues => {
        let newSelectedValues;

        if (prevSelectedValues.includes(buttonType)) {
          newSelectedValues = prevSelectedValues.filter(val => val !== buttonType);
        } else {
          newSelectedValues = [...prevSelectedValues, buttonType];
        }
        
        // If no options selected, show all RRC programs with risk information
        if (newSelectedValues.length === 0) {
          const allProgramsWithRisk = allRrcPrograms.map(program => {
            const programSeguimientos = seguimientos.filter(s => s.id_programa === program.id_programa);
            
            if (programSeguimientos.length === 0) {
              return {
                ...program,
                riesgo: 'SinRegistro',
                mensaje: 'Sin información'
              };
            }
            
            const latestSeguimiento = programSeguimientos.reduce((prev, current) =>
              new Date(current.timestamp.split('/').reverse().join('-')) > 
              new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
            );
            
            return {
              ...program,
              riesgo: latestSeguimiento.riesgo || 'SinRegistro',
              mensaje: latestSeguimiento.mensaje || 'Sin información'
            };
          });
          
          const updatedProgramDetails = { ...programDetails };
          updatedProgramDetails.RRC = allProgramsWithRisk;
          setProgramDetails(updatedProgramDetails);
          setLoading(false);
          return newSelectedValues;
        }
        
        // Map of button types to their corresponding fase rrc values
        const phaseMap = {
          white: 'Vencido',
          green: 'Fase 1',
          yellow: 'Fase 2',
          orange: 'Fase 3',
          orange2: 'Fase 4',
          red: 'Fase 5'
        };
        
        // Filter programs based on selected phases
        const filteredResult = allRrcPrograms.filter(item => {
          return newSelectedValues.some(buttonType => item['fase rrc'] === phaseMap[buttonType]);
        });
        
        // Assign risk levels to filtered programs
        const programsWithRisk = filteredResult.map(program => {
          // Find the latest seguimiento for this program
          const programSeguimientos = seguimientos.filter(s => s.id_programa === program.id_programa);
          
          if (programSeguimientos.length === 0) {
            return {
              ...program,
              riesgo: 'SinRegistro',
              mensaje: 'Sin información'
            };
          }
          
          // Get the most recent seguimiento
          const latestSeguimiento = programSeguimientos.reduce((prev, current) =>
            new Date(current.timestamp.split('/').reverse().join('-')) > 
            new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
          );
          
          return {
            ...program,
            riesgo: latestSeguimiento.riesgo || 'SinRegistro',
            mensaje: latestSeguimiento.mensaje || 'Sin información'
          };
        });
        
        // Update programDetails with the filtered data
        const updatedProgramDetails = { ...programDetails };
        updatedProgramDetails.RRC = programsWithRisk;
        setProgramDetails(updatedProgramDetails);
        setLoading(false);
        return newSelectedValues;
      });
    } catch (error) {
      console.error('Error al filtrar datos de RRC:', error);
      setLoading(false);
    }
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
                Registro Calificado
              </Typography>
            </Box>
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
              <Table aria-label="tabla de registro calificado" sx={{ 
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
                      onClick={() => handleRowClick(`option${proceso === 'CREA' ? '4' : proceso === 'MOD' ? '5' : '1'}`, proceso, proceso)}
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
                      <Typography variant="h6" sx={{
                        fontWeight: 700,
                        color: '#212529',
                        fontSize: '1.25rem',
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        TOTAL GENERAL
                      </Typography>
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

  useEffect(() => {
    if (selectedRow === 'MOD') {
      // Load all MOD programs with risk information
      const loadModPrograms = async () => {
        try {
          setLoading(true);
          let response;
          if (isCargo.includes('Posgrados')) {
            const filtered = await Filtro5();
            response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
          } else {
            response = await Filtro5();
          }
          
          // Filter only those with mod = SI
          const allModPrograms = response.filter(item => item['mod'] === 'SI');
          
          // Get all seguimientos to assign risk levels
          const seguimientos = await Filtro7();
          
          // Show all MOD programs initially, without filtering by mod_sus
          const filteredResult = allModPrograms;
          
          // Assign risk levels to filtered programs
          const programsWithRisk = filteredResult.map(program => {
            // Find the latest seguimiento for this program
            const programSeguimientos = seguimientos.filter(s => s.id_programa === program.id_programa);
            
            if (programSeguimientos.length === 0) {
              return {
                ...program,
                riesgo: 'SinRegistro',
                mensaje: 'Sin información'
              };
            }
            
            // Get the most recent seguimiento
            const latestSeguimiento = programSeguimientos.reduce((prev, current) =>
              new Date(current.timestamp.split('/').reverse().join('-')) > 
              new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
            );
            
            return {
              ...program,
              riesgo: latestSeguimiento.riesgo || 'SinRegistro',
              mensaje: latestSeguimiento.mensaje || 'Sin información'
            };
          });
          
          // Update programDetails with the filtered data
          const updatedProgramDetails = { ...programDetails };
          updatedProgramDetails.MOD = programsWithRisk;
          
          setProgramDetails(updatedProgramDetails);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar datos de modificación:', error);
          setLoading(false);
        }
      };
      
      loadModPrograms();
    } else if (selectedRow === 'RRC') {
      // Load all RRC programs when RRC section is viewed
      const loadRrcPrograms = async () => {
        try {
          setLoading(true);
          
          // Reset selected RRC options so no buttons are preselected
          setSelectedRrcOptions([]);
          
          // Get all programs
          let response;
          if (isCargo.includes('Posgrados')) {
            const filtered = await Filtro2({ searchTerm: '' });
            response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
          } else {
            response = await Filtro2({ searchTerm: '' });
          }
          
          // Filter only those with rc_vigente = SI
          const rrcPrograms = response.filter(item => item['rc vigente'] === 'SI');
          
          // Get all seguimientos to assign risk levels
          const seguimientos = await Filtro7();
          
          // Assign risk levels to RRC programs
          const programsWithRisk = rrcPrograms.map(program => {
            // Find the latest seguimiento for this program
            const programSeguimientos = seguimientos.filter(s => s.id_programa === program.id_programa);
            
            if (programSeguimientos.length === 0) {
              return {
                ...program,
                riesgo: 'SinRegistro',
                mensaje: 'Sin información'
              };
            }
            
            // Get the most recent seguimiento
            const latestSeguimiento = programSeguimientos.reduce((prev, current) =>
              new Date(current.timestamp.split('/').reverse().join('-')) > 
              new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
            );
            
            return {
              ...program,
              riesgo: latestSeguimiento.riesgo || 'SinRegistro',
              mensaje: latestSeguimiento.mensaje || 'Sin información'
            };
          });
          
          // Count programs for each RRC phase
          const rrcCounts = {
            white: response.filter(item => item['fase rrc'] === 'Vencido' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            green: response.filter(item => item['fase rrc'] === 'Fase 1' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            yellow: response.filter(item => item['fase rrc'] === 'Fase 2' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            orange: response.filter(item => item['fase rrc'] === 'Fase 3' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            orange2: response.filter(item => item['fase rrc'] === 'Fase 4' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            red: response.filter(item => item['fase rrc'] === 'Fase 5' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length
          };
          
          setRrcProgramCounts(rrcCounts);
          
          // Update programDetails with the filtered data
          const updatedProgramDetails = { ...programDetails };
          updatedProgramDetails.RRC = programsWithRisk;
          
          setProgramDetails(updatedProgramDetails);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar datos de RRC:', error);
          setLoading(false);
        }
      };
      
      loadRrcPrograms();
    }
  }, [selectedRow, isCargo]);

  // Update RRC program counts when programDetails.RRC changes
  useEffect(() => {
    if (selectedRow === 'RRC' && programDetails.RRC) {
      try {
        // Get the latest data for RRC programs
        const loadRrcCounts = async () => {
          let response;
          if (isCargo.includes('Posgrados')) {
            const filtered = await Filtro2({ searchTerm: '' });
            response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
          } else {
            response = await Filtro2({ searchTerm: '' });
          }
          
          // Count programs for each RRC phase
          const rrcCounts = {
            white: response.filter(item => item['fase rrc'] === 'Vencido' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            green: response.filter(item => item['fase rrc'] === 'Fase 1' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            yellow: response.filter(item => item['fase rrc'] === 'Fase 2' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            orange: response.filter(item => item['fase rrc'] === 'Fase 3' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            orange2: response.filter(item => item['fase rrc'] === 'Fase 4' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length,
            red: response.filter(item => item['fase rrc'] === 'Fase 5' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length
          };
          
          setRrcProgramCounts(rrcCounts);
        };
        
        loadRrcCounts();
      } catch (error) {
        console.error('Error al actualizar conteo de programas RRC:', error);
      }
    }
  }, [selectedRow, programDetails.RRC, isCargo]);

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

export default RegistroCalificado;