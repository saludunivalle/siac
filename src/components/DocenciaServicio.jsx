import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import CollapsibleButton from "./CollapsibleButton";
import { Filtro14 } from "../service/data";
import { fetchPostGeneral } from "../service/fetch";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Checkbox,
  Divider,
  ButtonGroup,
} from "@mui/material";
import axios from "axios";
import ModalAsignaturas from "./docenciaServicio/ModalAsignaturas";

const DocenciaServicio = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isVistaAnexo = location.pathname.includes("/formulario-anexo");
  const isVistaEscenario = location.pathname.includes("/formulario-escenario");
  const [data, setData] = useState([]);
  const [isCargo, setCargo] = useState([" "]);
  const [loading, setLoading] = useState(true);
  const [anexos, setAnexos] = useState([]);
  const [docEscenarios, setDocEscenarios] = useState([]);
  const [anexosPorEscenario, setAnexosPorEscenario] = useState({});
  const [programasData, setProgramasData] = useState([]);
  const [practicasData, setPracticasData] = useState([]);
  const [periodosFromPracticas, setPeriodosFromPracticas] = useState(null); // null = no cargado, [] = sin datos para programa
  const [escuelasUnicas, setEscuelasUnicas] = useState([]);
  const [programasUnicos, setProgramasUnicos] = useState([]);

  // Estados para filtros
  const [filtroEscuela, setFiltroEscuela] = useState("");
  const [filtroPrograma, setFiltroPrograma] = useState("");
  const [filtroEscenario, setFiltroEscenario] = useState("");
  const [tipoVista, setTipoVista] = useState("escenario"); // 'escenario', 'escuela', 'programa'

  // Estados para el formulario de anexos técnicos
  const [showAnexoForm, setShowAnexoForm] = useState(false);
  const [showAsignaturasModal, setShowAsignaturasModal] = useState(false);
  // Constantes para la tabla de horarios
  const DIAS = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const HORAS = [
    "6-7",
    "7-8",
    "8-9",
    "9-10",
    "10-11",
    "11-12",
    "12-13",
    "13-14",
    "14-15",
    "15-16",
    "16-17",
    "17-18",
    "18-19",
    "19-20",
  ];

  // Estado inicial de un plan vacío
  const crearPlanVacio = () => ({
    id: Date.now() + Math.random(),
    nombre: "",
    // grid[diaIndex][horaIndex] = true/false
    grid: Array(7)
      .fill(null)
      .map(() => Array(14).fill(false)),
    numero_semanas: "",
    expandido: true,
  });

  const PERIODOS_ROMANOS = ["VI", "VII", "VIII", "IX", "X"];

  const initialAnexoFormData = {
    idPrograma: "",
    programaSeleccionado: null,
    idEscenario: "",
    nombreEscenario: "",
    urlAnexo: "",
    estadoAnexo: "Pendiente",
    tipo: "",
    vigenciaDesde: "",
    vigenciaHasta: "",
    version: "",
    procesoCalidad: "",
    cierre: "",
    observaciones: "",
    planes: [],
    localFile: null,
    // Nuevos campos
    nombre_IES: "Universidad del Valle",
    correo: "",
    nivel_formacion: "",
    duracion_semanas: "",
    duracion_semestres: "",
    periodicidad_admision: "",
    estudiantes_admitidos: "",
    periodos_pract_formativas: [],
    director_nombre: "Aida Josefina Rojas Fajardo",
    director_cargo: "Vicedecana académica",
    director_telefono: "602 3212100 ext. 7748",
    director_correo: "vicedecanatura.salud@correounivalle.edu.co",
    ds_ies_nombre: "",
    ds_ies_cargo: "",
    ds_ies_telefono: "",
    ds_ies_correo: "",
    fecha_formalizacion: "",
    coordinacion_nombre: "",
    coordinacion_cargo: "",
    coordinacion_telefono: "",
    coordinacion_correo: "",
  };

  const [anexoFormData, setAnexoFormData] = useState(initialAnexoFormData);
  const [reloadAnexos, setReloadAnexos] = useState(false);

  const programaSeleccionado = programasData.find(
    (programa) => programa["programa académico"] === filtroPrograma,
  );

  // Estados para el formulario de escenarios de práctica y documentos
  const initialDocEscenarioState = {
    idEscenario: "",
    nombreEscenario: "",
    url: "",
    tipologia: "",
    codigo: "",
    fechaInicio: "",
    fechaFin: "",
    localFile: null,
    nombre_sede: "",
    numero_sede: "",
    departamento: "",
    municipio: "",
    direccion: "",
    nit: "",
    telefono: "",
    correo: "",
    contacto: "",
    documento: "",
    tipo_convenio: "",
    firma_convenio: "",
    otros_si: "",
    anexo_tecnico: "",
  };
  const [showDocEscenarioForm, setShowDocEscenarioForm] = useState(null); // Cambiado a null para rastrear cuál escenario
  const [docEscenarioFormData, setDocEscenarioFormData] = useState(
    initialDocEscenarioState,
  );

  useEffect(() => {
    if (isVistaEscenario && location.state?.escenario) {
      setDocEscenarioFormData(location.state.escenario);
    }
  }, [isVistaEscenario, location.state]);
  const [escenariosData, setEscenariosData] = useState([]);
  const [uniqueTipologias, setUniqueTipologias] = useState([]);
  const [reloadDocEscenarios, setReloadDocEscenarios] = useState(false);

  // Efecto para extraer tipologías y códigos únicos
  useEffect(() => {
    if (escenariosData && escenariosData.length > 0) {
      const tipologias = [
        ...new Set(
          escenariosData.map((e) => e.tipologia || "").filter(Boolean),
        ),
      ];
      setUniqueTipologias(tipologias);
    }
  }, [escenariosData]);

  // Obtener los permisos del usuario desde sessionStorage
  useEffect(() => {
    if (sessionStorage.getItem("logged")) {
      const res = JSON.parse(sessionStorage.getItem("logged"));
      const permisos = res.map((item) => item.permiso).flat();
      setCargo(permisos);
    }
  }, []);

  // Función para obtener los datos de programas
  const fetchProgramas = async () => {
    try {
      // Cambiar a la ruta correcta que apunta a la base de datos principal
      const response = await axios.post("https://siac-server.vercel.app/", {
        sheetName: "Programas",
      });

      if (response.data && response.data.status) {
        console.log("Programas obtenidos:", response.data.data);
        const programas = response.data.data || [];
        setProgramasData(programas);

        // Extraer escuelas únicas (la columna "Escuela" se normaliza a "escuela")
        const escuelas = [
          ...new Set(
            programas
              .map((p) => p.escuela)
              .filter((e) => e && e.trim() !== "")
              .map((e) => e.trim()), // Eliminar espacios extra
          ),
        ].sort();
        setEscuelasUnicas(escuelas);

        // Extraer programas únicos (la columna "Programa Académico" se normaliza a "programa académico")
        const programasAcademicos = [
          ...new Set(
            programas
              .map((p) => p["programa académico"])
              .filter((p) => p && p.trim() !== "")
              .map((p) => p.trim()), // Eliminar espacios extra
          ),
        ].sort();
        setProgramasUnicos(programasAcademicos);

        return programas;
      } else {
        console.warn("No se pudieron obtener los programas:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener los programas:", error);
      return [];
    }
  };

  // Función para obtener los anexos técnicos
  const fetchAnexos = async () => {
    try {
      const response = await axios.post(
        "https://siac-server.vercel.app/getAnexos",
        { sheetName: "ANEXOS_TEC" },
      );
      if (response.data && response.data.status) {
        console.log("Anexos obtenidos:", response.data.data);
        return response.data.data || [];
      } else {
        console.warn("No se pudieron obtener los anexos:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener los anexos:", error);
      return [];
    }
  };

  // Función para obtener los escenarios de práctica de la hoja ESC_PRACTICA
  const fetchEscenarios = async () => {
    try {
      const response = await axios.post(
        "https://siac-server.vercel.app/getInstituciones",
        { sheetName: "ESC_PRACTICA" },
      );
      if (response.data && response.data.status) {
        console.log("=== DEBUG ESC_PRACTICA DATA ===");
        console.log("Escenarios de práctica obtenidos:", response.data.data);
        console.log("Primer escenario ejemplo:", response.data.data[0]);
        console.log(
          "Estructura de campos:",
          Object.keys(response.data.data[0] || {}),
        );
        console.log("===============================");

        setEscenariosData(response.data.data || []);
        return response.data.data || [];
      } else {
        console.warn(
          "No se pudieron obtener los escenarios de práctica:",
          response.data,
        );
        setEscenariosData([]);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener los escenarios de práctica:", error);
      setEscenariosData([]);
      return [];
    }
  };

  // Función para obtener los documentos de escenario de la hoja ANEXOS_ESC
  const fetchDocEscenarios = async () => {
    try {
      const response = await axios.post(
        "https://siac-server.vercel.app/getDocEscenarios",
        { sheetName: "ANEXOS_ESC" },
      );
      if (response.data && response.data.status) {
        console.log("Documentos de escenario obtenidos:", response.data.data);
        setDocEscenarios(response.data.data || []);
        return response.data.data || [];
      } else {
        console.warn(
          "No se pudieron obtener los documentos de escenario:",
          response.data,
        );
        setDocEscenarios([]);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener los documentos de escenario:", error);
      setDocEscenarios([]);
      return [];
    }
  };

  // Función para obtener los datos de prácticas formativas de la hoja "practicas"
  const fetchPracticas = async () => {
    try {
      const response = await axios.post("https://siac-server.vercel.app/docServ", {
        sheetName: "PRACTICAS",
      });
      if (response.data && response.data.status) {
        console.log("Prácticas obtenidas:", response.data.data);
        const practicas = response.data.data || [];
        setPracticasData(practicas);
        return practicas;
      } else {
        console.warn("No se pudieron obtener las prácticas:", response.data);
        setPracticasData([]);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener las prácticas:", error);
      setPracticasData([]);
      return [];
    }
  };

  // Función para obtener los períodos de prácticas para un programa dado
  const getPeriodosParaPrograma = (idPrograma, practicas) => {
    if (!idPrograma || !practicas || practicas.length === 0) return [];
    const idProgramaStr = String(idPrograma).trim().toLowerCase();
    const practicasDelPrograma = practicas.filter((p) => {
      const pId = String(p.id_programa || p["id_programa"] || "").trim().toLowerCase();
      return pId === idProgramaStr;
    });
    if (practicasDelPrograma.length === 0) return [];
    // Extraer períodos únicos (ej: "VI", "VII", etc.)
    const periodosKey = "período académico";
    const periodosUnicos = [
      ...new Set(
        practicasDelPrograma
          .map((p) => {
            const val = p[periodosKey] || p["periodo académico"] || p["periodo academico"] || p["período academico"] || "";
            return String(val).trim().toUpperCase();
          })
          .filter((v) => v !== ""),
      ),
    ];
    return periodosUnicos;
  };

  // Función para agrupar anexos según el tipo de vista
  const agruparAnexos = (
    anexos,
    docEscenarios,
    escenarios,
    programas,
    tipoVista,
    filtroEscuela,
    filtroPrograma,
    filtroEscenario,
  ) => {
    console.log("Agrupando anexos con:", {
      tipoVista,
      filtroEscuela,
      filtroPrograma,
      filtroEscenario,
    });

    if (tipoVista === "escenario") {
      return agruparAnexosPorEscenario(
        anexos,
        docEscenarios,
        escenarios,
        programas,
        filtroEscenario,
      );
    } else if (tipoVista === "escuela") {
      return agruparAnexosPorEscuela(
        anexos,
        docEscenarios,
        programas,
        filtroEscuela,
        filtroEscenario,
        escenarios,
      );
    } else if (tipoVista === "programa") {
      return agruparAnexosPorPrograma(
        anexos,
        docEscenarios,
        programas,
        filtroPrograma,
        filtroEscenario,
        escenarios,
      );
    }

    return {};
  };

  // Helper para verificar si un item, escenario o programa coincide con la búsqueda
  const cumpleFiltroBusqueda = (item, escenarioObj, programaObj, term) => {
    if (!term) return true;
    const t = term.toLowerCase().trim();
    if (!t) return true;

    // 1. Nombre (escenario, institución, sede)
    const nombre = String(
      item?.nombre ||
        item?.institucion ||
        escenarioObj?.nombre ||
        escenarioObj?.nombre_sede ||
        "",
    ).toLowerCase();
    if (nombre.includes(t)) return true;

    // 2. Código (del escenario o documento)
    const codigo = String(
      item?.codigo || escenarioObj?.codigo || "",
    ).toLowerCase();
    if (codigo.includes(t)) return true;

    // 3. Municipio
    const municipio = String(
      escenarioObj?.municipio || item?.municipio || "",
    ).toLowerCase();
    if (municipio.includes(t)) return true;

    // 4. Nombre del programa al que pertenece
    const progNombre = String(
      programaObj?.["programa académico"] ||
        programaObj?.nombre_programa ||
        item?.programa_info?.["programa académico"] ||
        item?.denominacion_programa ||
        item?.programa ||
        "",
    ).toLowerCase();
    if (progNombre.includes(t)) return true;

    return false;
  };

  // Función para agrupar anexos por escenario (con búsqueda por nombre, código, municipio o programa)
  const agruparAnexosPorEscenario = (
    anexos,
    docEscenarios,
    escenarios,
    programas,
    filtroEscenario,
  ) => {
    const agrupados = {};

    // Validar que escenarios sea un array
    if (!escenarios || !Array.isArray(escenarios)) {
      return agrupados;
    }

    // Inicializar cada escenario con un objeto que contenga anexos técnicos y documentos de escenario
    escenarios.forEach((escenario) => {
      agrupados[escenario.nombre] = {
        anexosTecnicos: [],
        documentosEscenario: [],
        totalItems: 0,
        escenarioInfo: escenario,
      };
    });

    // Validar y agrupar anexos técnicos por nombre de escenario
    if (anexos && Array.isArray(anexos)) {
      anexos.forEach((anexo) => {
        const escenario = escenarios.find(
          (esc) =>
            (anexo.id_escenario && esc.id === anexo.id_escenario) ||
            (anexo.nombre &&
              esc.nombre?.trim().toLowerCase() ===
                anexo.nombre?.trim().toLowerCase()),
        );
        const targetNombre = escenario ? escenario.nombre : anexo.nombre;

        if (targetNombre && agrupados[targetNombre] !== undefined) {
          const programaInfo = programas?.find(
            (p) => p.id_programa === anexo.id_programa,
          );
          agrupados[targetNombre].anexosTecnicos.push({
            ...anexo,
            programa_info: programaInfo,
            tipo_documento: "anexo_tecnico",
          });
        }
      });
    }

    // Validar y agrupar documentos de escenario
    if (docEscenarios && Array.isArray(docEscenarios)) {
      docEscenarios.forEach((docEscenario) => {
        const escenario = escenarios.find(
          (esc) =>
            (docEscenario.id_escenario &&
              esc.id === docEscenario.id_escenario) ||
            (docEscenario.institucion &&
              esc.nombre?.trim().toLowerCase() ===
                docEscenario.institucion?.trim().toLowerCase()),
        );
        const targetNombre = escenario
          ? escenario.nombre
          : docEscenario.institucion;

        if (targetNombre && agrupados[targetNombre] !== undefined) {
          const programaInfo = docEscenario.id_programa
            ? programas?.find((p) => p.id_programa === docEscenario.id_programa)
            : null;

          agrupados[targetNombre].documentosEscenario.push({
            ...docEscenario,
            programa_info: programaInfo,
            tipo_documento: "documento_escenario",
            nombre: targetNombre,
          });
        }
      });
    }

    // Aplicar filtro de búsqueda (nombre, código, municipio o nombre del programa al que pertenece)
    const term = filtroEscenario ? filtroEscenario.toLowerCase().trim() : "";

    Object.keys(agrupados).forEach((nombreEscenario) => {
      const grupo = agrupados[nombreEscenario];
      const escenario = grupo.escenarioInfo;

      if (term) {
        // 1. Nombre (escenario, institución o sede)
        const coincideNombre =
          (nombreEscenario && nombreEscenario.toLowerCase().includes(term)) ||
          (escenario?.nombre &&
            escenario.nombre.toLowerCase().includes(term)) ||
          (escenario?.nombre_sede &&
            escenario.nombre_sede.toLowerCase().includes(term));

        // 2. Código (del escenario o anexos/documentos)
        const coincideCodigo =
          (escenario?.codigo &&
            String(escenario.codigo).toLowerCase().includes(term)) ||
          grupo.anexosTecnicos.some(
            (a) => a.codigo && String(a.codigo).toLowerCase().includes(term),
          ) ||
          grupo.documentosEscenario.some(
            (d) => d.codigo && String(d.codigo).toLowerCase().includes(term),
          );

        // 3. Municipio (del escenario)
        const coincideMunicipio =
          escenario?.municipio &&
          String(escenario.municipio).toLowerCase().includes(term);

        // 4. Nombre del programa al que pertenece
        const coincidePrograma =
          grupo.anexosTecnicos.some((a) => {
            const prog =
              a.programa_info?.["programa académico"] ||
              a.denominacion_programa ||
              a.programa;
            return prog && String(prog).toLowerCase().includes(term);
          }) ||
          grupo.documentosEscenario.some((d) => {
            const prog =
              d.programa_info?.["programa académico"] || d.programa;
            return prog && String(prog).toLowerCase().includes(term);
          });

        if (
          !coincideNombre &&
          !coincideCodigo &&
          !coincideMunicipio &&
          !coincidePrograma
        ) {
          delete agrupados[nombreEscenario];
          return;
        }
      }

      grupo.totalItems =
        grupo.anexosTecnicos.length + grupo.documentosEscenario.length;
    });

    // Convertir a array, ordenar por total de items (mayor a menor) y volver a objeto
    const escenariosOrdenados = Object.entries(agrupados)
      .sort(([, grupoA], [, grupoB]) => grupoB.totalItems - grupoA.totalItems)
      .reduce((acc, [nombre, grupo]) => {
        acc[nombre] = grupo;
        return acc;
      }, {});

    return escenariosOrdenados;
  };

  // Función para agrupar anexos por escuela (con búsqueda por nombre, código, municipio o programa)
  const agruparAnexosPorEscuela = (
    anexos,
    docEscenarios,
    programas,
    filtroEscuela,
    filtroEscenario,
    escenarios,
  ) => {
    const agrupados = {};

    // Validar que programas sea un array
    if (!programas || !Array.isArray(programas)) {
      return agrupados;
    }

    // Filtrar programas por escuela si hay filtro
    const programasFiltrados = filtroEscuela
      ? programas.filter((p) => p.escuela === filtroEscuela)
      : programas;

    // Inicializar cada escuela con un objeto que contenga anexos técnicos y documentos de escenario
    const escuelasParaMostrar = filtroEscuela
      ? [filtroEscuela]
      : [
          ...new Set(
            programasFiltrados
              .map((p) => p.escuela)
              .filter((e) => e && e.trim() !== ""),
          ),
        ];

    escuelasParaMostrar.forEach((escuela) => {
      agrupados[escuela] = {
        anexosTecnicos: [],
        documentosEscenario: [],
        totalItems: 0,
      };
    });

    // Validar y agrupar anexos técnicos por escuela del programa
    if (anexos && Array.isArray(anexos)) {
      anexos.forEach((anexo) => {
        const escenarioObj = escenarios?.find(
          (e) => e.id === anexo.id_escenario || e.nombre === anexo.nombre,
        );
        const programa = anexo.id_programa
          ? programas.find((p) => p.id_programa === anexo.id_programa)
          : null;

        // Aplicar búsqueda por nombre, código, municipio o programa
        if (
          filtroEscenario &&
          !cumpleFiltroBusqueda(anexo, escenarioObj, programa, filtroEscenario)
        ) {
          return;
        }

        if (
          programa &&
          programa.escuela &&
          agrupados[programa.escuela] !== undefined
        ) {
          agrupados[programa.escuela].anexosTecnicos.push({
            ...anexo,
            programa_info: programa,
            tipo_documento: "anexo_tecnico",
          });
        }
      });
    }

    // Validar y agrupar documentos de escenario
    if (docEscenarios && Array.isArray(docEscenarios)) {
      docEscenarios.forEach((docEscenario) => {
        const escenarioObj = escenarios?.find(
          (e) =>
            e.id === docEscenario.id_escenario ||
            e.nombre === docEscenario.institucion,
        );
        const programa = docEscenario.id_programa
          ? programas.find((p) => p.id_programa === docEscenario.id_programa)
          : null;

        // Aplicar búsqueda por nombre, código, municipio o programa
        if (
          filtroEscenario &&
          !cumpleFiltroBusqueda(
            docEscenario,
            escenarioObj,
            programa,
            filtroEscenario,
          )
        ) {
          return;
        }

        if (
          programa &&
          programa.escuela &&
          agrupados[programa.escuela] !== undefined
        ) {
          agrupados[programa.escuela].documentosEscenario.push({
            ...docEscenario,
            programa_info: programa,
            tipo_documento: "documento_escenario",
          });
        }
      });
    }

    // Calcular total de items para cada escuela y filtrar escuelas vacías si hay búsqueda activa
    const term = filtroEscenario ? filtroEscenario.toLowerCase().trim() : "";
    Object.keys(agrupados).forEach((escuela) => {
      agrupados[escuela].totalItems =
        agrupados[escuela].anexosTecnicos.length +
        agrupados[escuela].documentosEscenario.length;

      if (
        term &&
        agrupados[escuela].totalItems === 0 &&
        !escuela.toLowerCase().includes(term)
      ) {
        delete agrupados[escuela];
      }
    });

    // Convertir a array, ordenar por total de items (mayor a menor) y volver a objeto
    const escuelasOrdenadas = Object.entries(agrupados)
      .sort(([, grupoA], [, grupoB]) => grupoB.totalItems - grupoA.totalItems)
      .reduce((acc, [escuela, grupo]) => {
        acc[escuela] = grupo;
        return acc;
      }, {});

    return escuelasOrdenadas;
  };

  // Función para agrupar anexos por programa académico (con búsqueda por nombre, código, municipio o programa)
  const agruparAnexosPorPrograma = (
    anexos,
    docEscenarios,
    programas,
    filtroPrograma,
    filtroEscenario,
    escenarios,
  ) => {
    const agrupados = {};

    // Validar que programas sea un array
    if (!programas || !Array.isArray(programas)) {
      return agrupados;
    }

    // Filtrar programas por programa académico si hay filtro
    const programasFiltrados = filtroPrograma
      ? programas.filter((p) => p["programa académico"] === filtroPrograma)
      : programas;

    // Inicializar cada programa académico con un objeto que contenga anexos técnicos y documentos de escenario
    const programasParaMostrar = filtroPrograma
      ? [filtroPrograma]
      : [
          ...new Set(
            programasFiltrados
              .map((p) => p["programa académico"])
              .filter((p) => p && p.trim() !== ""),
          ),
        ];

    programasParaMostrar.forEach((programa) => {
      agrupados[programa] = {
        anexosTecnicos: [],
        documentosEscenario: [],
        totalItems: 0,
      };
    });

    // Validar y agrupar anexos técnicos por programa académico
    if (anexos && Array.isArray(anexos)) {
      anexos.forEach((anexo) => {
        const escenarioObj = escenarios?.find(
          (e) => e.id === anexo.id_escenario || e.nombre === anexo.nombre,
        );
        const programa = anexo.id_programa
          ? programas.find((p) => p.id_programa === anexo.id_programa)
          : null;

        // Aplicar búsqueda por nombre, código, municipio o programa
        if (
          filtroEscenario &&
          !cumpleFiltroBusqueda(anexo, escenarioObj, programa, filtroEscenario)
        ) {
          return;
        }

        if (
          programa &&
          programa["programa académico"] &&
          agrupados[programa["programa académico"]] !== undefined
        ) {
          agrupados[programa["programa académico"]].anexosTecnicos.push({
            ...anexo,
            programa_info: programa,
            tipo_documento: "anexo_tecnico",
          });
        }
      });
    }

    // Validar y agrupar documentos de escenario
    if (docEscenarios && Array.isArray(docEscenarios)) {
      docEscenarios.forEach((docEscenario) => {
        const escenarioObj = escenarios?.find(
          (e) =>
            e.id === docEscenario.id_escenario ||
            e.nombre === docEscenario.institucion,
        );
        const programa = docEscenario.id_programa
          ? programas.find((p) => p.id_programa === docEscenario.id_programa)
          : null;

        // Aplicar búsqueda por nombre, código, municipio o programa
        if (
          filtroEscenario &&
          !cumpleFiltroBusqueda(
            docEscenario,
            escenarioObj,
            programa,
            filtroEscenario,
          )
        ) {
          return;
        }

        if (
          programa &&
          programa["programa académico"] &&
          agrupados[programa["programa académico"]] !== undefined
        ) {
          agrupados[programa["programa académico"]].documentosEscenario.push({
            ...docEscenario,
            programa_info: programa,
            tipo_documento: "documento_escenario",
          });
        }
      });
    }

    // Calcular total de items para cada programa académico y filtrar programas vacíos si hay búsqueda activa
    const term = filtroEscenario ? filtroEscenario.toLowerCase().trim() : "";
    Object.keys(agrupados).forEach((programa) => {
      agrupados[programa].totalItems =
        agrupados[programa].anexosTecnicos.length +
        agrupados[programa].documentosEscenario.length;

      if (
        term &&
        agrupados[programa].totalItems === 0 &&
        !programa.toLowerCase().includes(term)
      ) {
        delete agrupados[programa];
      }
    });

    // Convertir a array, ordenar por total de items (mayor a menor) y volver a objeto
    const programasOrdenados = Object.entries(agrupados)
      .sort(([, grupoA], [, grupoB]) => grupoB.totalItems - grupoA.totalItems)
      .reduce((acc, [programa, grupo]) => {
        acc[programa] = grupo;
        return acc;
      }, {});

    return programasOrdenados;
  };

  // Efecto para obtener los datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("=== INICIANDO CARGA DE DATOS ===");
        // Obtener escenarios, anexos, documentos de escenario y programas en paralelo
        // Se elimina Filtro14 y se usa fetchEscenarios como única fuente para los datos de escenarios.
        const [
          escenariosResult,
          anexosResult,
          docEscenariosResult,
          programasResult,
          practicasResult,
        ] = await Promise.all([
          fetchEscenarios(),
          fetchAnexos(),
          fetchDocEscenarios(),
          fetchProgramas(),
          fetchPracticas(),
        ]);

        console.log(
          "Escenarios obtenidos (de fetchEscenarios):",
          escenariosResult,
        );

        // setData y setEscenariosData ahora tendrán la misma información con fecha_fin
        setData(escenariosResult);
        // setEscenariosData ya es llamado dentro de fetchEscenarios

        setAnexos(anexosResult);
        setDocEscenarios(docEscenariosResult);

        // Agrupar anexos según el tipo de vista actual
        const agrupados = agruparAnexos(
          anexosResult,
          docEscenariosResult,
          escenariosResult,
          programasResult,
          tipoVista,
          filtroEscuela,
          filtroPrograma,
          filtroEscenario,
        );
        setAnexosPorEscenario(agrupados);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Efecto para reagrupar cuando cambien los filtros
  useEffect(() => {
    console.log("=== EFECTO DE REAGRUPACIÓN ===");

    // La condición `data.length > 0` es importante para asegurar que los escenarios se hayan cargado
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      programasData &&
      Array.isArray(programasData) &&
      programasData.length > 0
    ) {
      console.log("Condiciones cumplidas, reagrupando...");
      const agrupados = agruparAnexos(
        anexos,
        docEscenarios,
        data,
        programasData,
        tipoVista,
        filtroEscuela,
        filtroPrograma,
        filtroEscenario,
      );
      setAnexosPorEscenario(agrupados);
    } else {
      console.log("Condiciones NO cumplidas para reagrupar");
    }
  }, [
    tipoVista,
    filtroEscuela,
    filtroPrograma,
    filtroEscenario,
    data,
    anexos,
    docEscenarios,
    programasData,
  ]);

  // Limpiar filtros cuando se cambia el tipo de vista
  const handleTipoVistaChange = (nuevoTipo) => {
    setTipoVista(nuevoTipo);
    setFiltroEscuela("");
    setFiltroPrograma("");
    setFiltroEscenario("");
  };

  // Función para obtener el color del chip según el estado
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "listo":
        return "success";
      case "en proceso":
        return "warning";
      case "pendiente":
        return "default";
      case "inactivo":
        return "error";
      default:
        return "default";
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "No definida";
    try {
      return new Date(fecha).toLocaleDateString("es-ES");
    } catch {
      return fecha;
    }
  };

  // Funciones para el formulario de anexos técnicos
  const toggleAnexoForm = () => {
    if (showAnexoForm) {
      // Al cerrar el formulario, reiniciar el estado de períodos
      setPeriodosFromPracticas(null);
    }
    setShowAnexoForm(!showAnexoForm);
  };

  // Funciones para el formulario de documentos de escenario
  const toggleDocEscenarioForm = (escenarioId = null) => {
    setShowDocEscenarioForm(
      showDocEscenarioForm === escenarioId ? null : escenarioId,
    );
  };

  const handleDocEscenarioInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "localFile") {
      setDocEscenarioFormData({
        ...docEscenarioFormData,
        localFile: files[0],
        url: "", // Limpiar la URL si se selecciona un archivo
      });
    } else if (name === "idEscenario") {
      // Cuando se cambia el escenario, buscar su información completa en escenariosData
      const selectedScenario = escenariosData.find(
        (esc) => esc.id === value || esc.nombre === value,
      );

      // Debug: mostrar qué datos están llegando
      console.log("=== DEBUG ESCENARIO SELECCIONADO ===");
      console.log("ID seleccionado:", value);
      console.log("Escenario encontrado:", selectedScenario);
      console.log("====================================");

      if (selectedScenario) {
        setDocEscenarioFormData({
          ...docEscenarioFormData,
          idEscenario: selectedScenario.id || value || "",
          nombreEscenario: selectedScenario.nombre || "",
          tipologia: selectedScenario.tipologia || "",
          codigo: selectedScenario.codigo || "",
          fechaInicio:
            convertirFechaParaInput(selectedScenario.fecha_inicio) || "",
          fechaFin: convertirFechaParaInput(selectedScenario.fecha_fin) || "",
          nombre_sede: selectedScenario.nombre_sede || "",
          numero_sede: selectedScenario.numero_sede || "",
          departamento: selectedScenario.departamento || "",
          municipio: selectedScenario.municipio || "",
          direccion: selectedScenario.direccion || "",
          nit: selectedScenario.nit || "",
          telefono: selectedScenario.telefono || "",
          correo: selectedScenario.correo || "",
          contacto: selectedScenario.contacto || "",
          documento: selectedScenario.documento || "",
          tipo_convenio: selectedScenario.tipo_convenio || "",
          firma_convenio:
            convertirFechaParaInput(selectedScenario.firma_convenio) ||
            selectedScenario.firma_convenio ||
            "",
          otros_si: selectedScenario.otros_si || "",
          anexo_tecnico: selectedScenario.anexo_tecnico || "",
        });
      } else {
        setDocEscenarioFormData({
          ...docEscenarioFormData,
          idEscenario: value || "",
          nombreEscenario: value || "",
          tipologia: "",
          codigo: "",
          fechaInicio: "",
          fechaFin: "",
          nombre_sede: "",
          numero_sede: "",
          departamento: "",
          municipio: "",
          direccion: "",
          nit: "",
          telefono: "",
          correo: "",
          contacto: "",
          documento: "",
          tipo_convenio: "",
          firma_convenio: "",
          otros_si: "",
          anexo_tecnico: "",
        });
      }
    } else {
      setDocEscenarioFormData({
        ...docEscenarioFormData,
        [name]: value !== undefined && value !== null ? value : "",
        localFile: name === "url" ? null : docEscenarioFormData.localFile, // Limpiar archivo si se escribe en URL
      });
    }
  };

  const handleAnexoInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "localFile") {
      setAnexoFormData({
        ...anexoFormData,
        localFile: files[0],
        urlAnexo: "", // Limpiar la URL si se selecciona un archivo
      });
    } else if (name === "idEscenario") {
      // Obtener el nombre del escenario seleccionado
      const selectedScenario =
        data && Array.isArray(data)
          ? data.find((item) => item.id === value)
          : null;

      setAnexoFormData({
        ...anexoFormData,
        idEscenario: value,
        nombreEscenario: selectedScenario ? selectedScenario.nombre : "",
      });
    } else {
      setAnexoFormData({
        ...anexoFormData,
        [name]: value,
        localFile: name === "urlAnexo" ? null : anexoFormData.localFile, // Limpiar archivo si se escribe en URL
      });
    }
  };

  // Helper para buscar campo de estudiantes admitidos en el objeto del programa
  const extraerEstudiantesAdmitidos = (prog) => {
    if (!prog) return "";
    for (const [key, val] of Object.entries(prog)) {
      const k = key.toLowerCase();
      if (
        k.includes("admit") ||
        k.includes("estudiante") ||
        k.includes("cupo")
      ) {
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return String(val).trim();
        }
      }
    }
    return "";
  };

  // Función para manejar la selección de un único programa académico con Autocomplete
  const handleProgramaChange = (event, newValue) => {
    const programaRef = newValue || null;

    let nivelFormacion = "";
    let duracionSemanas = "";
    let duracionSemestres = "";
    let periodicidadAdmision = "";
    let estudiantesAdmitidos = "";

    if (programaRef) {
      nivelFormacion =
        programaRef["nivel de formación"] ||
        programaRef["nivel de formacion"] ||
        programaRef["nivel_formacion"] ||
        programaRef["pregrado/posgrado"] ||
        "";

      const periodicidad =
        programaRef["periodicidad"] ||
        programaRef["periodicidad_admision"] ||
        "";
      periodicidadAdmision = periodicidad;

      // Duración en semanas: si es anual 49, si es semestral 18
      if (/anual/i.test(periodicidad)) {
        duracionSemanas = "48";
      } else if (/semestr/i.test(periodicidad)) {
        duracionSemanas = "18";
      } else {
        const durStr = String(
          programaRef["duración"] || programaRef["duracion"] || "",
        );
        if (/anual/i.test(durStr)) {
          duracionSemanas = "48";
        } else if (/semestr/i.test(durStr)) {
          duracionSemanas = "18";
        }
      }

      duracionSemestres =
        programaRef["duración"] ||
        programaRef["duracion"] ||
        programaRef["duracion_programa"] ||
        "";

      const admit = extraerEstudiantesAdmitidos(programaRef);
      if (admit) estudiantesAdmitidos = admit;
    }

    // Buscar períodos de prácticas formativas para este programa
    let periodosAutocompletados = [];
    if (programaRef) {
      const idProg = programaRef.id_programa;
      periodosAutocompletados = getPeriodosParaPrograma(idProg, practicasData);
    }

    // Si hay períodos en la hoja de prácticas, auto-seleccionarlos
    // Si no hay datos, dejar vacío para que el usuario seleccione manualmente
    // Si no hay programa seleccionado, resetear el estado
    if (!programaRef) {
      setPeriodosFromPracticas(null);
    } else if (periodosAutocompletados.length > 0) {
      setPeriodosFromPracticas(periodosAutocompletados);
    } else {
      setPeriodosFromPracticas([]); // Sin datos para este programa
    }

    setAnexoFormData((prev) => ({
      ...prev,
      programaSeleccionado: programaRef,
      idPrograma: programaRef ? programaRef.id_programa : "",
      nivel_formacion: nivelFormacion,
      duracion_semanas: duracionSemanas,
      duracion_semestres: duracionSemestres,
      periodicidad_admision: periodicidadAdmision,
      estudiantes_admitidos: estudiantesAdmitidos,
      periodos_pract_formativas: periodosAutocompletados.length > 0
        ? periodosAutocompletados
        : [],
    }));
  };

  // Manejar selección múltiple de períodos con prácticas formativas (romanos)
  const handlePeriodoPracticaToggle = (periodoRomano) => {
    setAnexoFormData((prev) => {
      const actuales = Array.isArray(prev.periodos_pract_formativas)
        ? prev.periodos_pract_formativas
        : [];
      const index = actuales.indexOf(periodoRomano);
      let nuevos;
      if (index === -1) {
        nuevos = [...actuales, periodoRomano];
      } else {
        nuevos = actuales.filter((p) => p !== periodoRomano);
      }
      return { ...prev, periodos_pract_formativas: nuevos };
    });
  };

  // ─── Funciones para gestión de Planes de Práctica ───────────────────────

  const calcularHorasDia = (grid) =>
    grid.map((filaHoras) => filaHoras.filter(Boolean).length);

  const calcularHorasSemana = (grid) =>
    grid.reduce(
      (total, filaHoras) => total + filaHoras.filter(Boolean).length,
      0,
    );

  // Devuelve { texto: "Lunes: 3h, Miércoles: 2h", maxDia: 3 }
  const calcularResumenHorasDia = (grid) => {
    const horasPorDia = calcularHorasDia(grid);
    const diasAbrev = ["L", "Ma", "Mi", "J", "V", "Sa", "D"];
    const activos = horasPorDia
      .map((h, i) => (h > 0 ? `${diasAbrev[i]}: ${h}h` : null))
      .filter(Boolean);
    const maxDia = Math.max(0, ...horasPorDia);
    return {
      texto: activos.length > 0 ? activos.join("  ·  ") : "—",
      maxDia,
    };
  };

  const addPlan = () => {
    setAnexoFormData((prev) => ({
      ...prev,
      planes: [...prev.planes, crearPlanVacio()],
    }));
  };

  const removePlan = (planIdx) => {
    setAnexoFormData((prev) => ({
      ...prev,
      planes: prev.planes.filter((_, i) => i !== planIdx),
    }));
  };

  const togglePlanExpandido = (planIdx) => {
    setAnexoFormData((prev) => ({
      ...prev,
      planes: prev.planes.map((p, i) =>
        i === planIdx ? { ...p, expandido: !p.expandido } : p,
      ),
    }));
  };

  const toggleHorario = (planIdx, diaIdx, horaIdx) => {
    setAnexoFormData((prev) => {
      const planes = prev.planes.map((plan, i) => {
        if (i !== planIdx) return plan;
        const grid = plan.grid.map((fila, d) =>
          d === diaIdx
            ? fila.map((val, h) => (h === horaIdx ? !val : val))
            : fila,
        );
        return { ...plan, grid };
      });
      return { ...prev, planes };
    });
  };

  const updatePlanField = (planIdx, field, value) => {
    setAnexoFormData((prev) => ({
      ...prev,
      planes: prev.planes.map((p, i) =>
        i === planIdx ? { ...p, [field]: value } : p,
      ),
    }));
  };

  // Serializa los planes para guardarlos en el Sheet
  const serializarPlanes = (planes) => {
    if (!planes || planes.length === 0)
      return {
        horarios: "",
        horas_dia: "",
        horas_semana: "",
        numero_semanas: "",
        creditos: "",
      };
    const resumen = planes.map((plan, idx) => {
      const horarioTexto = DIAS.map((dia, dIdx) => {
        const bloques = HORAS.filter((_, hIdx) => plan.grid[dIdx][hIdx]);
        return bloques.length > 0 ? `${dia}: ${bloques.join(", ")}` : null;
      })
        .filter(Boolean)
        .join(" | ");
      const hSemana = calcularHorasSemana(plan.grid);
      const { texto: horasDiaTexto, maxDia } = calcularResumenHorasDia(
        plan.grid,
      );
      const creditos = (maxDia * 4).toFixed(2);
      return {
        plan: idx + 1,
        nombre: plan.nombre || `Plan ${idx + 1}`,
        horarios: horarioTexto,
        horas_dia: horasDiaTexto,
        horas_semana: hSemana,
        numero_semanas: parseInt(plan.numero_semanas) || 0,
        creditos: parseFloat(creditos),
      };
    });
    return {
      horarios: JSON.stringify(
        resumen.map((r) => ({
          plan: r.plan,
          nombre: r.nombre,
          horarios: r.horarios,
        })),
      ),
      horas_dia: resumen.map((r) => `P${r.plan}:${r.horas_dia}`).join(" || "),
      horas_semana: resumen
        .map((r) => `P${r.plan}:${r.horas_semana}`)
        .join(" | "),
      numero_semanas: resumen
        .map((r) => `P${r.plan}:${r.numero_semanas}`)
        .join(" | "),
      creditos: resumen.map((r) => `P${r.plan}:${r.creditos}`).join(" | "),
    };
  };

  // Componente interno: tabla de horarios de un plan
  const PlanHorarioForm = ({ plan, planIdx }) => {
    const horasPorDia = calcularHorasDia(plan.grid);
    const cantidadSemanas = parseInt(plan.numero_semanas) || 0;
    const horasSemana = calcularHorasSemana(plan.grid);
    const { texto: horasDiaTexto, maxDia } = calcularResumenHorasDia(plan.grid);
    const creditos = (horasSemana * 4).toFixed(2);

    return (
      <Box
        sx={{
          border: "1px solid #c8e6c9",
          borderRadius: 2,
          mb: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* Cabecera del plan */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
            backgroundColor: "#e8f5e9",
            cursor: "pointer",
            borderBottom: plan.expandido ? "1px solid #c8e6c9" : "none",
          }}
          onClick={() => togglePlanExpandido(planIdx)}
        >
          <Typography sx={{ flex: 1, fontWeight: 600, color: "#2e7d32" }}>
            {plan.nombre || `Plan ${planIdx + 1}`}
          </Typography>
          {horasSemana > 0 && (
            <Typography variant="caption" sx={{ color: "#555", mr: 1 }}>
              {horasSemana}h/semana · {creditos} créditos
            </Typography>
          )}
          {cantidadSemanas > 0 && (
            <Typography variant="caption" sx={{ color: "#555", mr: 1 }}>
              {cantidadSemanas} semanas
            </Typography>
          )}
          <Button
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              removePlan(planIdx);
            }}
            sx={{ minWidth: "auto", p: 0.5 }}
          >
            ✕
          </Button>
          <Typography sx={{ color: "#555", userSelect: "none" }}>
            {plan.expandido ? "▲" : "▼"}
          </Typography>
        </Box>

        {plan.expandido && (
          <Box sx={{ p: 2 }}>
            {/* Nombre del plan */}
            <TextField
              label="Nombre del plan (opcional)"
              size="small"
              fullWidth
              value={plan.nombre}
              onChange={(e) =>
                updatePlanField(planIdx, "nombre", e.target.value)
              }
              placeholder={`Ej: Plan ${planIdx + 1} – Rotación Medicina`}
              sx={{ mb: 2 }}
            />

            {/* Tabla de horarios */}
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 600, color: "#333" }}
            >
              Selecciona los bloques horarios:
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "4px 8px",
                        background: "#1b5e20",
                        color: "#fff",
                        textAlign: "left",
                        minWidth: 90,
                      }}
                    >
                      Día / Hora
                    </th>
                    {HORAS.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "4px 6px",
                          background: "#2e7d32",
                          color: "#fff",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                    <th
                      style={{
                        padding: "4px 8px",
                        background: "#1b5e20",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      Total (h)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DIAS.map((dia, dIdx) => (
                    <tr
                      key={dia}
                      style={{
                        background: dIdx % 2 === 0 ? "#f9fbe7" : "#fff",
                      }}
                    >
                      <td
                        style={{
                          padding: "4px 8px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dia}
                      </td>
                      {HORAS.map((_, hIdx) => (
                        <td
                          key={hIdx}
                          style={{ padding: "2px", textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={plan.grid[dIdx][hIdx]}
                            onChange={() => toggleHorario(planIdx, dIdx, hIdx)}
                            style={{
                              width: 16,
                              height: 16,
                              cursor: "pointer",
                              accentColor: "#2e7d32",
                            }}
                          />
                        </td>
                      ))}
                      <td
                        style={{
                          padding: "4px 8px",
                          textAlign: "center",
                          fontWeight: 700,
                          color: horasPorDia[dIdx] > 0 ? "#2e7d32" : "#bbb",
                        }}
                      >
                        {horasPorDia[dIdx]}
                      </td>
                    </tr>
                  ))}
                  {/* Fila de totales */}
                  <tr style={{ background: "#c8e6c9" }}>
                    <td style={{ padding: "4px 8px", fontWeight: 700 }}>
                      Total/hora
                    </td>
                    {HORAS.map((_, hIdx) => {
                      const count = DIAS.filter(
                        (__, dIdx) => plan.grid[dIdx][hIdx],
                      ).length;
                      return (
                        <td
                          key={hIdx}
                          style={{
                            padding: "4px 6px",
                            textAlign: "center",
                            fontWeight: 600,
                            color: count > 0 ? "#1b5e20" : "#bbb",
                          }}
                        >
                          {count > 0 ? count : "-"}
                        </td>
                      );
                    })}
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: 800,
                        color: "#1b5e20",
                        fontSize: 14,
                      }}
                    >
                      {horasSemana}h
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>

            {/* Resumen de cálculos */}
            <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 140,
                  p: 1.5,
                  borderRadius: 1,
                  background: "#e8f5e9",
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Horas por semana
                </Typography>
                <Typography variant="h6" color="#2e7d32" fontWeight={700}>
                  {horasSemana}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 2,
                  minWidth: 200,
                  p: 1.5,
                  borderRadius: 1,
                  background: "#e8f5e9",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Horas por día
                </Typography>
                <Typography
                  variant="body2"
                  color="#2e7d32"
                  fontWeight={700}
                  sx={{ mt: 0.5, lineHeight: 1.6 }}
                >
                  {horasDiaTexto}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <TextField
                  label="N° de semanas"
                  type="number"
                  size="small"
                  fullWidth
                  value={plan.numero_semanas}
                  onChange={(e) =>
                    updatePlanField(planIdx, "numero_semanas", e.target.value)
                  }
                  inputProps={{ min: 1, step: 1 }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 140,
                  p: 1.5,
                  borderRadius: 1,
                  background: "#fff3e0",
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Créditos (max h/día × 4)
                </Typography>
                <Typography variant="h6" color="#e65100" fontWeight={700}>
                  {creditos}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────

  // Función para formatear fechas a DD/MM/AAAA
  const formatearFechaParaHoja = (fecha) => {
    if (!fecha) return "";
    try {
      const date = new Date(fecha);
      const dia = date.getDate().toString().padStart(2, "0");
      const mes = (date.getMonth() + 1).toString().padStart(2, "0");
      const año = date.getFullYear();
      return `${dia}/${mes}/${año}`;
    } catch {
      return fecha;
    }
  };

  // Función para convertir fecha de DD/MM/AAAA a AAAA-MM-DD (para inputs de tipo date)
  const convertirFechaParaInput = (fechaString) => {
    if (!fechaString || fechaString.trim() === "") return "";

    try {
      // Si ya está en formato AAAA-MM-DD, devolver tal como está
      if (fechaString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return fechaString;
      }

      // Si está en formato DD/MM/AAAA, convertir a AAAA-MM-DD
      const fechaMatch = fechaString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (fechaMatch) {
        const dia = fechaMatch[1].padStart(2, "0");
        const mes = fechaMatch[2].padStart(2, "0");
        const año = fechaMatch[3];
        return `${año}-${mes}-${dia}`;
      }
      return fechaString; // Devolver tal como está si no coincide con ningún formato
    } catch (error) {
      console.error("Error convirtiendo fecha:", error);
      return fechaString;
    }
  };

  // Función para enviar un anexo al servidor
  const sendAnexoToSheet = async (anexo) => {
    try {
      // Preparar los datos para enviar en el formato que requiere la API del servidor
      const planesData = serializarPlanes(anexo.planes || []);
      const insertData = [
        [
          anexo.id, // A (0): id
          anexo.id_programa || "", // B (1): id_programa
          anexo.idEscenario, // C (2): id_escenario
          anexo.nombre, // D (3): nombre
          anexo.url, // E (4): url
          anexo.estado, // F (5): estado
          anexo.tipo, // G (6): tipo
          formatearFechaParaHoja(anexo.vigencia_desde), // H (7): vigencia_desde
          formatearFechaParaHoja(anexo.vigencia_hasta), // I (8): vigencia_hasta
          anexo.version, // J (9): version
          anexo.proceso_calidad || "", // K (10): proceso_calidad
          anexo.cierre || "", // L (11): cierre
          anexo.observaciones || "", // M (12): observaciones
          planesData.horarios, // N (13): horarios
          planesData.horas_dia, // O (14): horas_dia
          planesData.horas_semana, // P (15): horas_semana
          planesData.numero_semanas, // Q (16): numero_semanas
          planesData.creditos, // R (17): creditos
          anexo.nombre_IES || "", // S (18): nombre_IES
          anexo.correo || "", // T (19): correo institucional
          anexo.nivel_formacion || "", // U (20): nivel_formacion
          anexo.duracion_semanas || "", // V (21): duracion_semanas
          anexo.duracion_semestres || "", // W (22): duracion_semestres
          anexo.periodicidad_admision || "", // X (23): periodicidad_admision
          anexo.estudiantes_admitidos || "", // Y (24): estudiantes_admitidos
          anexo.periodos_pract_formativas || "", // Z (25): periodos_pract_formativas
          anexo.director_nombre || "", // AA (26): director_nombre
          anexo.director_cargo || "", // AB (27): director_cargo
          anexo.director_telefono || "", // AC (28): director_telefono
          anexo.director_correo || "", // AD (29): director_correo
          anexo.ds_ies_nombre || "", // AE (30): ds_ies_nombre
          anexo.ds_ies_cargo || "", // AF (31): ds_ies_cargo
          anexo.ds_ies_telefono || "", // AG (32): ds_ies_telefono
          anexo.ds_ies_correo || "", // AH (33): ds_ies_correo
          formatearFechaParaHoja(anexo.fecha_formalizacion), // AI (34): fecha_formalizacion
          anexo.coordinacion_nombre || "", // AJ (35): coordinacion_nombre
          anexo.coordinacion_cargo || "", // AK (36): coordinacion_cargo
          anexo.coordinacion_telefono || "", // AL (37): coordinacion_telefono
          anexo.coordinacion_correo || "", // AM (38): coordinacion_correo
        ],
      ];

      console.log("=== ENVIANDO ANEXO A SHEETS ===");
      console.log("Hoja destino: ANEXOS_TEC");
      console.log("Datos del anexo a enviar:", anexo);
      console.log("Datos formateados para envío:", insertData);
      console.log("================================");

      // Especificar el nombre de la hoja de cálculo
      const sheetName = "ANEXOS_TEC";

      // Hacer la solicitud POST al servidor con los datos y el nombre de la hoja
      const response = await axios.post(
        "https://siac-server.vercel.app/sendDocServ",
        {
          insertData,
          sheetName,
        },
      );

      if (response.status === 200) {
        console.log(
          "✅ Anexo guardado correctamente en la hoja ANEXOS_TEC:",
          response.data,
        );
        return true;
      } else {
        console.error(
          "❌ Error al guardar el anexo en la hoja:",
          response.statusText,
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error al enviar el anexo al servidor:", error);
      return false;
    }
  };

  // Función para enviar un documento de escenario al servidor
  const sendDocEscenarioToSheet = async (docEscenario) => {
    try {
      // Preparar los datos para enviar en el formato que requiere la API del servidor
      const insertData = [
        [
          docEscenario.id, // id único del documento
          "", // id del programa (opcional, siempre vacío ahora)
          docEscenario.idEscenario, // id del escenario
          docEscenario.institucion, // institución
          docEscenario.url, // URL del documento
          docEscenario.tipologia, // tipología
          docEscenario.codigo, // código (viene automático de la institución)
          formatearFechaParaHoja(docEscenario.fechaInicio), // fecha inicio
          formatearFechaParaHoja(docEscenario.fechaFin), // fecha fin
        ],
      ];

      console.log("=== ENVIANDO DOCUMENTO ESCENARIO A SHEETS ===");
      console.log("Hoja destino: ANEXOS_ESC");
      console.log("Datos del documento a enviar:", docEscenario);
      console.log("Datos formateados para envío:", insertData);
      console.log("==============================================");

      // Especificar el nombre de la hoja de cálculo
      const sheetName = "ANEXOS_ESC";

      // Hacer la solicitud POST al servidor con los datos y el nombre de la hoja
      const response = await axios.post(
        "https://siac-server.vercel.app/sendDocEscenario",
        {
          insertData,
          sheetName,
        },
      );

      if (response.status === 200) {
        console.log(
          "✅ Documento de escenario guardado correctamente en la hoja ANEXOS_ESC:",
          response.data,
        );
        return true;
      } else {
        console.error(
          "❌ Error al guardar el documento de escenario en la hoja:",
          response.statusText,
        );
        return false;
      }
    } catch (error) {
      console.error(
        "❌ Error al enviar el documento de escenario al servidor:",
        error,
      );
      return false;
    }
  };

  // Manejar el envío del formulario de anexos
  const handleAnexoFormSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(
        "Programa seleccionado:",
        anexoFormData.programaSeleccionado,
      );

      if (!anexoFormData.programaSeleccionado && !anexoFormData.idPrograma) {
        alert("Por favor selecciona un programa académico válido.");
        return;
      }

      let fileUrl = anexoFormData.urlAnexo || "";

      // Si hay un archivo local, subirlo primero
      if (anexoFormData.localFile) {
        const formData = new FormData();
        formData.append("file", anexoFormData.localFile);
        formData.append("scenarioName", anexoFormData.nombreEscenario); // Usamos el nombre del escenario para la carpeta

        try {
          const response = await axios.post(
            "https://siac-server.vercel.app/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          if (response.data.success) {
            fileUrl = response.data.fileUrl;
          } else {
            alert(
              "Error al subir el archivo del anexo. Por favor intenta de nuevo.",
            );
            return;
          }
        } catch (error) {
          console.error("Error al subir el archivo del anexo:", error);
          alert(
            "Error al subir el archivo del anexo. Por favor intenta de nuevo.",
          );
          return;
        }
      }

      // Convertir periodos_pract_formativas a string si es un array
      const periodosRomanoStr = Array.isArray(
        anexoFormData.periodos_pract_formativas,
      )
        ? anexoFormData.periodos_pract_formativas.join(", ")
        : anexoFormData.periodos_pract_formativas || "";

      const programa = anexoFormData.programaSeleccionado || {};
      const periodicidad =
        anexoFormData.periodicidad_admision ||
        programa["periodicidad"] ||
        programa["periodicidad_admision"] ||
        "";

      const durSem = /anual/i.test(periodicidad)
        ? "49"
        : /semestr/i.test(periodicidad)
          ? "18"
          : anexoFormData.duracion_semanas;

      const nuevoAnexo = {
        id: Date.now(),
        id_programa: programa.id_programa || anexoFormData.idPrograma,
        idEscenario: anexoFormData.idEscenario,
        nombre: anexoFormData.nombreEscenario,
        url: fileUrl,
        estado: anexoFormData.estadoAnexo,
        tipo: anexoFormData.tipo,
        vigencia_desde: anexoFormData.vigenciaDesde,
        vigencia_hasta: anexoFormData.vigenciaHasta,
        version: anexoFormData.version,
        proceso_calidad: anexoFormData.procesoCalidad || "",
        cierre: anexoFormData.cierre || "",
        observaciones: anexoFormData.observaciones || "",
        planes: anexoFormData.planes,
        // Nuevos campos
        nombre_IES: anexoFormData.nombre_IES,
        correo: anexoFormData.correo,
        nivel_formacion:
          anexoFormData.nivel_formacion ||
          programa["nivel de formación"] ||
          programa["nivel de formacion"] ||
          programa["nivel_formacion"] ||
          programa["pregrado/posgrado"] ||
          "",
        duracion_semanas: anexoFormData.duracion_semanas || durSem,
        duracion_semestres:
          anexoFormData.duracion_semestres ||
          programa["duración"] ||
          programa["duracion"] ||
          "",
        periodicidad_admision: periodicidad,
        estudiantes_admitidos: anexoFormData.estudiantes_admitidos,
        periodos_pract_formativas: periodosRomanoStr,
        director_nombre: anexoFormData.director_nombre,
        director_cargo: anexoFormData.director_cargo,
        director_telefono: anexoFormData.director_telefono,
        director_correo: anexoFormData.director_correo,
        ds_ies_nombre: anexoFormData.ds_ies_nombre,
        ds_ies_cargo: anexoFormData.ds_ies_cargo,
        ds_ies_telefono: anexoFormData.ds_ies_telefono,
        ds_ies_correo: anexoFormData.ds_ies_correo,
        fecha_formalizacion: anexoFormData.fecha_formalizacion,
        coordinacion_nombre: anexoFormData.coordinacion_nombre,
        coordinacion_cargo: anexoFormData.coordinacion_cargo,
        coordinacion_telefono: anexoFormData.coordinacion_telefono,
        coordinacion_correo: anexoFormData.coordinacion_correo,
      };

      console.log("Datos del nuevo anexo a enviar:", nuevoAnexo);

      const resultado = await sendAnexoToSheet(nuevoAnexo);

      if (resultado) {
        // Reiniciar el formulario
        setAnexoFormData(initialAnexoFormData);
        setPeriodosFromPracticas(null);
        setShowAnexoForm(false);

        // Recargar los anexos
        setTimeout(async () => {
          setLoading(true);
          try {
            const [escenariosResult, anexosResult, docEscenariosResult] =
              await Promise.all([
                fetchEscenarios(),
                fetchAnexos(),
                fetchDocEscenarios(),
              ]);

            setData(escenariosResult);
            setAnexos(anexosResult);
            setDocEscenarios(docEscenariosResult);

            // Agrupar anexos según el tipo de vista actual
            const agrupados = agruparAnexos(
              anexosResult,
              docEscenariosResult,
              escenariosResult,
              programasData,
              tipoVista,
              filtroEscuela,
              filtroPrograma,
              filtroEscenario,
            );
            setAnexosPorEscenario(agrupados);
          } catch (error) {
            console.error("Error al recargar los datos:", error);
          } finally {
            setLoading(false);
          }
        }, 500);

        // Mostrar mensaje de éxito
        alert(
          `${newAnexos.length} anexo${newAnexos.length !== 1 ? "s" : ""} guardado${newAnexos.length !== 1 ? "s" : ""} correctamente`,
        );
        navigate("/docencia-servicio");
      } else {
        const exitosos = resultados.filter(Boolean).length;
        const fallidos = resultados.length - exitosos;
        alert(
          `Error: Solo se guardaron ${exitosos} de ${resultados.length} anexos. ${fallidos} anexo${fallidos !== 1 ? "s" : ""} fallaron. Por favor intenta de nuevo.`,
        );
      }
    } catch (error) {
      console.error("Error al guardar los anexos:", error);
      alert("Error al guardar los anexos. Por favor intenta de nuevo.");
    }
  };

  // Manejar el envío del formulario de escenarios de práctica y documentos
  const handleDocEscenarioFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar campos obligatorios
      if (
        !docEscenarioFormData.nombreEscenario &&
        !docEscenarioFormData.idEscenario
      ) {
        alert("Por favor selecciona o ingresa un escenario de práctica.");
        return;
      }

      let fileUrl = docEscenarioFormData.url || "";

      // Si hay un archivo local, subirlo primero
      if (docEscenarioFormData.localFile) {
        const formData = new FormData();
        formData.append("file", docEscenarioFormData.localFile);
        formData.append(
          "scenarioName",
          docEscenarioFormData.nombreEscenario || "Escenario",
        );

        try {
          const response = await axios.post(
            "https://siac-server.vercel.app/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          if (response.data.success) {
            fileUrl = response.data.fileUrl;
          } else {
            alert("Error al subir el archivo. Por favor intenta de nuevo.");
            return;
          }
        } catch (error) {
          console.error("Error al subir el archivo:", error);
          alert("Error al subir el archivo. Por favor intenta de nuevo.");
          return;
        }
      }

      // Preparar los datos del escenario para la hoja ESC_PRACTICA (20 columnas A-T)
      const escenarioId = docEscenarioFormData.idEscenario || Date.now();
      const insertDataEscenario = [
        [
          escenarioId, // A (1): id
          docEscenarioFormData.nombreEscenario || "", // B (2): nombre
          docEscenarioFormData.tipologia || "", // C (3): tipologia
          docEscenarioFormData.codigo || "", // D (4): codigo
          formatearFechaParaHoja(docEscenarioFormData.fechaInicio) ||
            docEscenarioFormData.fechaInicio ||
            "", // E (5): fecha_inicio
          formatearFechaParaHoja(docEscenarioFormData.fechaFin) ||
            docEscenarioFormData.fechaFin ||
            "", // F (6): fecha_fin
          docEscenarioFormData.nombre_sede || "", // G (7): nombre_sede
          docEscenarioFormData.numero_sede || "", // H (8): numero_sede
          docEscenarioFormData.departamento || "", // I (9): departamento
          docEscenarioFormData.municipio || "", // J (10): municipio
          docEscenarioFormData.direccion || "", // K (11): direccion
          docEscenarioFormData.nit || "", // L (12): nit
          docEscenarioFormData.telefono || "", // M (13): telefono
          docEscenarioFormData.correo || "", // N (14): correo
          docEscenarioFormData.contacto || "", // O (15): contacto
          docEscenarioFormData.documento || "", // P (16): documento
          docEscenarioFormData.tipo_convenio || "", // Q (17): tipo_convenio
          formatearFechaParaHoja(docEscenarioFormData.firma_convenio) ||
            docEscenarioFormData.firma_convenio ||
            "", // R (18): firma_convenio
          docEscenarioFormData.otros_si || "", // S (19): otros_si
          docEscenarioFormData.anexo_tecnico || "", // T (20): anexo_tecnico
        ],
      ];

      console.log("=== ENVIANDO DATOS A ESC_PRACTICA ===");
      console.log("insertData:", insertDataEscenario);

      const respEscenario = await axios.post(
        "https://siac-server.vercel.app/sendDocServ",
        {
          insertData: insertDataEscenario,
          sheetName: "ESC_PRACTICA",
        },
      );

      // Si además se adjuntó archivo o URL, guardarlo en ANEXOS_ESC
      if (fileUrl) {
        const newDocEscenario = {
          id: Date.now(),
          idEscenario: escenarioId,
          institucion: docEscenarioFormData.nombreEscenario,
          url: fileUrl,
          tipologia: docEscenarioFormData.tipologia,
          codigo: docEscenarioFormData.codigo,
          fechaInicio: docEscenarioFormData.fechaInicio,
          fechaFin: docEscenarioFormData.fechaFin,
        };
        await sendDocEscenarioToSheet(newDocEscenario);
      }

      if (respEscenario.status === 200) {
        // Reiniciar el formulario
        setDocEscenarioFormData(initialDocEscenarioState);
        setShowDocEscenarioForm(null);

        // Mostrar mensaje de éxito
        alert("Escenario de práctica guardado correctamente.");
        navigate("/docencia-servicio");

        // Recargar datos
        await fetchEscenarios();
        setTimeout(() => {
          setReloadDocEscenarios(true);
        }, 500);
      } else {
        alert(
          "Error al guardar el escenario de práctica. Por favor intenta de nuevo.",
        );
      }
    } catch (error) {
      console.error("Error al guardar el escenario de práctica:", error);
      alert(
        "Error al guardar el escenario de práctica. Por favor intenta de nuevo.",
      );
    }
  };

  // Componente para mostrar la tabla de anexos de un escenario
  const AnexosEscenarioTable = ({ datos, tipoVista }) => {
    // Extraer anexos técnicos y documentos de escenario según la estructura
    let anexosTecnicos = [];
    let documentosEscenario = [];

    if (datos) {
      if (datos.anexosTecnicos && datos.documentosEscenario) {
        // Nueva estructura de datos
        anexosTecnicos = datos.anexosTecnicos || [];
        documentosEscenario = datos.documentosEscenario || [];
      } else if (Array.isArray(datos)) {
        // Estructura de datos antigua (compatibilidad)
        anexosTecnicos = datos;
        documentosEscenario = [];
      }
    }

    const totalItems = anexosTecnicos.length + documentosEscenario.length;

    if (totalItems === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography color="text.secondary">
            No hay anexos técnicos ni documentos de escenario registrados
            {tipoVista === "escenario"
              ? " para este escenario"
              : tipoVista === "escuela"
                ? " para esta escuela"
                : " para este programa académico"}
            .
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {/* Sección de Anexos Técnicos */}
        {anexosTecnicos.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}
            >
              Convenio D.S. ({anexosTecnicos.length})
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {tipoVista === "escenario" && (
                      <>
                        <TableCell>
                          <strong>Escuela</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Programa</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Escenario</strong>
                        </TableCell>
                      </>
                    )}
                    {(tipoVista === "escuela" || tipoVista === "programa") && (
                      <>
                        <TableCell>
                          <strong>Programa</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Escuela</strong>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <strong>URL/Archivo</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Estado</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tipo</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Vigencia Desde</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Vigencia Hasta</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Versión</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Proceso Calidad</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Cierre</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Observaciones</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anexosTecnicos.map((anexo, index) => (
                    <TableRow key={`anexo-${index}`}>
                      {tipoVista === "escenario" && (
                        <>
                          <TableCell>
                            {anexo.programa_info?.escuela || "N/A"}
                          </TableCell>
                          <TableCell>
                            {anexo.programa_info?.["programa académico"] ||
                              "N/A"}
                          </TableCell>
                          <TableCell>{anexo.nombre || "N/A"}</TableCell>
                        </>
                      )}
                      {(tipoVista === "escuela" ||
                        tipoVista === "programa") && (
                        <>
                          <TableCell>
                            {anexo.programa_info?.["programa académico"] ||
                              "N/A"}
                          </TableCell>
                          <TableCell>
                            {anexo.programa_info?.escuela || "N/A"}
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        {anexo.url ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(anexo.url, "_blank")}
                            sx={{
                              textTransform: "none",
                              minWidth: "auto",
                              padding: "4px 8px",
                            }}
                          >
                            Ver Anexo
                          </Button>
                        ) : (
                          "Sin URL"
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={anexo.estado || "Sin estado"}
                          color={getEstadoColor(anexo.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{anexo.tipo || "No especificado"}</TableCell>
                      <TableCell>
                        {anexo.vigencia_desde || "No especificada"}
                      </TableCell>
                      <TableCell>
                        {anexo.vigencia_hasta || "No especificada"}
                      </TableCell>
                      <TableCell>{anexo.version || "N/A"}</TableCell>
                      <TableCell>{anexo.proceso_calidad || "N/A"}</TableCell>
                      <TableCell>{anexo.cierre || "N/A"}</TableCell>
                      <TableCell>
                        {anexo.estado === "Inactivo"
                          ? anexo.observaciones || "Sin observaciones"
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Sección de Documentos de Escenario */}
        {documentosEscenario.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#2e7d32", fontWeight: 600 }}
            >
              Documentos de Escenario ({documentosEscenario.length})
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Institución/Escenario</strong>
                    </TableCell>
                    <TableCell>
                      <strong>URL/Documento</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tipología</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Código</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Fecha Inicio</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Fecha Fin</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentosEscenario.map((doc, index) => (
                    <TableRow key={`doc-${index}`}>
                      <TableCell>{doc.institucion || "N/A"}</TableCell>
                      <TableCell>
                        {doc.url ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(doc.url, "_blank")}
                            sx={{
                              textTransform: "none",
                              minWidth: "auto",
                              padding: "4px 8px",
                            }}
                          >
                            Ver Documento
                          </Button>
                        ) : (
                          "Sin URL"
                        )}
                      </TableCell>
                      <TableCell>{doc.tipologia || "N/A"}</TableCell>
                      <TableCell>{doc.codigo || "N/A"}</TableCell>
                      <TableCell>{doc.fecha_inicio || "N/A"}</TableCell>
                      <TableCell>{doc.fecha_fin || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    );
  };

  // Función para calcular la vigencia y determinar el color de la pestaña
  const calcularVigenciaYColor = (fechaFin) => {
    if (!fechaFin || fechaFin.trim() === "") {
      return {
        diasRestantes: null,
        colorFondo: "#f5f5f5",
        estado: "Sin fecha",
      };
    }

    try {
      // Convertir fecha de DD/MM/AAAA a Date
      let fechaFinDate;

      console.log("=== DEBUG FECHA_FIN ===");
      console.log("fechaFin recibida:", fechaFin);
      console.log("tipo:", typeof fechaFin);

      if (fechaFin.includes("/")) {
        // Formato DD/MM/AAAA
        const partes = fechaFin.split("/");
        if (partes.length === 3) {
          const dia = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0-11
          const año = parseInt(partes[2], 10);
          fechaFinDate = new Date(año, mes, dia);
          console.log("Fecha parseada DD/MM/AAAA:", fechaFinDate);
        }
      } else if (fechaFin.includes("-")) {
        // Formato AAAA-MM-DD o DD-MM-AAAA
        const partes = fechaFin.split("-");
        if (partes.length === 3) {
          if (partes[0].length === 4) {
            // AAAA-MM-DD
            fechaFinDate = new Date(fechaFin);
            console.log("Fecha parseada AAAA-MM-DD:", fechaFinDate);
          } else {
            // DD-MM-AAAA
            const dia = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10) - 1;
            const año = parseInt(partes[2], 10);
            fechaFinDate = new Date(año, mes, dia);
            console.log("Fecha parseada DD-MM-AAAA:", fechaFinDate);
          }
        }
      } else {
        console.log("Formato de fecha no reconocido");
        return {
          diasRestantes: null,
          colorFondo: "#f5f5f5",
          estado: "Fecha inválida",
        };
      }

      if (!fechaFinDate || isNaN(fechaFinDate.getTime())) {
        console.log("Fecha inválida después del parsing");
        return {
          diasRestantes: null,
          colorFondo: "#f5f5f5",
          estado: "Fecha inválida",
        };
      }

      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación precisa
      fechaFinDate.setHours(23, 59, 59, 999); // Fin del día para la fecha de vencimiento

      const diferenciaTiempo = fechaFinDate.getTime() - fechaActual.getTime();
      const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

      console.log("Fecha actual:", fechaActual);
      console.log("Fecha fin:", fechaFinDate);
      console.log("Diferencia en días:", diasRestantes);

      // Determinar color según días restantes
      let colorFondo, estado;
      if (diasRestantes < 0) {
        colorFondo = "#ffcccb"; // Rojo claro - Vencido
        estado = "Vencido";
      } else if (diasRestantes <= 90) {
        colorFondo = "#ffcccb"; // Rojo claro - Próximo a vencer (3 meses)
        estado = "Próximo a vencer";
      } else if (diasRestantes <= 730) {
        colorFondo = "#ffd699"; // Naranja claro - Entre 3 meses y 2 años
        estado = "Vigencia media";
      } else {
        colorFondo = "#f5f5f5"; // Gris claro - Más de 2 años (cambio de verde a gris)
        estado = "Vigencia amplia";
      }

      return {
        diasRestantes,
        colorFondo,
        estado,
        fechaVencimiento: fechaFinDate.toLocaleDateString("es-ES"),
      };
    } catch (error) {
      console.error("Error calculando vigencia:", error);
      return { diasRestantes: null, colorFondo: "#f5f5f5", estado: "Error" };
    }
  };

  // Componente de formulario de anexo técnico reutilizable
  const renderAnexoFormCompleto = () => (
    <Box
                  component="form"
                  onSubmit={handleAnexoFormSubmit}
                  sx={{
                    marginTop: 2,
                    maxWidth: "800px",
                    mx: "auto",
                    p: 3,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      textAlign: "center",
                      fontWeight: 700,
                      color: "#1b5e20",
                    }}
                  >
                    Nuevo Anexo Técnico de Docencia-Servicio
                  </Typography>

                  <FormGroup sx={{ gap: 2.5 }}>
                    {/* ── SECCIÓN 1: Institución y Programa Académico ── */}
                    <Box
                      sx={{
                        p: 2.5,
                        border: "1px solid #c8e6c9",
                        borderRadius: 2,
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#2e7d32",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        1. Información de la Institución y Programa
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="a) Institución de Educación Superior (IES)"
                            name="nombre_IES"
                            value={anexoFormData.nombre_IES}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            required
                            helperText="Institución de Educación Superior"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Correo electrónico institucional"
                            name="correo"
                            type="email"
                            value={anexoFormData.correo}
                            onChange={handleAnexoInputChange}
                            placeholder="ejemplo@correounivalle.edu.co"
                            fullWidth
                            required
                            helperText="Correo electrónico institucional de contacto"
                          />
                        </Grid>

                        {/* b) Denominación del Programa */}
                        <Grid item xs={12}>
                          <Autocomplete
                            options={programasData}
                            getOptionLabel={(option) =>
                              option["programa académico"] || ""
                            }
                            value={anexoFormData.programaSeleccionado || null}
                            onChange={handleProgramaChange}
                            filterOptions={(options, params) => {
                              const filtered = options.filter(
                                (option) =>
                                  option["programa académico"] &&
                                  option["programa académico"]
                                    .toLowerCase()
                                    .includes(params.inputValue.toLowerCase()),
                              );
                              return filtered;
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="b) Denominación del Programa"
                                placeholder="Escribe para buscar y seleccionar el programa académico..."
                                fullWidth
                                required={!anexoFormData.programaSeleccionado}
                                helperText="Selecciona el programa académico para este anexo"
                              />
                            )}
                            renderOption={(props, option, { index }) => (
                              <Box
                                component="li"
                                {...props}
                                key={`programa-option-${option.id_programa || index}`}
                              >
                                <Typography variant="body1">
                                  {option["programa académico"]}
                                </Typography>
                              </Box>
                            )}
                            noOptionsText="No se encontraron programas"
                            loadingText="Cargando programas..."
                            isOptionEqualToValue={(option, value) =>
                              option.id_programa === value?.id_programa
                            }
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl fullWidth required>
                            <InputLabel id="escenarios-label">
                              Escenario de Práctica
                            </InputLabel>
                            <Select
                              labelId="escenarios-label"
                              id="escenarios-select"
                              name="idEscenario"
                              value={anexoFormData.idEscenario}
                              onChange={handleAnexoInputChange}
                              label="Escenario de Práctica"
                            >
                              {data && Array.isArray(data)
                                ? data.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                      {item.nombre}
                                    </MenuItem>
                                  ))
                                : []}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Campos extraídos del programa */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="c) Nivel de formación"
                            name="nivel_formacion"
                            value={anexoFormData.nivel_formacion}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            helperText="Extraído de la información del programa"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="d) Duración períodos académicos (semanas)"
                            name="duracion_semanas"
                            value={anexoFormData.duracion_semanas}
                            onChange={handleAnexoInputChange}
                            type="number"
                            fullWidth
                            helperText="49 semanas si es anual, 18 si es semestral"
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="e) Duración total del Programa (períodos)"
                            name="duracion_semestres"
                            value={anexoFormData.duracion_semestres}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            helperText="Extraído de la columna de duración"
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="f) Periodicidad de admisión"
                            name="periodicidad_admision"
                            value={anexoFormData.periodicidad_admision}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            helperText="Extraído de periodicidad del programa"
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="g) Estudiantes a admitir en Período 1"
                            name="estudiantes_admitidos"
                            value={anexoFormData.estudiantes_admitidos}
                            onChange={handleAnexoInputChange}
                            type="number"
                            fullWidth
                            helperText="Cupos / admitidos en período 1"
                          />
                        </Grid>

                        {/* h) Períodos con prácticas formativas (romanos 6 al 10) */}
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              backgroundColor: periodosFromPracticas && periodosFromPracticas.length > 0
                                ? "#e8f5e9"
                                : "#f1f8e9",
                              border: periodosFromPracticas && periodosFromPracticas.length > 0
                                ? "1px solid #4caf50"
                                : "1px dashed #aed581",
                            }}
                          >
                            <FormLabel
                              component="legend"
                              sx={{
                                fontWeight: 600,
                                color: "#2e7d32",
                                mb: 1,
                                fontSize: "0.9rem",
                              }}
                            >
                              h) Períodos con prácticas formativas (Seleccione
                              uno o varios):
                            </FormLabel>
                            {periodosFromPracticas && periodosFromPracticas.length > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  mb: 1,
                                  color: "#2e7d32",
                                  fontStyle: "italic",
                                  backgroundColor: "#c8e6c9",
                                  p: 0.5,
                                  px: 1,
                                  borderRadius: 0.5,
                                }}
                              >
                                Períodos autocompletados desde la hoja de prácticas formativas del programa.
                              </Typography>
                            )}
                            {periodosFromPracticas && periodosFromPracticas.length === 0 && anexoFormData.programaSeleccionado && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  mb: 1,
                                  color: "#f57f17",
                                  fontStyle: "italic",
                                  backgroundColor: "#fff9c4",
                                  p: 0.5,
                                  px: 1,
                                  borderRadius: 0.5,
                                }}
                              >
                                ⚠️ No se encontraron prácticas registradas para este programa. Seleccione los períodos manualmente.
                              </Typography>
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              {Array.from(
                                new Set([
                                  ...PERIODOS_ROMANOS,
                                  ...(periodosFromPracticas || []),
                                ]),
                              ).map((periodo) => {
                                const isChecked =
                                  Array.isArray(
                                    anexoFormData.periodos_pract_formativas,
                                  ) &&
                                  anexoFormData.periodos_pract_formativas.includes(
                                    periodo,
                                  );
                                // Deshabilitar si hay períodos autocompletados desde la hoja de prácticas
                                const isDisabled = periodosFromPracticas && periodosFromPracticas.length > 0;
                                return (
                                  <FormControlLabel
                                    key={periodo}
                                    control={
                                      <Checkbox
                                        checked={isChecked}
                                        onChange={() =>
                                          handlePeriodoPracticaToggle(periodo)
                                        }
                                        disabled={isDisabled}
                                        sx={{
                                          color: isDisabled ? "#a5d6a7" : "#2e7d32",
                                          "&.Mui-checked": {
                                            color: isDisabled ? "#66bb6a" : "#1b5e20",
                                          },
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: isChecked ? 700 : 500,
                                          color: isDisabled && !isChecked ? "#bdbdbd" : "inherit",
                                        }}
                                      >
                                        {periodo}
                                      </Typography>
                                    }
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* ── SECCIÓN 2: Responsables y Formalización ── */}
                    <Box
                      sx={{
                        p: 2.5,
                        border: "1px solid #bbdefb",
                        borderRadius: 2,
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#1565c0",
                          mb: 2,
                        }}
                      >
                        2. Responsables y Formalización
                      </Typography>

                      {/* I. Decano/Director */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          mb: 1,
                          mt: 0.5,
                        }}
                      >
                        I. Decano / Director
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="I. Decano/Director - Nombre"
                            name="director_nombre"
                            value={anexoFormData.director_nombre}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="I. Decano/Director - Cargo"
                            name="director_cargo"
                            value={anexoFormData.director_cargo}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="I. Decano/Director - Teléfono"
                            name="director_telefono"
                            value={anexoFormData.director_telefono}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="I. Decano/Director - Correo"
                            name="director_correo"
                            type="email"
                            value={anexoFormData.director_correo}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      {/* II. Resp. Docencia-Servicio IES */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          mb: 1,
                        }}
                      >
                        II. Resp. Docencia-Servicio IES
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nombre"
                            name="ds_ies_nombre"
                            value={anexoFormData.ds_ies_nombre}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="Nombre del responsable"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Cargo"
                            name="ds_ies_cargo"
                            value={anexoFormData.ds_ies_cargo}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="Cargo del responsable"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Teléfono"
                            name="ds_ies_telefono"
                            value={anexoFormData.ds_ies_telefono}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="Teléfono / Extensión"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Correo"
                            name="ds_ies_correo"
                            type="email"
                            value={anexoFormData.ds_ies_correo}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="correo@correounivalle.edu.co"
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      {/* Fecha de formalización del plan */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Fecha de formalización del plan"
                            name="fecha_formalizacion"
                            type="date"
                            value={anexoFormData.fecha_formalizacion}
                            onChange={handleAnexoInputChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      {/* III. Resp. Coordinación práctica */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          mb: 1,
                        }}
                      >
                        III. Resp. Coordinación Práctica
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nombre"
                            name="coordinacion_nombre"
                            value={anexoFormData.coordinacion_nombre}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="Nombre del coordinador"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Cargo"
                            name="coordinacion_cargo"
                            value={anexoFormData.coordinacion_cargo}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="Cargo del coordinador"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Teléfono"
                            name="coordinacion_telefono"
                            value={anexoFormData.coordinacion_telefono}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="Teléfono / Extensión"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Correo"
                            name="coordinacion_correo"
                            type="email"
                            value={anexoFormData.coordinacion_correo}
                            onChange={handleAnexoInputChange}
                            fullWidth
                            size="small"
                            placeholder="correo@correounivalle.edu.co"
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* ── SECCIÓN 3: Documento del Convenio y Vigencia ── */}
                    <Box
                      sx={{
                        p: 2.5,
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#424242",
                          mb: 2,
                        }}
                      >
                        3. Documento y Parámetros del Anexo
                      </Typography>

                      <TextField
                        label="URL del Documento"
                        name="urlAnexo"
                        value={anexoFormData.urlAnexo}
                        onChange={handleAnexoInputChange}
                        margin="normal"
                        fullWidth
                        placeholder="https://drive.google.com/..."
                        helperText="URL donde se encuentra almacenado el documento"
                      />

                      <Typography
                        variant="body2"
                        sx={{ my: 1, textAlign: "center" }}
                      >
                        O
                      </Typography>

                      <Button variant="outlined" component="label" fullWidth>
                        Seleccionar Archivo Local
                        <input
                          type="file"
                          hidden
                          onChange={handleAnexoInputChange}
                          name="localFile"
                        />
                      </Button>
                      {anexoFormData.localFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Archivo seleccionado: {anexoFormData.localFile.name}
                        </Typography>
                      )}

                      <FormControl fullWidth margin="normal" required>
                        <InputLabel id="tipo-label">Tipo</InputLabel>
                        <Select
                          labelId="tipo-label"
                          name="tipo"
                          value={anexoFormData.tipo}
                          onChange={handleAnexoInputChange}
                          label="Tipo"
                          required
                        >
                          <MenuItem value="C.D.S. Clinicos">
                            C.D.S. Clinicos
                          </MenuItem>
                          <MenuItem value="C.D.S. No clinicos">
                            C.D.S. No clinicos
                          </MenuItem>
                          <MenuItem value="C. Integración de propiedad">
                            C. Integración de propiedad
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                        <TextField
                          label="Vigencia Desde"
                          name="vigenciaDesde"
                          type="date"
                          value={anexoFormData.vigenciaDesde}
                          onChange={handleAnexoInputChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          fullWidth
                          required
                        />
                        <TextField
                          label="Vigencia Hasta"
                          name="vigenciaHasta"
                          type="date"
                          value={anexoFormData.vigenciaHasta}
                          onChange={handleAnexoInputChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          fullWidth
                          required
                        />
                      </Box>

                      <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                        <TextField
                          label="Versión"
                          name="version"
                          type="number"
                          value={anexoFormData.version}
                          onChange={handleAnexoInputChange}
                          required
                          sx={{ width: "50%" }}
                          inputProps={{ min: 1, step: 1 }}
                        />
                        <TextField
                          label="Cierre (Opcional)"
                          placeholder="Este campo es opcional"
                          name="cierre"
                          value={anexoFormData.cierre}
                          onChange={handleAnexoInputChange}
                          sx={{ width: "50%" }}
                        />
                      </Box>

                      <FormGroup sx={{ marginTop: 2 }}>
                        <FormLabel component="legend">Estado</FormLabel>
                        <RadioGroup
                          name="estadoAnexo"
                          value={anexoFormData.estadoAnexo}
                          onChange={handleAnexoInputChange}
                          sx={{ display: "flex", flexDirection: "row" }}
                        >
                          <FormControlLabel
                            value="Pendiente"
                            control={<Radio />}
                            label="Pendiente"
                          />
                          <FormControlLabel
                            value="En proceso"
                            control={<Radio />}
                            label="En proceso"
                          />
                          <FormControlLabel
                            value="Listo"
                            control={<Radio />}
                            label="Listo"
                          />
                          <FormControlLabel
                            value="Inactivo"
                            control={<Radio />}
                            label="Inactivo"
                          />
                        </RadioGroup>
                      </FormGroup>

                      {anexoFormData.estadoAnexo === "Inactivo" && (
                        <TextField
                          label="Observaciones"
                          name="observaciones"
                          value={anexoFormData.observaciones}
                          onChange={handleAnexoInputChange}
                          margin="normal"
                          multiline
                          rows={3}
                          fullWidth
                        />
                      )}
                    </Box>

                    {/* ── Sección de Planes de Práctica Formativa ── */}
                    <Box sx={{ mt: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: "#888787ff" }}
                        >
                          Planes Generales de Práctica Formativa
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={addPlan}
                          sx={{
                            backgroundColor: "#2e7d32",
                            "&:hover": { backgroundColor: "#1b5e20" },
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          + Añadir Plan
                        </Button>
                      </Box>

                      {anexoFormData.planes.length === 0 && (
                        <Box
                          sx={{
                            p: 2,
                            border: "2px dashed #c8e6c9",
                            borderRadius: 2,
                            textAlign: "center",
                            color: "#888",
                          }}
                        >
                          <Typography variant="body2">
                            Haz clic en <strong>+ Añadir Plan</strong> para
                            registrar el plan de práctica formativa con
                            horarios.
                          </Typography>
                        </Box>
                      )}

                      {anexoFormData.planes.map((plan, planIdx) => (
                        <PlanHorarioForm
                          key={plan.id}
                          plan={plan}
                          planIdx={planIdx}
                        />
                      ))}

                      {/* Resumen global si hay más de un plan */}
                      {anexoFormData.planes.length > 1 &&
                        (() => {
                          const totalHSemana = anexoFormData.planes.reduce(
                            (sum, p) => sum + calcularHorasSemana(p.grid),
                            0,
                          );
                          return (
                            <Box
                              sx={{
                                p: 1.5,
                                background: "#e8f5e9",
                                borderRadius: 1,
                                textAlign: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="#2e7d32"
                                fontWeight={700}
                              >
                                Total acumulado todos los planes:{" "}
                                <strong>{totalHSemana} h/semana</strong>
                              </Typography>
                            </Box>
                          );
                        })()}
                    </Box>
                  </FormGroup>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "center",
                      marginTop: 3,
                    }}
                  >
                    <Button type="submit" variant="contained" color="primary">
                      Guardar Anexo
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        toggleAnexoForm();
                        navigate("/docencia-servicio");
                      }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Box>
  );

  // Componente de formulario de escenario de práctica reutilizable
  const renderEscenarioForm = (isGeneral = false) => (
    <Box
      component="form"
      onSubmit={handleDocEscenarioFormSubmit}
      sx={{
        marginTop: 2,
        marginBottom: 3,
        maxWidth: "950px",
        mx: "auto",
        p: 3,
        border: "1px solid #1976d2",
        borderRadius: 2,
        backgroundColor: "#f8faff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, textAlign: "center", color: "#1976d2", fontWeight: 600 }}
      >
        {isGeneral
          ? "Formulario de Escenario de Práctica"
          : `Escenario de Práctica: ${docEscenarioFormData.nombreEscenario}`}
      </Typography>

      <FormGroup>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "#1565c0",
            mt: 1,
            mb: 1,
            borderBottom: "1px solid #e0e0e0",
            pb: 0.5,
          }}
        >
          1. Información General del Escenario
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {isGeneral ? (
              <Autocomplete
                freeSolo
                options={escenariosData || []}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.nombre || ""
                }
                value={
                  escenariosData.find(
                    (e) => e.id === docEscenarioFormData.idEscenario,
                  ) ||
                  docEscenarioFormData.nombreEscenario ||
                  ""
                }
                onChange={(event, newValue) => {
                  if (typeof newValue === "string") {
                    setDocEscenarioFormData({
                      ...docEscenarioFormData,
                      idEscenario: "",
                      nombreEscenario: newValue,
                    });
                  } else if (newValue && newValue.nombre) {
                    setDocEscenarioFormData({
                      ...docEscenarioFormData,
                      idEscenario: newValue.id || "",
                      nombreEscenario: newValue.nombre || "",
                      tipologia: newValue.tipologia || "",
                      codigo: newValue.codigo || "",
                      fechaInicio:
                        convertirFechaParaInput(newValue.fecha_inicio) || "",
                      fechaFin:
                        convertirFechaParaInput(newValue.fecha_fin) || "",
                      nombre_sede: newValue.nombre_sede || "",
                      numero_sede: newValue.numero_sede || "",
                      departamento: newValue.departamento || "",
                      municipio: newValue.municipio || "",
                      direccion: newValue.direccion || "",
                      nit: newValue.nit || "",
                      telefono: newValue.telefono || "",
                      correo: newValue.correo || "",
                      contacto: newValue.contacto || "",
                      documento: newValue.documento || "",
                      tipo_convenio: newValue.tipo_convenio || "",
                      firma_convenio:
                        convertirFechaParaInput(newValue.firma_convenio) ||
                        newValue.firma_convenio ||
                        "",
                      otros_si: newValue.otros_si || "",
                      anexo_tecnico: newValue.anexo_tecnico || "",
                    });
                  } else {
                    setDocEscenarioFormData({
                      ...docEscenarioFormData,
                      idEscenario: "",
                      nombreEscenario: "",
                    });
                  }
                }}
                onInputChange={(event, newInputValue) => {
                  if (!docEscenarioFormData.idEscenario) {
                    setDocEscenarioFormData((prev) => ({
                      ...prev,
                      nombreEscenario: newInputValue,
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Escenario de Práctica (Nombre / Institución)"
                    required
                    fullWidth
                    helperText="Seleccione uno existente o escriba uno nuevo"
                  />
                )}
              />
            ) : (
              <TextField
                label="Escenario de Práctica"
                value={docEscenarioFormData.nombreEscenario}
                disabled
                fullWidth
              />
            )}
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              freeSolo
              options={uniqueTipologias}
              value={docEscenarioFormData.tipologia}
              onInputChange={(event, newInputValue) => {
                setDocEscenarioFormData((prev) => ({
                  ...prev,
                  tipologia: newInputValue,
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipología"
                  fullWidth
                  placeholder="Ej: Clínico, No Clínico"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Código"
              name="codigo"
              value={docEscenarioFormData.codigo}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Código del escenario"
            />
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "#1565c0",
            mt: 2.5,
            mb: 1,
            borderBottom: "1px solid #e0e0e0",
            pb: 0.5,
          }}
        >
          2. Sede y Ubicación
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre de la Sede"
              name="nombre_sede"
              value={docEscenarioFormData.nombre_sede}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Nombre de la sede"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Número de Sede"
              name="numero_sede"
              value={docEscenarioFormData.numero_sede}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Ej: 1, 2..."
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Departamento"
              name="departamento"
              value={docEscenarioFormData.departamento}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Ej: Valle del Cauca"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Municipio"
              name="municipio"
              value={docEscenarioFormData.municipio}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Ej: Cali, Tuluá..."
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Dirección"
              name="direccion"
              value={docEscenarioFormData.direccion}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Dirección de la sede"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="NIT"
              name="nit"
              value={docEscenarioFormData.nit}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Ej: 890399010-6"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Teléfono"
              name="telefono"
              value={docEscenarioFormData.telefono}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Teléfono de contacto"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Correo Electrónico"
              name="correo"
              type="email"
              value={docEscenarioFormData.correo}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="correo@ejemplo.com"
            />
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "#1565c0",
            mt: 2.5,
            mb: 1,
            borderBottom: "1px solid #e0e0e0",
            pb: 0.5,
          }}
        >
          3. Persona de Contacto
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contacto (Nombre de la persona)"
              name="contacto"
              value={docEscenarioFormData.contacto}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Nombre y apellidos de la persona de contacto"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Documento"
              name="documento"
              value={docEscenarioFormData.documento}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Cédula / Documento de identidad"
            />
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "#1565c0",
            mt: 2.5,
            mb: 1,
            borderBottom: "1px solid #e0e0e0",
            pb: 0.5,
          }}
        >
          4. Convenio y Fechas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel
                id={`tipo-convenio-label-${isGeneral ? "gen" : "card"}`}
              >
                Tipo de Convenio
              </InputLabel>
              <Select
                labelId={`tipo-convenio-label-${isGeneral ? "gen" : "card"}`}
                name="tipo_convenio"
                value={docEscenarioFormData.tipo_convenio || ""}
                onChange={handleDocEscenarioInputChange}
                label="Tipo de Convenio"
              >
                <MenuItem value="No Clínico institucional">
                  No Clínico institucional
                </MenuItem>
                <MenuItem value="Clínico">Clínico</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Firma de Convenio"
              name="firma_convenio"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={docEscenarioFormData.firma_convenio}
              onChange={handleDocEscenarioInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fecha de Inicio"
              name="fechaInicio"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={docEscenarioFormData.fechaInicio}
              onChange={handleDocEscenarioInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fecha de Fin"
              name="fechaFin"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={docEscenarioFormData.fechaFin}
              onChange={handleDocEscenarioInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Otrosí"
              name="otros_si"
              value={docEscenarioFormData.otros_si}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Información u observaciones del Otrosí"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Anexo Técnico"
              name="anexo_tecnico"
              value={docEscenarioFormData.anexo_tecnico}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="Información u observaciones del Anexo Técnico"
            />
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "#1565c0",
            mt: 2.5,
            mb: 1,
            borderBottom: "1px solid #e0e0e0",
            pb: 0.5,
          }}
        >
          5. Documento / Soporte Adjunto (Opcional)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="URL del Documento"
              name="url"
              value={docEscenarioFormData.url}
              onChange={handleDocEscenarioInputChange}
              fullWidth
              placeholder="https://drive.google.com/..."
              helperText="URL donde se encuentra almacenado el documento (opcional)"
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ my: 1 }}>
              O
            </Typography>
            <Button variant="outlined" component="label">
              Seleccionar Archivo Local
              <input
                type="file"
                hidden
                onChange={handleDocEscenarioInputChange}
                name="localFile"
              />
            </Button>
            {docEscenarioFormData.localFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Archivo seleccionado: {docEscenarioFormData.localFile.name}
              </Typography>
            )}
          </Grid>
        </Grid>
      </FormGroup>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          marginTop: 3,
        }}
      >
        <Button type="submit" variant="contained" color="primary">
          Guardar Escenario de Práctica
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            toggleDocEscenarioForm(null);
            navigate("/docencia-servicio");
          }}
        >
          Cancelar / Volver
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <div className="content-with-sidebar">
        <Box
          sx={{
            width: "100%",
            maxWidth: isVistaAnexo || isVistaEscenario ? "950px" : "1100px",
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4 },
            mt: 2,
            ml: { xs: "auto", md: 0 },
            position: "relative",
            left: { xs: 0, md: "-30px" },
            mb: 6,
          }}
        >
          {isVistaAnexo ? (
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/docencia-servicio")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                    "&:hover": {
                      borderColor: "#1b5e20",
                      backgroundColor: "rgba(46, 125, 50, 0.04)",
                    },
                  }}
                >
                  ← Volver a Docencia y Servicio
                </Button>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Docencia-Servicio / Formulario de Anexo Convenio D.S.
                </Typography>
              </Box>

              {renderAnexoFormCompleto()}
            </Box>
          ) : isVistaEscenario ? (
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/docencia-servicio")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      borderColor: "#1565c0",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  ← Volver a Docencia y Servicio
                </Button>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Docencia-Servicio /{" "}
                  {docEscenarioFormData.nombreEscenario
                    ? ("Editar: " + docEscenarioFormData.nombreEscenario)
                    : "Nuevo Escenario de Práctica"}
                </Typography>
              </Box>

              {renderEscenarioForm(!docEscenarioFormData.nombreEscenario)}
            </Box>
          ) : (
            <>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 600,
              color: "#333",
              textAlign: "center",
            }}
          >
            Escenarios de Práctica
          </Typography>

          {/* Controles de Filtros */}
          <Card sx={{ mb: 4, p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Filtros de Visualización
              </Typography>

              <Grid container spacing={2} alignItems="center">
                {/* Selector de tipo de vista con 3 botones */}
                <Grid item xs={12} md={tipoVista === "escenario" ? 5 : 4}>
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      height: "40px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      "& .MuiButton-root": {
                        height: "100%",
                        py: 0,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <Button
                      variant={
                        tipoVista === "escenario" ? "contained" : "outlined"
                      }
                      onClick={() => handleTipoVistaChange("escenario")}
                      color="primary"
                    >
                      Escenarios
                    </Button>
                    <Button
                      variant={
                        tipoVista === "escuela" ? "contained" : "outlined"
                      }
                      onClick={() => handleTipoVistaChange("escuela")}
                      color="primary"
                    >
                      Escuelas
                    </Button>
                    <Button
                      variant={
                        tipoVista === "programa" ? "contained" : "outlined"
                      }
                      onClick={() => handleTipoVistaChange("programa")}
                      color="primary"
                    >
                      Programas
                    </Button>
                  </ButtonGroup>
                </Grid>

                {/* Barra de búsqueda inteligente por nombre, código, municipio o programa */}
                <Grid item xs={12} md={tipoVista === "escenario" ? 7 : 4}>
                  <TextField
                    size="small"
                    label="Buscar"
                    placeholder="Buscar por nombre, código, municipio o programa..."
                    value={filtroEscenario}
                    onChange={(e) => setFiltroEscenario(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                      },
                    }}
                  />
                </Grid>

                {/* Filtro por escuela */}
                {tipoVista === "escuela" && (
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      size="small"
                      options={["", ...escuelasUnicas]} // Incluir opción vacía para "Todas las escuelas"
                      getOptionLabel={(option) =>
                        option === "" ? "Todas las escuelas" : option
                      }
                      value={filtroEscuela}
                      onChange={(event, newValue) =>
                        setFiltroEscuela(newValue || "")
                      }
                      filterOptions={(options, params) => {
                        const filtered = options.filter(
                          (option) =>
                            option === "" ||
                            (option &&
                              option
                                .toLowerCase()
                                .includes(params.inputValue.toLowerCase())),
                        );
                        return filtered;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Filtrar por Escuela"
                          placeholder="Buscar escuela..."
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                            },
                          }}
                        />
                      )}
                      renderOption={(props, option, { index }) => (
                        <Box
                          component="li"
                          {...props}
                          key={`escuela-filter-${index}`}
                        >
                          <Typography variant="body1">
                            {option === "" ? "Todas las escuelas" : option}
                          </Typography>
                        </Box>
                      )}
                      noOptionsText="No se encontraron escuelas"
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  </Grid>
                )}

                {/* Filtro por programa académico */}
                {tipoVista === "programa" && (
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      size="small"
                      options={["", ...programasUnicos]} // Incluir opción vacía para "Todos los programas"
                      getOptionLabel={(option) =>
                        option === "" ? "Todos los programas" : option
                      }
                      value={filtroPrograma}
                      onChange={(event, newValue) =>
                        setFiltroPrograma(newValue || "")
                      }
                      filterOptions={(options, params) => {
                        const filtered = options.filter(
                          (option) =>
                            option === "" ||
                            (option &&
                              option
                                .toLowerCase()
                                .includes(params.inputValue.toLowerCase())),
                        );
                        return filtered;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Filtrar por Programa"
                          placeholder="Buscar programa académico..."
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                            },
                          }}
                        />
                      )}
                      renderOption={(props, option, { index }) => (
                        <Box
                          component="li"
                          {...props}
                          key={`programa-filter-${index}`}
                        >
                          <Typography variant="body1">
                            {option === "" ? "Todos los programas" : option}
                          </Typography>
                        </Box>
                      )}
                      noOptionsText="No se encontraron programas"
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Botones y formularios para añadir anexos técnicos y documentos de escenario */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            {(isCargo.includes("Convenio Docencia Servicio") ||
              isCargo.includes("Sistemas")) && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/docencia-servicio/formulario-anexo")}
                  sx={{ mb: 2 }}
                >
                  Añadir Anexo Convenio D.S.
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setShowAsignaturasModal(true)}
                  disabled={!programaSeleccionado}
                  sx={{ mb: 2 }}
                >
                  Asignaturas
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setDocEscenarioFormData(initialDocEscenarioState);
                    navigate("/docencia-servicio/formulario-escenario");
                  }}
                  sx={{ mb: 2 }}
                >
                  Añadir Escenario de Práctica
                </Button>
              </Box>
            )}

            {/* Los formularios ahora se muestran en vistas separadas */}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Debug info */}
              {console.log("=== RENDERIZADO ===", {
                tipoVista,
                dataLength: data?.length,
                anexosLength: anexos?.length,
                anexosPorEscenarioKeys: Object.keys(anexosPorEscenario || {}),
                anexosPorEscenario,
              })}

              {/* Vista por Escenarios (original) */}
              {tipoVista === "escenario" &&
                anexosPorEscenario &&
                Object.keys(anexosPorEscenario).length > 0 &&
                Object.entries(anexosPorEscenario).map(
                  ([nombreEscenario, datosEscenario], index) => {
                    // Obtener información de vigencia del escenario
                    const escenarioInfo =
                      datosEscenario.escenarioInfo ||
                      escenariosData?.find(
                        (esc) => esc.nombre === nombreEscenario,
                      );

                    // Debug: Mostrar información del escenario
                    console.log(`=== DEBUG VIGENCIA ${nombreEscenario} ===`);
                    console.log("escenarioInfo:", escenarioInfo);
                    console.log("fecha_fin:", escenarioInfo?.fecha_fin);

                    const vigenciaInfo = escenarioInfo
                      ? calcularVigenciaYColor(escenarioInfo.fecha_fin)
                      : {
                          diasRestantes: null,
                          colorFondo: "#f5f5f5",
                          estado: "Sin información",
                        };

                    // Calcular totales
                    const totalAnexosTecnicos =
                      datosEscenario.anexosTecnicos?.length || 0;
                    const totalDocEscenarios =
                      datosEscenario.documentosEscenario?.length || 0;
                    const totalItems =
                      datosEscenario.totalItems ||
                      totalAnexosTecnicos + totalDocEscenarios;

                    // Obtener municipio del escenario
                    const municipioTexto =
                      escenarioInfo?.municipio ||
                      escenariosData?.find(
                        (esc) =>
                          esc.nombre &&
                          esc.nombre.trim().toLowerCase() ===
                            nombreEscenario.trim().toLowerCase(),
                      )?.municipio ||
                      "";

                    // Generar texto del botón con nombre, municipio, anexos y vigencia
                    let buttonText = `${nombreEscenario}`;
                    if (municipioTexto) {
                      buttonText += ` - ${municipioTexto}`;
                    }
                    if (totalItems > 0) {
                      const partesDocs = [];
                      if (totalAnexosTecnicos > 0) {
                        partesDocs.push(
                          `${totalAnexosTecnicos} anexo${totalAnexosTecnicos !== 1 ? "s" : ""} técnico${totalAnexosTecnicos !== 1 ? "s" : ""}`,
                        );
                      }
                      if (totalDocEscenarios > 0) {
                        partesDocs.push(
                          `${totalDocEscenarios} documento${totalDocEscenarios !== 1 ? "s" : ""} de escenario`,
                        );
                      }
                      if (partesDocs.length > 0) {
                        buttonText += ` (${partesDocs.join(", ")})`;
                      }
                    }

                    // Agregar información de vigencia
                    if (vigenciaInfo.diasRestantes !== null) {
                      if (vigenciaInfo.diasRestantes < 0) {
                        buttonText += ` - VENCIDO hace ${Math.abs(vigenciaInfo.diasRestantes)} días`;
                      } else if (vigenciaInfo.diasRestantes <= 90) {
                        buttonText += ` - Vence en ${vigenciaInfo.diasRestantes} días`;
                      } else if (vigenciaInfo.diasRestantes <= 730) {
                        const meses = Math.round(
                          vigenciaInfo.diasRestantes / 30,
                        );
                        buttonText += ` - Vence en ${meses} mes${meses !== 1 ? "es" : ""}`;
                      } else {
                        const años = Math.round(
                          vigenciaInfo.diasRestantes / 365,
                        );
                        buttonText += ` - Vence en ${años} año${años !== 1 ? "s" : ""}`;
                      }
                    } else {
                      buttonText += " - Sin fecha de vigencia";
                    }

                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <CollapsibleButton
                          buttonText={buttonText}
                          buttonStyle={{
                            backgroundColor: vigenciaInfo.colorFondo,
                            color: "#000",
                          }}
                          content={
                            <Box>
                              {/* Información de vigencia */}
                              {vigenciaInfo.diasRestantes !== null && (
                                <Box
                                  sx={{
                                    mb: 2,
                                    p: 2,
                                    backgroundColor: vigenciaInfo.colorFondo,
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Estado de Vigencia: {vigenciaInfo.estado}
                                  </Typography>
                                  {vigenciaInfo.fechaVencimiento && (
                                    <Typography variant="body2">
                                      Fecha de vencimiento:{" "}
                                      {vigenciaInfo.fechaVencimiento}
                                    </Typography>
                                  )}
                                  {vigenciaInfo.diasRestantes !== null &&
                                    vigenciaInfo.diasRestantes >= 0 && (
                                      <Typography variant="body2">
                                        Días restantes:{" "}
                                        {vigenciaInfo.diasRestantes}
                                      </Typography>
                                    )}
                                  {vigenciaInfo.diasRestantes !== null &&
                                    vigenciaInfo.diasRestantes < 0 && (
                                      <Typography variant="body2">
                                        Días vencido:{" "}
                                        {Math.abs(vigenciaInfo.diasRestantes)}
                                      </Typography>
                                    )}
                                </Box>
                              )}

                              {/* Información adicional del Escenario si existe */}
                              {(() => {
                                const infoEsc =
                                  escenarioInfo ||
                                  escenariosData?.find(
                                    (esc) =>
                                      esc.nombre &&
                                      esc.nombre.trim().toLowerCase() ===
                                        nombreEscenario.trim().toLowerCase(),
                                  ) ||
                                  {};

                                const tieneDetalles = Boolean(
                                  infoEsc &&
                                    (infoEsc.codigo ||
                                      infoEsc.tipologia ||
                                      infoEsc.tipo_convenio ||
                                      infoEsc.nombre_sede ||
                                      infoEsc.numero_sede ||
                                      infoEsc.departamento ||
                                      infoEsc.municipio ||
                                      infoEsc.direccion ||
                                      infoEsc.nit ||
                                      infoEsc.telefono ||
                                      infoEsc.correo ||
                                      infoEsc.contacto ||
                                      infoEsc.documento ||
                                      infoEsc.firma_convenio ||
                                      infoEsc.fecha_inicio ||
                                      infoEsc.fecha_fin ||
                                      infoEsc.otros_si ||
                                      infoEsc.anexo_tecnico),
                                );

                                if (!tieneDetalles) return null;

                                return (
                                  <Box
                                    sx={{
                                      mb: 2,
                                      p: 2,
                                      backgroundColor: "#f9fafb",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: 1.5,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: 700,
                                        color: "#1e3a8a",
                                        mb: 1.5,
                                      }}
                                    >
                                      Detalles del Escenario
                                    </Typography>
                                    <Grid container spacing={1.5}>
                                      {infoEsc.codigo && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Código:</strong>{" "}
                                            {infoEsc.codigo}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.tipologia && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Tipología:</strong>{" "}
                                            {infoEsc.tipologia}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.tipo_convenio && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Tipo Convenio:</strong>{" "}
                                            {infoEsc.tipo_convenio}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.nombre_sede && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Nombre de Sede:</strong>{" "}
                                            {infoEsc.nombre_sede}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.numero_sede && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Número de Sede:</strong>{" "}
                                            {infoEsc.numero_sede}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.departamento && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Departamento:</strong>{" "}
                                            {infoEsc.departamento}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.municipio && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Municipio:</strong>{" "}
                                            {infoEsc.municipio}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.direccion && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Dirección:</strong>{" "}
                                            {infoEsc.direccion}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.nit && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>NIT:</strong> {infoEsc.nit}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.telefono && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Teléfono:</strong>{" "}
                                            {infoEsc.telefono}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.correo && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Correo:</strong>{" "}
                                            {infoEsc.correo}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.contacto && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Contacto:</strong>{" "}
                                            {infoEsc.contacto}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.documento && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Documento:</strong>{" "}
                                            {infoEsc.documento}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.firma_convenio && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Firma Convenio:</strong>{" "}
                                            {infoEsc.firma_convenio}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.fecha_inicio && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Fecha de Inicio:</strong>{" "}
                                            {infoEsc.fecha_inicio}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.fecha_fin && (
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Typography variant="body2">
                                            <strong>Fecha de Fin:</strong>{" "}
                                            {infoEsc.fecha_fin}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.otros_si && (
                                        <Grid item xs={12} sm={6}>
                                          <Typography variant="body2">
                                            <strong>Otrosí:</strong>{" "}
                                            {infoEsc.otros_si}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {infoEsc.anexo_tecnico && (
                                        <Grid item xs={12} sm={6}>
                                          <Typography variant="body2">
                                            <strong>Anexo Técnico:</strong>{" "}
                                            {infoEsc.anexo_tecnico}
                                          </Typography>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </Box>
                                );
                              })()}

                              {/* Botón para editar / completar datos del escenario */}
                              {(isCargo.includes(
                                "Convenio Docencia Servicio",
                              ) ||
                                isCargo.includes("Sistemas")) && (
                                <Box
                                  sx={{
                                    my: 2,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                      const matching =
                                        escenarioInfo ||
                                        escenariosData?.find(
                                          (e) => e.nombre === nombreEscenario,
                                        ) ||
                                        {};
                                      const formData = {
                                        idEscenario: matching.id || "",
                                        nombreEscenario: nombreEscenario,
                                        tipologia: matching.tipologia || "",
                                        codigo: matching.codigo || "",
                                        fechaInicio:
                                          convertirFechaParaInput(
                                            matching.fecha_inicio,
                                          ) || "",
                                        fechaFin:
                                          convertirFechaParaInput(
                                            matching.fecha_fin,
                                          ) || "",
                                        url: "",
                                        localFile: null,
                                        nombre_sede: matching.nombre_sede || "",
                                        numero_sede: matching.numero_sede || "",
                                        departamento:
                                          matching.departamento || "",
                                        municipio: matching.municipio || "",
                                        direccion: matching.direccion || "",
                                        nit: matching.nit || "",
                                        telefono: matching.telefono || "",
                                        correo: matching.correo || "",
                                        contacto: matching.contacto || "",
                                        documento: matching.documento || "",
                                        tipo_convenio:
                                          matching.tipo_convenio || "",
                                        firma_convenio:
                                          convertirFechaParaInput(
                                            matching.firma_convenio,
                                          ) ||
                                          matching.firma_convenio ||
                                          "",
                                        otros_si: matching.otros_si || "",
                                        anexo_tecnico:
                                          matching.anexo_tecnico || "",
                                      };
                                      setDocEscenarioFormData(formData);
                                      navigate(
                                        "/docencia-servicio/formulario-escenario",
                                        { state: { escenario: formData } },
                                      );
                                    }}
                                  >
                                    Editar / Añadir Datos del Escenario
                                  </Button>
                                </Box>
                              )}

                              <AnexosEscenarioTable
                                datos={datosEscenario}
                                tipoVista={tipoVista}
                              />
                            </Box>
                          }
                          defaultClosed={true}
                        />
                      </Box>
                    );
                  },
                )}

              {/* Vista por Escuelas */}
              {tipoVista === "escuela" &&
                (Object.keys(anexosPorEscenario).length > 0 ? (
                  Object.entries(anexosPorEscenario).map(
                    ([escuela, datosEscuela], index) => {
                      const totalAnexosTecnicos =
                        datosEscuela.anexosTecnicos?.length || 0;
                      const totalDocEscenarios =
                        datosEscuela.documentosEscenario?.length || 0;
                      const totalItems =
                        datosEscuela.totalItems ||
                        totalAnexosTecnicos + totalDocEscenarios;

                      const programasEnEscuela = [
                        ...new Set([
                          ...(datosEscuela.anexosTecnicos || [])
                            .map((a) => a.programa_info?.["programa académico"])
                            .filter((p) => p),
                          ...(datosEscuela.documentosEscenario || [])
                            .map((d) => d.programa_info?.["programa académico"])
                            .filter((p) => p),
                        ]),
                      ];

                      // Generar texto del botón para escuela
                      let buttonTextEscuela = `${escuela}`;
                      if (totalItems > 0) {
                        const partesDocs = [];
                        if (totalAnexosTecnicos > 0) {
                          partesDocs.push(
                            `${totalAnexosTecnicos} anexo${totalAnexosTecnicos !== 1 ? "s" : ""} técnico${totalAnexosTecnicos !== 1 ? "s" : ""}`,
                          );
                        }
                        if (totalDocEscenarios > 0) {
                          partesDocs.push(
                            `${totalDocEscenarios} documento${totalDocEscenarios !== 1 ? "s" : ""} de escenario`,
                          );
                        }
                        if (partesDocs.length > 0) {
                          buttonTextEscuela += ` (${partesDocs.join(", ")} - ${programasEnEscuela.length} programa${programasEnEscuela.length !== 1 ? "s" : ""})`;
                        }
                      } else if (programasEnEscuela.length > 0) {
                        buttonTextEscuela += ` (${programasEnEscuela.length} programa${programasEnEscuela.length !== 1 ? "s" : ""})`;
                      }

                      return (
                        <Box key={index} sx={{ mb: 2 }}>
                          <CollapsibleButton
                            buttonText={buttonTextEscuela}
                            content={
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{ color: "#666" }}
                                  >
                                    Documentos - Escuela: {escuela}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ mb: 2, color: "#888" }}
                                >
                                  Programas: {programasEnEscuela.join(", ")}
                                </Typography>
                                <AnexosEscenarioTable
                                  datos={datosEscuela}
                                  tipoVista={tipoVista}
                                />
                              </Box>
                            }
                            defaultClosed={true}
                          />
                        </Box>
                      );
                    },
                  )
                ) : (
                  <Typography sx={{ textAlign: "center", mt: 4 }}>
                    No hay documentos disponibles para la escuela seleccionada.
                  </Typography>
                ))}

              {/* Vista por Programas Académicos */}
              {tipoVista === "programa" &&
                (Object.keys(anexosPorEscenario).length > 0 ? (
                  Object.entries(anexosPorEscenario).map(
                    ([programa, datosPrograma], index) => {
                      const totalAnexosTecnicos =
                        datosPrograma.anexosTecnicos?.length || 0;
                      const totalDocEscenarios =
                        datosPrograma.documentosEscenario?.length || 0;
                      const totalItems =
                        datosPrograma.totalItems ||
                        totalAnexosTecnicos + totalDocEscenarios;

                      const escuelasEnPrograma = [
                        ...new Set([
                          ...(datosPrograma.anexosTecnicos || [])
                            .map((a) => a.programa_info?.escuela)
                            .filter((e) => e),
                          ...(datosPrograma.documentosEscenario || [])
                            .map((d) => d.programa_info?.escuela)
                            .filter((e) => e),
                        ]),
                      ];

                      // Generar texto del botón para programa
                      let buttonTextPrograma = `${programa}`;
                      if (totalItems > 0) {
                        const partesDocs = [];
                        if (totalAnexosTecnicos > 0) {
                          partesDocs.push(
                            `${totalAnexosTecnicos} anexo${totalAnexosTecnicos !== 1 ? "s" : ""} técnico${totalAnexosTecnicos !== 1 ? "s" : ""}`,
                          );
                        }
                        if (totalDocEscenarios > 0) {
                          partesDocs.push(
                            `${totalDocEscenarios} documento${totalDocEscenarios !== 1 ? "s" : ""} de escenario`,
                          );
                        }
                        if (partesDocs.length > 0) {
                          buttonTextPrograma += ` (${partesDocs.join(", ")})`;
                        }
                      }

                      return (
                        <Box key={index} sx={{ mb: 2 }}>
                          <CollapsibleButton
                            buttonText={buttonTextPrograma}
                            content={
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{ color: "#666" }}
                                  >
                                    Documentos - Programa: {programa}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ mb: 2, color: "#888" }}
                                >
                                  Escuela(s): {escuelasEnPrograma.join(", ")}
                                </Typography>
                                <AnexosEscenarioTable
                                  datos={datosPrograma}
                                  tipoVista={tipoVista}
                                />
                              </Box>
                            }
                            defaultClosed={true}
                          />
                        </Box>
                      );
                    },
                  )
                ) : (
                  <Typography sx={{ textAlign: "center", mt: 4 }}>
                    No hay documentos disponibles para el programa académico
                    seleccionado.
                  </Typography>
                ))}

              {/* Mensaje cuando no hay datos */}
              {tipoVista === "escenario" &&
                (!anexosPorEscenario ||
                  Object.keys(anexosPorEscenario).length === 0) && (
                  <Typography sx={{ textAlign: "center", mt: 4 }}>
                    No hay escenarios de práctica disponibles que coincidan con
                    los filtros aplicados.
                  </Typography>
                )}
            </>
          )}
            </>
          )}
        </Box>
        <ModalAsignaturas
          open={showAsignaturasModal}
          onClose={() => setShowAsignaturasModal(false)}
          programa={programaSeleccionado}
          practicasData={practicasData}
          onSaved={() => setReloadAnexos((value) => !value)}
        />
      </div>
    </>
  );
};

export default DocenciaServicio;
