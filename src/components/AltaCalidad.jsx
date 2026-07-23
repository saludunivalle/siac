import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Filtro5, Filtro7, Filtro10 } from "../service/data";
import "../styles/altaCalidad.css";
import "../utils/chartConfig";
import { Bar } from "react-chartjs-2";

const RISK_CONFIG = {
  Alto: { color: "#DC3545", label: "Alto" },
  Medio: { color: "#FF8C00", label: "Medio" },
  Bajo: { color: "#28A745", label: "Bajo" },
  SinRegistro: { color: "#6C757D", label: "Sin registro" },
};

const normalize = (value) => String(value ?? "").trim();

const stripAccents = (value) =>
  normalize(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getFieldValue = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

const isVigente = (estado) => {
  const value = stripAccents(estado);
  return (
    value === "vigente" ||
    value === "vigente (en tramite)" ||
    value === "en tramite"
  );
};

const now = new Date();
const currentYear = now.getFullYear();

const parseDate = (value) => {
  const raw = normalize(value);
  if (!raw) return null;

  const parts = raw.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map((part) => Number(part));
    if ([day, month, year].every((n) => Number.isFinite(n))) {
      return new Date(year, month - 1, day);
    }
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getVencimientoInfo = (fechaVencimiento, estadoaac) => {
  const fecha = parseDate(fechaVencimiento);
  if (!fecha) return { key: "gray", label: "Sin fecha", color: "#6C757D" };

  const now = new Date();
  const diffMonths =
    (fecha.getFullYear() - now.getFullYear()) * 12 +
    (fecha.getMonth() - now.getMonth());

  // Fechas ya vencidas (diffMonths < 0)
  if (diffMonths < 0) {
    if (isVigente(estadoaac)) {
      return { key: "vencidoVigente", label: "Vencido vigente", color: "#E65100" };
    }
    return { key: "vencido", label: "Vencido", color: "#4A0000" };
  }

  if (diffMonths <= 12)
    return { key: "red", label: "A un año", color: "#DC3545" };
  if (diffMonths <= 24)
    return {
      key: "orange",
      label: "A 18 meses",
      color: "#FF8C00",
    };
  if (diffMonths <= 36)
    return {
      key: "yellow",
      label: "A 2 años",
      color: "#F4C430",
    };
  if (diffMonths <= 48)
    return {
      key: "green",
      label: "A 4 años",
      color: "#2E7D32",
    };
  return { key: "darkGreen", label: "Más de 4 años", color: "#1B5E20" };
};

const isProcess = (value, process) =>
  stripAccents(value).toUpperCase() === process;

const getSeguimientoProcess = (seguimiento) => {
  const proceso = stripAccents(getFieldValue(seguimiento, "proceso"));
  if (proceso.includes("renovacion acreditacion") || proceso.includes("raac"))
    return "RAAC";
  if (proceso.includes("acreditacion") || proceso.includes("aac")) return "AAC";

  const topic = stripAccents(getFieldValue(seguimiento, "topic"));
  if (topic.includes("renovacion acreditacion") || topic.includes("raac"))
    return "RAAC";
  if (topic.includes("acreditacion") || topic.includes("aac")) return "AAC";
  return "";
};

const processCards = [
  { key: "AAC", label: "AAC" },
  { key: "RAAC", label: "RAAC" },
];

const estadoCards = [
  {
    key: "vigentes",
    label: "Vigentes / En tramite",
    color: "#2E7D32",
    backgroundColor: "rgba(46, 125, 50, 0.08)",
    borderColor: "rgba(46, 125, 50, 0.2)",
  },
  {
    key: "enProcesoFacultad",
    label: "En proceso Facultad",
    color: "#6F42C1",
    backgroundColor: "rgba(111, 66, 193, 0.08)",
    borderColor: "rgba(111, 66, 193, 0.2)",
  },
  {
    key: "noVigentes",
    label: "No vigentes/Sin registro",
    color: "#C62828",
    backgroundColor: "rgba(198, 40, 40, 0.08)",
    borderColor: "rgba(198, 40, 40, 0.2)",
  },
  {
    key: "vigentesPregrado",
    label: "Vigentes Pregrado",
    color: "#1565C0",
    backgroundColor: "rgba(21, 101, 192, 0.08)",
    borderColor: "rgba(21, 101, 192, 0.2)",
  },
  {
    key: "vigentesPosgrado",
    label: "Vigentes Posgrado",
    color: "#00838F",
    backgroundColor: "rgba(0, 131, 143, 0.08)",
    borderColor: "rgba(0, 131, 143, 0.2)",
  },
];

const getLatestSeguimientoForProcess = (seguimientos, idPrograma, process) => {
  const valid = (seguimientos || [])
    .filter(
      (seg) =>
        normalize(seg.id_programa) === normalize(idPrograma) &&
        getSeguimientoProcess(seg) === process,
    )
    .sort((a, b) => {
      const dateA = parseDate(a?.timestamp);
      const dateB = parseDate(b?.timestamp);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });
  return valid[0] || null;
};

const getPhaseLabel = (seguimiento, fasesById) => {
  if (!seguimiento) return "Sin seguimientos";
  const faseId = normalize(seguimiento.fase);
  const fase = fasesById.get(faseId) || fasesById.get(Number(faseId));
  if (!fase) return "Sin seguimientos";
  return fase.fase_sup || "Sin seguimientos";
};

const getRiskFromSeguimiento = (seguimiento) => {
  if (!seguimiento) return "SinRegistro";
  const risk = normalize(seguimiento.riesgo);
  return RISK_CONFIG[risk] ? risk : "SinRegistro";
};

const isAltaCalidadProgram = (programa) => {
  const estado = stripAccents(
    getFieldValue(programa, "estadoaac", "estado aac"),
  );
  const aac1a = normalize(
    getFieldValue(programa, "aac_1a", "aac 1a"),
  ).toUpperCase();
  const faseRac = stripAccents(getFieldValue(programa, "fase rac", "fase_rac"));
  return aac1a === "SI" || isVigente(estado) || faseRac === "vencido";
};

const hasNoAacState = (value) => {
  const state = stripAccents(value);
  return !state || state === "sin registro" || state === "sinregistro";
};

const isEnProcesoFacultad = (row, seguimientos) =>
  hasNoAacState(row.estadoaac) &&
  !!getLatestSeguimientoForProcess(seguimientos, row.id_programa, "AAC");

const filterRows = (rows, filters) =>
  rows.filter((row) => {
    if (filters.procesos.length > 0 && !filters.procesos.includes(row.proceso))
      return false;
    if (
      filters.riesgoSeguimiento &&
      row.riesgoSeguimiento !== filters.riesgoSeguimiento
    )
      return false;
    if (
      filters.riesgoVencimiento &&
      row.riesgoVencimiento.key !== filters.riesgoVencimiento
    )
      return false;
    if (filters.escuela && row.escuela !== filters.escuela) return false;
    if (filters.programa && row.programaAcademico !== filters.programa)
      return false;
    if (filters.nivelAcademico && row.nivelAcademico !== filters.nivelAcademico)
      return false;
    if (filters.nivelFormacion && row.nivelFormacion !== filters.nivelFormacion)
      return false;
    return true;
  });

const getUniqueOptions = (rows, field) =>
  [...new Set(rows.map((row) => normalize(row[field])).filter(Boolean))].sort();

const AltaCalidad = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCargo, setCargo] = useState([" "]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [programas, setProgramas] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [fases, setFases] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [filters, setFilters] = useState({
    procesos: [],
    riesgoSeguimiento: "",
    riesgoVencimiento: "",
    escuela: "",
    programa: "",
    nivelAcademico: "",
    nivelFormacion: "",
  });

  useEffect(() => {
    if (sessionStorage.getItem("logged")) {
      const res = JSON.parse(sessionStorage.getItem("logged"));
      const permisos = res.map((item) => item.permiso).flat();
      setCargo(permisos);
    }
  }, []);

  useEffect(() => {
    if (location.state?.fromSidebar) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [programasData, seguimientosData, fasesData] = await Promise.all([
          Filtro5(),
          Filtro7(),
          Filtro10(),
        ]);
        setProgramas((programasData || []).filter(isAltaCalidadProgram));
        setSeguimientos(
          Array.isArray(seguimientosData) ? seguimientosData : [],
        );
        setFases(Array.isArray(fasesData) ? fasesData : []);
      } catch (error) {
        console.error("Error al cargar datos de Alta Calidad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCargo]);

  const fasesById = useMemo(() => {
    const map = new Map();
    fases.forEach((fase) => {
      map.set(normalize(fase.id), fase);
      map.set(Number(fase.id), fase);
    });
    return map;
  }, [fases]);

  const rows = useMemo(
    () =>
      programas.map((programa) => {
        const id = normalize(programa.id_programa);
        const proceso =
          normalize(
            getFieldValue(programa, "aac_1a", "aac 1a"),
          ).toUpperCase() === "SI"
            ? "AAC"
            : "RAAC";
        const seguimientoAAC = getLatestSeguimientoForProcess(
          seguimientos,
          id,
          "AAC",
        );
        const seguimientoRAAC = getLatestSeguimientoForProcess(
          seguimientos,
          id,
          "RAAC",
        );
        const seguimientoRiesgo = seguimientoRAAC || seguimientoAAC;

        const row = {
          ...programa,
          proceso,
          programaAcademico: normalize(
            getFieldValue(programa, "programa académico", "programa academico"),
          ),
          escuela: normalize(getFieldValue(programa, "escuela")),
          nivelAcademico: normalize(
            getFieldValue(programa, "pregrado/posgrado", "nivel academico"),
          ),
          nivelFormacion: normalize(
            getFieldValue(programa, "nivel de formación", "nivel de formacion"),
          ),
          faseAac: getPhaseLabel(seguimientoAAC, fasesById),
          faseRaac: getPhaseLabel(seguimientoRAAC, fasesById),
          fechaVencimiento:
            normalize(
              getFieldValue(
                programa,
                "fechavencac",
                "fecha vencac",
                "fecha_vencac",
              ),
            ) || "N/A",
          riesgoSeguimiento: getRiskFromSeguimiento(seguimientoRiesgo),
          riesgoVencimiento: getVencimientoInfo(
            getFieldValue(
              programa,
              "fechavencac",
              "fecha vencac",
              "fecha_vencac",
            ),
            programa.estadoaac,
          ),
        };

        const vigente = isVigente(row.estadoaac);
        let estadoVigenciaLabel = "";
        let estadoVigenciaColor = "";

        if (vigente) {
          if (row.nivelAcademico === "Pregrado") {
            estadoVigenciaLabel = "Vigentes Pregrado";
            estadoVigenciaColor = "#1565C0";
          } else if (row.nivelAcademico === "Posgrado") {
            estadoVigenciaLabel = "Vigentes Posgrado";
            estadoVigenciaColor = "#00838F";
          } else {
            estadoVigenciaLabel = "Vigentes / En tramite";
            estadoVigenciaColor = "#2E7D32";
          }
        } else if (isEnProcesoFacultad(row, seguimientos)) {
          estadoVigenciaLabel = "En proceso Facultad";
          estadoVigenciaColor = "#6F42C1";
        } else {
          estadoVigenciaLabel = "No vigentes/Sin registro";
          estadoVigenciaColor = "#C62828";
        }

        row.estadoVigencia = {
          label: estadoVigenciaLabel,
          color: estadoVigenciaColor,
        };

        return row;
      }),
    [programas, seguimientos, fasesById],
  );

  const visibleRows = useMemo(() => filterRows(rows, filters), [rows, filters]);

  const estadoCounts = useMemo(() => {
    const base = {
      vigentes: 0,
      enProcesoFacultad: 0,
      noVigentes: 0,
      vigentesPregrado: 0,
      vigentesPosgrado: 0,
    };

    rows.forEach((row) => {
      const vigente = isVigente(row.estadoaac);

      if (vigente) {
        base.vigentes += 1;
        if (row.nivelAcademico === "Pregrado") base.vigentesPregrado += 1;
        if (row.nivelAcademico === "Posgrado") base.vigentesPosgrado += 1;
      } else if (isEnProcesoFacultad(row, seguimientos)) {
        base.enProcesoFacultad += 1;
      } else {
        base.noVigentes += 1;
      }
    });

    return base;
  }, [rows, seguimientos]);

  const estadoFilteredRows = useMemo(() => {
    if (!selectedEstado) return visibleRows;
    return visibleRows.filter((row) => {
      const vigente = isVigente(row.estadoaac);
      if (selectedEstado === "vigentes") return vigente;
      if (selectedEstado === "enProcesoFacultad")
        return isEnProcesoFacultad(row, seguimientos);
      if (selectedEstado === "noVigentes")
        return !vigente && !isEnProcesoFacultad(row, seguimientos);
      if (selectedEstado === "vigentesPregrado")
        return vigente && row.nivelAcademico === "Pregrado";
      if (selectedEstado === "vigentesPosgrado")
        return vigente && row.nivelAcademico === "Posgrado";
      return true;
    });
  }, [visibleRows, selectedEstado, seguimientos]);

  const chartData = useMemo(() => {
    const labels = [
      ...new Set(rows.map((row) => row.nivelFormacion).filter(Boolean)),
    ].sort();
    return {
      labels,
      datasets: [
        {
          label: "Acreditados",
          data: labels.map(
            (label) =>
              rows.filter(
                (row) =>
                  row.nivelFormacion === label &&
                  isVigente(row.estadoaac) &&
                  stripAccents(
                    getFieldValue(row, "acreditable", "Acreditable"),
                  ) === "acreditable",
              ).length,
          ),
          backgroundColor: "rgba(178, 34, 34, 0.8)",
          borderColor: "#B22222",
          borderWidth: 1,
        },
        {
          label: "Acreditables",
          data: labels.map(
            (label) =>
              rows.filter((row) => row.nivelFormacion === label).length,
          ),
          backgroundColor: "rgba(144, 153, 161, 0.45)",
          borderColor: "#141414",
          borderWidth: 1,
        },
      ],
    };
  }, [rows]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: { legend: { position: "bottom" } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } },
        y: { ticks: { autoSkip: false } },
      },
    }),
    [],
  );

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(estadoFilteredRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AltaCalidad");
      XLSX.writeFile(workbook, "alta_calidad_unificada.xlsx");
    } catch (error) {
      console.error("Error al generar reporte:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProcess = (process) => {
    setFilters((prev) => ({
      ...prev,
      procesos: prev.procesos.includes(process)
        ? prev.procesos.filter((item) => item !== process)
        : [...prev.procesos, process],
    }));
  };

  const clearFilters = () => {
    setFilters({
      procesos: [],
      riesgoSeguimiento: "",
      riesgoVencimiento: "",
      escuela: "",
      programa: "",
      nivelAcademico: "",
      nivelFormacion: "",
    });
    setSelectedEstado(null);
  };

  const handleSelectChange = (field) => (event) => {
    const value = event.target.value;
    setFilters((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "escuela") {
        next.programa = "";
        next.nivelAcademico = "";
        next.nivelFormacion = "";
      }
      if (field === "programa") {
        next.nivelAcademico = "";
        next.nivelFormacion = "";
      }
      if (field === "nivelAcademico") {
        next.nivelFormacion = "";
      }
      return next;
    });
  };

  const handleEstadoCardClick = (estadoKey) => {
    setSelectedEstado((prev) => (prev === estadoKey ? null : estadoKey));
  };

  const schoolOptions = useMemo(
    () => getUniqueOptions(rows, "escuela"),
    [rows],
  );
  const programOptions = useMemo(
    () =>
      getUniqueOptions(
        filterRows(rows, {
          ...filters,
          programa: "",
          nivelAcademico: "",
          nivelFormacion: "",
        }),
        "programaAcademico",
      ),
    [rows, filters],
  );
  const nivelAcademicoOptions = useMemo(
    () =>
      getUniqueOptions(
        filterRows(rows, {
          ...filters,
          nivelAcademico: "",
          nivelFormacion: "",
        }),
        "nivelAcademico",
      ),
    [rows, filters],
  );
  const nivelFormacionOptions = useMemo(
    () =>
      getUniqueOptions(
        filterRows(rows, { ...filters, nivelFormacion: "" }),
        "nivelFormacion",
      ),
    [rows, filters],
  );

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box
        className="content content-with-sidebar"
        sx={{
          background: "linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)",
          minHeight: "100vh",
          pt: 4,
          overflowX: "hidden",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "calc(90% - 10px)",
          maxWidth: "100%",
          ml: { xs: 0, sm: 0, md: "20px", lg: "40px" },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: "100%", md: "1380px", lg: "1600px" },
            px: 2,
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
              }}
            >
              <CircularProgress sx={{ color: "#B22222" }} />
              <Typography sx={{ mt: 2, color: "#6C757D" }}>
                Cargando informacion...
              </Typography>
            </Box>
          ) : (
            <Fade in timeout={350}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 2,
                    mb: 3,
                    p: { xs: 2, sm: 3 },
                    background:
                      "linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "14px",
                        background:
                          "linear-gradient(135deg, #B22222 0%, #DC143C 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 16px rgba(178, 34, 34, 0.3)",
                      }}
                    >
                      <AutorenewIcon sx={{ color: "white", fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: "#B22222",
                          fontSize: { xs: "1.35rem", md: "1.75rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        Programas en proceso de acreditación y de Renovación de
                        acreditación
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "#6C757D", mt: 0.5 }}
                      >
                        Vista unificada de Acreditacion y Renovacion de
                        Acreditacion
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      startIcon={<SummarizeIcon />}
                      onClick={handleGenerateReport}
                      disabled={isLoading}
                      sx={{
                        backgroundColor: "#1976d2",
                        "&:hover": { backgroundColor: "#1565c0" },
                      }}
                    >
                      {isLoading ? "Generando..." : "Generar reporte"}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<KeyboardBackspaceIcon />}
                      onClick={() => navigate(-1)}
                      sx={{
                        borderColor: "#B22222",
                        color: "#B22222",
                        fontWeight: 600,
                      }}
                    >
                      Volver
                    </Button>
                  </Box>
                </Box>

                <Card
                  sx={{
                    mb: 3,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 2, color: "#212529" }}
                    >
                      Programas acreditados sobre la cantidad de acreditables de
                      la Facultad de Salud
                    </Typography>
                    <Box sx={{ height: { xs: 260, sm: 320, md: 380 } }}>
                      {chartData.labels.length > 0 ? (
                        <Bar data={chartData} options={chartOptions} />
                      ) : (
                        <Typography sx={{ color: "#2e2e2e" }}>
                          Sin datos para mostrar.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Grid
                  container
                  spacing={3}
                  sx={{ mb: 3, width: "100%", mx: 0 }}
                >
                  {estadoCards.map((card, index) => {
                    const isSelected = selectedEstado === card.key;
                    const value = estadoCounts[card.key];
                    return (
                      <Grid item xs={12} sm={6} md={2} key={card.key}>
                        <Fade in timeout={500 + index * 80}>
                          <Card
                            elevation={0}
                            onClick={() => handleEstadoCardClick(card.key)}
                            sx={{
                              borderRadius: "20px",
                              border: `2px solid ${isSelected ? "#ffffff" : card.borderColor}`,
                              backgroundColor: isSelected
                                ? card.color
                                : card.backgroundColor,
                              position: "relative",
                              overflow: "hidden",
                              cursor: "pointer",
                              width: "100%",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": { transform: "translateY(-6px)" },
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                mb={2}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: isSelected ? "#ffffff" : card.color,
                                    fontWeight: 600,
                                    fontSize: "1.125rem",
                                  }}
                                >
                                  {card.label}
                                </Typography>
                              </Box>
                              <Typography
                                variant="h2"
                                sx={{
                                  fontWeight: 800,
                                  color: isSelected ? "#ffffff" : card.color,
                                  fontSize: "3rem",
                                  lineHeight: 1,
                                  mb: 1,
                                }}
                              >
                                {value}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isSelected ? "#ffffff" : card.color,
                                  opacity: 0.7,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                }}
                              >
                                {value === 1 ? "programa" : "programas"}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    );
                  })}
                </Grid>
                {/** 
                <Card
                  sx={{
                    mb: 3,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      Filtrar por proceso de acreditación:
                    </Typography>
                    {processCards.map((process) => {
                      const active = filters.procesos.includes(process.key);
                      return (
                        <Button
                          key={process.key}
                          variant={active ? "contained" : "outlined"}
                          onClick={() => toggleProcess(process.key)}
                          sx={{
                            borderColor: "#B22222",
                            color: active ? "white" : "#B22222",
                          }}
                        >
                          {process.label}
                        </Button>
                      );
                    })}
                    {/** 
                    <Button
                      variant="text"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, procesos: [] }))
                      }
                      sx={{ color: "#6C757D" }}
                    >
                      Ver ambos procesos
                    </Button>

                  </CardContent>
                </Card>
*/}
                <Card
                  sx={{
                    mb: 3,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 3, // Aumenté el gap para mejor separación entre filtros
                      alignItems: "center", // Centra verticalmente todo el contenido
                    }}
                  >
                    {/* Primer filtro: Riesgo por seguimiento */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center", // Alinea el título y las opciones en la misma línea
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        Riesgo por seguimiento:
                      </Typography>
                      <RadioGroup
                        row
                        value={filters.riesgoSeguimiento}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            riesgoSeguimiento: e.target.value,
                          }))
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <FormControlLabel
                          key="Todos"
                          value=""
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: "#6C757D",
                                "&.Mui-checked": {
                                  color: "#6C757D",
                                },
                              }}
                            />
                          }
                          label={
                            <Box
                              sx={{
                                color: "#6C757D",
                                fontWeight: 700,
                              }}
                            >
                              Todos
                            </Box>
                          }
                        />
                        {["Alto", "Medio", "Bajo", "SinRegistro"].map(
                          (risk) => (
                            <FormControlLabel
                              key={risk}
                              value={risk}
                              control={
                                <Radio
                                  size="small"
                                  sx={{
                                    color: RISK_CONFIG[risk].color,
                                    "&.Mui-checked": {
                                      color: RISK_CONFIG[risk].color,
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    color: RISK_CONFIG[risk].color,
                                    fontWeight: 700,
                                  }}
                                >
                                  {risk === "SinRegistro"
                                    ? "Sin registro"
                                    : risk}
                                </Box>
                              }
                            />
                          ),
                        )}
                      </RadioGroup>
                    </Box>

                    {/* Segundo filtro: Riesgo por vencimiento */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center", // Alinea el título y las opciones en la misma línea
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        Riesgo por vencimiento:
                      </Typography>
                      <RadioGroup
                        row
                        value={filters.riesgoVencimiento}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            riesgoVencimiento: e.target.value,
                          }))
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <FormControlLabel
                          key="Todos"
                          value=""
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: "#6C757D",
                                "&.Mui-checked": {
                                  color: "#6C757D",
                                },
                              }}
                            />
                          }
                          label={
                            <Box
                              sx={{
                                color: "#6C757D",
                                fontWeight: 700,
                              }}
                            >
                              Todos
                            </Box>
                          }
                        />
                        {[
                          {
                            key: "green",
                            label: "A 4 años",
                            color: getVencimientoInfo(
                              new Date(
                                currentYear + 4,
                                now.getMonth(),
                                now.getDate(),
                              ),
                            ).color,
                          },
                          {
                            key: "yellow",
                            label: "A 2 años",
                            color: getVencimientoInfo(
                              new Date(
                                currentYear + 2,
                                now.getMonth(),
                                now.getDate(),
                              ),
                            ).color,
                          },
                          {
                            key: "orange",
                            label: "A 18 meses",
                            color: getVencimientoInfo(
                              new Date(
                                currentYear + 1,
                                now.getMonth() + 6,
                                now.getDate(),
                              ),
                            ).color,
                          },
                          {
                            key: "red",
                            label: "A un año",
                            color: getVencimientoInfo(now).color,
                          },
                          {
                            key: "vencidoVigente",
                            label: "Vencido vigente",
                            color: "#E65100",
                          },
                          {
                            key: "vencido",
                            label: "Vencido",
                            color: "#4A0000",
                          },
                        ].map((item) => (
                          <FormControlLabel
                            key={item.key}
                            value={item.key}
                            control={
                              <Radio
                                size="small"
                                sx={{
                                  color: item.color,
                                  "&.Mui-checked": { color: item.color },
                                }}
                              />
                            }
                            label={
                              <Box sx={{ color: item.color, fontWeight: 700 }}>
                                {item.label}
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    mb: 3,
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>Escuela</InputLabel>
                      <Select
                        value={filters.escuela}
                        label="Escuela"
                        onChange={handleSelectChange("escuela")}
                      >
                        <MenuItem value="">Todas</MenuItem>
                        {schoolOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Programa academico</InputLabel>
                      <Select
                        value={filters.programa}
                        label="Programa academico"
                        onChange={handleSelectChange("programa")}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {programOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Nivel academico</InputLabel>
                      <Select
                        value={filters.nivelAcademico}
                        label="Nivel academico"
                        onChange={handleSelectChange("nivelAcademico")}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {nivelAcademicoOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Nivel de formacion</InputLabel>
                      <Select
                        value={filters.nivelFormacion}
                        label="Nivel de formacion"
                        onChange={handleSelectChange("nivelFormacion")}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {nivelFormacionOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                  <Box
                    sx={{
                      px: 2,
                      pb: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#070707", fontWeight: 600 }}
                    >
                      {estadoFilteredRows.length} programa
                      {estadoFilteredRows.length === 1 ? "" : "s"} encontrado
                      {estadoFilteredRows.length === 1 ? "" : "s"}
                    </Typography>
                    <Button
                      onClick={clearFilters}
                      variant="text"
                      sx={{ color: "#B22222" }}
                    >
                      Limpiar filtros
                    </Button>
                  </Box>
                </Card>

                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.04)",
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#212529" }}
                      >
                        {`Programas (${estadoFilteredRows.length})`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6C757D" }}>
                        Datos de acreditacion y renovacion de acreditacion
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {processCards.map((process) => {
                        const active = filters.procesos.includes(process.key);
                        return (
                          <Button
                            key={process.key}
                            variant={active ? "contained" : "outlined"}
                            onClick={() => toggleProcess(process.key)}
                            sx={{
                              borderColor: "#B22222",
                              color: active ? "white" : "#B22222",
                              backgroundColor: active
                                ? "#B22222"
                                : "transparent",
                              "&:hover": {
                                backgroundColor: active
                                  ? "#8B1A1A"
                                  : "rgba(178, 34, 34, 0.04)",
                                borderColor: "#B22222",
                              },
                            }}
                          >
                            {process.label}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>

                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ width: "100%", overflowX: "auto" }}
                  >
                    <Table
                      aria-label="tabla de alta calidad"
                      sx={{ minWidth: 1600 }}
                    >
                      <TableHead>
                        <TableRow>
                          {[
                            "Programa academico",
                            "Escuela",
                            "Nivel academico",
                            "Nivel de formacion",                         
                            "FASE AAC",
                            "FASE RAAC",
                            "Fecha de vencimiento",
                            "Riesgo por seguimiento",
                            "Riesgo por vencimiento",
                            "Estado vigencia",
                          ].map((label) => (
                            <TableCell
                              key={label}
                              sx={{
                                fontWeight: 700,
                                backgroundColor: "#F8F9FA",
                              }}
                            >
                              {label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {estadoFilteredRows.map((row) => (
                          <TableRow
                            key={row.id_programa}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate("/program_details", {
                                state: row,
                                replace: true,
                              })
                            }
                          >
                            <TableCell>{row.programaAcademico}</TableCell>
                            <TableCell>{row.escuela}</TableCell>
                            <TableCell>{row.nivelAcademico || "-"}</TableCell>
                            <TableCell>{row.nivelFormacion || "-"}</TableCell>
                            <TableCell>{row.faseAac}</TableCell>
                            <TableCell>{row.faseRaac}</TableCell>
                            <TableCell>{row.fechaVencimiento}</TableCell>
                            <TableCell
                              sx={{
                                color:
                                  RISK_CONFIG[row.riesgoSeguimiento]?.color ||
                                  RISK_CONFIG.SinRegistro.color,
                                fontWeight: 700,
                              }}
                            >
                              {RISK_CONFIG[row.riesgoSeguimiento]?.label ||
                                "Sin registro"}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: row.riesgoVencimiento.color,
                                fontWeight: 700,
                              }}
                            >
                              {row.riesgoVencimiento.label}
                            </TableCell>
                                                        <TableCell
                              sx={{
                                color: row.estadoVigencia.color,
                                fontWeight: 700,
                              }}
                            >
                              {row.estadoVigencia.label}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AltaCalidad;
