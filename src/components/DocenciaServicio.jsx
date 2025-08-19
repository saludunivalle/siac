import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CollapsibleButton from './CollapsibleButton';
import { Filtro14 } from '../service/data'; 
import { fetchPostGeneral } from '../service/fetch';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Chip,
    Button,
    TextField,
    FormGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    Grid,
    Card,
    CardContent,
    Autocomplete
} from '@mui/material';
import axios from 'axios';

const DocenciaServicio = () => {
    const [data, setData] = useState([]);
    const [isCargo, setCargo] = useState([' ']);
    const [loading, setLoading] = useState(true);
    const [anexos, setAnexos] = useState([]);
    const [docEscenarios, setDocEscenarios] = useState([]);
    const [anexosPorEscenario, setAnexosPorEscenario] = useState({});
    const [programasData, setProgramasData] = useState([]);
    const [escuelasUnicas, setEscuelasUnicas] = useState([]);
    const [programasUnicos, setProgramasUnicos] = useState([]);
    
    // Estados para filtros
    const [filtroEscuela, setFiltroEscuela] = useState('');
    const [filtroPrograma, setFiltroPrograma] = useState('');
    const [filtroEscenario, setFiltroEscenario] = useState('');
    const [tipoVista, setTipoVista] = useState('escenario'); // 'escenario', 'escuela', 'programa'
    
    // Estados para el formulario de anexos técnicos
    const [showAnexoForm, setShowAnexoForm] = useState(false);
    const [anexoFormData, setAnexoFormData] = useState({
        idPrograma: '',
        programasSeleccionados: [],
        idEscenario: '',
        nombreEscenario: '',
        urlAnexo: '',
        estadoAnexo: 'Pendiente',
        tipo: '',
        vigenciaDesde: '',
        vigenciaHasta: '',
        version: '',
        procesoCalidad: '',
        cierre: '',
        observaciones: '',
        localFile: null
    });
    const [reloadAnexos, setReloadAnexos] = useState(false);

    // Estados para el formulario de documentos de escenario
    const [showDocEscenarioForm, setShowDocEscenarioForm] = useState(null); // Cambiado a null para rastrear cuál escenario
    const [docEscenarioFormData, setDocEscenarioFormData] = useState({
        idEscenario: '',
        nombreEscenario: '',
        url: '',
        tipologia: '',
        codigo: '',
        fechaInicio: '',
        fechaFin: '',
        localFile: null
    });
    const [escenariosData, setEscenariosData] = useState([]);
    const [uniqueTipologias, setUniqueTipologias] = useState([]);
    const [reloadDocEscenarios, setReloadDocEscenarios] = useState(false);

    // Efecto para extraer tipologías y códigos únicos
    useEffect(() => {
        if (escenariosData && escenariosData.length > 0) {
            const tipologias = [...new Set(escenariosData.map(e => e.tipologia || '').filter(Boolean))];
            setUniqueTipologias(tipologias);
        }
    }, [escenariosData]);

    // Obtener los permisos del usuario desde sessionStorage
    useEffect(() => {
        if (sessionStorage.getItem('logged')) {
            const res = JSON.parse(sessionStorage.getItem('logged'));
            const permisos = res.map(item => item.permiso).flat();
            setCargo(permisos);
        }
    }, []);

    // Función para obtener los datos de programas
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
                
                // Extraer escuelas únicas (la columna "Escuela" se normaliza a "escuela")
                const escuelas = [...new Set(
                    programas
                        .map(p => p.escuela)
                        .filter(e => e && e.trim() !== '')
                        .map(e => e.trim()) // Eliminar espacios extra
                )].sort();
                setEscuelasUnicas(escuelas);
                
                // Extraer programas únicos (la columna "Programa Académico" se normaliza a "programa académico")
                const programasAcademicos = [...new Set(
                    programas
                        .map(p => p['programa académico'])
                        .filter(p => p && p.trim() !== '')
                        .map(p => p.trim()) // Eliminar espacios extra
                )].sort();
                setProgramasUnicos(programasAcademicos);
                
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

    // Función para obtener los anexos técnicos
    const fetchAnexos = async () => {
        try {
            const response = await axios.post('https://siac-server.vercel.app/getAnexos', { sheetName: 'ANEXOS_TEC' });
            if (response.data && response.data.status) {
                console.log("Anexos obtenidos:", response.data.data);
                return response.data.data || [];
            } else {
                console.warn('No se pudieron obtener los anexos:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Error al obtener los anexos:', error);
            return [];
        }
    };

    // Función para obtener los escenarios de práctica de la hoja ESC_PRACTICA
    const fetchEscenarios = async () => {
        try {
            const response = await axios.post('https://siac-server.vercel.app/getInstituciones', { sheetName: 'ESC_PRACTICA' });
            if (response.data && response.data.status) {
                console.log("=== DEBUG ESC_PRACTICA DATA ===");
                console.log("Escenarios de práctica obtenidos:", response.data.data);
                console.log("Primer escenario ejemplo:", response.data.data[0]);
                console.log("Estructura de campos:", Object.keys(response.data.data[0] || {}));
                console.log("===============================");
                
                setEscenariosData(response.data.data || []);
                return response.data.data || [];
            } else {
                console.warn('No se pudieron obtener los escenarios de práctica:', response.data);
                setEscenariosData([]);
                return [];
            }
        } catch (error) {
            console.error('Error al obtener los escenarios de práctica:', error);
            setEscenariosData([]);
            return [];
        }
    };

    // Función para obtener los documentos de escenario de la hoja ANEXOS_ESC
    const fetchDocEscenarios = async () => {
        try {
            const response = await axios.post('https://siac-server.vercel.app/getDocEscenarios', { sheetName: 'ANEXOS_ESC' });
            if (response.data && response.data.status) {
                console.log("Documentos de escenario obtenidos:", response.data.data);
                setDocEscenarios(response.data.data || []);
                return response.data.data || [];
            } else {
                console.warn('No se pudieron obtener los documentos de escenario:', response.data);
                setDocEscenarios([]);
                return [];
            }
        } catch (error) {
            console.error('Error al obtener los documentos de escenario:', error);
            setDocEscenarios([]);
            return [];
        }
    };

    // Función para agrupar anexos según el tipo de vista
    const agruparAnexos = (anexos, docEscenarios, escenarios, programas, tipoVista, filtroEscuela, filtroPrograma, filtroEscenario) => {
        console.log("Agrupando anexos con:", { tipoVista, filtroEscuela, filtroPrograma, filtroEscenario });
        
        if (tipoVista === 'escenario') {
            return agruparAnexosPorEscenario(anexos, docEscenarios, escenarios, programas, filtroEscenario);
        } else if (tipoVista === 'escuela') {
            return agruparAnexosPorEscuela(anexos, docEscenarios, programas, filtroEscuela, filtroEscenario);
        } else if (tipoVista === 'programa') {
            return agruparAnexosPorPrograma(anexos, docEscenarios, programas, filtroPrograma, filtroEscenario);
        }
        
        return {};
    };

    // Función para agrupar anexos por escenario (funcionalidad original)
    const agruparAnexosPorEscenario = (anexos, docEscenarios, escenarios, programas, filtroEscenario) => {
        const agrupados = {};
        
        // Validar que escenarios sea un array
        if (!escenarios || !Array.isArray(escenarios)) {
            return agrupados;
        }
        
        // Filtrar escenarios por búsqueda si hay filtro
        const escenariosParaMostrar = filtroEscenario 
            ? escenarios.filter(escenario => 
                escenario.nombre && 
                escenario.nombre.toLowerCase().includes(filtroEscenario.toLowerCase())
              )
            : escenarios;
        
        // Inicializar cada escenario con un objeto que contenga anexos técnicos y documentos de escenario
        escenariosParaMostrar.forEach(escenario => {
            agrupados[escenario.nombre] = {
                anexosTecnicos: [],
                documentosEscenario: [],
                totalItems: 0,
                escenarioInfo: escenario
            };
        });

        // Validar y agrupar anexos técnicos por nombre de escenario
        if (anexos && Array.isArray(anexos)) {
        anexos.forEach(anexo => {
            if (anexo.nombre && agrupados[anexo.nombre] !== undefined) {
                    // Buscar información del programa para este anexo
                    const programaInfo = programas?.find(p => p.id_programa === anexo.id_programa);
                    agrupados[anexo.nombre].anexosTecnicos.push({
                        ...anexo,
                        programa_info: programaInfo,
                        tipo_documento: 'anexo_tecnico'
                    });
                }
            });
        }

        // Validar y agrupar documentos de escenario
        if (docEscenarios && Array.isArray(docEscenarios)) {
            docEscenarios.forEach(docEscenario => {
                // Buscar el escenario por id_escenario
                const escenario = escenarios.find(esc => esc.id === docEscenario.id_escenario);
                if (escenario && agrupados[escenario.nombre] !== undefined) {
                    // Buscar información del programa si existe
                    const programaInfo = docEscenario.id_programa ? 
                        programas?.find(p => p.id_programa === docEscenario.id_programa) : null;
                    
                    agrupados[escenario.nombre].documentosEscenario.push({
                        ...docEscenario,
                        programa_info: programaInfo,
                        tipo_documento: 'documento_escenario',
                        nombre: escenario.nombre // Agregar nombre del escenario para consistencia
                    });
                }
            });
        }

        // Calcular total de items y aplicar filtro de escenario si existe
        Object.keys(agrupados).forEach(nombreEscenario => {
            // Aplicar filtro de escenario a documentos de escenario si está activo
            if (filtroEscenario) {
                agrupados[nombreEscenario].documentosEscenario = agrupados[nombreEscenario].documentosEscenario.filter(doc =>
                    nombreEscenario.toLowerCase().includes(filtroEscenario.toLowerCase())
                );
            }
            
            agrupados[nombreEscenario].totalItems = 
                agrupados[nombreEscenario].anexosTecnicos.length + 
                agrupados[nombreEscenario].documentosEscenario.length;
        });

        // Convertir a array, ordenar por total de items (mayor a menor) y volver a objeto
        const escenariosOrdenados = Object.entries(agrupados)
            .sort(([, grupoA], [, grupoB]) => grupoB.totalItems - grupoA.totalItems)
            .reduce((acc, [nombre, grupo]) => {
                acc[nombre] = grupo;
                return acc;
            }, {});

        return escenariosOrdenados;
    };

    // Función para agrupar anexos por escuela
    const agruparAnexosPorEscuela = (anexos, docEscenarios, programas, filtroEscuela, filtroEscenario) => {
        const agrupados = {};
        
        // Validar que programas sea un array
        if (!programas || !Array.isArray(programas)) {
            return agrupados;
        }
        
        // Filtrar programas por escuela si hay filtro
        const programasFiltrados = filtroEscuela 
            ? programas.filter(p => p.escuela === filtroEscuela)
            : programas;
            
        // Inicializar cada escuela con un objeto que contenga anexos técnicos y documentos de escenario
        const escuelasParaMostrar = filtroEscuela 
            ? [filtroEscuela]
            : [...new Set(programasFiltrados.map(p => p.escuela).filter(e => e && e.trim() !== ''))];
            
        escuelasParaMostrar.forEach(escuela => {
            agrupados[escuela] = {
                anexosTecnicos: [],
                documentosEscenario: [],
                totalItems: 0
            };
        });

        // Validar y agrupar anexos técnicos por escuela del programa
        if (anexos && Array.isArray(anexos)) {
            anexos.forEach(anexo => {
                // Aplicar filtro de escenario si está activo
                if (filtroEscenario && anexo.nombre && 
                    !anexo.nombre.toLowerCase().includes(filtroEscenario.toLowerCase())) {
                    return; // Saltar este anexo si no coincide con el filtro de escenario
                }
                
            if (anexo.id_programa) {
                const programa = programas.find(p => p.id_programa === anexo.id_programa);
                if (programa && programa.escuela && agrupados[programa.escuela] !== undefined) {
                        agrupados[programa.escuela].anexosTecnicos.push({
                        ...anexo,
                            programa_info: programa,
                            tipo_documento: 'anexo_tecnico'
                    });
                }
            }
        });
        }

        // Validar y agrupar documentos de escenario
        if (docEscenarios && Array.isArray(docEscenarios)) {
            docEscenarios.forEach(docEscenario => {
                if (docEscenario.id_programa) {
                    const programa = programas.find(p => p.id_programa === docEscenario.id_programa);
                    if (programa && programa.escuela && agrupados[programa.escuela] !== undefined) {
                        // Aplicar filtro de escenario si está activo
                        if (filtroEscenario && docEscenario.institucion && 
                            !docEscenario.institucion.toLowerCase().includes(filtroEscenario.toLowerCase())) {
                            return; // Saltar este documento si no coincide con el filtro de escenario
                        }
                        
                        agrupados[programa.escuela].documentosEscenario.push({
                            ...docEscenario,
                            programa_info: programa,
                            tipo_documento: 'documento_escenario'
                        });
                    }
                }
            });
        }

        // Calcular total de items para cada escuela
        Object.keys(agrupados).forEach(escuela => {
            agrupados[escuela].totalItems = 
                agrupados[escuela].anexosTecnicos.length + 
                agrupados[escuela].documentosEscenario.length;
        });

        // Convertir a array, ordenar por total de items (mayor a menor) y volver a objeto
        const escuelasOrdenadas = Object.entries(agrupados)
            .sort(([, grupoA], [, grupoB]) => grupoB.totalItems - grupoA.totalItems)
            .reduce((acc, [escuela, grupo]) => {
                acc[escuela] = grupo;
                return acc;
            }, {});

        return escuelasOrdenadas;
    };

    // Función para agrupar anexos por programa académico
    const agruparAnexosPorPrograma = (anexos, docEscenarios, programas, filtroPrograma, filtroEscenario) => {
        const agrupados = {};
        
        // Validar que programas sea un array
        if (!programas || !Array.isArray(programas)) {
            return agrupados;
        }
        
        // Filtrar programas por programa académico si hay filtro
        const programasFiltrados = filtroPrograma 
            ? programas.filter(p => p['programa académico'] === filtroPrograma)
            : programas;
            
        // Inicializar cada programa académico con un objeto que contenga anexos técnicos y documentos de escenario
        const programasParaMostrar = filtroPrograma 
            ? [filtroPrograma]
            : [...new Set(programasFiltrados.map(p => p['programa académico']).filter(p => p && p.trim() !== ''))];
            
        programasParaMostrar.forEach(programa => {
            agrupados[programa] = {
                anexosTecnicos: [],
                documentosEscenario: [],
                totalItems: 0
            };
        });

        // Validar y agrupar anexos técnicos por programa académico
        if (anexos && Array.isArray(anexos)) {
            anexos.forEach(anexo => {
                // Aplicar filtro de escenario si está activo
                if (filtroEscenario && anexo.nombre && 
                    !anexo.nombre.toLowerCase().includes(filtroEscenario.toLowerCase())) {
                    return; // Saltar este anexo si no coincide con el filtro de escenario
                }
                
            if (anexo.id_programa) {
                const programa = programas.find(p => p.id_programa === anexo.id_programa);
                if (programa && programa['programa académico'] && agrupados[programa['programa académico']] !== undefined) {
                        agrupados[programa['programa académico']].anexosTecnicos.push({
                        ...anexo,
                            programa_info: programa,
                            tipo_documento: 'anexo_tecnico'
                    });
                }
            }
        });
        }

        // Validar y agrupar documentos de escenario
        if (docEscenarios && Array.isArray(docEscenarios)) {
            docEscenarios.forEach(docEscenario => {
                if (docEscenario.id_programa) {
                    const programa = programas.find(p => p.id_programa === docEscenario.id_programa);
                    if (programa && programa['programa académico'] && agrupados[programa['programa académico']] !== undefined) {
                        // Aplicar filtro de escenario si está activo
                        if (filtroEscenario && docEscenario.institucion && 
                            !docEscenario.institucion.toLowerCase().includes(filtroEscenario.toLowerCase())) {
                            return; // Saltar este documento si no coincide con el filtro de escenario
                        }
                        
                        agrupados[programa['programa académico']].documentosEscenario.push({
                            ...docEscenario,
                            programa_info: programa,
                            tipo_documento: 'documento_escenario'
                        });
                    }
                }
            });
        }

        // Calcular total de items para cada programa académico
        Object.keys(agrupados).forEach(programa => {
            agrupados[programa].totalItems = 
                agrupados[programa].anexosTecnicos.length + 
                agrupados[programa].documentosEscenario.length;
        });

        // Convertir a array, ordenar por total de items (mayor a menor) y volver a objeto
        const programasOrdenados = Object.entries(agrupados)
            .sort(([, grupoA], [, grupoB]) => grupoB.totalItems - grupoA.totalItems)
            .reduce((acc, [programa, grupo]) => {
                acc[programa] = grupo;
                return acc;
            }, {});

        return programasOrdenados;
    };

    // Efecto para obtener los datos al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log('=== INICIANDO CARGA DE DATOS ===');
                // Obtener escenarios, anexos, documentos de escenario y programas en paralelo
                // Se elimina Filtro14 y se usa fetchEscenarios como única fuente para los datos de escenarios.
                const [escenariosResult, anexosResult, docEscenariosResult, programasResult] = await Promise.all([
                    fetchEscenarios(),
                    fetchAnexos(),
                    fetchDocEscenarios(),
                    fetchProgramas()
                ]);
                
                console.log('Escenarios obtenidos (de fetchEscenarios):', escenariosResult);
                
                // setData y setEscenariosData ahora tendrán la misma información con fecha_fin
                setData(escenariosResult);
                // setEscenariosData ya es llamado dentro de fetchEscenarios
                
                setAnexos(anexosResult);
                setDocEscenarios(docEscenariosResult);
                
                // Agrupar anexos según el tipo de vista actual
                const agrupados = agruparAnexos(anexosResult, docEscenariosResult, escenariosResult, programasResult, tipoVista, filtroEscuela, filtroPrograma, filtroEscenario);
                setAnexosPorEscenario(agrupados);
                
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Efecto para reagrupar cuando cambien los filtros
    useEffect(() => {
        console.log('=== EFECTO DE REAGRUPACIÓN ===');
        
        // La condición `data.length > 0` es importante para asegurar que los escenarios se hayan cargado
        if (data && Array.isArray(data) && data.length > 0 && 
            programasData && Array.isArray(programasData) && programasData.length > 0) {
            console.log('Condiciones cumplidas, reagrupando...');
            const agrupados = agruparAnexos(anexos, docEscenarios, data, programasData, tipoVista, filtroEscuela, filtroPrograma, filtroEscenario);
            setAnexosPorEscenario(agrupados);
        } else {
            console.log('Condiciones NO cumplidas para reagrupar');
        }
    }, [tipoVista, filtroEscuela, filtroPrograma, filtroEscenario, data, anexos, docEscenarios, programasData]);

    // Limpiar filtros cuando se cambia el tipo de vista
    const handleTipoVistaChange = (nuevoTipo) => {
        setTipoVista(nuevoTipo);
        setFiltroEscuela('');
        setFiltroPrograma('');
        setFiltroEscenario('');
    };

    // Función para obtener el color del chip según el estado
    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'listo':
                return 'success';
            case 'en proceso':
                return 'warning';
            case 'pendiente':
                return 'default';
            case 'inactivo':
                return 'error';
            default:
                return 'default';
        }
    };

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No definida';
        try {
            return new Date(fecha).toLocaleDateString('es-ES');
        } catch {
            return fecha;
        }
    };

    // Funciones para el formulario de anexos técnicos
    const toggleAnexoForm = () => {
        setShowAnexoForm(!showAnexoForm);
    };

    // Funciones para el formulario de documentos de escenario
    const toggleDocEscenarioForm = (escenarioId = null) => {
        setShowDocEscenarioForm(showDocEscenarioForm === escenarioId ? null : escenarioId);
    };

    const handleDocEscenarioInputChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'localFile') {
            setDocEscenarioFormData({
                ...docEscenarioFormData,
                localFile: files[0],
                url: '' // Limpiar la URL si se selecciona un archivo
            });
        } else if (name === 'idEscenario') {
            // Cuando se cambia el escenario, buscar su información completa en escenariosData
            const selectedScenario = escenariosData.find(esc => esc.id === value);
            
            // Debug: mostrar qué datos están llegando
            console.log('=== DEBUG ESCENARIO SELECCIONADO ===');
            console.log('ID seleccionado:', value);
            console.log('Escenario encontrado:', selectedScenario);
            console.log('escenariosData completo:', escenariosData);
            console.log('====================================');
            
            if (selectedScenario) {
                setDocEscenarioFormData({
                    ...docEscenarioFormData,
                    idEscenario: value || '',
                    nombreEscenario: selectedScenario.nombre || '',
                    tipologia: selectedScenario.tipologia || '',
                    codigo: selectedScenario.codigo || '',
                    fechaInicio: convertirFechaParaInput(selectedScenario.fecha_inicio) || '',
                    fechaFin: convertirFechaParaInput(selectedScenario.fecha_fin) || ''
                });
            } else {
                setDocEscenarioFormData({
                    ...docEscenarioFormData,
                    idEscenario: value || '',
                    nombreEscenario: '',
                    tipologia: '',
                    codigo: '',
                    fechaInicio: '',
                    fechaFin: ''
                });
            }
        } else {
            setDocEscenarioFormData({
                ...docEscenarioFormData,
                [name]: value || '',
                localFile: name === 'url' ? null : docEscenarioFormData.localFile // Limpiar archivo si se escribe en URL
            });
        }
    };

    const handleAnexoInputChange = (e) => {
        const { name, value, files } = e.target;
    
        if (name === 'localFile') {
            setAnexoFormData({
                ...anexoFormData,
                localFile: files[0],
                urlAnexo: '' // Limpiar la URL si se selecciona un archivo
            });
        } else if (name === 'idEscenario') {
            // Obtener el nombre del escenario seleccionado
            const selectedScenario = data && Array.isArray(data) ? data.find(item => item.id === value) : null;
            
            setAnexoFormData({
                ...anexoFormData,
                idEscenario: value,
                nombreEscenario: selectedScenario ? selectedScenario.nombre : ''
            });
        } else {
            setAnexoFormData({
                ...anexoFormData,
                [name]: value,
                localFile: name === 'urlAnexo' ? null : anexoFormData.localFile // Limpiar archivo si se escribe en URL
            });
        }
    };

    // Función para manejar la selección de múltiples programas con Autocomplete
    const handleProgramaChange = (event, newValue) => {
        setAnexoFormData({
            ...anexoFormData,
            programasSeleccionados: newValue || [], // newValue será un array
            idPrograma: newValue && newValue.length > 0 ? newValue.map(p => p.id_programa).join(',') : '' // IDs separados por coma
        });
    };

    // Función para formatear fechas a DD/MM/AAAA
    const formatearFechaParaHoja = (fecha) => {
        if (!fecha) return '';
        try {
            const date = new Date(fecha);
            const dia = date.getDate().toString().padStart(2, '0');
            const mes = (date.getMonth() + 1).toString().padStart(2, '0');
            const año = date.getFullYear();
            return `${dia}/${mes}/${año}`;
        } catch {
            return fecha;
        }
    };

    // Función para convertir fecha de DD/MM/AAAA a AAAA-MM-DD (para inputs de tipo date)
    const convertirFechaParaInput = (fechaString) => {
        if (!fechaString || fechaString.trim() === '') return '';
        
        try {
            // Si ya está en formato AAAA-MM-DD, devolver tal como está
            if (fechaString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return fechaString;
            }
            
            // Si está en formato DD/MM/AAAA, convertir a AAAA-MM-DD
            const fechaMatch = fechaString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (fechaMatch) {
                const dia = fechaMatch[1].padStart(2, '0');
                const mes = fechaMatch[2].padStart(2, '0');
                const año = fechaMatch[3];
                return `${año}-${mes}-${dia}`;
            }
            
            return fechaString; // Devolver tal como está si no coincide con ningún formato
        } catch (error) {
            console.error('Error convirtiendo fecha:', error);
            return fechaString;
        }
    };

    // Función para enviar un anexo al servidor    
    const sendAnexoToSheet = async (anexo) => {
        try {
            // Preparar los datos para enviar en el formato que requiere la API del servidor
            const insertData = [
                [
                    anexo.id, // id del anexo
                    anexo.id_programa || '', // id del programa (puede estar vacío para anexos generales)
                    anexo.idEscenario, // id del escenario
                    anexo.nombre, // nombre del escenario
                    anexo.url, // URL del anexo
                    anexo.estado, // estado del anexo (Pendiente, En proceso, Listo)
                    anexo.tipo, // tipo
                    formatearFechaParaHoja(anexo.vigencia_desde), // vigencia desde en formato DD/MM/AAAA
                    formatearFechaParaHoja(anexo.vigencia_hasta), // vigencia hasta en formato DD/MM/AAAA
                    anexo.version, // versión
                    anexo.proceso_calidad, // proceso de calidad
                    anexo.cierre, // cierre
                    anexo.observaciones // observaciones
                ]
            ];

            console.log("=== ENVIANDO ANEXO A SHEETS ===");
            console.log("Hoja destino: ANEXOS_TEC");
            console.log("Datos del anexo a enviar:", anexo);
            console.log("Datos formateados para envío:", insertData);
            console.log("================================");

            // Especificar el nombre de la hoja de cálculo
            const sheetName = 'ANEXOS_TEC';

            // Hacer la solicitud POST al servidor con los datos y el nombre de la hoja
            const response = await axios.post('https://siac-server.vercel.app/sendDocServ', {
                insertData,
                sheetName
            });

            if (response.status === 200) {
                console.log('✅ Anexo guardado correctamente en la hoja ANEXOS_TEC:', response.data);
                return true;
            } else {
                console.error('❌ Error al guardar el anexo en la hoja:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Error al enviar el anexo al servidor:', error);
            return false;
        }
    };

    // Función para enviar un documento de escenario al servidor
    const sendDocEscenarioToSheet = async (docEscenario) => {
        try {
            // Preparar los datos para enviar en el formato que requiere la API del servidor
            const insertData = [
                [
                    docEscenario.id, // id único del documento
                    '', // id del programa (opcional, siempre vacío ahora)
                    docEscenario.idEscenario, // id del escenario
                    docEscenario.institucion, // institución
                    docEscenario.url, // URL del documento
                    docEscenario.tipologia, // tipología
                    docEscenario.codigo, // código (viene automático de la institución)
                    formatearFechaParaHoja(docEscenario.fechaInicio), // fecha inicio
                    formatearFechaParaHoja(docEscenario.fechaFin) // fecha fin
                ]
            ];

            console.log("=== ENVIANDO DOCUMENTO ESCENARIO A SHEETS ===");
            console.log("Hoja destino: ANEXOS_ESC");
            console.log("Datos del documento a enviar:", docEscenario);
            console.log("Datos formateados para envío:", insertData);
            console.log("==============================================");

            // Especificar el nombre de la hoja de cálculo
            const sheetName = 'ANEXOS_ESC';

            // Hacer la solicitud POST al servidor con los datos y el nombre de la hoja
            const response = await axios.post('https://siac-server.vercel.app/sendDocEscenario', {
                insertData,
                sheetName
            });

            if (response.status === 200) {
                console.log('✅ Documento de escenario guardado correctamente en la hoja ANEXOS_ESC:', response.data);
                return true;
            } else {
                console.error('❌ Error al guardar el documento de escenario en la hoja:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Error al enviar el documento de escenario al servidor:', error);
            return false;
        }
    };

    // Manejar el envío del formulario de anexos
    const handleAnexoFormSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Programas seleccionados:', anexoFormData.programasSeleccionados);
            console.log('Cantidad de programas:', anexoFormData.programasSeleccionados?.length);
            
            if (!anexoFormData.programasSeleccionados || anexoFormData.programasSeleccionados.length === 0) {
                alert('Por favor selecciona al menos un programa académico válido.');
                return;
            }
            
            if (!anexoFormData.idEscenario || !anexoFormData.nombreEscenario) {
                alert('Por favor selecciona un escenario de práctica válido.');
                return;
            }

            if (!anexoFormData.urlAnexo && !anexoFormData.localFile) {
                alert('Por favor proporciona una URL o selecciona un archivo local para el anexo.');
                return;
            }

            let fileUrl = anexoFormData.urlAnexo;

            // Si hay un archivo local, subirlo primero
            if (anexoFormData.localFile) {
                const formData = new FormData();
                formData.append('file', anexoFormData.localFile);
                formData.append('scenarioName', anexoFormData.nombreEscenario); // Usamos el nombre del escenario para la carpeta

                try {
                    const response = await axios.post('https://siac-server.vercel.app/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (response.data.success) {
                        fileUrl = response.data.fileUrl;
                    } else {
                        alert('Error al subir el archivo del anexo. Por favor intenta de nuevo.');
                        return;
                    }
                } catch (error) {
                    console.error('Error al subir el archivo del anexo:', error);
                    alert('Error al subir el archivo del anexo. Por favor intenta de nuevo.');
                    return;
                }
            }

            // Crear anexos para cada programa seleccionado
            const baseTimestamp = Date.now();
            const newAnexos = anexoFormData.programasSeleccionados.map((programa, index) => ({
                id: baseTimestamp + (index * 1000), // usar timestamp base + offset para evitar duplicados
                id_programa: programa.id_programa, // usar el id del programa seleccionado
                idEscenario: anexoFormData.idEscenario, // id del escenario
                nombre: anexoFormData.nombreEscenario, // nombre del escenario
                url: fileUrl, // URL del anexo o archivo
                estado: anexoFormData.estadoAnexo, // estado del anexo (Pendiente, En proceso, Listo)
                tipo: anexoFormData.tipo,
                vigencia_desde: anexoFormData.vigenciaDesde,
                vigencia_hasta: anexoFormData.vigenciaHasta,
                version: anexoFormData.version,
                proceso_calidad: anexoFormData.procesoCalidad,
                cierre: anexoFormData.cierre,
                observaciones: anexoFormData.observaciones
            }));

            // Verificar los datos a enviar
            console.log("Datos de los nuevos anexos:", newAnexos);

            // Enviar los anexos secuencialmente para evitar conflictos
            const resultados = [];
            for (let i = 0; i < newAnexos.length; i++) {
                console.log(`Enviando anexo ${i + 1} de ${newAnexos.length}:`, newAnexos[i]);
                try {
                    const resultado = await sendAnexoToSheet(newAnexos[i]);
                    resultados.push(resultado);
                    // Pequeña pausa entre envíos para evitar conflictos
                    if (i < newAnexos.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    console.error(`Error enviando anexo ${i + 1}:`, error);
                    resultados.push(false);
                }
            }

            const todosExitosos = resultados.every(Boolean);
            console.log('Resultados de envío:', resultados);
            console.log('Todos exitosos:', todosExitosos);

            if (todosExitosos) {
                // Reiniciar el formulario
                setAnexoFormData({
                    idPrograma: '',
                    programasSeleccionados: [],
                    idEscenario: '',
                    nombreEscenario: '',
                    urlAnexo: '',
                    estadoAnexo: 'Pendiente',
                    tipo: '',
                    vigenciaDesde: '',
                    vigenciaHasta: '',
                    version: '',
                    procesoCalidad: '',
                    cierre: '',
                    observaciones: '',
                    localFile: null
                });
                
                setShowAnexoForm(false);
                
                // Recargar los anexos
                setTimeout(async () => {
                    setLoading(true);
                    try {
                        const [escenariosResult, anexosResult, docEscenariosResult] = await Promise.all([
                            fetchEscenarios(),
                            fetchAnexos(),
                            fetchDocEscenarios()
                        ]);
                        
                        setData(escenariosResult);
                        setAnexos(anexosResult);
                        setDocEscenarios(docEscenariosResult);
                        
                        // Agrupar anexos según el tipo de vista actual
                        const agrupados = agruparAnexos(anexosResult, docEscenariosResult, escenariosResult, programasData, tipoVista, filtroEscuela, filtroPrograma, filtroEscenario);
                        setAnexosPorEscenario(agrupados);
                        
                    } catch (error) {
                        console.error('Error al recargar los datos:', error);
                    } finally {
                        setLoading(false);
                    }
                }, 500);
                
                // Mostrar mensaje de éxito
                alert(`${newAnexos.length} anexo${newAnexos.length !== 1 ? 's' : ''} guardado${newAnexos.length !== 1 ? 's' : ''} correctamente`);
            } else {
                const exitosos = resultados.filter(Boolean).length;
                const fallidos = resultados.length - exitosos;
                alert(`Error: Solo se guardaron ${exitosos} de ${resultados.length} anexos. ${fallidos} anexo${fallidos !== 1 ? 's' : ''} fallaron. Por favor intenta de nuevo.`);
            }
            
        } catch (error) {
            console.error('Error al guardar los anexos:', error);
            alert('Error al guardar los anexos. Por favor intenta de nuevo.');
        }
    };

    // Manejar el envío del formulario de documentos de escenario
    const handleDocEscenarioFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validar campos obligatorios
            if (!docEscenarioFormData.idEscenario || !docEscenarioFormData.nombreEscenario) {
                alert('Por favor selecciona un escenario de práctica válido.');
                return;
            }

            if (!docEscenarioFormData.url && !docEscenarioFormData.localFile) {
                alert('Por favor proporciona una URL o selecciona un archivo local.');
                return;
            }

            if (!docEscenarioFormData.tipologia) {
                alert('Por favor ingrese la tipología.');
                return;
            }

            if (!docEscenarioFormData.codigo) {
                alert('Por favor ingrese el código.');
                return;
            }

            if (!docEscenarioFormData.fechaInicio || !docEscenarioFormData.fechaFin) {
                alert('Por favor proporciona las fechas de inicio y fin.');
                return;
            }

            let fileUrl = docEscenarioFormData.url;

            // Si hay un archivo local, subirlo primero
            if (docEscenarioFormData.localFile) {
                const formData = new FormData();
                formData.append('file', docEscenarioFormData.localFile);
                formData.append('scenarioName', docEscenarioFormData.nombreEscenario);

                try {
                    const response = await axios.post('https://siac-server.vercel.app/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (response.data.success) {
                        fileUrl = response.data.fileUrl;
                    } else {
                        alert('Error al subir el archivo. Por favor intenta de nuevo.');
                        return;
                    }
                } catch (error) {
                    console.error('Error al subir el archivo:', error);
                    alert('Error al subir el archivo. Por favor intenta de nuevo.');
                    return;
                }
            }


            // Crear el documento de escenario (la institución se llena automáticamente desde el escenario)
            const newDocEscenario = {
                id: Date.now(), // ID único basado en timestamp
                idEscenario: docEscenarioFormData.idEscenario,
                institucion: docEscenarioFormData.nombreEscenario, // Usar el nombre del escenario como institución
                url: fileUrl,
                tipologia: docEscenarioFormData.tipologia,
                codigo: docEscenarioFormData.codigo,
                fechaInicio: docEscenarioFormData.fechaInicio,
                fechaFin: docEscenarioFormData.fechaFin
            };

            console.log("Datos del nuevo documento de escenario:", newDocEscenario);

            // Enviar el documento de escenario
            const resultado = await sendDocEscenarioToSheet(newDocEscenario);

            if (resultado) {
                // Reiniciar el formulario
                setDocEscenarioFormData({
                    idEscenario: '',
                    nombreEscenario: '',
                    url: '',
                    tipologia: '',
                    codigo: '',
                    fechaInicio: '',
                    fechaFin: '',
                    localFile: null
                });
                
                setShowDocEscenarioForm(null);
                
                // Mostrar mensaje de éxito
                alert('Documento de escenario guardado correctamente');
                
                // Aquí se podría agregar la recarga de datos si es necesario
                setTimeout(() => {
                    setReloadDocEscenarios(true);
                }, 500);
                
            } else {
                alert('Error al guardar el documento de escenario. Por favor intenta de nuevo.');
            }
            
        } catch (error) {
            console.error('Error al guardar el documento de escenario:', error);
            alert('Error al guardar el documento de escenario. Por favor intenta de nuevo.');
        }
    };

    // Componente para mostrar la tabla de anexos de un escenario
    const AnexosEscenarioTable = ({ datos, tipoVista }) => {
        // Extraer anexos técnicos y documentos de escenario según la estructura
        let anexosTecnicos = [];
        let documentosEscenario = [];
        
        if (datos) {
            if (datos.anexosTecnicos && datos.documentosEscenario) {
                // Nueva estructura de datos
                anexosTecnicos = datos.anexosTecnicos || [];
                documentosEscenario = datos.documentosEscenario || [];
            } else if (Array.isArray(datos)) {
                // Estructura de datos antigua (compatibilidad)
                anexosTecnicos = datos;
                documentosEscenario = [];
            }
        }

        const totalItems = anexosTecnicos.length + documentosEscenario.length;

        if (totalItems === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="text.secondary">
                        No hay anexos técnicos ni documentos de escenario registrados
                        {tipoVista === 'escenario' ? ' para este escenario' : 
                         tipoVista === 'escuela' ? ' para esta escuela' : 
                         ' para este programa académico'}.
                    </Typography>
                </Box>
            );
        }

        return (
            <Box>
                {/* Sección de Anexos Técnicos */}
                {anexosTecnicos.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                            Convenio D.S. ({anexosTecnicos.length})
                        </Typography>
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                                        {tipoVista === 'escenario' && (
                                            <>
                                                <TableCell><strong>Escuela</strong></TableCell>
                                                <TableCell><strong>Programa</strong></TableCell>
                                                <TableCell><strong>Escenario</strong></TableCell>
                                            </>
                                        )}
                            {(tipoVista === 'escuela' || tipoVista === 'programa') && (
                                <>
                                    <TableCell><strong>Programa</strong></TableCell>
                                    <TableCell><strong>Escuela</strong></TableCell>
                                </>
                            )}
                            <TableCell><strong>URL/Archivo</strong></TableCell>
                            <TableCell><strong>Estado</strong></TableCell>
                            <TableCell><strong>Tipo</strong></TableCell>
                            <TableCell><strong>Vigencia Desde</strong></TableCell>
                            <TableCell><strong>Vigencia Hasta</strong></TableCell>
                            <TableCell><strong>Versión</strong></TableCell>
                            <TableCell><strong>Proceso Calidad</strong></TableCell>
                            <TableCell><strong>Cierre</strong></TableCell>
                            <TableCell><strong>Observaciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                                    {anexosTecnicos.map((anexo, index) => (
                                        <TableRow key={`anexo-${index}`}>
                                            {tipoVista === 'escenario' && (
                                                <>
                                                    <TableCell>{anexo.programa_info?.escuela || 'N/A'}</TableCell>
                                                    <TableCell>{anexo.programa_info?.['programa académico'] || 'N/A'}</TableCell>
                                                    <TableCell>{anexo.nombre || 'N/A'}</TableCell>
                                                </>
                                            )}
                                {(tipoVista === 'escuela' || tipoVista === 'programa') && (
                                    <>
                                        <TableCell>{anexo.programa_info?.['programa académico'] || 'N/A'}</TableCell>
                                        <TableCell>{anexo.programa_info?.escuela || 'N/A'}</TableCell>
                                    </>
                                )}
                                <TableCell>
                                    {anexo.url ? (
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            onClick={() => window.open(anexo.url, '_blank')}
                                            sx={{ 
                                                textTransform: 'none',
                                                minWidth: 'auto',
                                                padding: '4px 8px'
                                            }}
                                        >
                                            Ver Anexo
                                        </Button>
                                    ) : (
                                        'Sin URL'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={anexo.estado || 'Sin estado'} 
                                        color={getEstadoColor(anexo.estado)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{anexo.tipo || 'No especificado'}</TableCell>
                                <TableCell>{anexo.vigencia_desde || 'No especificada'}</TableCell>
                                <TableCell>{anexo.vigencia_hasta || 'No especificada'}</TableCell>
                                <TableCell>{anexo.version || 'N/A'}</TableCell>
                                <TableCell>{anexo.proceso_calidad || 'N/A'}</TableCell>
                                <TableCell>{anexo.cierre || 'N/A'}</TableCell>
                                <TableCell>
                                    {anexo.estado === 'Inactivo' ? 
                                        (anexo.observaciones || 'Sin observaciones') : 
                                        'N/A'
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
                    </Box>
                )}

                {/* Sección de Documentos de Escenario */}
                {documentosEscenario.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32', fontWeight: 600 }}>
                            Documentos de Escenario ({documentosEscenario.length})
                        </Typography>
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Institución/Escenario</strong></TableCell>
                                        <TableCell><strong>URL/Documento</strong></TableCell>
                                        <TableCell><strong>Tipología</strong></TableCell>
                                        <TableCell><strong>Código</strong></TableCell>
                                        <TableCell><strong>Fecha Inicio</strong></TableCell>
                                        <TableCell><strong>Fecha Fin</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {documentosEscenario.map((doc, index) => (
                                        <TableRow key={`doc-${index}`}>
                                            <TableCell>{doc.institucion || 'N/A'}</TableCell>
                                            <TableCell>
                                                {doc.url ? (
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        onClick={() => window.open(doc.url, '_blank')}
                                                        sx={{ 
                                                            textTransform: 'none',
                                                            minWidth: 'auto',
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        Ver Documento
                                                    </Button>
                                                ) : (
                                                    'Sin URL'
                                                )}
                                            </TableCell>
                                            <TableCell>{doc.tipologia || 'N/A'}</TableCell>
                                            <TableCell>{doc.codigo || 'N/A'}</TableCell>
                                            <TableCell>{doc.fecha_inicio || 'N/A'}</TableCell>
                                            <TableCell>{doc.fecha_fin || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>
        );
    };

    // Función para calcular la vigencia y determinar el color de la pestaña
    const calcularVigenciaYColor = (fechaFin) => {
        if (!fechaFin || fechaFin.trim() === '') {
            return { diasRestantes: null, colorFondo: '#f5f5f5', estado: 'Sin fecha' };
        }

        try {
            // Convertir fecha de DD/MM/AAAA a Date
            let fechaFinDate;
            
            console.log('=== DEBUG FECHA_FIN ===');
            console.log('fechaFin recibida:', fechaFin);
            console.log('tipo:', typeof fechaFin);
            
            if (fechaFin.includes('/')) {
                // Formato DD/MM/AAAA
                const partes = fechaFin.split('/');
                if (partes.length === 3) {
                    const dia = parseInt(partes[0], 10);
                    const mes = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0-11
                    const año = parseInt(partes[2], 10);
                    fechaFinDate = new Date(año, mes, dia);
                    console.log('Fecha parseada DD/MM/AAAA:', fechaFinDate);
                }
            } else if (fechaFin.includes('-')) {
                // Formato AAAA-MM-DD o DD-MM-AAAA
                const partes = fechaFin.split('-');
                if (partes.length === 3) {
                    if (partes[0].length === 4) {
                        // AAAA-MM-DD
                        fechaFinDate = new Date(fechaFin);
                        console.log('Fecha parseada AAAA-MM-DD:', fechaFinDate);
                    } else {
                        // DD-MM-AAAA
                        const dia = parseInt(partes[0], 10);
                        const mes = parseInt(partes[1], 10) - 1;
                        const año = parseInt(partes[2], 10);
                        fechaFinDate = new Date(año, mes, dia);
                        console.log('Fecha parseada DD-MM-AAAA:', fechaFinDate);
                    }
                }
            } else {
                console.log('Formato de fecha no reconocido');
                return { diasRestantes: null, colorFondo: '#f5f5f5', estado: 'Fecha inválida' };
            }

            if (!fechaFinDate || isNaN(fechaFinDate.getTime())) {
                console.log('Fecha inválida después del parsing');
                return { diasRestantes: null, colorFondo: '#f5f5f5', estado: 'Fecha inválida' };
            }

            const fechaActual = new Date();
            fechaActual.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación precisa
            fechaFinDate.setHours(23, 59, 59, 999); // Fin del día para la fecha de vencimiento
            
            const diferenciaTiempo = fechaFinDate.getTime() - fechaActual.getTime();
            const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

            console.log('Fecha actual:', fechaActual);
            console.log('Fecha fin:', fechaFinDate);
            console.log('Diferencia en días:', diasRestantes);

            // Determinar color según días restantes
            let colorFondo, estado;
            if (diasRestantes < 0) {
                colorFondo = '#ffcccb'; // Rojo claro - Vencido
                estado = 'Vencido';
            } else if (diasRestantes <= 90) {
                colorFondo = '#ffcccb'; // Rojo claro - Próximo a vencer (3 meses)
                estado = 'Próximo a vencer';
            } else if (diasRestantes <= 730) {
                colorFondo = '#ffd699'; // Naranja claro - Entre 3 meses y 2 años
                estado = 'Vigencia media';
            } else {
                colorFondo = '#f5f5f5'; // Gris claro - Más de 2 años (cambio de verde a gris)
                estado = 'Vigencia amplia';
            }

            return {
                diasRestantes,
                colorFondo,
                estado,
                fechaVencimiento: fechaFinDate.toLocaleDateString('es-ES')
            };
        } catch (error) {
            console.error('Error calculando vigencia:', error);
            return { diasRestantes: null, colorFondo: '#f5f5f5', estado: 'Error' };
        }
    };

    return (
        <>
            <Header />
            <Sidebar isCargo={isCargo} />
            <div className="content-with-sidebar">
                <Box sx={{ 
                    width: '100%', 
                    maxWidth: '1100px', 
                    mx: 'auto',
                    px: { xs: 2, sm: 3, md: 4 },
                    mt: 2,
                    ml: { xs: 'auto', md: 0 },
                    position: 'relative',
                    left: { xs: 0, md: '-30px' }
                }}>
                    <Typography variant="h4" sx={{ 
                        mb: 4,
                        fontWeight: 600,
                        color: '#333',
                        textAlign: 'center'
                    }}>
                        Escenarios de Práctica
                    </Typography>
                    
                    {/* Controles de Filtros */}
                    <Card sx={{ mb: 4, p: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Filtros de Visualización
                            </Typography>
                            
                            <Grid container spacing={3} alignItems="center">
                                {/* Selector de tipo de vista */}
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Agrupar por</InputLabel>
                                        <Select
                                            value={tipoVista}
                                            onChange={(e) => handleTipoVistaChange(e.target.value)}
                                            label="Agrupar por"
                                        >
                                            <MenuItem value="escenario">Escenarios de Práctica</MenuItem>
                                            <MenuItem value="escuela">Escuelas</MenuItem>
                                            <MenuItem value="programa">Programas Académicos</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Filtro de búsqueda inteligente por escenario */}
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Buscar Escenarios de Práctica"
                                        placeholder="Buscar por nombre de escenario..."
                                        value={filtroEscenario}
                                        onChange={(e) => setFiltroEscenario(e.target.value)}
                                        fullWidth
                                        helperText="Busca uno o varios escenarios por nombre"
                                    />
                                </Grid>

                                {/* Filtro por escuela */}
                                {tipoVista === 'escuela' && (
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={['', ...escuelasUnicas]} // Incluir opción vacía para "Todas las escuelas"
                                            getOptionLabel={(option) => option === '' ? 'Todas las escuelas' : option}
                                            value={filtroEscuela}
                                            onChange={(event, newValue) => setFiltroEscuela(newValue || '')}
                                            filterOptions={(options, params) => {
                                                const filtered = options.filter((option) =>
                                                    option === '' || (option && option.toLowerCase().includes(params.inputValue.toLowerCase()))
                                                );
                                                return filtered;
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Filtrar por Escuela"
                                                    placeholder="Buscar escuela..."
                                                    fullWidth
                                                />
                                            )}
                                            renderOption={(props, option, { index }) => (
                                                <Box component="li" {...props} key={`escuela-filter-${index}`}>
                                                    <Typography variant="body1">
                                                        {option === '' ? 'Todas las escuelas' : option}
                                                    </Typography>
                                                </Box>
                                            )}
                                            noOptionsText="No se encontraron escuelas"
                                            isOptionEqualToValue={(option, value) => option === value}
                                        />
                                    </Grid>
                                )}

                                {/* Filtro por programa académico */}
                                {tipoVista === 'programa' && (
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={['', ...programasUnicos]} // Incluir opción vacía para "Todos los programas"
                                            getOptionLabel={(option) => option === '' ? 'Todos los programas' : option}
                                            value={filtroPrograma}
                                            onChange={(event, newValue) => setFiltroPrograma(newValue || '')}
                                            filterOptions={(options, params) => {
                                                const filtered = options.filter((option) =>
                                                    option === '' || (option && option.toLowerCase().includes(params.inputValue.toLowerCase()))
                                                );
                                                return filtered;
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Filtrar por Programa"
                                                    placeholder="Buscar programa académico..."
                                                    fullWidth
                                                />
                                            )}
                                            renderOption={(props, option, { index }) => (
                                                <Box component="li" {...props} key={`programa-filter-${index}`}>
                                                    <Typography variant="body1">
                                                        {option === '' ? 'Todos los programas' : option}
                                                    </Typography>
                                                </Box>
                                            )}
                                            noOptionsText="No se encontraron programas"
                                            isOptionEqualToValue={(option, value) => option === value}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                    
                    {/* Botón y formulario para añadir anexos técnicos */}
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        {(isCargo.includes('Convenio Docencia Servicio') || isCargo.includes('Sistemas')) && (
                            <Button 
                                variant="contained" 
                                onClick={toggleAnexoForm}
                                sx={{ mb: 2 }}
                            >
                                Añadir Anexo  Convenio D.S.
                            </Button>
                        )}

                        {(isCargo.includes('Convenio Docencia Servicio') || isCargo.includes('Sistemas')) && showAnexoForm && (
                            <Box component="form" onSubmit={handleAnexoFormSubmit} sx={{ 
                                marginTop: 2, 
                                maxWidth: '800px', 
                                mx: 'auto',
                                p: 3,
                                border: '1px solid #ddd',
                                borderRadius: 2,
                                backgroundColor: '#f9f9f9'
                            }}>
                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    Nuevo Anexo Técnico
                                </Typography>
                                
                                <FormGroup>
                                    {/* Campo de selección de múltiples programas con búsqueda inteligente */}
                                    <Autocomplete
                                        multiple
                                        options={programasData}
                                        getOptionLabel={(option) => option['programa académico'] || ''}
                                        value={anexoFormData.programasSeleccionados}
                                        onChange={handleProgramaChange}
                                        filterOptions={(options, params) => {
                                            const filtered = options.filter((option) =>
                                                option['programa académico'] && 
                                                option['programa académico'].toLowerCase().includes(params.inputValue.toLowerCase())
                                            );
                                            return filtered;
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Buscar Programas Académicos"
                                                placeholder="Escribe para buscar y seleccionar múltiples programas académicos..."
                                                margin="normal"
                                                fullWidth
                                                helperText="Puedes seleccionar múltiples programas académicos"
                                            />
                                        )}
                                        renderOption={(props, option, { index }) => (
                                            <Box component="li" {...props} key={`programa-option-${option.id_programa || index}`}>
                                                <Typography variant="body1">
                                                    {option['programa académico']}
                                                </Typography>
                                            </Box>
                                        )}
                                        noOptionsText="No se encontraron programas"
                                        loadingText="Cargando programas..."
                                        isOptionEqualToValue={(option, value) => option.id_programa === value?.id_programa}
                                    />

                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="escenarios-label">Escenarios de Práctica</InputLabel>
                                        <Select
                                            labelId="escenarios-label"
                                            id="escenarios-select"
                                            name="idEscenario"
                                            value={anexoFormData.idEscenario}
                                            onChange={handleAnexoInputChange}
                                            required
                                            label="Escenarios de Práctica"
                                        >
                                            {data && Array.isArray(data) ? data.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.nombre}
                                                </MenuItem>
                                            )) : []}
                                        </Select>
                                    </FormControl>
                                    
                                    <TextField
                                        label="URL del Documento"
                                        name="urlAnexo"
                                        value={anexoFormData.urlAnexo}
                                        onChange={handleAnexoInputChange}
                                        margin="normal"
                                        fullWidth
                                        placeholder="https://drive.google.com/..."
                                        helperText="URL donde se encuentra almacenado el documento"
                                    />

                                    <Typography variant="body2" sx={{ my: 1, textAlign: 'center' }}>
                                        O
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                    >
                                        Seleccionar Archivo Local
                                        <input
                                            type="file"
                                            hidden
                                            onChange={handleAnexoInputChange}
                                            name="localFile"
                                        />
                                    </Button>
                                    {anexoFormData.localFile && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Archivo seleccionado: {anexoFormData.localFile.name}
                                        </Typography>
                                    )}
                                    
                                    <FormControl fullWidth margin="normal" required>
                                        <InputLabel id="tipo-label">Tipo</InputLabel>
                                        <Select
                                            labelId="tipo-label"
                                            name="tipo"
                                            value={anexoFormData.tipo}
                                            onChange={handleAnexoInputChange}
                                            label="Tipo"
                                            required
                                        >
                                            <MenuItem value="C.D.S. Clinicos">C.D.S. Clinicos</MenuItem>
                                            <MenuItem value="C.D.S. No clinicos">C.D.S. No clinicos</MenuItem>
                                            <MenuItem value="C. Integración de propiedad">C. Integración de propiedad</MenuItem>
                                            {/*<MenuItem value="C. Interinstitucionales">C. Interinstitucionales</MenuItem>*/}
                                            {/*<MenuItem value="C. Cooperación Académica">C. Cooperación Académica</MenuItem>*/}
                                            {/*<MenuItem value="OtroSi">Otro Si</MenuItem>*/}
                                            {/*<MenuItem value="Otros Anexos Técnicos">Otros Anexos Técnicos</MenuItem>*/}
                                        </Select>
                                    </FormControl>
                                    
                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                        <TextField
                                            label="Vigencia Desde"
                                            name="vigenciaDesde"
                                            type="date"
                                            value={anexoFormData.vigenciaDesde}
                                            onChange={handleAnexoInputChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Vigencia Hasta"
                                            name="vigenciaHasta"
                                            type="date"
                                            value={anexoFormData.vigenciaHasta}
                                            onChange={handleAnexoInputChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            fullWidth
                                            required
                                        />
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                        <TextField
                                            label="Versión"
                                            name="version"
                                            type="number"
                                            value={anexoFormData.version}
                                            onChange={handleAnexoInputChange}
                                            required
                                            sx={{ width: '50%' }}
                                            inputProps={{ min: 1, step: 1 }}
                                        />
                                        <FormControl sx={{ width: '50%' }} required>
                                            <InputLabel id="proceso-calidad-label">Proceso de Calidad</InputLabel>
                                            <Select
                                                labelId="proceso-calidad-label"
                                                name="procesoCalidad"
                                                value={anexoFormData.procesoCalidad}
                                                onChange={handleAnexoInputChange}
                                                label="Proceso de Calidad"
                                                required
                                            >
                                                <MenuItem value="RC">RC</MenuItem>
                                                <MenuItem value="RRC">RRC</MenuItem>
                                                <MenuItem value="AAC">AAC</MenuItem>
                                                <MenuItem value="RAAC">RAAC</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    
                                    <TextField
                                        label="Cierre (Opcional)"
                                        placeholder="Este campo es opcional"
                                        name="cierre"
                                        value={anexoFormData.cierre}
                                        onChange={handleAnexoInputChange}
                                        margin="normal"
                                        fullWidth
                                    />
                                    
                                    <FormGroup sx={{ marginTop: 2 }}>
                                        <FormLabel component="legend">Estado</FormLabel>
                                        <RadioGroup
                                            name="estadoAnexo"
                                            value={anexoFormData.estadoAnexo}
                                            onChange={handleAnexoInputChange}
                                            sx={{ display: 'flex', flexDirection: 'row' }}
                                        >
                                            <FormControlLabel value="Pendiente" control={<Radio />} label="Pendiente" />
                                            <FormControlLabel value="En proceso" control={<Radio />} label="En proceso" />
                                            <FormControlLabel value="Listo" control={<Radio />} label="Listo" />
                                            <FormControlLabel value="Inactivo" control={<Radio />} label="Inactivo" />
                                        </RadioGroup>
                                    </FormGroup>
                                    
                                    {anexoFormData.estadoAnexo === 'Inactivo' && (
                                        <TextField
                                            label="Observaciones"
                                            name="observaciones"
                                            value={anexoFormData.observaciones}
                                            onChange={handleAnexoInputChange}
                                            margin="normal"
                                            multiline
                                            rows={3}
                                            fullWidth
                                        />
                                    )}

                                </FormGroup>
                                
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3 }}>
                                    <Button type="submit" variant="contained" color="primary">
                                        Guardar Anexo
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outlined" 
                                        onClick={toggleAnexoForm}
                                    >
                                        Cancelar
                                    </Button>
                                </Box>
                            </Box>
                        )}


                    </Box>
                    
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {/* Debug info */}
                            {console.log('=== RENDERIZADO ===', { 
                                tipoVista, 
                                dataLength: data?.length, 
                                anexosLength: anexos?.length,
                                anexosPorEscenarioKeys: Object.keys(anexosPorEscenario || {}),
                                anexosPorEscenario
                            })}
                            
                            {/* Vista por Escenarios (original) */}
                            {tipoVista === 'escenario' && anexosPorEscenario && Object.keys(anexosPorEscenario).length > 0 && (
                                Object.entries(anexosPorEscenario).map(([nombreEscenario, datosEscenario], index) => {
                                    // Obtener información de vigencia del escenario
                                    const escenarioInfo = datosEscenario.escenarioInfo || escenariosData?.find(esc => esc.nombre === nombreEscenario);
                                    
                                    // Debug: Mostrar información del escenario
                                    console.log(`=== DEBUG VIGENCIA ${nombreEscenario} ===`);
                                    console.log('escenarioInfo:', escenarioInfo);
                                    console.log('fecha_fin:', escenarioInfo?.fecha_fin);
                                    
                                    const vigenciaInfo = escenarioInfo ? calcularVigenciaYColor(escenarioInfo.fecha_fin) : { 
                                        diasRestantes: null, 
                                        colorFondo: '#f5f5f5', 
                                        estado: 'Sin información' 
                                    };
                                    
                                    // Calcular totales
                                    const totalAnexosTecnicos = datosEscenario.anexosTecnicos?.length || 0;
                                    const totalDocEscenarios = datosEscenario.documentosEscenario?.length || 0;
                                    const totalItems = datosEscenario.totalItems || totalAnexosTecnicos + totalDocEscenarios;
                                    
                                    // Generar texto del botón con información de vigencia
                                    let buttonText = `${nombreEscenario}`;
                                    if (totalItems > 0) {
                                        const partesDocs = [];
                                        if (totalAnexosTecnicos > 0) {
                                            partesDocs.push(`${totalAnexosTecnicos} anexo${totalAnexosTecnicos !== 1 ? 's' : ''} técnico${totalAnexosTecnicos !== 1 ? 's' : ''}`);
                                        }
                                        if (totalDocEscenarios > 0) {
                                            partesDocs.push(`${totalDocEscenarios} documento${totalDocEscenarios !== 1 ? 's' : ''} de escenario`);
                                        }
                                        if (partesDocs.length > 0) {
                                            buttonText += ` (${partesDocs.join(', ')})`;
                                        }
                                    }
                                    
                                    // Agregar información de vigencia
                                    if (vigenciaInfo.diasRestantes !== null) {
                                        if (vigenciaInfo.diasRestantes < 0) {
                                            buttonText += ` - VENCIDO hace ${Math.abs(vigenciaInfo.diasRestantes)} días`;
                                        } else if (vigenciaInfo.diasRestantes <= 90) {
                                            buttonText += ` - Vence en ${vigenciaInfo.diasRestantes} días`;
                                        } else if (vigenciaInfo.diasRestantes <= 730) {
                                            const meses = Math.round(vigenciaInfo.diasRestantes / 30);
                                            buttonText += ` - Vence en ${meses} mes${meses !== 1 ? 'es' : ''}`;
                                        } else {
                                            const años = Math.round(vigenciaInfo.diasRestantes / 365);
                                            buttonText += ` - Vence en ${años} año${años !== 1 ? 's' : ''}`;
                                        }
                                    } else {
                                        buttonText += ' - Sin fecha de vigencia';
                                    }
                                    
                                    return (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <CollapsibleButton
                                                buttonText={buttonText}
                                                buttonStyle={{
                                                    backgroundColor: vigenciaInfo.colorFondo,
                                                    color: '#000'
                                                }}
                                                content={
                                                    <Box>
                                                        {/* Información de vigencia */}
                                                        {vigenciaInfo.diasRestantes !== null && (
                                                            <Box sx={{ 
                                                                mb: 2, 
                                                                p: 2, 
                                                                backgroundColor: vigenciaInfo.colorFondo,
                                                                borderRadius: 1
                                                            }}>
                                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                    Estado de Vigencia: {vigenciaInfo.estado}
                                                                </Typography>
                                                                {vigenciaInfo.fechaVencimiento && (
                                                                    <Typography variant="body2">
                                                                        Fecha de vencimiento: {vigenciaInfo.fechaVencimiento}
                                                                    </Typography>
                                                                )}
                                                                {vigenciaInfo.diasRestantes !== null && vigenciaInfo.diasRestantes >= 0 && (
                                                                    <Typography variant="body2">
                                                                        Días restantes: {vigenciaInfo.diasRestantes}
                                                                    </Typography>
                                                                )}
                                                                {vigenciaInfo.diasRestantes !== null && vigenciaInfo.diasRestantes < 0 && (
                                                                    <Typography variant="body2">
                                                                        Días vencido: {Math.abs(vigenciaInfo.diasRestantes)}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        )}
                                                        
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            mb: 2 
                                                        }}>
                                                            <Typography variant="h6" sx={{ color: '#666' }}>
                                                                Documentos - {nombreEscenario}
                                                            </Typography>
                                                            
                                                            {(isCargo.includes('Convenio Docencia Servicio') || isCargo.includes('Sistemas')) && (
                                                                <Button 
                                                                    variant="outlined" 
                                                                    size="small"
                                                                    onClick={() => {
                                                                        // Buscar la información completa del escenario en escenariosData
                                                                        const escenarioCompleto = escenariosData.find(esc => esc.nombre === nombreEscenario);
                                                                        
                                                                        if (escenarioCompleto) {
                                                                            setDocEscenarioFormData({
                                                                                idEscenario: escenarioCompleto.id || '',
                                                                                nombreEscenario: escenarioCompleto.nombre || '',
                                                                                url: '',
                                                                                tipologia: escenarioCompleto.tipologia || '',
                                                                                codigo: escenarioCompleto.codigo || '',
                                                                                fechaInicio: convertirFechaParaInput(escenarioCompleto.fecha_inicio) || '',
                                                                                fechaFin: convertirFechaParaInput(escenarioCompleto.fecha_fin) || ''
                                                                            });
                                                                        } else if (escenarioInfo) {
                                                                            // Si no se encuentra el escenario completo, usar la información de escenarioInfo
                                                                            setDocEscenarioFormData({
                                                                                idEscenario: escenarioInfo.id || '',
                                                                                nombreEscenario: escenarioInfo.nombre || '',
                                                                                url: '',
                                                                                tipologia: '',
                                                                                codigo: '',
                                                                                fechaInicio: '',
                                                                                fechaFin: ''
                                                                            });
                                                                        }
                                                                        
                                                                        toggleDocEscenarioForm(nombreEscenario);
                                                                    }}
                                                                    sx={{ 
                                                                        textTransform: 'none',
                                                                        fontWeight: 500,
                                                                        minWidth: 'auto'
                                                                    }}
                                                                >
                                                                    Añadir documento escenario
                                                                </Button>
                                                            )}
                                                        </Box>

                                                        {/* Formulario para documentos de escenario - Aparece aquí cerca del botón */}
                                                        {(isCargo.includes('Convenio Docencia Servicio') || isCargo.includes('Sistemas')) && showDocEscenarioForm === nombreEscenario && (
                                                            <Box component="form" onSubmit={handleDocEscenarioFormSubmit} sx={{ 
                                                                marginTop: 2, 
                                                                marginBottom: 3,
                                                                maxWidth: '800px', 
                                                                mx: 'auto',
                                                                p: 3,
                                                                border: '1px solid #ddd',
                                                                borderRadius: 2,
                                                                backgroundColor: '#f0f8ff'
                                                            }}>
                                                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#1976d2' }}>
                                                                    Nuevo Documento de Escenario: {docEscenarioFormData.nombreEscenario}
                                                                </Typography>
                                                                
                                                                <FormGroup>
                                                                    {/* Campo de selección de escenario de práctica (modificable) */}
                                                                    <FormControl fullWidth margin="normal" required>
                                                                        <InputLabel id="doc-escenario-label">Escenario de Práctica</InputLabel>
                                                                        <Select
                                                                            labelId="doc-escenario-label"
                                                                            name="idEscenario"
                                                                            value={docEscenarioFormData.idEscenario}
                                                                            onChange={handleDocEscenarioInputChange}
                                                                            required
                                                                            label="Escenario de Práctica"
                                                                        >
                                                                            {escenariosData && Array.isArray(escenariosData) ? escenariosData.map((escenario) => (
                                                                                <MenuItem key={escenario.id} value={escenario.id}>
                                                                                    {escenario.nombre}
                                                                                </MenuItem>
                                                                            )) : []}
                                                                        </Select>
                                                                    </FormControl>

                                                                    {/* Campos editables con placeholders pre-llenados desde ESC_PRACTICA */}
                                                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                                                        <Autocomplete
                                                                            freeSolo
                                                                            options={uniqueTipologias}
                                                                            value={docEscenarioFormData.tipologia}
                                                                            onInputChange={(event, newInputValue) => {
                                                                                setDocEscenarioFormData({ ...docEscenarioFormData, tipologia: newInputValue });
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    {...params}
                                                                                    label="Tipología"
                                                                                    required
                                                                                    fullWidth
                                                                                    helperText="Seleccione una existente o escriba una nueva"
                                                                                />
                                                                            )}
                                                                            sx={{ width: '50%' }}
                                                                        />
                                                                        <TextField
                                                                            label="Código"
                                                                            name="codigo"
                                                                            type="number"
                                                                            value={docEscenarioFormData.codigo}
                                                                            onChange={handleDocEscenarioInputChange}
                                                                            required
                                                                            placeholder="Código del escenario"
                                                                            sx={{ width: '50%' }}
                                                                        />
                                                                    </Box>
                                                                    
                                                                    <TextField
                                                                        label="URL del Documento"
                                                                        name="url"
                                                                        value={docEscenarioFormData.url}
                                                                        onChange={handleDocEscenarioInputChange}
                                                                        margin="normal"
                                                                        fullWidth
                                                                        placeholder="https://drive.google.com/..."
                                                                        helperText="URL donde se encuentra almacenado el documento"
                                                                    />

                                                                    <Typography variant="body2" sx={{ my: 1, textAlign: 'center' }}>
                                                                        O
                                                                    </Typography>

                                                                    <Button
                                                                        variant="outlined"
                                                                        component="label"
                                                                        fullWidth
                                                                    >
                                                                        Seleccionar Archivo Local
                                                                        <input
                                                                            type="file"
                                                                            hidden
                                                                            onChange={handleDocEscenarioInputChange}
                                                                            name="localFile"
                                                                        />
                                                                    </Button>
                                                                    {docEscenarioFormData.localFile && (
                                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                                            Archivo seleccionado: {docEscenarioFormData.localFile.name}
                                                                        </Typography>
                                                                    )}
                                                                    
                                                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                                                        <TextField
                                                                            label="Fecha de Inicio"
                                                                            name="fechaInicio"
                                                                            type="date"
                                                                            value={docEscenarioFormData.fechaInicio}
                                                                            onChange={handleDocEscenarioInputChange}
                                                                            InputLabelProps={{
                                                                                shrink: true,
                                                                            }}
                                                                            fullWidth
                                                                            required
                                                                        />
                                                                        <TextField
                                                                            label="Fecha de Fin"
                                                                            name="fechaFin"
                                                                            type="date"
                                                                            value={docEscenarioFormData.fechaFin}
                                                                            onChange={handleDocEscenarioInputChange}
                                                                            InputLabelProps={{
                                                                                shrink: true,
                                                                            }}
                                                                            fullWidth
                                                                            required
                                                                        />
                                                                    </Box>

                                                                </FormGroup>
                                                                
                                                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3 }}>
                                                                    <Button type="submit" variant="contained" color="primary">
                                                                        Guardar Documento
                                                                    </Button>
                                                                    <Button 
                                                                        type="button" 
                                                                        variant="outlined" 
                                                                        onClick={() => toggleDocEscenarioForm(null)}
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        <AnexosEscenarioTable datos={datosEscenario} tipoVista={tipoVista} />
                                                    </Box>
                                                }
                                                defaultClosed={true}
                                            />
                                        </Box>
                                    );
                                })
                            )}

                            {/* Vista por Escuelas */}
                            {tipoVista === 'escuela' && (
                                Object.keys(anexosPorEscenario).length > 0 ? (
                                    Object.entries(anexosPorEscenario).map(([escuela, datosEscuela], index) => {
                                        const totalAnexosTecnicos = datosEscuela.anexosTecnicos?.length || 0;
                                        const totalDocEscenarios = datosEscuela.documentosEscenario?.length || 0;
                                        const totalItems = datosEscuela.totalItems || totalAnexosTecnicos + totalDocEscenarios;
                                        
                                        const programasEnEscuela = [...new Set([
                                            ...(datosEscuela.anexosTecnicos || []).map(a => a.programa_info?.['programa académico']).filter(p => p),
                                            ...(datosEscuela.documentosEscenario || []).map(d => d.programa_info?.['programa académico']).filter(p => p)
                                        ])];
                                        
                                        // Generar texto del botón para escuela
                                        let buttonTextEscuela = `${escuela}`;
                                        if (totalItems > 0) {
                                            const partesDocs = [];
                                            if (totalAnexosTecnicos > 0) {
                                                partesDocs.push(`${totalAnexosTecnicos} anexo${totalAnexosTecnicos !== 1 ? 's' : ''} técnico${totalAnexosTecnicos !== 1 ? 's' : ''}`);
                                            }
                                            if (totalDocEscenarios > 0) {
                                                partesDocs.push(`${totalDocEscenarios} documento${totalDocEscenarios !== 1 ? 's' : ''} de escenario`);
                                            }
                                            if (partesDocs.length > 0) {
                                                buttonTextEscuela += ` (${partesDocs.join(', ')} - ${programasEnEscuela.length} programa${programasEnEscuela.length !== 1 ? 's' : ''})`;
                                            }
                                        } else if (programasEnEscuela.length > 0) {
                                            buttonTextEscuela += ` (${programasEnEscuela.length} programa${programasEnEscuela.length !== 1 ? 's' : ''})`;
                                        }
                                        
                                        return (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <CollapsibleButton
                                                    buttonText={buttonTextEscuela}
                                                    content={
                                                        <Box>
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center',
                                                                mb: 1 
                                                            }}>
                                                                <Typography variant="h6" sx={{ color: '#666' }}>
                                                                    Documentos - Escuela: {escuela}
                                                            </Typography>
                                                                
                                                                {(isCargo.includes('Convenio Docencia Servicio') || isCargo.includes('Sistemas')) && (
                                                                    <Button 
                                                                        variant="outlined" 
                                                                        size="small"
                                                                        onClick={() => toggleDocEscenarioForm(`escuela-${escuela}`)}
                                                                        sx={{ 
                                                                            textTransform: 'none',
                                                                            fontWeight: 500,
                                                                            minWidth: 'auto'
                                                                        }}
                                                                    >
                                                                        Añadir documento escenario
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                            <Typography variant="body2" sx={{ mb: 2, color: '#888' }}>
                                                                Programas: {programasEnEscuela.join(', ')}
                                                            </Typography>
                                                            <AnexosEscenarioTable datos={datosEscuela} tipoVista={tipoVista} />
                                                        </Box>
                                                    }
                                                    defaultClosed={true}
                                                />
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography sx={{ textAlign: 'center', mt: 4 }}>
                                        No hay documentos disponibles para la escuela seleccionada.
                                    </Typography>
                                )
                            )}

                            {/* Vista por Programas Académicos */}
                            {tipoVista === 'programa' && (
                                Object.keys(anexosPorEscenario).length > 0 ? (
                                    Object.entries(anexosPorEscenario).map(([programa, datosPrograma], index) => {
                                        const totalAnexosTecnicos = datosPrograma.anexosTecnicos?.length || 0;
                                        const totalDocEscenarios = datosPrograma.documentosEscenario?.length || 0;
                                        const totalItems = datosPrograma.totalItems || totalAnexosTecnicos + totalDocEscenarios;
                                        
                                        const escuelasEnPrograma = [...new Set([
                                            ...(datosPrograma.anexosTecnicos || []).map(a => a.programa_info?.escuela).filter(e => e),
                                            ...(datosPrograma.documentosEscenario || []).map(d => d.programa_info?.escuela).filter(e => e)
                                        ])];
                                        
                                        // Generar texto del botón para programa
                                        let buttonTextPrograma = `${programa}`;
                                        if (totalItems > 0) {
                                            const partesDocs = [];
                                            if (totalAnexosTecnicos > 0) {
                                                partesDocs.push(`${totalAnexosTecnicos} anexo${totalAnexosTecnicos !== 1 ? 's' : ''} técnico${totalAnexosTecnicos !== 1 ? 's' : ''}`);
                                            }
                                            if (totalDocEscenarios > 0) {
                                                partesDocs.push(`${totalDocEscenarios} documento${totalDocEscenarios !== 1 ? 's' : ''} de escenario`);
                                            }
                                            if (partesDocs.length > 0) {
                                                buttonTextPrograma += ` (${partesDocs.join(', ')})`;
                                            }
                                        }
                                        
                                        return (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <CollapsibleButton
                                                    buttonText={buttonTextPrograma}
                                                    content={
                                                        <Box>
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center',
                                                                mb: 1 
                                                            }}>
                                                                <Typography variant="h6" sx={{ color: '#666' }}>
                                                                    Documentos - Programa: {programa}
                                                            </Typography>
                                                                
                                                                {(isCargo.includes('Convenio Docencia Servicio') || isCargo.includes('Sistemas')) && (
                                                                    <Button 
                                                                        variant="outlined" 
                                                                        size="small"
                                                                        onClick={() => toggleDocEscenarioForm(`programa-${programa}`)}
                                                                        sx={{ 
                                                                            textTransform: 'none',
                                                                            fontWeight: 500,
                                                                            minWidth: 'auto'
                                                                        }}
                                                                    >
                                                                        Añadir documento escenario
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                            <Typography variant="body2" sx={{ mb: 2, color: '#888' }}>
                                                                Escuela(s): {escuelasEnPrograma.join(', ')}
                                                            </Typography>
                                                            <AnexosEscenarioTable datos={datosPrograma} tipoVista={tipoVista} />
                                                        </Box>
                                                    }
                                                    defaultClosed={true}
                                                />
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography sx={{ textAlign: 'center', mt: 4 }}>
                                        No hay documentos disponibles para el programa académico seleccionado.
                                    </Typography>
                                )
                            )}

                            {/* Mensaje cuando no hay datos */}
                            {tipoVista === 'escenario' && (!anexosPorEscenario || Object.keys(anexosPorEscenario).length === 0) && (
                                <Typography sx={{ textAlign: 'center', mt: 4 }}>
                                    No hay escenarios de práctica disponibles que coincidan con los filtros aplicados.
                                </Typography>
                            )}
                        </>
                    )}
                </Box>
            </div>
        </>
    );
};

export default DocenciaServicio;
