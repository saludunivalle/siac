import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/system';

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

const SeguimientoPM = () => {
    const [estadoProceso, setEstadoProceso] = useState('');
    const [porcentaje, setPorcentaje] = useState('');
    const [anexosTecnicos, setAnexosTecnicos] = useState('');
    const [recopilacionEvidencias, setRecopilacionEvidencias] = useState('');
    const [numeroProgramas, setNumeroProgramas] = useState('');

    const [open, setOpen] = useState(false);
    const [selectedEscuela, setSelectedEscuela] = useState('');
    const [scores, setScores] = useState({});

    const handleClickOpen = (escuela) => {
        setSelectedEscuela(escuela);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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

    const handlePorcentajeChange = (event, setFunction) => {
        const value = event.target.value.replace(/[^0-9.,]/g, '');
        setFunction(value ? `${value}%` : '');
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginTop: '-10px' }}>
                {/* Sección para Estado del Proceso */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <FormControl variant="outlined" style={{ marginRight: '10px', minWidth: 300 }}>
                        <InputLabel id="estadoProceso-label">Seleccione el estado del programa</InputLabel>
                        <Select
                            labelId="estadoProceso-label"
                            id="estadoProceso"
                            value={estadoProceso}
                            onChange={(e) => setEstadoProceso(e.target.value)}
                            label="Seleccione el estado del programa"
                        >
                            <MenuItem value=""><em>Seleccione el estado del programa</em></MenuItem>
                            <MenuItem value="Diseño">Diseño</MenuItem>
                            <MenuItem value="Rediseño">Rediseño</MenuItem>
                            <MenuItem value="Cumplimiento al plan de mejoramiento">Cumplimiento al plan de mejoramiento</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Porcentaje"
                        variant="outlined"
                        value={porcentaje}
                        onChange={(e) => handlePorcentajeChange(e, setPorcentaje)}
                        placeholder="%"
                        style={{ marginRight: '10px', width: 150 }}
                        InputProps={{
                            endAdornment: '%',
                        }}
                    />

                    <Button variant="contained" color="primary">
                        Guardar
                    </Button>
                </div>

                {/* Nueva sección para Anexos Técnicos */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <TextField
                        label="Anexos técnicos en consonancia con los registros calificados"
                        variant="outlined"
                        value={anexosTecnicos}
                        onChange={(e) => setAnexosTecnicos(e.target.value)}
                        style={{ marginRight: '10px', width: 300 }}
                    />

                    <TextField
                        label="Porcentaje"
                        variant="outlined"
                        value={anexosTecnicos}
                        onChange={(e) => handlePorcentajeChange(e, setAnexosTecnicos)}
                        placeholder="%"
                        style={{ marginRight: '10px', width: 150 }}
                        InputProps={{
                            endAdornment: '%',
                        }}
                    />

                    <Button variant="contained" color="primary">
                        Guardar
                    </Button>
                </div>

                {/* Nueva sección para Recopilación de Evidencias */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <TextField
                        label="Porcentaje de avance en la recopilación de evidencias en el marco del PM"
                        variant="outlined"
                        value={recopilacionEvidencias}
                        onChange={(e) => setRecopilacionEvidencias(e.target.value)}
                        style={{ marginRight: '10px', width: 300 }}
                    />

                    <TextField
                        label="Porcentaje"
                        variant="outlined"
                        value={recopilacionEvidencias}
                        onChange={(e) => handlePorcentajeChange(e, setRecopilacionEvidencias)}
                        placeholder="%"
                        style={{ marginRight: '10px', width: 150 }}
                        InputProps={{
                            endAdornment: '%',
                        }}
                    />

                    <Button variant="contained" color="primary">
                        Guardar
                    </Button>
                </div>

                {/* Nueva sección para Número de Programas */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <TextField
                        label="Número de programas académicos de la Facultad de Salud de pregrado y posgrados con acreditación"
                        variant="outlined"
                        value={numeroProgramas}
                        onChange={(e) => setNumeroProgramas(e.target.value)}
                        style={{ marginRight: '10px', width: 300 }}
                    />

                    <TextField
                        label="Porcentaje"
                        variant="outlined"
                        value={numeroProgramas}
                        onChange={(e) => handlePorcentajeChange(e, setNumeroProgramas)}
                        placeholder="%"
                        style={{ marginRight: '10px', width: 150 }}
                        InputProps={{
                            endAdornment: '%',
                        }}
                    />

                    <Button variant="contained" color="primary">
                        Guardar
                    </Button>
                </div>
            </div>

            <h2>Escuelas</h2>
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
            <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
                <DialogTitle>{selectedEscuela}</DialogTitle>
                <DialogContent>
                    <Table>
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Cerrar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SeguimientoPM;
