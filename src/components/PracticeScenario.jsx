import React, { useState, useEffect } from 'react';
import { Button, MenuItem, Select, TextField, FormGroup, FormControl, InputLabel, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, CircularProgress, Backdrop, Typography } from '@mui/material';
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
    const [practiceFormData, setPracticeFormData] = useState({
        nombreRotacion: '',
        numeroEstudiantes: '',
        horasSemanas: '',
        docentes: '',
        servicios: '',
        intensidadHoraria: ''
    });
    const [practiceTables, setPracticeTables] = useState([]);

    const togglePracticeForm = () => {
        setShowPracticeForm(!showPracticeForm);
    };
    
    const handlePracticeInputChange = (e) => {
        const { name, value } = e.target;
        setPracticeFormData({
            ...practiceFormData,
            [name]: value
        });
    };
    
    const handlePracticeFormSubmit = (e) => {
        e.preventDefault();
        setPracticeTables([...practiceTables, { ...practiceFormData }]);
        setPracticeFormData({
            nombreRotacion: '',
            numeroEstudiantes: '',
            horasSemanas: '',
            docentes: '',
            servicios: '',
            intensidadHoraria: ''
        });
        setShowPracticeForm(false);
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

    const handleScenarioSubmit = async (e) => {
        e.preventDefault();
        setIsScenarioSaved(true);
        if (isScheduleSaved) {
            await handleFinalSubmit();
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setIsScheduleSaved(true);
        if (isScenarioSaved) {
            await handleFinalSubmit();
        }
    };

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

    const calculateTotalHoras = (id_programa, id_asignatura) => {
        const filteredData = filtro15Data.filter(item => item.id_programa === id_programa && item.id_asignatura === id_asignatura);
        const totalHoras = filteredData.reduce((total, item) => {
            const horas = parseInt(item.total_horas, 10);
            return isNaN(horas) ? total : total + horas;
        }, 0);

        return totalHoras;
    };

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
        nombreAnexo: '',
        urlAnexo: ''
    });
    const [anexosList, setAnexosList] = useState([]);

    const toggleAnexoForm = () => {
        setShowAnexoForm(!showAnexoForm);
    };

    const handleAnexoInputChange = (e) => {
        const { name, value } = e.target;
        setAnexoFormData({
            ...anexoFormData,
            [name]: value
        });
    };

    const handleAnexoFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const newAnexo = {
                ...anexoFormData,
                id: anexosList.length + 1,
                id_programa: data.id_programa,
                id_escenario: selectedFiltro14Id, // Usa el id del escenario seleccionado
                fecha_formalización: new Date().toISOString().split('T')[0]
            };

            // Enviar datos a la hoja de cálculo
            await sendAnexoToSheet(newAnexo);

            setAnexosList([...anexosList, newAnexo]);
            setAnexoFormData({
                nombreAnexo: '',
                urlAnexo: ''
            });
            setShowAnexoForm(false);
        } catch (error) {
            console.error('Error al guardar el anexo:', error);
        }
    };

    // Función para enviar el anexo a la hoja de cálculo
    const sendAnexoToSheet = async (anexo) => {
        // Implementar lógica de envío usando Google Sheets API o el método adecuado
        console.log('Enviando anexo a la hoja:', anexo);
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
                                                                {/* <div>
                                                                    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
                                                                        Semanas a Rotar: {f15.semana_rotar}
                                                                    </Typography>
                                                                    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
                                                                        Horas Semanal: {f15.horas_semanales}
                                                                    </Typography>
                                                                    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
                                                                        Total Horas: {f15.total_horas}
                                                                    </Typography>
                                                                </div> */}
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
                                name="nombreRotacion"
                                value={practiceFormData.nombreRotacion}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="No. de Estudiantes"
                                name="numeroEstudiantes"
                                value={practiceFormData.numeroEstudiantes}
                                onChange={handlePracticeInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="No. Horas y Semanas a Rotar"
                                name="horasSemanas"
                                value={practiceFormData.horasSemanas}
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
                                name="intensidadHoraria"
                                value={practiceFormData.intensidadHoraria}
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

                {practiceTables.map((table, index) => (
                    <TableContainer component={Paper} key={index} sx={{ marginTop: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Campo</TableCell>
                                    <TableCell>Valor</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(table).map(([key, value], i) => (
                                    <TableRow key={i}>
                                        <TableCell>{key}</TableCell>
                                        <TableCell>{value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))}
            </div>

            <div style={{ marginTop: "20px", marginBottom:"40px" }}>
                <Button variant="contained" onClick={toggleAnexoForm}>
                    Añadir Anexo
                </Button>

                {showAnexoForm && (
                    <Box component="form" onSubmit={handleAnexoFormSubmit} sx={{ marginTop: 2 }}>
                        <FormGroup>
                            <TextField
                                label="Nombre del Anexo"
                                name="nombreAnexo"
                                value={anexoFormData.nombreAnexo}
                                onChange={handleAnexoInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="URL/Archivo"
                                name="urlAnexo"
                                value={anexoFormData.urlAnexo}
                                onChange={handleAnexoInputChange}
                                margin="normal"
                                required
                            />
                        </FormGroup>
                        <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>
                            Guardar Anexo
                        </Button>
                    </Box>
                )}

                {anexosList.length > 0 && (
                    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>URL</TableCell>
                                    <TableCell>Fecha Formalización</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {anexosList.map((anexo, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{anexo.id}</TableCell>
                                        <TableCell>{anexo.nombreAnexo}</TableCell>
                                        <TableCell>{anexo.urlAnexo}</TableCell>
                                        <TableCell>{anexo.fecha_formalización}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </div>

            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={saving}>
                <CircularProgress color="inherit" />
            </Backdrop>

        </>
    );
};

export default PracticeScenario;