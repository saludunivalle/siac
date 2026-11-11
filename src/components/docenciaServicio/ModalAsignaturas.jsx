import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { clearCache, fetchPostGeneral } from "../../service/fetch";

const ENDPOINT = "https://siac-server.vercel.app/docServ";

const ROMAN_MAP = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
  11: "XI",
  12: "XII",
  13: "XIII",
  14: "XIV",
  15: "XV",
};

const toRoman = (num) => ROMAN_MAP[Number(num)] || String(num);

const normalizedKey = (key) =>
  String(key || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const readColumn = (row, ...names) => {
  const wanted = names.map(normalizedKey);
  const key = Object.keys(row || {}).find((item) =>
    wanted.includes(normalizedKey(item)),
  );
  return key ? row[key] : "";
};

const getNumber = (value) => {
  const match = String(value ?? "").match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 0;
};

const getProgramField = (programa, ...names) => {
  const normalized = Object.keys(programa || {}).reduce((result, key) => {
    const cleanKey = key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    result[cleanKey] = programa[key];
    return result;
  }, {});
  const name = names.find((item) => normalized[item]);
  return name ? normalized[name] : "";
};

const isAnualProgram = (periodicidad, duracion) => {
  const pStr = String(periodicidad || "").toLowerCase();
  const dStr = String(duracion || "").toLowerCase();
  return (
    pStr.includes("anual") ||
    (dStr.includes("año") && !pStr.includes("semestr"))
  );
};

const getPeriodCount = (periodicidad, duracion) => {
  const match = String(duracion || "").match(/\d+/);
  const amount = match ? parseInt(match[0], 10) : 0;
  if (!amount) return 5;

  const pStr = String(periodicidad || "").toLowerCase();
  const dStr = String(duracion || "").toLowerCase();

  const isAnual =
    pStr.includes("anual") ||
    (dStr.includes("año") && !pStr.includes("semestr"));
  const isSemestral = pStr.includes("semestr");
  const durationIsSem = dStr.includes("sem");
  const durationIsAnos = dStr.includes("año");

  if (isAnual) {
    if (durationIsSem) return Math.ceil(amount / 2);
    if (durationIsAnos) return amount;
    if (amount > 6) return Math.ceil(amount / 2);
    return amount;
  }

  if (isSemestral) {
    if (durationIsAnos) return amount * 2;
    return amount;
  }

  if (durationIsSem) return amount;
  return amount || 5;
};

const getPeriodWeeks = (periodicidad, duracion) => {
  const pStr = String(periodicidad || "").toLowerCase();
  const dStr = String(duracion || "").toLowerCase();
  if (
    pStr.includes("anual") ||
    (dStr.includes("año") && !pStr.includes("semestr"))
  )
    return 48;
  return 18;
};

// Conversión de período a número (VI -> 6, VII -> 7, etc.)
const parsePeriodoToNumber = (val) => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().toUpperCase();
  if (!str) return null;

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  const romanMap = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
    XIII: 13,
    XIV: 14,
    XV: 15,
  };

  if (romanMap[str]) return romanMap[str];

  const words = str.split(/[\s\-_/.]+/);
  for (const word of words) {
    if (romanMap[word]) return romanMap[word];
    if (/^\d+$/.test(word)) return parseInt(word, 10);
  }

  const cleanRoman = str.replace(/[^IVXLCDM]/g, "");
  if (cleanRoman) {
    const rMap = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let num = 0;
    for (let i = 0; i < cleanRoman.length; i++) {
      const curr = rMap[cleanRoman[i]];
      const next = rMap[cleanRoman[i + 1]];
      if (next && curr < next) {
        num -= curr;
      } else {
        num += curr;
      }
    }
    if (num > 0 && num <= 30) return num;
  }
  return null;
};

const periodNumber = (value) => {
  const parsed = parsePeriodoToNumber(value);
  return parsed || Number(value) || 0;
};

// Extractor del nombre de asignatura desde fila de PRACTICAS
const getSubjectName = (row) => {
  if (!row) return "";
  for (const key of Object.keys(row)) {
    const clean = key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    if (clean.includes("nombre") && clean.includes("asignatura")) {
      return String(row[key] || "").trim();
    }
  }
  return String(
    row[
      "NOMBRE DE LA ASIGNATURA A LA QUE PERTENECE LA PRÁCTICA FORMATIVA O ROTACIÓN"
    ] ||
      row[
        "nombre de la asignatura a la que pertenece la práctica formativa o rotación"
      ] ||
      row[
        "nombre de la asignatura a la que pertenece la practica formativa o rotacion"
      ] ||
      row["nombre_asignatura"] ||
      "",
  ).trim();
};

// Extractor del período académico desde fila de PRACTICAS
const getPeriodoRaw = (row) => {
  if (!row) return "";
  for (const key of Object.keys(row)) {
    const clean = key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    if (clean.includes("periodo") && clean.includes("academico")) {
      return row[key];
    }
  }
  return (
    row["PERÍODO ACADÉMICO"] ||
    row["período académico"] ||
    row["periodo academico"] ||
    row["periodo"] ||
    ""
  );
};

const emptySubject = (period, semanas) => ({
  localId: `${Date.now()}-${Math.random()}`,
  id: "",
  numero_periodo: period,
  nombre_asignatura: "",
  numero_semanas: semanas || 18,
  estudiantes_beneficiados: "",
  relacion: "",
  grupo: "",
  numero_estudiantes: "",
  practicas: [],
});

const distributeWeeksToPractices = (practicesList, totalAsigWeeks) => {
  if (!practicesList || practicesList.length === 0) return [];
  const targetWeeks = Number(totalAsigWeeks) > 0 ? Number(totalAsigWeeks) : 18;
  const count = practicesList.length;

  // Si todas las prácticas ya tienen semanas asignadas (> 0), respetarlas intactas
  const allHaveWeeks = practicesList.every((p) => Number(p.numero_semanas) > 0);
  if (allHaveWeeks) {
    return practicesList;
  }

  const explicitSum = practicesList.reduce(
    (acc, p) =>
      acc + (Number(p.numero_semanas) > 0 ? Number(p.numero_semanas) : 0),
    0,
  );
  const withoutWeeks = practicesList.filter(
    (p) => !(Number(p.numero_semanas) > 0),
  );

  if (withoutWeeks.length === count) {
    const baseWeeks = Math.max(1, Math.floor(targetWeeks / count));
    const remainder = targetWeeks - baseWeeks * count;
    return practicesList.map((p, idx) => ({
      ...p,
      numero_semanas: baseWeeks + (idx < remainder ? 1 : 0),
    }));
  } else if (withoutWeeks.length > 0) {
    const remainingWeeks = Math.max(0, targetWeeks - explicitSum);
    const baseWeeks = Math.max(
      1,
      Math.floor(remainingWeeks / withoutWeeks.length),
    );
    const remainder = remainingWeeks - baseWeeks * withoutWeeks.length;
    let withoutIdx = 0;
    return practicesList.map((p) => {
      if (Number(p.numero_semanas) > 0) return p;
      const assigned = baseWeeks + (withoutIdx < remainder ? 1 : 0);
      withoutIdx++;
      return {
        ...p,
        numero_semanas: assigned,
      };
    });
  }
  return practicesList;
};

const normalizePractice = (row) => {
  const ra = String(
    readColumn(
      row,
      "Resultados de Aprendizaje (RA)",
      "resultados_aprendizaje",
    ) || "",
  );
  return {
    localId: `practice-${readColumn(row, "id") || Date.now()}-${Math.random()}`,
    id: readColumn(row, "id"),
    idPractica: readColumn(row, "ID Práctica", "id_practica"),
    nombrePractica: readColumn(
      row,
      "NOMBRE DE LA PRÁCTICA FORMATIVA O ROTACIÓN",
      "nombre_practica",
    ),
    competencias: readColumn(row, "Competencias", "competencias"),
    resultadosAprendizaje: ra
      .split(/\r?\n/)
      .map((item) => item.replace(/^\s*\d+\s*[-.)]\s*/, "").trim())
      .filter(Boolean),
    numeroActividades: readColumn(
      row,
      "Número actividades para RA",
      "numero_actividades",
    ),
    evaluacion: readColumn(row, "Evaluacion", "evaluacion"),
    id_escenario: readColumn(
      row,
      "id_escenario",
      "ID Escenario",
      "idescenario",
    ),
    nombre_escenario: readColumn(
      row,
      "nombre_escenario",
      "Escenario",
      "nombre escenario",
      "institucion",
    ),
    numero_semanas: readColumn(
      row,
      "numero_semanas",
      "semanas",
      "numero semanas",
    ),
    grupo: readColumn(row, "grupo", "Grupo"),
    numero_estudiantes: readColumn(
      row,
      "numero_estudiantes",
      "estudiantes",
      "numero estudiantes",
    ),
    relacion: readColumn(row, "relacion", "Relacion", "relación", "Relación"),
    estudiantes_beneficiados: readColumn(
      row,
      "estudiantes_beneficiados",
      "beneficiados",
      "estudiantes beneficiados",
    ),
  };
};

export default function ModalAsignaturas({
  open,
  onClose,
  onBack,
  programa,
  practicasData,
  escenariosData = [],
  periodosSeleccionados = [],
  onSaved,
  embedded = false,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [periodoActivo, setPeriodoActivo] = useState(0);
  const [practicasList, setPracticasList] = useState([]);
  const [allPracticasList, setAllPracticasList] = useState([]);
  const [escenarios, setEscenarios] = useState(escenariosData || []);
  const [expandedPractices, setExpandedPractices] = useState({});
  const initialSnapshotRef = useRef("");

  const serializeAsignaturasSnapshot = (rowsList = []) =>
    JSON.stringify(
      (rowsList || []).map((row) => ({
        numero_periodo: periodNumber(row.numero_periodo),
        nombre_asignatura: String(row.nombre_asignatura || "").trim(),
        numero_semanas:
          row.numero_semanas === "" ? "" : Number(row.numero_semanas) || 0,
        practicas: (row.practicas || []).map((practice) => ({
          idPractica: String(practice.idPractica || "").trim(),
          nombrePractica: String(practice.nombrePractica || "").trim(),
          competencias: String(practice.competencias || ""),
          resultadosAprendizaje: Array.isArray(practice.resultadosAprendizaje)
            ? practice.resultadosAprendizaje.map((ra) => String(ra || ""))
            : [],
          evaluacion: String(practice.evaluacion || ""),
          id_escenario: String(practice.id_escenario || ""),
          nombre_escenario: String(practice.nombre_escenario || ""),
          numero_semanas:
            practice.numero_semanas === ""
              ? ""
              : Number(practice.numero_semanas) || 0,
          grupo: String(practice.grupo || ""),
          numero_estudiantes:
            practice.numero_estudiantes === ""
              ? ""
              : Number(practice.numero_estudiantes) || 0,
          relacion: String(practice.relacion || "1:1"),
          estudiantes_beneficiados:
            practice.estudiantes_beneficiados === ""
              ? ""
              : Number(practice.estudiantes_beneficiados) || 0,
        })),
      })),
    );

  const periodicidad = getProgramField(
    programa,
    "periodicidad",
    "periodicidad_admision",
  );
  const duracion = getProgramField(
    programa,
    "duracion_semestres",
    "duracion_programa",
    "duracion",
    "duración",
  );
  const totalPeriodos = useMemo(
    () => getPeriodCount(periodicidad, duracion),
    [periodicidad, duracion],
  );
  const semanasPeriodo = getPeriodWeeks(periodicidad, duracion);
  const esAnual = isAnualProgram(periodicidad, duracion);
  const labelPrefix = esAnual ? "Año" : "Semestre";
  const idPrograma = getProgramField(
    programa,
    "id_programa",
    "idprograma",
    "id",
  );

  useEffect(() => {
    if (!open || !idPrograma) return;
    let activo = true;
    setError("");
    setLoading(true);

    const loadPracticas = async () => {
      try {
        const response = await axios.post(
          "https://siac-server.vercel.app/docServ",
          { sheetName: "PRACTICAS" },
        );
        if (
          response.data &&
          response.data.status &&
          Array.isArray(response.data.data)
        ) {
          return response.data.data;
        }
      } catch (err) {
        console.warn("No se pudieron cargar prácticas formativas:", err);
      }
      return Array.isArray(practicasData) ? practicasData : [];
    };

    Promise.all([
      fetchPostGeneral({
        dataSend: {},
        sheetName: "ASIGNATURAS",
        urlEndPoint: ENDPOINT,
      }),
      loadPracticas(),
    ])
      .then(([responseAsignaturas, practicasList]) => {
        if (!activo) return;
        const data = Array.isArray(responseAsignaturas?.data)
          ? responseAsignaturas.data
          : [];

        const idProgStr = String(idPrograma).trim().toLowerCase();
        setAllPracticasList(practicasList || []);

        const practicasDelPrograma = (practicasList || []).filter((p) => {
          const pId = String(
            readColumn(p, "ID_PROGRAMA", "id_programa", "id programa") || "",
          )
            .trim()
            .toLowerCase();
          return pId === idProgStr;
        });
        setPracticasList(practicasDelPrograma);
        const practicesForSubject = (name, totalAsigWeeks) => {
          const raw = practicasDelPrograma
            .filter(
              (practice) =>
                getSubjectName(practice).trim().toLowerCase() ===
                String(name || "")
                  .trim()
                  .toLowerCase(),
            )
            .map(normalizePractice);
          return distributeWeeksToPractices(raw, totalAsigWeeks);
        };

        // 1. Asignaturas ya existentes en la BD para este programa
        const existingRows = data
          .filter(
            (item) =>
              String(readColumn(item, "id_programa", "ID_PROGRAMA") || "")
                .trim()
                .toLowerCase() === idProgStr,
          )
          .map((item) => {
            let numPer = periodNumber(
              readColumn(
                item,
                "numero_periodo",
                "PERÍODO ACADÉMICO",
                "periodo",
              ),
            );
            if (esAnual && totalPeriodos > 0 && numPer > totalPeriodos) {
              numPer = Math.ceil(numPer / 2);
            }
            const asigName =
              readColumn(
                item,
                "nombre_asignatura",
                "NOMBRE DE LA ASIGNATURA",
              ) || item.nombre_asignatura;
            const asigWeeks =
              Number(
                readColumn(item, "numero_semanas") || item.numero_semanas,
              ) || semanasPeriodo;
            return {
              ...item,
              id: readColumn(item, "id") || item.id,
              id_programa:
                readColumn(item, "id_programa", "ID_PROGRAMA") ||
                item.id_programa,
              numero_periodo: numPer,
              nombre_asignatura: asigName,
              localId:
                readColumn(item, "id") ||
                item.id ||
                `${Date.now()}-${Math.random()}`,
              numero_semanas: asigWeeks,
              practicas: practicesForSubject(asigName, asigWeeks),
            };
          });

        // 2. Extraer asignaturas de la hoja PRACTICAS para este programa
        const practicasDelProg = practicasDelPrograma;

        const seenKeys = new Set();
        const practicasRowsToAdd = [];

        practicasDelProg.forEach((p) => {
          const nombreAsig = getSubjectName(p);
          const rawPeriodo = getPeriodoRaw(p);
          let periodoNum = parsePeriodoToNumber(rawPeriodo);
          if (!nombreAsig || !periodoNum) return;
          if (esAnual && totalPeriodos > 0 && periodoNum > totalPeriodos) {
            periodoNum = Math.ceil(periodoNum / 2);
          }

          const dedupeKey = `${periodoNum}___${nombreAsig.toLowerCase()}`;
          if (seenKeys.has(dedupeKey)) return;
          seenKeys.add(dedupeKey);

          // Verificar si ya existe en existingRows
          const yaExiste = existingRows.some(
            (r) =>
              periodNumber(r.numero_periodo) === Number(periodoNum) &&
              String(r.nombre_asignatura || "")
                .trim()
                .toLowerCase() === nombreAsig.toLowerCase(),
          );

          if (!yaExiste) {
            practicasRowsToAdd.push({
              localId: `${Date.now()}-${Math.random()}`,
              id: "", // lista para ser guardada
              id_programa: idPrograma,
              numero_periodo: periodoNum,
              periodoRaw: String(rawPeriodo).trim().toUpperCase(),
              nombre_asignatura: nombreAsig,
              numero_semanas: semanasPeriodo,
              fromPracticas: true,
              practicas: practicesForSubject(nombreAsig, semanasPeriodo),
            });
          }
        });

        const mergedRows = [...existingRows, ...practicasRowsToAdd];
        initialSnapshotRef.current = serializeAsignaturasSnapshot(mergedRows);
        setRows(mergedRows);
        setPeriodoActivo(0);
      })
      .catch((err) => {
        console.error("Error al cargar asignaturas:", err);
        if (activo) setError("No se pudieron cargar las asignaturas.");
      })
      .finally(() => activo && setLoading(false));

    return () => {
      activo = false;
    };
  }, [open, idPrograma, totalPeriodos, semanasPeriodo, practicasData]);

  useEffect(() => {
    if (escenariosData && escenariosData.length > 0) {
      setEscenarios(escenariosData);
      return;
    }
    axios
      .post("https://siac-server.vercel.app/getInstituciones", {
        sheetName: "ESC_PRACTICA",
      })
      .then((res) => {
        if (res.data?.status && Array.isArray(res.data.data)) {
          setEscenarios(res.data.data);
        }
      })
      .catch((e) => console.warn("No se pudieron cargar escenarios:", e));
  }, [escenariosData]);

  // Períodos que tienen asignaturas (desde prácticas o existentes)
  const periodosConAsignaturas = useMemo(() => {
    const set = new Set(
      rows.map((r) => periodNumber(r.numero_periodo)).filter(Boolean),
    );
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  // Mapa de cómo venía originalmente el período en la hoja PRACTICAS (ej. 6 -> "VI")
  const periodosRawMap = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (r.numero_periodo && r.periodoRaw) {
        map[periodNumber(r.numero_periodo)] = r.periodoRaw;
      }
    });
    return map;
  }, [rows]);

  const getPeriodoDisplay = (period) => {
    const num = periodNumber(period);
    return toRoman(num || period);
  };

  const getPeriodoRoman = (period) => toRoman(periodNumber(period));

  // Lista de años/períodos a mostrar en las pestañas:
  // Si el usuario seleccionó períodos en el Paso 0, se muestran exactamente y ÚNICAMENTE esos períodos seleccionados
  const periodosTabs = useMemo(() => {
    if (
      Array.isArray(periodosSeleccionados) &&
      periodosSeleccionados.length > 0
    ) {
      const selectedNums = Array.from(
        new Set(
          periodosSeleccionados
            .map((p) => {
              let n = parsePeriodoToNumber(p);
              if (esAnual && totalPeriodos > 0 && n > totalPeriodos) {
                n = Math.ceil(n / 2);
              }
              return n;
            })
            .filter(
              (n) => n && n >= 1 && (totalPeriodos ? n <= totalPeriodos : true),
            ),
        ),
      ).sort((a, b) => a - b);
      if (selectedNums.length > 0) return selectedNums;
    }
    if (periodosConAsignaturas.length > 0) {
      return periodosConAsignaturas.filter((n) =>
        totalPeriodos ? n <= totalPeriodos : true,
      );
    }
    return Array.from({ length: totalPeriodos || 1 }, (_, i) => i + 1);
  }, [periodosSeleccionados, periodosConAsignaturas, totalPeriodos, esAnual]);

  // Período numérico seleccionado actualmente
  const periodoActualNum = periodosTabs[periodoActivo] || periodosTabs[0] || 1;

  const rowsForPeriod = (period) =>
    rows.filter(
      (row) => periodNumber(row.numero_periodo) === periodNumber(period),
    );

  const addRow = (period) =>
    setRows((current) => [...current, emptySubject(period, semanasPeriodo)]);

  const updateRow = (localId, field, value) =>
    setRows((current) =>
      current.map((row) =>
        row.localId === localId ? { ...row, [field]: value } : row,
      ),
    );

  const removeRow = (localId) =>
    setRows((current) => current.filter((row) => row.localId !== localId));

  const updatePractice = (rowLocalId, practiceLocalId, field, value) =>
    setRows((current) =>
      current.map((row) =>
        row.localId !== rowLocalId
          ? row
          : {
              ...row,
              practicas: (row.practicas || []).map((practice) =>
                practice.localId === practiceLocalId
                  ? { ...practice, [field]: value }
                  : practice,
              ),
            },
      ),
    );

  const addPractice = (row) => {
    const periodLabel = getPeriodoRoman(row.numero_periodo);
    const used = (row.practicas || []).length + 1;
    const semanasAsignadas = (row.practicas || []).reduce(
      (acc, p) => acc + (Number(p.numero_semanas) || 0),
      0,
    );
    const semanasRestantes = Math.max(
      0,
      (Number(row.numero_semanas) || 0) - semanasAsignadas,
    );
    const practice = {
      localId: `practice-new-${Date.now()}-${Math.random()}`,
      id: "",
      idPractica: `PRAC-${periodLabel}-${String(used).padStart(2, "0")}`,
      nombrePractica: row.nombre_asignatura || "",
      id_escenario: "",
      nombre_escenario: "",
      numero_semanas: semanasRestantes > 0 ? semanasRestantes : "",
      grupo: "",
      numero_estudiantes: "",
      relacion: "1:1",
      estudiantes_beneficiados: "",
      competencias: "",
      resultadosAprendizaje: [""],
      numeroActividades: "",
      evaluacion: "",
    };
    setRows((current) =>
      current.map((item) =>
        item.localId === row.localId
          ? { ...item, practicas: [...(item.practicas || []), practice] }
          : item,
      ),
    );
    setExpandedPractices((prev) => ({ ...prev, [practice.localId]: true }));
  };

  const removePractice = (rowLocalId, practiceLocalId) =>
    setRows((current) =>
      current.map((row) =>
        row.localId !== rowLocalId
          ? row
          : {
              ...row,
              practicas: (row.practicas || []).filter(
                (practice) => practice.localId !== practiceLocalId,
              ),
            },
      ),
    );

  const updatePracticeResult = (rowLocalId, practiceLocalId, index, value) =>
    setRows((current) =>
      current.map((row) =>
        row.localId !== rowLocalId
          ? row
          : {
              ...row,
              practicas: (row.practicas || []).map((practice) => {
                if (practice.localId !== practiceLocalId) return practice;
                const resultados = [...(practice.resultadosAprendizaje || [])];
                resultados[index] = value;
                return { ...practice, resultadosAprendizaje: resultados };
              }),
            },
      ),
    );

  const handleSave = async () => {
    setError("");
    if (serializeAsignaturasSnapshot(rows) === initialSnapshotRef.current) {
      onSaved?.(rows);
      if (!embedded) onClose?.();
      return;
    }
    const validRows = rows.filter(
      (row) => !row.id && row.nombre_asignatura?.trim(),
    );
    if (!idPrograma) {
      setError("No se identificó el id del programa.");
      return;
    }
    if (
      validRows.some(
        (row) =>
          !Number.isInteger(Number(row.numero_semanas)) ||
          Number(row.numero_semanas) <= 0 ||
          Number(row.numero_semanas) > 48,
      )
    ) {
      setError("Cada asignatura debe tener entre 1 y 48 semanas.");
      return;
    }
    setSaving(true);
    try {
      const maxP = Math.max(totalPeriodos || 1, ...periodosConAsignaturas);
      const assignmentValues = (row, id) => [
        id,
        row.id_programa || idPrograma,
        row.periodicidad || periodicidad,
        row.duracion || duracion,
        row.total_periodos || maxP,
        periodNumber(row.numero_periodo),
        row.nombre_periodo || `Año ${getPeriodoDisplay(row.numero_periodo)}`,
        row.semanas_periodo || semanasPeriodo,
        row.nombre_asignatura.trim(),
        Number(row.numero_semanas),
        row.horas_independientes_opcion || "1:1",
        row.estudiantes_beneficiados || "",
        row.relacion || "",
        row.grupo || "",
        row.numero_estudiantes || "",
      ];
      const newRowIds = new Map();
      const insertData = validRows.map((row) => {
        const generatedId =
          row.id ||
          `${idPrograma}-${row.numero_periodo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        newRowIds.set(row.localId, generatedId);
        return assignmentValues(row, generatedId);
      });
      const existingRows = rows.filter(
        (row) => row.id && row.nombre_asignatura?.trim(),
      );
      const [response, ...updateResponses] = await Promise.all([
        insertData.length
          ? fetchPostGeneral({
              dataSend: { insertData },
              sheetName: "ASIGNATURAS",
              urlEndPoint: "https://siac-server.vercel.app/sendDocServ",
            })
          : Promise.resolve({ status: true }),
        ...existingRows.map((row) =>
          fetchPostGeneral({
            dataSend: { updateData: assignmentValues(row, row.id), id: row.id },
            sheetName: "ASIGNATURAS",
            urlEndPoint: "https://siac-server.vercel.app/updatePractice",
          }),
        ),
      ]);
      if (!response?.status || updateResponses.some((item) => !item?.status))
        throw new Error("save");

      let nextPracticeId =
        Math.max(
          0,
          ...allPracticasList.map(
            (item) => Number(readColumn(item, "id")) || 0,
          ),
        ) + 1;
      const usedPracticeCodes = new Set(
        allPracticasList.map((item) =>
          String(readColumn(item, "ID Práctica", "id_practica") || ""),
        ),
      );
      const savedPracticeMeta = new Map();
      const practicesToSave = rows.flatMap((row) =>
        (row.practicas || []).map((practice) => {
          const periodLabel = getPeriodoRoman(row.numero_periodo);
          let sequence = 1;
          let code =
            practice.idPractica ||
            `PRAC-${periodLabel}-${String(sequence).padStart(2, "0")}`;
          while (!practice.id && usedPracticeCodes.has(code)) {
            sequence += 1;
            code = `PRAC-${periodLabel}-${String(sequence).padStart(2, "0")}`;
          }
          usedPracticeCodes.add(code);
          const id = practice.id || nextPracticeId++;
          savedPracticeMeta.set(practice.localId, { id, idPractica: code });
          return {
            id,
            idPractica: code,
            row,
            practice,
            values: [
              id,
              code,
              idPrograma,
              periodLabel,
              row.nombre_asignatura.trim(),
              practice.nombrePractica || row.nombre_asignatura.trim(),
              practice.competencias || "",
              (practice.resultadosAprendizaje || [])
                .map((item, index) => `${index + 1}-${item}`)
                .filter((item) => item.slice(item.indexOf("-") + 1).trim())
                .join("\n"),
              Array.isArray(practice.resultadosAprendizaje)
                ? practice.resultadosAprendizaje.length
                : practice.numeroActividades || 0,
              practice.evaluacion || "",
              practice.id_escenario || "",
              practice.nombre_escenario || "",
              practice.numero_semanas || "",
              practice.grupo || "",
              practice.numero_estudiantes || "",
              practice.relacion || "",
              practice.estudiantes_beneficiados || "",
            ],
          };
        }),
      );
      const newPractices = practicesToSave.filter((item) => !item.practice.id);
      const existingPractices = practicesToSave.filter(
        (item) => item.practice.id,
      );
      if (newPractices.length) {
        const practiceResponse = await fetchPostGeneral({
          dataSend: { insertData: newPractices.map((item) => item.values) },
          sheetName: "PRACTICAS",
          urlEndPoint: "https://siac-server.vercel.app/sendDocServ",
        });
        if (!practiceResponse?.status) throw new Error("practice-save");
      }
      if (existingPractices.length) {
        const practiceResponses = await Promise.all(
          existingPractices.map((item) =>
            fetchPostGeneral({
              dataSend: { updateData: item.values, id: item.practice.id },
              sheetName: "PRACTICAS",
              urlEndPoint: "https://siac-server.vercel.app/updatePractice",
            }),
          ),
        );
        if (practiceResponses.some((item) => !item?.status))
          throw new Error("practice-update");
      }
      const updatedRows = rows.map((row) => ({
        ...row,
        id: row.id || newRowIds.get(row.localId) || row.id,
        practicas: (row.practicas || []).map((practice) => {
          const meta = savedPracticeMeta.get(practice.localId);
          return meta
            ? { ...practice, id: meta.id, idPractica: meta.idPractica }
            : practice;
        }),
      }));
      initialSnapshotRef.current = serializeAsignaturasSnapshot(updatedRows);
      setRows(updatedRows);
      clearCache();
      onSaved?.(updatedRows);
      if (!embedded) onClose?.();
    } catch {
      setError("No se pudieron guardar las asignaturas.");
    } finally {
      setSaving(false);
    }
  };

  const Wrapper = embedded ? Box : Dialog;
  const wrapperProps = embedded
    ? {
        sx: {
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        },
      }
    : { open, onClose, fullWidth: true, maxWidth: "md" };

  return (
    <Wrapper {...wrapperProps}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Asignaturas de {programa?.["programa académico"] || "programa"}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          direction="row"
          spacing={3}
          sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
        >
          <Typography variant="body2">
            Periodicidad: <strong>{periodicidad || "-"}</strong>
          </Typography>
          <Typography variant="body2">
            Duración: <strong>{duracion || "-"}</strong>
          </Typography>
          <Typography variant="body2">
            Años con prácticas:{" "}
            <strong>
              {periodosConAsignaturas.length > 0
                ? periodosConAsignaturas
                    .map((p) => getPeriodoDisplay(p))
                    .join(", ")
                : "Sin prácticas registradas"}
            </strong>
          </Typography>
          <Typography variant="body2">
            Semanas por año: <strong>{semanasPeriodo}</strong>
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography sx={{ py: 3, textAlign: "center" }}>
            Cargando asignaturas...
          </Typography>
        ) : (
          <>
            <Tabs
              value={periodoActivo >= periodosTabs.length ? 0 : periodoActivo}
              onChange={(_, value) => setPeriodoActivo(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
            >
              {periodosTabs.map((period, index) => {
                const count = rowsForPeriod(period).length;
                const labelPeriodo = getPeriodoDisplay(period);
                return (
                  <Tab
                    key={period}
                    label={`${labelPrefix} ${labelPeriodo}${count > 0 ? ` (${count})` : ""}`}
                    sx={{
                      fontWeight: count > 0 ? 700 : 500,
                      color: count > 0 ? "#2e7d32" : "inherit",
                    }}
                  />
                );
              })}
            </Tabs>

            {(() => {
              const period = periodoActualNum;
              const periodRows = rowsForPeriod(period);
              const tieneAsignaturas = periodRows.length > 0;
              const labelActual = getPeriodoDisplay(period);
              return (
                <Box
                  sx={{
                    backgroundColor: tieneAsignaturas ? "#e8f5e9" : "#f5f5f5",
                    border: "1px solid",
                    borderColor: tieneAsignaturas ? "#a5d6a7" : "#d6d6d6",
                    borderRadius: 1.5,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: tieneAsignaturas ? "#c8e6c9" : "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: "#1b5e20" }}>
                      {labelPrefix} {labelActual}: {semanasPeriodo} semanas
                    </Typography>
                    {tieneAsignaturas ? (
                      <Chip
                        label={`${periodRows.length} asignatura(s)`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Sin asignaturas registradas
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1.5, fontWeight: 700, color: "#37474f" }}
                    >
                      Prácticas Formativas o Rotaciones del Año {labelActual}
                    </Typography>
                    {periodRows.map((row) => (
                      <Box
                        key={row.localId}
                        sx={{
                          mb: 2,
                          backgroundColor: "#ffffff",
                          borderRadius: 1.5,
                          border: "1px solid #b0bec5",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          alignItems={{ sm: "center" }}
                          sx={{
                            p: 1.5,
                            backgroundColor: "#ffffff",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          <TextField
                            fullWidth
                            size="small"
                            label="Nombre de la asignatura"
                            value={row.nombre_asignatura || ""}
                            onChange={(e) =>
                              updateRow(
                                row.localId,
                                "nombre_asignatura",
                                e.target.value,
                              )
                            }
                          />
                          <TextField
                            label="N.º semanas"
                            size="small"
                            type="number"
                            value={row.numero_semanas ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateRow(
                                row.localId,
                                "numero_semanas",
                                value === "" ? "" : Math.min(Number(value), 48),
                              );
                            }}
                            inputProps={{ min: 1, max: 48 }}
                            sx={{ minWidth: 120 }}
                          />
                          <IconButton
                            color="error"
                            onClick={() => removeRow(row.localId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                        <Accordion
                          elevation={0}
                          disableGutters
                          sx={{
                            "&:before": { display: "none" },
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ backgroundColor: "#f5f7f9" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                flexWrap: "wrap",
                                width: "100%",
                                pr: 2,
                              }}
                            >
                              <Typography>
                                Prácticas formativas (
                                {(row.practicas || []).length})
                              </Typography>
                              {(() => {
                                const sumSemanas = (row.practicas || []).reduce(
                                  (acc, p) =>
                                    acc + (Number(p.numero_semanas) || 0),
                                  0,
                                );
                                const totalSemanas =
                                  Number(row.numero_semanas) || 0;
                                const coincide = sumSemanas === totalSemanas;
                                return (
                                  <Chip
                                    size="small"
                                    label={
                                      totalSemanas > 0
                                        ? `Semanas asignadas: ${sumSemanas} / ${totalSemanas} sem ${coincide ? "✓" : `(Diferencia: ${sumSemanas - totalSemanas > 0 ? `+${sumSemanas - totalSemanas}` : `${sumSemanas - totalSemanas}`} sem)`}`
                                        : `Total semanas prácticas: ${sumSemanas}`
                                    }
                                    color={
                                      coincide
                                        ? "success"
                                        : sumSemanas > totalSemanas
                                          ? "error"
                                          : "warning"
                                    }
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                    }}
                                  />
                                );
                              })()}
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 1.5 }}>
                            {(row.practicas || []).map(
                              (practice, practiceIndex) => (
                                <React.Fragment key={practice.localId}>
                                  <Divider
                                    sx={{
                                      mt: practiceIndex === 0 ? 0.5 : 2.5,
                                      mb: 1.5,
                                      borderBottomWidth: 2,
                                      borderColor: "#90a4ae",
                                    }}
                                  >
                                    <Chip
                                      label={`Práctica ${practiceIndex + 1}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        color: "#455a64",
                                        borderColor: "#90a4ae",
                                      }}
                                    />
                                  </Divider>
                                  <Accordion
                                    expanded={Boolean(
                                      expandedPractices[practice.localId],
                                    )}
                                    onChange={(_, isExpanded) =>
                                      setExpandedPractices((prev) => ({
                                        ...prev,
                                        [practice.localId]: isExpanded,
                                      }))
                                    }
                                    elevation={0}
                                    disableGutters
                                    sx={{
                                      mb: 1.5,
                                      border: "1px solid #b0bec5",
                                      borderLeft: "4px solid #1976d2",
                                      borderRadius: "4px !important",
                                      backgroundColor: "#ffffff",
                                      "&:before": { display: "none" },
                                      overflow: "hidden",
                                    }}
                                  >
                                    <AccordionSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      sx={{
                                        minHeight: 44,
                                        "& .MuiAccordionSummary-content": {
                                          my: 0.75,
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: 1,
                                          flexWrap: "wrap",
                                          pr: 1,
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 700,
                                            color: "#1976d2",
                                            fontSize: "0.78rem",
                                          }}
                                        >
                                          Práctica formativa #
                                          {practiceIndex + 1}
                                        </Typography>
                                        {practice.nombrePractica && (
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: 600,
                                              color: "#37474f",
                                            }}
                                          >
                                            {practice.nombrePractica}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        {practice.nombre_escenario && (
                                          <Chip
                                            size="small"
                                            variant="outlined"
                                            label={practice.nombre_escenario}
                                            sx={{
                                              fontSize: "0.7rem",
                                              maxWidth: 220,
                                            }}
                                          />
                                        )}
                                        {practice.numero_semanas && (
                                          <Chip
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            label={`${practice.numero_semanas} sem`}
                                            sx={{
                                              fontSize: "0.7rem",
                                              fontWeight: 600,
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </AccordionSummary>
                                    <AccordionDetails
                                      sx={{
                                        pt: 1.5,
                                        borderTop: "1px solid #eceff1",
                                      }}
                                    >
                                      <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        spacing={1.5}
                                        sx={{ mb: 1.5 }}
                                      >
                                        <TextField
                                          size="small"
                                          label="ID práctica"
                                          value={practice.idPractica || ""}
                                          InputProps={{ readOnly: true }}
                                          sx={{ minWidth: 150 }}
                                        />
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="Nombre de la práctica formativa o rotación"
                                          value={practice.nombrePractica || ""}
                                          onChange={(event) =>
                                            updatePractice(
                                              row.localId,
                                              practice.localId,
                                              "nombrePractica",
                                              event.target.value,
                                            )
                                          }
                                        />
                                        <TextField
                                          size="small"
                                          type="number"
                                          label="Número actividades para RA"
                                          value={
                                            Array.isArray(
                                              practice.resultadosAprendizaje,
                                            )
                                              ? practice.resultadosAprendizaje
                                                  .length
                                              : practice.numeroActividades || 0
                                          }
                                          InputProps={{ readOnly: true }}
                                          helperText="Determinado por los RA agregados"
                                          sx={{ minWidth: 190 }}
                                        />
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            removePractice(
                                              row.localId,
                                              practice.localId,
                                            )
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Stack>

                                      {/* Sección: Escenario de Práctica, Semanas y Cupos */}
                                      <Box
                                        sx={{
                                          mb: 1.5,
                                          p: 1.5,
                                          backgroundColor: "#f9fbfd",
                                          borderRadius: 1,
                                          border: "1px dashed #90caf9",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 700,
                                            color: "#1565c0",
                                            display: "block",
                                            mb: 1,
                                          }}
                                        >
                                          Escenario de Práctica y Cupos /
                                          Beneficiarios
                                        </Typography>
                                        <Stack
                                          direction={{
                                            xs: "column",
                                            md: "row",
                                          }}
                                          spacing={1.5}
                                          alignItems="center"
                                          flexWrap="wrap"
                                        >
                                          <FormControl
                                            size="small"
                                            sx={{ minWidth: 240, flex: 1 }}
                                          >
                                            <InputLabel
                                              id={`escenario-label-${practice.localId}`}
                                            >
                                              Escenario de práctica
                                            </InputLabel>
                                            <Select
                                              labelId={`escenario-label-${practice.localId}`}
                                              label="Escenario de práctica"
                                              value={
                                                practice.id_escenario || ""
                                              }
                                              onChange={(event) => {
                                                const selectedId =
                                                  event.target.value;
                                                const escObj = (
                                                  escenarios || []
                                                ).find(
                                                  (e) =>
                                                    String(e.id) ===
                                                    String(selectedId),
                                                );
                                                const nombreEsc = escObj
                                                  ? escObj.nombre ||
                                                    escObj.institucion ||
                                                    ""
                                                  : "";
                                                updatePractice(
                                                  row.localId,
                                                  practice.localId,
                                                  "id_escenario",
                                                  selectedId,
                                                );
                                                updatePractice(
                                                  row.localId,
                                                  practice.localId,
                                                  "nombre_escenario",
                                                  nombreEsc,
                                                );
                                              }}
                                            >
                                              <MenuItem value="">
                                                <em>
                                                  -- Seleccionar Escenario --
                                                </em>
                                              </MenuItem>
                                              {(escenarios || []).map((esc) => (
                                                <MenuItem
                                                  key={esc.id}
                                                  value={esc.id}
                                                >
                                                  {esc.nombre ||
                                                    esc.institucion ||
                                                    `Escenario ${esc.id}`}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>

                                          <TextField
                                            size="small"
                                            type="number"
                                            label="Semanas práctica"
                                            value={
                                              practice.numero_semanas || ""
                                            }
                                            onChange={(event) =>
                                              updatePractice(
                                                row.localId,
                                                practice.localId,
                                                "numero_semanas",
                                                event.target.value,
                                              )
                                            }
                                            inputProps={{ min: 1 }}
                                            sx={{ width: 140 }}
                                          />

                                          <TextField
                                            size="small"
                                            label="Grupo"
                                            placeholder="Ej: G1, A"
                                            value={practice.grupo || ""}
                                            onChange={(event) =>
                                              updatePractice(
                                                row.localId,
                                                practice.localId,
                                                "grupo",
                                                event.target.value,
                                              )
                                            }
                                            sx={{ width: 100 }}
                                          />

                                          <TextField
                                            size="small"
                                            type="number"
                                            label="N° Estudiantes"
                                            value={
                                              practice.numero_estudiantes || ""
                                            }
                                            onChange={(event) =>
                                              updatePractice(
                                                row.localId,
                                                practice.localId,
                                                "numero_estudiantes",
                                                event.target.value,
                                              )
                                            }
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 120 }}
                                          />

                                          <FormControl
                                            size="small"
                                            sx={{ width: 110 }}
                                          >
                                            <InputLabel
                                              id={`relacion-label-${practice.localId}`}
                                            >
                                              Relación
                                            </InputLabel>
                                            <Select
                                              labelId={`relacion-label-${practice.localId}`}
                                              label="Relación"
                                              value={practice.relacion || "1:1"}
                                              onChange={(event) =>
                                                updatePractice(
                                                  row.localId,
                                                  practice.localId,
                                                  "relacion",
                                                  event.target.value,
                                                )
                                              }
                                            >
                                              {[
                                                "1:1",
                                                "1:2",
                                                "1:3",
                                                "1:4",
                                                "1:5",
                                                "1:6",
                                                "1:8",
                                                "4:1",
                                              ].map((r) => (
                                                <MenuItem key={r} value={r}>
                                                  {r}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>

                                          <TextField
                                            size="small"
                                            type="number"
                                            label="Est. Beneficiados"
                                            value={
                                              practice.estudiantes_beneficiados ||
                                              ""
                                            }
                                            onChange={(event) =>
                                              updatePractice(
                                                row.localId,
                                                practice.localId,
                                                "estudiantes_beneficiados",
                                                event.target.value,
                                              )
                                            }
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 130 }}
                                          />
                                        </Stack>
                                      </Box>

                                      <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        size="small"
                                        label="Competencias"
                                        value={practice.competencias || ""}
                                        onChange={(event) =>
                                          updatePractice(
                                            row.localId,
                                            practice.localId,
                                            "competencias",
                                            event.target.value,
                                          )
                                        }
                                        sx={{ mb: 1.5 }}
                                      />
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ mb: 0.5 }}
                                      >
                                        Resultados de aprendizaje (RA)
                                      </Typography>
                                      {(
                                        practice.resultadosAprendizaje || []
                                      ).map((result, resultIndex) => (
                                        <Stack
                                          key={`${practice.localId}-ra-${resultIndex}`}
                                          direction="row"
                                          spacing={1}
                                          sx={{ mb: 1 }}
                                        >
                                          <TextField
                                            fullWidth
                                            size="small"
                                            label={`RA ${resultIndex + 1}`}
                                            value={result}
                                            onChange={(event) =>
                                              updatePracticeResult(
                                                row.localId,
                                                practice.localId,
                                                resultIndex,
                                                event.target.value,
                                              )
                                            }
                                          />
                                          <IconButton
                                            color="error"
                                            onClick={() =>
                                              updatePractice(
                                                row.localId,
                                                practice.localId,
                                                "resultadosAprendizaje",
                                                (
                                                  practice.resultadosAprendizaje ||
                                                  []
                                                ).filter(
                                                  (_, index) =>
                                                    index !== resultIndex,
                                                ),
                                              )
                                            }
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Stack>
                                      ))}
                                      <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() =>
                                          updatePractice(
                                            row.localId,
                                            practice.localId,
                                            "resultadosAprendizaje",
                                            [
                                              ...(practice.resultadosAprendizaje ||
                                                []),
                                              "",
                                            ],
                                          )
                                        }
                                      >
                                        Agregar RA
                                      </Button>
                                      <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        size="small"
                                        label="Evaluación"
                                        value={practice.evaluacion || ""}
                                        onChange={(event) =>
                                          updatePractice(
                                            row.localId,
                                            practice.localId,
                                            "evaluacion",
                                            event.target.value,
                                          )
                                        }
                                        sx={{ mt: 1.5 }}
                                      />
                                    </AccordionDetails>
                                  </Accordion>
                                </React.Fragment>
                              ),
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => addPractice(row)}
                              sx={{ mt: 0.5 }}
                            >
                              Agregar práctica formativa
                            </Button>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => addRow(period)}
                      sx={{ mt: 1 }}
                    >
                      Agregar asignatura al {labelPrefix} {labelActual}
                    </Button>
                  </Box>
                </Box>
              );
            })()}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onBack} disabled={saving}>
          Atrás
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? "Guardando..." : "Guardar y continuar a Esquemas"}
        </Button>
      </DialogActions>
    </Wrapper>
  );
}
