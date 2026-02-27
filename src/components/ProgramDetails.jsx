import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '/src/styles/programDetails.css'; 
import Header from './Header';
import Seguimiento from './Seguimiento';
import EstadisticasPrograma from './EstadisticasPrograma';
import TimelineComponent from './Timeline';
import { Filtro5,Filtro11, Filtro7, FiltroHistorico, FiltroHistoricoTimeline, getSeguimientoPMByPrograma } from "../service/data";
import { clearCache } from "../service/fetch";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; 
import { Tabs, Tab, Box, Button, TextField, Grid, Typography, Backdrop, CircularProgress } from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 
import * as XLSX from 'xlsx';

const normalizeValue = (value) => {
    return typeof value === 'string' && value.trim().toUpperCase() === '#N/A'
      ? 'N/A'
      : value;
  };

const ProgramDetails = () => {
          
    const location = useLocation();
    const rowData = location.state;
    console.log('Datos recibidos en ProgramDetails:', rowData);
    const { globalVariable, userEmail } = location.state || {};
    const [clickedButton, setClickedButton] = useState('crea'); 
    const [reloadSeguimiento, setReloadSeguimiento] = useState(false);
    const [filteredDataSeg, setFilteredDataSeg] = useState(() => {
        const cachedData = localStorage.getItem('filteredDataSeg');
        return cachedData ? JSON.parse(cachedData) : [];
    });
    const [documentLinks, setDocumentLinks] = useState({
        rrc: '',
        raac: '',
    });
    const [isEditing, setIsEditing] = useState(false);    
    const [seguimientoPMData, setSeguimientoPMData] = useState(null);
    const [timelineData, setTimelineData] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    let userPermiso = '';
    let userEscuela = '';
    let userPrograma = '';
    try{
        const logged = JSON.parse(sessionStorage.getItem('logged'));
        if(Array.isArray(logged) && logged.length > 0) {
            userPermiso = logged[0].permiso || '';
            userEscuela = logged[0].escuela || '';
            userPrograma = logged[0].id_programa || '';
        }
    } catch (error) {
        console.error("Error al parsear el sessionStorage:", error);
    }

    const esDirectorEscuela = userPermiso === 'Director Escuela';
    const esDirectorPrograma = userPermiso === 'Director Programa';
    const escuelaPrograma = rowData?.escuela || rowData?.Escuela || '';
    const nombrePrograma =  rowData?.id_programa || '';
    
    // Director Escuela
    const puedesVerTodoEscuela = esDirectorEscuela && escuelaPrograma === userEscuela;
    const puedesVerSoloBasicoEscuela = esDirectorEscuela && escuelaPrograma !== userEscuela;
    
    // Director Programa
    const puedesVerTodoPrograma = esDirectorPrograma && nombrePrograma === userPrograma;
    const puedesVerSoloBasicoPrograma = esDirectorPrograma && nombrePrograma !== userPrograma;
    
    // Variables finales
    const puedesVerSoloBasico = puedesVerSoloBasicoEscuela || puedesVerSoloBasicoPrograma;
    const soloLectura = puedesVerTodoEscuela || puedesVerTodoPrograma; // True si es director y ve su escuela/programa

    const [options, setOptions] = useState({
        Sede: [],
        Escuela: [],
        Departamento: [],
        Sección: [],
        'Nivel Académico': [],
        'Nivel de Formación': [],
        Jornada: [],
        Modalidad: [],
        Periodicidad: [],
        Acreditable: [],
    });

    // Filtrar seguimientos de creación para este programa
    const seguimientosCreacion = Array.isArray(filteredDataSeg)
        ? filteredDataSeg.filter(
            seg =>
                seg.id_programa === (rowData.id_programa || rowData.id || rowData.ID) &&
                seg.topic === 'Creación'
        )
        : [];

    // Estado para fases de programa (Filtro11)
    const [fasesProgramas, setFasesProgramas] = useState([]);
    const [fase28Data, setFase28Data] = useState(null);

    useEffect(() => {
        // Obtener fases del programa (Filtro11)
        const fetchFases = async () => {
            try {
                const data = await Filtro11();
                setFasesProgramas(data);
            } catch (error) {
                setFasesProgramas([]);
            }
        };
        fetchFases();
    }, [rowData]);

    useEffect(() => {
        // Buscar si el programa está en fase 28
        if (!Array.isArray(fasesProgramas)) {
            setFase28Data(null);
            return;
        }
        const idProg = rowData.id_programa || rowData.id || rowData.ID;
        const found = fasesProgramas.find(
            f => String(f.id_programa) === String(idProg) && String(f.id_fase) === '28'
        );
        setFase28Data(found || null);
    }, [fasesProgramas, rowData]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await Filtro5(); 
                const uniqueOptions = {
                    Sede: [...new Set(data.map((item) => item.sede).filter(option => option && option.trim() !== " "))],
                    Escuela: [...new Set(data.map((item) => item.escuela).filter(option => option && option.trim() !== " "))],
                    Departamento: [...new Set(data.map((item) => item.departamento).filter(option => option && option.trim() !== " "))],
                    Sección: [...new Set(data.map((item) => item.sección).filter(option => option && option.trim() !== " "))],
                    'Nivel Académico': [...new Set(data.map((item) => item['pregrado/posgrado']).filter(option => option && option.trim() !== " "))],
                    'Nivel de Formación': [...new Set(data.map((item) => item['nivel de formación']).filter(option => option && option.trim() !== " "))],
                    Jornada: [...new Set(data.map((item) => item.jornada).filter(option => option && option.trim() !== " "))],
                    Modalidad: [...new Set(data.map((item) => item.modalidad).filter(option => option && option.trim() !== " "))],
                    Periodicidad: [...new Set(data.map((item) => item.periodicidad).filter(option => option && option.trim() !== " "))],
                    Acreditable: [...new Set(data.map((item) => item.acreditable).filter(option => option && option.trim() !== " "))],
                };
                setOptions(uniqueOptions);
            } catch (error) {
                console.error('Error al obtener las opciones de Filtro5:', error);
            }
        };
        fetchOptions();
    }, []);

    // Función para manejar el cambio de fecha
    const handleDateChange = (date, field) => {
        setFormData({
            ...formData,
            [field]: date ? format(date, 'dd/MM/yyyy') : '',
        });
    };

    const {
        'programa académico': programaAcademico,
        departamento,
        snies,
        escuela,
        facultad,
        sede,
        'pregrado/posgrado': academico,
        'nivel de formación': formacion,
        'sección': seccion,
        fechaexpedrc,
        fechavencrc,
        fechaexpedac,
        fechavencac,
        'titulo a conceder': titulo,
        jornada,
        modalidad,
        'créditos': creditos,
        periodicidad,
        'duración': duracion,
        accesos: isemail, 
        acreditable, 
        contingencia,
        'fecha registro snies': fecharegistrosnies,
        'enlace resolución': enlaceResolucion,
    } = rowData || {};

    const [formData, setFormData] = useState({
        Sede: normalizeValue(sede),
        Facultad: normalizeValue(facultad),
        Escuela: normalizeValue(escuela),
        Departamento: normalizeValue(departamento),
        SNIES: normalizeValue(snies),
        Sección: normalizeValue(seccion),
        'Nivel Académico': normalizeValue(academico),
        'Nivel de Formación': normalizeValue(formacion),
        'Titulo a Conceder': normalizeValue(titulo),
        Jornada: normalizeValue(jornada),
        Modalidad: normalizeValue(modalidad),
        Créditos: normalizeValue(creditos),
        Periodicidad: normalizeValue(periodicidad),
        Duración: normalizeValue(duracion),
        'FechaExp RRC': normalizeValue(fechaexpedrc),
        'Fecha RRC': normalizeValue(fechavencrc),
        'FechaExp RAAC': normalizeValue(fechaexpedac),
        'Fecha RAAC': normalizeValue(fechavencac),
        Acreditable: normalizeValue(acreditable),
        Contingencia: normalizeValue(contingencia),
        'Número renovaciones RRC': normalizeValue(rowData['número renovaciones RRC']) || 1,
        'Fecha registro SNIES': normalizeValue(fecharegistrosnies),
        'Enlace resolución': normalizeValue(enlaceResolucion),
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const seguimientos = await Filtro7();
                setFilteredDataSeg(seguimientos);
                localStorage.setItem('filteredDataSeg', JSON.stringify(seguimientos));
            } catch (error) {
                console.error('Error al obtener los seguimientos:', error);
            }
        };

        if (!localStorage.getItem('filteredDataSeg')) {
            fetchData();
        }
    }, [reloadSeguimiento]);

    useEffect(() => {
        switch (globalVariable) {
            case 'RRC':
                setClickedButton('rrc');
                break;
            case 'RAAC':
                setClickedButton('raac');
                break;
            case 'CREA':
                setClickedButton('crea');
                break;
            case 'AAC':
                setClickedButton('aac');
                break;
            case 'MOD':
                setClickedButton('mod');
                break;
            default:
                setClickedButton('crea'); 
                break;
        }
        setReloadSeguimiento(prevState => !prevState); 
    }, [globalVariable]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setReloadSeguimiento(prevState => !prevState); 
        }, 0); 

        return () => clearTimeout(timeout); 
    }, [rowData]);

   useEffect(() => {
    const fetchFiltroHistorico = async () => {
        try {
            const historial = await FiltroHistorico();
            console.log('Datos de FiltroHistorico:', historial); 
            const filteredHistorial = historial.filter(item => item.id_programa === rowData.id_programa);
            
            filteredHistorial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            let rrcLinks = [];
            let raacLinks = [];
            let rrcIndex = 1;
            let raacIndex = 1;

            filteredHistorial.forEach((item) => {
                const isValidUrl = item.url_doc && item.url_doc.trim() !== '' && item.url_doc !== 'N/A';
                
                if (isValidUrl) {
                    if (item.proceso === 'crea' || item.proceso === 'rrc') {
                        const link = `<a href="${item.url_doc}" target="_blank" style="color: blue;">Enlace${rrcIndex}</a>`;
                        rrcLinks.push(link);
                        rrcIndex++;
                    } else if (item.proceso === 'aac' || item.proceso === 'raac') {
                        const link = `<a href="${item.url_doc}" target="_blank" style="color: blue;">Enlace${raacIndex}</a>`;
                        raacLinks.push(link);
                        raacIndex++;
                    }
                }
            });

            setDocumentLinks({
                rrc: rrcLinks.length > 0 ? rrcLinks.join(' ') : 'N/A',
                raac: raacLinks.length > 0 ? raacLinks.join(' ') : 'N/A',
            });
        } catch (error) {
            console.error('Error al obtener el historial:', error);
        }
    };

    fetchFiltroHistorico();
}, [rowData]);
    useEffect(() => {
        const fetchSeguimientoPM = async () => {
            try {
                const data = await getSeguimientoPMByPrograma(rowData.id_programa);
                console.log('Datos de seguimiento PM obtenidos:', data);
                setSeguimientoPMData(data);
            } catch (error) {
                console.error('Error al obtener datos de seguimiento PM:', error);
            }
        };

        fetchSeguimientoPM();
    }, [rowData]);

    useEffect(() => {
        const fetchTimelineData = async () => {
            try {
                const historicoData = await FiltroHistoricoTimeline();
                console.log('Datos históricos para timeline:', historicoData);
                
                // Filter data for current program
                const filteredTimelineData = historicoData.filter(item => 
                    item.id_programa === rowData.id_programa
                );
                
                console.log('Datos de timeline filtrados:', filteredTimelineData);
                setTimelineData(filteredTimelineData);
            } catch (error) {
                console.error('Error al obtener datos de timeline:', error);
            }
        };

        if (rowData?.id_programa) {
            fetchTimelineData();
        }
    }, [rowData]);

    const handleTabChange = (event, newValue) => {
        setClickedButton(newValue);
    };

    //  Función para obtener el color de fondo de los botones de seguimiento
    const getSeguimientoBackgroundColor = (process, isSelected) => {
        const defaultColor = 'rgb(241, 241, 241)';
        
        // Color especial para estadísticas
        if (process === 'estadisticas') {
            const estadisticasColor = '#E3F2FD'; // Azul claro
            return isSelected ? darkenColor(estadisticasColor) : estadisticasColor;
        }
        
        if (!Array.isArray(filteredDataSeg) || filteredDataSeg.length === 0) {
            return isSelected ? darkenColor(defaultColor) : defaultColor;
        }
        const seguimientos = Array.isArray(filteredDataSeg) ? filteredDataSeg.filter(seg => seg.id_programa === rowData.id_programa) : [];
    
        const topicMap = {
            crea: 'Creación',
            mod: 'Modificación',
            rrc: 'Renovación Registro Calificado',
            aac: 'Acreditación',
            raac: 'Renovación Acreditación'
        };
    
        const seguimientosPorProceso = seguimientos.filter(seg => seg.topic === topicMap[process]);
        console.log(`Seguimientos para proceso ${process}:`, seguimientosPorProceso);
        
        if (seguimientosPorProceso.length === 0) {
            return isSelected ? darkenColor(defaultColor) : defaultColor;
        }
    
        const recentSeguimiento = seguimientosPorProceso.reduce((prev, current) =>
            new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
        );
    
        let color;
        switch (recentSeguimiento.riesgo) {
            case 'Alto':
                color = '#FED5D1';
                break;
            case 'Medio':
                color = '#FEFBD1';
                break;
            case 'Bajo':
                color = '#E6FFE6';
                break;
            default:
                color = defaultColor;
                break;
        }
    
        return isSelected ? darkenColor(color) : color;
    };

    const darkenColor = (color) => {
        const amount = -25; 
        return adjustColor(color, amount);
    };

    const isValidValue = (val) => {
    if (!val) return false;
    const v = String(val).trim().toUpperCase();
    return v !== 'N/A' && v !== '#N/A' && v !== '';
};

    // Función para ajustar el color de fondo de los botones de seguimiento
    const adjustColor = (color, amount) => {
        let usePound = false;

        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }

        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let b = ((num >> 8) & 0x00FF) + amount;
        let g = (num & 0x0000FF) + amount;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        const newColor = (g | (b << 8) | (r << 16)).toString(16);
        return (usePound ? "#" : "") + newColor.padStart(6, '0');
    };


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Función para enviar los datos actualizados al servidor
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await axios.post('https://siac-server.vercel.app/updateData', {
                id: rowData.id_programa,
                ...formData,
            });
            if (response.data.status) {
                // Limpiar caché para que se vean los cambios inmediatamente
                clearCache('Programas');
                
                // Recargar los datos del programa
                setIsLoadingData(true);
                try {
                    // Recargar datos del programa actualizado
                    const updatedPrograms = await Filtro5();
                    const updatedProgram = updatedPrograms.find(p => p.id_programa === rowData.id_programa);
                    
                    if (updatedProgram) {
                        // Actualizar formData con los nuevos datos
                        setFormData({
                            Sede: normalizeValue(updatedProgram.sede),
                            Facultad: normalizeValue(updatedProgram.facultad),
                            Escuela: normalizeValue(updatedProgram.escuela),
                            Departamento: normalizeValue(updatedProgram.departamento),
                            SNIES: normalizeValue(updatedProgram.snies),
                            Sección: normalizeValue(updatedProgram.sección),
                            'Nivel Académico': normalizeValue(updatedProgram['pregrado/posgrado']),
                            'Nivel de Formación': normalizeValue(updatedProgram['nivel de formación']),
                            'Titulo a Conceder': normalizeValue(updatedProgram['titulo a conceder']),
                            Jornada: normalizeValue(updatedProgram.jornada),
                            Modalidad: normalizeValue(updatedProgram.modalidad),
                            Créditos: normalizeValue(updatedProgram['créditos']),
                            Periodicidad: normalizeValue(updatedProgram.periodicidad),
                            Duración: normalizeValue(updatedProgram['duración']),
                            'FechaExp RRC': normalizeValue(updatedProgram.fechaexpedrc),
                            'Fecha RRC': normalizeValue(updatedProgram.fechavencrc),
                            'FechaExp RAAC': normalizeValue(updatedProgram.fechaexpedac),
                            'Fecha RAAC': normalizeValue(updatedProgram.fechavencac),
                            Acreditable: normalizeValue(updatedProgram.acreditable),
                            Contingencia: normalizeValue(updatedProgram.contingencia),
                            'Número renovaciones RRC': normalizeValue(updatedProgram['número renovaciones RRC']) || 1,
                        });
                    }
                    
                    // Recargar seguimientos
                    const seguimientos = await Filtro7();
                    setFilteredDataSeg(seguimientos);
                    localStorage.setItem('filteredDataSeg', JSON.stringify(seguimientos));
                    
                    // Recargar seguimiento PM
                    const seguimientoPM = await getSeguimientoPMByPrograma(rowData.id_programa);
                    setSeguimientoPMData(seguimientoPM);
                    
                    // Recargar timeline
                    const historicoData = await FiltroHistoricoTimeline();
                    const filteredTimelineData = historicoData.filter(item => 
                        item.id_programa === rowData.id_programa
                    );
                    setTimelineData(filteredTimelineData);
                    
                    // Recargar histórico para links
                    const historial = await FiltroHistorico();
                    const filteredHistorial = historial.filter(item => item.id_programa === rowData.id_programa);
                    filteredHistorial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                    
                    let rrcLinks = [];
                    let raacLinks = [];
                    filteredHistorial.forEach((item, index) => {
                        const link = `<a href="${item.url_doc}" target="_blank" style="color: blue;">Enlace${index + 1}</a>`;
                        if (item.proceso === 'crea' || item.proceso === 'rrc') {
                            rrcLinks.push(link);
                        } else if (item.proceso === 'aac' || item.proceso === 'raac') {
                            raacLinks.push(link);
                        }
                    });
                    setDocumentLinks({
                        rrc: rrcLinks.join(' '),
                        raac: raacLinks.join(' '),
                    });
                } catch (reloadError) {
                    console.error('Error al recargar datos:', reloadError);
                } finally {
                    setIsLoadingData(false);
                }
                
                alert('Datos actualizados correctamente');
                setReloadSeguimiento(!reloadSeguimiento);
                setIsEditing(false);
            } else {
                alert('Error al actualizar datos: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error al actualizar datos:', error);
            alert('Error al actualizar datos');
        } finally {
            setIsUpdating(false);
        }
    };

    
    // Función para verificar si la fecha de registro SNIES es mayor a 2 años
const isFechaRegistroSniesMayor2Anios = () => {
    if (!formData['Fecha registro SNIES']) return false;
    const [day, month, year] = formData['Fecha registro SNIES'].split('/');
    const fechaRegistro = new Date(`${year}-${month}-${day}`);
    const fechaLimite = new Date();
    fechaLimite.setFullYear(fechaLimite.getFullYear() - 2);
    return fechaRegistro < fechaLimite;
};


const getShortUrl = (url) => {
  try {
    const u = new URL(url);
    // Solo dominio:
    // return u.hostname;
    // O primeros 30 caracteres:
    return url.length > 35 ? url.slice(0, 32) + '...' : url;
  } catch {
    return url;
  }
};
    
    // Estilos de los botones de seguimiento
    const tabSx = (process) => ({
        backgroundColor: getSeguimientoBackgroundColor(process, clickedButton === process),
        color: clickedButton === process ? '#000' : '#555',
        border: clickedButton === process ? '2px solid darkgreen' : '1px solid #ccc',
        borderRadius: '6px 6px 0 0',
        marginRight: '4px',
        padding: '6px 12px', 
        flex: 1,
        '&.Mui-selected': {
            backgroundColor: getSeguimientoBackgroundColor(process, true),
            color: '#000',
            fontWeight: 'bold',
            borderBottom: 'none',
        },
    });

    // --- Función para exportar seguimiento a Excel (una hoja por tab) mejorada ---
    const exportSeguimientoTabsToExcel = () => {
        if (!Array.isArray(filteredDataSeg) || filteredDataSeg.length === 0) {
            alert('No hay información de seguimiento para descargar.');
            return;
        }
        const idPrograma = rowData.id_programa || rowData.id || rowData.ID;
        // Definir los tabs y sus topics
        const tabs = [
            { name: 'CREA', topic: 'Creación' },
            { name: 'MOD', topic: 'Modificación' },
            { name: 'RRC', topic: 'Renovación Registro Calificado' },
            { name: 'AAC', topic: 'Acreditación' },
            { name: 'RAAC', topic: 'Renovación Acreditación' },
        ];
        const workbook = XLSX.utils.book_new();
        let hasData = false;
        tabs.forEach(tab => {
            const data = filteredDataSeg.filter(seg => seg.id_programa === idPrograma && seg.topic === tab.topic);
            if (Array.isArray(data) && data.length > 0) {
                const sheet = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(workbook, sheet, tab.name);
                hasData = true;
            }
        });
        if (!hasData) {
            alert('No hay información de seguimiento para descargar.');
            return;
        }
        XLSX.writeFile(workbook, `seguimiento_${programaAcademico}.xlsx`);
    };

    return (
        <>
            {/* Overlay de carga que cubre toda la pantalla durante actualización */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
                open={isUpdating || isLoadingData}
            >
                <CircularProgress color="inherit" size={60} />
                <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {isUpdating ? 'Guardando cambios...' : 'Actualizando información...'}
                </Box>
            </Backdrop>
            <Header />
            <div className='containerTotal'>
                <div className='title-program'>
                    <h2>{programaAcademico || 'N/A'}</h2>
                </div>
                {!isEditing ? (
                    <div className='about-program-general'>
                        {/* Sección 1: Facultad hasta Sede */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Facultad: </strong>&nbsp; {formData['Facultad'] || 'N/A'}</div>
                            <div className='about-program'><strong>Escuela: </strong>&nbsp; {formData['Escuela'] || 'N/A'}</div>
                            <div className='about-program'><strong>Departamento: </strong>&nbsp; {formData['Departamento'] || 'N/A'}</div>
                            <div className='about-program'><strong>SNIES: </strong>&nbsp; {formData['SNIES'] || 'N/A'}</div>
                            <div className='about-program'><strong>Sección: </strong>&nbsp; {formData['Sección'] || 'N/A'}</div>
                            <div className='about-program'><strong>Sede: </strong>&nbsp; {formData['Sede'] || 'N/A'}</div>
                        </div>
                                            
                        {/* Sección 2: Nivel Académico hasta Modalidad */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Nivel Académico: </strong>&nbsp; {formData['Nivel Académico'] || 'N/A'}</div>
                            <div className='about-program'><strong>Nivel de Formación: </strong>&nbsp; {formData['Nivel de Formación'] || 'N/A'}</div>
                            <div className='about-program'><strong>Jornada: </strong>&nbsp; {formData['Jornada'] || 'N/A'}</div>
                            <div className='about-program'><strong>Modalidad: </strong>&nbsp; {formData['Modalidad'] || 'N/A'}</div>
                        </div>
                             
                        {/* Sección 3: Título a conceder hasta Proceso de Contingencia */}
                        <div className='about-program-section'>
                          {/*  <div className='about-program'><strong>Título a Conceder: </strong>&nbsp; {formData['Titulo a Conceder'] || 'N/A'}</div> */}
                            <div className='about-program'><strong>Créditos: </strong>&nbsp; {formData['Créditos'] || 'N/A'}</div>
                            <div className='about-program'><strong>Periodicidad: </strong>&nbsp; {formData['Periodicidad'] || 'N/A'}</div>
                            <div className='about-program'><strong>Duración: </strong>&nbsp; {formData['Duración'] || 'N/A'}</div>
                            <div className='about-program'><strong>Proceso de Contingencia: </strong>&nbsp; {formData['Contingencia'] || 'N/A'}</div>
                        </div>

                        {/* Sección 4: Fecha Otorgamiento RRC hasta Número Renovaciones RRC */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Fecha Otorgamiento RRC: </strong>&nbsp; {formData['FechaExp RRC'] || 'N/A'}</div>
                            <div className='about-program'><strong>Fecha Vencimiento RRC: </strong>&nbsp; {formData['Fecha RRC'] || 'N/A'}</div>
                            <div className='about-program'><strong>Resolución RRC: </strong>&nbsp; <span dangerouslySetInnerHTML={{ __html: documentLinks.rrc || 'N/A' }} /></div>
                            <div className='about-program'><strong>Número Renovaciones RRC: </strong>&nbsp; {formData['Número renovaciones RRC'] || 'N/A'}</div>
                        </div>

                        {/* Sección 5: Fecha Otorgamiento RAAC hasta Resolución RAAC */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Fecha Otorgamiento RAAC: </strong>&nbsp; {formData['FechaExp RAAC'] || 'N/A'}</div>
                            <div className='about-program'><strong>Fecha Vencimiento RAAC: </strong>&nbsp; {formData['Fecha RAAC'] || 'N/A'}</div>
                           {/**  <div className='about-program'><strong>Resolución RAAC: </strong>&nbsp; <span dangerouslySetInnerHTML={{ __html: documentLinks.raac || 'N/A' }} /></div>*/}
                            <div className='about-program'><strong>Acreditable: </strong>&nbsp; {formData['Acreditable'] || 'N/A'}</div>
                        </div>

                        {/* Sección 6: Estados de Seguimiento PM */}
                        <div className='about-program-section'>
                            <div className='about-program'><strong>Estado del plan de mejoramiento en Registro Calificado: </strong>&nbsp; {seguimientoPMData?.estado_rc || 'N/A'}</div>
                            <div className='about-program'><strong>Estado del plan de mejoramiento en Acreditación: </strong>&nbsp; {seguimientoPMData?.estado_ac || 'N/A'}</div>
                            <div className='about-program'><strong>Documentos del programa: </strong>&nbsp; { <a
                                                    href={formData['Enlace resolución']}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
                                                >
                                                    Enlace
                                                </a> || 'N/A'}</div>
                        </div>

                        {/* Sección 7: Línea del Tiempo */}
                        {timelineData.length > 0 && (
                            <>
                                <div className='about-program' style={{ marginTop: '20px' }}>
                                    <strong>Histórico AAC: </strong>
                                </div>
                                <div className="program-details-timeline">
                                    <TimelineComponent 
                                        data={timelineData}
                                        programaAcademico={programaAcademico}
                                        showTitle={false}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    
                ) : (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
                        {Object.keys(formData).map((key, index) => {
                            if (['FechaExp RRC', 'Fecha RRC', 'FechaExp RAAC', 'Fecha RAAC'].includes(key)) {
                            // Agrupar las fechas en pares para mostrarlas en filas de dos columnas
                            if (['FechaExp RRC', 'FechaExp RAAC'].includes(key)) {
                                return (
                                <Grid container spacing={2} key={index} style={{ marginBottom: '20px' }}>
                                    <Grid item xs={6}>
                                    <DatePicker
                                        label={key === 'FechaExp RRC' ? 'Fecha Otorgamiento RRC' : key === 'FechaExp RAAC' ? 'Fecha Otorgamiento RAAC' : key}
                                        value={
                                        formData[key]
                                            ? new Date(formData[key].split('/').reverse().join('-'))
                                            : null
                                        }
                                        onChange={(newValue) => handleDateChange(newValue, key)}
                                        renderInput={(params) => (
                                        <TextField {...params} fullWidth margin="normal" />
                                        )}
                                    />
                                    </Grid>
                                    <Grid item xs={6}>
                                    <DatePicker
                                        label={key === 'FechaExp RRC' ? 'Fecha Vencimiento RRC' : 'Fecha Vencimiento RAAC'}
                                        value={
                                        formData[key === 'FechaExp RRC' ? 'Fecha RRC' : 'Fecha RAAC']
                                            ? new Date(
                                                formData[key === 'FechaExp RRC' ? 'Fecha RRC' : 'Fecha RAAC']
                                                .split('/')
                                                .reverse()
                                                .join('-')
                                            )
                                            : null
                                        }
                                        onChange={(newValue) =>
                                        handleDateChange(
                                            newValue,
                                            key === 'FechaExp RRC' ? 'Fecha RRC' : 'Fecha RAAC'
                                        )
                                        }
                                        renderInput={(params) => (
                                        <TextField {...params} fullWidth margin="normal" />
                                        )}
                                    />
                                    </Grid>
                                </Grid>
                                );
                            }
                            return null;
                            }
                            return (
                            <div key={key}>
                                {key === 'Créditos' || key === 'Número renovaciones RRC' ? (
                                <TextField
                                    label={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    inputMode="numeric"
                                    onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                    }}
                                    inputProps={{ min: 0 }}
                                />
                                ) : options[key] && options[key].length > 0 ? (
                                <TextField
                                    select
                                    label={key}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    SelectProps={{
                                    native: true,
                                    }}
                                >
                                    <option value="" disabled></option>
                                    {options[key].map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                    ))}
                                </TextField>
                                ) : (
                                <TextField
                                    label={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                />
                                )}
                            </div>
                            );
                        })}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ margin: '10px 0' }}
                        >
                            Actualizar Datos
                        </Button>
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="contained"
                            color="secondary"
                            style={{ margin: '10px 0', marginLeft: '10px' }}
                        >
                            Cancelar
                        </Button>
                        </form>
                    </LocalizationProvider>
                )}
                {!isEditing && !esDirectorEscuela && !esDirectorPrograma && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, marginBottom: '20px' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsEditing(true)}
                            style={{ minWidth: 150 }}
                        >
                            Actualizar Datos
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={exportSeguimientoTabsToExcel}
                            style={{ minWidth: 180 }}
                        >
                            Descargar Seguimiento Excel
                        </Button>
                    </Box>
                )}
                
                {!puedesVerSoloBasico && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', marginLeft:'5px', marginRight:'20px'}}>
                    <Tabs
                        value={clickedButton}
                        onChange={handleTabChange}
                        aria-label="Proceso Tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                        TabIndicatorProps={{
                            style: {
                                display: 'none'
                            }
                        }}
                        sx={{ width: '100%' }}
                    >
                        <Tab label="CREA" value="crea" sx={tabSx('crea')} />
                        <Tab label="MOD" value="mod" sx={tabSx('mod')} />
                        <Tab label="RRC" value="rrc" sx={tabSx('rrc')} />
                        <Tab label="AAC" value="aac" sx={tabSx('aac')} />
                        <Tab label="RAAC" value="raac" sx={tabSx('raac')} />
                        <Tab label="Docencia Servicio" value="conv" sx={tabSx('conv')} />
                        <Tab label="Seguimiento PM" value="Seg" sx={tabSx('Seg')} />
                        <Tab label="Estadísticas" value="estadisticas" sx={tabSx('estadisticas')} />
                    </Tabs>
                </Box>
                )}
                    {/* Mostrar el mensaje 'Creado el...' arriba del collapse button SOLO si hay seguimientos de creación Y el programa está en fase 28 */}
                    {!puedesVerSoloBasico && (
                    <>
                    {clickedButton === 'crea' && seguimientosCreacion.length > 0 && fase28Data && 
                        isValidValue(formData['Fecha registro SNIES']) &&
 isValidValue(formData['Enlace resolución']) &&
 isValidValue(fase28Data.fecha)? (
                        <div className='about-program-section' style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '30px',
                            textAlign: 'center',
                            flexDirection: 'column'
                        }}>
                            <div className='about-program'>
                                Creado el {fase28Data.fecha} con la resolución&nbsp;
                                <span>
                                    
                                            <a
                                                href={formData['Enlace resolución']}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
                                            >
                                                Enlace
                                            </a>
                                        
                                </span>
                            </div>
                        </div>
                        ):null
                    }

                    {clickedButton === 'crea' ? (
                        seguimientosCreacion.length === 0 ? (
                            (formData['Fecha registro SNIES'] && formData['Fecha registro SNIES'] !== 'N/A' &&
         formData['Enlace resolución'] && formData['Enlace resolución'] !== 'N/A') ? (
                            <div className='about-program-section' style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '60px',
                                textAlign: 'center',
                                flexDirection: 'column'
                            }}>
                                <div className='about-program'>
                                    Creado el {formData['Fecha registro SNIES'] || 'N/A'} con la resolución&nbsp;
                                    <span>
                                        {formData['Enlace resolución'] 
                                            ? (
                                                <a
                                                    href={formData['Enlace resolución']}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
                                                >
                                                    Enlace
                                                </a>
                                            ) : 'N/A'}
                                    </span>
                                </div>
                            </div>
         ):null
                        ) : (
                            <Seguimiento 
                                handleButtonClick={clickedButton} 
                                key={reloadSeguimiento} 
                                fechavencrc={rowData.fechavencrc}
                                soloLectura={soloLectura}
                                rowData={{
                                    ...rowData,
                                    id_programa: rowData.id_programa || rowData.id || rowData.ID || 'N/A'
                                }}
                            />
                        )
                    ) : (
                        clickedButton === 'estadisticas' ? (
                            <Box sx={{ 
                                width: '95%', 
                                maxWidth: 'none', 
                                margin: '0 auto',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <EstadisticasPrograma 
                                    programaAcademico={programaAcademico}
                                />
                            </Box>
                        ) : (
                            <Seguimiento 
                                handleButtonClick={clickedButton} 
                                key={reloadSeguimiento} 
                                fechavencrc={rowData.fechavencrc}
                                soloLectura={soloLectura}
                                rowData={{
                                    ...rowData,
                                    id_programa: rowData.id_programa || rowData.id || rowData.ID || 'N/A'
                                }}
                            />
                        )
                    )}
                    </>
                    )}
            </div>

            {/* Cuadro informativo de documentos requeridos, solo si la tab tiene info de seguimiento */}
            {!puedesVerSoloBasico && (
            <>
            {(() => {
                // Mapear tab a topic
                const topicMap = {
                    crea: 'Creación',
                    mod: 'Modificación',
                    rrc: 'Renovación Registro Calificado',
                    aac: 'Acreditación',
                    raac: 'Renovación Acreditación',
                };
                const idPrograma = rowData.id_programa || rowData.id || rowData.ID;
                // Solo mostrar si la tab es una de seguimiento y hay info de seguimiento para esa tab
                if (topicMap[clickedButton] && Array.isArray(filteredDataSeg)) {
                    const tieneSeguimiento = filteredDataSeg.some(seg => seg.id_programa === idPrograma && seg.topic === topicMap[clickedButton]);
                    if (tieneSeguimiento) {
                        return (
                            <Box sx={{
                                backgroundColor: '#E3F2FD',
                                borderRadius: '8px',
                                padding: '16px',
                                marginTop: '32px',
                                marginBottom: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                maxWidth: 600,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px', color: '#1976d2' }}>
                                    Documentos requeridos para el programa
                                </Typography>
                                <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                                    <li>Resolución de Creación</li>
                                    <li>Resolución de Modificación</li>
                                    <li>Resolución de Renovación Registro Calificado</li>
                                    <li>Resolución de Acreditación</li>
                                    <li>Resolución de Renovación Acreditación</li>
                                </ul>
                                <Typography variant="body2" sx={{ color: '#555', marginTop: '8px' }}>
                                    Estos documentos deben ser subidos con el enlace correspondiente en el formulario de seguimiento.
                                </Typography>
                            </Box>
                        );
                    }
                }
                return null;
            })()}
            </>
            )}

</>
    );
};

export default ProgramDetails;
