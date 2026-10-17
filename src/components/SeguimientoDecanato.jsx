import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const API_URL = "https://siac-server.vercel.app";
const HOJA = "maestroEsceulas";
const HOJA_DEPARTAMENTOS = "maestroDepartamentos";
const DEPARTAMENTOS = [
  ["MFR", "Medicina Física y Rehabilitación"],
  ["PAT", "Patología"],
  ["GO", "Ginecología y Obstetricia"],
  ["MFA", "Medicina Familiar"],
  ["CIR", "Cirugía"],
  ["PSQ", "Psiquiatría"],
  ["ANE", "Anestesiología"],
  ["PED", "Pediatría"],
  ["MIN", "Medicina Interna"],
];
const ESCUELAS = [
  ["BAC", "Bacteriología y Laboratorio Clínico"],
  ["CB", "Ciencias Básicas"],
  ["MED", "Medicina"],
  ["ENF", "Enfermería"],
  ["ODO", "Odontología"],
  ["ERH", "Rehabilitación Humana"],
  ["ESP", "Salud Pública"],
];

const COLUMNAS = [
  ["idAccion", "ID acción"],
  ["idNecesidad", "ID necesidad"],
  ["ejeTematico", "Eje temático"],
  ["necesidad", "Necesidad"],
  ["accion", "Acción"],
  ["tipo", "Tipo"],
  ["nivelGestion", "Nivel de gestión"],
  ["responsable", "Responsable"],
  ...ESCUELAS.map(([key]) => [key, key]),
  ["escuelas", "Escuelas"],
  ["numeroEscuelas", "N.º escuelas"],
  ["prioridad", "Prioridad"],
  ["criterioPrioridad", "Criterio de prioridad"],
  ["productoEsperado", "Producto esperado"],
  ["estado", "Estado"],
  ["fechaLimite", "Fecha límite"],
  ["fechaUltimoAvance", "Fecha último avance"],
  ["notaAvance", "Nota de avance (interna)"],
  ["devueltoEscuela", "Devuelto a la escuela (fecha)"],
  ["vencida", "¿Vencida?"],
  ["hEscuela", "_h_escuela"],
  ["hResp", "_h_resp"],
  ["hAlta", "_h_alta"],
  ["mensajeDependencia", "Mensaje para la dependencia"],
];
const COLUMNAS_DEPARTAMENTOS = [
  ["idAccion", "ID acción"],
  ["idNecesidad", "ID necesidad"],
  ["ejeTematico", "Eje temático"],
  ["necesidad", "Necesidad"],
  ["accion", "Acción"],
  ["tipo", "Tipo"],
  ["nivelGestion", "Nivel de gestión"],
  ["responsable", "Responsable"],
  ...DEPARTAMENTOS.map(([key]) => [key, key]),
  ["departamentos", "Departamentos"],
  ["numeroDepartamentos", "N.º dptos."],
  ["prioridad", "Prioridad"],
  ["criterioPrioridad", "Criterio de prioridad"],
  ["productoEsperado", "Producto esperado"],
  ["estado", "Estado"],
  ["fechaLimite", "Fecha límite"],
  ["fechaUltimoAvance", "Fecha último avance"],
  ["notaAvance", "Nota de avance (interna)"],
  ["devueltoDepartamento", "Devuelto al departamento (fecha)"],
  ["vencida", "¿Vencida?"],
  ["hDep", "_h_dep"],
  ["hResp", "_h_resp"],
  ["hAlta", "_h_alta"],
  ["mensajeDependencia", "Mensaje para la dependencia"],
];

const normalizar = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();
const clave = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
const obtenerValor = (fila, key, label) => {
  if (fila[key] !== undefined) return fila[key];
  const encontrada = Object.keys(fila).find(
    (nombre) => clave(nombre) === clave(label) || clave(nombre) === clave(key),
  );
  return encontrada ? fila[encontrada] : "";
};
const obtenerFilas = (data) => {
  if (Array.isArray(data)) return data;
  return data?.data || data?.rows || data?.registros || data?.values || [];
};

const obtenerEscuelaUsuario = () => {
  try {
    const logged = JSON.parse(sessionStorage.getItem("logged") || "[]");
    const registros = Array.isArray(logged) ? logged : [logged];
    const escuelaUsuario = registros.find((registro) => registro?.escuela)?.escuela;
    if (!escuelaUsuario) return "";
    const escuelaNormalizada = clave(escuelaUsuario);
    return ESCUELAS.find(([codigo, nombre]) =>
      escuelaNormalizada === clave(codigo) || escuelaNormalizada === clave(nombre) || escuelaNormalizada.includes(clave(nombre)),
    )?.[0] || "";
  } catch {
    return "";
  }
};

export default function SeguimientoDecanato() {
  const [filas, setFilas] = useState([]);
  const [filasDepartamentos, setFilasDepartamentos] = useState([]);
  const [isCargo, setCargo] = useState([" "]);
  const [escuela, setEscuela] = useState(obtenerEscuelaUsuario);
  const [departamento, setDepartamento] = useState("");
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargo = sessionStorage.getItem("cargo");
    if (cargo) setCargo(JSON.parse(cargo));
  }, []);

  useEffect(() => {
    let activo = true;
    axios
      .post(`${API_URL}/getSheetMaestros`, { sheet: HOJA })
      .then(({ data }) => {
        if (activo) setFilas(obtenerFilas(data));
      })
      .catch(() => {
        if (activo)
          setError("No fue posible cargar los datos del maestro de escuelas.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    setDepartamento("");
    if (escuela !== "MED" || filasDepartamentos.length) return;
    setCargandoDepartamentos(true);
    axios
      .post(`${API_URL}/getSheetMaestros`, { sheet: HOJA_DEPARTAMENTOS })
      .then(({ data }) => setFilasDepartamentos(obtenerFilas(data)))
      .catch(() =>
        setError("No fue posible cargar los datos de departamentos."),
      )
      .finally(() => setCargandoDepartamentos(false));
  }, [escuela, filasDepartamentos.length]);

  const filasEscuela = useMemo(() => {
    if (!escuela) return filas;
    return filas.filter(
      (fila) => normalizar(obtenerValor(fila, escuela, escuela)) === "x",
    );
  }, [filas, escuela]);

  const filasFiltradas = useMemo(() => {
    if (escuela === "MED" && departamento) {
      return filasDepartamentos.filter(
        (fila) =>
          normalizar(obtenerValor(fila, departamento, departamento)) === "x",
      );
    }
    return filasEscuela;
  }, [escuela, departamento, filasDepartamentos, filasEscuela]);

  const columnasActivas =
    escuela === "MED" && departamento ? COLUMNAS_DEPARTAMENTOS : COLUMNAS;

  const prioridadSx = (valor) => {
    const prioridad = normalizar(valor);
    if (prioridad === "alta")
      return { backgroundColor: "#ffcdd2", color: "#b71c1c", fontWeight: 700 };
    if (prioridad === "media")
      return { backgroundColor: "#fff9c4", color: "#8d6e00", fontWeight: 700 };
    if (prioridad === "baja")
      return { backgroundColor: "#c8e6c9", color: "#1b5e20", fontWeight: 700 };
    return {};
  };

  const cifras = useMemo(() => {
    const resultado = {
      acciones: filasFiltradas.length,
      pendientes: 0,
      enCurso: 0,
      realizadas: 0,
      bloqueadas: 0,
      devueltas: 0,
    };

    filasFiltradas.forEach((fila) => {
      const estado = normalizar(obtenerValor(fila, "estado", "Estado"));
      if (estado === "pendiente") resultado.pendientes += 1;
      if (estado === "en curso") resultado.enCurso += 1;
      if (estado === "realizada") resultado.realizadas += 1;
      if (estado === "bloqueada") resultado.bloqueadas += 1;
      const columnaDevuelta =
        escuela === "MED" && departamento
          ? ["devueltoDepartamento", "Devuelto al departamento (fecha)"]
          : ["devueltoEscuela", "Devuelto a la escuela (fecha)"];
      if (
        String(
          obtenerValor(fila, columnaDevuelta[0], columnaDevuelta[1]) ?? "",
        ).trim()
      ) {
        resultado.devueltas += 1;
      }
    });

    return resultado;
  }, [filasFiltradas, escuela, departamento]);

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          pt: { xs: 10, md: 11 },
          pl: { xs: 7, md: 10 },
          backgroundColor: "#f7f9fc",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Seguimiento Decanato
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Consulta las acciones del maestro y filtra los registros asociados a
          una escuela.
        </Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 300 }} size="small">
            <InputLabel id="escuela-label">Escuela</InputLabel>
            <Select
              labelId="escuela-label"
              value={escuela}
              label="Escuela"
              onChange={(event) => setEscuela(event.target.value)}
            >
              <MenuItem value="">Todas las escuelas</MenuItem>
              {ESCUELAS.map(([key, nombre]) => (
                <MenuItem key={key} value={key}>
                  {key} — {nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {escuela === "MED" && (
            <FormControl
              sx={{ minWidth: 300, ml: { xs: 0, md: 2 }, mt: { xs: 2, md: 0 } }}
              size="small"
            >
              <InputLabel id="departamento-label">Departamento</InputLabel>
              <Select
                labelId="departamento-label"
                value={departamento}
                label="Departamento"
                onChange={(event) => setDepartamento(event.target.value)}
                disabled={cargandoDepartamentos}
              >
                <MenuItem value="">Todos los departamentos</MenuItem>
                {DEPARTAMENTOS.map(([key, nombre]) => (
                  <MenuItem key={key} value={key}>
                    {key} — {nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filasFiltradas.length} registro(s)
            {cargandoDepartamentos ? " · Cargando departamentos..." : ""}
          </Typography>
        </Paper>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small" aria-label="Resumen de acciones">
            <TableHead>
              <TableRow>
                {[
                  "Acciones",
                  "Pendientes",
                  "En curso",
                  "Realizadas",
                  "Bloqueadas",
                  "Devueltas a la escuela",
                ].map((titulo) => (
                  <TableCell
                    key={titulo}
                    align="center"
                    sx={{ fontWeight: 700 }}
                  >
                    {titulo}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {[
                  cifras.acciones,
                  cifras.pendientes,
                  cifras.enCurso,
                  cifras.realizadas,
                  cifras.bloqueadas,
                  cifras.devueltas,
                ].map((cifra, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                  >
                    {cifra}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {cargando ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
            <Table stickyHeader size="small" sx={{ minWidth: 2400 }}>
              <TableHead>
                <TableRow>
                  {columnasActivas.map(([, label]) => (
                    <TableCell
                      key={label}
                      sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filasFiltradas.map((fila, index) => (
                  <TableRow
                    hover
                    key={obtenerValor(fila, "idAccion", "ID acción") || index}
                  >
                    {columnasActivas.map(([key, label]) => (
                      <TableCell
                        key={key}
                        sx={{
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                          ...(key === "prioridad"
                            ? prioridadSx(obtenerValor(fila, key, label))
                            : {}),
                        }}
                      >
                        {obtenerValor(fila, key, label)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
}
