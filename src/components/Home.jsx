// src/components/Home.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filtro5, Filtro7, Filtro10, clearSheetExceptFirstRow, sendDataToSheetNew } from '../service/data';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/home.css';
import { Pie } from 'react-chartjs-2';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  CircularProgress,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Box,
  TableHead,
  Fade,
  Grow,
  useMediaQuery
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from '@mui/material/styles';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const Home = () => {
  const [isCargo, setCargo] = useState([' ']);
  const [programData, setProgramData] = useState({
    activos: {
      pregrado: { universitario: 0, tecnologico: 0 },
      posgrado: {
        maestria: 0,
        especializacionUniversitaria: 0,
        especializacionMedicoQuirurgica: 0,
        doctorado: 0,
      },
      total: 0,
    },
    enCreacion: 0,
    inactivos: {
      desistidoInterno: 0,
      desistidoMEN: 0,
      desistidoMENSede: 0,
      inactivo: 0,
      inactivoSede: 0,
      inactivoVencidoRC: 0,
      negacionRC: 0,
      total: 0,
    },
    totalGeneral: 0,
  });

  // Estados para los programas próximos a vencer - FUNCIONALIDAD COMPLETA
  const [expiryCounts, setExpiryCounts] = useState({
    RRC: { oneYear: 0, twoYears: 0, threeYears: 0 },
    AAC: { oneYear: 0, twoYears: 0, threeYears: 0 },
  });
  
  const [expiryPrograms, setExpiryPrograms] = useState({
    RRC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
    AAC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
  });

  const [expiredRRCCount, setExpiredRRCCount] = useState(0);
  const [expiredRACCount, setExpiredRACCount] = useState(0);

  // Estados para las gráficas
  const [chartDataNivelAcademico, setChartDataNivelAcademico] = useState(null);
  const [chartDataNivelFormacion, setChartDataNivelFormacion] = useState(null);
  const [chartDataEscuelas, setChartDataEscuelas] = useState(null);
  const [filteredData2, setFilteredData2] = useState(null);
  const [selectedNivelAcademico, setSelectedNivelAcademico] = useState('Todos');
  const [selectedNivelFormacion, setSelectedNivelFormacion] = useState('Todos');
  const [selectedEscuela, setSelectedEscuela] = useState('Todos');
  const [chartsVisible, setChartsVisible] = useState(true);
  
  // Estados para el reporte de actividades
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState('');

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Funciones para obtener programas vencidos - MEMOIZADAS
  const getExpiredRRCPrograms = useCallback((programas) => {
    return programas.filter((program) => program['fase rrc'] === 'Vencido');
  }, []);

  const getExpiredRACPrograms = useCallback((programas) => {
    return programas.filter((program) => program['fase rac'] === 'Vencido');
  }, []);

  // Función para contar programas próximos a vencer - MEMOIZADA Y OPTIMIZADA
  const countExpiringPrograms = useCallback((programas) => {
    const currentYear = new Date().getFullYear();
    const counts = {
      RRC: { oneYear: 0, twoYears: 0, threeYears: 0 },
      AAC: { oneYear: 0, twoYears: 0, threeYears: 0 },
    };
  
    const expiringPrograms = {
      RRC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
      AAC: { oneYear: [], twoYears: [], threeYears: [], expired: [] },
    };
  
    programas.forEach(program => {
      const rrcYear = program['fechavencrc'] ? parseInt(program['fechavencrc'].split('/')[2]) : null;
      const aacYear = program['fechavencac'] ? parseInt(program['fechavencac'].split('/')[2]) : null;
  
      // Para programas RRC
      if (rrcYear) {
        if (rrcYear === currentYear + 1) {
          counts.RRC.oneYear++;
          expiringPrograms.RRC.oneYear.push(program);
        } else if (rrcYear === currentYear + 2) {
          counts.RRC.twoYears++;
          expiringPrograms.RRC.twoYears.push(program);
        } else if (rrcYear === currentYear + 3) {
          counts.RRC.threeYears++;
          expiringPrograms.RRC.threeYears.push(program);
        } else if (rrcYear < currentYear) {
          expiringPrograms.RRC.expired.push(program);
        }
      }
  
      // Para programas AAC
      if (aacYear) {
        if (aacYear === currentYear + 1) {
          counts.AAC.oneYear++;
          expiringPrograms.AAC.oneYear.push(program);
        } else if (aacYear === currentYear + 2) {
          counts.AAC.twoYears++;
          expiringPrograms.AAC.twoYears.push(program);
        } else if (aacYear === currentYear + 3) {
          counts.AAC.threeYears++;
          expiringPrograms.AAC.threeYears.push(program);
        } else if (aacYear < currentYear) {
          expiringPrograms.AAC.expired.push(program); 
        }
      }
    });
  
    setExpiryCounts(counts);
    setExpiryPrograms(expiringPrograms);
  }, []);

  // Manejador para navegación a programas vencidos - MEMOIZADO
  const handleExpiryClick = useCallback(() => {
    navigate('/programas-venc', { state: { expiryPrograms } });
  }, [navigate, expiryPrograms]);

  // Obtener los permisos del usuario y el nombre de usuario
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

  // Obtener los datos de los programas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Filtro5();
        //console.log('Datos obtenidos de Filtro5:', response);
        // Validar que response sea un array antes de usar filter
        if (!response || !Array.isArray(response)) {
          console.error('Error: La respuesta de Filtro5 no es un array válido:', response);
          return;
        }
        
        // Deduplicar programas SOLO cuando hay conflicto activo/inactivo:
        // - Si dos sedes están activas → Contar AMBAS
        // - Si una activa y otra inactiva → Contar solo la activa
        // - Si ambas inactivas → Contar solo una (preferir Cali)
        const programMap = new Map();
        
        response.forEach(item => {
          // Usar una clave única más robusta: combinar código SNIES válido + programa académico
          const sniesValido = item['codigo snies'] && 
                             !['En creación', 'En Creación', 'Negación RC', 'Desistido MEN', 'Desistido Interno', '??'].includes(item['codigo snies']);
          
          // Si tiene SNIES válido, usar eso + sede; si no, usar programa académico + sede
          // IMPORTANTE: Ahora incluimos la sede en la clave para que sedes activas cuenten por separado
          const key = sniesValido 
            ? `${item['codigo snies']}_${item['sede']}` 
            : `${item['programa académico']}_${item['sede']}`;
          
          if (!key) return;

          const existing = programMap.get(key);
          const esActivo = item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede';

          // Si no existe, agregarlo siempre
          if (!existing) {
            programMap.set(key, item);
            return;
          }

          const existingEsActivo = existing['estado'] === 'Activo' || existing['estado'] === 'Activo - Sede';

          // Si el actual está activo, siempre reemplazar (para tener la info más actualizada)
          if (esActivo) {
            programMap.set(key, item);
            return;
          }

          // Si el existente está activo y el actual no, mantener el existente
          if (existingEsActivo && !esActivo) {
            return;
          }

          // Si ambos están inactivos, mantener el primero que se encontró
        });

        const datosUnicos = Array.from(programMap.values());
        //console.log(`Programas totales: ${response.length}, Programas únicos después de deduplicar: ${datosUnicos.length}`);
        
        // Log detallado para debugging
        //console.log('=== ANÁLISIS DE CONTEO ===');
        //console.log('Programas activos por nivel de formación:');
        const activosPorNivel = {};
        datosUnicos.filter(item => item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede').forEach(item => {
          const nivel = item['nivel de formación'];
          activosPorNivel[nivel] = (activosPorNivel[nivel] || 0) + 1;
        });
        //console.table(activosPorNivel);
        
        const activosPregradoUniversitario = datosUnicos.filter(
          (item) =>
            // Incluir tanto 'Pregrado' como 'Universitario' en pregrado/posgrado
            (['Pregrado', 'Universitario'].includes(item['pregrado/posgrado']) ||
             item['pregrado/posgrado']?.toLowerCase().includes('pregrado')) &&
            item['nivel de formación'] === 'Universitario' &&
            (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
        ).length;

        const activosPregradoTecnologico = datosUnicos.filter(
          (item) =>
            item['pregrado/posgrado'] === 'Tecnológico' &&
            item['nivel de formación'] === 'Tecnológico' &&
            (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
        ).length;

        const activosPosgrado = {
          maestria: datosUnicos.filter(
            (item) =>
              item['nivel de formación'] === 'Maestría' &&
              (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
          ).length,
          especializacionUniversitaria: datosUnicos.filter(
            (item) =>
              item['nivel de formación'] === 'Especialización Universitaria' &&
              (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
          ).length,
          especializacionMedicoQuirurgica: datosUnicos.filter(
            (item) =>
              item['nivel de formación'] === 'Especialización Médico Quirúrgica' &&
              (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
          ).length,
          doctorado: datosUnicos.filter(
            (item) =>
              item['nivel de formación'] === 'Doctorado' &&
              (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
          ).length,
        };

        const enCreacion = datosUnicos.filter(
          (item) =>
            item['estado'] === 'En Creación' ||
            item['estado'] === 'En Creación - Sede'
        ).length;

        const inactivosDesistidoInterno = datosUnicos.filter(item => item['estado'] === 'Desistido Interno').length;
        const inactivosDesistidoMEN = datosUnicos.filter(item => item['estado'] === 'Desistido MEN').length;
        const inactivosDesistidoMENSede = datosUnicos.filter(item => item['estado'] === 'Desistido MEN - Sede').length;
        const inactivosInactivo = datosUnicos.filter(item => item['estado'] === 'Inactivo').length;
        const inactivosInactivoSede = datosUnicos.filter(item => item['estado'] === 'Inactivo - Sede').length;
        const inactivosInactivoVencidoRC = datosUnicos.filter(item => item['estado'] === 'Inactivo - Vencido RC').length;
        const inactivosNegacionRC = datosUnicos.filter(item => item['estado'] === 'Negación RC').length;

        const totalInactivos =
          inactivosDesistidoInterno +
          inactivosDesistidoMEN +
          inactivosDesistidoMENSede +
          inactivosInactivo +
          inactivosInactivoSede +
          inactivosInactivoVencidoRC +
          inactivosNegacionRC;

        const totalActivos =
          activosPregradoUniversitario +
          activosPregradoTecnologico +
          activosPosgrado.maestria +
          activosPosgrado.especializacionUniversitaria +
          activosPosgrado.especializacionMedicoQuirurgica +
          activosPosgrado.doctorado;
//console.log('Total Activos Calculado:', totalActivos);
        setProgramData({
          activos: {
            pregrado: {
              universitario: activosPregradoUniversitario,
              tecnologico: activosPregradoTecnologico,
            },
            posgrado: activosPosgrado,
            total: totalActivos,
          },
          enCreacion,
          inactivos: {
            desistidoInterno: inactivosDesistidoInterno,
            desistidoMEN: inactivosDesistidoMEN,
            desistidoMENSede: inactivosDesistidoMENSede,
            inactivo: inactivosInactivo,
            inactivoSede: inactivosInactivoSede,
            inactivoVencidoRC: inactivosInactivoVencidoRC,
            negacionRC: inactivosNegacionRC,
            total: totalInactivos,
          },
          totalGeneral: totalActivos + enCreacion + totalInactivos,
        });

        // Obtener los programas vencidos utilizando las funciones (con datos únicos)
        const expiredRRCPrograms = getExpiredRRCPrograms(datosUnicos);
        const expiredRACPrograms = getExpiredRACPrograms(datosUnicos);

        console.log('Programas RRC vencidos:', expiredRRCPrograms);
        console.log('Programas RAC vencidos:', expiredRACPrograms);

        // Actualizar el estado con los programas vencidos
        setExpiredRRCCount(expiredRRCPrograms.length);
        setExpiredRACCount(expiredRACPrograms.length);

        // Procesar conteo de programas próximos a vencer (con datos únicos)
        countExpiringPrograms(datosUnicos);

        setFilteredData2(datosUnicos);
        updateCharts(datosUnicos);
      } catch (error) {
        console.error('Error al filtrar datos:', error);
      }
    };

    fetchData();
  }, [getExpiredRRCPrograms, getExpiredRACPrograms, countExpiringPrograms]);

  // Función para actualizar las gráficas - MEMOIZADA
  const updateCharts = useCallback((data) => {
    let filteredData = data;
  
    if (selectedEscuela !== 'Todos') {
      filteredData = filteredData.filter(
        (item) => item['escuela'] === selectedEscuela &&
          (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
      );
    }
  
    if (selectedNivelAcademico !== 'Todos') {
      filteredData = filteredData.filter(
        (item) => item['pregrado/posgrado'] === selectedNivelAcademico &&
          (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
      );
    }
  
    if (selectedNivelFormacion !== 'Todos') {
      filteredData = filteredData.filter(
        (item) => item['nivel de formación'] === selectedNivelFormacion &&
          (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
      );
    }
  
    const activosPregrado = filteredData.filter(
      (item) =>
        item['pregrado/posgrado'] === 'Pregrado' &&
        (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
    ).length;
  
    const activosPosgrado = filteredData.filter(
      (item) =>
        item['pregrado/posgrado'] === 'Posgrado' &&
        (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede')
    ).length;
  
    const nivelFormacionCounts = filteredData.reduce((acc, item) => {
      if (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede') {
        const nivelFormacion = item['nivel de formación'];
        acc[nivelFormacion] = (acc[nivelFormacion] || 0) + 1;
      }
      return acc;
    }, {});
  
    const escuelaCounts = filteredData.reduce((acc, item) => {
      if (item['estado'] === 'Activo' || item['estado'] === 'Activo - Sede') {
        const escuela = item['escuela'];
        acc[escuela] = (acc[escuela] || 0) + 1;
      }
      return acc;
    }, {});
  
    // Paleta de colores moderna y minimalista
    const modernColors = {
      primary: ['#B22222', '#DC143C'],
      secondary: ['#6C757D', '#495057'],
      accent: ['#8B4513', '#A52A2A', '#7B3F00'],
      charts: [
        'rgba(178, 34, 34, 0.8)',   // Rojo (B22222)
        'rgba(108, 117, 125, 0.8)',  // Gris oscuro (6C757D)
        'rgba(220, 20, 60, 0.8)',    // Carmesí (DC143C)
        'rgba(73, 80, 87, 0.8)',     // Gris más oscuro (495057)
        'rgba(128, 0, 32, 0.8)',     // Burdeos (800020)
        'rgba(255, 131, 139, 0.8)'     // Siena (8B4513)
      ]
    };

    setChartDataNivelAcademico({
      labels: ['Pregrado', 'Posgrado'],
      datasets: [
        {
          label: 'Programas por Nivel Académico',
          data: [activosPregrado, activosPosgrado],
          backgroundColor: modernColors.primary,
          borderColor: modernColors.primary.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8,
        },
      ],
    });
  
    setChartDataNivelFormacion({
      labels: Object.keys(nivelFormacionCounts),
      datasets: [
        {
          label: 'Programas por Nivel de Formación',
          data: Object.values(nivelFormacionCounts),
          backgroundColor: modernColors.charts,
          borderColor: modernColors.charts.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8,
        },
      ],
    });
  
    setChartDataEscuelas({
      labels: Object.keys(escuelaCounts),
      datasets: [
        {
          label: 'Programas por Escuela',
          data: Object.values(escuelaCounts),
          backgroundColor: modernColors.charts,
          borderColor: modernColors.charts.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8,
        },
      ],
    });
  }, [selectedEscuela, selectedNivelAcademico, selectedNivelFormacion]);

  // Función para actualizar visibilidad de gráficos - MEMOIZADA
  const updateChartsVisibility = useCallback(() => {
    if (selectedNivelAcademico === 'Todos' && selectedNivelFormacion === 'Todos' && selectedEscuela === 'Todos') {
      setChartsVisible(true);
    } else {
      setChartsVisible(false);
    }
  }, [selectedNivelAcademico, selectedNivelFormacion, selectedEscuela]);
  
  const handleAcademicLevelClick = useCallback((nivelAcademico) => {
    setSelectedNivelAcademico(nivelAcademico);
    updateCharts(filteredData2);
    updateChartsVisibility();
  }, [filteredData2, updateChartsVisibility]);
  
  const handleLegendClick = useCallback((nivelFormacion) => {
    setSelectedNivelFormacion(nivelFormacion);
    updateCharts(filteredData2);
    updateChartsVisibility();
  }, [filteredData2, updateChartsVisibility]);
  
  const handleEscuelaClick = useCallback((escuela) => {
    setSelectedEscuela(escuela);
    updateCharts(filteredData2);
    updateChartsVisibility();
  }, [filteredData2, updateChartsVisibility]);

  const handleClick = useCallback(() => {
    navigate('/programas', { state: filteredData2 });
  }, [navigate, filteredData2]);

  // Preparar datos para el reporte - MEMOIZADA
  const prepareReportData = useCallback(async () => {
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
  }, [user]);

  const downloadSheet = useCallback((spreadsheetId) => {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    window.open(url, '_blank');
  }, []);

  const handleReporteActividades = useCallback(async () => {
    setIsLoading(true); 
    try {
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
    } catch (error) {
        console.error('Error al generar reporte:', error);
    } finally {
        setIsLoading(false); 
    }
  }, [prepareReportData, downloadSheet]);

  // Función para truncar texto largo en móviles - MEMOIZADA
  const truncateText = useCallback((text, maxLength = 20) => {
    if (!isMobile) return text;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }, [isMobile]);

  // Opciones de gráficos modernizadas - MEMOIZADAS
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 10,
        bottom: 10
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 9 : 11,
            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#495057'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#212529',
        bodyColor: '#495057',
        borderColor: '#E9ECEF',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          weight: '600'
        },
        bodyFont: {
          family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segue UI', Roboto, sans-serif",
          weight: '400'
        }
      },
      datalabels: {
        display: true,
        color: '#FFFFFF',
        font: {
          weight: 'bold',
          size: isMobile ? 11 : 14,
          family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        },
        formatter: (value) => {
          return value > 0 ? value : '';
        },
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 4,
        padding: 4,
        align: 'center',
        anchor: 'center'
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest'
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart'
    }
  }), [isMobile]);

  // Componente de tabla modernizada y responsive
  const ModernTable = () => {
    return (
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Card sx={{ 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.02)',
          mb: 3,
          width: '95%',
          maxWidth: '540px',
          marginLeft: '0',
          marginRight: 'auto'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderBottom: '1px solid rgba(0,0,0,0.03)',
              background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                color: '#B22222',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                letterSpacing: '-0.02em',
                fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Programas Académicos
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6C757D',
                mt: 0.5,
                fontWeight: 400,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' }
              }}>
                Distribución por estado y nivel académico
              </Typography>
            </Box>

            <div onClick={handleClick} style={{ cursor: 'pointer' }}>
              <TableContainer sx={{ 
                backgroundColor: 'transparent',
                overflow: 'auto',
                maxWidth: '100%',
                '& .MuiTable-root': {
                  borderCollapse: 'separate',
                  borderSpacing: '0',
                  minWidth: isMobile ? 'auto' : '100%',
                  width: '100%'
                }
              }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableBody>
                    {/* Sección ACTIVOS */}
                    <TableRow sx={{ 
                      backgroundColor: 'rgba(178, 34, 34, 0.02)',
                      '&:hover': { 
                        backgroundColor: 'rgba(178, 34, 34, 0.04)',
                        transform: 'translateX(2px)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        color: '#B22222',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1, sm: 2 },
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        width: isMobile ? 'auto' : '70%'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SchoolIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#B22222' }} />
                          ACTIVOS
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none', py: { xs: 1.5, sm: 2.5 }, display: { xs: 'none', sm: 'table-cell' } }} />
                      <TableCell align="right" sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        color: '#B22222',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 },
                        width: isMobile ? 'auto' : 'auto'
                      }}>
                        {programData.activos.total}
                      </TableCell>
                    </TableRow>

                    {/* Subcategorías de ACTIVOS */}
                    {[
                      { label: 'Pregrado Universitario', shortLabel: 'P. Universitario', value: programData.activos.pregrado.universitario },
                      { label: 'Pregrado Tecnológico', shortLabel: 'P. Tecnológico', value: programData.activos.pregrado.tecnologico },
                      { label: 'Maestría', shortLabel: 'Maestría', value: programData.activos.posgrado.maestria },
                      { label: 'Especialización Universitaria', shortLabel: 'Esp. Universitaria', value: programData.activos.posgrado.especializacionUniversitaria },
                      { label: 'Especialización Médico Quirúrgica', shortLabel: 'Esp. Médico Quir.', value: programData.activos.posgrado.especializacionMedicoQuirurgica },
                      { label: 'Doctorado', shortLabel: 'Doctorado', value: programData.activos.posgrado.doctorado }
                    ].map((item, index) => (
                      <TableRow key={index} sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 0, 0, 0.01)',
                          transform: 'translateX(1px)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }
                      }}>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                          color: '#495057',
                          borderBottom: 'none',
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1.5, sm: 3 },
                          pl: { xs: 3, sm: 5 },
                          fontWeight: 400
                        }}>
                          {isMobile ? item.shortLabel : item.label}
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', py: { xs: 1, sm: 1.5 }, display: { xs: 'none', sm: 'table-cell' } }} />
                        <TableCell align="right" sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                          color: '#212529',
                          borderBottom: 'none',
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1.5, sm: 3 }
                        }}>
                          {item.value}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Separador visual */}
                    <TableRow>
                      <TableCell colSpan={3} sx={{ 
                        borderBottom: 'none', 
                        py: 1,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
                        height: '1px'
                      }} />
                    </TableRow>

                    {/* Sección EN CREACIÓN */}
                    <TableRow sx={{ 
                      backgroundColor: 'rgba(108, 117, 125, 0.02)',
                      '&:hover': { 
                        backgroundColor: 'rgba(108, 117, 125, 0.04)',
                        transform: 'translateX(2px)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        color: '#6C757D',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 },
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#6C757D' }} />
                          EN CREACIÓN
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none', py: { xs: 1.5, sm: 2.5 }, display: { xs: 'none', sm: 'table-cell' } }} />
                      <TableCell align="right" sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        color: '#6C757D',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 }
                      }}>
                        {programData.enCreacion}
                      </TableCell>
                    </TableRow>

                    {/* Separador visual */}
                    <TableRow>
                      <TableCell colSpan={3} sx={{ 
                        borderBottom: 'none', 
                        py: 1,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
                        height: '1px'
                      }} />
                    </TableRow>

                    {/* Sección INACTIVOS */}
                    <TableRow sx={{ 
                      backgroundColor: 'rgba(73, 80, 87, 0.02)',
                      '&:hover': { 
                        backgroundColor: 'rgba(73, 80, 87, 0.04)',
                        transform: 'translateX(2px)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        color: '#495057',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 },
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssessmentIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#495057' }} />
                          INACTIVOS
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none', py: { xs: 1.5, sm: 2.5 }, display: { xs: 'none', sm: 'table-cell' } }} />
                      <TableCell align="right" sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        color: '#495057',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 }
                      }}>
                        {programData.inactivos.total}
                      </TableCell>
                    </TableRow>

                    {/* Subcategorías de INACTIVOS */}
                    {[
                      { label: 'Desistido Interno', shortLabel: 'Desist. Interno', value: programData.inactivos.desistidoInterno },
                      { label: 'Desistido MEN', shortLabel: 'Desist. MEN', value: programData.inactivos.desistidoMEN },
                      { label: 'Desistido MEN - Sede', shortLabel: 'Desist. MEN-Sede', value: programData.inactivos.desistidoMENSede },
                      { label: 'Inactivo', shortLabel: 'Inactivo', value: programData.inactivos.inactivo },
                      { label: 'Inactivo - Sede', shortLabel: 'Inactivo-Sede', value: programData.inactivos.inactivoSede },
                      { label: 'Inactivo - Vencido RC', shortLabel: 'Inact. Venc. RC', value: programData.inactivos.inactivoVencidoRC },
                      { label: 'Negación RC', shortLabel: 'Negación RC', value: programData.inactivos.negacionRC }
                    ].map((item, index) => (
                      <TableRow key={index} sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 0, 0, 0.01)',
                          transform: 'translateX(1px)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }
                      }}>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                          color: '#495057',
                          borderBottom: 'none',
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1.5, sm: 3 },
                          pl: { xs: 3, sm: 5 },
                          fontWeight: 400
                        }}>
                          {isMobile ? item.shortLabel : item.label}
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', py: { xs: 1, sm: 1.5 }, display: { xs: 'none', sm: 'table-cell' } }} />
                        <TableCell align="right" sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                          color: '#212529',
                          borderBottom: 'none',
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1.5, sm: 3 }
                        }}>
                          {item.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </CardContent>
        </Card>

        {/* TABLA DE PRÓXIMOS A VENCERSE - FUNCIONALIDAD COMPLETA Y RESPONSIVE */}
        <Card sx={{ 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.02)',
          width: '95%',
          maxWidth: '540px',
          marginLeft: '0',
          marginRight: 'auto'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderBottom: '1px solid rgba(0,0,0,0.03)',
              background: 'linear-gradient(135deg, #FFF8E7 0%, #FFFFFF 100%)'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                color: '#FF8C00',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                letterSpacing: '-0.02em',
                fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Próximos a Vencerse
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6C757D',
                mt: 0.5,
                fontWeight: 400,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' }
              }}>
                Programas con registro calificado próximo a vencer
              </Typography>
            </Box>

            <div onClick={handleExpiryClick} style={{ cursor: 'pointer' }}>
              <TableContainer sx={{ 
                backgroundColor: 'transparent',
                overflow: 'auto',
                maxWidth: '100%',
                '& .MuiTable-root': {
                  borderCollapse: 'separate',
                  borderSpacing: '0',
                  minWidth: isMobile ? 'auto' : '100%',
                  width: '100%'
                }
              }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(255, 140, 0, 0.05)' }}>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: '#495057',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 2 },
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        Proceso
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        color: '#495057',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 0.5, sm: 1 },
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        1 año
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        color: '#495057',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 0.5, sm: 1 },
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        2 años
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        color: '#495057',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 0.5, sm: 1 },
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        3 años
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        color: '#DC3545',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1.5, sm: 3 },
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        Vencidos
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Sección RRC */}
                    <TableRow sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 140, 0, 0.02)',
                        transform: 'translateX(2px)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        color: '#FF8C00',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 },
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#FF8C00' }} />
                          RRC
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#FFA500',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 }
                      }}>
                        {expiryCounts.RRC.oneYear}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#FFD700',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 }
                      }}>
                        {expiryCounts.RRC.twoYears}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#32CD32',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 }
                      }}>
                        {expiryCounts.RRC.threeYears}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#DC3545',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 }
                      }}>
                        {expiredRRCCount}
                      </TableCell>
                    </TableRow>

                    {/* Sección AAC */}
                    <TableRow sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 140, 0, 0.02)',
                        transform: 'translateX(2px)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        color: '#FF8C00',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 },
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#FF8C00' }} />
                          AAC
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#FFA500',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 }
                      }}>
                        {expiryCounts.AAC.oneYear}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#FFD700',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 }
                      }}>
                        {expiryCounts.AAC.twoYears}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#32CD32',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 }
                      }}>
                        {expiryCounts.AAC.threeYears}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '0.8125rem', sm: '0.9rem' },
                        color: '#DC3545',
                        borderBottom: 'none',
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 }
                      }}>
                        {expiredRACCount}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Componente de gráficos modernizado y responsive
  const ModernCharts = () => (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      position: 'relative', 
      zIndex: 2,
      pl: { xs: 0, sm: 0, md: 2, lg: 3 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: { xs: 'center', sm: 'center', md: 'flex-end' }
    }}>
      <Fade in={chartsVisible} timeout={600}>
        <Box sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', md: '95%', lg: '90%' },
          mr: { xs: 0, md: 0 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'flex-start', md: 'flex-start' }
        }}>
          <Typography variant="h5" sx={{ 
            mb: 3,
            fontWeight: 600,
            color: '#B22222',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            letterSpacing: '-0.02em',
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            pl: { xs: 1, sm: 0 },
            textAlign: { xs: 'left', md: 'left' },
            alignSelf: 'flex-start'
          }}>
            Análisis Visual
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#6C757D',
            mb: 4,
            fontWeight: 400,
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            pl: { xs: 1, sm: 0 },
            textAlign: { xs: 'left', md: 'left' },
            alignSelf: 'flex-start'
          }}>
            Distribución interactiva de programas activos
          </Typography>

          <Grid container spacing={2}>
            {/* Gráfico Nivel Académico */}
            <Grid item xs={12}>
              <Grow in={!!chartDataNivelAcademico} timeout={800}>
                <Card sx={{ 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '550px',
                  ml: { xs: 'auto', md: 'auto' },
                  mr: { xs: 'auto', md: '0' },
                  position: 'relative',
                  zIndex: 2,
                  mb: 3
                }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      color: '#212529',
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      Nivel Académico
                    </Typography>
                    <Box sx={{ 
                      height: { xs: 250, sm: 300, md: 350 }, 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {chartDataNivelAcademico && (
                        <Pie
                          data={chartDataNivelAcademico}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: {
                                ...chartOptions.plugins.legend,
                                onClick: (e, legendItem) => {
                                  const nivelAcademico = legendItem.text;
                                  handleAcademicLevelClick(nivelAcademico);
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleAcademicLevelClick('Todos')}
                        sx={{
                          borderColor: '#E9ECEF',
                          color: '#6C757D',
                          fontWeight: 500,
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          px: { xs: 1.5, sm: 2 },
                          py: 0.75,
                          borderRadius: '8px',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#B22222',
                            backgroundColor: 'rgba(178, 34, 34, 0.02)',
                            color: '#B22222'
                          }
                        }}
                      >
                        Mostrar Todos
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Gráfico Nivel de Formación */}
            <Grid item xs={12}>
              <Grow in={!!chartDataNivelFormacion} timeout={1000}>
                <Card sx={{ 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '550px',
                  ml: { xs: 'auto', md: 'auto' },
                  mr: { xs: 'auto', md: '0' },
                  position: 'relative',
                  zIndex: 2,
                  mb: 3
                }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      color: '#212529',
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      Nivel de Formación
                    </Typography>
                    <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, mb: 2 }}>
                      {chartDataNivelFormacion && (
                        <Pie
                          data={chartDataNivelFormacion}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: {
                                ...chartOptions.plugins.legend,
                                onClick: (e, legendItem) => {
                                  const nivelFormacion = legendItem.text;
                                  handleLegendClick(nivelFormacion);
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleLegendClick('Todos')}
                        sx={{
                          borderColor: '#E9ECEF',
                          color: '#6C757D',
                          fontWeight: 500,
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          px: { xs: 1.5, sm: 2 },
                          py: 0.75,
                          borderRadius: '8px',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#B22222',
                            backgroundColor: 'rgba(178, 34, 34, 0.02)',
                            color: '#B22222'
                          }
                        }}
                      >
                        Mostrar Todos
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Gráfico Escuelas */}
            <Grid item xs={12}>
              <Grow in={!!chartDataEscuelas} timeout={1200}>
                <Card sx={{ 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '550px',
                  ml: { xs: 'auto', md: 'auto' },
                  mr: { xs: 'auto', md: '0' },
                  position: 'relative',
                  zIndex: 2,
                  mb: 3
                }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      color: '#212529',
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      Escuelas
                    </Typography>
                    <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, mb: 2 }}>
                      {chartDataEscuelas && (
                        <Pie
                          data={chartDataEscuelas}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: {
                                ...chartOptions.plugins.legend,
                                onClick: (e, legendItem) => {
                                  const escuela = legendItem.text;
                                  handleEscuelaClick(escuela);
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleEscuelaClick('Todos')}
                        sx={{
                          borderColor: '#E9ECEF',
                          color: '#6C757D',
                          fontWeight: 500,
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          px: { xs: 1.5, sm: 2 },
                          py: 0.75,
                          borderRadius: '8px',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#B22222',
                            backgroundColor: 'rgba(178, 34, 34, 0.02)',
                            color: '#B22222'
                          }
                        }}
                      >
                        Mostrar Todos
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );

  return (
    <>
      {isLoading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <CircularProgress 
            sx={{ 
              color: '#B22222',
              mb: 2 
            }} 
            size={48}
          />
          <Typography sx={{ 
            color: '#6C757D',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}>
            Generando reporte...
          </Typography>
        </Box>
      )}
      
      <Header />
      <Sidebar isCargo={isCargo} />
      
      <Box className="content content-with-sidebar" sx={{
        background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
        minHeight: '100vh',
        pt: 4,
        width: 'calc(100% - 10px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
        ml: { xs: 0, sm: 0, md: '20px', lg: '40px' },
        boxSizing: 'border-box'
      }}>
        <Box sx={{ 
          maxWidth: { xs: '100%', sm: '100%', md: '1280px', lg: '1450px' }, 
          margin: '0 auto',
          px: { xs: 0, sm: 1, md: 2, lg: 2 },
          width: '100%',
          position: 'relative',
          left: { xs: 0, sm: 0, md: '-20px', lg: '-20px' },
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}>
          {/* Header principal */}
          <Fade in timeout={400}>
            <Box sx={{ 
              textAlign: 'center',
              mb: { xs: 3, sm: 4, md: 5 },
              pl: { xs: 1, sm: 2, md: 0 }
            }}>
            </Box>
          </Fade>

          {/* Contenido principal */}
          <Grid 
            container 
            spacing={{ xs: 1, sm: 2, md: 2 }} 
            sx={{ 
              width: '100%', 
              m: 0, 
              boxSizing: 'border-box',
              maxWidth: '100%'
            }}
          >
            {/* Gráficos - aumentando a 6/12 en desktop, 100% en mobile (aparece segundo) */}
            <Grid item xs={12} md={6} sx={{ 
              order: { xs: 2, md: 1 },
              pl: { xs: '0 !important', sm: '8px !important', md: '35px !important', lg: '45px !important' },
              pr: { xs: '0 !important', sm: '8px !important', md: '0 !important' },
              width: '100%',
              position: 'relative',
              zIndex: 2,
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-end' }
            }}>
              <ModernCharts />
            </Grid>

            {/* Tabla - igualando a 6/12 en desktop, 100% en mobile (aparece primero) */}
            <Grid item xs={12} md={6} sx={{ 
              order: { xs: 1, md: 2 },
              pl: { xs: '0 !important', sm: '8px !important', md: '0 !important' },
              width: '100%',
              position: 'relative',
              zIndex: 2,
              pr: { xs: 0, sm: 0, md: '15px', lg: '25px' },
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <Fade in timeout={600}>
                <Box sx={{ 
                  width: '100%', 
                  maxWidth: '540px',
                  overflow: 'hidden'
                }}>
                  <ModernTable />
                </Box>
              </Fade>
            </Grid>
          </Grid>

          {/* Espaciado inferior */}
          <Box sx={{ height: { xs: 40, sm: 60 } }} />
        </Box>
      </Box>
    </>
  );
};

export default Home;