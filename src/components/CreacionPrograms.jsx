import React, { useState } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Container, Grid, Typography, CircularProgress, Modal, Box, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import Header from './Header';
import { sendDataToServerPrograms } from '../service/data'; 
import '/src/styles/home.css';

const CreacionPrograma = () => {
  const initialFormState = {
    programaAcademico: '',
    sede: '',
    facultad: '',
    escuela: '',
    departamento: '',
    seccion: '',
    tipoPrograma: '',
    nivelFormacion: '',
    tituloAConceder: '',
    jornada: '',
    modalidad: '',
    creditos: '',
    periodicidad: '',
    duracion: '',
    tipoCreacion: '' 
  };

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Manejador para actualizar el estado del formulario al cambiar los campos
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  // Manejador para guardar los datos al hacer clic en el botón "Guardar"
  const handleGuardarClick = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (Object.values(form).some(value => value.trim() === '')) {
        setLoading(false);
        setErrorMessage('Por favor, complete todos los campos obligatorios.');
        return;
      }

      const dataenviar = [
        form.programaAcademico,
        "En Creación",
        form.sede,
        form.facultad,
        form.escuela,
        form.departamento,
        form.seccion,
        form.tipoPrograma,
        form.nivelFormacion,
        form.tituloAConceder,
        form.jornada,
        form.modalidad,
        form.creditos,
        form.periodicidad,
        form.duracion,
        "N/A",
        "N/A",
        "En Creación",
        form.tipoCreacion 
      ];

      console.log("Datos a enviar:", dataenviar); 

      await sendDataToServerPrograms(dataenviar);

      setLoading(false);
      setSuccessMessage('Datos enviados correctamente al servidor.');
      setOpenModal(true);
    } catch (error) {
      setLoading(false);
      setErrorMessage('Error al enviar datos: ' + error.message);
      console.error('Error al enviar datos:', error);
    }
  };

  // Manejador para cerrar el modal de confirmación
  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(initialFormState);
  };

  return (
    <div style={{marginBottom:'50px'}}>
      <Header />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Creación Programa
        </Typography>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Programa Académico"
                name="programaAcademico"
                value={form.programaAcademico}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sede"
                name="sede"
                value={form.sede}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facultad"
                name="facultad"
                value={form.facultad}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Escuela</InputLabel>
                <Select
                  name="escuela"
                  value={form.escuela}
                  onChange={handleChange}
                >
                  <MenuItem value="Bacteriología y Lab. Clínico">Bacteriología y Lab. Clínico</MenuItem>
                  <MenuItem value="Ciencias Básicas">Ciencias Básicas</MenuItem>
                  <MenuItem value="Enfermería">Enfermería</MenuItem>
                  <MenuItem value="Medicina">Medicina</MenuItem>
                  <MenuItem value="Odontología">Odontología</MenuItem>
                  <MenuItem value="Rehabilitación Humana">Rehabilitación Humana</MenuItem>
                  <MenuItem value="Salud Pública">Salud Pública</MenuItem>
                  <MenuItem value="Dirección de Posgrados">Dirección de Posgrados</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Departamento"
                name="departamento"
                value={form.departamento}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sección"
                name="seccion"
                value={form.seccion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Pregrado/Posgrado</InputLabel>
                <Select
                  name="tipoPrograma"
                  value={form.tipoPrograma}
                  onChange={handleChange}
                >
                  <MenuItem value="Posgrado">Posgrado</MenuItem>
                  <MenuItem value="Pregrado">Pregrado</MenuItem>
                  <MenuItem value="Pregrado-Tec">Pregrado-Tec</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Formación</InputLabel>
                <Select
                  name="nivelFormacion"
                  value={form.nivelFormacion}
                  onChange={handleChange}
                >
                  <MenuItem value="Maestría">Maestría</MenuItem>
                  <MenuItem value="Posgrado">Posgrado</MenuItem>
                  <MenuItem value="Universitario">Universitario</MenuItem>
                  <MenuItem value="Especialización">Especialización</MenuItem>
                  <MenuItem value="Especialización Médico Quirúrgica">Especialización Médico Quirúrgica</MenuItem>
                  <MenuItem value="Tecnológico">Tecnológico</MenuItem>
                  <MenuItem value="Doctorado">Doctorado</MenuItem>
                  <MenuItem value="Especialización Universitaria">Especialización Universitaria</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título a Conceder"
                name="tituloAConceder"
                value={form.tituloAConceder}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Jornada</InputLabel>
                <Select
                  name="jornada"
                  value={form.jornada}
                  onChange={handleChange}
                >
                  <MenuItem value="Diurna">Diurna</MenuItem>
                  <MenuItem value="Nocturna">Nocturna</MenuItem>
                  <MenuItem value="Diurna/Nocturna">Diurna/Nocturna</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Modalidad</InputLabel>
                <Select
                  name="modalidad"
                  value={form.modalidad}
                  onChange={handleChange}
                >
                  <MenuItem value="Virtual">Virtual</MenuItem>
                  <MenuItem value="Presencial">Presencial</MenuItem>
                  <MenuItem value="Distancia">Distancia</MenuItem>
                  <MenuItem value="Semipresencial">Semipresencial</MenuItem>
                  <MenuItem value="Desescolarizada / Semipresencial">Desescolarizada / Semipresencial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Créditos"
                name="creditos"
                type="number"
                value={form.creditos}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Periodicidad</InputLabel>
                <Select
                  name="periodicidad"
                  value={form.periodicidad}
                  onChange={handleChange}
                >
                  <MenuItem value="Semestral">Semestral</MenuItem>
                  <MenuItem value="Anual">Anual</MenuItem>
                  <MenuItem value="Trimestral">Trimestral</MenuItem>
                  <MenuItem value="Por Cohorte">Por Cohorte</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duración"
                name="duracion"
                value={form.duracion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de creación</FormLabel>
                <RadioGroup
                  row // Esto hace que los radio buttons se alineen horizontalmente
                  name="tipoCreacion"
                  value={form.tipoCreacion}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Ampliación" control={<Radio />} label="Ampliación" />
                  <FormControlLabel value="Creación" control={<Radio />} label="Creación" />
                  <FormControlLabel value="Extensión" control={<Radio />} label="Extensión" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleGuardarClick} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
              </Button>
            </Grid>
          </Grid>
        </form>
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
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
                <Button style={{ backgroundColor: '#1A80D9', color: '#F2F2F2' }} onClick={handleCloseModal}>Cerrar</Button>
            </div>
        </Modal>
      </Container>
    </div>
  );
};

export default CreacionPrograma;
