import React, { useState, useEffect } from 'react';
import { Button, MenuItem, Select, TextField, FormGroup, FormControl, InputLabel, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, CircularProgress, Backdrop, Typography, RadioGroup, FormControlLabel, Radio, FormLabel, Autocomplete } from '@mui/material';
import { Filtro13, Filtro14, Filtro15, Filtro16, sendDataRelEscPract, sendDataHorariosPract } from '../service/data';
import '/src/styles/home.css';
import axios from 'axios';
import CollapsibleButton from './CollapsibleButton';

const PracticeScenario = ({ data }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [showForm, setShowForm] = useState(null);
    const [relationID, setRelationId] = useState(null);
    const [idAsignatura, setIdAsignatura] = useState(null);
    const [filtro14Data, setFiltro14Data] = useState([]);
    const [selectedFiltro14Id, setSelectedFiltro14Id] = useState('');
    const [asignaturaSemanasRotar, setAsignaturaSemanasRotar] = useState('');
    const [totalHorasSemanal, setTotalHorasSemanal] = useState(0);
    const [totalHorasRotacion, setTotalHorasRotacion] = useState(0);
    const [horasPorDia, setHorasPorDia] = useState({
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: []
    });
    const [permisos, setPermisos] = useState([]);
    const [filtro15Data, setFiltro15Data] = useState([]);
    const [filtro16Data, setFiltro16Data] = useState([]);
    const [saving, setSaving] = useState(false);
    const [isScenarioSaved, setIsScenarioSaved] = useState(false);
    const [isScheduleSaved, setIsScheduleSaved] = useState(false);
    const [newScenario, setNewScenario] = useState(false);
    const [showPracticeForm, setShowPracticeForm] = useState(false);
    const [programasData, setProgramasData] = useState([]);
    const togglePracticeForm = () => {
        setShowPracticeForm(!showPracticeForm);
    };
    
    const [practiceFormData, setPracticeFormData] = useState({
        nombrerotacion: '',
        numeroestudiantes: '',
        horassemanas: '',
        docentes: '',
        servicios: '',
        intensidadhoraria: ''
    });
    const [practiceTables, setPracticeTables] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedPractice, setEditedPractice] = useState({});

    // Para obtener los datos actuales de la hoja SOLICITUD_PRACT
    const fetchPractices = async () => {
        try {
            const response = await axios.post('https://siac-server.vercel.app/getPractices', { sheetName: 'SOLICITUD_PRACT' });
    
            // Verificar si la respuesta trae los datos esperados
            console.log("Response:", response);
            
            if (response.data.status) {
                const practices = response.data.data;
    
                // Filtrar las prácticas que tienen un ID vacío o son "filas eliminadas"
                const filteredPractices = practices.filter(practice => practice.id && practice.nombrerotacion);
    
                setPracticeTables(filteredPractices);  // Asegúrate de que el estado se esté actualizando
            } else {
                console.error('Error en la respuesta al traer las prácticas:', response.data);
            }
        } catch (error) {
            console.error('Error al cargar los datos de las prácticas:', error);
        }
    };

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
                
                // Preseleccionar el programa actual si existe
                if (data.id_programa) {
                    const programaActual = programas.find(p => p.id_programa === data.id_programa);
                    if (programaActual) {
                        setAnexoFormData(prev => ({
                            ...prev,
                            idPrograma: data.id_programa,
                            programasSeleccionados: [programaActual]
                        }));
                    }
                }
                
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
    

    useEffect(() => {
        if (data.id_programa) {
            fetchPractices();
            fetchProgramas();
        }
    }, [data.id_programa]);  // El hook depende de que data.id_programa esté disponible


    

    // Manejar los cambios en los inputs
    const handlePracticeInputChange = (e) => {
        const { name, value } = e.target;
        setPracticeFormData({
            ...practiceFormData,
            [name]: value
        });
    };

    // Enviar una nueva solicitud
    const handlePracticeFormSubmit = async (e) => {
        e.preventDefault();
        const newPractice = {
            ...practiceFormData,
            id: practiceTables.length + 1,
            id_programa: data.id_programa,
            fecha_formalización: new Date().toISOString().split('T')[0]
        };

        await sendPracticeToSheet(newPractice);
        setPracticeTables([...practiceTables, newPractice]);

        // Limpiar formulario
        setPracticeFormData({
            nombrerotacion: '',
            numeroestudiantes: '',
            horassemanas: '',
            docentes: '',
            servicios: '',
            intensidadhoraria: ''
        });
    };

    const sendPracticeToSheet = async (practice) => {
        try {
            const insertData = [
                [
                    practice.id,
                    practice.id_programa,
                    practice.nombrerotacion,
                    practice.numeroestudiantes,
                    practice.horassemanas,
                    practice.docentes,
                    practice.servicios,
                    practice.intensidadhoraria,
                    practice.fecha_formalización
                ]
            ];
            const sheetName = 'SOLICITUD_PRACT';
            const response = await axios.post('https://siac-server.vercel.app/sendPractice', {
                insertData,
                sheetName
            });

            if (response.status === 200) {
                console.log('Solicitud guardada correctamente en la hoja:', response.data);
            } else {
                console.error('Error al guardar la solicitud en la hoja:', response.statusText);
            }
        } catch (error) {
            console.error('Error al enviar la solicitud al servidor:', error);
        }
    };

    // Editar una solicitud existente
    const handleEdit = (practice) => {
        setEditingId(practice.id);
        setEditedPractice(practice);
    };

    const handleSave = async (id) => {
        await updatePractice(id);
        setEditingId(null);
        setEditedPractice({});
        fetchPractices();  

        const updatedPractices = practiceTables.map(practice => 
            practice.id === id ? editedPractice : practice
        );
        setPracticeTables(updatedPractices);
    };

    //Función para actualizar la solicitud de practica 
    const updatePractice = async (id) => {
        const updateData = [
            editedPractice.id,
            editedPractice.id_programa,
            editedPractice.nombrerotacion,
            editedPractice.numeroestudiantes,
            editedPractice.horassemanas,
            editedPractice.docentes,
            editedPractice.servicios,
            editedPractice.intensidadhoraria,
            editedPractice.fecha_formalización
        ];
        const sheetName = 'SOLICITUD_PRACT';
        try {
            const response = await axios.post('https://siac-server.vercel.app/updatePractice', {
                updateData,
                id,
                sheetName
            });
            if (response.status === 200) {
                console.log('Solicitud actualizada correctamente');
            } else {
                console.error('Error al actualizar la solicitud:', response.statusText);
            }
        } catch (error) {
            console.error('Error al actualizar la solicitud:', error);
        }
    };

    // Eliminar una solicitud
    const handleDelete = async (id) => {
        await deletePractice(id);
        fetchPractices();  // Recargar las solicitudes
        // Eliminar localmente el elemento de la tabla
        const updatedPractices = practiceTables.filter(practice => practice.id !== id);
        setPracticeTables(updatedPractices);
    };

    //Función para eliminar la solicitud de practica
    const deletePractice = async (id) => {
        try {
          const sheetName = 'SOLICITUD_PRACT';
          console.log('Enviando solicitud de eliminación para el ID:', id);
      
          const response = await axios.post('https://siac-server.vercel.app/deletePractice', {
            id,
            sheetName
          });
      
          if (response.status === 200) {
            console.log('Solicitud eliminada correctamente', id);
            // Eliminar la solicitud del estado local si la eliminación fue exitosa
            setPracticeTables(practiceTables.filter(practice => practice.id !== id));
            // Recargar los datos de las prácticas para asegurar que se mantenga la consistencia
            await fetchPractices();
          } else {
            console.error('Error al eliminar la solicitud:', response.statusText);
          }
        } catch (error) {
          console.error('Error al eliminar la solicitud:', error);
        }
      };
      
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [data13, data14, data15, data16] = await Promise.all([Filtro13(), Filtro14(), Filtro15(), Filtro16()]);
                
                // Validar que los datos existan y sean arrays antes de procesarlos
                if (data13 && Array.isArray(data13)) {
                    setFilteredData(data13.filter(asignatura => asignatura && asignatura.id_programa === data.id_programa));
                } else {
                    console.warn('data13 no es un array válido:', data13);
                    setFilteredData([]);
                }
                
                if (data14 && Array.isArray(data14)) {
                    setFiltro14Data(data14);
                } else {
                    console.warn('data14 no es un array válido:', data14);
                    setFiltro14Data([]);
                }
                
                if (data15 && Array.isArray(data15)) {
                    setFiltro15Data(data15);
                    const lastIdRel = data15.length > 0 ? Math.max(...data15.map(item => item.id)) : 0;
                    setRelationId(lastIdRel + 1);
                } else {
                    console.warn('data15 no es un array válido:', data15);
                    setFiltro15Data([]);
                    setRelationId(1);
                }
                
                if (data16 && Array.isArray(data16)) {
                    setFiltro16Data(data16);
                } else {
                    console.warn('data16 no es un array válido:', data16);
                    setFiltro16Data([]);
                }
                
                console.log('Datos cargados:', { data13, data14, data15, data16 });
                console.log('Contenido de filtro16Data:', data16);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
                // Establecer valores por defecto en caso de error
                setFilteredData([]);
                setFiltro14Data([]);
                setFiltro15Data([]);
                setFiltro16Data([]);
                setRelationId(1);
            }
        };

        // Solo ejecutar si data.id_programa existe
        if (data && data.id_programa) {
            fetchData();
        }
    }, [data.id_programa]);

    useEffect(() => {
        loadPermisos();
    }, []);

    //Función para cargar los permisos del usuario
    const loadPermisos = () => {
        if (sessionStorage.getItem('logged')) {
            try {
                const userData = JSON.parse(sessionStorage.getItem('logged'));
                const permisos = userData.map(item => item.permiso).flat();
                setPermisos(permisos);
            } catch (error) {
                console.error('Error al cargar permisos:', error);
            }
        } else {
            console.warn('No se encontraron datos de sesión.');
        }
    };

    const tienePermisoConvenio = () => permisos.includes('Convenio Docencia Servicio') || permisos.includes('Sistemas');
    const tienePermisoDirector = () => permisos.includes('Director Programa') || permisos.includes('Director Practica') || permisos.includes('Sistemas');

    const toggleForm = () => {
        setNewScenario(true);
    };

    //Función para manejar el checkbox de las horas
    const handleCheck = (dia, hora, isChecked) => {
        setHorasPorDia(prevHorasPorDia => {
            const horasPorDiaCopy = { ...prevHorasPorDia };
            if (isChecked) {
                horasPorDiaCopy[dia] = [...horasPorDiaCopy[dia], hora];
            } else {
                horasPorDiaCopy[dia] = horasPorDiaCopy[dia].filter(h => h !== hora);
            }
            const totalHorasSemanal = Object.values(horasPorDiaCopy).reduce((acc, curr) => acc + curr.length, 0);
            setTotalHorasSemanal(totalHorasSemanal);

            const totalHorasRotacion = totalHorasSemanal * (asignaturaSemanasRotar ? parseInt(asignaturaSemanasRotar) : 0);
            setTotalHorasRotacion(totalHorasRotacion);

            return horasPorDiaCopy;
        });
    };

    //Función para manejar el envío de los datos
    const handleScenarioSubmit = async (e) => {
        e.preventDefault();
        setIsScenarioSaved(true);
        if (isScheduleSaved) {
            await handleFinalSubmit();
        }
    };

    //Función para manejar el envío de los datos
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setIsScheduleSaved(true);
        if (isScenarioSaved) {
            await handleFinalSubmit();
        }
    };

    //Función para manejar el envío final de los datos
    const handleFinalSubmit = async () => {
        setSaving(true);
        try {
            const horario = JSON.stringify(horasPorDia);
            const selectedFiltro14 = (filtro14Data && Array.isArray(filtro14Data)) 
                ? filtro14Data.find(item => item && item.nombre === selectedFiltro14Id) 
                : null;

            if (!selectedFiltro14) {
                console.error('No se encontró el escenario seleccionado:', selectedFiltro14Id);
                return;
            }

            const dataSendRel = [
                relationID,
                data.id_programa,
                idAsignatura,
                selectedFiltro14.id,
                totalHorasSemanal,
                asignaturaSemanasRotar,
                totalHorasRotacion,
            ];

            const dataSendHor = [
                relationID,
                horario,
            ];

            console.log('Enviando datos:', { dataSendRel, dataSendHor });

            await Promise.all([sendDataRelEscPract(dataSendRel), sendDataHorariosPract(dataSendHor)]);

            setHorasPorDia({
                lunes: [],
                martes: [],
                miercoles: [],
                jueves: [],
                viernes: []
            });
            setTotalHorasSemanal(0);
            setTotalHorasRotacion(0);
            setSelectedFiltro14Id('');
            setAsignaturaSemanasRotar('');
            setIsScenarioSaved(false);
            setIsScheduleSaved(false);
            setNewScenario(false);
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (value) => {
        setAsignaturaSemanasRotar(value);
        const totalHorasRotacion = totalHorasSemanal * (value ? parseInt(value) : 0);
        setTotalHorasRotacion(totalHorasRotacion);
    };

    //Función para calcular el total de horas
    const calculateTotalHoras = (id_programa, id_asignatura) => {
        if (!filtro15Data || !Array.isArray(filtro15Data)) {
            console.warn('filtro15Data no es un array válido:', filtro15Data);
            return 0;
        }
        
        const filteredData = filtro15Data.filter(item => item && item.id_programa === id_programa && item.id_asignatura === id_asignatura);
        const totalHoras = filteredData.reduce((total, item) => {
            const horas = parseInt(item.total_horas, 10);
            return isNaN(horas) ? total : total + horas;
        }, 0);

        return totalHoras;
    };

    //Función para obtener el horario
    const getHorario = (relationID) => {
        console.log('Buscando horario para relationID:', relationID);
        
        if (!filtro16Data || !Array.isArray(filtro16Data)) {
            console.warn('filtro16Data no es un array válido:', filtro16Data);
            return { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };
        }
        
        const horarioData = filtro16Data.find(item => item && item.id_relacion === relationID);
        console.log('Horario obtenido:', horarioData);
        if (!horarioData) {
            console.warn(`No se encontró un horario para relationID: ${relationID}`);
        }
        try {
            return horarioData ? JSON.parse(horarioData.json_horas) : { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };
        }
    };

    //Función para renderizar el horario    
    const renderHorario = (horario) => {
        console.log('Renderizando horario:', horario);
        return (
            <TableBody>
                {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day, index) => (
                    <TableRow key={index}>
                        <TableCell style={{ padding: '6px', textAlign: 'center' }}>{day}</TableCell>
                        {[...Array(15).keys()].map((hour) => (
                            <TableCell key={`${day}-${hour}`} style={{ padding: '6px', textAlign: 'center' }}>
                                <Checkbox
                                    style={{ padding: '5px' }}
                                    checked={horario[day]?.includes(`${hour + 6}:00`)}
                                    disabled
                                />
                            </TableCell>
                        ))}
                        <TableCell style={{ padding: '6px', textAlign: 'center' }}>
                            {horario[day]?.length || 0}
                        </TableCell>
                    </TableRow>
                ))}
                <TableRow>
                    <TableCell colSpan={15} style={{ padding: '6px', textAlign: 'left', fontSize: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total horas semanales: {Object.values(horario).reduce((acc, curr) => acc + curr.length, 0)}</span>
                            {tienePermisoDirector() && (
                                <span>Total horas rotación: {Object.values(horario).reduce((acc, curr) => acc + curr.length, 0) * (asignaturaSemanasRotar ? parseInt(asignaturaSemanasRotar) : 0)}</span>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    };

    const [showAnexoForm, setShowAnexoForm] = useState(false);
    const [anexoFormData, setAnexoFormData] = useState({
        idPrograma: '', // Guardará el ID del programa principal
        programasSeleccionados: [], // Array de programas seleccionados
        idEscenario: '', // Guardará el ID del escenario seleccionado
        nombreEscenario: '', // Guardará el nombre del escenario
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
    
    
    const [anexosList, setAnexosList] = useState([]);
    const [reloadAnexos, setReloadAnexos] = useState(false);

    // Obtener los anexos actuales de la hoja ANEXOS_TEC
    const toggleAnexoForm = () => {
        if (!showAnexoForm && data.id_programa && programasData.length > 0) {
            // Al abrir el formulario, preseleccionar el programa actual
            const programaActual = programasData.find(p => p.id_programa === data.id_programa);
            if (programaActual) {
                setAnexoFormData(prev => ({
                    ...prev,
                    idPrograma: data.id_programa,
                    programasSeleccionados: [programaActual]
                }));
            }
        }
        setShowAnexoForm(!showAnexoForm);
    };

    const handleAnexoInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'idEscenario') {
            // Obtener el nombre del escenario seleccionado
            const selectedScenario = (filtro14Data && Array.isArray(filtro14Data)) 
                ? filtro14Data.find(item => item && item.id === value) 
                : null;
            
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
                // Actualizar la lista de anexos en el estado local
                setAnexosList([...anexosList, ...newAnexos]);
        
                // Reiniciar el formulario manteniendo el programa actual preseleccionado
                const programaActual = programasData.find(p => p.id_programa === data.id_programa);
                setAnexoFormData({
                    idPrograma: data.id_programa,
                    programasSeleccionados: programaActual ? [programaActual] : [],
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
                
                // Recargar los anexos inmediatamente después de un pequeño delay
                setTimeout(() => {
                    setReloadAnexos(true);
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
                    anexo.id_programa, // id del programa
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
    
    // Función para la tabla de anexos
    const AnexosTable = ({ reloadTrigger }) => {
        const [anexos, setAnexos] = useState([]);
        const [editingId, setEditingId] = useState(null);
        const [editedAnexo, setEditedAnexo] = useState({});
      
        const fetchAnexos = async () => {
            try {
                console.log("Obteniendo anexos para el programa:", data.id_programa);
                const response = await axios.post('https://siac-server.vercel.app/getAnexos', { sheetName: 'ANEXOS_TEC' });
                
                console.log("Respuesta completa del servidor:", response.data);
                
                if (response.data && response.data.status) {
                    // Filtrar los anexos por el id_programa actual
                    const anexosFiltrados = response.data.data.filter(anexo => 
                        anexo.id_programa === data.id_programa
                    );
                    
                    console.log("Anexos filtrados por programa:", anexosFiltrados);
                    
                    // Procesar los anexos para asegurar que todos los campos estén presentes
                    const anexosProcesados = anexosFiltrados.map(anexo => {
                        return {
                            ...anexo,
                            // Asegurar que los campos estén mapeados correctamente
                            idEscenario: anexo.id_escenario || anexo.idEscenario, // Mapear id_escenario a idEscenario para consistencia
                            tipo: anexo.tipo || '',
                            version: anexo.version || '',
                            proceso_calidad: anexo.proceso_calidad || '',
                            cierre: anexo.cierre || '',
                            observaciones: anexo.observaciones || '',
                            // Las fechas de vigencia ya vienen separadas del servidor
                            vigencia_desde: anexo.vigencia_desde || '',
                            vigencia_hasta: anexo.vigencia_hasta || ''
                        };
                    });
                    
                    console.log("Anexos procesados:", anexosProcesados);
                    console.log(`✅ Se cargaron ${anexosProcesados.length} anexos para el programa ${data.id_programa}`);
                    
                    setAnexos(anexosProcesados || []);
                } else {
                    console.warn('No se pudieron obtener los anexos:', response.data);
                    setAnexos([]); // Establecer un array vacío en caso de error
                }
            } catch (error) {
                console.error('Error al obtener los anexos:', error);
                setAnexos([]); // Establecer un array vacío en caso de error
            }
        };
        

        useEffect(() => {
            if (data.id_programa) {
                fetchAnexos();
            }
        }, [data.id_programa]);

        // Recargar cuando cambie el trigger
        useEffect(() => {
            if (reloadTrigger && data.id_programa) {
                console.log('Recargando anexos por trigger...');
                fetchAnexos();
                // Reset del trigger después de la recarga
                setReloadAnexos(false);
            }
        }, [reloadTrigger]);
        
        const handleEdit = (anexo) => {
          setEditingId(anexo.id);
          setEditedAnexo({ 
            ...anexo,
            // Asegurar consistencia en los nombres de campos
            idEscenario: anexo.id_escenario || anexo.idEscenario
          });
        };
      
        const handleSave = async (id) => {
            try {
              console.log('=== DATOS ANTES DE ENVIAR ===');
              console.log('editedAnexo:', editedAnexo);
              console.log('ID del anexo:', id);
              
              // Preparar los datos con verificación de campos
              const updateData = [
                editedAnexo.id,
                editedAnexo.id_programa,
                editedAnexo.idEscenario || editedAnexo.id_escenario, // Usar idEscenario como campo consistente
                editedAnexo.nombre,
                editedAnexo.url,
                editedAnexo.estado,
                editedAnexo.tipo,
                formatearFechaParaHoja(editedAnexo.vigencia_desde), // vigencia desde en formato DD/MM/AAAA
                formatearFechaParaHoja(editedAnexo.vigencia_hasta), // vigencia hasta en formato DD/MM/AAAA
                editedAnexo.version,
                editedAnexo.proceso_calidad,
                editedAnexo.cierre,
                editedAnexo.observaciones
              ];
              
              console.log('updateData formateada:', updateData);
              console.log('==============================');
              
              await axios.post('https://siac-server.vercel.app/updateAnexo', {
                id,
                sheetName: 'ANEXOS_TEC',
                updateData
              });
              
              console.log('✅ Anexo actualizado correctamente');
              setEditingId(null);
              setEditedAnexo({});
              await fetchAnexos();
            } catch (error) {
              console.error('❌ Error al guardar el anexo:', error);
              console.error('Respuesta del servidor:', error.response?.data);
            }
        };
          
      
        const handleDelete = async (id) => {
            try {
                console.log("Eliminando anexo con ID:", id);  // Verifica que el ID sea el correcto
                const response = await axios.post('https://siac-server.vercel.app/deleteAnexo', { 
                    id,
                    sheetName: 'ANEXOS_TEC'
                });
                
                if (response.status === 200) {
                    setAnexos(anexos.filter(anexo => anexo.id !== id));
                    await fetchAnexos();
                    console.log('Anexo eliminado correctamente');
                } else {
                    console.error('Error al eliminar el anexo:', response.statusText);
                }
            } catch (error) {
                console.error('Error al eliminar el anexo:', error);
            }
        };
        
          
      
        const handleChange = (e) => {
          const { name, value } = e.target;
          setEditedAnexo({
            ...editedAnexo,
            [name]: value
          });
        };

        const formatFecha = (fecha) => {
            if (!fecha) return "No definida";
            const date = new Date(fecha);
            return date.toLocaleDateString('es-ES'); // Esto mostrará la fecha en formato 'DD/MM/YYYY'
        };
        
      
        return (
            <Box sx={{ width: '100%', marginTop: 2 }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Escenario de Práctica</TableCell>
                                <TableCell>URL</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Vigencia Desde</TableCell>
                                <TableCell>Vigencia Hasta</TableCell>
                                <TableCell>Versión</TableCell>
                                <TableCell>Proceso de Calidad</TableCell>
                                <TableCell>Cierre</TableCell>
                                <TableCell>Observaciones</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {anexos.map((anexo) => (
                                <TableRow key={anexo.id} hover>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <FormControl fullWidth>
                                                <Select
                                                    name="idEscenario"
                                                    value={editedAnexo.idEscenario || ''}
                                                    onChange={(e) => {
                                                        const selectedId = e.target.value;
                                                        const selectedScenario = filtro14Data.find(item => item.id === selectedId);
                                                        setEditedAnexo({
                                                            ...editedAnexo,
                                                            idEscenario: selectedId,
                                                            id_escenario: selectedId, // Mantener ambos campos por compatibilidad
                                                            nombre: selectedScenario ? selectedScenario.nombre : ''
                                                        });
                                                    }}
                                                >
                                                                                {(filtro14Data && Array.isArray(filtro14Data) ? filtro14Data : []).map((item) => item && (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.nombre}
                                </MenuItem>
                            ))}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            anexo.nombre // Muestra el nombre del escenario cuando no está en edición
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <TextField name="url" value={editedAnexo.url || ''} onChange={(e) => setEditedAnexo({ ...editedAnexo, url: e.target.value })} />
                                        ) : (
                                            anexo.url || ''
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <RadioGroup
                                                name="estado"
                                                value={editedAnexo.estado || 'Pendiente'}
                                                onChange={(e) => setEditedAnexo({ ...editedAnexo, estado: e.target.value })}
                                                sx={{ display: 'flex', flexDirection: 'row' }}
                                            >
                                                <FormControlLabel value="Pendiente" control={<Radio />} label="Pendiente" />
                                                <FormControlLabel value="En proceso" control={<Radio />} label="En proceso" />
                                                <FormControlLabel value="Listo" control={<Radio />} label="Listo" />
                                                <FormControlLabel value="Inactivo" control={<Radio />} label="Inactivo" />
                                            </RadioGroup>
                                        ) : (
                                            anexo.estado || 'Pendiente'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <FormControl fullWidth>
                                                <Select
                                                    name="tipo"
                                                    value={editedAnexo.tipo || ''}
                                                    onChange={(e) => setEditedAnexo({ ...editedAnexo, tipo: e.target.value })}
                                                    size="small"
                                                >
                                                    <MenuItem value="C.D.S. Clinicos">C.D.S. Clinicos</MenuItem>
                                                    <MenuItem value="C.D.S. No clinicos">C.D.S. No clinicos</MenuItem>
                                                    <MenuItem value="C. Integración de propiedad">C. Integración de propiedad</MenuItem>
                                                    <MenuItem value="C. Interinstitucionales">C. Interinstitucionales</MenuItem>
                                                    <MenuItem value="C. Cooperación Académica">C. Cooperación Académica</MenuItem>
                                                    <MenuItem value="OtroSi">OtroSi</MenuItem>
                                                    <MenuItem value="Otros Anexos Técnicos">Otros Anexos Técnicos</MenuItem>
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            anexo.tipo || ""
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <TextField
                                                name="vigencia_desde"
                                                type="date"
                                                label="Vigencia Desde"
                                                value={convertirFechaParaInput(editedAnexo.vigencia_desde) || ''}
                                                onChange={(e) => setEditedAnexo({ ...editedAnexo, vigencia_desde: e.target.value })}
                                                fullWidth
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{ minWidth: 150 }}
                                            />
                                        ) : (
                                            anexo.vigencia_desde || "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <TextField
                                                name="vigencia_hasta"
                                                type="date"
                                                label="Vigencia Hasta"
                                                value={convertirFechaParaInput(editedAnexo.vigencia_hasta) || ''}
                                                onChange={(e) => setEditedAnexo({ ...editedAnexo, vigencia_hasta: e.target.value })}
                                                fullWidth
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{ minWidth: 150 }}
                                            />
                                        ) : (
                                            anexo.vigencia_hasta || "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <TextField
                                                name="version"
                                                type="number"
                                                label="Versión"
                                                placeholder="Ej: 1"
                                                value={editedAnexo.version || ''}
                                                onChange={(e) => setEditedAnexo({ ...editedAnexo, version: e.target.value })}
                                                fullWidth
                                                inputProps={{ min: 1, step: 1 }}
                                                sx={{ minWidth: 100 }}
                                            />
                                        ) : (
                                            anexo.version || "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <FormControl fullWidth sx={{ minWidth: 120 }}>
                                                <InputLabel id="proceso-calidad-edit-label">Proceso de Calidad</InputLabel>
                                                <Select
                                                    labelId="proceso-calidad-edit-label"
                                                    name="proceso_calidad"
                                                    value={editedAnexo.proceso_calidad || ''}
                                                    onChange={(e) => setEditedAnexo({ ...editedAnexo, proceso_calidad: e.target.value })}
                                                    label="Proceso de Calidad"
                                                >
                                                    <MenuItem value="RC">RC</MenuItem>
                                                    <MenuItem value="RRC">RRC</MenuItem>
                                                    <MenuItem value="AAC">AAC</MenuItem>
                                                    <MenuItem value="RAAC">RAAC</MenuItem>
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            anexo.proceso_calidad || "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <TextField
                                                name="cierre"
                                                label="Cierre"
                                                placeholder="Opcional"
                                                value={editedAnexo.cierre || ''}
                                                onChange={(e) => setEditedAnexo({ ...editedAnexo, cierre: e.target.value })}
                                                fullWidth
                                                sx={{ minWidth: 120 }}
                                            />
                                        ) : (
                                            anexo.cierre || "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            editedAnexo.estado === 'Inactivo' ? (
                                                <TextField
                                                    name="observaciones"
                                                    label="Observaciones"
                                                    placeholder="Escriba las observaciones aquí..."
                                                    value={editedAnexo.observaciones || ''}
                                                    onChange={(e) => setEditedAnexo({ ...editedAnexo, observaciones: e.target.value })}
                                                    multiline
                                                    rows={3}
                                                    fullWidth
                                                    sx={{ minWidth: 200 }}
                                                />
                                            ) : (
                                                <TextField
                                                    name="observaciones"
                                                    label="Observaciones"
                                                    placeholder="N/A - Solo para estado Inactivo"
                                                    value=""
                                                    disabled
                                                    fullWidth
                                                    sx={{ minWidth: 200 }}
                                                />
                                            )
                                        ) : (
                                            anexo.estado === 'Inactivo' ? (anexo.observaciones || "-") : "N/A"
                                        )}
                                    </TableCell>    
                                    <TableCell>
                                        {editingId === anexo.id ? (
                                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                <Button 
                                                    variant="contained" 
                                                    color="success" 
                                                    size="small"
                                                    onClick={() => handleSave(anexo.id)}
                                                    sx={{ minWidth: 80 }}
                                                >
                                                    Guardar
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    color="secondary" 
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditedAnexo({});
                                                    }}
                                                    sx={{ minWidth: 80 }}
                                                >
                                                    Cancelar
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                <Button 
                                                    variant="outlined" 
                                                    color="primary" 
                                                    size="small"
                                                    onClick={() => handleEdit(anexo)}
                                                    sx={{ minWidth: 80 }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    color="error" 
                                                    size="small"
                                                    onClick={() => handleDelete(anexo.id)}
                                                    sx={{ minWidth: 80 }}
                                                >
                                                    Eliminar
                                                </Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };
    
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: '20px' }}>
                <h2>Escenarios de Practica</h2>
            </div>
            <div>
                <div style={{ marginTop: "20px" }}>
                    {(filteredData && Array.isArray(filteredData) ? filteredData : []).map((asignatura, index) => asignatura && (
                        <div key={asignatura.id}>
                            <CollapsibleButton
                                buttonText={`${asignatura.asignatura} (${asignatura.horas_presencial} horas presenciales)`}
                                content={
                                    <>
                                        <div style={{ marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                            Total horas en todos los Escenarios: {calculateTotalHoras(data.id_programa, asignatura.id)}
                                        </div>
                                        {(filtro15Data && Array.isArray(filtro15Data) ? filtro15Data : []).filter(f15 => f15 && f15.id_programa === data.id_programa && f15.id_asignatura === asignatura.id).map((f15, idx) => (
                                            <Box key={idx} sx={{ marginBottom: '20px', marginTop: '10px' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                    <Box sx={{ width: '30%', padding: '20px', marginLeft: '20px', textAlign: 'center' }}>
                                                        {/* {tienePermisoDirector() && (
                                                            <> */}
                                                                <div>
                                                                    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
                                                                        Semanas a Rotar: {f15.semana_rotar}
                                                                    </Typography>
                                                                    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
                                                                        Horas Semanal: {f15.horas_semanales}
                                                                    </Typography>
                                                                    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
                                                                        Total Horas: {f15.total_horas}
                                                                    </Typography>
                                                                </div>
                                                            {/* </>
                                                        )} */}
                                                        <FormGroup>
                                                            <FormControl fullWidth>
                                                                <InputLabel htmlFor={`filtro14-${index}-${idx}`}>Escenario</InputLabel>
                                                                <Select
                                                                    id={`filtro14-${index}-${idx}`}
                                                                    value={filtro14Data.find(item => item.id === f15.id_escenario)?.nombre || ''}
                                                                    disabled
                                                                >
                                                                                                                                            {(filtro14Data && Array.isArray(filtro14Data) ? filtro14Data : []).map(item => item && (
                                                                            <MenuItem key={item.id} value={item.nombre}>{item.nombre}</MenuItem>
                                                                        ))}
                                                                </Select>
                                                            </FormControl>
                                                        </FormGroup>
                                                    </Box>
                                                    <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <div style={{ marginBottom: '13px', marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                                                            <TableContainer component={Paper} style={{
                                                                width: 'fit-content',
                                                                backgroundColor: totalHorasRotacion === parseInt(asignatura.horas_presencial, 10) ? '#d4f4dd' : 'white',
                                                                border: totalHorasRotacion === parseInt(asignatura.horas_presencial, 10) ? '2px solid #3a6f41' : '1px solid black'
                                                            }}>
                                                                <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell style={{ padding: '6px', textAlign: 'center' }}>Hora</TableCell>
                                                                            {[...Array(15).keys()].map((hour) => (
                                                                                <TableCell key={hour} style={{ padding: '6px', textAlign: 'center' }}>{`${6 + hour}:00`}</TableCell>
                                                                            ))}
                                                                            <TableCell style={{ padding: '6px', textAlign: 'center' }}>Total</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    {renderHorario(getHorario(f15.id))}
                                                                </Table>
                                                            </TableContainer>
                                                        </div>
                                                    </Box>
                                                </Box>
                                                <hr/>
                                            </Box>
                                        ))}
                                        {newScenario && (
                                            <>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                    <Box sx={{ width: '30%', padding: '20px', marginLeft: '20px', textAlign: 'center' }}>
                                                        {tienePermisoDirector() && (
                                                            <>
                                                                <TextField
                                                                    label="Semanas a Rotar"
                                                                    variant="outlined"
                                                                    value={asignaturaSemanasRotar}
                                                                    onChange={(e) => handleInputChange(e.target.value)}
                                                                    style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}
                                                                />
                                                            </>
                                                        )}
                                                        <form onSubmit={handleScenarioSubmit}>
                                                            <FormGroup>
                                                                <FormControl fullWidth>
                                                                    <InputLabel htmlFor={`filtro14-${index}`}>Seleccionar Escenario</InputLabel>
                                                                    <Select
                                                                        id={`filtro14-${index}`}
                                                                        value={selectedFiltro14Id}
                                                                        onChange={(e) => setSelectedFiltro14Id(e.target.value)}
                                                                    >
                                                                        {(filtro14Data && Array.isArray(filtro14Data) ? filtro14Data : []).map(item => item && (
                                                                            <MenuItem key={item.id} value={item.nombre}>{item.nombre}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </FormGroup>
                                                            <Button type="submit" variant="contained" sx={{ marginTop: '15px', alignSelf: 'center' }}>Guardar Escenario</Button>
                                                        </form>
                                                    </Box>
                                                    <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <div style={{ marginBottom: '13px', marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                                                            <TableContainer component={Paper} style={{
                                                                width: 'fit-content',
                                                                backgroundColor: totalHorasRotacion === parseInt(asignatura.horas_presencial, 10) ? '#d4f4dd' : 'white',
                                                                border: totalHorasRotacion === parseInt(asignatura.horas_presencial, 10) ? '2px solid #3a6f41' : '1px solid black'
                                                            }}>
                                                                <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell style={{ padding: '6px', textAlign: 'center' }}>Hora</TableCell>
                                                                            {[...Array(15).keys()].map((hour) => (
                                                                                <TableCell key={hour} style={{ padding: '6px', textAlign: 'center' }}>{`${6 + hour}:00`}</TableCell>
                                                                            ))}
                                                                            <TableCell style={{ padding: '6px', textAlign: 'center' }}>Total</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day, index) => (
                                                                            <TableRow key={index}>
                                                                                <TableCell style={{ padding: '6px', textAlign: 'center' }}>{day}</TableCell>
                                                                                {[...Array(15).keys()].map((hour) => (
                                                                                    <TableCell key={`${day}-${hour}`} style={{ padding: '6px', textAlign: 'center' }}>
                                                                                        <Checkbox
                                                                                            style={{ padding: '5px' }}
                                                                                            checked={horasPorDia[day]?.includes(`${hour + 6}:00`)}
                                                                                            onChange={(e) => handleCheck(day, `${hour + 6}:00`, e.target.checked)}
                                                                                        />
                                                                                    </TableCell>
                                                                                ))}
                                                                                <TableCell style={{ padding: '6px', textAlign: 'center' }}>
                                                                                    {horasPorDia[day]?.length || 0}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                        <TableRow>
                                                                            <TableCell colSpan={15} style={{ padding: '6px', textAlign: 'left', fontSize: '20px' }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                    <span>Total horas semanales: {totalHorasSemanal}</span>
                                                                                    {tienePermisoDirector() && (
                                                                                        <span>Total horas rotación: {totalHorasRotacion}</span>
                                                                                    )}
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </div>
                                                        <form onSubmit={handleScheduleSubmit} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                            <Button type="submit" variant="contained" sx={{ marginBottom: '15px' }}>Guardar Horario</Button>
                                                        </form>
                                                    </Box>
                                                </Box>
                                            </>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom:'30px' }}>
                                            <Button variant="contained" onClick={toggleForm}>Añadir escenario de práctica</Button>
                                        </div>
                                    </>
                                }
                                defaultClosed
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* Sección de Solicitud de Práctica oculta
            <div style={{ marginTop: "20px", marginBottom:"20px" }}>
                <Button variant="contained" onClick={togglePracticeForm}>
                    Solicitud de Práctica
                </Button>

                {showPracticeForm && (
                    <Box component="form" onSubmit={handlePracticeFormSubmit} sx={{ marginTop: 2 }}>
                        <FormGroup>
                            <TextField
                                label="Nombre de Rotación"
                                name="nombrerotacion"
                                value={practiceFormData.nombrerotacion}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="No. de Estudiantes"
                                name="numeroestudiantes"
                                value={practiceFormData.numeroestudiantes}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="No. Horas y Semanas a Rotar"
                                name="horassemanas"
                                value={practiceFormData.horassemanas}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Docentes"
                                name="docentes"
                                value={practiceFormData.docentes}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Servicios"
                                name="servicios"
                                value={practiceFormData.servicios}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Intensidad Horaria"
                                name="intensidadhoraria"
                                value={practiceFormData.intensidadhoraria}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                        </FormGroup>
                        <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>
                            Guardar
                        </Button>
                    </Box>
                )}

                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre de Rotación</TableCell>
                                <TableCell>Número de Estudiantes</TableCell>
                                <TableCell>Horas por Semana</TableCell>
                                <TableCell>Docentes</TableCell>
                                <TableCell>Servicios</TableCell>
                                <TableCell>Intensidad Horaria</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {practiceTables.map((practice) => (
                                <TableRow key={practice.id}>
                                    <TableCell>
                                        {editingId === practice.id ? (
                                            <TextField
                                                name="nombrerotacion"
                                                value={editedPractice.nombrerotacion}
                                                onChange={(e) => setEditedPractice({ ...editedPractice, nombrerotacion: e.target.value })}
                                            />
                                        ) : (
                                            practice.nombrerotacion
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === practice.id ? (
                                            <TextField
                                                name="numeroestudiantes"
                                                value={editedPractice.numeroestudiantes}
                                                onChange={(e) => setEditedPractice({ ...editedPractice, numeroestudiantes: e.target.value })}
                                            />
                                        ) : (
                                            practice.numeroestudiantes
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === practice.id ? (
                                            <TextField
                                                name="horassemanas"
                                                value={editedPractice.horassemanas}
                                                onChange={(e) => setEditedPractice({ ...editedPractice, horassemanas: e.target.value })}
                                            />
                                        ) : (
                                            practice.horassemanas
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === practice.id ? (
                                            <TextField
                                                name="docentes"
                                                value={editedPractice.docentes}
                                                onChange={(e) => setEditedPractice({ ...editedPractice, docentes: e.target.value })}
                                            />
                                        ) : (
                                            practice.docentes
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === practice.id ? (
                                            <TextField
                                                name="servicios"
                                                value={editedPractice.servicios}
                                                onChange={(e) => setEditedPractice({ ...editedPractice, servicios: e.target.value })}
                                            />
                                        ) : (
                                            practice.servicios
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === practice.id ? (
                                            <TextField
                                                name="intensidadhoraria"
                                                value={editedPractice.intensidadhoraria}
                                                onChange={(e) => setEditedPractice({ ...editedPractice, intensidadhoraria: e.target.value })}
                                            />
                                        ) : (
                                            practice.intensidadhoraria
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === practice.id ? (
                                            <Button onClick={() => handleSave(practice.id)}>Guardar</Button>
                                        ) : (
                                            <Button onClick={() => handleEdit(practice)}>Editar</Button>
                                        )}
                                        <Button onClick={() => handleDelete(practice.id)}>Eliminar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            */}

            <div style={{ marginTop: "20px", marginBottom: "40px" }}>
                <Button variant="contained" onClick={toggleAnexoForm}>
                Añadir Anexo
                </Button>

                {showAnexoForm && (
                <Box component="form" onSubmit={handleAnexoFormSubmit} sx={{ marginTop: 2 }}>
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
                                    label="Programas Académicos"
                                    placeholder="Buscar y seleccionar programas académicos..."
                                    margin="normal"
                                    fullWidth
                                    helperText="Puedes seleccionar múltiples programas académicos. El programa actual está preseleccionado."
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

                        <FormControl fullWidth>
                            <InputLabel id="escenarios-label">Escenarios de Práctica</InputLabel>
                            <Select
                                labelId="escenarios-label"
                                id="escenarios-select"
                                name="idEscenario" // Esto permite que `handleAnexoInputChange` lo reconozca
                                value={anexoFormData.idEscenario}
                                onChange={handleAnexoInputChange} // La misma función maneja todos los cambios
                                required
                            >
                                                                                                {(filtro14Data && Array.isArray(filtro14Data) ? filtro14Data : []).map((item) => item && (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.nombre}
                                                                    </MenuItem>
                                                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="URL/Archivo"
                            name="urlAnexo"
                            value={anexoFormData.urlAnexo}
                            onChange={handleAnexoInputChange}
                            margin="normal"
                            required
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
                    <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>
                        Guardar Anexo
                    </Button>
                </Box>
                )}
                <AnexosTable reloadTrigger={reloadAnexos} />
            </div>

            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={saving}>
                <CircularProgress color="inherit" />
            </Backdrop>

        </>
    );
};

export default PracticeScenario;