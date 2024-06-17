import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Typography,
    TextField,
    CircularProgress,
    Backdrop,
    Grid,
    Paper,
    Box
} from '@mui/material';
import { styled } from '@mui/system';
import { sendDataSegui, dataSegui } from '../service/data';
import dayjs from 'dayjs';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
    maxWidth: 400,
}));

const FormWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: 400,
}));

const RowContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

const SeguimientoPM = ({ idPrograma }) => {
    const [estadoProceso, setEstadoProceso] = useState('');
    const [porcentaje, setPorcentaje] = useState('');
    const [recopilacionEvidencias, setRecopilacionEvidencias] = useState('No');
    const [numeroProgramas, setNumeroProgramas] = useState('No');
    const [loading, setLoading] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [savedRecords, setSavedRecords] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await dataSegui();
            const records = response.reduce((acc, record) => {
                acc[record.id] = [
                    record.id,
                    idPrograma,
                    record.estado_pm,
                    record.porc_anexos,
                    record.tiene_rc,
                    record.tiene_aac,
                    record.fecha || null,
                ];
                return acc;
            }, {});
            setSavedRecords(Object.values(records));
        };
        fetchData();
    }, [idPrograma]);

    const handlePorcentajeChange = (event) => {
        const value = event.target.value.replace(/[^0-9.,]/g, '');
        setPorcentaje(value ? `${value}%` : '');
    };

    const handleGuardar = async (isCorte = false) => {
        setLoading(true);
        const nuevoId = (parseInt(localStorage.getItem('lastId'), 10) || 0) + 1;
        localStorage.setItem('lastId', nuevoId.toString());

        const fecha = isCorte ? dayjs().format('DD/MM/YYYY') : null;
        const newRecord = [
            nuevoId,
            idPrograma,
            estadoProceso,
            porcentaje,
            recopilacionEvidencias,
            numeroProgramas,
            fecha,
        ];

        await sendDataSegui(newRecord);
        setLoading(false);
        setSuccessModalOpen(true);

        setSavedRecords([...savedRecords, newRecord]);

        // Reset form
        setEstadoProceso('');
        setPorcentaje('');
        setRecopilacionEvidencias('No');
        setNumeroProgramas('No');
    };

    const handleSuccessModalClose = () => {
        setSuccessModalOpen(false);
    };

    const handleRecordChange = (id, index, value) => {
        setSavedRecords(prevRecords =>
            prevRecords.map(record =>
                record[0] === id ? record.map((item, idx) => (idx === index ? value : item)) : record
            )
        );
    };

    const handleRecordGuardar = async (id, isCorte = false) => {
        setLoading(true);
        const recordToSave = savedRecords.find(record => record[0] === id);
        const fecha = isCorte ? dayjs().format('DD/MM/YYYY') : recordToSave[6];

        const updatedRecord = recordToSave.map((item, idx) => (idx === 6 ? fecha : item));

        await sendDataSegui(updatedRecord);
        setLoading(false);
        setSuccessModalOpen(true);

        setSavedRecords(savedRecords.map(record =>
            record[0] === id ? updatedRecord : record
        ));
    };

    return (
        <div style={{ padding: '20px' }}>
            <RowContainer>
                <FormWrapper>
                    <Paper style={{ padding: '20px' }}>
                        <div style={{ marginTop: '-10px' }}>
                            {/* Sección Estado del Proceso */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <FormControl variant="outlined" style={{ marginRight: '10px', minWidth: 200 }}>
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
                            </div>

                            {/* Sección para Porcentaje */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', width: 200 }}>
                                    Anexos técnicos en consonancia con los registros calificados:
                                </Typography>
                                <TextField
                                    label="Porcentaje"
                                    variant="outlined"
                                    value={porcentaje}
                                    onChange={handlePorcentajeChange}
                                    placeholder="%"
                                    style={{ marginRight: '10px', width: 100 }}
                                    InputProps={{
                                        endAdornment: '%',
                                    }}
                                />
                            </div>

                            {/* Sección para Recopilación de Evidencias */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', width: 200 }}>
                                    ¿Obtuvo o tiene Registro calificado?
                                </Typography>
                                <FormControl component="fieldset" style={{ marginRight: '10px' }}>
                                    <RadioGroup
                                        row
                                        value={recopilacionEvidencias}
                                        onChange={(e) => setRecopilacionEvidencias(e.target.value)}
                                    >
                                        <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                        <FormControlLabel value="No" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            {/* Sección para Número de Programas */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', width: 200 }}>
                                    ¿Obtuvo o tiene Acreditación?
                                </Typography>
                                <FormControl component="fieldset" style={{ marginRight: '10px' }}>
                                    <RadioGroup
                                        row
                                        value={numeroProgramas}
                                        onChange={(e) => setNumeroProgramas(e.target.value)}
                                    >
                                        <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                        <FormControlLabel value="No" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            {/* Botones Guardar y Hacer Corte */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', position: 'relative' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleGuardar(false)}
                                    style={{ marginRight: '10px' }}
                                    disabled={loading}
                                >
                                    Guardar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleGuardar(true)}
                                    disabled={loading}
                                >
                                    Hacer Corte
                                </Button>
                            </div>
                        </div>
                    </Paper>
                </FormWrapper>

                {savedRecords.map(record => (
                    <StyledPaper key={record[0]}>
                        {record[6] ? (
                            <>
                                <Typography variant="body1" style={{ marginBottom: '20px' }}>
                                    Estado del Programa: {record[2]}
                                </Typography>
                                <Typography variant="body1" style={{ marginBottom: '20px' }}>
                                    Anexos técnicos: {record[3]}
                                </Typography>
                                <Typography variant="body1" style={{ marginBottom: '20px' }}>
                                    ¿Obtuvo o tiene Registro calificado?: {record[4]}
                                </Typography>
                                <Typography variant="body1" style={{ marginBottom: '20px' }}>
                                    ¿Obtuvo o tiene Acreditación?: {record[5]}
                                </Typography>
                                <Typography variant="body1" style={{ marginBottom: '20px' }}>
                                    Fecha de Corte: {record[6]}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                    <FormControl variant="outlined" style={{ marginRight: '10px', minWidth: 200 }}>
                                        <InputLabel id={`estadoProceso-label-${record[0]}`}>Seleccione el estado del programa</InputLabel>
                                        <Select
                                            labelId={`estadoProceso-label-${record[0]}`}
                                            id={`estadoProceso-${record[0]}`}
                                            value={record[2]}
                                            onChange={(e) => handleRecordChange(record[0], 2, e.target.value)}
                                            label="Seleccione el estado del programa"
                                        >
                                            <MenuItem value=""><em>Seleccione el estado del programa</em></MenuItem>
                                            <MenuItem value="Diseño">Diseño</MenuItem>
                                            <MenuItem value="Rediseño">Rediseño</MenuItem>
                                            <MenuItem value="Cumplimiento al plan de mejoramiento">Cumplimiento al plan de mejoramiento</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="body1" style={{ marginRight: '10px', width: 200 }}>
                                        Anexos técnicos en consonancia con los registros calificados:
                                    </Typography>
                                    <TextField
                                        label="Porcentaje"
                                        variant="outlined"
                                        value={record[3]}
                                        onChange={(e) => handleRecordChange(record[0], 3, e.target.value)}
                                        placeholder="%"
                                        style={{ marginRight: '10px', width: 100 }}
                                        InputProps={{
                                            endAdornment: '%',
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="body1" style={{ marginRight: '10px', width: 200 }}>
                                        ¿Obtuvo o tiene Registro calificado?
                                    </Typography>
                                    <FormControl component="fieldset" style={{ marginRight: '10px' }}>
                                        <RadioGroup
                                            row
                                            value={record[4]}
                                            onChange={(e) => handleRecordChange(record[0], 4, e.target.value)}
                                        >
                                            <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                            <FormControlLabel value="No" control={<Radio />} label="No" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="body1" style={{ marginRight: '10px', width: 200 }}>
                                        ¿Obtuvo o tiene Acreditación?
                                    </Typography>
                                    <FormControl component="fieldset" style={{ marginRight: '10px' }}>
                                        <RadioGroup
                                            row
                                            value={record[5]}
                                            onChange={(e) => handleRecordChange(record[0], 5, e.target.value)}
                                        >
                                            <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                            <FormControlLabel value="No" control={<Radio />} label="No" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleRecordGuardar(record[0], false)}
                                    style={{ marginRight: '10px' }}
                                    disabled={loading}
                                >
                                    Guardar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleRecordGuardar(record[0], true)}
                                    disabled={loading}
                                >
                                    Hacer Corte
                                </Button>
                            </>
                        )}
                    </StyledPaper>
                ))}
            </RowContainer>
            <Dialog
                open={successModalOpen}
                onClose={handleSuccessModalClose}
            >
                <DialogTitle>Datos guardados</DialogTitle>
                <DialogContent>
                    <Typography>Sus datos se han guardado correctamente.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSuccessModalClose} color="primary">Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Backdrop open={loading} style={{ zIndex: 1301, color: '#fff' }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default SeguimientoPM;
