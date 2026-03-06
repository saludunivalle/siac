import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Radio, RadioGroup, FormControl, FormControlLabel, TextField, InputLabel, ListSubheader, Input, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Button, Typography, Modal, CircularProgress, FormLabel, useMediaQuery } from '@mui/material';
import { Container, Grid, IconButton, Box, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CollapsibleButton from './CollapsibleButton';
import { Filtro10,Filtro11, Filtro12, Filtro7, Filtro8, Filtro9, obtenerFasesProceso, sendDataToServer, sendDataToServerCrea, sendDataToServerDoc, Filtro21, sendDataFirma, FiltroFirmas, sendDataToServerHistorico, updateSeguimiento, deleteSeguimiento } from '../service/data';
import { clearCache } from '../service/fetch';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import esLocale from 'dayjs/locale/es';
import PracticeScenario from './PracticeScenario';
import FormComponent from './FormComponent';
import SeguimientoPM from './SeguimientoPM';
import SimpleTimeline from './SimpleTimeline';
import { LocalizationProvider, MobileDatePicker, DesktopDatePicker, DatePicker } from '@mui/x-date-pickers';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';


const Seguimiento = ({ handleButtonClick, rowData: propRowData, fechavencrc, soloLectura = false }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedOption, setSelectedOption] = useState(0);
    const [selectedPhase, setSelectedPhase] = useState('');
    const location = useLocation();
    // Usar rowData de props si está disponible, sino usar location.state
    const rowData = propRowData || location.state;
    
    // Debug: verificar si rowData existe
    console.log('Seguimiento component - propRowData:', propRowData);
    console.log('Seguimiento component - location.state:', location.state);
    console.log('Seguimiento component - rowData final:', rowData);
    console.log('Seguimiento component - campos disponibles en rowData:', rowData ? Object.keys(rowData) : 'No hay rowData');
    console.log('Seguimiento component - id_programa raw:', rowData ? rowData['id_programa'] : 'undefined');
    console.log('Seguimiento component - fechas disponibles:', {
        fechaexpedrc: rowData ? rowData['fechaexpedrc'] : 'undefined',
        fechavencrc: rowData ? rowData['fechavencrc'] : 'undefined',
        fechaexpedac: rowData ? rowData['fechaexpedac'] : 'undefined',
        fechavencac: rowData ? rowData['fechavencac'] : 'undefined'
    });
    // Validar que rowData exista antes de extraer propiedades
    const programaAcademico = rowData ? rowData['programa académico'] : 'N/A';
    // Buscar id_programa en diferentes campos posibles
    const idPrograma = rowData ? (
        rowData['id_programa'] || 
        rowData['idPrograma'] || 
        rowData['id'] || 
        rowData['ID'] || 
        rowData['programa_id'] ||
        rowData['programaId'] ||
        'N/A'
    ) : 'N/A';
    
    // Debug adicional para el idPrograma
    console.log('Seguimiento component - idPrograma extraído:', idPrograma);
    console.log('Seguimiento component - tipo de idPrograma:', typeof idPrograma);
    
    // Si no se encontró el ID, intentar buscarlo por nombre del programa
    const [programasData, setProgramasData] = useState([]);
    
    useEffect(() => {
        const fetchProgramas = async () => {
            try {
                // Cambiar a la ruta correcta que apunta a la base de datos principal
                const response = await axios.post('https://siac-server.vercel.app/', {
                    sheetName: 'Programas'
                });
                
                if (response.data && response.data.status) {
                    console.log("Programas obtenidos:", response.data.data);
                    const programas = response.data.data || [];
                    setProgramasData(programas);
                    return programas;
                } else {
                    console.warn('No se pudieron obtener los programas:', response.data);
                    return [];
                }
            } catch (error) {
                console.error('Error al obtener los programas:', error);
                return [];
            }
        };
        
        fetchProgramas();
    }, []);
    
    // Buscar el ID del programa por nombre si no se encontró
    const idProgramaFinal = useMemo(() => {
        if (idPrograma && idPrograma !== 'N/A') {
            return idPrograma;
        }
        
        if (rowData && rowData['programa académico'] && programasData.length > 0) {
            const programaEncontrado = programasData.find(p => 
                p['programa académico'] === rowData['programa académico']
            );
            return programaEncontrado ? programaEncontrado.id_programa : 'N/A';
        }
        
        return 'N/A';
    }, [idPrograma, rowData, programasData]);
    
    console.log('Seguimiento component - idPrograma final:', idProgramaFinal);
    const escuela = rowData ? rowData['escuela'] : 'N/A';
    const formacion = rowData ? rowData['pregrado/posgrado'] : 'N/A';
    const [value, setValue] = useState('');
    const [showCollapsible, setShowCollapsible] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [comment, setComment] = useState('');
    const [collapsible, setCollapsible] = useState('');
    const [user, setUser] = useState('');
    const [isPlan, setPlan] = useState(['Plan de Mejoramiento', 'Sistemas']);
    const [isReg, setReg] = useState(['Renovación Registro Calificado', 'Sistemas']);
    const [isAcred, setAcred] = useState(['Acreditación', 'Sistemas']);
    const [isConv, setConv] = useState(['Convenio Docencia Servicio', 'Sistemas']);
    const [isCrea, setCrea] = useState(['Creación', 'Sistemas']);
    const [isMod, setMod] = useState(['Modificación', 'Sistemas']);
    const [isRenAcred, setRenAcred] = useState(['Renovación Acreditación', 'Sistemas']);
    const [isCargo, setCargo] = useState([' ']);
    const [openModal, setOpenModal] = useState(false);
    const [fileData, setfileData] = useState(null);
    const fileInputRef = useRef(null);
    const [fileLink, setFileLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [fileType, setFileType] = useState('link');
    const [selectedDocReq, setSelectedDocReq] = useState('');
    const [fases, setFases] = useState([]);
    const [fasesName, setFasesName] = useState([]);
    const [itemActual, setItemActual] = useState([]);
    const [docs, setDocs] = useState([]);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [Filtro21Data, setFiltro21Data] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [dataUpdated, setDataUpdated] = useState(false);
    const [sentDocId, setSentDocId] = useState(null);
    const [fasesTabla, setFasesTabla] = useState([]);
    const isMobile = useMediaQuery('(max-width:600px)');
    
    // Estados para edición de seguimientos
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingSeguimiento, setEditingSeguimiento] = useState(null);
    const [editComment, setEditComment] = useState('');
    const [editRiesgo, setEditRiesgo] = useState('');
    const [editAdjunto, setEditAdjunto] = useState('');
    const [editFase, setEditFase] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Obtener datos de Filtro21 al montar el componente
    useEffect(() => {
        const obtenerDatosFiltro = async () => {
            try {
                const filtroData = await Filtro21();
                console.log('Datos obtenidos de Filtro21 (raw):', filtroData);
                setFiltro21Data(filtroData);
                console.log('Datos obtenidos de Filtro21:', filtroData);
            } catch (error) {
                console.error('Error al obtener los datos del filtro:', error);
            }
        };
        obtenerDatosFiltro();
    }, [docs]);

    const handleOpen = (doc) => {
        setSelectedDoc(doc);
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedDoc(null);
        setOpen(false);
    };

    // Funciones para edición de seguimientos
    const handleOpenEditModal = (seguimiento) => {
        setEditingSeguimiento(seguimiento);
        setEditComment(seguimiento.mensaje || '');
        setEditRiesgo(seguimiento.riesgo || '');
        setEditAdjunto(seguimiento.url_adjunto || '');
        // Convertir ID de fase a nombre para el Select
        const faseNombre = seguimiento.fase ? getFaseName(seguimiento.fase) : '';
        setEditFase(faseNombre);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setEditingSeguimiento(null);
        setEditComment('');
        setEditRiesgo('');
        setEditAdjunto('');
        setEditFase('');
        setDeleteConfirmOpen(false);
    };

    const handleSaveEdit = async () => {
        if (!editingSeguimiento) return;
        
        setEditLoading(true);
        try {
            // Convertir nombre de fase a ID antes de guardar
            const faseId = editFase ? getFaseIdByName(editFase) : null;
            
            const updatedData = {
                id_programa: editingSeguimiento.id_programa,
                timestamp: editingSeguimiento.timestamp,
                mensaje: editComment,
                riesgo: editRiesgo,
                usuario: editingSeguimiento.usuario,
                topic: editingSeguimiento.topic,
                url_adjunto: editAdjunto,
                fase: faseId !== null ? faseId : ''
            };
            
            console.log('💾 Guardando seguimiento editado:', updatedData);
            await updateSeguimiento(updatedData);
            
            // Recargar datos con un pequeño delay para asegurar que se actualicen
            clearCache('Seguimientos');
            await new Promise(resolve => setTimeout(resolve, 300));
            setUpdateTrigger(prev => prev + 1);
            
            handleCloseEditModal();
        } catch (error) {
            console.error('Error al actualizar seguimiento:', error);
            setErrorMessage('Error al actualizar el seguimiento');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteSeguimiento = async () => {
        if (!editingSeguimiento) return;
        
        setEditLoading(true);
        try {
            await deleteSeguimiento(editingSeguimiento);
            
            // Recargar datos
            clearCache('Seguimientos');
            setUpdateTrigger(prev => prev + 1);
            
            handleCloseEditModal();
        } catch (error) {
            console.error('Error al eliminar seguimiento:', error);
            setErrorMessage('Error al eliminar el seguimiento');
        } finally {
            setEditLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async () => {
        // Validar que idPrograma sea válido antes de proceder
        if (!idPrograma || idPrograma === 'N/A' || idPrograma === 'undefined') {
            console.error('handleSubmit: idPrograma no válido:', idPrograma);
            setErrorMessage('Error: ID del programa no válido');
            return;
        }

        setLoading(true);
        const date = new Date();
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const dataSendDoc = [idPrograma, selectedDoc.id, inputValue, formattedDate];

        try {
            await sendDataToServerDoc(dataSendDoc);
            console.log("Documento:", selectedDoc.id, "idPrograma", idPrograma, "Input:", inputValue, "Fecha:", formattedDate);
            setSuccessMessage('Datos enviados correctamente');
            setSentDocId(selectedDoc.id);
            Filtro21Data.push({ id_doc: selectedDoc.id, id_programa: idPrograma, url: inputValue });
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            setErrorMessage('Error al enviar los datos al servidor');
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    // Este useEffect ya no es necesario con el sistema de contador
    // pero lo mantenemos por si hay dependencias en otros lugares
    useEffect(() => {
        if (dataUpdated) {
            setDataUpdated(false);
        }
    }, [dataUpdated]);

    const handleToggleCalendar = () => {
        setCalendarOpen((prev) => !prev);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setCalendarOpen(false);
    };

    // Función para calcular fechas 
    function calcularFechas(fechaexpedrc, fechavencrc) {
        // Validar que ambas fechas existan y tengan el formato correcto
        if (!fechaexpedrc || !fechavencrc || 
            typeof fechaexpedrc !== 'string' || 
            typeof fechavencrc !== 'string' ||
            fechaexpedrc.trim() === '' || 
            fechavencrc.trim() === '' ||
            fechaexpedrc === 'N/A' || 
            fechavencrc === 'N/A' ||
            fechaexpedrc === '#N/A' || 
            fechavencrc === '#N/A') {
            return {
                unAñoSeisMesesDespues: 'N/A',
                cuatroAñosAntesVencimiento: 'N/A',
                dosAñosAntesVencimiento: 'N/A',
                dieciochoMesesAntes: 'N/A'
            };
        }

        try {
            const partesFechaExpedicion = fechaexpedrc.split('/');
            const partesFechaVencimiento = fechavencrc.split('/');
            
            // Validar que las fechas tengan el formato correcto (dd/mm/yyyy)
            if (partesFechaExpedicion.length !== 3 || partesFechaVencimiento.length !== 3) {
                return {
                    unAñoSeisMesesDespues: 'N/A',
                    cuatroAñosAntesVencimiento: 'N/A',
                    dosAñosAntesVencimiento: 'N/A',
                    dieciochoMesesAntes: 'N/A'
                };
            }

            const diaExpedicion = parseInt(partesFechaExpedicion[0], 10);
            const mesExpedicion = parseInt(partesFechaExpedicion[1], 10) - 1;
            const añoExpedicion = parseInt(partesFechaExpedicion[2], 10);
            const diaVencimiento = parseInt(partesFechaVencimiento[0], 10);
            const mesVencimiento = parseInt(partesFechaVencimiento[1], 10) - 1;
            const añoVencimiento = parseInt(partesFechaVencimiento[2], 10);

            // Validar que las fechas sean válidas
            if (isNaN(diaExpedicion) || isNaN(mesExpedicion) || isNaN(añoExpedicion) ||
                isNaN(diaVencimiento) || isNaN(mesVencimiento) || isNaN(añoVencimiento)) {
                return {
                    unAñoSeisMesesDespues: 'N/A',
                    cuatroAñosAntesVencimiento: 'N/A',
                    dosAñosAntesVencimiento: 'N/A',
                    dieciochoMesesAntes: 'N/A'
                };
            }

            const fechaUnAñoSeisMesesDespues = new Date(añoExpedicion, mesExpedicion, diaExpedicion);
            fechaUnAñoSeisMesesDespues.setMonth(fechaUnAñoSeisMesesDespues.getMonth() + 6);
            fechaUnAñoSeisMesesDespues.setFullYear(fechaUnAñoSeisMesesDespues.getFullYear() + 1);

            const fechaCuatroAñosAntesVencimiento = new Date(añoVencimiento, mesVencimiento, diaVencimiento);
            fechaCuatroAñosAntesVencimiento.setFullYear(fechaCuatroAñosAntesVencimiento.getFullYear() - 4);

            const fechaDosAñosAntesVencimiento = new Date(añoVencimiento, mesVencimiento, diaVencimiento);
            fechaDosAñosAntesVencimiento.setFullYear(fechaDosAñosAntesVencimiento.getFullYear() - 2);

            const fechaDieciochoMesesAntes = new Date(añoVencimiento, mesVencimiento, diaVencimiento);
            fechaDieciochoMesesAntes.setMonth(fechaDieciochoMesesAntes.getMonth() - 18);

            const formatDate = (date) => {
                const day = (`0${date.getDate()}`).slice(-2);
                const month = (`0${date.getMonth() + 1}`).slice(-2);
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            return {
                unAñoSeisMesesDespues: formatDate(fechaUnAñoSeisMesesDespues),
                cuatroAñosAntesVencimiento: formatDate(fechaCuatroAñosAntesVencimiento),
                dosAñosAntesVencimiento: formatDate(fechaDosAñosAntesVencimiento),
                dieciochoMesesAntes: formatDate(fechaDieciochoMesesAntes)
            };
        } catch (error) {
            console.error('Error al calcular fechas:', error);
            return {
                unAñoSeisMesesDespues: 'N/A',
                cuatroAñosAntesVencimiento: 'N/A',
                dosAñosAntesVencimiento: 'N/A',
                dieciochoMesesAntes: 'N/A'
            };
        }
    }

    // Validar que rowData exista antes de calcular fechas
    const fechasCalculadas = rowData ? calcularFechas(rowData['fechaexpedrc'], rowData['fechavencrc']) : {
        unAñoSeisMesesDespues: 'N/A',
        cuatroAñosAntesVencimiento: 'N/A',
        dosAñosAntesVencimiento: 'N/A',
        dieciochoMesesAntes: 'N/A'
    };
    const fechasCalculadasAC = rowData ? calcularFechas(rowData['fechaexpedac'], rowData['fechavencac']) : {
        unAñoSeisMesesDespues: 'N/A',
        cuatroAñosAntesVencimiento: 'N/A',
        dosAñosAntesVencimiento: 'N/A',
        dieciochoMesesAntes: 'N/A'
    };

    useEffect(() => {
        if (handleButtonClick != null) {
            cargarFases();
        }
    }, [handleButtonClick]);

    const clearFileLink = () => {
        setFileLink('');
        setSelectedDocReq('');
    };

    // Función para cargar las fases del programa y los documentos según la opción seleccionada
    const cargarFases = async () => {
        try {
            setLoading(true);
            let procesoActual = '';
            let documentoproceso = '';
            
            // Si no hay un botón seleccionado, terminar la función
            if (!handleButtonClick) {
                setLoading(false);
                return;
            }
            
            if (handleButtonClick === 'crea') {
                procesoActual = 'Creación';
                documentoproceso = 'Creación';
            } else if (handleButtonClick === 'rrc') {
                procesoActual = 'Renovación Registro Calificado';
                documentoproceso = 'Renovación Registro Calificado';
            } else if (handleButtonClick === 'aac') {
                procesoActual = 'Acreditación';
                documentoproceso = 'Acreditación';
            } else if (handleButtonClick === 'raac') {
                procesoActual = 'Renovación Acreditación';
                documentoproceso = 'Renovación Acreditación';
            } else if (handleButtonClick === 'mod') {
                procesoActual = 'Modificación';
                documentoproceso = 'Modificación';
            } else if (handleButtonClick === 'Seg' || handleButtonClick === 'conv') {
                // Para estos casos no necesitamos cargar fases
                setLoading(false);
                return;
            }
    
            // Inicializar estados con valores vacíos por defecto
            setFases([]);
            setFasesName([]);
            setItemActual(null);
            setDocs([]);
    
            const general = await Filtro10();
            console.log('Filtro10 response:', general);
            if (!general || !Array.isArray(general)) {
                console.error('Error: Filtro10 no devolvió un array', general);
                setLoading(false);
                return;
            }
            
            const creaData = filteredData.filter(item => (item.topic || '').toLowerCase().includes('creación'))
            console.log('Seguimiento component - Datos filtrados para creación:', creaData);

            const fasesProgramas = await Filtro11();
            console.log('Filtro11 response:', fasesProgramas);
    
            const general2 = general
                .filter(item => item['proceso'] === procesoActual)
                .sort((a, b) => a.orden - b.orden);
    
            const response = await obtenerFasesProceso();
            console.log('obtenerFasesProceso response:', response);
            if (!response || !Array.isArray(response)) {
                console.error('Error: obtenerFasesProceso no devolvió un array', response);
                setLoading(false);
                return;
            }
    
            // Validar que idPrograma sea válido antes de filtrar
            if (!idProgramaFinal || idProgramaFinal === 'N/A' || idProgramaFinal === 'undefined') {
                console.warn('cargarFases: idPrograma no válido:', idProgramaFinal, 'no se pueden cargar fases');
                setFases([]);
                setFasesName([]);
                setDocs([]);
                setLoading(false);
                return;
            }

            const fasesFiltradas = response.filter(item => item.id_programa === idProgramaFinal);
            const result2 = fasesFiltradas.map(fase => {
                const filtro10Item = general.find(item => item.id === fase.id_fase);
                return filtro10Item ? filtro10Item : null;
            });
            
            const result3 = result2.filter(item => item && item['proceso'] === procesoActual)
                .sort((a, b) => a.orden - b.orden);
    
            setFases(general2);
            setFasesName(result3);
            
            if (result3 && result3.length > 0) {
                setItemActual(result3[0]);
            }
            
            const proceso = await Filtro12();
            console.log('Filtro12 response:', proceso);
            if (!proceso || !Array.isArray(proceso)) {
                console.error('Error: Filtro12 no devolvió un array', proceso);
                setLoading(false);
                return;
            }
            
            const procesoFiltrado = proceso.filter(item => item['proceso'] === documentoproceso);
            setDocs(procesoFiltrado);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar las fases:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, [handleButtonClick]);

    // Función para cargar los items del menú según el proceso seleccionado
    const fetchMenuItems = async () => {
        try {
            let procesoActual = '';
            if (handleButtonClick === 'crea') {
                procesoActual = 'Creación';
            } else if (handleButtonClick === 'rrc') {
                procesoActual = 'Renovación Registro Calificado';
            } else if (handleButtonClick === 'aac') {
                procesoActual = 'Acreditación';
            } else if (handleButtonClick === 'raac') {
                procesoActual = 'Renovación Acreditación';
            } else if (handleButtonClick === 'mod') {
                procesoActual = 'Modificación';
            }
            const response = await Filtro10();
            const result = response
                .filter(item => item['proceso'] === procesoActual)
                .sort((a, b) => a.orden - b.orden); // Ordenar por orden

            setMenuItems(result);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    // Efecto para cargar datos de usuario desde el almacenamiento de sesión
    useEffect(() => {
        if (sessionStorage.getItem('logged')) {
            let res = JSON.parse(sessionStorage.getItem('logged'));
            // Asegurarse de que res.map(...).flat() devuelva un array
            const permisos = res.map(item => item.permiso || []).flat();
            setCargo(permisos.length > 0 ? permisos : [' ']);
            setUser(res[0]?.user || '');
        } else {
            // Establecer un array vacío o con un valor por defecto si no hay datos de sesión
            setCargo([' ']);
        }
    }, []);

    const avaibleRange = (buscar) => {
        // Verificar que isCargo sea un array antes de intentar usar .some()
        if (!Array.isArray(isCargo)) return false;
        
        // También asegurar que buscar sea un valor válido
        if (!buscar) return false;
        
        return isCargo.some(cargo => {
            // Verificar el tipo de buscar antes de usar includes
            if (typeof buscar === 'string') {
                return buscar.includes(cargo);
            } else if (Array.isArray(buscar)) {
                return buscar.includes(cargo);
            }
            return false;
        });
    };

    // Efecto para cargar datos filtrados
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Validar que idPrograma sea válido antes de hacer la llamada
                if (!idProgramaFinal || idProgramaFinal === 'N/A' || idProgramaFinal === 'undefined') {
                    setFilteredData([]);
                    return;
                }

                // Si updateTrigger > 0, significa que se acaba de guardar algo, limpiar caché
                if (updateTrigger > 0) {
                    clearCache('Seguimientos');
                }
                
                const response = await Filtro7();
                
                // Debug: mostrar datos recibidos
                console.log('📊 Filtro7 - Total seguimientos:', response?.length);
                console.log('📊 idProgramaFinal:', idProgramaFinal, 'tipo:', typeof idProgramaFinal);
                
                if (response && response.length > 0) {
                    console.log('📊 Ejemplo de seguimiento:', response[0]);
                    console.log('📊 id_programa del primer item:', response[0]?.id_programa, 'tipo:', typeof response[0]?.id_programa);
                }
                
                // Filtrar por id_programa usando comparación flexible (convertir a string)
                const idProgramaStr = String(idProgramaFinal).trim();
                const filteredByProgram = response.filter(item => {
                    const itemIdStr = String(item['id_programa'] || '').trim();
                    return itemIdStr === idProgramaStr;
                });
                
                console.log('📊 Seguimientos filtrados por programa:', filteredByProgram.length);
                
                if (filteredByProgram.length > 0) {
                    console.log('📊 Topics encontrados:', [...new Set(filteredByProgram.map(s => s.topic))]);
                }
                
                setFilteredData(filteredByProgram);
            } catch (error) {
                console.error('Error al cargar seguimientos:', error);
                setFilteredData([]);
            }
        };
        fetchData();
    }, [updateTrigger, idProgramaFinal]);

    // Obtener color de fondo basado en el riesgo
    const getBackgroundColor = (riesgo) => {
        switch (riesgo) {
            case 'Alto':
                return '#FED5D1';
            case 'Medio':
                return '#FEFBD1';
            case 'Bajo':
                return '#E6FFE6';
            default:
                return 'white';
        }
    };

    // Obtener el nombre de la fase basado en su ID
    const getFaseName = (faseId) => {
        const fase = fasesName.find(f => f.id === faseId);
        return fase ? fase.fase : ' - ';
    };

    // Obtener el ID de fase por nombre
    const getFaseIdByName = (faseName) => {
        const fase = fasesName.find(f => f.fase === faseName);
        return fase ? fase.id : null;
    };

    // Renderizar seguimientos de una fase específica
    const renderSeguimientosPorFase = (fase) => {
        // Obtener el ID de la fase
        const faseId = fase.id;
        
        // Filtrar seguimientos que pertenecen a esta fase
        const seguimientosFase = filteredData.filter(seg => {
            // Comparar el nombre de fase del seguimiento con el nombre de la fase actual
            return seg.fase && getFaseName(seg.fase) === fase.fase;
        });

        if (seguimientosFase.length === 0) {
            return <p style={{ textAlign: 'center', color: '#888', padding: '10px' }}>Sin seguimientos registrados en esta fase</p>;
        }

        // Ordenar por fecha
        seguimientosFase.sort((a, b) => {
            const dateA = new Date(a.timestamp.split('/').reverse().join('-'));
            const dateB = new Date(b.timestamp.split('/').reverse().join('-'));
            return dateB - dateA;
        });

        return (
            <div style={{ position: 'relative', width: '100%', paddingRight: '45px', display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <table style={{ width: '90%', maxWidth: '90%', borderCollapse: 'collapse', border: '1px solid grey', textAlign: 'center', marginTop: '10px', tableLayout: 'fixed', margin: '10px auto' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '10%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Fecha</th>
                            <th style={{ width: '50%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Comentario</th>
                            <th style={{ width: '10%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Riesgo</th>
                            <th style={{ width: '15%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Usuario</th>
                            <th style={{ width: '15%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Adjunto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seguimientosFase.map((item, index) => {
                            const rowKey = `fase-${faseId}-${index}`;
                            return (
                                <tr 
                                    key={index} 
                                    style={{ 
                                        backgroundColor: getBackgroundColor(item['riesgo']),
                                        position: 'relative',
                                        cursor: soloLectura ? 'default' : 'pointer'
                                    }}
                                    onMouseEnter={() => setHoveredRowIndex(rowKey)}
                                    onMouseLeave={() => setHoveredRowIndex(null)}
                                    onClick={() =>{ 
                                       if(!soloLectura) handleOpenEditModal(item);
                                    }}
                                >
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>{item['timestamp']}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', textAlign: 'left', padding: '3px 4px', fontSize: '0.8rem', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{item['mensaje']}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>{item['riesgo']}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>{item['usuario']?.split('@')[0] || '-'}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>
                                        {item['url_adjunto'] ? (
                                            <a 
                                                href={item['url_adjunto']} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{ color: 'blue', textDecoration: 'underline', fontSize: '0.75rem' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Enlace
                                            </a>
                                        ) : (
                                            <strong>-</strong>
                                        )}
                                    </td>
                                    {hoveredRowIndex === rowKey && !soloLectura && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                right: '-40px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 10
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEditModal(item);
                                                }}
                                                style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                    padding: '4px'
                                                }}
                                                title="Editar seguimiento"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Renderizar la tabla de fases
    const contenido_tablaFases = () => {
        const groupedFases = fases.reduce((acc, fase) => {
            const grupo = fase.fase_sup || 'Sin Agrupar';
            if (!acc[grupo]) {
                acc[grupo] = [];
            }
            acc[grupo].push(fase);
            return acc;
        }, {});

        return (
            <>
                <div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexDirection: 'row', width: '100%' }}>
                                <div style={{ flex: 1, marginRight: '20px' }}>
                                    {Object.keys(groupedFases).length > 0 && (
                                        <div>
                                            <h2>Fases del Proceso</h2>
                                            {Object.entries(groupedFases).map(([grupo, fasesGrupo]) => (
                                                <div key={grupo} style={{ marginBottom: '10px' }}>
                                                    {grupo !== 'Sin Agrupar' && <> <h4>{grupo.toUpperCase()}</h4>
                                                    <div style={{ borderBottom: '1px solid #bbb', margin: '2px 0 35px 0' }} />
                                                    </>
                                                    }
                                                    
                                                    {fasesGrupo.map((fase, index) => {
                                                        const isFaseName = fasesName.find(fn => fn.proceso === fase.proceso && fn.fase === fase.fase);
                                                        
                                                        // Verificar si la fase tiene seguimientos asociados
                                                        const tieneSeguimientos = filteredData.some(seg => 
                                                            seg.fase && getFaseName(seg.fase) === fase.fase
                                                        );
                                                        
                                                        // Determinar el color de fondo
                                                        // Verde oscuro (#64b06a): Fase actual con seguimientos
                                                        // Verde claro (#aae3ae): Fase con seguimientos pero no es la actual
                                                        // Gris (#f5f5f5): Fase sin seguimientos
                                                        let backgroundColor = '#f5f5f5'; // Por defecto gris
                                                        
                                                        if (tieneSeguimientos) {
                                                            // Si tiene seguimientos, verificar si es la fase actual
                                                            if (itemActual && fase.fase === itemActual.fase) {
                                                                backgroundColor = '#64b06a'; // Verde oscuro para fase actual con seguimientos
                                                            } else if (isFaseName) {
                                                                backgroundColor = '#aae3ae'; // Verde claro para otras fases con seguimientos
                                                            }
                                                        }
                                                        const responsable = fase.responsable && fase.responsable.trim() !== '' ? fase.responsable : 'N/A';
                                                        const documentosFase = docs.filter(doc => {
                                                            if (!doc.id_fase) return false;
                                                            const ids = doc.id_fase.split(',').map(id => id.trim());
                                                            return ids.includes(fase.id);
                                                        });
                                                        
                                                        return (
                                                            <CollapsibleButton 
                                                                key={index}
                                                                buttonText={ 
                                                                    <span style={{ display: 'inline-block', width: '100%' }}>
                                                                        <span style={{ fontWeight: 'bold' }}>{fase.fase}</span>
                                                                        {responsable !== 'N/A' 
                                                                            ? <span> - Responsable: <span style={{ fontWeight: 'normal', color: 'black' }}>{responsable}</span></span>
                                                                            : <span style={{ color: 'black' }}> - Responsable no asignado</span>
                                                                        }
                                                                    </span>
                                                                }
                                                                defaultClosed={true}
                                                                buttonStyle={{
                                                                    backgroundColor: backgroundColor,
                                                                    width: '100%',
                                                                    marginBottom: '8px',
                                                                    padding: '12px',
                                                                    textAlign: 'left',
                                                                    fontSize: '0.9rem',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '6px',
                                                                    whiteSpace: 'normal',
                                                                    wordBreak: 'break-word',
                                                                    lineHeight: '1.5',
                                                                    minHeight: '44px',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                                content={
                                                                    <div style={{ padding: '10px', backgroundColor: 'white' }}>
                                                                        {/* Seguimientos de la fase */}
                                                                        {renderSeguimientosPorFase(fase)}
                                                                        
                                                                        {/* Información de la fase */}
                                                                        <div style={{ 
                                                                            padding: '15px', 
                                                                            backgroundColor: '#f9f9f9', 
                                                                            borderRadius: '6px',
                                                                            marginTop: '10px',
                                                                            border: '1px solid #e0e0e0'
                                                                        }}>
                                                                            {/*
                                                                            <div style={{ marginBottom: '12px' }}>
                                                                                <strong style={{ fontSize: '0.9rem', color: '#333' }}>Responsable:</strong>
                                                                                <span style={{ marginLeft: '8px', fontSize: '0.9rem' }}>{responsable}</span>
                                                                            </div>
                                                                */}
                                                                            <div style={{ textAlign: 'left' }}>
                                                                                <strong style={{ fontSize: '0.9rem', color: '#333' }}>Documentos Requeridos:</strong>
                                                                                {documentosFase.length > 0 ? (
                                                                                    <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, textAlign: 'left', listStylePosition: 'outside' }}>
                                                                                        {documentosFase.map((doc, docIdx) => {
                                                                                            const filtroVerde = Filtro21Data.some(filtro => filtro.id_doc === doc.id && filtro.id_programa === idProgramaFinal);
                                                                                            const fondoVerde = filtroVerde ? { backgroundColor: '#E6FFE6', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', cursor: 'pointer' } : { cursor: 'pointer' };
                                                                                            const filtro = Filtro21Data.find(filtro => filtro.id_doc === doc.id && filtro.id_programa === idProgramaFinal);
                                                                                            const filtroUrl = filtro ? filtro.url : null;
                                                                                            const handleClick = filtroUrl ? () => window.open(filtroUrl, '_blank') : () => handleOpen(doc);
                                                                                            const handleLinkClick = (event) => { event.stopPropagation(); };
                                                                                            return (
                                                                                                <li key={docIdx} style={{ marginBottom: '6px' }}>
                                                                                                    <span style={fondoVerde} onClick={handleClick}>
                                                                                                        {filtroUrl ? (
                                                                                                            <a href={filtroUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontSize: '0.85rem' }} onClick={handleLinkClick}>{doc.nombre_doc}</a>
                                                                                                        ) : (
                                                                                                            <span style={{ fontSize: '0.85rem' }}>{doc.nombre_doc}</span>
                                                                                                        )}
                                                                                                    </span>
                                                                                                </li>
                                                                                            );
                                                                                        })}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <span style={{ color: '#888', marginLeft: '8px', fontSize: '0.85rem' }}>Sin documentos</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            />
                                                        );
                                                    })}
                                                    
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Modal open={open} onClose={handleClose}>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                                        <h2>Agregar {selectedDoc && selectedDoc.nombre_doc}</h2>
                                        <TextField
                                            label="Link del documento"
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                                            {loading ? 'Enviando...' : 'Enviar'}
                                        </Button>
                                        <Button variant="contained" onClick={handleClose} style={{ marginLeft: '10px' }}>
                                            Cancelar
                                        </Button>
                                        {successMessage && <p>{successMessage}</p>}
                                    </div>
                                </Modal>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    };

    // Renderizar tabla filtrada
    const renderFilteredTable = (data, filters, fasesTabla, useTopicAsFase = false, soloSinFase = false) => {
        if (!Array.isArray(filters)) {
            filters = [filters];
        }
        console.log('📋 renderFilteredTable - data recibida:', data?.length, 'filtros:', filters, 'soloSinFase:', soloSinFase);
        
        let tableData = Filtro8(data, filters);
        console.log('📋 renderFilteredTable - Filtrados por topic:', tableData?.length);
        
        // Si soloSinFase es true, filtrar solo los seguimientos sin fase asignada
        if (soloSinFase) {
            tableData = tableData.filter(item => !item.fase || item.fase === '' || getFaseName(item.fase) === ' - ');
            console.log('📋 renderFilteredTable - Después de filtrar sin fase:', tableData?.length);
        }
        
        if (tableData.length === 0) {
            return <p>Ningún seguimiento por mostrar</p>;
        }

        tableData.sort((a, b) => {
            const dateA = new Date(a.timestamp.split('/').reverse().join('-'));
            const dateB = new Date(b.timestamp.split('/').reverse().join('-'));
            return dateB - dateA;
        });

        return (
            <div style={{ position: 'relative', width: '100%', paddingRight: '45px', display: 'flex', justifyContent: 'center' }}>
                <table style={{ width: '90%', maxWidth: '90%', borderCollapse: 'collapse', border: '1px solid grey', textAlign: 'center', marginTop: '10px', tableLayout: 'fixed', margin: '10px auto' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '8%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Fecha</th>
                            <th style={{ width: '35%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Comentario</th>
                            <th style={{ width: '8%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Riesgo</th>
                            <th style={{ width: '12%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Usuario</th>
                            <th style={{ width: '10%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Adjunto</th>
                            <th style={{ width: '27%', border: '1px solid grey', padding: '3px', fontSize: '0.8rem' }}>Fase</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => {
                            const rowKey = `${filters[0]}-${index}`;
                            return (
                                <tr 
                                    key={index} 
                                    style={{ 
                                        backgroundColor: getBackgroundColor(item['riesgo']),
                                        position: 'relative',
                                        cursor: soloLectura ? 'default' : 'pointer'
                                    }}
                                    onMouseEnter={() => setHoveredRowIndex(rowKey)}
                                    onMouseLeave={() => setHoveredRowIndex(null)}
                                    onClick={() =>{ 
                                       if(!soloLectura) handleOpenEditModal(item);
                                    }}
                                >
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>{item['timestamp']}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', textAlign: 'left', padding: '3px 4px', fontSize: '0.8rem', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{item['mensaje']}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>{item['riesgo']}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>{item['usuario']?.split('@')[0] || '-'}</td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem' }}>
                                        {item['url_adjunto'] ? (
                                            <a 
                                                href={item['url_adjunto']} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{ color: 'blue', textDecoration: 'underline', fontSize: '0.75rem' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Enlace
                                            </a>
                                        ) : (
                                            <strong>-</strong>
                                        )}
                                    </td>
                                    <td style={{ border: '1px solid grey', verticalAlign: 'middle', padding: '3px', fontSize: '0.8rem', wordWrap: 'break-word' }}>
                                        {useTopicAsFase ? item['topic'] : getFaseName(item['fase'])}
                                    </td>
                                    {/* Icono de edición flotante - aparece fuera de la tabla */}
                                    {hoveredRowIndex === rowKey && !soloLectura && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                right: '-40px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 10
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEditModal(item);
                                                }}
                                                style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                    padding: '4px'
                                                }}
                                                title="Editar seguimiento"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Manejar clic para nuevo seguimiento
    const handleNewTrackingClick = (collapsibleType) => {
        setShowCollapsible(prevState => ({
            ...prevState,
            [collapsibleType]: !prevState[collapsibleType]
        }));
        setCollapsible(collapsibleType)
    };

    // Contenido del seguimiento pm
    const contenido_seguimiento = () => {
        const handleInputChange1 = (event) => {
            setComment(event.target.value);
        };

        const handleGuardarClick = async () => {
            try {
                // Validar que idPrograma sea válido antes de proceder
                if (!idProgramaFinal || idProgramaFinal === 'N/A' || idProgramaFinal === 'undefined') {
                    console.error('handleGuardarClick: idPrograma no válido:', idProgramaFinal);
                    setErrorMessage('Error: ID del programa no válido');
                    setFormSubmitted(true);
                    return;
                }

                if (comment.trim() === '' || value.trim() === '' || selectedPhase.trim() === '') {
                    setLoading(false);
                    const errorMessage = 'Por favor, complete todos los campos obligatorios.';
                    setErrorMessage(errorMessage);
                    setFormSubmitted(true);
                    return;
                }

                let formattedDate;
                if (selectedDate) {
                    formattedDate = dayjs(selectedDate).format('DD/MM/YYYY');
                } else {
                    formattedDate = dayjs().format('DD/MM/YYYY');
                }

                const collapsibleType = selectedPhase === 'RRC'
                    ? 'Plan de Mejoramiento RRC'
                    : (selectedPhase === 'RAAC' ? 'Plan de Mejoramiento RAAC' : 'Plan de Mejoramiento AAC');

                const dataSend = [
                    idProgramaFinal,
                    formattedDate,
                    comment,
                    value,
                    user,
                    collapsibleType,
                    selectedOption.id,
                ];

                // DESHABILITADO: Funcionalidad de actividad_terminada comentada temporalmente
                // const dataSendCrea = [
                //     idProgramaFinal,
                //     selectedOption.id,
                //     formattedDate,
                // ];

                await sendDataToServer(dataSend);
                
                // Esperar un momento para asegurar que los datos se guarden en Sheets
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // DESHABILITADO: No guardar en actividad_terminada por ahora
                // if (selectedOption.id !== undefined) {
                //     await sendDataToServerCrea(dataSendCrea);
                // }
                
                clearFileLink();
                setComment('');
                setValue('');
                setSelectedPhase('');
                setErrorMessage(null);
                
                // Desactivar loading ANTES de abrir el modal
                setLoading(false);
                
                // Esperar un momento para que React actualice el estado
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Abrir modal de éxito
                setOpenModal(true);
                
                // Recargar datos en segundo plano
                setUpdateTrigger(prev => prev + 1);
            } catch (error) {
                setLoading(false);
                console.error('Error al enviar datos:', error);
            }
        };

        return (
            <>
                <div className='container-NS' style={{ fontWeight: 'bold', width: '100%', display: 'flex', flexDirection: 'row', margin: '20px', alignItems: 'center', gap: 'px' }}>
                    <div className='date-picker' style={{ flex: 1 }}>
                        <Typography variant="h6">Fecha *</Typography>
                        <div style={{ display: 'inline-block' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={esLocale}>
                                {isMobile ? (
                                    <MobileDatePicker
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                inputProps={{ ...params.inputProps, readOnly: true }}
                                            />
                                        )}
                                    />
                                ) : (
                                    <DesktopDatePicker
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                inputProps={{ ...params.inputProps, readOnly: true }}
                                            />
                                        )}
                                    />
                                )}
                            </LocalizationProvider>
                        </div>
                    </div>
                    <div className='comments' style={{ flex: 1 }}>
                        <Typography variant="h6">Comentario *</Typography>
                        <TextField
                            multiline
                            rows={3}
                            required
                            value={comment}
                            onChange={handleInputChange1}
                            placeholder="Comentario"
                            type="text"
                            variant="outlined"
                            fullWidth
                            error={formSubmitted && comment.trim() === ''}
                            helperText={formSubmitted && comment.trim() === '' ? 'Este campo es obligatorio' : ''}
                        />
                    </div>
                    <div className='adj-risk-phase' style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className='risk'>
                            <Typography variant="h6">Riesgo *</Typography>
                            <FormControl component="fieldset" required error={formSubmitted && value.trim() === ''}>
                                <RadioGroup value={value} onChange={e => { setValue(e.target.value) }} style={{ display: 'flex', flexDirection: 'row' }}>
                                    <FormControlLabel value="Alto" control={<Radio />} label="Alto" />
                                    <FormControlLabel value="Medio" control={<Radio />} label="Medio" />
                                    <FormControlLabel value="Bajo" control={<Radio />} label="Bajo" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        <div className='phase'>
                            <Typography variant="h6">Seleccionar fase *</Typography>
                            <FormControl component="fieldset" required error={formSubmitted && selectedPhase.trim() === ''}>
                                <RadioGroup value={selectedPhase} onChange={e => setSelectedPhase(e.target.value)} style={{ display: 'flex', flexDirection: 'row' }}>
                                    <FormControlLabel value="RRC" control={<Radio />} label="RRC" />
                                    <FormControlLabel value="RAAC" control={<Radio />} label="RAAC" />
                                    <FormControlLabel value="AAC" control={<Radio />} label="AAC" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                    </div>
                </div>
                <Button variant="contained" color="primary" onClick={handleGuardarClick} style={{ marginTop: '20px', alignSelf: 'center' }}>Guardar</Button>
                {loading && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 9998,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <CircularProgress style={{ zIndex: 9999 }} />
                        </div>
                    </div>
                )}
                <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        color: '#423b3b',
                        border: '2px solid grey',
                        borderRadius: '10px',
                        boxShadow: 24,
                        p: 4,
                        padding: '25px',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                    }}>
                        <Typography variant="h6" component="h2" style={{ fontFamily: 'Roboto' }} gutterBottom>
                            Sus datos han sido guardados exitosamente
                        </Typography>
                        <Button style={{ backgroundColor: '#1A80D9', color: '#F2F2F2' }} onClick={() => setOpenModal(false)}>Cerrar</Button>
                    </div>
                </Modal>
                {errorMessage && (
                    <div style={{ color: 'red', fontSize: '17px', paddingBottom: '10px' }}>
                        {errorMessage}
                    </div>
                )}
            </>
        );
    };

    const [openSecondModal, setOpenSecondModal] = useState(false);
    const [resolutionDate, setResolutionDate] = useState(null);
    const [duration, setDuration] = useState('');
    const [resolutionURL, setResolutionURL] = useState('');
    const [decision, setDecision] = useState(''); // Nueva variable de estado para la decisión

    const handleCloseFirstModal = () => {
        setOpenModal(false);
        // Asegurarse de que loading esté en false al cerrar el modal
        setLoading(false);
        // Solo abrir el segundo modal si la fase seleccionada es "Proceso Finalizado" y el usuario lo confirma
        // Este segundo modal es para registrar el cierre del proceso, no para el archivo adjunto
        if (selectedOption && selectedOption.fase === "Proceso Finalizado") {
            // Preguntar al usuario si desea registrar el cierre del proceso
            const confirmar = window.confirm('¿Desea registrar los datos de cierre del proceso (fecha de resolución, duración, etc.)?');
            if (confirmar) {
                setOpenSecondModal(true);
            }
        }
    };

    const handleSendHistoricalData = async () => {
        try {
            const shortUUID = uuidv4().slice(0, 7); // Genera un UUID corto de 7 caracteres
            const formattedResolutionDate = resolutionDate ? dayjs(resolutionDate).format('DD/MM/YYYY') : '';
            const historicalData = [
                shortUUID,
                idProgramaFinal,
                handleButtonClick,
                formattedResolutionDate,
                duration,
                resolutionURL,
                decision
            ];

            await sendDataToServerHistorico(historicalData);
            
            // Esperar un momento para asegurar que los datos se guarden en Sheets
            await new Promise(resolve => setTimeout(resolve, 500));

            setOpenSecondModal(false);
            setResolutionDate(null);
            setDuration('');
            setResolutionURL('');
            setDecision(''); // Reseteamos la decisión
            // Usar contador para asegurar que el useEffect siempre se dispare
            setUpdateTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error al enviar datos históricos:', error);
        }
    };

    // Contenido del seguimiento por defecto de los demás botones
    const contenido_seguimiento_default = () => {
        const groupedFases = menuItems.reduce((acc, item) => {
            const grupo = item.fase_sup || 'Sin Agrupar';
            if (!acc[grupo]) {
                acc[grupo] = [];
            }
            acc[grupo].push(item);
            return acc;
        }, {});

        const handleGuardarClickDefault = async () => {
            try {
                // Validar que idPrograma sea válido antes de proceder
                if (!idProgramaFinal || idProgramaFinal === 'N/A' || idProgramaFinal === 'undefined' || idProgramaFinal === 'null') {
                    console.error('handleGuardarClickDefault: idPrograma no válido:', idProgramaFinal);
                    console.error('rowData completo:', rowData);
                    setErrorMessage('Error: ID del programa no válido. Por favor, verifique que el programa esté correctamente seleccionado.');
                    setFormSubmitted(true);
                    return;
                }

                setLoading(true);
                let enlace;
                let docReqId = null;
                if (fileType === 'upload' && fileInputRef.current) {
                    const files = fileInputRef.current.files;
                    const formData = new FormData();
                    for (let i = 0; i < files.length; i++) {
                        formData.append("file", files[i]);
                    }
                    const response = await fetch("https://siac-server.vercel.app/upload/", {
                        method: 'POST',
                        body: formData,
                        headers: {
                            enctype: 'multipart/form-data',
                        }
                    });
                    const data = await response.json();
                    enlace = data.enlace;
                } else if (fileType === 'link') {
                    enlace = fileLink;
                    docReqId = selectedDocReq;
                } else {
                    enlace = fileLink;
                }

                if (comment.trim() === '' || value.trim() === '') {
                    setLoading(false);
                    const errorMessage = 'Por favor, complete todos los campos obligatorios.';
                    setErrorMessage(errorMessage);
                    setFormSubmitted(true);
                    return;
                }

                let formattedDate;
                if (selectedDate) {
                    formattedDate = dayjs(selectedDate).format('DD/MM/YYYY');
                } else {
                    formattedDate = dayjs().format('DD/MM/YYYY');
                }

                const dataSend = [
                    idProgramaFinal,
                    formattedDate,
                    comment,
                    value,
                    user,
                    collapsible,
                    enlace,
                    selectedOption.id,
                    docReqId,
                ];

                // DESHABILITADO: Funcionalidad de actividad_terminada comentada temporalmente
                // const dataSendCrea = [
                //     idProgramaFinal,
                //     selectedOption.id,
                //     formattedDate,
                // ];

                await sendDataToServer(dataSend);
                
                // Esperar un momento para asegurar que los datos se guarden en Sheets
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // DESHABILITADO: No guardar en actividad_terminada por ahora
                // if (selectedOption.id !== undefined) {
                //     await sendDataToServerCrea(dataSendCrea);
                // }

                clearFileLink();
                setComment('');
                setValue('');
                setSelectedPhase('');
                setErrorMessage(null);
                
                // Desactivar loading ANTES de abrir el modal
                setLoading(false);
                
                // Esperar un momento para que React actualice el estado
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Abrir modal de éxito
                setOpenModal(true);
                
                // Recargar datos en segundo plano
                setUpdateTrigger(prev => prev + 1);
            } catch (error) {
                setLoading(false);
                setErrorMessage('Error al enviar los datos. Por favor, intente de nuevo.');
                console.error('Error al enviar datos:', error);
            }
        };

        return (
            <>
                <div className="container-NS" style={{ fontWeight: "bold", width: "100%", display: "flex", flexDirection: "column", margin: "5px", justifyContent: "center", marginTop: "10px", alignItems: "center" }}>
                    <div className="date-picker" style={{ paddingRight: "10px", marginBottom: "10px", width: "100%" }}>
                        <div className="main-container">
                            <div className='date-picker' style={{ flex: 1 }}>
                                <Typography variant="h6">Fecha *</Typography>
                                <div style={{ display: 'inline-block' }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={esLocale}>
                                        {isMobile ? (
                                            <MobileDatePicker
                                                value={selectedDate}
                                                onChange={setSelectedDate}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        inputProps={{ ...params.inputProps, readOnly: true }}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <DesktopDatePicker
                                                value={selectedDate}
                                                onChange={setSelectedDate}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        inputProps={{ ...params.inputProps, readOnly: true }}
                                                    />
                                                )}
                                            />
                                        )}
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <div className="comments">
                                Comentario * <br />
                                <TextField
                                    multiline
                                    rows={3}
                                    required
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    placeholder="Escribe tu comentario aquí"
                                    type="text"
                                    style={{
                                        border: formSubmitted && comment.trim() === "" ? "1px solid red" : "none",
                                        textAlign: "start",
                                        backgroundColor: "#f0f0f0",
                                        color: "black",
                                        width: "100%",
                                    }}
                                />
                            </div>
                            <div className="risk">
                                Riesgo *<br />
                                <FormControl
                                    component="fieldset"
                                    required
                                    error={formSubmitted && value.trim() === ""}
                                    style={{
                                        border: formSubmitted && value.trim() === "" ? "1px solid red" : "none",
                                    }}
                                >
                                    <RadioGroup
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                        }}
                                        required
                                    >
                                        <FormControlLabel
                                            value="Alto"
                                            control={<Radio />}
                                            label="Alto"
                                        />
                                        <FormControlLabel
                                            value="Medio"
                                            control={<Radio />}
                                            label="Medio"
                                        />
                                        <FormControlLabel
                                            value="Bajo"
                                            control={<Radio />}
                                            label="Bajo"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                            <div className="attachment">
                                <Typography variant="h6" style={{ marginBottom: '8px' }}>Archivo Adjunto</Typography>
                                <FormControl fullWidth size="small" sx={{ marginBottom: 2 }}>
                                    <InputLabel id="doc-req-label">Documento requerido</InputLabel>
                                    <Select
                                        labelId="doc-req-label"
                                        id="doc-req-select"
                                        value={selectedDocReq}
                                        label="Documento requerido"
                                        onChange={e => setSelectedDocReq(e.target.value)}
                                        displayEmpty
                                        required
                                    >
                                        <MenuItem value="">
                                            
                                        </MenuItem>
                                        {docs.map(doc => (
                                            <MenuItem key={doc.id} value={doc.id}>{doc.nombre_doc}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Link del archivo"
                                    value={fileLink}
                                    onChange={e => setFileLink(e.target.value)}
                                    placeholder="https://..."
                                    variant="outlined"
                                    sx={{ backgroundColor: 'white' }}
                                />
                            </div>
                            <div className="select-container">
                                <FormControl style={{ width: "100%", maxWidth: "100%" }}>
                                    <InputLabel
                                        id="select-label"
                                        style={{
                                            fontSize: "1.5rem",
                                            textAlign: "left",
                                            width: "100%",
                                        }}
                                    >
                                        Actividad
                                    </InputLabel>
                                    <Select
                                        labelId="select-label"
                                        id="select-label"
                                        value={selectedOption}
                                        label="Actividad"
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                        displayEmpty
                                        style={{ width: "100%" }}
                                        MenuProps={{
                                            disableScrollLock: true,
                                            PaperProps: {
                                                style: {
                                                    maxHeight: "150px",
                                                    overflowY: "auto",
                                                    overflowX: "hidden",
                                                    maxWidth: "50%",
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem
                                            value={0}
                                            sx={{
                                                display: "flex",
                                                width: "100%",
                                                "&:hover": {
                                                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                                                },
                                                whiteSpace: "normal",
                                                overflow: "visible",
                                            }}
                                        >
                                            Ninguna
                                        </MenuItem>
                                        {Object.entries(groupedFases).map(([grupo, fases]) => [
                                            <ListSubheader key={grupo} sx={{fontWeight: 'bold', color:'black'}}>{grupo.toUpperCase()}</ListSubheader>,
                                            ...fases.map((fase, index) => (
                                                <MenuItem
                                                    key={index}
                                                    value={fase}
                                                    sx={{
                                                        display: "flex",
                                                        width: "100%",
                                                        paddingLeft: "20px",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(0, 0, 0, 0.08)",
                                                        },
                                                        whiteSpace: "normal",
                                                        overflow: "visible",
                                                    }}
                                                >
                                                    {fase.fase}
                                                </MenuItem>
                                            )),
                                        ])}
                                    </Select>
                                </FormControl>
                            </div>
                            <style>{`
                                .main-container {
                                    display: flex;
                                    flex-direction: column;
                                    gap: 10px;
                                    width: 100%;
                                }
                                .date-picker,
                                .comments,
                                .risk,
                                .attachment,
                                .select-container {
                                    flex: 1;
                                    min-width: 100px; /* Adjust as necessary */
                                }
                                @media (min-width: 768px) {
                                    .main-container {
                                        flex-direction: row;
                                        flex-wrap: wrap;
                                    }
                                    .select-container {
                                        flex-grow: 1;
                                    }
                                }
                            `}</style>
                        </div>
                    </div>
                </div>
                <Button variant="contained" style={{ textAlign: 'center', margin: '8px', paddingBottom: '10px' }} onClick={handleGuardarClickDefault}>Guardar</Button>
                {loading && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 9998,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <CircularProgress style={{ zIndex: 9999 }} />
                        </div>
                    </div>
                )}
                <Modal
                    open={openModal}
                    onClose={handleCloseFirstModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        color: '#423b3b',
                        border: '2px solid grey',
                        borderRadius: '10px',
                        boxShadow: 24,
                        p: 4,
                        padding: '25px',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                    }}>
                        <Typography variant="h6" component="h2" style={{ fontFamily: 'Roboto' }} gutterBottom>
                            Sus datos han sido guardados exitosamente
                        </Typography>
                        <Button style={{ backgroundColor: '#1A80D9', color: '#F2F2F2' }} onClick={handleCloseFirstModal}>Cerrar</Button>
                    </div>
                </Modal>
                <Modal
                    open={openSecondModal}
                    onClose={() => setOpenSecondModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        color: '#423b3b',
                        border: '2px solid grey',
                        borderRadius: '10px',
                        boxShadow: 24,
                        p: 4,
                        padding: '25px',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                    }}>
                        <Typography variant="h6" component="h2" style={{ fontFamily: 'Roboto' }} gutterBottom>
                            Datos adicionales
                        </Typography>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">El proceso fue:</FormLabel>
                            <RadioGroup
                                value={decision}
                                onChange={(e) => setDecision(e.target.value)}
                            >
                                <FormControlLabel value="aprobado" control={<Radio />} label="Aprobado" />
                                <FormControlLabel value="rechazado" control={<Radio />} label="Rechazado" />
                            </RadioGroup>
                        </FormControl>
                        {decision === 'aprobado' && (
                            <>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={esLocale}>
                                    <DesktopDatePicker
                                        label="Fecha de Resolución"
                                        value={resolutionDate}
                                        onChange={(date) => setResolutionDate(date)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                                <TextField
                                    label="Tiempo de duración"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="URL resolución"
                                    value={resolutionURL}
                                    onChange={(e) => setResolutionURL(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                            </>
                        )}
                        <Button style={{ backgroundColor: '#1A80D9', color: '#F2F2F2', marginTop: '10px' }} onClick={handleSendHistoricalData}>Enviar</Button>
                    </div>
                </Modal>
                {errorMessage && (
                    <div style={{ color: 'red', fontSize: '17px', paddingBottom: '10px' }}>
                        {errorMessage}
                    </div>
                )}
            </>
        );
    };

    // Validar que rowData exista antes de renderizar el componente
    if (!rowData) {
        return (
            <div style={{ marginRight: '20px', width: 'auto' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3>Error: No se encontraron datos del programa</h3>
                    <p>Por favor, regrese a la lista de programas y seleccione uno válido.</p>
                    <p>Debug info: propRowData = {JSON.stringify(propRowData)}, location.state = {JSON.stringify(location.state)}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginRight: '20px', width: 'auto' }}>
                <div>
                    {(handleButtonClick === 'Seg') && (
                        <>
                            <h3>Seguimiento al Plan de Mejoramiento.</h3>
                            <SeguimientoPM
                                idPrograma={idProgramaFinal}
                                escuela={escuela}
                                formacion={formacion}
                                isPlan={avaibleRange(isPlan)}
                                fechaVencimientoRRC={rowData ? rowData['fechavencrc'] : null}
                                fechaVencAC={rowData ? rowData['fechavencac'] : null} 
                            />
                            <CollapsibleButton buttonText="Seguimiento al cumplimiento del Plan de Mejoramiento" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['plan de mejoramiento rrc', 'plan de mejoramiento raac', 'plan de mejoramiento aac'], fasesTabla, true)}
                                        {avaibleRange(isPlan) && !soloLectura &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Plan de Mejoramiento')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Plan de Mejoramiento'] && (
                                            <>
                                                {contenido_seguimiento()}
                                            </>
                                        )}
                                    </div>
                                </>
                            } />
                        </>
                    )}
                    {(handleButtonClick === 'rrc') && (
                        <>
                            <h3>Seguimiento del Proceso de Renovación Registro Calificado</h3>
                            <SimpleTimeline
                                fechaExpedicion={rowData ? rowData['fechaexpedrc'] : null}
                                fechaVencimiento={rowData ? rowData['fechavencrc'] : null}
                                fechasCalculadas={fechasCalculadas}
                                tipo='RRC'
                            />
                            <CollapsibleButton buttonText="Renovación Registro Calificado" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['renovación registro calificado'], fasesTabla, false, true)}
                                        {(avaibleRange(isReg) || avaibleRange(isPlan)) && !soloLectura &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Renovación Registro Calificado')} variant="contained" color="primary" style={{ textAlign: 'center', marginBottom: '25px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Renovación Registro Calificado'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                        {contenido_tablaFases()}
                                    </div>
                                </>
                            } />
                        </>
                    )}
                    {(handleButtonClick === 'aac') && (
                        <>
                            <h3>Seguimiento del Proceso de Acreditación</h3>
                            <CollapsibleButton buttonText="Acreditación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['acreditación'], fasesTabla, false, true)}
                                        {(avaibleRange(isAcred) || avaibleRange(isPlan)) && !soloLectura &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Acreditación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Acreditación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                        {contenido_tablaFases()}
                                    </div>
                                </>
                            } />
                        </>
                    )}
                    {(handleButtonClick === 'raac') && (
                        <>
                            <h3>Seguimiento del Proceso de Renovación Acreditación</h3>
                            <SimpleTimeline
                                fechaExpedicion={rowData ? rowData['fechaexpedac'] : null}
                                fechaVencimiento={rowData ? rowData['fechavencac'] : null}
                                fechasCalculadas={fechasCalculadasAC}
                                tipo='RAAC'
                            />
                            <CollapsibleButton buttonText="Renovación Acreditación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['renovación acreditación'], fasesTabla, false, true)}
                                        {(avaibleRange(isRenAcred) || avaibleRange(isPlan)) && !soloLectura &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Renovación Acreditación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Renovación Acreditación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                        {contenido_tablaFases()}
                                    </div>
                                </>
                            } />
                        </>
                    )}
                    {(handleButtonClick === 'crea') && (
                        <>
                            <h3>Seguimiento del Proceso de Creación</h3>
                            <CollapsibleButton buttonText="Creación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['creación'], fasesTabla, false, true)}
                                        {(avaibleRange(isCrea) || avaibleRange(isPlan)) && !soloLectura &&
                                            (
                                                <>
                                                    <Button onClick={() => handleNewTrackingClick('Creación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                                </>
                                            )
                                        }
                                        {showCollapsible['Creación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                        {contenido_tablaFases()}
                                    </div>
                                </>
                            } />
                        </>
                    )}
                    {(handleButtonClick === 'mod') && (
                        <>
                            <h3>Seguimiento del Proceso de Modificación</h3>
                            <CollapsibleButton buttonText="Modificación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['modificación'], fasesTabla, false, true)}
                                        {(avaibleRange(isMod) || avaibleRange(isPlan)) && !soloLectura &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Modificación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Modificación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                        {contenido_tablaFases()}
                                    </div>
                                </>
                            } />
                        </>
                    )}
                    {handleButtonClick === 'conv' && (
                        <>
                            <PracticeScenario data={rowData || {}} soloLectura={soloLectura} />
                        </>
                    )}
                </div>
            </div>

            {/* Modal de edición de seguimiento */}
            <Modal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                aria-labelledby="edit-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isMobile ? '90%' : 500,
                    bgcolor: 'background.paper',
                    borderRadius: '10px',
                    boxShadow: 24,
                    p: 4,
                }}>
                    {!deleteConfirmOpen ? (
                        <>
                            <Typography id="edit-modal-title" variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Editar Seguimiento
                            </Typography>
                            
                            <TextField
                                label="Comentario"
                                multiline
                                rows={4}
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            
                            <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Riesgo</Typography>
                                <RadioGroup
                                    value={editRiesgo}
                                    onChange={(e) => setEditRiesgo(e.target.value)}
                                    row
                                >
                                    <FormControlLabel value="Alto" control={<Radio />} label="Alto" />
                                    <FormControlLabel value="Medio" control={<Radio />} label="Medio" />
                                    <FormControlLabel value="Bajo" control={<Radio />} label="Bajo" />
                                </RadioGroup>
                            </FormControl>
                            
                            <TextField
                                label="Enlace adjunto"
                                value={editAdjunto}
                                onChange={(e) => setEditAdjunto(e.target.value)}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                placeholder="https://..."
                            />
                            
                            <FormControl fullWidth margin="normal" variant="outlined">
                                <InputLabel id="edit-fase-label">Fase</InputLabel>
                                <Select
                                    labelId="edit-fase-label"
                                    value={editFase}
                                    onChange={(e) => setEditFase(e.target.value)}
                                    label="Fase"
                                    MenuProps={{
                                        disableScrollLock: true,
                                        PaperProps: {
                                            style: {
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Sin fase asignada</em>
                                    </MenuItem>
                                    {(() => {
                                        const groupedFases = menuItems.reduce((acc, item) => {
                                            const grupo = item.fase_sup || 'Sin Agrupar';
                                            if (!acc[grupo]) {
                                                acc[grupo] = [];
                                            }
                                            acc[grupo].push(item);
                                            return acc;
                                        }, {});
                                        
                                        return Object.entries(groupedFases).map(([grupo, fases]) => [
                                            <ListSubheader key={grupo} sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'black' }}>
                                                {grupo.toUpperCase()}
                                            </ListSubheader>,
                                            ...fases.map((fase, index) => (
                                                <MenuItem
                                                    key={`${grupo}-${index}`}
                                                    value={fase.fase}
                                                    sx={{
                                                        paddingLeft: '20px',
                                                        whiteSpace: 'normal',
                                                        overflow: 'visible',
                                                    }}
                                                >
                                                    {fase.fase}
                                                </MenuItem>
                                            ))
                                        ]);
                                    })()}
                                </Select>
                            </FormControl>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setDeleteConfirmOpen(true)}
                                >
                                    Eliminar
                                </Button>
                                <Box>
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleCloseEditModal}
                                        sx={{ mr: 1 }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSaveEdit}
                                        disabled={editLoading}
                                    >
                                        {editLoading ? 'Guardando...' : 'Guardar'}
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#d32f2f' }}>
                                ¿Eliminar seguimiento?
                            </Typography>
                            <Typography sx={{ mb: 3 }}>
                                Esta acción no se puede deshacer. El seguimiento será eliminado permanentemente.
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setDeleteConfirmOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="error"
                                    onClick={handleDeleteSeguimiento}
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'Eliminando...' : 'Sí, eliminar'}
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default Seguimiento;
