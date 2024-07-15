import React, { useState } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Container, Grid, Typography } from '@mui/material';
import Header from './Header';
import '/src/styles/home.css';

const CreacionPrograma = () => {
  const [form, setForm] = useState({
    programaAcademico: '',
    sede: '',
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
    duracion: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(form);
    // Aquí puedes añadir la lógica para guardar el formulario
  };

  return (
    <div style={{marginBottom:'50px'}}>
      <Header />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Creación Programa
        </Typography>
        <form onSubmit={handleSubmit}>
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
              <Button variant="contained" color="primary" type="submit">
                Guardar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  );
};

export default CreacionPrograma;
