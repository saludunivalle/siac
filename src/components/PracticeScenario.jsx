import React, { useState, useEffect } from 'react';
import { Button, MenuItem, Select, TextField, FormGroup, FormControl, InputLabel, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, CircularProgress, Backdrop, Typography, RadioGroup, FormControlLabel, Radio, FormLabel } from '@mui/material';
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
    

    useEffect(() => {
        if (data.id_programa) {
            fetchPractices();
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
                setFilteredData(data13.filter(asignatura => asignatura.id_programa === data.id_programa));
                setFiltro14Data(data14);
                setFiltro15Data(data15);
                setFiltro16Data(data16);
                const lastIdRel = data15.length > 0 ? Math.max(...data15.map(item => item.id)) : 0;
                setRelationId(lastIdRel + 1);
                console.log('Datos cargados:', { data13, data14, data15, data16 });
                console.log('Contenido de filtro16Data:', data16);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
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
            const selectedFiltro14 = filtro14Data.find(item => item.nombre === selectedFiltro14Id);

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
        const filteredData = filtro15Data.filter(item => item.id_programa === id_programa && item.id_asignatura === id_asignatura);
        const totalHoras = filteredData.reduce((total, item) => {
            const horas = parseInt(item.total_horas, 10);
            return isNaN(horas) ? total : total + horas;
        }, 0);

        return totalHoras;
    };

    //Función para obtener el horario
    const getHorario = (relationID) => {
        console.log('Buscando horario para relationID:', relationID);
        const horarioData = filtro16Data.find(item => item.id_relacion === relationID);
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
        idEscenario: '', // Guardará el ID del escenario seleccionado
        nombreEscenario: '', // Guardará el nombre del escenario
        urlAnexo: '',
        estadoAnexo: 'Pendiente',
        fechaFormalizacion: null // Guardará la fecha seleccionada
    });
    
    
    const [anexosList, setAnexosList] = useState([]);

    // Obtener los anexos actuales de la hoja ANEXOS_TEC
    const toggleAnexoForm = () => {
        setShowAnexoForm(!showAnexoForm);
    };

    const handleAnexoInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'idEscenario') {
            // Obtener el nombre del escenario seleccionado
            const selectedScenario = filtro14Data.find(item => item.id === value);
            
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
    
    // Manejar el envío del formulario de anexos
    const handleAnexoFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!anexoFormData.idEscenario || !anexoFormData.nombreEscenario) {
                alert('Por favor selecciona un escenario de práctica válido.');
                return;
            }
    
            if (!anexoFormData.fechaFormalizacion) {
                alert('Por favor selecciona una fecha válida.');
                return;
            }
    
            const newAnexo = {
                id: anexosList.length + 1, // id generado localmente
                id_programa: data.id_programa, // id del programa
                idEscenario: anexoFormData.idEscenario, // id del escenario
                nombre: anexoFormData.nombreEscenario, // nombre del escenario
                url: anexoFormData.urlAnexo, // URL del anexo o archivo
                estado: anexoFormData.estadoAnexo, // estado del anexo (Pendiente, En proceso, Listo)
                fecha_formalización: anexoFormData.fechaFormalizacion // fecha de formalización
            };
    
            // Verificar los datos a enviar
            console.log("Datos del nuevo anexo:", newAnexo);
    
            // Enviar los datos a la hoja de cálculo
            await sendAnexoToSheet(newAnexo);
    
            // Actualizar la lista de anexos en el estado local
            setAnexosList([...anexosList, newAnexo]);
    
            // Reiniciar el formulario
            setAnexoFormData({
                idEscenario: '',
                nombreEscenario: '',
                urlAnexo: '',
                estadoAnexo: 'Pendiente',
                fechaFormalizacion: null
            });
            setShowAnexoForm(false);
        } catch (error) {
            console.error('Error al guardar el anexo:', error);
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
                    anexo.fecha_formalización // fecha de formalización
                ]
            ];
    
            console.log("Datos enviados al servidor:", insertData); // DEBUG: Verificar la estructura antes de enviar
    
            // Especificar el nombre de la hoja de cálculo
            const sheetName = 'ANEXOS_TEC';
    
            // Hacer la solicitud POST al servidor con los datos y el nombre de la hoja
            const response = await axios.post('https://siac-server.vercel.app/sendDocServ', {
                insertData,
                sheetName
            });
    
            if (response.status === 200) {
                console.log('Anexo guardado correctamente en la hoja:', response.data);
            } else {
                console.error('Error al guardar el anexo en la hoja:', response.statusText);
            }
        } catch (error) {
            console.error('Error al enviar el anexo al servidor:', error);
        }
    };
    
    // Función para la tabla de anexos
    const AnexosTable = () => {
        const [anexos, setAnexos] = useState([]);
        const [editingId, setEditingId] = useState(null);
        const [editedAnexo, setEditedAnexo] = useState({});
      
        const fetchAnexos = async () => {
            try {
                const response = await axios.post('https://siac-server.vercel.app/getAnexos', { sheetName: 'ANEXOS_TEC' });
                if (response.data.status) {
                    console.log("Datos obtenidos del servidor:", response.data.data); // Verificar los datos obtenidos
                    setAnexos(response.data.data);
                } else {
                    console.error('Error en la respuesta del servidor:', response.data);
                }
            } catch (error) {
                console.error('Error al obtener los anexos:', error);
            }
        };
        

        useEffect(() => {
            fetchAnexos();
        }, []);
        
        const handleEdit = (anexo) => {
          setEditingId(anexo.id);
          setEditedAnexo(anexo);
        };
      
        const handleSave = async (id) => {
            try {
              await axios.post('https://siac-server.vercel.app/updateAnexo', {
                id,
                updateData: [
                  editedAnexo.id,
                  editedAnexo.id_programa,
                  editedAnexo.id_escenario,
                  editedAnexo.nombre, // Asegúrate de que estos campos sean correctos
                  editedAnexo.url,
                  editedAnexo.estado,
                  editedAnexo.fecha_formalización
                ]
              });
              setEditingId(null);
              setEditedAnexo({});
              await fetchAnexos();
            } catch (error) {
              console.error('Error al guardar el anexo:', error);
            }
        };
          
      
        const handleDelete = async (id) => {
            try {
                console.log("Eliminando anexo con ID:", id);  // Verifica que el ID sea el correcto
                const response = await axios.post('https://siac-server.vercel.app/deleteAnexo', { id });
                
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Escenario de Práctica</TableCell>
                            <TableCell>URL</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha Formalización</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {anexos.map((anexo) => (
                            <TableRow key={anexo.id}>
                                <TableCell>
                                    {editingId === anexo.id ? (
                                        <FormControl fullWidth>
                                            <Select
                                                name="idEscenario"
                                                value={editedAnexo.idEscenario}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    const selectedScenario = filtro14Data.find(item => item.id === selectedId);
                                                    setEditedAnexo({
                                                        ...editedAnexo,
                                                        idEscenario: selectedId,
                                                        nombre: selectedScenario ? selectedScenario.nombre : ''
                                                    });
                                                }}
                                            >
                                                {filtro14Data.map((item) => (
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
                                        <TextField name="url" value={editedAnexo.url} onChange={(e) => setEditedAnexo({ ...editedAnexo, url: e.target.value })} />
                                    ) : (
                                        anexo.url
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === anexo.id ? (
                                        <RadioGroup
                                            name="estado"
                                            value={editedAnexo.estado}
                                            onChange={(e) => setEditedAnexo({ ...editedAnexo, estado: e.target.value })}
                                            sx={{ display: 'flex', flexDirection: 'row' }}
                                        >
                                            <FormControlLabel value="Pendiente" control={<Radio />} label="Pendiente" />
                                            <FormControlLabel value="En proceso" control={<Radio />} label="En proceso" />
                                            <FormControlLabel value="Listo" control={<Radio />} label="Listo" />
                                        </RadioGroup>
                                    ) : (
                                        anexo.estado
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === anexo.id ? (
                                        <TextField
                                            name="fecha_formalización"
                                            type="date"
                                            value={editedAnexo.fecha_formalización}
                                            onChange={(e) => setEditedAnexo({ ...editedAnexo, fecha_formalización: e.target.value })}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    ) : (
                                        anexo.fecha_formalización || "No definida"
                                    )}
                                </TableCell>    
                                <TableCell>
                                    {editingId === anexo.id ? (
                                        <Button onClick={() => handleSave(anexo.id)}>Guardar</Button>
                                    ) : (
                                        <Button onClick={() => handleEdit(anexo)}>Editar</Button>
                                    )}
                                    <Button onClick={() => handleDelete(anexo.id)}>Eliminar</Button>
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
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: '20px' }}>
                <h2>Escenarios de Practica</h2>
            </div>
            <div>
                <div style={{ marginTop: "20px" }}>
                    {filteredData.map((asignatura, index) => (
                        <div key={asignatura.id}>
                            <CollapsibleButton
                                buttonText={`${asignatura.asignatura} (${asignatura.horas_presencial} horas presenciales)`}
                                content={
                                    <>
                                        <div style={{ marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                            Total horas en todos los Escenarios: {calculateTotalHoras(data.id_programa, asignatura.id)}
                                        </div>
                                        {filtro15Data.filter(f15 => f15.id_programa === data.id_programa && f15.id_asignatura === asignatura.id).map((f15, idx) => (
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
                                                                    {filtro14Data.map(item => (
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
                                                                        {filtro14Data.map(item => (
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

            <div style={{ marginTop: "20px", marginBottom: "40px" }}>
                <Button variant="contained" onClick={toggleAnexoForm}>
                Añadir Anexo
                </Button>

                {showAnexoForm && (
                <Box component="form" onSubmit={handleAnexoFormSubmit} sx={{ marginTop: 2 }}>
                    <FormGroup>
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
                                {filtro14Data.map((item) => (
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
                        <TextField
                            label="Fecha de Formalización"
                            name="fechaFormalizacion"
                            type="date"
                            value={anexoFormData.fechaFormalizacion}
                            onChange={handleAnexoInputChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            margin="normal"
                            required
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
                            </RadioGroup>
                        </FormGroup>
                    </FormGroup>
                    <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>
                        Guardar Anexo
                    </Button>
                </Box>
                )}
                <AnexosTable />
            </div>

            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={saving}>
                <CircularProgress color="inherit" />
            </Backdrop>

        </>
    );
};

export default PracticeScenario;