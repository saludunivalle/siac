import React, { useEffect, useState } from 'react';
import { FormControl, TextField, InputLabel, Container, Grid, IconButton, Box, Paper, Button, Typography, Modal, Select, MenuItem, CircularProgress, Backdrop } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FiltroFirmas, sendDataFirma } from '../service/data';

const FormComponent = ({ idPrograma }) => {
    const [openModal, setOpenModal] = useState(false);
    const [rows, setRows] = useState([{ nombre: '', cargo: '', tel: '', correo: '', responsable: '', disabled: false }]);
    const [hasRecords, setHasRecords] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const responsables = [
        { value: '', label: 'Sin seleccionar' },
        { value: 'Responsable de la relación docencia servicio por parte de la Institución de Educación Superior', label: 'Responsable de la relación docencia servicio por parte de la Institución de Educación Superior' },
        { value: 'Responsable de la coordinación de las prácticas formativas en el escenario (No aplica para escenarios no institucionales)', label: 'Responsable de la coordinación de las prácticas formativas en el escenario (No aplica para escenarios no institucionales)' }
    ];

    useEffect(() => {
        cargarFirmasExistente();
    }, []);

    const cargarFirmasExistente = async () => {
        try {
            const resultfirmas = await FiltroFirmas();
            if (resultfirmas) {
                const firmasFiltradas = resultfirmas.filter(firma => firma.id_programa === idPrograma);
                if (firmasFiltradas.length > 0) {
                    const firmasConEstado = firmasFiltradas.map(firma => ({ ...firma, disabled: true }));
                    setRows(firmasConEstado);
                    setHasRecords(true);
                }
            } else {
                console.log('No hay firmas');
            }
        } catch (error) {
            setError('Error al cargar las firmas existentes.');
            console.error('Error al cargar las firmas existentes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    const handleAddRow = () => {
        setRows([...rows, { nombre: '', cargo: '', tel: '', correo: '', responsable: '', disabled: false }]);
    };

    const handleDeleteRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleSave = async (index) => {
        setSaving(true);
        try {
            const row = rows[index];
            const formData = [
                idPrograma,
                row.nombre,
                row.cargo,
                row.tel,
                row.correo,
                row.responsable,
            ];

            await sendDataFirma(formData);
            console.log('Datos enviados:', formData);
            setOpenModal(true);
            const newRows = [...rows];
            newRows[index].disabled = true;
            setRows(newRows);
        } catch (error) {
            setError('Error al enviar los datos.');
            console.error('Error al enviar los datos:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Grid container spacing={1} alignItems="center">
                {rows.map((row, index) => (
                    <Grid item xs={12} key={index}>
                        <Container style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', gap: '5px' }}>
                            <TextField
                                label="Nombre"
                                name="nombre"
                                value={row.nombre}
                                onChange={(e) => handleChange(index, e)}
                                fullWidth
                                disabled={row.disabled}
                            />
                            <TextField
                                label="Cargo"
                                name="cargo"
                                value={row.cargo}
                                onChange={(e) => handleChange(index, e)}
                                fullWidth
                                disabled={row.disabled}
                            />
                            <TextField
                                label="Teléfono"
                                name="tel"
                                value={row.tel}
                                onChange={(e) => handleChange(index, e)}
                                fullWidth
                                disabled={row.disabled}
                            />
                            <TextField
                                label="Correo"
                                name="correo"
                                value={row.correo}
                                onChange={(e) => handleChange(index, e)}
                                fullWidth
                                disabled={row.disabled}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Responsable</InputLabel>
                                <Select
                                    name="responsable"
                                    value={row.responsable}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={row.disabled}
                                >
                                    {responsables.map((option, idx) => (
                                        <MenuItem key={idx} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ display: 'flex', alignItems: 'center', height: '56px', marginLeft: '10px' }}>
                                {!row.disabled && (
                                    <Paper
                                        elevation={3}
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70px !important', height: '50px', backgroundColor: '#00d453', cursor: 'pointer' }}
                                        onClick={() => handleSave(index)}
                                    >
                                        <IconButton sx={{ color: 'white', padding: 0 }}>
                                            <SaveIcon fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                )}
                                <Paper
                                    elevation={3}
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70px !important', height: '50px', backgroundColor: '#ff4141', cursor: 'pointer' }}
                                    onClick={() => handleDeleteRow(index)}
                                >
                                    <IconButton sx={{ color: 'white', padding: 0 }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Paper>
                                {index === rows.length - 1 && (
                                    <Paper
                                        elevation={3}
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70px !important', height: '50px', backgroundColor: '#2596be', cursor: 'pointer' }}
                                        onClick={handleAddRow}
                                    >
                                        <IconButton sx={{ color: 'white', padding: 0 }}>
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                )}
                            </Box>
                        </Container>
                    </Grid>
                ))}
            </Grid>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    color: '#423b3b',
                    border: '2px solid grey',
                    borderRadius: '10px',
                    boxShadow: 24,
                    p: 4,
                    padding: '25px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                }}>
                    <Typography variant="h6" component="h2" style={{ fontFamily: 'Roboto' }} gutterBottom>
                        Sus datos han sido guardados exitosamente
                    </Typography>
                    <Button style={{ backgroundColor: '#1A80D9', color: '#F2F2F2' }} onClick={() => setOpenModal(false)}>Cerrar</Button>
                </div>
            </Modal>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={saving}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default FormComponent;
