import { useState, useEffect } from 'react';
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
    Radio,
    Link
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import LaunchIcon from '@mui/icons-material/Launch';
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

const SeguimientoPM = ({ idPrograma, escuela, formacion, isPlan, fechaVencimientoRRC, fechaVencAC }) => {
    const [estadoProceso, setEstadoProceso] = useState('');
    const [porcentaje, setPorcentaje] = useState('');
    const [recopilacionEvidencias, setRecopilacionEvidencias] = useState('No');
    const [numeroProgramas, setNumeroProgramas] = useState('No');
    const [tieneHSCPM_RC, setTieneHSCPM_RC] = useState('No');
    const [urlHSCPM_RRC, setUrlHSCPM_RRC] = useState('');
    const [tieneHSCPM_AAC, setTieneHSCPM_AAC] = useState('No');
    const [urlHSCPM_AAC, setUrlHSCPM_AAC] = useState('');
    const [recibioVisitaPares, setRecibioVisitaPares] = useState('No');
    const [loading, setLoading] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [savedRecords, setSavedRecords] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [estadoRRC, setEstadoRRC] = useState('Inactivo');

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
                        record.url_herramienta_RRC,        // índice 9 (columna J)
                        record.recibio_visitas,            // índice 10 (columna K)
                        record.url_herramienta_AAC 
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
                setRecibioVisitaPares(lastRecord[10]);
                setUrlHSCPM_RRC(lastRecord[9] || '');
                setTieneHSCPM_RC(lastRecord[9] ? 'Si' : 'No');
                setUrlHSCPM_AAC(lastRecord[11] || '');
                setTieneHSCPM_AAC(lastRecord[11] ? 'Si' : 'No');
                setIsSaved(true);
                setHasData(true);
            } else {
                setHasData(false);
            }
        };
        fetchData();
    }, [idPrograma]);

    useEffect(() => {
        if (fechaVencimientoRRC) {
          if (compararFechas(fechaVencimientoRRC)) {
            setEstadoRRC('Activo');
          } else {
            setEstadoRRC('Inactivo');
          }
        }
      }, [fechaVencimientoRRC]);

    /* 
      const handlePorcentajeChange = (event) => {
        const value = event.target.value.replace(/[^0-9.,]/g, '');
        setPorcentaje(value ? `${value}%` : '');
        setIsEdited(true);
        setIsSaved(false);
    }; */

    
    const handleGuardar = async () => {
        setLoading(true);
        await updateDataSegui({ idPrograma, estadoRRC });

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
            urlHSCPM_RRC,
            recibioVisitaPares,
            urlHSCPM_AAC
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

    const getSemaforoColor = (vencimientoYear) => {
        const currentYear = new Date().getFullYear();
        if (vencimientoYear < currentYear) {
          return '#D3D3D3'; // Gris para vencido
        } else if (vencimientoYear <= currentYear + 1) {
          return '#FED5D1'; // Rojo para vencimiento en el próximo año
        } else if (vencimientoYear > currentYear + 1 && vencimientoYear <= currentYear + 3) {
          return '#FEFBD1'; // Amarillo para vencimiento entre uno y tres años
        } else {
          return '#E6FFE6'; // Verde para más de tres años
        }
      };

    const compararFechas = (fechaString) => {
        if (!fechaString || typeof fechaString !== 'string') return false;
        const partes = fechaString.split('/');
        if (partes.length !== 3) return false;
      
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const anio = parseInt(partes[2], 10);
        const fecha = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
      
        return fecha.getTime() >= hoy.getTime();
    };

    const obtenerEstadoRegistroCalificadoSemaforo = (fechaString) => {
        if (!fechaString || fechaString.trim() === '' || fechaString === 'N/A') {
          return { estado: 'N/A', color: '#9E9E9E' };
        }
        const partes = fechaString.split('/');
        if (partes.length !== 3) {
          return { estado: 'N/A', color: '#9E9E9E' };
        }
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const anio = parseInt(partes[2], 10);
        const fecha = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        // Usamos el color del semáforo basado en el año de vencimiento
        const color = getSemaforoColor(anio);
        if (fecha.getTime() >= hoy.getTime()) {
          return { estado: 'ACTIVO', color };
        } else {
          return { estado: 'VENCIDO', color };
        }
    };

    const obtenerEstadoAcreditacionSemaforo = (fechaString) => {
        if (!fechaString || fechaString.trim() === '' || fechaString === 'N/A') {
            return { estado: 'N/A', color: '#9E9E9E' };
        }
        const partes = fechaString.split('/');
        if (partes.length !== 3) {
            return { estado: 'N/A', color: '#9E9E9E' };
        }
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const anio = parseInt(partes[2], 10);
        const fecha = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const color = getSemaforoColor(anio);
        if (fecha.getTime() >= hoy.getTime()) {
            return { estado: 'ACTIVO', color };
        } else {
            return { estado: 'VENCIDO', color };
        }
    };

    // Obtener el estado para Registro Calificado
    const registroCalificado = obtenerEstadoRegistroCalificadoSemaforo(fechaVencimientoRRC);
    // Obtener el estado para Acreditación
    const acreditacion = obtenerEstadoAcreditacionSemaforo(fechaVencAC);

    return (
        <>

        {/* NUEVO BLOQUE: Select para Estado del Programa */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <Box
                sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                backgroundColor: 'background.paper',
                width: '800px',
                textAlign: 'center'
                }}
            >
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                    Estado del Programa
                </Typography>
                <FormControl 
                    variant="outlined" 
                    disabled={!isPlan}
                    fullWidth
                >
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
            </Box>
        </div>

        {/* DIV separado para los bloques de Registro Calificado y Acreditación */}
        <div
        style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '5px 15px',
            marginBottom: '20px'
        }}
        >
            <Box
                sx={{
                p: 2,
                borderRadius: '4px',
                backgroundColor: registroCalificado.color,
                color: 'Dark Gray',
                fontWeight: 'bold',
                flex: 1,
                marginRight: '10px'
                }}
            >
                <Typography variant="body1" align="center" fontWeight= "bold">
                ¿Obtuvo o tiene Registro calificado?
                </Typography>
                <Typography variant="body2" align="center" fontWeight= "bold">
                {registroCalificado.estado}
                </Typography>
            </Box>
            <Box
                sx={{
                p: 2,
                borderRadius: '4px',
                backgroundColor: acreditacion.color,
                color: 'Dark Gray',
                fontWeight: 'bold',
                flex: 1,
                marginLeft: '10px'
                }}
            >
                <Typography variant="body1" align="center" fontWeight= "bold">
                ¿Obtuvo o tiene Acreditación?
                </Typography>
                <Typography variant="body2" align="center" fontWeight= "bold">
                {acreditacion.estado}
                </Typography>
            </Box>
        </div> 

        {/* Bloque para HSCPM */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '15px 15px 30px 15px' }}>
            {/* Bloque HSCPM Registro Calificado */}
            <Box
                sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                backgroundColor: 'background.paper',
                width: '500px',
                textAlign: 'center'
                }}
            >
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                ¿Cuenta con HSCPM Registro calificado?
                </Typography>
                <FormControl
                component="fieldset"
                disabled={!isPlan}
                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                >
                <RadioGroup
                    row
                    value={tieneHSCPM_RC}
                    onChange={handleFieldChange(setTieneHSCPM_RC)}
                >
                    <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                    <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
                </FormControl>
                {tieneHSCPM_RC === 'Si' && (
                <TextField
                    label="URL"
                    variant="outlined"
                    value={urlHSCPM_RRC}
                    onChange={handleFieldChange(setUrlHSCPM_RRC)}
                    placeholder="http://example.com"
                    fullWidth
                    disabled={!isPlan}
                    sx={{ mt: 1 }}
                />
                )}
            </Box>

            {/* Bloque HSCPM Acreditación */}
            <Box
                sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                backgroundColor: 'background.paper',
                width: '500px',
                textAlign: 'center'
                }}
            >
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                ¿Cuenta con HSCPM Acreditación?
                </Typography>
                <FormControl
                component="fieldset"
                disabled={!isPlan}
                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                >
                <RadioGroup
                    row
                    value={tieneHSCPM_AAC}
                    onChange={handleFieldChange(setTieneHSCPM_AAC)}
                >
                    <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                    <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
                </FormControl>
                {tieneHSCPM_AAC === 'Si' && (
                <TextField
                    label="URL"
                    variant="outlined"
                    value={urlHSCPM_AAC}
                    onChange={handleFieldChange(setUrlHSCPM_AAC)}
                    placeholder="http://example.com"
                    fullWidth
                    disabled={!isPlan}
                    sx={{ mt: 1 }}
                />
                )}
            </Box>
        </div>  

            {/* Se oculta el campo de estado del proceso
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
            */}

            {/* Se oculta el campo de porcentaje de anexos
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
            */}

            {/* Se oculta el campo de Registro Calificado
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
            */}

            {/* Se oculta el campo de Acreditación}    
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

            */}

            {/* Se oculta el campo de HSCPM
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
            */}

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <Box
                    sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '12px',
                    backgroundColor: 'background.paper',
                    width: '600px',
                    textAlign: 'center'
                    }}
                >
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                    ¿Recibió Visita de Pares?
                    </Typography>
                    <FormControl
                    component="fieldset"
                    disabled={!isPlan}
                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                    >
                    <RadioGroup
                        row
                        value={recibioVisitaPares}
                        onChange={handleFieldChange(setRecibioVisitaPares)}
                    >
                        <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                        <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                    </FormControl>
                </Box>
            </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
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
        </>
    );
};

export default SeguimientoPM;
