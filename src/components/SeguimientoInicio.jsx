import React, { useState } from 'react';
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
    'Porcentaje de avance en la recopilación de evidencias en el marco del PM.',
    'Número de programas académicos de la Facultad de Salud de pregrado y posgrados con acreditación.',
    'Porcentaje de avance en el diseño o rediseño del plan de mejoramiento con base a las recomendaciones de los pares académicos.',
    'Porcentaje al cumplimiento del seguimiento a resultados de aprendizaje establecidos en microcurrículos del programa académico de pregrado y postgrado.'
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

    return (
        <>
            <Header />
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
                    <div style={{width:"100%", display:"flex", justifyContent:"center", marginTop:"-40px", marginBottom:"10px"}}>
                        <h1>Escuelas</h1>
                    </div>
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
                <div style={{ flex: 1, marginLeft: '50px'}}>
                    {selectedEscuela && (
                        <div>
                            <Typography variant="h4" gutterBottom>{selectedEscuela}</Typography>
                            <Table style={{width:"90%"}}>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>#</StyledTableCell>
                                        <StyledTableCell>Criterio para la Escuela de {selectedEscuela}</StyledTableCell>
                                        <StyledTableCell>Ponderación</StyledTableCell>
                                        <StyledTableCell>Diseño</StyledTableCell>
                                        <StyledTableCell>Rediseño</StyledTableCell>
                                        <StyledTableCell>Seguimiento</StyledTableCell>
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
                                                    value={scores[program]?.diseño || ''}
                                                    onChange={(e) => handleScoreChange(program, 'diseño', e.target.value)}
                                                    style={{ width: '60px' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    value={scores[program]?.rediseño || ''}
                                                    onChange={(e) => handleScoreChange(program, 'rediseño', e.target.value)}
                                                    style={{ width: '60px' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    value={scores[program]?.seguimiento || ''}
                                                    onChange={(e) => handleScoreChange(program, 'seguimiento', e.target.value)}
                                                    style={{ width: '60px' }}
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
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SeguimientoInicio;
