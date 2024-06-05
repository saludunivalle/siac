import React, { useState, useEffect } from 'react';
import { Button, MenuItem, Select, TextField, FormGroup, FormControl, InputLabel, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import { Filtro13, Filtro14, Filtro15, sendDataRelEscPract, sendDataHorariosPract } from '../service/data';
import '/src/styles/home.css';
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

    useEffect(() => {
        const fetchLastId = async () => {
            try {
                const data14 = await Filtro14();
                setFiltro14Data(data14);

                const data15 = await Filtro15();
                setFiltro15Data(data15);

                const lastIdRel = data15.length > 0 ? Math.max(...data15.map(item => item.id)) : 0;
                const newRelationId = lastIdRel + 1;
                setRelationId(newRelationId);
            } catch (error) {
                console.error('Error al obtener el último ID:', error);
            }
        };

        fetchLastId();
    }, []);

    //Permisos

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

    const toggleForm = (index, idAsignatura) => {
        setShowForm(showForm === index ? null : index);
        setIdAsignatura(idAsignatura); 
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

            // Calcular el total de horas de rotación
            const totalHorasRotacion = totalHorasSemanal * (asignaturaSemanasRotar ? parseInt(asignaturaSemanasRotar) : 0);
            setTotalHorasRotacion(totalHorasRotacion);

            return horasPorDiaCopy;
        });
    };

    useEffect(() => {
        handleSubmit();
    }, []);

    const handleSubmit = async () => {
        try {
            const filtroData = await Filtro13();
            const filteredAssignments = filtroData.filter(asignatura => asignatura.id_programa === data.id_programa);
            setFilteredData(filteredAssignments);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
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

            await sendDataRelEscPract(dataSendRel);
            await sendDataHorariosPract(dataSendHor);

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
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }
    };

    const handleInputChange = (value) => {
        setAsignaturaSemanasRotar(value);
        // Calcular el total de horas de rotación
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
                                buttonText={asignatura.asignatura}
                                content={
                                    <>
                                        <div style={{ marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                            Total horas en todos los Escenarios: {calculateTotalHoras(data.id_programa, asignatura.id)}
                                        </div>
                                        <div style={{ marginTop: '10px', marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                                            <Button variant="contained" onClick={() => toggleForm(index, asignatura.id)}>
                                                Añadir escenario de práctica
                                            </Button>
                                        </div>
                                        {showForm === index && (
                                            <>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                    <Box sx={{ width: '30%', padding: '20px', marginLeft: '20px' }}>
                                                        {tienePermisoConvenio() && (
                                                            <>
                                                                <div style={{ margin: '20px', color: 'black' }}>Horas Presenciales: {asignatura.horas_presencial}</div>
                                                                <hr />
                                                            </>
                                                        )}
                                                        {tienePermisoDirector() && (
                                                            <>
                                                                <TextField
                                                                    label="Semanas a Rotar"
                                                                    variant="outlined"
                                                                    value={asignaturaSemanasRotar}
                                                                    onChange={(e) => handleInputChange(e.target.value)}
                                                                    style={{ marginTop: '20px', marginBottom: '20px' }}
                                                                />
                                                                <hr />
                                                            </>
                                                        )}
                                                        <form onSubmit={handleFormSubmit}>
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
                                                        </form>
                                                    </Box>
                                                    <Box sx={{ width: '70%' }}>
                                                        <div style={{ marginBottom: '30px', marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                                                            <TableContainer component={Paper} style={{ width: 'fit-content' }}>
                                                                <Table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
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
                                                                                            checked={horasPorDia[day].includes(`${hour + 6}:00`)}
                                                                                            onChange={(e) => handleCheck(day, `${hour + 6}:00`, e.target.checked)}
                                                                                        />
                                                                                    </TableCell>
                                                                                ))}
                                                                                <TableCell style={{ padding: '6px', textAlign: 'center' }}>
                                                                                    {horasPorDia[day].length}
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
                                                    </Box>
                                                </Box>
                                                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                                    <Button onClick={handleFormSubmit} type="submit" variant="contained" sx={{ marginTop: '10px', width: '100px', margin: 'auto' }}>Enviar</Button>
                                                </div>
                                            </>
                                        )}
                                        <hr />
                                    </>
                                }
                                defaultClosed
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default PracticeScenario;
