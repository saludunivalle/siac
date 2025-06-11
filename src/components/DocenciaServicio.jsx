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
    const [anexosPorEscenario, setAnexosPorEscenario] = useState({});
    const [programasData, setProgramasData] = useState([]);
    const [escuelasUnicas, setEscuelasUnicas] = useState([]);
    const [programasUnicos, setProgramasUnicos] = useState([]);
    
    // Estados para filtros
    const [filtroEscuela, setFiltroEscuela] = useState('');
    const [filtroPrograma, setFiltroPrograma] = useState('');
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
        observaciones: ''
    });
    const [reloadAnexos, setReloadAnexos] = useState(false);

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
            const response = await axios.post('https://siac-server.vercel.app/seguimiento', {
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

    // Función para agrupar anexos según el tipo de vista
    const agruparAnexos = (anexos, escenarios, programas, tipoVista, filtroEscuela, filtroPrograma) => {
        console.log("Agrupando anexos con:", { tipoVista, filtroEscuela, filtroPrograma });
        
        if (tipoVista === 'escenario') {
            return agruparAnexosPorEscenario(anexos, escenarios);
        } else if (tipoVista === 'escuela') {
            return agruparAnexosPorEscuela(anexos, programas, filtroEscuela);
        } else if (tipoVista === 'programa') {
            return agruparAnexosPorPrograma(anexos, programas, filtroPrograma);
        }
        
        return {};
    };

    // Función para agrupar anexos por escenario (funcionalidad original)
    const agruparAnexosPorEscenario = (anexos, escenarios) => {
        const agrupados = {};
        
        // Validar que escenarios sea un array
        if (!escenarios || !Array.isArray(escenarios)) {
            return agrupados;
        }
        
        // Inicializar cada escenario con un array vacío
        escenarios.forEach(escenario => {
            agrupados[escenario.nombre] = [];
        });

        // Validar que anexos sea un array
        if (!anexos || !Array.isArray(anexos)) {
            return agrupados;
        }

        // Agrupar anexos por nombre de escenario
        anexos.forEach(anexo => {
            if (anexo.nombre && agrupados[anexo.nombre] !== undefined) {
                agrupados[anexo.nombre].push(anexo);
            }
        });

        return agrupados;
    };

    // Función para agrupar anexos por escuela
    const agruparAnexosPorEscuela = (anexos, programas, filtroEscuela) => {
        const agrupados = {};
        
        // Validar que programas sea un array
        if (!programas || !Array.isArray(programas)) {
            return agrupados;
        }
        
        // Filtrar programas por escuela si hay filtro
        const programasFiltrados = filtroEscuela 
            ? programas.filter(p => p.escuela === filtroEscuela)
            : programas;
            
        // Inicializar cada escuela
        const escuelasParaMostrar = filtroEscuela 
            ? [filtroEscuela]
            : [...new Set(programasFiltrados.map(p => p.escuela).filter(e => e && e.trim() !== ''))];
            
        escuelasParaMostrar.forEach(escuela => {
            agrupados[escuela] = [];
        });

        // Validar que anexos sea un array
        if (!anexos || !Array.isArray(anexos)) {
            return agrupados;
        }

        // Agrupar anexos por escuela del programa
        anexos.forEach(anexo => {
            if (anexo.id_programa) {
                const programa = programas.find(p => p.id_programa === anexo.id_programa);
                if (programa && programa.escuela && agrupados[programa.escuela] !== undefined) {
                    agrupados[programa.escuela].push({
                        ...anexo,
                        programa_info: programa
                    });
                }
            }
        });

        return agrupados;
    };

    // Función para agrupar anexos por programa académico
    const agruparAnexosPorPrograma = (anexos, programas, filtroPrograma) => {
        const agrupados = {};
        
        // Validar que programas sea un array
        if (!programas || !Array.isArray(programas)) {
            return agrupados;
        }
        
        // Filtrar programas por programa académico si hay filtro
        const programasFiltrados = filtroPrograma 
            ? programas.filter(p => p['programa académico'] === filtroPrograma)
            : programas;
            
        // Inicializar cada programa académico
        const programasParaMostrar = filtroPrograma 
            ? [filtroPrograma]
            : [...new Set(programasFiltrados.map(p => p['programa académico']).filter(p => p && p.trim() !== ''))];
            
        programasParaMostrar.forEach(programa => {
            agrupados[programa] = [];
        });

        // Validar que anexos sea un array
        if (!anexos || !Array.isArray(anexos)) {
            return agrupados;
        }

        // Agrupar anexos por programa académico
        anexos.forEach(anexo => {
            if (anexo.id_programa) {
                const programa = programas.find(p => p.id_programa === anexo.id_programa);
                if (programa && programa['programa académico'] && agrupados[programa['programa académico']] !== undefined) {
                    agrupados[programa['programa académico']].push({
                        ...anexo,
                        programa_info: programa
                    });
                }
            }
        });

        return agrupados;
    };

    // Efecto para obtener los datos al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log('=== INICIANDO CARGA DE DATOS ===');
                // Obtener escenarios, anexos y programas en paralelo
                const [escenariosResult, anexosResult, programasResult] = await Promise.all([
                    Filtro14(),
                    fetchAnexos(),
                    fetchProgramas()
                ]);
                
                console.log('Escenarios obtenidos:', escenariosResult);
                console.log('Anexos obtenidos:', anexosResult);
                console.log('Programas obtenidos:', programasResult);
                
                setData(escenariosResult);
                setAnexos(anexosResult);
                
                // Agrupar anexos según el tipo de vista actual
                console.log('Agrupando con tipo de vista:', tipoVista);
                const agrupados = agruparAnexos(anexosResult, escenariosResult, programasResult, tipoVista, filtroEscuela, filtroPrograma);
                console.log('Resultado de agrupación:', agrupados);
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
        console.log('data:', data);
        console.log('anexos:', anexos);
        console.log('programasData:', programasData);
        console.log('tipoVista:', tipoVista);
        
        if (data && Array.isArray(data) && data.length > 0 && 
            anexos && Array.isArray(anexos) && anexos.length > 0 && 
            programasData && Array.isArray(programasData) && programasData.length > 0) {
            console.log('Condiciones cumplidas, reagrupando...');
            const agrupados = agruparAnexos(anexos, data, programasData, tipoVista, filtroEscuela, filtroPrograma);
            console.log('Nuevo resultado de agrupación:', agrupados);
            setAnexosPorEscenario(agrupados);
        } else {
            console.log('Condiciones NO cumplidas para reagrupar');
            console.log('data válido:', data && Array.isArray(data) && data.length > 0);
            console.log('anexos válido:', anexos && Array.isArray(anexos) && anexos.length > 0);
            console.log('programasData válido:', programasData && Array.isArray(programasData) && programasData.length > 0);
        }
    }, [tipoVista, filtroEscuela, filtroPrograma, data, anexos, programasData]);

    // Limpiar filtros cuando se cambia el tipo de vista
    const handleTipoVistaChange = (nuevoTipo) => {
        setTipoVista(nuevoTipo);
        setFiltroEscuela('');
        setFiltroPrograma('');
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

    const handleAnexoInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'idEscenario') {
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
                [name]: value
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

            // Crear anexos para cada programa seleccionado
            const baseTimestamp = Date.now();
            const newAnexos = anexoFormData.programasSeleccionados.map((programa, index) => ({
                id: baseTimestamp + (index * 1000), // usar timestamp base + offset para evitar duplicados
                id_programa: programa.id_programa, // usar el id del programa seleccionado
                idEscenario: anexoFormData.idEscenario, // id del escenario
                nombre: anexoFormData.nombreEscenario, // nombre del escenario
                url: anexoFormData.urlAnexo, // URL del anexo o archivo
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
                    observaciones: ''
                });
                
                setShowAnexoForm(false);
                
                // Recargar los anexos
                setTimeout(async () => {
                    setLoading(true);
                    try {
                        const [escenariosResult, anexosResult] = await Promise.all([
                            Filtro14(),
                            fetchAnexos()
                        ]);
                        
                        setData(escenariosResult);
                        setAnexos(anexosResult);
                        
                        // Agrupar anexos según el tipo de vista actual
                        const agrupados = agruparAnexos(anexosResult, escenariosResult, programasData, tipoVista, filtroEscuela, filtroPrograma);
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

    // Componente para mostrar la tabla de anexos de un escenario
    const AnexosEscenarioTable = ({ anexos, tipoVista }) => {
        if (!anexos || anexos.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="text.secondary">
                        No hay anexos técnicos registrados{tipoVista === 'escenario' ? ' para este escenario' : tipoVista === 'escuela' ? ' para esta escuela' : ' para este programa académico'}.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {(tipoVista === 'escuela' || tipoVista === 'programa') && (
                                <>
                                    <TableCell><strong>Programa</strong></TableCell>
                                    <TableCell><strong>Escuela</strong></TableCell>
                                </>
                            )}
                            <TableCell><strong>Escenario</strong></TableCell>
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
                        {anexos.map((anexo, index) => (
                            <TableRow key={index}>
                                {(tipoVista === 'escuela' || tipoVista === 'programa') && (
                                    <>
                                        <TableCell>{anexo.programa_info?.['programa académico'] || 'N/A'}</TableCell>
                                        <TableCell>{anexo.programa_info?.escuela || 'N/A'}</TableCell>
                                    </>
                                )}
                                <TableCell>{anexo.nombre || 'Sin escenario'}</TableCell>
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
        );
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
                        <Button 
                            variant="contained" 
                            onClick={toggleAnexoForm}
                            sx={{ mb: 2 }}
                        >
                            Añadir Anexo Técnico
                        </Button>

                        {showAnexoForm && (
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
                                        label="URL/Archivo"
                                        name="urlAnexo"
                                        value={anexoFormData.urlAnexo}
                                        onChange={handleAnexoInputChange}
                                        margin="normal"
                                        required
                                        fullWidth
                                    />
                                    
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
                                            <MenuItem value="C. Interinstitucionales">C. Interinstitucionales</MenuItem>
                                            <MenuItem value="C. Cooperación Académica">C. Cooperación Académica</MenuItem>
                                            <MenuItem value="OtroSi">Otro Si</MenuItem>
                                            <MenuItem value="Otros Anexos Técnicos">Otros Anexos Técnicos</MenuItem>
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
                            {tipoVista === 'escenario' && data && Array.isArray(data) && data.length > 0 && (
                                data.map((item, index) => {
                                    const anexosDelEscenario = anexosPorEscenario[item.nombre] || [];
                                    const cantidadAnexos = anexosDelEscenario.length;
                                    
                                    return (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <CollapsibleButton
                                                buttonText={`${item.nombre} ${cantidadAnexos > 0 ? `(${cantidadAnexos} anexo${cantidadAnexos !== 1 ? 's' : ''})` : '(Sin anexos)'}`}
                                                content={
                                                    <Box>
                                                        <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                                                            Anexos Técnicos - {item.nombre}
                                                        </Typography>
                                                        <AnexosEscenarioTable anexos={anexosDelEscenario} tipoVista={tipoVista} />
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
                                    Object.entries(anexosPorEscenario).map(([escuela, anexos], index) => {
                                        const cantidadAnexos = anexos.length;
                                        const programasEnEscuela = [...new Set(anexos.map(a => a.programa_info?.['programa académico']).filter(p => p))];
                                        
                                        return (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <CollapsibleButton
                                                    buttonText={`${escuela} (${cantidadAnexos} anexo${cantidadAnexos !== 1 ? 's' : ''} - ${programasEnEscuela.length} programa${programasEnEscuela.length !== 1 ? 's' : ''})`}
                                                    content={
                                                        <Box>
                                                            <Typography variant="h6" sx={{ mb: 1, color: '#666' }}>
                                                                Anexos Técnicos - Escuela: {escuela}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ mb: 2, color: '#888' }}>
                                                                Programas: {programasEnEscuela.join(', ')}
                                                            </Typography>
                                                            <AnexosEscenarioTable anexos={anexos} tipoVista={tipoVista} />
                                                        </Box>
                                                    }
                                                    defaultClosed={true}
                                                />
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography sx={{ textAlign: 'center', mt: 4 }}>
                                        No hay anexos técnicos disponibles para la escuela seleccionada.
                                    </Typography>
                                )
                            )}

                            {/* Vista por Programas Académicos */}
                            {tipoVista === 'programa' && (
                                Object.keys(anexosPorEscenario).length > 0 ? (
                                    Object.entries(anexosPorEscenario).map(([programa, anexos], index) => {
                                        const cantidadAnexos = anexos.length;
                                        const escuelasEnPrograma = [...new Set(anexos.map(a => a.programa_info?.escuela).filter(e => e))];
                                        
                                        return (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <CollapsibleButton
                                                    buttonText={`${programa} (${cantidadAnexos} anexo${cantidadAnexos !== 1 ? 's' : ''})`}
                                                    content={
                                                        <Box>
                                                            <Typography variant="h6" sx={{ mb: 1, color: '#666' }}>
                                                                Anexos Técnicos - Programa: {programa}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ mb: 2, color: '#888' }}>
                                                                Escuela(s): {escuelasEnPrograma.join(', ')}
                                                            </Typography>
                                                            <AnexosEscenarioTable anexos={anexos} tipoVista={tipoVista} />
                                                        </Box>
                                                    }
                                                    defaultClosed={true}
                                                />
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography sx={{ textAlign: 'center', mt: 4 }}>
                                        No hay anexos técnicos disponibles para el programa académico seleccionado.
                                    </Typography>
                                )
                            )}

                            {/* Mensaje cuando no hay datos */}
                            {tipoVista === 'escenario' && data && Array.isArray(data) && data.length === 0 && (
                                <Typography sx={{ textAlign: 'center', mt: 4 }}>
                                    No hay escenarios de práctica disponibles.
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
