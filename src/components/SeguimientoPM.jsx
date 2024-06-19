import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    TextField,
    CircularProgress,
    Backdrop,
    Box,
    Paper,
    RadioGroup,
    FormControlLabel,
    Radio
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

const SeguimientoPM = ({ idPrograma, escuela, formacion }) => {
    const [estadoProceso, setEstadoProceso] = useState('');
    const [porcentaje, setPorcentaje] = useState('');
    const [recopilacionEvidencias, setRecopilacionEvidencias] = useState('No');
    const [numeroProgramas, setNumeroProgramas] = useState('No');
    const [loading, setLoading] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [savedRecords, setSavedRecords] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const response = await dataSegui();
            const records = response.filter(record => record.id_programa === idPrograma).reduce((acc, record) => {
                acc[record.id] = [
                    record.id,
                    record.id_programa,
                    record.estado_pm,
                    record.porc_anexos,
                    record.tiene_rc,
                    record.tiene_aac,
                    record.formacion,
                    record.escuela,
                    record.fecha || null,
                ];
                return acc;
            }, {});
            setSavedRecords(Object.values(records));
            if (Object.values(records).length > 0) {
                const lastRecord = Object.values(records)[Object.values(records).length - 1];
                setCurrentId(lastRecord[0]);
                setEstadoProceso(lastRecord[2]);
                setPorcentaje(lastRecord[3]);
                setRecopilacionEvidencias(lastRecord[4]);
                setNumeroProgramas(lastRecord[5]);
                setIsSaved(true);
            }
        };
        fetchData();
    }, [idPrograma]);

    const handlePorcentajeChange = (event) => {
        const value = event.target.value.replace(/[^0-9.,]/g, '');
        setPorcentaje(value ? `${value}%` : '');
    };

    const handleGuardar = async () => {
        setLoading(true);
        const id = currentId !== null ? currentId : (parseInt(localStorage.getItem('lastId'), 10) || 0) + 1;
        if (currentId === null) {
            localStorage.setItem('lastId', id.toString());
        }

        const newRecord = [
            id,
            idPrograma,
            estadoProceso,
            porcentaje,
            recopilacionEvidencias,
            numeroProgramas,
            formacion,
            escuela,
            null,
        ];

        await sendDataSegui(newRecord);
        setLoading(false);
        setSuccessModalOpen(true);
        setIsSaved(true);
        setCurrentId(id);
        setSavedRecords(prevRecords => {
            const existingRecordIndex = prevRecords.findIndex(record => record[0] === id);
            if (existingRecordIndex !== -1) {
                const updatedRecords = [...prevRecords];
                updatedRecords[existingRecordIndex] = newRecord;
                return updatedRecords;
            }
            return [...prevRecords, newRecord];
        });
    };

    const handleSuccessModalClose = () => {
        setSuccessModalOpen(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <RowContainer>
                <FormWrapper>
                    <Paper style={{ padding: '20px' }}>
                        <div style={{ marginTop: '-10px' }}>
                            {/* Sección Estado del Proceso */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <FormControl variant="outlined" style={{ marginRight: '10px', minWidth: 355 }}>
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
                                        <MenuItem value="Seguimientoo">Seguimientoo</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            {/* Sección para Porcentaje */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', width: 300 }}>
                                    Anexos técnicos en consonancia con los registros calificados:
                                </Typography>
                                <TextField
                                    label="Porcentaje"
                                    variant="outlined"
                                    value={porcentaje}
                                    onChange={handlePorcentajeChange}
                                    placeholder="%"
                                    style={{ marginRight: '10px', width: 150 }}
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

                            {/* Botón Guardar */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', position: 'relative' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleGuardar}
                                    style={{ marginRight: '10px', opacity: isSaved ? 0.5 : 1 }}
                                    disabled={loading}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </Paper>
                </FormWrapper>
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
