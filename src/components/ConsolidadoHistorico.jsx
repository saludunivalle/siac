import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import TimelineComponent from "./Timeline";
import "/src/styles/timeline.css";
import "/src/styles/dashboard.css";

const ConsolidadoHistorico = ({
  data,
  programaAcademico,
  showTitle = true,
}) => {
  console.log("Datos recibidos en ConsolidadoHistorico:", data);
  // Estados para los filtros
  const [filtroPrograma, setFiltroPrograma] = useState("Todos");
  const [filtroSede, setFiltroSede] = useState("Todos");
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [filtroFormacion, setFiltroFormacion] = useState("Todos");
  const [opcionesFiltros, setOpcionesFiltros] = useState({
    programas: [],
    sedes: [],
    niveles: [],
    formaciones: [],
  });
  const [tabValue, setTabValue] = useState(0);
  // Normalize values - treat "N/A", empty strings, and whitespace as null
  const normalizeValue = (value) => {
    if (
      !value ||
      value === "N/A" ||
      value === "" ||
      value === "NULL" ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return null;
    }
    return typeof value === "string" ? value.trim() : value;
  };

  const normalizeFormacion = (value) => {
    const normalized = normalizeValue(value);
    if (!normalized) return null;

    const lower = normalized.toLowerCase();
    if (
      lower === "universitario" ||
      lower === "especializacion universitaria" ||
      lower === "especialización universitaria"
    ) {
      return "Profesional";
    }

    return normalized;
  };

  const getNivelFormacion = (item) =>
    normalizeFormacion(
      item.nivel_formacion ||
        item["nivel_formación"] ||
        item["nivel de formación"] ||
        item["nivel de formacion"] ||
        item["nivel_de_formacion"] ||
        item["Nivel de Formación"] ||
        item["Nivel de Formacion"],
    );

  // Parse date - handle both year format (YYYY) and full date format (YYYY-MM-DD)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // If it's just a year (4 digits)
    if (/^\d{4}$/.test(dateStr)) {
      return new Date(parseInt(dateStr), 0, 1);
    }

    // If it's a full date
    if (dateStr.includes("-")) {
      return new Date(dateStr);
    }

    // If it's in DD/MM/YYYY format
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }

    return new Date(dateStr);
  };

  // Calculate end date from duration if fecha_fin is not provided
  const calculateEndDate = (fechaIni, duracion) => {
    if (!fechaIni || !duracion) return null;

    const startDate = parseDate(fechaIni);
    if (!startDate) return null;

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + parseInt(duracion));
    return endDate;
  };

  // Process and group data by programa
  const processConsolidatedData = (rawData) => {
    if (!Array.isArray(rawData)) return {};

    const processedData = rawData
      .filter((item) => item && item.programa)
      .map((item) => ({
        id: item.id,
        id_programa: item.id_programa,
        programa: normalizeValue(item.programa),
        proceso: normalizeValue(item.proceso),
        resolucion: normalizeValue(item.resolucion),
        fecha_ini: normalizeValue(item.fecha_ini),
        duracion: normalizeValue(item.duracion),
        url_doc: normalizeValue(item.url_doc),
        rechazado_aprobado: normalizeValue(item["rechazado/aprobado"]),
        conteo_resolucion: normalizeValue(item.conteo_resolucion),
        fecha_fin: normalizeValue(item.fecha_fin),
      }))
      .filter((item) => {
        // All required fields must be non-null for timeline rendering
        const hasRequiredFields =
          item.resolucion !== null &&
          item.fecha_ini !== null &&
          item.fecha_fin !== null &&
          item.duracion !== null &&
          item.conteo_resolucion !== null;

        // Validate conteo_resolucion is in valid range {0,1,2,3}
        const validConteo =
          item.conteo_resolucion !== null &&
          [0, 1, 2, 3].includes(parseInt(item.conteo_resolucion));

        // Validate duracion is >= 0
        const validDuracion =
          item.duracion !== null && parseInt(item.duracion) >= 0;

        return hasRequiredFields && validConteo && validDuracion;
      })
      .map((item) => {
        const startDate = parseDate(item.fecha_ini);
        const endDate = item.fecha_fin
          ? parseDate(item.fecha_fin)
          : calculateEndDate(item.fecha_ini, item.duracion);

        return {
          ...item,
          startDate,
          endDate,
          isInitial: item.conteo_resolucion === 0,
          isRejected: item.rechazado_aprobado === "rechazado",
        };
      });

    // Group by programa
    const groupedData = {};
    processedData.forEach((item) => {
      const programaKey = item.programa || `Programa ${item.id_programa}`;
      if (!groupedData[programaKey]) {
        groupedData[programaKey] = [];
      }
      groupedData[programaKey].push(item);
    });

    // Sort each group by fecha_ini
    Object.keys(groupedData).forEach((programa) => {
      groupedData[programa].sort((a, b) => {
        if (a.startDate && b.startDate) {
          const dateCompare = a.startDate - b.startDate;
          if (dateCompare !== 0) return dateCompare;
        }
        return (a.conteo_resolucion || 0) - (b.conteo_resolucion || 0);
      });
    });

    return groupedData;
  };

  // Generar opciones de filtros que se afectan mutuamente
  const generarOpcionesFiltros = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return { programas: [], sedes: [], niveles: [], formaciones: [] };
    }

    // Solo usar datos con programa para construir opciones
    const datosConHistorial = data.filter((item) => item && item.programa);

    // Para cada filtro, considerar solo los otros filtros activos (no el mismo)
    // Esto permite que las opciones cambien dinámicamente

    // Opciones para programas (filtrado por sede y nivel)
    const datosFiltradosParaProgramas = datosConHistorial.filter((item) => {
      const cumpleSede = filtroSede === "Todos" || item.sede === filtroSede;
      const cumpleNivel =
        filtroNivel === "Todos" ||
        item.nivel_academico === filtroNivel ||
        item["pregrado/posgrado"] === filtroNivel;
      const cumpleFormacion =
        filtroFormacion === "Todos" ||
        getNivelFormacion(item) === filtroFormacion;
      return cumpleSede && cumpleNivel && cumpleFormacion;
    });

    // Opciones para sedes (filtrado por programa y nivel)
    const datosFiltradosParaSedes = datosConHistorial.filter((item) => {
      const cumplePrograma =
        filtroPrograma === "Todos" || item.programa === filtroPrograma;
      const cumpleNivel =
        filtroNivel === "Todos" ||
        item.nivel_academico === filtroNivel ||
        item["pregrado/posgrado"] === filtroNivel;
      const cumpleFormacion =
        filtroFormacion === "Todos" ||
        getNivelFormacion(item) === filtroFormacion;
      return cumplePrograma && cumpleNivel && cumpleFormacion;
    });

    // Opciones para niveles (filtrado por programa y sede)
    const datosFiltradosParaNiveles = datosConHistorial.filter((item) => {
      const cumplePrograma =
        filtroPrograma === "Todos" || item.programa === filtroPrograma;
      const cumpleSede = filtroSede === "Todos" || item.sede === filtroSede;
      const cumpleFormacion =
        filtroFormacion === "Todos" ||
        getNivelFormacion(item) === filtroFormacion;
      return cumplePrograma && cumpleSede && cumpleFormacion;
    });

    // Opciones para nivel de formacion (filtrado por programa, sede y nivel)
    const datosFiltradosParaFormaciones = datosConHistorial.filter((item) => {
      const cumplePrograma =
        filtroPrograma === "Todos" || item.programa === filtroPrograma;
      const cumpleSede = filtroSede === "Todos" || item.sede === filtroSede;
      const cumpleNivel =
        filtroNivel === "Todos" ||
        item.nivel_academico === filtroNivel ||
        item["pregrado/posgrado"] === filtroNivel;
      return cumplePrograma && cumpleSede && cumpleNivel;
    });

    const programasDisponibles = [
      ...new Set(
        datosFiltradosParaProgramas
          .map((item) => item.programa)
          .filter((p) => p),
      ),
    ].sort();
    const sedesDisponibles = [
      ...new Set(
        datosFiltradosParaSedes.map((item) => item.sede).filter((s) => s),
      ),
    ].sort();
    const nivelesDisponibles = [
      ...new Set(
        datosFiltradosParaNiveles
          .map((item) => item.nivel_academico || item["pregrado/posgrado"])
          .filter((n) => n),
      ),
    ].sort();
    const formacionesDisponibles = [
      ...new Set(
        datosFiltradosParaFormaciones
          .map((item) => getNivelFormacion(item))
          .filter((n) => n),
      ),
    ].sort();

    return {
      programas: programasDisponibles,
      sedes: sedesDisponibles,
      niveles: nivelesDisponibles,
      formaciones: formacionesDisponibles,
    };
  };

  // Actualizar opciones cuando cambien los datos o los filtros
  useEffect(() => {
    const nuevasOpciones = generarOpcionesFiltros();
    console.log("Opciones actualizadas:", nuevasOpciones);
    setOpcionesFiltros(nuevasOpciones);
  }, [data, filtroPrograma, filtroSede, filtroNivel, filtroFormacion]);

  // Filtrar datos según los filtros seleccionados
  const dataFiltrada = data.filter((item) => {
    const cumplePrograma =
      filtroPrograma === "Todos" || item.programa === filtroPrograma;
    const cumpleSede = filtroSede === "Todos" || item.sede === filtroSede;
    const cumpleNivel =
      filtroNivel === "Todos" ||
      item.nivel_academico === filtroNivel ||
      item["pregrado/posgrado"] === filtroNivel;
    const cumpleFormacion =
      filtroFormacion === "Todos" ||
      getNivelFormacion(item) === filtroFormacion;

    return cumplePrograma && cumpleSede && cumpleNivel && cumpleFormacion;
  });
  console.log("Datos filtrados para visualización:", dataFiltrada);

  const consolidatedData = processConsolidatedData(dataFiltrada);
  const programas = Object.keys(consolidatedData);

  // Calcular estadísticas generales
  const calcularEstadisticasGenerales = () => {
    if (!Array.isArray(dataFiltrada) || dataFiltrada.length === 0) {
      return {
        totalProgramas: 0,
        promedioVigenciaPregrado: 0,
        promedioVigenciaPosgrado: 0,
        porcentajeAcreditados: 0,
        programasAcreditados: 0,
        programasAcreditables: 0,
        conteoResoluciones: {},
      };
    }

    // Obtener programas únicos con sus datos más recientes
    const programasUnicos = {};
    const getFechaValue = (value) => {
      if (!value) return -Infinity;
      const date = new Date(value);
      const time = date.getTime();
      return Number.isNaN(time) ? -Infinity : time;
    };

    dataFiltrada.forEach((item) => {
      const programaKey =
        item.id_programa !== null && item.id_programa !== undefined
          ? String(item.id_programa)
          : item.programa;

      if (!programaKey) return;

      const currentFecha = getFechaValue(item.fecha_ini);
      const existingFecha = getFechaValue(
        programasUnicos[programaKey]?.fecha_ini,
      );

      if (!programasUnicos[programaKey] || currentFecha > existingFecha) {
        programasUnicos[programaKey] = item;
      }
    });

    const programasArray = Object.values(programasUnicos);
    console.log("Programas únicos para estadísticas:", programasArray);
    const totalProgramas = programasArray.length;

    // Calcular promedio de vigencia por nivel académico
    const pregrados = programasArray.filter(
      (p) =>
        p.nivel_academico === "Pregrado" ||
        p["pregrado/posgrado"] === "Pregrado",
    );
    const posgrados = programasArray.filter(
      (p) =>
        p.nivel_academico === "Posgrado" ||
        p["pregrado/posgrado"] === "Posgrado",
    );

    const calcularPromedioVigencia = (programas) => {
      if (programas.length === 0) return 0;
      const sumaVigencia = programas.reduce((sum, p) => {
        const duracion = parseInt(p.duracion) || 0;
        return sum + duracion;
      }, 0);
      return (sumaVigencia / programas.length).toFixed(1);
    };

    const promedioVigenciaPregrado = calcularPromedioVigencia(pregrados);
    const promedioVigenciaPosgrado = calcularPromedioVigencia(posgrados);

    // Calcular programas acreditados vigentes segun estadoaac
    const estadosAacValidos = new Set(["Vigente", "Vigente (En trámite)"]);

    const programasAcreditadosVigentes = programasArray.filter((p) => {
      const estadoAac = normalizeValue(p.estadoaac || p["estadoaac"]);
      return estadoAac && estadosAacValidos.has(estadoAac);
    });

    const programasAcreditables = programasArray.filter((p) => {
      const acreditableValue = normalizeValue(
        p.acreditable || p["acreditable"] || p["Acreditable"],
      );
      return (
        typeof acreditableValue === "string" &&
        acreditableValue.toLowerCase() === "acreditable"
      );
    });

    const porcentajeAcreditados =
      programasAcreditables.length > 0
        ? (
            (programasAcreditadosVigentes.length /
              programasAcreditables.length) *
            100
          ).toFixed(1)
        : 0;

    // Calcular estadísticas de conteo de resoluciones
    const programasConResolucion = programasArray.filter((p) => p.resolucion);
    const conteoResoluciones = programasConResolucion.reduce((acc, p) => {
      const conteo = parseInt(p.conteo_resolucion) || 0;
      acc[conteo] = (acc[conteo] || 0) + 1;
      return acc;
    }, {});

    return {
      totalProgramas,
      promedioVigenciaPregrado: parseFloat(promedioVigenciaPregrado),
      promedioVigenciaPosgrado: parseFloat(promedioVigenciaPosgrado),
      porcentajeAcreditados: parseFloat(porcentajeAcreditados),
      programasAcreditados: programasAcreditadosVigentes.length,
      programasAcreditables: programasAcreditables.length,
      conteoResoluciones,
    };
  };

  const estadisticasGenerales = calcularEstadisticasGenerales();

  // Funciones para manejar cambios en los filtros con validación cruzada
  const handleFiltroChange = (tipo, valor) => {
    // Crear un estado temporal con el nuevo valor
    let nuevoFiltroPrograma = filtroPrograma;
    let nuevoFiltroSede = filtroSede;
    let nuevoFiltroNivel = filtroNivel;
    let nuevoFiltroFormacion = filtroFormacion;

    // Actualizar el filtro que cambió
    switch (tipo) {
      case "programa":
        nuevoFiltroPrograma = valor;
        break;
      case "sede":
        nuevoFiltroSede = valor;
        break;
      case "nivel":
        nuevoFiltroNivel = valor;
        break;
      case "formacion":
        nuevoFiltroFormacion = valor;
        break;
      default:
        break;
    }

    // Verificar que los otros filtros sigan siendo válidos con el nuevo filtro
    const datosConHistorial = data.filter((item) => item && item.programa);

    const datosFiltrados = datosConHistorial.filter((item) => {
      const cumplePrograma =
        nuevoFiltroPrograma === "Todos" ||
        item.programa === nuevoFiltroPrograma;
      const cumpleSede =
        nuevoFiltroSede === "Todos" || item.sede === nuevoFiltroSede;
      const cumpleNivel =
        nuevoFiltroNivel === "Todos" ||
        item.nivel_academico === nuevoFiltroNivel ||
        item["pregrado/posgrado"] === nuevoFiltroNivel;
      const cumpleFormacion =
        nuevoFiltroFormacion === "Todos" ||
        getNivelFormacion(item) === nuevoFiltroFormacion;

      return cumplePrograma && cumpleSede && cumpleNivel && cumpleFormacion;
    });

    // Obtener opciones válidas después del filtrado
    const programasValidos = [
      ...new Set(datosFiltrados.map((item) => item.programa).filter((p) => p)),
    ];
    const sedesValidas = [
      ...new Set(datosFiltrados.map((item) => item.sede).filter((s) => s)),
    ];
    const nivelesValidos = [
      ...new Set(
        datosFiltrados
          .map((item) => item.nivel_academico || item["pregrado/posgrado"])
          .filter((n) => n),
      ),
    ];
    const formacionesValidas = [
      ...new Set(
        datosFiltrados.map((item) => getNivelFormacion(item)).filter((n) => n),
      ),
    ];

    // Resetear filtros que ya no son válidos
    if (
      nuevoFiltroPrograma !== "Todos" &&
      !programasValidos.includes(nuevoFiltroPrograma)
    ) {
      nuevoFiltroPrograma = "Todos";
    }
    if (
      nuevoFiltroSede !== "Todos" &&
      !sedesValidas.includes(nuevoFiltroSede)
    ) {
      nuevoFiltroSede = "Todos";
    }
    if (
      nuevoFiltroNivel !== "Todos" &&
      !nivelesValidos.includes(nuevoFiltroNivel)
    ) {
      nuevoFiltroNivel = "Todos";
    }
    if (
      nuevoFiltroFormacion !== "Todos" &&
      !formacionesValidas.includes(nuevoFiltroFormacion)
    ) {
      nuevoFiltroFormacion = "Todos";
    }

    // Aplicar todos los cambios
    setFiltroPrograma(nuevoFiltroPrograma);
    setFiltroSede(nuevoFiltroSede);
    setFiltroNivel(nuevoFiltroNivel);
    setFiltroFormacion(nuevoFiltroFormacion);
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroPrograma("Todos");
    setFiltroSede("Todos");
    setFiltroNivel("Todos");
    setFiltroFormacion("Todos");
  };

  // Contar cuántos filtros están activos
  const filtrosActivos = [
    filtroPrograma,
    filtroSede,
    filtroNivel,
    filtroFormacion,
  ].filter((f) => f !== "Todos").length;

  // Función para manejar cambio de pestañas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fechaActualTexto = formatDate(new Date());

  // Función para obtener el color de la resolución
  const getResolutionColor = (item) => {
    if (item.isRejected) return "#f44336"; // Red for rejected

    const conteo = parseInt(item.conteo_resolucion);
    switch (conteo) {
      case 0:
        return "#DAA520"; // Amarillo mostaza - Acreditación primera vez
      case 1:
        return "#4caf50"; // Verde - Primera renovación
      case 2:
        return "#2196f3"; // Azul - Segunda renovación
      case 3:
        return "#9c27b0"; // Morado - Tercera renovación
      default:
        return "#757575"; // Gris - Fallback
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {showTitle && (
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: "#2c3e50",
              fontWeight: "bold",
            }}
          >
            Consolidado Histórico de Acreditaciones
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="body2" color="text.secondary"></Typography>
          </Box>
        </Box>
      )}

      {/* Sección de Filtros */}
      <Box sx={{ mb: 6 }}>
        {filtrosActivos > 0 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Chip
              label={`${filtrosActivos} filtro${filtrosActivos > 1 ? "s" : ""} activo${filtrosActivos > 1 ? "s" : ""}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Programa Académico</InputLabel>
              <Select
                value={filtroPrograma}
                onChange={(e) => handleFiltroChange("programa", e.target.value)}
                label="Programa Académico"
              >
                <MenuItem value="Todos">Todos los programas</MenuItem>
                {opcionesFiltros.programas.map((programa, index) => (
                  <MenuItem key={index} value={programa}>
                    {programa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sede</InputLabel>
              <Select
                value={filtroSede}
                onChange={(e) => handleFiltroChange("sede", e.target.value)}
                label="Sede"
              >
                <MenuItem value="Todos">Todas las sedes</MenuItem>
                {opcionesFiltros.sedes.map((sede, index) => (
                  <MenuItem key={index} value={sede}>
                    {sede}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Nivel Académico</InputLabel>
              <Select
                value={filtroNivel}
                onChange={(e) => handleFiltroChange("nivel", e.target.value)}
                label="Nivel Académico"
              >
                <MenuItem value="Todos">Todos los niveles</MenuItem>
                {opcionesFiltros.niveles.map((nivel, index) => (
                  <MenuItem key={index} value={nivel}>
                    {nivel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Nivel de formación</InputLabel>
              <Select
                value={filtroFormacion}
                onChange={(e) =>
                  handleFiltroChange("formacion", e.target.value)
                }
                label="Nivel de formación"
              >
                <MenuItem value="Todos">Todos los niveles</MenuItem>
                {opcionesFiltros.formaciones.map((formacion, index) => (
                  <MenuItem key={index} value={formacion}>
                    {formacion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {filtrosActivos > 0 && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Chip
              label="Limpiar filtros"
              onClick={limpiarFiltros}
              onDelete={limpiarFiltros}
              color="secondary"
              variant="outlined"
              sx={{ cursor: "pointer" }}
            />
          </Box>
        )}
      </Box>

      {dataFiltrada.length === 0 && (
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {filtrosActivos > 0
              ? "No hay datos para la seleccion actual"
              : "No hay datos históricos disponibles"}
          </Typography>
        </Box>
      )}

      {dataFiltrada.length > 0 && (
        <>
          {/* Tarjetas de Estadísticas Generales */}
          <Grid container spacing={2} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="nivel-card card-shadow-hover"
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
                  color: "white",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 48px rgba(211, 47, 47, 0.4)",
                    filter: "brightness(1.05)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    borderRadius: "8px",
                    zIndex: 1,
                  },
                }}
              >
                <CardContent
                  sx={{
                    padding: "12px !important",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: "1.5rem",
                      lineHeight: 1,
                      textAlign: "center",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {estadisticasGenerales.totalProgramas}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.95,
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                      mb: 1,
                      textAlign: "center",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Total de Programas Académicos
                  </Typography>
                  {filtrosActivos > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        opacity: 0.8,
                      }}
                    >
                      Filtrado
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="nivel-card card-shadow-hover"
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
                  color: "white",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 48px rgba(211, 47, 47, 0.4)",
                    filter: "brightness(1.05)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    borderRadius: "8px",
                    zIndex: 1,
                  },
                }}
              >
                <CardContent
                  sx={{
                    padding: "12px !important",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: "1.5rem",
                      lineHeight: 1,
                      textAlign: "center",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {estadisticasGenerales.promedioVigenciaPregrado}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.95,
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                      mb: 0.5,
                      textAlign: "center",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Años de Vigencia Promedio
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      opacity: 0.8,
                    }}
                  >
                    Programas de Pregrado
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="nivel-card card-shadow-hover"
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
                  color: "white",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 48px rgba(211, 47, 47, 0.4)",
                    filter: "brightness(1.05)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    borderRadius: "8px",
                    zIndex: 1,
                  },
                }}
              >
                <CardContent
                  sx={{
                    padding: "12px !important",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: "1.5rem",
                      lineHeight: 1,
                      textAlign: "center",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {estadisticasGenerales.promedioVigenciaPosgrado}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.95,
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                      mb: 0.5,
                      textAlign: "center",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Años de Vigencia Promedio
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      opacity: 0.8,
                    }}
                  >
                    Programas de Posgrado
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="nivel-card card-shadow-hover"
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
                  color: "white",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 48px rgba(211, 47, 47, 0.4)",
                    filter: "brightness(1.05)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    borderRadius: "8px",
                    zIndex: 1,
                  },
                }}
              >
                <CardContent
                  sx={{
                    padding: "12px !important",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: "1.5rem",
                      lineHeight: 1,
                      textAlign: "center",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {estadisticasGenerales.porcentajeAcreditados}%
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.95,
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                      mb: 0.5,
                      textAlign: "center",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Programas Acreditados Vigentes
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      opacity: 0.8,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {estadisticasGenerales.programasAcreditados} de{" "}
                    {estadisticasGenerales.programasAcreditables} acreditables
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      opacity: 0.7,
                      display: "block",
                      mb: 0.5,
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {estadisticasGenerales.programasAcreditables} acreditables
                  </Typography>
                  {Object.keys(estadisticasGenerales.conteoResoluciones)
                    .length > 0 && (
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}
                    >
                      {Object.entries(estadisticasGenerales.conteoResoluciones)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([conteo, cantidad]) => (
                          <Typography
                            key={conteo}
                            variant="caption"
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              textAlign: "center",
                              opacity: 0.8,
                            }}
                          >
                            {`${conteo === "0" ? "Inicial" : `${conteo}° Renov`}: ${cantidad}`}
                          </Typography>
                        ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {programas.length === 0 ? (
            <Box sx={{ mb: 6, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No hay datos historicos para la seleccion actual
              </Typography>
            </Box>
          ) : (
            <>
              {/* Leyenda General de Colores */}
              <Box sx={{ mt: 6, mb: 6 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "600", color: "#2c3e50" }}
                >
                  Leyenda de Colores de Acreditaciones
                </Typography>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 12,
                        bgcolor: "#DAA520",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      Acreditación por primera vez
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 12,
                        bgcolor: "#4caf50",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      Primera renovación de acreditación de alta calidad
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 12,
                        bgcolor: "#2196f3",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      Segunda renovación de acreditación de alta calidad
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 12,
                        bgcolor: "#9c27b0",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      Tercera renovación de acreditación de alta calidad
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 12,
                        bgcolor: "#f44336",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      Acreditación rechazada
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Sistema de Pestañas */}
              <Box sx={{ mt: 4, mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  centered
                  sx={{
                    "& .MuiTab-root": {
                      fontWeight: 600,
                      fontSize: "1rem",
                      textTransform: "none",
                      minHeight: 48,
                      px: 3,
                    },
                    "& .Mui-selected": {
                      color: "#D32F2F",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#D32F2F",
                      height: 3,
                    },
                  }}
                >
                  <Tab label="Vista de Línea de Tiempo" />
                  <Tab label="Vista de Tabla" />
                </Tabs>
              </Box>

              {/* Contenido de las Pestañas */}
              {tabValue === 0 && (
                <Grid container spacing={4} sx={{ mt: 2 }}>
                  {programas.map((programa, index) => {
                    const timelineData = consolidatedData[programa];

                    return (
                      <Grid item xs={12} key={programa}>
                        {/* Programa Header */}
                        <Box
                          sx={{
                            mb: 3,
                            display: "flex",
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                              color: "#2c3e50",
                              fontWeight: "600",
                              minWidth: "300px",
                              marginRight: "40px",
                              textAlign: "left",
                              lineHeight: 1.2,
                            }}
                          >
                            {programa}
                          </Typography>
                        </Box>

                        {/* Timeline */}
                        <TimelineComponent
                          data={timelineData}
                          programaAcademico={programa}
                          showTitle={false}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {tabValue === 1 && (
                <TableContainer
                  component={Paper}
                  sx={{ mt: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                  <Table
                    sx={{ minWidth: 650 }}
                    aria-label="tabla de acreditaciones"
                  >
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Programa Académico
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Resolución
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Tipo
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Fecha Inicio
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Fecha Fin
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Duración (años)
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Estado
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2c3e50" }}
                        >
                          Documento
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {programas.map((programa) => {
                        const timelineData = consolidatedData[programa];
                        return timelineData.map((item, index) => (
                          <TableRow
                            key={`${programa}-${item.id || index}`}
                            sx={{
                              "&:nth-of-type(odd)": {
                                backgroundColor: "#fafafa",
                              },
                              "&:hover": { backgroundColor: "#f0f0f0" },
                            }}
                          >
                            <TableCell sx={{ fontWeight: "500" }}>
                              {index === 0 ? programa : ""}
                            </TableCell>
                            <TableCell sx={{ fontWeight: "500" }}>
                              {item.resolucion}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    backgroundColor: getResolutionColor(item),
                                  }}
                                />
                                <Typography variant="body2">
                                  {item.isRejected
                                    ? "Rechazada"
                                    : item.isInitial
                                      ? "Acreditación Inicial"
                                      : `Renovación ${item.conteo_resolucion}°`}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{formatDate(item.startDate)}</TableCell>
                            <TableCell>{formatDate(item.endDate)}</TableCell>
                            <TableCell>{item.duracion}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  item.isRejected ? "Rechazada" : "Aprobada"
                                }
                                color={item.isRejected ? "error" : "success"}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {item.url_doc ? (
                                <a
                                  href={item.url_doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#2196f3",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                  }}
                                >
                                  📄 Ver documento
                                </a>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No disponible
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ));
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ConsolidadoHistorico;
