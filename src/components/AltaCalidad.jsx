import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Filtro5, Filtro6, Filtro7 } from "../service/data";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "../styles/altaCalidad.css";
import "../utils/chartConfig";
import { Bar } from "react-chartjs-2";
import DetailedProcessView from "./altaCalidad/DetailedProcessView";
import GeneralProcessTable from "./altaCalidad/GeneralProcessTable";
import Acreditacion from "./altaCalidad/Acreditacion";
import RenovacionAcreditacion from "./altaCalidad/RenovacionAcreditacion";
import AcreditacionInternacional from "./altaCalidad/AcreditacionInternacional";
import * as XLSX from "xlsx";
import {
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import MediumIcon from "@mui/icons-material/ReportProblem";
import LowIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import StarIcon from "@mui/icons-material/Star";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PublicIcon from "@mui/icons-material/Public";

const ESTADOS_AAC_VIGENTE = ["Vigente", "Vigente (En trámite)", "En trámite"];

const isEstadoAacVigente = (estado) =>
  ESTADOS_AAC_VIGENTE.includes(String(estado ?? "").trim());

const getRiesgoAac = (programa) => {
  if (isEstadoAacVigente(programa["estadoaac"])) {
    return {
      riesgo: "Medio",
      mensaje: "Programa con acreditación vigente - Riesgo medio",
    };
  }
  return {
    riesgo: "Alto",
    mensaje: "Programa con acreditación vencida",
  };
};

const AltaCalidad = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [counts, setCounts] = useState({
    AAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    RAAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    INT: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
  });
  const [isCargo, setCargo] = useState([" "]);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [programDetails, setProgramDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedRaacButton, setClickedRaacButton] = useState(null);
  const [selectedRaacOptions, setSelectedRaacOptions] = useState([]);
  const [raacProgramCounts, setRaacProgramCounts] = useState({
    white: 0,
    green: 0,
    yellow: 0,
    orange: 0,
    orange2: 0,
    red: 0,
    gray: 0,
  });
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [filteredByRisk, setFilteredByRisk] = useState(false);

  // Obtener los permisos del usuario
  useEffect(() => {
    if (sessionStorage.getItem("logged")) {
      const res = JSON.parse(sessionStorage.getItem("logged"));
      const permisos = res.map((item) => item.permiso).flat();
      setCargo(permisos);
    }
  }, []);

  // Resetear estado cuando se navega desde el Sidebar
  useEffect(() => {
    if (location.state?.fromSidebar) {
      setSelectedRow(null);
      setSelectedRisk(null);
      setFilteredByRisk(false);

      // Limpiar el state para que no afecte futuras navegaciones
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Cargar datos de programas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let programas;
        if (isCargo.includes("Posgrados")) {
          const filtered = await Filtro5();
          programas = filtered.filter(
            (item) => item["pregrado/posgrado"] === "Posgrado",
          );
        } else {
          programas = await Filtro5();
        }

        setPrograms(programas);

        // Load RAAC program counts
        try {
          let raacResponse;
          if (isCargo.includes("Posgrados")) {
            const filtered = await Filtro6({ searchTerm: "" });
            raacResponse = filtered.filter(
              (item) => item["pregrado/posgrado"] === "Posgrado",
            );
          } else {
            raacResponse = await Filtro6({ searchTerm: "" });
          }

          setRaacProgramCounts({
            white: raacResponse.filter((item) => item["fase rac"] === "Vencido" && item['estadoaac'] == "No Vigente" || item['estadoaac'] != '')
              .length,
            green: raacResponse.filter(
              (item) =>
                item["fase rac"] === "Fase 2" &&
                (item["estadoaac"] === "Vigente" ||
                  item["estadoaac"] === "Vigente (En trámite)" ||
                  item["estadoaac"] === "En trámite"),
            ).length,
            yellow: raacResponse.filter(
              (item) =>
                item["fase rac"] === "Fase 3" &&
                (item["estadoaac"] === "Vigente" ||
                  item["estadoaac"] === "Vigente (En trámite)" ||
                  item["estadoaac"] === "En trámite"),
            ).length,
            orange: 0,
            orange2: raacResponse.filter(
              (item) =>
                item["fase rac"] === "Fase 4" &&
                (item["estadoaac"] === "Vigente" ||
                  item["estadoaac"] === "Vigente (En trámite)" ||
                  item["estadoaac"] === "En trámite"),
            ).length,
            red: raacResponse.filter(
              (item) =>
                item["fase rac"] === "Fase 5" &&
                (item["estadoaac"] === "Vigente" ||
                  item["estadoaac"] === "Vigente (En trámite)" ||
                  item["estadoaac"] === "En trámite"),
            ).length,
            gray: raacResponse.filter(
              (item) =>
                (!item["fase rac"] ||
                  item["fase rac"] === "" ||
                  item["fase rac"] === "N/A") &&
                (item["estadoaac"] === "#N/A" ||
                  item["estadoaac"] === "" ||
                  item["estadoaac"] === null),
            ).length,
          });
        } catch (error) {
          console.error("Error al cargar conteos de programas RAAC:", error);
        }

        const seguimientos = await Filtro7();
        processSeguimientos(seguimientos, programas);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCargo]);

  // Procesar los niveles de riesgo para diferentes procesos
  const processSeguimientos = useCallback((seguimientos, programas) => {
    if (!seguimientos || !Array.isArray(seguimientos)) return;

    const estados = {
      AAC: programas
        .filter((item) => item["aac_1a"] === "SI")
        .map((item) => item.id_programa),
      RAAC: programas
        .filter(
          (item) =>
            item["estadoaac"] === "Vigente" ||
            item["estadoaac"] === "Vigente (En trámite)" ||
            item["estadoaac"] === "En trámite" ||
            item["fase rac"] === "Vencido",
        )
        .map((item) => item.id_programa),
      INT: programas
        .filter((item) => item["acreditacion internacional"] === "SI")
        .map((item) => item.id_programa),
    };

    const newCounts = {
      AAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      RAAC: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
      INT: { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 },
    };

    const programDetails = {};

    Object.keys(estados).forEach((estado) => {
      const filtered = seguimientos.filter((item) =>
        estados[estado].includes(item.id_programa),
      );
      const latestSeguimientos = {};

      filtered.forEach((item) => {
        const idPrograma = item.id_programa;
        if (
          !latestSeguimientos[idPrograma] ||
          new Date(item.timestamp) >
            new Date(latestSeguimientos[idPrograma].timestamp)
        ) {
          latestSeguimientos[idPrograma] = item;
        }
      });

      // Inicializar array de programas para este estado
      programDetails[estado] = [];

      // Procesar cada programa
      estados[estado].forEach((programId) => {
        const programa = programas.find((p) => p.id_programa === programId);
        if (!programa) return;

        const seguimiento = latestSeguimientos[programId];
        let riesgo, mensaje;

        // Asignar riesgo según la fase para programas RAAC
        if (estado === "RAAC") {
          if (
            !programa["fase rac"] ||
            programa["fase rac"] === "" ||
            programa["fase rac"] === "N/A"
          ) {
            riesgo = "SinRegistro";
            mensaje = "Fase RAC no definida";
          } else if (programa["fase rac"] === "Vencido" && (programa['estadoaac'] == '' || programa['estadoaac'] == 'No Vigente')) {
            riesgo = "Alto";
            mensaje = "Programa con acreditación vencida";
          } else if (programa["fase rac"] === "Fase 5") {
            riesgo = "Alto";
            mensaje = "Programa en Fase 5 - Alto riesgo";
          } else if (
            programa["fase rac"] === "Fase 4" ||
            programa["fase rac"] === "Fase 3" || (programa["fase rac"] === "Vencido" && (programa['estadoaac'] == 'Vigente' || programa['estadoaac'] == 'Vigente (En trámite)'))
          ) {
            riesgo = "Medio";
            mensaje = `Programa en ${programa["fase rac"]} - Riesgo medio`;
          } else if (programa["fase rac"] === "Fase 2") {
            riesgo = "Bajo";
            mensaje = `Programa en ${programa["fase rac"]} - Bajo riesgo`;
          } else if (programa["fase rac"] === "Fase 1") {
            riesgo = "SinRegistro";
            mensaje = "Fase 1 no clasificada en semaforización";
          } else {
            riesgo = seguimiento ? seguimiento.riesgo : "SinRegistro";
            mensaje = seguimiento ? seguimiento.mensaje : "Sin información";
          }
        }
        // Clasificar programas AAC: vigente siempre es riesgo medio
        else if (estado === "AAC") {
          ({ riesgo, mensaje } = getRiesgoAac(programa));
        }
        // Para los demás casos, usar el seguimiento
        else {
          riesgo = seguimiento ? seguimiento.riesgo : "SinRegistro";
          mensaje = seguimiento ? seguimiento.mensaje : "Sin información";
        }

        // Añadir programa con su nivel de riesgo
        programDetails[estado].push({
          ...programa,
          riesgo,
          mensaje,
        });

        // Actualizar conteos
        newCounts[estado][riesgo] += 1;
      });

      // Actualizar contador SinRegistro para estados que no son RAAC
      if (estado !== "RAAC") {
        const sinRegistro =
          estados[estado].length - Object.keys(latestSeguimientos).length;
        // No necesitamos ajustar SinRegistro aquí porque ya lo contamos arriba
      }
    });

    setCounts(newCounts);
    setProgramDetails(programDetails);
  }, []);

  // Configuración moderna de colores e iconos para niveles de riesgo
  const riskConfig = useMemo(
    () => ({
      Alto: {
        color: "#DC3545",
        backgroundColor: "rgba(220, 53, 69, 0.08)",
        borderColor: "rgba(220, 53, 69, 0.2)",
        icon: <WarningIcon />,
        gradient: "linear-gradient(135deg, #DC3545 0%, #B02A37 100%)",
      },
      Medio: {
        color: "#FF8C00",
        backgroundColor: "rgba(255, 140, 0, 0.08)",
        borderColor: "rgba(255, 140, 0, 0.2)",
        icon: <MediumIcon />,
        gradient: "linear-gradient(135deg, #FF8C00 0%, #E07600 100%)",
      },
      Bajo: {
        color: "#28A745",
        backgroundColor: "rgba(40, 167, 69, 0.08)",
        borderColor: "rgba(40, 167, 69, 0.2)",
        icon: <LowIcon />,
        gradient: "linear-gradient(135deg, #28A745 0%, #218838 100%)",
      },
      SinRegistro: {
        color: "#6C757D",
        backgroundColor: "rgba(108, 117, 125, 0.08)",
        borderColor: "rgba(108, 117, 125, 0.2)",
        icon: <HelpOutlineIcon />,
        gradient: "linear-gradient(135deg, #6C757D 0%, #495057 100%)",
      },
    }),
    [],
  );

  const processConfig = useMemo(
    () => ({
      AAC: {
        name: "Acreditación",
        icon: <StarIcon />,
        color: "#B22222",
        description: "Programas en proceso de acreditación",
      },
      RAAC: {
        name: "Renovación de Acreditación",
        icon: <AutorenewIcon />,
        color: "#B22222",
        description:
          "Renovación de acreditación alta calidad y acreditación de alta calidad primera vez",
      },
      INT: {
        name: "Acreditación Internacional",
        icon: <PublicIcon />,
        color: "#B22222",
        description: "Programas con acreditación internacional",
      },
    }),
    [],
  );

  const acreditacionFormacionChartData = useMemo(() => {
    const counts = new Map();
    const agrupaciones = {
      "Especialización Universitaria": "Pregrado",
      Universitario: "Pregrado",
    };
    programs.forEach((program) => {
      let nivelFormacion = String(program["nivel de formación"] ?? "").trim();

      if (agrupaciones[nivelFormacion]) {
        nivelFormacion = agrupaciones[nivelFormacion];
      }

      if (!nivelFormacion) return;

      if (!counts.has(nivelFormacion)) {
        counts.set(nivelFormacion, { acreditados: 0, acreditables: 0 });
      }

      const estado = program?.estadoaac;
      const esAcreditado =
        estado === "Vigente" || estado === "Vigente (En trámite)";

      const acreditableValue = String(
        program?.acreditable ?? program?.Acreditable ?? "",
      ).trim();
      const esAcreditable = acreditableValue === "Acreditable";

      const current = counts.get(nivelFormacion);
      if (esAcreditado) current.acreditados += 1;
      if (esAcreditable) current.acreditables += 1;
    });

    const labels = Array.from(counts.keys());

    return {
      labels,
      datasets: [
        {
          label: "Acreditados",
          data: labels.map((label) => counts.get(label)?.acreditados ?? 0),
          backgroundColor: "rgba(178, 34, 34, 0.8)",
          borderColor: "#B22222",
          borderWidth: 2,
        },
        {
          label: "Acreditables",
          data: labels.map((label) => counts.get(label)?.acreditables ?? 0),
          backgroundColor: "rgba(108, 117, 125, 0.8)",
          borderColor: "#6C757D",
          borderWidth: 2,
        },
      ],
    };
  }, [programs]);

  const acreditacionFormacionChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#495057",
            font: {
              size: 11,
              weight: "500",
            },
          },
        },
        datalabels: {
          display: true,
          color: "#FFFFFF",
          font: {
            size: 10,
            weight: "bold",
          },
          formatter: (value) => (value > 0 ? value : ""),
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
        y: {
          ticks: {
            autoSkip: false,
          },
        },
      },
    }),
    [],
  );

  const getTotalByProcess = useCallback(
    (proceso) => {
      return (
        counts[proceso].Alto +
        counts[proceso].Medio +
        counts[proceso].Bajo +
        counts[proceso].SinRegistro
      );
    },
    [counts],
  );

  const getTotalByRisk = useCallback(
    (riskLevel) => {
      return (
        counts.AAC[riskLevel] + counts.RAAC[riskLevel] + counts.INT[riskLevel]
      );
    },
    [counts],
  );

  const getGrandTotal = useCallback(() => {
    return Object.keys(counts).reduce((total, proceso) => {
      return total + getTotalByProcess(proceso);
    }, 0);
  }, [counts, getTotalByProcess]);

  const handleRowClick = useCallback((buttonValue, globalVar, rowKey) => {
    const validRowKeys = ["AAC", "RAAC", "INT"];
    if (validRowKeys.includes(rowKey)) {
      setSelectedRow(rowKey);
      if (rowKey === "RAAC") {
        setSelectedRaacOptions([]);
      }
      setSelectedRisk(null);
      setFilteredByRisk(false);
    } else {
      setSelectedRow(null);
    }
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedRow(null);
    setSelectedRisk(null);
    setFilteredByRisk(false);
  }, []);

  const handleNavigateToProgram = useCallback(
    (program) => {
      const programData = {
        ...program,
        globalVariable: selectedRow,
        userEmail: sessionStorage.getItem("userEmail"),
      };

      navigate("/program_details", {
        state: programData,
        replace: true,
      });
    },
    [navigate, selectedRow],
  );

  const handleGenerateReport = async (processType) => {
    setIsLoading(true);
    try {
      const programsData = programDetails[processType] || [];
      const worksheet = XLSX.utils.json_to_sheet(programsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos Filtrados");
      const filename =
        processType === "AAC"
          ? "datos_AAC.xlsx"
          : processType === "RAAC"
            ? "datos_RAAC.xlsx"
            : processType === "INT"
              ? "datos_INT.xlsx"
              : `datos_${processType}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error al generar reporte:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Estilos para los botones del semáforo RAAC
  const getRaacButtonStyles = (buttonType) => {
    const isSelected = selectedRaacOptions.includes(buttonType);
    const styles = {
      white: {
        backgroundColor: isSelected ? "#7e7e7e" : "#fff",
        color: isSelected ? "white" : "#000",
        borderColor: "#7e7e7e",
        "&:hover": {
          backgroundColor: isSelected ? "#6c6c6c" : "#f5f5f5",
        },
      },
      green: {
        backgroundColor: isSelected ? "#4caf50" : "#4caf4f36",
        color: isSelected ? "white" : "#000",
        borderColor: "#4caf50",
        "&:hover": {
          backgroundColor: isSelected ? "#3d9140" : "#e8f5e9",
        },
      },
      yellow: {
        backgroundColor: isSelected ? "#ffe600" : "rgba(255, 235, 59, 0.288)",
        color: isSelected ? "white" : "#000",
        borderColor: "#ffe600",
        "&:hover": {
          backgroundColor: isSelected ? "#e6cf00" : "#fffde7",
        },
      },
      orange: {
        backgroundColor: isSelected ? "#ff9800" : "#ff990079",
        color: isSelected ? "white" : "#000",
        borderColor: "#ff9800",
        "&:hover": {
          backgroundColor: isSelected ? "#e68900" : "#fff3e0",
        },
      },
      orange2: {
        backgroundColor: isSelected ? "#ff5722" : "#ff562275",
        color: isSelected ? "white" : "#000",
        borderColor: "#ff5722",
        "&:hover": {
          backgroundColor: isSelected ? "#e64a19" : "#fbe9e7",
        },
      },
      red: {
        backgroundColor: isSelected ? "#ee1809" : "#f443368e",
        color: isSelected ? "white" : "#000",
        borderColor: "#ee1809",
        "&:hover": {
          backgroundColor: isSelected ? "#d81508" : "#ffebee",
        },
      },
      gray: {
        backgroundColor: isSelected ? "#6C757D" : "rgba(108, 117, 125, 0.08)",
        color: isSelected ? "white" : "#000",
        borderColor: "#6C757D",
        "&:hover": {
          backgroundColor: isSelected ? "#5a6268" : "#e9ecef",
        },
      },
    };

    return {
      fontWeight: 600,
      padding: "12px 20px",
      borderRadius: "8px",
      border: "2px solid",
      margin: "0 5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      textTransform: "none",
      minWidth: "200px",
      ...styles[buttonType],
    };
  };

  // Manejador de clic para los botones del semáforo RAAC
  const handleRaacButtonClick = async (buttonType) => {
    if (selectedRow !== "RAAC") return;

    try {
      setLoading(true);

      // Toggle the clicked button (si ya está seleccionado, desactivarlo)
      setClickedRaacButton(
        buttonType === clickedRaacButton ? null : buttonType,
      );

      // Mapeo de tipos de botones a sus términos de búsqueda
      const searchTermMap = {
        white: "Vencido",
        green: "Fase 1",
        yellow: "Fase 2",
        orange: "Fase 3",
        orange2: "Fase 4",
        red: "Fase 5",
        gray: "SinRegistro",
      };

      // Get all programs
      let response;
      if (isCargo.includes("Posgrados")) {
        const filtered = await Filtro6({ searchTerm: "" });
        response = filtered.filter(
          (item) => item["pregrado/posgrado"] === "Posgrado",
        );
      } else {
        response = await Filtro6({ searchTerm: "" });
      }

      // Filter programs based on the clicked button
      let filteredPrograms;
      if (buttonType === clickedRaacButton) {
        // Si se hizo clic en el mismo botón, mostrar todos los programas RAAC
        filteredPrograms = response.filter(
          (item) =>
            item["ac vigente"] === "SI" || item["fase rac"] === "Vencido",
        );
        setClickedRaacButton(null);
      } else if (buttonType === "white") {
        // Para el botón "white", mostrar solo los programas con fase_rac = 'Vencido'
        filteredPrograms = response.filter(
          (item) => item["fase rac"] === "Vencido",
        );
      } else if (buttonType === "gray") {
        // Para el botón "gray", mostrar programas con fase_rac vacío o 'N/A'
        filteredPrograms = response.filter(
          (item) =>
            (!item["fase rac"] ||
              item["fase rac"] === "" ||
              item["fase rac"] === "N/A") &&
            item["ac vigente"] === "SI",
        );
      } else {
        // Para los demás botones, filtrar por fase_rac y ac_vigente = 'SI'
        filteredPrograms = response.filter(
          (item) =>
            item["fase rac"] === searchTermMap[buttonType] &&
            item["ac vigente"] === "SI",
        );
      }

      // Get all seguimientos to assign risk levels
      const seguimientos = await Filtro7();

      // Get all RAAC programs with risk information
      const programsWithRisk = await loadProgramsWithRisk(
        filteredPrograms,
        seguimientos,
      );

      // Calculate new counts based on filtered programs
      const newCounts = { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 };
      programsWithRisk.forEach((program) => {
        if (newCounts[program.riesgo] !== undefined) {
          newCounts[program.riesgo] += 1;
        }
      });

      // Update programDetails state with filtered RAAC programs
      setProgramDetails((prev) => ({
        ...prev,
        RAAC: programsWithRisk,
      }));

      // Update counts directly for immediate UI refresh
      setCounts((prev) => ({
        ...prev,
        RAAC: newCounts,
      }));

      setLoading(false);
    } catch (error) {
      console.error("Error al filtrar programas RAAC:", error);
      setLoading(false);
    }
  };

  // Helper function to load programs with risk information
  const loadProgramsWithRisk = async (programs, seguimientos) => {
    return programs.map((program) => {
      // Para programas AAC, clasificar según estado de acreditación
      if (program["aac_1a"] === "SI") {
        return {
          ...program,
          ...getRiesgoAac(program),
        };
      }

      // Asignar riesgo según la fase para programas RAAC

      if (program["fase rac"] === "Vencido" && (program['estadoaac'] == '' || program['estadoaac'] == 'No Vigente')) {
        return {
          ...program,
          riesgo: "Alto",
          mensaje: "Programa con acreditación vencida",
        };
      }

      if (program["fase rac"] === "Fase 5") {
        return {
          ...program,
          riesgo: "Alto",
          mensaje: "Programa en Fase 5 - Alto riesgo",
        };
      }

      if (
        program["fase rac"] === "Fase 4" ||
        program["fase rac"] === "Fase 3" || ((program["fase rac"] === "Vencido" ||  program["fase rac"] === "N/A") && (program['estadoaac'] == 'Vigente' || program['estadoaac'] == 'Vigente (En trámite)'))
      ) {
        return {
          ...program,
          riesgo: "Medio",
          mensaje: `Programa en ${program["fase rac"]} - Riesgo medio`,
        };
      }

      if (program["fase rac"] === "Fase 2") {
        return {
          ...program,
          riesgo: "Bajo",
          mensaje: `Programa en ${program["fase rac"]} - Bajo riesgo`,
        };
      }

      if (program["fase rac"] === "Fase 1") {
        return {
          ...program,
          riesgo: "SinRegistro",
          mensaje: "Fase 1 no clasificada en semaforización",
        };
      }

      // Para los demás programas, proceder como antes
      const programSeguimientos = seguimientos.filter(
        (seg) => seg.id_programa === program.id_programa,
      );
      let latestSeguimiento = null;

      if (programSeguimientos.length > 0) {
        latestSeguimiento = programSeguimientos.reduce((prev, current) => {
          return new Date(current.timestamp) > new Date(prev.timestamp)
            ? current
            : prev;
        });
      }

      // Return program with risk information
      return {
        ...program,
        riesgo: latestSeguimiento ? latestSeguimiento.riesgo : "SinRegistro",
        mensaje: latestSeguimiento
          ? latestSeguimiento.mensaje
          : "Sin información",
      };
    });
  };

  // Load RAAC programs when RAAC section is first viewed
  useEffect(() => {
    if (selectedRow === "RAAC") {
      const loadRaacPrograms = async () => {
        try {
          setLoading(true);

          // Reset clicked button
          setClickedRaacButton(null);

          // Get all programs
          let response;
          if (isCargo.includes("Posgrados")) {
            const filtered = await Filtro6({ searchTerm: "" });
            response = filtered.filter(
              (item) => item["pregrado/posgrado"] === "Posgrado",
            );
          } else {
            response = await Filtro6({ searchTerm: "" });
          }

          // Filter programs appropriately - mostrar todos los programas RAAC inicialmente
          // Incluir también programas con fase_rac vacío o 'N/A' para clasificarlos como SinRegistro
          const allRaacPrograms = response.filter(
            (item) =>
              item["estadoaac"] === "Vigente" ||
              item["estadoaac"] === "Vigente (En trámite)" ||
              item["estadoaac"] === "En trámite" ||
              item["fase rac"] === "Vencido",
          );

          // Get all seguimientos to assign risk levels
          const seguimientos = await Filtro7();

          // Get all RAAC programs with risk information
          const programsWithRisk = await loadProgramsWithRisk(
            allRaacPrograms,
            seguimientos,
          );

          // Calculate new counts based on all RAAC programs
          const newCounts = { Alto: 0, Medio: 0, Bajo: 0, SinRegistro: 0 };
          programsWithRisk.forEach((program) => {
            if (newCounts[program.riesgo] !== undefined) {
              newCounts[program.riesgo] += 1;
            }
          });

          // Update programDetails state with all RAAC programs
          setProgramDetails((prev) => ({
            ...prev,
            RAAC: programsWithRisk,
          }));

          // Update counts directly for immediate UI refresh
          setCounts((prev) => ({
            ...prev,
            RAAC: newCounts,
          }));

          setLoading(false);
        } catch (error) {
          console.error("Error al cargar programas RAAC:", error);
          setLoading(false);
        }
      };

      loadRaacPrograms();
    }
  }, [selectedRow, isCargo]);

  // Manejar clic en tarjeta de riesgo para filtrar programas
  const handleRiskCardClick = useCallback(
    (risk) => {
      if (selectedRisk === risk) {
        // Si ya está seleccionado, deseleccionar y mostrar todos
        setSelectedRisk(null);
        setFilteredByRisk(false);
      } else {
        // Seleccionar y filtrar por este riesgo
        setSelectedRisk(risk);
        setFilteredByRisk(true);
      }
    },
    [selectedRisk],
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
          width: "calc(80% - 10px)",
          maxWidth: "100%",
          ml: { xs: 0, sm: 0, md: "20px", lg: "40px" },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: "100%", md: "1280px", lg: "1450px" },
            px: { xs: 1, sm: 2, md: 2, lg: 2 },
            margin: "0 auto",
            position: "relative",
            boxSizing: "border-box",
            overflowX: "hidden",
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
                Cargando información...
              </Typography>
            </Box>
          ) : selectedRow === "AAC" ? (
            <Acreditacion
              counts={counts}
              riskConfig={riskConfig}
              programDetails={programDetails}
              isLoading={isLoading}
              handleGenerateReport={handleGenerateReport}
              handleBackClick={handleBackClick}
              handleNavigateToProgram={handleNavigateToProgram}
              handleRiskCardClick={handleRiskCardClick}
              selectedRisk={selectedRisk}
              setSelectedRisk={setSelectedRisk}
              filteredByRisk={filteredByRisk}
              setFilteredByRisk={setFilteredByRisk}
            />
          ) : selectedRow === "RAAC" ? (
            <RenovacionAcreditacion
              counts={counts}
              riskConfig={riskConfig}
              programDetails={programDetails}
              isLoading={isLoading}
              handleGenerateReport={handleGenerateReport}
              handleBackClick={handleBackClick}
              handleNavigateToProgram={handleNavigateToProgram}
              handleRiskCardClick={handleRiskCardClick}
              selectedRisk={selectedRisk}
              setSelectedRisk={setSelectedRisk}
              filteredByRisk={filteredByRisk}
              setFilteredByRisk={setFilteredByRisk}
              raacProgramCounts={raacProgramCounts}
              handleRaacButtonClick={handleRaacButtonClick}
              getRaacButtonStyles={getRaacButtonStyles}
              loading={loading}
            />
          ) : selectedRow === "INT" ? (
            <AcreditacionInternacional
              counts={counts}
              riskConfig={riskConfig}
              programDetails={programDetails}
              isLoading={isLoading}
              handleGenerateReport={handleGenerateReport}
              handleBackClick={handleBackClick}
              handleNavigateToProgram={handleNavigateToProgram}
              handleRiskCardClick={handleRiskCardClick}
              selectedRisk={selectedRisk}
              setSelectedRisk={setSelectedRisk}
              filteredByRisk={filteredByRisk}
              setFilteredByRisk={setFilteredByRisk}
              processConfig={processConfig}
              getTotalByProcess={getTotalByProcess}
              loading={loading}
            />
          ) : selectedRow ? (
            <DetailedProcessView
              selectedRow={selectedRow}
              counts={counts}
              riskConfig={riskConfig}
              processConfig={processConfig}
              programDetails={programDetails}
              isLoading={isLoading}
              handleGenerateReport={handleGenerateReport}
              handleBackClick={handleBackClick}
              handleNavigateToProgram={handleNavigateToProgram}
              handleRiskCardClick={handleRiskCardClick}
              selectedRisk={selectedRisk}
              setSelectedRisk={setSelectedRisk}
              filteredByRisk={filteredByRisk}
              setFilteredByRisk={setFilteredByRisk}
              raacProgramCounts={raacProgramCounts}
              handleRaacButtonClick={handleRaacButtonClick}
              getRaacButtonStyles={getRaacButtonStyles}
              loading={loading}
            />
          ) : (
            <>
            <Box sx={{ width: "100%", mb: 4 }}>
              
                <Card
                  sx={{
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.02)",
                    overflow: "hidden",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: "#212529",
                        fontSize: { xs: "1rem", sm: "1.125rem" },
                      }}
                    >
                      Programas acreditados sobre la cantidad de acreditables de
                      la Facultad de Salud
                    </Typography>
                    <Box sx={{ height: { xs: 260, sm: 340, md: 420 } }}>
                      {acreditacionFormacionChartData.labels.length > 0 ? (
                        <Bar
                          data={acreditacionFormacionChartData}
                          options={acreditacionFormacionChartOptions}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: "#6C757D" }}>
                          Sin datos para mostrar.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              
              <GeneralProcessTable 
                counts={counts}
                processConfig={processConfig}
                riskConfig={riskConfig}
                getTotalByProcess={getTotalByProcess}
                getTotalByRisk={getTotalByRisk}
                getGrandTotal={getGrandTotal}
                handleRowClick={handleRowClick}
              />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AltaCalidad;
