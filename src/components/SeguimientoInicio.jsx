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
import { sendDataEscula, dataEscuelas } from '../service/data'; 

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

const programas = [
    'Anexos técnicos en consonancia con los registros calificados',
    'Número de programas académicos de la Facultad de Salud de pregrado y posgrados con registro calificado.',
    'Número de programas académicos de la Facultad de Salud de pregrado y posgrados con acreditación.',
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

    const handleClickOpen = (escuela) => {
        setSelectedEscuela(escuela);
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
            diseño: [escuelaData.porc_anexos_diseño_pre, escuelaData.cant_rc_diseño_pre, escuelaData.cant_aac_diseño_pre, escuelaData.porc_pm_diseño_pre],
            rediseño: [escuelaData.porc_anexos_rediseño_pre, escuelaData.cant_rc_rediseño_pre, escuelaData.cant_aac_rediseño_pre, escuelaData.porc_pm_rediseño_pre],
            seguimiento: [escuelaData.porc_anexos_seg_pre, escuelaData.cant_rc_seg_pre, escuelaData.cant_aac_seg_pre, escuelaData.porc_pm_seg_pre],
        };
    };

    const scoresForSelectedEscuela = getScoresForEscuela(selectedEscuela);

    const handleCorteClick = () => {
        const today = format(new Date(), 'dd/MM/yyyy');
        const dataToSend = data
            .filter(item => item.escuela === selectedEscuela)
            .map(item => [
                item.id,
                item.escuela,
                item.porc_anexos_diseño_pre,
                item.cant_rc_diseño_pre,
                item.cant_aac_diseño_pre,
                item.porc_pm_diseño_pre,
                item.porc_anexos_rediseño_pre,
                item.cant_rc_rediseño_pre,
                item.cant_aac_rediseño_pre,
                item.porc_pm_rediseño_pre,
                item.porc_anexos_seg_pre,
                item.cant_rc_seg_pre,
                item.cant_aac_seg_pre,
                item.porc_pm_seg_pre,
                scores[programas[0]]?.descripcion || '',
                today
            ]);

        console.log(dataToSend); 
        sendDataEscula(dataToSend); 
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
                            <Table style={{ width: "90%" }}>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>#</StyledTableCell>
                                        <StyledTableCell>Criterio para la Escuela de {selectedEscuela}</StyledTableCell>
                                        <StyledTableCell>Ponderación</StyledTableCell>
                                        <StyledTableCell>Diseño</StyledTableCell>
                                        <StyledTableCell>Rediseño</StyledTableCell>
                                        <StyledTableCell>Seguimiento</StyledTableCell>
                                        <StyledTableCell>R. Logrado</StyledTableCell>
                                        <StyledTableCell>Descripción de lo logrado</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {programas.map((program, index) => (
                                        <TableRow key={program}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{program}</TableCell>
                                            <TableCell>20%</TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    value={scoresForSelectedEscuela.diseño[index] || ''}
                                                    style={{ width: '60px' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    value={scoresForSelectedEscuela.rediseño[index] || ''}
                                                    style={{ width: '60px' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    value={scoresForSelectedEscuela.seguimiento[index] || ''}
                                                    style={{ width: '60px' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    value={scores[program]?.rlogrado || ''}
                                                    style={{ width: '60px' }}
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
                                    <TableRow>
                                        <TableCell colSpan={8} align="right">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleCorteClick}
                                            >
                                                Hacer corte
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SeguimientoInicio;
