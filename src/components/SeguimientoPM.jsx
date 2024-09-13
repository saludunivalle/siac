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
import { sendDataSegui, dataSegui, updateDataSegui } from '../service/data';

const StyledPaper = styled(Paper)(({ theme, hasData }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: hasData ? '#f5f5f5' : '#ffffff',
    flexGrow: 1,
    maxWidth: 450,
}));

const FormWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: 450,
}));

const RowContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

const SeguimientoPM = ({ idPrograma, escuela, formacion, isPlan }) => {
    const [estadoProceso, setEstadoProceso] = useState('');
    const [porcentaje, setPorcentaje] = useState('');
    const [recopilacionEvidencias, setRecopilacionEvidencias] = useState('No');
    const [numeroProgramas, setNumeroProgramas] = useState('No');
    const [tieneHSCPM, setTieneHSCPM] = useState('No');
    const [urlHSCPM, setUrlHSCPM] = useState('');
    const [recibioVisitaPares, setRecibioVisitaPares] = useState('No');
    const [loading, setLoading] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [savedRecords, setSavedRecords] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const response = await dataSegui();
            const records = response
                .filter(record => record.id_programa === idPrograma)
                .reduce((acc, record) => {
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
                        record.tiene_hscpm,
                        record.url_herramienta,
                        record.recibio_visitas
                    ];
                    return acc;
                }, {});
            setSavedRecords(Object.values(records));
            if (Object.values(records).length > 0) {
                const lastRecord = Object.values(records).slice(-1)[0];
                setCurrentId(lastRecord[0]);
                setEstadoProceso(lastRecord[2]);
                setPorcentaje(lastRecord[3]);
                setRecopilacionEvidencias(lastRecord[4]);
                setNumeroProgramas(lastRecord[5]);
                setTieneHSCPM(lastRecord[9]);
                setUrlHSCPM(lastRecord[10] || '');
                setRecibioVisitaPares(lastRecord[11]);
                setIsSaved(true);
                setHasData(true);
            } else {
                setHasData(false);
            }
        };
        fetchData();
    }, [idPrograma]);

    const handlePorcentajeChange = (event) => {
        const value = event.target.value.replace(/[^0-9.,]/g, '');
        setPorcentaje(value ? `${value}%` : '');
        setIsEdited(true);
        setIsSaved(false);
    };

    const handleGuardar = async () => {
        setLoading(true);

        const allData = await dataSegui();
        const highestId = allData.length > 0 ? Math.max(...allData.map(record => parseInt(record.id))) : 0;

        const newRecord = [
            currentId,
            idPrograma,
            estadoProceso,
            porcentaje,
            recopilacionEvidencias,
            numeroProgramas,
            formacion,
            escuela,
            null,
            tieneHSCPM,
            recibioVisitaPares,
            urlHSCPM
        ];

        if (currentId !== null) {
            await updateDataSegui(newRecord, currentId);
        } else {
            const newId = highestId + 1;
            newRecord[0] = newId;
            await sendDataSegui(newRecord);
            setCurrentId(newId);
        }

        setLoading(false);
        setSuccessModalOpen(true);
        setIsSaved(true);
        setIsEdited(false);
        setSavedRecords(prevRecords => {
            const existingRecordIndex = prevRecords.findIndex(record => record[0] === newRecord[0]);
            if (existingRecordIndex !== -1) {
                const updatedRecords = [...prevRecords];
                updatedRecords[existingRecordIndex] = newRecord;
                return updatedRecords;
            }
            return [...prevRecords, newRecord];
        });
        setHasData(true);
    };

    const handleSuccessModalClose = () => {
        setSuccessModalOpen(false);
    };

    const handleFieldChange = (setter) => (event) => {
        setter(event.target.value);
        setIsEdited(true);
        setIsSaved(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <RowContainer>
                <FormWrapper>
                    <StyledPaper hasData={hasData}>
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <FormControl variant="outlined" fullWidth disabled={!isPlan}>
                                    <InputLabel id="estadoProceso-label">Seleccione el estado del programa</InputLabel>
                                    <Select
                                        labelId="estadoProceso-label"
                                        id="estadoProceso"
                                        value={estadoProceso}
                                        onChange={handleFieldChange(setEstadoProceso)}
                                        label="Seleccione el estado del programa"
                                    >
                                        <MenuItem value=""><em>Seleccione el estado del programa</em></MenuItem>
                                        <MenuItem value="Diseño">Diseño</MenuItem>
                                        <MenuItem value="Rediseño">Rediseño</MenuItem>
                                        <MenuItem value="Seguimiento">Seguimiento</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', flexGrow: 1 }}>
                                    Anexos técnicos en consonancia con los registros calificados:
                                </Typography>
                                <TextField
                                    label="Porcentaje"
                                    variant="outlined"
                                    value={porcentaje}
                                    onChange={handlePorcentajeChange}
                                    placeholder="%"
                                    style={{ width: 150 }}
                                    disabled={!isPlan}
                                />
                            </div>

                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', flexGrow: 1 }}>
                                    ¿Obtuvo o tiene Registro calificado?
                                </Typography>
                                <FormControl component="fieldset" disabled={!isPlan}>
                                    <RadioGroup
                                        row
                                        value={recopilacionEvidencias}
                                        onChange={handleFieldChange(setRecopilacionEvidencias)}
                                    >
                                        <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                        <FormControlLabel value="No" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', flexGrow: 1 }}>
                                    ¿Obtuvo o tiene Acreditación?
                                </Typography>
                                <FormControl component="fieldset" disabled={!isPlan}>
                                    <RadioGroup
                                        row
                                        value={numeroProgramas}
                                        onChange={handleFieldChange(setNumeroProgramas)}
                                    >
                                        <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                        <FormControlLabel value="No" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', flexGrow: 1 }}>
                                    ¿Tiene HSCPM?
                                </Typography>
                                <FormControl component="fieldset" disabled={!isPlan}>
                                    <RadioGroup
                                        row
                                        value={tieneHSCPM}
                                        onChange={handleFieldChange(setTieneHSCPM)}
                                    >
                                        <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                        <FormControlLabel value="No" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            {tieneHSCPM === 'Si' && (
                                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" style={{ marginRight: '10px', flexGrow: 1 }}>
                                        URL del HSCPM:
                                    </Typography>
                                    <TextField
                                        label="URL"
                                        variant="outlined"
                                        value={urlHSCPM}
                                        onChange={handleFieldChange(setUrlHSCPM)}
                                        placeholder="http://example.com"
                                        style={{ width: '100%' }}
                                        disabled={!isPlan}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" style={{ marginRight: '10px', flexGrow: 1 }}>
                                    ¿Recibió Visita de Pares?
                                </Typography>
                                <FormControl component="fieldset" disabled={!isPlan}>
                                    <RadioGroup
                                        row
                                        value={recibioVisitaPares}
                                        onChange={handleFieldChange(setRecibioVisitaPares)}
                                    >
                                        <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                        <FormControlLabel value="No" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleGuardar}
                                    disabled={loading || !isPlan}
                                    style={{ opacity: isSaved ? 0.5 : 1 }}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </StyledPaper>
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
