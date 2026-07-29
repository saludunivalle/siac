import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  FormControl,
  FormControlLabel,
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
import RuleIcon from "@mui/icons-material/Rule";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Filtro5, Filtro7, Filtro10 } from "../service/data";
import "../styles/altaCalidad.css";

const normalize = (value) => String(value ?? "").trim();
const stripAccents = (value) =>
  normalize(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getFieldValue = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "")
      return value;
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

const parseDate = (value) => {
  const raw = normalize(value);
  if (!raw) return null;
  const parts = raw.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if ([day, month, year].every(Number.isFinite))
      return new Date(year, month - 1, day);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getVencimientoInfo = (fechaVencimiento, estado) => {
  const fecha = parseDate(fechaVencimiento);
  if (!fecha) return { key: "gray", label: "Sin fecha", color: "#6C757D" };
  const now = new Date();
  const diffMonths =
    (fecha.getFullYear() - now.getFullYear()) * 12 +
    (fecha.getMonth() - now.getMonth());

  if (diffMonths < 0) {
    return isVigente(estado)
      ? { key: "vencidoVigente", label: "Vencido vigente", color: "#E65100" }
      : { key: "vencido", label: "Vencido", color: "#4A0000" };
  }
  if (diffMonths <= 12)
    return { key: "red", label: "A un ano", color: "#DC3545" };
  if (diffMonths <= 24)
    return { key: "orange", label: "A 18 meses", color: "#FF8C00" };
  if (diffMonths <= 36)
    return { key: "yellow", label: "A 2 anos", color: "#F4C430" };
  if (diffMonths <= 48)
    return { key: "green", label: "A 4 anos", color: "#2E7D32" };
  return { key: "darkGreen", label: "Mas de 4 anos", color: "#1B5E20" };
};

const getSeguimientoProcess = (seguimiento) => {
  const proceso = stripAccents(getFieldValue(seguimiento, "proceso"));
  const topic = stripAccents(getFieldValue(seguimiento, "topic"));
  if (
    proceso.includes("creacion") ||
    topic.includes("creacion") ||
    topic.includes("crea")
  )
    return "CREA";
  if (
    proceso.includes("renovacion registro calificado") ||
    proceso.includes("rrc")
  )
    return "RRC";
  if (topic.includes("renovacion registro calificado") || topic.includes("rrc"))
    return "RRC";
  return "";
};

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
  return fase?.fase_sup || fase?.fase || "Sin seguimientos";
};

const filterRows = (rows, filters) =>
  rows.filter((row) => {
    if (filters.procesos.length > 0 && !filters.procesos.includes(row.proceso))
      return false;
    if (filters.escuela && row.escuela !== filters.escuela) return false;
    if (filters.programa && row.programaAcademico !== filters.programa)
      return false;
    if (filters.nivelAcademico && row.nivelAcademico !== filters.nivelAcademico)
      return false;
    if (filters.nivelFormacion && row.nivelFormacion !== filters.nivelFormacion)
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
    return true;
  });

const getUniqueOptions = (rows, field) =>
  [...new Set(rows.map((row) => normalize(row[field])).filter(Boolean))].sort();

const getUserEscuela = () => {
  try {
    const logged = sessionStorage.getItem("logged");
    if (!logged) return "";

    const res = JSON.parse(logged);
    if (!Array.isArray(res) || res.length === 0) return "";

    const directorEscuela = res.find((item) => {
      const permiso = item?.permiso;
      return Array.isArray(permiso)
        ? permiso.includes("Director Escuela")
        : permiso === "Director Escuela";
    });

    return normalize(directorEscuela?.escuela || res[0]?.escuela);
  } catch {
    return "";
  }
};

const RISK_CONFIG = {
  Alto: { color: "#DC3545", label: "Alto" },
  Medio: { color: "#FF8C00", label: "Medio" },
  Bajo: { color: "#28A745", label: "Bajo" },
  SinRegistro: { color: "#6C757D", label: "Sin registro" },
};

const VENCIMIENTO_RADIOS = [
  { key: "green", label: "A 4 años", color: "#2E7D32" },
  { key: "yellow", label: "A 2 años", color: "#F4C430" },
  { key: "orange", label: "A 18 meses", color: "#FF8C00" },
  { key: "red", label: "A un año", color: "#DC3545" },
  { key: "vencidoVigente", label: "Vencido vigente", color: "#E65100" },
  { key: "vencido", label: "Vencido", color: "#4A0000" },
];

const processCard = [
  { key: "CREA", label: "CREA" },
  { key: "RRC", label: "RRC" },
];

const ESTADO_CARDS = [
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

const RegistroCalificado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCargo, setCargo] = useState([" "]);
  const [loading, setLoading] = useState(true);
  const [programas, setProgramas] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [fases, setFases] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const userEscuela = useMemo(getUserEscuela, []);
  const [filters, setFilters] = useState({
    procesos: [],
    escuela: userEscuela,
    programa: "",
    nivelAcademico: "",
    nivelFormacion: "",
    riesgoSeguimiento: "",
    riesgoVencimiento: "",
  });

  useEffect(() => {
    if (sessionStorage.getItem("logged")) {
      const res = JSON.parse(sessionStorage.getItem("logged"));
      setCargo(res.map((item) => item.permiso).flat());
    }
  }, []);

  useEffect(() => {
    if (userEscuela) {
      setFilters((prev) =>
        prev.escuela === userEscuela ? prev : { ...prev, escuela: userEscuela },
      );
    }
  }, [userEscuela]);

  useEffect(() => {
    if (location.state?.fromSidebar)
      window.history.replaceState({}, document.title);
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
        const baseProgramas = (programasData || []).filter((programa) => {
          const estado = stripAccents(getFieldValue(programa, "estado"));
          const estadorc = stripAccents(getFieldValue(programa, "estadorc"));
          return (
            estado === "en creacion" ||
            estadorc === "vigente" ||
            estadorc === "vigente (en tramite)" ||
            estadorc === ""
          );
        });
        setProgramas(baseProgramas);
        setSeguimientos(
          Array.isArray(seguimientosData) ? seguimientosData : [],
        );
        setFases(Array.isArray(fasesData) ? fasesData : []);
      } catch (error) {
        console.error("Error al cargar datos de Registro Calificado:", error);
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
        const esCrea =
          stripAccents(getFieldValue(programa, "estado")) === "en creacion";
        const proceso = esCrea ? "CREA" : "RRC";
        const seguimientoCREA = getLatestSeguimientoForProcess(
          seguimientos,
          id,
          "CREA",
        );
        const seguimientoRRC = getLatestSeguimientoForProcess(
          seguimientos,
          id,
          "RRC",
        );
        const seguimiento =
          proceso === "CREA" ? seguimientoCREA : seguimientoRRC;
        const seguimientoRiesgo = seguimientoRRC || seguimientoCREA;
        const fechaVencimiento = normalize(
          getFieldValue(
            programa,
            "fechavencrc",
            "fecha vencencrc",
            "fecha_venccrc",
            "fechavencac",
          ),
        );

        return {
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
          faseCrea:
            proceso === "CREA"
              ? getPhaseLabel(seguimientoCREA, fasesById)
              : "-",
          faseRrc:
            proceso === "RRC" ? getPhaseLabel(seguimientoRRC, fasesById) : "-",
          fechaVencimiento: fechaVencimiento || "N/A",
          riesgoSeguimiento:
            seguimientoRiesgo &&
            RISK_CONFIG[normalize(seguimientoRiesgo.riesgo)]
              ? normalize(seguimientoRiesgo.riesgo)
              : "SinRegistro",
          riesgoVencimiento: getVencimientoInfo(
            fechaVencimiento,
            programa.estadorc,
          ),
        };
      }),
    [programas, seguimientos, fasesById],
  );

  const visibleRows = useMemo(() => filterRows(rows, filters), [rows, filters]);

  const estadoFilteredRows = useMemo(() => {
    if (!selectedEstado) return visibleRows;
    return visibleRows.filter((row) => {
      const vigente = isVigente(row.estadorc);
      if (selectedEstado === "vigentes") return vigente;
      if (selectedEstado === "enProcesoFacultad")
        return (
          !vigente &&
          !!getLatestSeguimientoForProcess(
            seguimientos,
            row.id_programa,
            row.proceso,
          )
        );
      if (selectedEstado === "noVigentes")
        return (
          !vigente &&
          !getLatestSeguimientoForProcess(
            seguimientos,
            row.id_programa,
            row.proceso,
          )
        );
      if (selectedEstado === "vigentesPregrado")
        return vigente && row.nivelAcademico === "Pregrado";
      if (selectedEstado === "vigentesPosgrado")
        return vigente && row.nivelAcademico === "Posgrado";
      return true;
    });
  }, [visibleRows, selectedEstado, seguimientos]);

  const estadoCounts = useMemo(() => {
    const base = {
      vigentes: 0,
      enProcesoFacultad: 0,
      noVigentes: 0,
      vigentesPregrado: 0,
      vigentesPosgrado: 0,
    };

    rows.forEach((row) => {
      const vigente = isVigente(row.estadorc);
      if (vigente) {
        base.vigentes += 1;
        if (row.nivelAcademico === "Pregrado") base.vigentesPregrado += 1;
        if (row.nivelAcademico === "Posgrado") base.vigentesPosgrado += 1;
      } else if (
        getLatestSeguimientoForProcess(
          seguimientos,
          row.id_programa,
          row.proceso,
        )
      ) {
        base.enProcesoFacultad += 1;
      } else {
        base.noVigentes += 1;
      }
    });

    return base;
  }, [rows, seguimientos]);

  const toggleProcess = (process) => {
    setFilters((prev) => ({
      ...prev,
      procesos: prev.procesos.includes(process)
        ? prev.procesos.filter((item) => item !== process)
        : [...prev.procesos, process],
    }));
  };
  const getEstadoVigencia = (row) => {
    const vigente = isVigente(row.estadorc);
    if (vigente) {
      if (row.nivelAcademico === "Pregrado") {
        return { label: "Vigentes Pregrado", color: "#1565C0" };
      }
      if (row.nivelAcademico === "Posgrado") {
        return { label: "Vigentes Posgrado", color: "#00838F" };
      }
      return { label: "Vigentes / En tramite", color: "#2E7D32" };
    }

    if (
      getLatestSeguimientoForProcess(seguimientos, row.id_programa, row.proceso)
    ) {
      return { label: "En proceso Facultad", color: "#6F42C1" };
    }

    return { label: "No vigentes/Sin registro", color: "#C62828" };
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
      if (field === "nivelAcademico") next.nivelFormacion = "";
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      procesos: [],
      escuela: "",
      programa: "",
      nivelAcademico: "",
      nivelFormacion: "",
      riesgoSeguimiento: "",
      riesgoVencimiento: "",
    });
    setSelectedEstado(null);
  };

  const handleGenerateReport = async () => {
    setIsLoadingReport(true);
    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(estadoFilteredRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RegistroCalificado");
      XLSX.writeFile(workbook, "registro_calificado_unificado.xlsx");
    } catch (error) {
      console.error("Error al generar reporte:", error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box
        className="content content-with-sidebar"
        sx={{
          minHeight: "100vh",
          pt: 4,
          display: "flex",
          ml: { xs: 0, sm: 0, md: "20px", lg: "40px" },
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)",
        }}
      >
        <Box
          sx={{ width: "100%", maxWidth: { xs: "100%", md: "1600px" }, px: 2 }}
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
                Cargando información...
              </Typography>
            </Box>
          ) : (
            <Fade in timeout={350}>
              <Box>
                <Card
                  sx={{
                    mb: 3,
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            background:
                              "linear-gradient(135deg, #B22222 0%, #DC143C 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <RuleIcon sx={{ color: "white", fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#212529" }}
                          >
                            Registro Calificado
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6C757D" }}>
                            Procesos unificados de creación y renovación
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        onClick={handleGenerateReport}
                        variant="contained"
                        startIcon={isLoadingReport ? null : <SummarizeIcon />}
                        disabled={isLoadingReport}
                        sx={{
                          backgroundColor: "#1976d2",
                          "&:hover": { backgroundColor: "#1565c0" },
                        }}
                      >
                        {isLoadingReport ? "Generando..." : "Generar reporte"}
                      </Button>
                      <Button
                        onClick={() => navigate(-1)}
                        variant="outlined"
                        startIcon={<KeyboardBackspaceIcon />}
                        sx={{ borderColor: "#B22222", color: "#B22222" }}
                      >
                        Volver
                      </Button>
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
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {ESTADO_CARDS.map((card, index) => {
                        const isSelected = selectedEstado === card.key;
                        return (
                          <Card
                            key={card.key}
                            elevation={0}
                            onClick={() =>
                              setSelectedEstado((prev) =>
                                prev === card.key ? null : card.key,
                              )
                            }
                            sx={{
                              minWidth: { xs: "100%", sm: "220px" },
                              flex: "1 1 220px",
                              borderRadius: "20px",
                              border: `2px solid ${isSelected ? "#ffffff" : card.borderColor}`,
                              backgroundColor: isSelected
                                ? card.color
                                : card.backgroundColor,
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                transform: "translateY(-6px)",
                              },
                              cursor: "pointer",
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: isSelected ? "#ffffff" : card.color,
                                  fontWeight: 600,
                                  fontSize: "1.125rem",
                                  mb: 1,
                                }}
                              >
                                {card.label}
                              </Typography>
                              <Typography
                                variant="h2"
                                sx={{
                                  fontWeight: 800,
                                  color: isSelected ? "#ffffff" : card.color,
                                  fontSize: "3rem",
                                  lineHeight: 1,
                                }}
                              >
                                {estadoCounts[card.key] ?? 0}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isSelected ? "#ffffff" : card.color,
                                  opacity: 0.7,
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  mt: 1,
                                }}
                              >
                                {(estadoCounts[card.key] ?? 0) === 1
                                  ? "programa"
                                  : "programas"}
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      })}
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
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "#495057" }}
                      >
                        Filtrar por Riesgo de Seguimiento:
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
                      >
                        <FormControlLabel
                          value=""
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: "#6C757D",
                                "&.Mui-checked": { color: "#6C757D" },
                              }}
                            />
                          }
                          label="Todos"
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "#495057" }}
                      >
                        Filtrar por Vencimiento:
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
                      >
                        <FormControlLabel
                          value=""
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: "#6C757D",
                                "&.Mui-checked": { color: "#6C757D" },
                              }}
                            />
                          }
                          label="Todos"
                        />
                        {VENCIMIENTO_RADIOS.map((item) => (
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
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        onClick={clearFilters}
                        variant="text"
                        sx={{ color: "#B22222" }}
                      >
                        Limpiar filtros
                      </Button>
                    </Box>
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
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#212529" }}
                    >
                      Programas ({estadoFilteredRows.length})
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {processCard.map((process) => {
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
                      aria-label="tabla de registro calificado"
                      sx={{ minWidth: 1600 }}
                    >
                      <TableHead>
                        <TableRow>
                          {[
                            "Programa academico",
                            "Escuela",
                            "Nivel academico",
                            "Nivel de formacion",
                            "FASE CREA",
                            "FASE RRC",
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
                            <TableCell>{row.faseCrea}</TableCell>
                            <TableCell>{row.faseRrc}</TableCell>
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
                                color: getEstadoVigencia(row).color,
                                fontWeight: 700,
                              }}
                            >
                              {getEstadoVigencia(row).label}
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

export default RegistroCalificado;
