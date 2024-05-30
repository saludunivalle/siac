import React, { useState, useEffect } from 'react';
import { Button, TextField, FormGroup, FormControl, InputLabel, Input, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import { Filtro13, Filtro14, Filtro15, sendDataEscPract, sendDataHorariosPract, sendDataRelEscPract } from '../service/data';
import '/src/styles/home.css';
import CollapsibleButton from './CollapsibleButton';

const PracticeScenario = ({ data }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [showForm, setShowForm] = useState(null);
    const [relationID, setRelationId] = useState(null);
    const [idAsignatura, setIdAsignatura] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: ''
    });
    const [newId, setNewId] = useState(null);

    const [totalHorasSemanal, setTotalHorasSemanal] = useState(0);
    const [horasPorDia, setHorasPorDia] = useState({
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: []
    });

    useEffect(() => {
        const fetchLastId = async () => {
            try {
                const data = await Filtro14();
                const lastId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
                setNewId(lastId + 1);
                
                const dataRel = await Filtro15();
                const lastIdRel = dataRel.length > 0 ? Math.max(...dataRel.map(item => item.id)) : 0;
                const newRelationId = lastIdRel + 1;
                setRelationId(newRelationId);
            } catch (error) {
                console.error('Error al obtener el último ID:', error);
            }
        };

        fetchLastId();
    }, []);

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

            return horasPorDiaCopy;
        });
    };

    useEffect(() => {
        handleSubmit();
    }, []);

    const handleSubmit = async () => {
        try {
            const filtroData = await Filtro13();
            console.log('Datos recibidos del filtro:', filtroData);
            const filteredAssignments = filtroData.filter(asignatura => asignatura.id_programa === data.id_programa);
            setFilteredData(filteredAssignments);
            console.log('Asignaturas filtradas:', filteredAssignments);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };
    

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const horario = JSON.stringify(horasPorDia); 
            const dataSend = [
                newId,
                formData.nombre,
                formData.direccion,
                formData.telefono,
                //horario: horario,
            ];

            const dataSendRel = [
                relationID, 
                data.id_programa,
                idAsignatura, 
                newId, 
                totalHorasSemanal,
                //horario: horario,
            ];

            const dataSendHor = [
                relationID, 
                horario,
            ];

            await sendDataEscPract(dataSend);
            await sendDataRelEscPract(dataSendRel);
            await sendDataHorariosPract(dataSendHor);
            console.log('Datos enviados:', dataSend);
            //console.log('Datos enviados Rel:', dataSendRel);
            setFormData({
                nombre: '',
                direccion: '',
                telefono: ''
            });
            setHorasPorDia({
                lunes: [],
                martes: [],
                miercoles: [],
                jueves: [],
                viernes: []
            });
            setTotalHorasSemanal(0);
            setNewId(newId + 1);
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    return (
        <>
            <div style={{display:'flex', justifyContent:'center', width:'100%', fontSize:'20px'}}><h2>Escenarios de Practica</h2></div>
            <div>
                <div style={{marginTop:"20px"}}>
                    {filteredData.map((asignatura, index) => (
                        <div key={asignatura.id}>
                            <CollapsibleButton
                                buttonText={asignatura.asignatura}
                                content={''}
                                nestedButton={
                                    <div style={{ marginTop: '10px', marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                                        <Button variant="contained" onClick={() => toggleForm(index, asignatura.id)}>
                                            Añadir escenario de práctica
                                        </Button>
                                    </div>
                                }
                            />
                            {showForm === index && (
                                <>
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                                    <Box sx={{ width: '30%', padding:'20px', marginLeft:'20px'}}>
                                        <form onSubmit={handleFormSubmit}>
                                            <FormGroup>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor={`nombre-${index}`}>Nombre del escenario</InputLabel>
                                                    <Input id={`nombre-${index}`} name="nombre" value={formData.nombre} onChange={handleInputChange} />
                                                </FormControl>
                                                <FormControl fullWidth style={{ marginTop: '20px' }}>
                                                    <InputLabel htmlFor={`direccion-${index}`}>Dirección</InputLabel>
                                                    <Input id={`direccion-${index}`} name="direccion" value={formData.direccion} onChange={handleInputChange} />
                                                </FormControl>
                                                <FormControl fullWidth style={{ marginTop: '20px', marginBottom:'20px' }}>
                                                    <InputLabel htmlFor={`telefono-${index}`}>Teléfono</InputLabel>
                                                    <Input id={`telefono-${index}`} name="telefono" value={formData.telefono} onChange={handleInputChange} />
                                                </FormControl>
                                                <Button type="submit" variant="contained" sx={{ marginTop: '10px', width: '100px', margin: 'auto' }}>Enviar</Button>
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
                                                                <TableCell style={{ padding: '6px', textAlign: 'center' }}>Total Semana:</TableCell>
                                                                <TableCell colSpan={15} style={{ padding: '6px', textAlign: 'center' }}>
                                                                    {totalHorasSemanal}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                            </TableContainer>
                                        </div>
                                    </Box>
                                </Box>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};                              

export default PracticeScenario;
