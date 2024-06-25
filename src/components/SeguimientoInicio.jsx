import React, { useState, useEffect } from 'react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    TextField
} from '@mui/material';
import { styled } from '@mui/system';
import Header from './Header';
import { format } from 'date-fns';
import { sendDataEscula, dataEscuelas, updateDataEscuela } from '../service/data';

const escuelas = [
    'Bacteriología y Lab. Clínico',
    'Ciencias Básicas',
    'Enfermería',
    'Medicina',
    'Odontología',
    'Rehabilitación Humana',
    'Salud Pública',
    'Dirección de Posgrados'
];

const programasBase = [
    'Anexos técnicos en consonancia con los registros calificados',
    'Número de programas académicos de la Facultad de Salud de {tipo} con registro calificado.',
    'Número de programas académicos de la Facultad de Salud de {tipo} con acreditación.',
    'Porcentaje de avance en el diseño o rediseño del plan de mejoramiento con base a las recomendaciones de los pares académicos.',
];

const StyledButton = styled(Button)(({ theme }) => ({
    marginBottom: '10px',
    padding: '10px',
    width: '100%',
    backgroundColor: '#d3d3d3',
    color: '#000',
    '&:hover': {
        backgroundColor: '#a9a9a9',
    },
    '&.active': {
        backgroundColor: '#a9a9a9',
    }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: '#d3d3d3',
    fontWeight: 'bold'
}));

const SeguimientoInicio = () => {
    const [selectedEscuela, setSelectedEscuela] = useState('');
    const [scores, setScores] = useState({});
    const [data, setData] = useState([]);
    const [selectedProgramType, setSelectedProgramType] = useState('pre');

    const handleClickOpen = (escuela) => {
        setSelectedEscuela(escuela);
        // Load descriptions for the selected school
        const escuelaData = data.find(d => d.escuela === escuela) || {};
        setScores({
            [programasBase[0]]: { descripcion: escuelaData.descripcion_1 || '' },
            [programasBase[1]]: { descripcion: escuelaData.descripcion_2 || '' },
            [programasBase[2]]: { descripcion: escuelaData.descripcion_3 || '' },
            [programasBase[3]]: { descripcion: escuelaData.descripcion_4 || '' },
        });
    };

    const handleScoreChange = (program, field, value) => {
        setScores(prevScores => ({
            ...prevScores,
            [program]: {
                ...prevScores[program],
                [field]: value
            }
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseData = await dataEscuelas();
                setData(responseData);
            } catch (error) {
                console.error('Error al cargar los datos:', error);
            }
        };

        fetchData();
    }, []);

    const getScoresForEscuela = (escuela) => {
        const escuelaData = data.find(d => d.escuela === escuela) || {};
        return {
            pre: [escuelaData.porc_anexos_pre, escuelaData.cant_rc_pre, escuelaData.cant_aac_pre, escuelaData.porc_pm_pre],
            pos: [escuelaData.porc_anexos_pos, escuelaData.cant_rc_pos, escuelaData.cant_aac_pos, escuelaData.porc_pm_pos]
        };
    };

    const scoresForSelectedEscuela = getScoresForEscuela(selectedEscuela);

    const handleCorteClick = async () => {
        const today = format(new Date(), 'dd/MM/yyyy');
        const filteredData = data.filter(item => item.escuela === selectedEscuela);

        const cleanData = value => (value === "#DIV/0!" || value === undefined ? 0 : value);
        const dataToSend = filteredData.map(item => {
            return {
                id: item.id,
                escuela: item.escuela,
                porc_anexos_pre: cleanData(item.porc_anexos_pre),
                cant_rc_pre: cleanData(item.cant_rc_pre),
                cant_aac_pre: cleanData(item.cant_aac_pre),
                porc_pm_pre: cleanData(item.porc_pm_pre),
                porc_anexos_pos: cleanData(item.porc_anexos_pos),
                cant_rc_pos: cleanData(item.cant_rc_pos),
                cant_aac_pos: cleanData(item.cant_aac_pos),
                porc_pm_pos: cleanData(item.porc_pm_pos),
                descripcion_1: scores[programasBase[0]]?.descripcion || '',
                descripcion_2: scores[programasBase[1]]?.descripcion || '',
                descripcion_3: scores[programasBase[2]]?.descripcion || '',
                descripcion_4: scores[programasBase[3]]?.descripcion || '',
                fecha_corte: today
            };
        });

        const dataSend = [
            dataToSend[0].id,
            dataToSend[0].escuela,
            dataToSend[0].porc_anexos_pre,
            dataToSend[0].cant_rc_pre,
            dataToSend[0].cant_aac_pre,
            dataToSend[0].porc_pm_pre,
            dataToSend[0].porc_anexos_pos,
            dataToSend[0].cant_rc_pos,
            dataToSend[0].cant_aac_pos,
            dataToSend[0].porc_pm_pos,
            dataToSend[0].fecha_corte,
            dataToSend[0].descripcion_1,
            dataToSend[0].descripcion_2,
            dataToSend[0].descripcion_3,
            dataToSend[0].descripcion_4
        ];

        console.log('Data to send:', dataSend);

        try {
            const response = await sendDataEscula(dataSend);
            console.log('Response from server:', response);
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }
    };

    const handleGuardarClick = async () => {
        const filteredData = data.find(item => item.escuela === selectedEscuela);
        if (!filteredData) {
            console.error('No se encontraron datos para la escuela seleccionada');
            return;
        }

        const updatedData = {
            id: filteredData.id,
            escuela: filteredData.escuela,
            descripcion_1: scores[programasBase[0]]?.descripcion || '',
            descripcion_2: scores[programasBase[1]]?.descripcion || '',
            descripcion_3: scores[programasBase[2]]?.descripcion || '',
            descripcion_4: scores[programasBase[3]]?.descripcion || '',
        };

        const dataupdateescuela = [
            updatedData.id,
            updatedData.escuela,
            filteredData.porc_anexos_pre,
            filteredData.cant_rc_pre,
            filteredData.cant_aac_pre,
            filteredData.porc_pm_pre,
            filteredData.porc_anexos_pos,
            filteredData.cant_rc_pos,
            filteredData.cant_aac_pos,
            filteredData.porc_pm_pos,
            updatedData.descripcion_1,
            updatedData.descripcion_2,
            updatedData.descripcion_3,
            updatedData.descripcion_4
        ];

        try {
            await updateDataEscuela(dataupdateescuela, filteredData.id);
            console.log('Datos actualizados correctamente en el servidor.');
        } catch (error) {
            console.error('Error al actualizar datos en el servidor:', error);
        }
    };

    const getProgramas = () => {
        const tipo = selectedProgramType === 'pre' ? 'pregrado' : 'posgrado';
        return programasBase.map(program => program.replace('{tipo}', tipo));
    };

    return (
        <>
            <Header />
            <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "-40px", marginBottom: "10px" }}>
                <h1>Seguimiento al Plan de Mejoramiento por Escuelas</h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
                    {escuelas.map(escuela => (
                        <StyledButton
                            key={escuela}
                            className={selectedEscuela === escuela ? 'active' : ''}
                            onClick={() => handleClickOpen(escuela)}
                        >
                            {escuela}
                        </StyledButton>
                    ))}
                </div>
                <div style={{ flex: 1, marginLeft: '50px' }}>
                    {selectedEscuela && (
                        <div>
                            <Typography variant="h4" gutterBottom>{selectedEscuela}</Typography>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '90%', marginBottom: '20px' }}>
                                <Button
                                    variant={selectedProgramType === 'pre' ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedProgramType('pre')}
                                    style={{ marginRight: '10px' }}
                                >
                                    Pregrado
                                </Button>
                                <Button
                                    variant={selectedProgramType === 'pos' ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedProgramType('pos')}
                                >
                                    Posgrado
                                </Button>
                            </div>
                            <Table style={{ width: "90%" }}>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>#</StyledTableCell>
                                        <StyledTableCell style={{ width: '40%' }}>Criterio para la Escuela de {selectedEscuela}</StyledTableCell>
                                        <StyledTableCell>Ponderación</StyledTableCell>
                                        <StyledTableCell>Resultado Logrado</StyledTableCell>
                                        <StyledTableCell style={{ width: '40%' }}>Descripción de lo logrado</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getProgramas().map((program, index) => (
                                        <TableRow key={program}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{program}</TableCell>
                                            <TableCell>20%</TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    value={scoresForSelectedEscuela[selectedProgramType][index] || ''}
                                                    style={{ width: '80px' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    multiline
                                                    rows={2}
                                                    value={scores[program]?.descripcion || ''}
                                                    onChange={(e) => handleScoreChange(program, 'descripcion', e.target.value)}
                                                    style={{ width: '100%' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', width: '90%' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCorteClick}
                                >
                                    Hacer corte
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleGuardarClick}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SeguimientoInicio;
