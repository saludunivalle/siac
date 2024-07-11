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
    const [descriptions, setDescriptions] = useState({});
    const [data, setData] = useState([]);
    const [selectedProgramType, setSelectedProgramType] = useState('pre');

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

    const handleClickOpen = (escuela) => {
        setSelectedEscuela(escuela);
        const escuelaData = data.find(d => d.escuela === escuela) || {};
        setScores({
            pre: [
                escuelaData.porc_anexos_pre || '',
                escuelaData.cant_rc_pre || '',
                escuelaData.cant_aac_pre || '',
                escuelaData.porc_pm_pre || ''
            ],
            pos: [
                escuelaData.porc_anexos_pos || '',
                escuelaData.cant_rc_pos || '',
                escuelaData.cant_aac_pos || '',
                escuelaData.porc_pm_pos || ''
            ]
        });
        setDescriptions({
            descripcion_1: escuelaData.descripcion_1 || '',
            descripcion_2: escuelaData.descripcion_2 || '',
            descripcion_3: escuelaData.descripcion_3 || '',
            descripcion_4: escuelaData.descripcion_4 || ''
        });
    };

    const handleScoreChange = (index, value) => {
        setScores(prevScores => ({
            ...prevScores,
            [selectedProgramType]: prevScores[selectedProgramType].map((score, i) => i === index ? value : score)
        }));
    };

    const handleDescriptionChange = (field, value) => {
        setDescriptions(prevDescriptions => ({
            ...prevDescriptions,
            [field]: value
        }));
    };

    const handleCorteClick = async () => {
        const today = format(new Date(), 'dd/MM/yyyy');
        const filteredData = data.filter(item => item.escuela === selectedEscuela);

        const cleanData = value => (value === "#DIV/0!" || value === undefined ? 0 : value);
        const dataToSend = filteredData.map(item => ({
            id: item.id,
            escuela: item.escuela,
            porc_anexos_pre: cleanData(scores.pre[0]),
            cant_rc_pre: cleanData(scores.pre[1]),
            cant_aac_pre: cleanData(scores.pre[2]),
            porc_pm_pre: cleanData(scores.pre[3]),
            porc_anexos_pos: cleanData(scores.pos[0]),
            cant_rc_pos: cleanData(scores.pos[1]),
            cant_aac_pos: cleanData(scores.pos[2]),
            porc_pm_pos: cleanData(scores.pos[3]),
            descripcion_1: descriptions.descripcion_1,
            descripcion_2: descriptions.descripcion_2,
            descripcion_3: descriptions.descripcion_3,
            descripcion_4: descriptions.descripcion_4,
            fecha_corte: today
        }));

        console.log('Data to send:', dataToSend);

        try {
            const response = await sendDataEscula(dataToSend);
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
            descripcion_1: descriptions.descripcion_1,
            descripcion_2: descriptions.descripcion_2,
            descripcion_3: descriptions.descripcion_3,
            descripcion_4: descriptions.descripcion_4
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
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', marginBottom: '20px' }}>
                                <Typography variant="h4" gutterBottom>{selectedEscuela}</Typography>
                                <div>
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
                                                    value={scores[selectedProgramType][index] || ''}
                                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                                    style={{ width: '80px' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    multiline
                                                    rows={2}
                                                    value={descriptions[`descripcion_${index + 1}`] || ''}
                                                    onChange={(e) => handleDescriptionChange(`descripcion_${index + 1}`, e.target.value)}
                                                    style={{ width: '100%' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', width: '90%' }}>
                                <Button variant="contained" color="primary" onClick={handleCorteClick}>
                                    Hacer corte
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleGuardarClick}>
                                    Guardar
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default SeguimientoInicio;
