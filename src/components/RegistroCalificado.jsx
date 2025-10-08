import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filtro2, Filtro5, Filtro7 } from '../service/data';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/registroCalificado.css';
import {
  CircularProgress,
  Box,
  Typography,
  alpha
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import MediumIcon from '@mui/icons-material/ReportProblem';
import LowIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RuleIcon from '@mui/icons-material/Rule';
import * as XLSX from 'xlsx';
import DetailedProcessView from './registroCalificado/DetailedProcessView';
import GeneralProcessTable from './registroCalificado/GeneralProcessTable';

const RegistroCalificado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [counts, setCounts] = useState({
    CREA: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    MOD: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    RRC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 }
  });
  const [isCargo, setCargo] = useState([' ']);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [programDetails, setProgramDetails] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState('');
  const [selectedModOptions, setSelectedModOptions] = useState(['option1', 'option2']);
  const [selectedRrcOptions, setSelectedRrcOptions] = useState([]);
  const [rrcProgramCounts, setRrcProgramCounts] = useState({
    white: 0,
    green: 0,
    yellow: 0,
    orange: 0,
    orange2: 0,
    red: 0
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

  // Resetear estado cuando se navega desde el Sidebar
  useEffect(() => {
    if (location.state?.fromSidebar) {
      setSelectedRow(null);
      setSelectedRisk(null);
      setFilteredByRisk(false);
      
      // Limpiar el state para que no afecte futuras navegaciones
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    // Mantener solo el estado necesario para navegación y vista
  }, [navigate]);

  const handleBackClick = useCallback(() => {
    setSelectedRow(null);
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

  

  const handleGenerateReport = async (processType) => {
    setIsLoading(true);
    try {
      const programsData = programDetails[processType] || [];
      const worksheet = XLSX.utils.json_to_sheet(programsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Filtrados');
      const filename = processType === 'RRC' ? 'datos_RRC.xlsx' : `datos_${processType}.xlsx`;
      XLSX.writeFile(workbook, filename);
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
          // Update MOD counts to reflect currently displayed programs
          const newCounts = { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 };
          allProgramsWithRisk.forEach(p => {
            if (newCounts[p.riesgo] !== undefined) newCounts[p.riesgo] += 1;
          });
          setCounts(prev => ({ ...prev, MOD: newCounts }));
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
          
          // Map RRC phase to desired risk bands
          const fase = program['fase rrc'];
          let riesgoMap = 'SinRegistro';
          if (fase === 'Vencido' || fase === 'Fase 5') riesgoMap = 'Alto';
          else if (fase === 'Fase 4' || fase === 'Fase 3') riesgoMap = 'Medio';
          else if (fase === 'Fase 2') riesgoMap = 'Bajo';
          else if (fase === 'Fase 1' || !fase || fase === 'N/A') riesgoMap = 'SinRegistro';
          
          return {
            ...program,
            riesgo: riesgoMap,
            mensaje: latestSeguimiento.mensaje || 'Sin información'
          };
        });

        // Update programDetails with the filtered data
        const updatedProgramDetails = { ...programDetails };
        updatedProgramDetails.MOD = programsWithRisk;
        
        setProgramDetails(updatedProgramDetails);
        // Update MOD counts to reflect filtered programs
        const newCounts = { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 };
        programsWithRisk.forEach(p => {
          if (newCounts[p.riesgo] !== undefined) newCounts[p.riesgo] += 1;
        });
        setCounts(prev => ({ ...prev, MOD: newCounts }));
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
      },
      gray: { 
        backgroundColor: isSelected ? '#6C757D' : 'rgba(108, 117, 125, 0.08)', 
        color: isSelected ? 'white' : '#000', 
        borderColor: '#6C757D',
        '&:hover': {
          backgroundColor: isSelected ? '#5a6268' : '#e9ecef',
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
          red: 'Fase 5',
          gray: 'SinRegistro'
        };
        
        // Filter programs based on selected phases
        const filteredResult = allRrcPrograms.filter(item => {
          return newSelectedValues.some(buttonType => {
            if (buttonType === 'gray') {
              // Para SinRegistro, filtrar programas sin fase rrc o con fase rrc vacía/N/A
              return !item['fase rrc'] || item['fase rrc'] === '' || item['fase rrc'] === 'N/A';
            }
            return item['fase rrc'] === phaseMap[buttonType];
          });
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
            
            const fase = program['fase rrc'];
            let riesgoMap = 'SinRegistro';
            if (fase === 'Vencido' || fase === 'Fase 5') riesgoMap = 'Alto';
            else if (fase === 'Fase 4' || fase === 'Fase 3') riesgoMap = 'Medio';
            else if (fase === 'Fase 2') riesgoMap = 'Bajo';
            else if (fase === 'Fase 1' || !fase || fase === 'N/A') riesgoMap = 'SinRegistro';
            
            return {
              ...program,
              riesgo: riesgoMap,
              mensaje: latestSeguimiento.mensaje || 'Sin información'
            };
          });
          
          // Update programDetails with the filtered data
          const updatedProgramDetails = { ...programDetails };
          updatedProgramDetails.MOD = programsWithRisk;
          
          setProgramDetails(updatedProgramDetails);
          // Update MOD counts based on initial load
          const newCounts = { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 };
          programsWithRisk.forEach(p => {
            if (newCounts[p.riesgo] !== undefined) newCounts[p.riesgo] += 1;
          });
          setCounts(prev => ({ ...prev, MOD: newCounts }));
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
            
            const fase = program['fase rrc'];
            let riesgoMap = 'SinRegistro';
            if (fase === 'Vencido' || fase === 'Fase 5') riesgoMap = 'Alto';
            else if (fase === 'Fase 4' || fase === 'Fase 3') riesgoMap = 'Medio';
            else if (fase === 'Fase 2') riesgoMap = 'Bajo';
            else if (fase === 'Fase 1' || !fase || fase === 'N/A') riesgoMap = 'SinRegistro';
            
            return {
              ...program,
              riesgo: riesgoMap,
              mensaje: latestSeguimiento.mensaje || 'Sin información'
            };
          });
          
          // Count programs for each RRC phase
          const rrcCounts = {
            white: response.filter(item => item['fase rrc'] === 'Vencido' && item['rc vigente'] === 'SI').length,
            green: response.filter(item => item['fase rrc'] === 'Fase 2' && item['rc vigente'] === 'SI').length, // 4 años (Bajo)
            yellow: response.filter(item => item['fase rrc'] === 'Fase 3' && item['rc vigente'] === 'SI').length, // 2 años (Medio)
            orange: 0,
            orange2: response.filter(item => item['fase rrc'] === 'Fase 4' && item['rc vigente'] === 'SI').length, // 18 meses (Medio)
            red: response.filter(item => item['fase rrc'] === 'Fase 5' && item['rc vigente'] === 'SI').length // Año vencimiento (Alto)
          };
          
          setRrcProgramCounts(rrcCounts);
          
          // Update programDetails with the filtered data
          const updatedProgramDetails = { ...programDetails };
          updatedProgramDetails.RRC = programsWithRisk;
          
          setProgramDetails(updatedProgramDetails);
          // Update RRC counts based on initial load
          const newCounts = { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 };
          programsWithRisk.forEach(p => {
            if (newCounts[p.riesgo] !== undefined) newCounts[p.riesgo] += 1;
          });
          setCounts(prev => ({ ...prev, RRC: newCounts }));
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
            white: response.filter(item => item['fase rrc'] === 'Vencido' && item['rc vigente'] === 'SI').length,
            green: response.filter(item => item['fase rrc'] === 'Fase 2' && item['rc vigente'] === 'SI').length,
            yellow: response.filter(item => item['fase rrc'] === 'Fase 3' && item['rc vigente'] === 'SI').length,
            orange: 0,
            orange2: response.filter(item => item['fase rrc'] === 'Fase 4' && item['rc vigente'] === 'SI').length,
            red: response.filter(item => item['fase rrc'] === 'Fase 5' && item['rc vigente'] === 'SI').length
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
            selectedRow ? (
              <DetailedProcessView
                selectedRow={selectedRow}
                riskConfig={riskConfig}
                counts={counts}
                selectedRisk={selectedRisk}
                hoveredCard={hoveredCard}
                loading={loading}
                rrcProgramCounts={rrcProgramCounts}
                programDetails={programDetails}
                getTitle={getTitle}
                handleGenerateReport={handleGenerateReport}
                isLoading={isLoading}
                handleBackClick={handleBackClick}
                handleModButtonClick={handleModButtonClick}
                getModButtonStyles={getModButtonStyles}
                handleRrcButtonClick={handleRrcButtonClick}
                getRrcButtonStyles={getRrcButtonStyles}
                handleRiskCardClick={handleRiskCardClick}
                setHoveredCard={setHoveredCard}
                filteredByRisk={filteredByRisk}
                setSelectedRisk={setSelectedRisk}
                setFilteredByRisk={setFilteredByRisk}
                handleNavigateToProgram={handleNavigateToProgram}
              />
            ) : (
              <GeneralProcessTable
                counts={counts}
                riskConfig={riskConfig}
                processConfig={processConfig}
                getTotalByProcess={getTotalByProcess}
                getTotalByRisk={getTotalByRisk}
                getGrandTotal={getGrandTotal}
                handleRowClick={handleRowClick}
              />
            )
          )}
        </Box>
      </Box>
    </>
  );
};

export default RegistroCalificado;