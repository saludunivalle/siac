import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { clearCache, fetchPostGeneral } from "../../service/fetch";

const URL = "https://siac-server.vercel.app";
const COLORS = [
  "#90caf9",
  "#a5d6a7",
  "#ffcc80",
  "#ce93d8",
  "#80cbc4",
  "#ef9a9a",
  "#fff59d",
];
const clean = (value) => String(value || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]/g, "");

const normalizedKey = (key) => String(key || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]/g, "");

const readColumn = (row, ...names) => {
  const wanted = names.map(normalizedKey);
  const key = Object.keys(row || {}).find((item) => wanted.includes(normalizedKey(item)));
  return key ? row[key] : "";
};

const val = (o, ...names) => {
  if (!o) return "";
  for (const n of names) {
    const target = clean(n);
    const key = Object.keys(o).find((k) => clean(k) === target);
    if (key && o[key] !== undefined && o[key] !== null && String(o[key]).trim() !== "") {
      return o[key];
    }
  }
  for (const n of names) {
    const target = clean(n);
    if (target.length < 4) continue;
    const key = Object.keys(o).find((k) => clean(k).includes(target));
    if (key && o[key] !== undefined && o[key] !== null && String(o[key]).trim() !== "") {
      return o[key];
    }
  }
  return "";
};

const getSubjectName = (row) => {
  if (!row) return "";
  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c.includes("nombre") && c.includes("asignatura")) {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
  }
  return String(
    val(
      row,
      "nombre de la asignatura a la que pertenece la practica formativa o rotacion",
      "nombre_asignatura",
      "nombre de la asignatura",
      "asignatura",
    ) || "",
  ).trim();
};

const getPracticeName = (row) => {
  if (!row) return "";
  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c.includes("nombre") && c.includes("practica")) {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
  }
  return String(
    val(
      row,
      "nombre de la practica formativa o rotacion",
      "nombre_practica",
      "nombre de la practica",
      "practica",
    ) || "",
  ).trim();
};

const getScenarioName = (row) => {
  if (!row) return "";
  const direct = readColumn(
    row,
    "nombre_escenario",
    "nombre escenario",
    "nombre del escenario",
    "escenario",
    "institucion",
  );
  if (direct) return String(direct).trim();
  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c.includes("id")) continue;
    if (c.includes("escenario") || c.includes("institucion")) {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
  }
  return "";
};

const getPracticeWeeks = (row, defaultWeeks = 0) => {
  if (!row) return defaultWeeks;
  // Buscar explícitamente semanas de la asignatura o práctica (NUNCA semanas_periodo!)
  const direct =
    readColumn(row, "numero_semanas", "numero semanas", "semanas_asignatura", "semanas_practica") ||
    val(row, "numero_semanas", "semanas_asignatura", "semanas_practica");
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
    const match = String(direct).match(/\d+/);
    if (match && Number(match[0]) > 0) return Number(match[0]);
  }
  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c.includes("periodo")) continue; // ignorar semanas_periodo
    if (
      c === "numero_semanas" ||
      c === "semanas" ||
      c === "numsemanas" ||
      c.includes("semanas_practica") ||
      c.includes("semanas_asignatura")
    ) {
      const match = String(row[key] || "").match(/\d+/);
      if (match && Number(match[0]) > 0) return Number(match[0]);
    }
  }
  return defaultWeeks;
};

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
    (acc, p) => acc + (Number(p.numero_semanas) > 0 ? Number(p.numero_semanas) : 0),
    0,
  );
  const withoutWeeks = practicesList.filter((p) => !(Number(p.numero_semanas) > 0));

  if (withoutWeeks.length === count) {
    const baseWeeks = Math.max(1, Math.floor(targetWeeks / count));
    const remainder = targetWeeks - baseWeeks * count;
    return practicesList.map((p, idx) => ({
      ...p,
      numero_semanas: baseWeeks + (idx < remainder ? 1 : 0),
    }));
  } else if (withoutWeeks.length > 0) {
    const remainingWeeks = Math.max(0, targetWeeks - explicitSum);
    const baseWeeks = Math.max(1, Math.floor(remainingWeeks / withoutWeeks.length));
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

const getProgramId = (row) => {
  if (!row) return "";
  const direct = readColumn(
    row,
    "id_programa",
    "idprograma",
    "ID_PROGRAMA",
    "id programa",
  );
  if (direct) return String(direct).trim();
  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c === "idprograma" || (c.includes("programa") && c.includes("id") && !c.includes("asig"))) {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
  }
  return String(row.id_programa || row.idPrograma || "").trim();
};

const getPracticeId = (row) => {
  if (!row) return "";
  const direct = readColumn(row, "id_practica", "id práctica", "idPractica", "codigo_practica");
  if (direct) return String(direct).trim();
  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c.includes("practica") && (c.includes("id") || c.includes("codigo"))) {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
  }
  return "";
};

const getScenarioId = (row) => {
  if (!row) return "";
  const direct = readColumn(row, "id_escenario", "idescenario", "id escenario");
  if (direct) return String(direct).trim();
  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c.includes("escenario") && c.includes("id")) {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
  }
  return "";
};

const ROMAN_MAP = {
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

const parsePeriodoToNumber = (val) => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().toUpperCase();
  if (!str) return null;

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  if (ROMAN_MAP[str]) return ROMAN_MAP[str];

  const words = str.split(/[\s\-_/.]+/);
  for (const word of words) {
    if (ROMAN_MAP[word]) return ROMAN_MAP[word];
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
  return parsed || (Number(value) || 0);
};

const toRoman = (value) => ROMAN_MAP[Number(value)] || String(value);

const getPeriodRaw = (row) => {
  if (!row) return "";
  const direct = readColumn(
    row,
    "numero_periodo",
    "numeroperiodo",
    "numero periodo",
    "numero de periodo",
    "periodo academico",
    "periodo_academico",
    "período académico",
    "periodo",
    "period",
  );
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
    return String(direct).trim();
  }

  for (const key of Object.keys(row)) {
    const c = clean(key);
    if (c.includes("total") || c.includes("semana")) continue;
    if (c.includes("periodo") && c.includes("academ")) {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
    if (c === "periodo" || c === "period" || c === "numperiodo" || c === "nroperiodo") {
      const v = String(row[key] || "").trim();
      if (v) return v;
    }
  }
  return "";
};
const isAnualProgram = (periodicidad, duracion) => {
  const pStr = String(periodicidad || "").toLowerCase();
  const dStr = String(duracion || "").toLowerCase();
  return (
    pStr.includes("anual") ||
    (dStr.includes("año") && !pStr.includes("semestr"))
  );
};

const periodCount = (periodicity, duration) => {
  const match = String(duration || "").match(/\d+/);
  const amount = match ? parseInt(match[0], 10) : 0;
  if (!amount) return 5;

  const pStr = String(periodicity || "").toLowerCase();
  const dStr = String(duration || "").toLowerCase();

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

export default function ModalEsquema({
  open,
  onClose,
  onBack,
  programa,
  asignaturasData = [],
  practicasData = [],
  escenariosData = [],
  periodosSeleccionados = [],
  onSaved,
  embedded = false,
}) {
  const idPrograma = String(
    val(programa, "id_programa", "idPrograma", "id", "ID_PROGRAMA") ||
      programa?.id_programa ||
      programa?.idPrograma ||
      programa?.id ||
      "",
  ).trim();
  const periodicidad = val(programa, "periodicidad", "periodicidad_admision");
  const duracion = val(programa, "duracion_semestres", "duracion_programa", "duracion", "duración");
  const totalPeriodos = periodCount(periodicidad, duracion);
  const esAnual = isAnualProgram(periodicidad, duracion);
  const labelPrefix = esAnual ? "Año" : "Semestre";
  const semanas = esAnual ? 48 : 18;
  const [subjects, setSubjects] = useState([]);
  const [practices, setPractices] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [extraLinesBySubject, setExtraLinesBySubject] = useState({});
  const [drag, setDrag] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [periodoActivo, setPeriodoActivo] = useState(0);

  const periodosTabs = React.useMemo(() => {
    if (Array.isArray(periodosSeleccionados) && periodosSeleccionados.length > 0) {
      const selectedNums = Array.from(
        new Set(
          periodosSeleccionados
            .map((p) => {
              let n = periodNumber(p);
              if (esAnual && totalPeriodos > 0 && n > totalPeriodos) {
                n = Math.ceil(n / 2);
              }
              return n;
            })
            .filter((n) => n && n >= 1 && (totalPeriodos ? n <= totalPeriodos : true)),
        ),
      ).sort((a, b) => a - b);
      if (selectedNums.length > 0) return selectedNums;
    }
    return Array.from({ length: totalPeriodos || 1 }, (_, i) => i + 1);
  }, [periodosSeleccionados, totalPeriodos, esAnual]);

  const resolveScenarioName = (rawName, escId) => {
    const cleanName = String(rawName || "").trim();
    const idStr = String(escId || "").trim();
    if (cleanName && cleanName !== idStr && !/^\d+$/.test(cleanName)) {
      return cleanName;
    }
    if (idStr && Array.isArray(escenariosData)) {
      const found = escenariosData.find((esc) => String(esc?.id ?? "").trim() === idStr);
      if (found) {
        return String(found.nombre || found.institucion || found.nombre_escenario || "").trim();
      }
    }
    return cleanName || "";
  };

  const color = (id) => {
    const index = subjects.findIndex((item) => String(item.id) === String(id));
    return index >= 0 ? `hsl(${(index * 137) % 360} 70% 78%)` : COLORS[0];
  };

  const matchesProgram = (row) => {
    if (!row) return false;
    const rowId = String(
      readColumn(row, "id_programa", "ID_PROGRAMA", "id programa") || getProgramId(row) || "",
    ).trim().toLowerCase();
    const targetId = idPrograma.trim().toLowerCase();
    if (rowId && targetId && rowId === targetId) return true;
    const progNom = String(
      readColumn(programa, "programa academico", "nombre_programa", "programa") ||
        val(programa, "programa academico", "nombre_programa", "programa") ||
        programa?.["programa académico"] ||
        programa?.nombre_programa ||
        "",
    ).trim().toLowerCase();
    if (progNom) {
      const rowNom = String(
        readColumn(row, "programa academico", "nombre_programa", "programa") ||
          val(row, "programa academico", "nombre_programa", "programa") ||
          row?.["programa académico"] ||
          row?.nombre_programa ||
          "",
      ).trim().toLowerCase();
      if (rowNom && rowNom === progNom) return true;
    }
    return false;
  };

  useEffect(() => {
    if (!open || !idPrograma) return;
    let active = true;
    setLoading(true);

    const loadPracticasSheet = async () => {
      try {
        const res = await fetchPostGeneral({
          dataSend: {},
          sheetName: "PRACTICAS",
          urlEndPoint: `${URL}/docServ`,
        });
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          return res;
        }
      } catch (err) {
        console.warn("Error cargando PRACTICAS:", err);
      }
      return { data: practicasData || [] };
    };

    Promise.all([
      axios.post(`${URL}/docServ`, { sheetName: "ASIGNATURAS" }).then((r) => r.data).catch(() => ({ data: [] })),
      axios.post(`${URL}/docServ`, { sheetName: "ESQUEMAS" }).then((r) => r.data).catch(() => ({ data: [] })),
      axios.post(`${URL}/docServ`, { sheetName: "PRACTICAS" }).then((r) => r.data).catch(() => ({ data: practicasData || [] })),
    ])
      .then(([a, e, p]) => {
        if (!active) return;
        const practicasRaw = (p.data || []).filter(matchesProgram);
        setPractices(practicasRaw);

        const asignaturasRaw = (a.data || []).filter(matchesProgram).map((x) => {
          const asigNombre =
            getSubjectName(x) ||
            readColumn(x, "nombre_asignatura", "nombre de la asignatura") ||
            val(x, "nombre_asignatura") ||
            x.nombre_asignatura;
          const asigId =
            readColumn(x, "id") ||
            val(x, "id") ||
            x.id ||
            `asig-${Date.now()}-${Math.random()}`;
          let numPer = periodNumber(getPeriodRaw(x));
          if (esAnual && totalPeriodos > 0 && numPer > totalPeriodos) {
            numPer = Math.ceil(numPer / 2);
          }
          const misPracticas = practicasRaw.filter((pr) => {
            let prPer = periodNumber(getPeriodRaw(pr));
            if (esAnual && totalPeriodos > 0 && prPer > totalPeriodos) {
              prPer = Math.ceil(prPer / 2);
            }
            return (
              getSubjectName(pr).toLowerCase() === String(asigNombre).trim().toLowerCase() &&
              (!prPer || !numPer || prPer === numPer)
            );
          });
          const asigSemanas = getPracticeWeeks(x, semanas);
          const sourcePracticas =
            Array.isArray(x.practicas) && x.practicas.length > 0 ? x.practicas : misPracticas;
          const mappedPractices = sourcePracticas.map((pr) => {
            const prNombre = getPracticeName(pr) || asigNombre;
            const prId = getPracticeId(pr) || readColumn(pr, "id_practica", "id") || val(pr, "id") || prNombre;
            const escId = getScenarioId(pr);
            const escName = resolveScenarioName(getScenarioName(pr), escId);
            return {
              id: readColumn(pr, "id") || val(pr, "id") || prId,
              id_practica: prId,
              nombre_practica: prNombre,
              id_escenario: escId,
              nombre_escenario: escName,
              numero_semanas: getPracticeWeeks(pr, 0),
            };
          });
          const distributedPractices = distributeWeeksToPractices(mappedPractices, asigSemanas);
          return {
            ...x,
            id: asigId,
            id_programa: idPrograma,
            numero_periodo: numPer,
            nombre_asignatura: asigNombre,
            numero_semanas: asigSemanas,
            practicas: distributedPractices,
          };
        });

        // Complementar con asignaturas presentes en PRACTICAS si no están en ASIGNATURAS
        const existingKeys = new Set(
          asignaturasRaw.map((s) => `${s.numero_periodo}___${String(s.nombre_asignatura).trim().toLowerCase()}`),
        );
        practicasRaw.forEach((pr) => {
          const asigNombre = getSubjectName(pr);
          if (!asigNombre) return;
          let numPer = periodNumber(getPeriodRaw(pr));
          if (esAnual && totalPeriodos > 0 && numPer > totalPeriodos) {
            numPer = Math.ceil(numPer / 2);
          }
          const pVal = numPer || 1;
          const key = `${pVal}___${asigNombre.trim().toLowerCase()}`;
          if (!existingKeys.has(key)) {
            existingKeys.add(key);
            const misPracticas = practicasRaw.filter((pRow) => {
              let pRowPer = periodNumber(getPeriodRaw(pRow));
              if (esAnual && totalPeriodos > 0 && pRowPer > totalPeriodos) {
                pRowPer = Math.ceil(pRowPer / 2);
              }
              return (
                getSubjectName(pRow).trim().toLowerCase() === asigNombre.trim().toLowerCase() &&
                (pRowPer || 1) === pVal
              );
            });
            const asigId = `asig-from-practicas-${asigNombre.replace(/\s+/g, "_")}-${pVal}`;
            const asigSemanas = semanas;
            const mappedPractices = misPracticas.map((pRow) => {
              const prNombre = getPracticeName(pRow) || asigNombre;
              const prId = getPracticeId(pRow) || readColumn(pRow, "id_practica", "id") || val(pRow, "id") || prNombre;
              const escId = getScenarioId(pRow);
              const escName = resolveScenarioName(getScenarioName(pRow), escId);
              return {
                id: readColumn(pRow, "id") || val(pRow, "id") || prId,
                id_practica: prId,
                nombre_practica: prNombre,
                id_escenario: escId,
                nombre_escenario: escName,
                numero_semanas: getPracticeWeeks(pRow, 0),
              };
            });
            const distributedPractices = distributeWeeksToPractices(mappedPractices, asigSemanas);
            asignaturasRaw.push({
              id: asigId,
              id_programa: idPrograma,
              numero_periodo: pVal,
              nombre_asignatura: asigNombre,
              numero_semanas: asigSemanas,
              practicas: distributedPractices,
            });
          }
        });

        let mergedAsignaturas = asignaturasRaw;
        if (Array.isArray(asignaturasData) && asignaturasData.length > 0) {
          const cfgProg = asignaturasData.filter(matchesProgram);
          if (cfgProg.length > 0) {
            const cfgKeys = new Set(
              cfgProg.map((s) => `${s.numero_periodo}___${String(s.nombre_asignatura).trim().toLowerCase()}`),
            );
            const remaining = mergedAsignaturas.filter(
              (s) => !cfgKeys.has(`${s.numero_periodo}___${String(s.nombre_asignatura).trim().toLowerCase()}`),
            );
            mergedAsignaturas = [
              ...cfgProg.map((s) => ({
                ...s,
                numero_semanas: Number(s.numero_semanas) || semanas,
                practicas: distributeWeeksToPractices(
                  (s.practicas || []).map((p, idx) => {
                    const escId = getScenarioId(p) || p.id_escenario || "";
                    const escName = resolveScenarioName(getScenarioName(p) || p.nombre_escenario, escId);
                    return {
                      ...p,
                      id_practica: getPracticeId(p) || p.id_practica || p.idPractica || p.id || `PRAC-${idx + 1}`,
                      nombre_practica: getPracticeName(p) || p.nombre_practica || p.nombrePractica || s.nombre_asignatura,
                      id_escenario: escId,
                      nombre_escenario: escName,
                      numero_semanas: Number(p.numero_semanas) || 0,
                    };
                  }),
                  Number(s.numero_semanas) || semanas,
                ),
              })),
              ...remaining,
            ];
          }
        }

        setSubjects(mergedAsignaturas);

        setBlocks(
          (e.data || [])
            .filter(matchesProgram)
            .map((x) => {
              let numPerB = periodNumber(getPeriodRaw(x));
              if (esAnual && totalPeriodos > 0 && numPerB > totalPeriodos) {
                numPerB = Math.ceil(numPerB / 2);
              }
              const asigId = val(x, "id_asignatura") || x.id_asignatura;
              const asigNombre = getSubjectName(x) || val(x, "nombre_asignatura") || x.nombre_asignatura;
              const prId = getPracticeId(x) || val(x, "id_practica") || "";
              const prNombre = getPracticeName(x) || val(x, "nombre_practica") || "";
              const escId = getScenarioId(x) || val(x, "id_escenario") || "";
              const escNombre = getScenarioName(x) || val(x, "nombre_escenario") || "";
              const itemKey = prId ? `${asigId}-${prId}` : asigId;
              return {
                ...x,
                id: val(x, "id") || x.id,
                id_item: itemKey,
                id_programa: idPrograma,
                numero_periodo: numPerB,
                id_asignatura: asigId,
                nombre_asignatura: asigNombre,
                id_practica: prId,
                nombre_practica: prNombre,
                id_escenario: escId,
                nombre_escenario: escNombre,
                numero_semanas: Number(val(x, "numero_semanas") || x.numero_semanas) || 1,
                numero_fila: Number(val(x, "numero_fila") || x.numero_fila) || 1,
                semana_inicio: Number(val(x, "semana_inicio") || x.semana_inicio) || 1,
                semana_fin: Number(val(x, "semana_fin") || x.semana_fin) || 1,
                localId: val(x, "id") || x.id || `placed-${Date.now()}-${Math.random()}`,
                isPlacedBlock: true,
              };
            }),
        );
      })
      .catch(() => active && setError("No se pudieron cargar los datos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, idPrograma, practicasData]);

  const subjectsFor = (p) =>
    subjects.filter((x) => Number(x.numero_periodo) === Number(p));

  const blocksFor = (p) =>
    blocks.filter((x) => Number(x.numero_periodo) === Number(p));

  const removeBlock = (blockToRemove) => {
    setBlocks((old) =>
      old.filter(
        (b) =>
          b !== blockToRemove &&
          b.localId !== blockToRemove.localId &&
          !(b.id && blockToRemove.id && String(b.id) === String(blockToRemove.id)),
      ),
    );
  };

  const isSubjectMatch = (block, subject) => {
    if (!block || !subject) return false;
    if (block.id_asignatura && subject.id && String(block.id_asignatura) === String(subject.id)) return true;
    const bName = String(block.nombre_asignatura || "").trim().toLowerCase();
    const sName = String(subject.nombre_asignatura || "").trim().toLowerCase();
    return Boolean(bName && sName && bName === sName);
  };

  const getSubjectLines = (s, period) => {
    const sBlocks = blocksFor(period).filter((b) => isSubjectMatch(b, s));
    const maxFila = sBlocks.reduce((max, b) => Math.max(max, Number(b.numero_fila) || 1), 1);
    const userExtra = extraLinesBySubject[s.id] || 0;
    const totalLines = Math.max(maxFila, 1 + userExtra);
    return Array.from({ length: totalLines }, (_, i) => i + 1);
  };

  const addLineToSubject = (sId) => {
    setExtraLinesBySubject((prev) => ({
      ...prev,
      [sId]: (prev[sId] || 0) + 1,
    }));
  };

  const isSamePlacedItem = (a, b) => {
    if (!a || !b) return false;
    if (a.localId && b.localId && String(a.localId) === String(b.localId)) return true;
    const aPr = String(a.id_practica || "").trim().toLowerCase();
    const bPr = String(b.id_practica || "").trim().toLowerCase();
    if (aPr || bPr) {
      return Boolean(aPr && bPr && aPr === bPr && isSubjectMatch(a, b));
    }
    if (a.id_item && b.id_item && String(a.id_item) === String(b.id_item)) return true;
    return isSubjectMatch(a, b);
  };

  const canPlaceOnSubject = (item, period, targetSubject, line, startWeek) => {
    const duration = Number(item.numero_semanas) || 1;
    const first = Math.max(1, Math.min(startWeek, semanas - duration + 1));
    const last = first + duration - 1;

    return !blocksFor(period).some((b) => {
      if (!isSubjectMatch(b, targetSubject)) return false;
      if (Number(b.numero_fila || 1) !== line) return false;
      if (isSamePlacedItem(b, item)) return false;

      return Number(b.semana_inicio) <= last && Number(b.semana_fin) >= first;
    });
  };

  const placeOnSubject = (item, period, targetSubject, line, startWeek) => {
    const duration = Number(item.numero_semanas) || 1;
    const first = Math.max(1, Math.min(startWeek, semanas - duration + 1));
    const last = first + duration - 1;
    const existingRowId = item.isPlacedBlock ? item.id : "";
    const itemKey = item.id_practica
      ? `${targetSubject.id}-${item.id_practica}`
      : (item.id_item || targetSubject.id);

    const block = {
      ...item,
      id: existingRowId,
      isPlacedBlock: true,
      id_item: itemKey,
      localId: `${itemKey}-${period}-${line}-${startWeek}-${Date.now()}`,
      id_programa: idPrograma,
      id_asignatura: targetSubject.id,
      id_practica: item.id_practica || "",
      nombre_practica: item.nombre_practica || (item.id_practica ? item.nombre_asignatura : ""),
      id_escenario: item.id_escenario || "",
      nombre_escenario: item.nombre_escenario || "",
      periodicidad,
      total_periodos: totalPeriodos,
      numero_periodo: period,
      semanas_periodo: semanas,
      nombre_asignatura: targetSubject.nombre_asignatura,
      numero_semanas: duration,
      numero_fila: line,
      semana_inicio: first,
      semana_fin: last,
      orden_fila: line,
      color: item.color || color(targetSubject.id),
    };

    setBlocks((old) => [
      ...old.filter((x) => {
        if (Number(x.numero_periodo) !== Number(period)) return true;
        return !isSamePlacedItem(x, block);
      }),
      block,
    ]);
    setDrag(null);
  };

  const autoPlace = (item, period, targetSubject) => {
    const lines = getSubjectLines(targetSubject, period);
    const duration = Number(item.numero_semanas) || 1;
    for (const line of lines) {
      const sBlocks = blocksFor(period).filter(
        (b) => isSubjectMatch(b, targetSubject) && Number(b.numero_fila || 1) === line,
      );
      const maxEnd = sBlocks.reduce((acc, b) => Math.max(acc, Number(b.semana_fin) || 0), 0);
      const startCandidate = maxEnd + 1;
      if (startCandidate + duration - 1 <= semanas) {
        placeOnSubject(item, period, targetSubject, line, startCandidate);
        return;
      }
    }
    const newLine = lines.length + 1;
    addLineToSubject(targetSubject.id);
    placeOnSubject(item, period, targetSubject, newLine, 1);
  };

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const newBlocks = Array.from(
        new Map(
          blocks
            .map((x) => [
              [
                x.id_asignatura,
                x.id_practica || "",
                x.numero_periodo,
                x.numero_fila || 1,
                x.semana_inicio,
                x.semana_fin,
              ].join("|"),
              x,
            ]),
        ).values(),
      );
      const existing = newBlocks.filter((x) => x.id);
      const inserted = newBlocks.filter((x) => !x.id);
      await Promise.all(
        existing.map((x) =>
          fetchPostGeneral({
            dataSend: {
              updateData: [
                x.id,
                idPrograma,
                x.id_asignatura,
                periodicidad,
                totalPeriodos,
                x.numero_periodo,
                semanas,
                x.nombre_asignatura,
                x.numero_semanas,
                x.numero_fila || 1,
                x.semana_inicio,
                x.semana_fin,
                x.orden_fila || 1,
                x.color,
                x.id_practica || "",
                x.nombre_practica || "",
                x.id_escenario || "",
                x.nombre_escenario || "",
              ],
              id: x.id,
            },
            sheetName: "ESQUEMAS",
            urlEndPoint: `${URL}/updatePractice`,
          }),
        ),
      );
      const rowsToInsert = inserted.map((x) => [
        `${idPrograma}-${x.id_asignatura}-${x.numero_periodo}-${x.numero_fila || 1}-${x.semana_inicio}-${Date.now()}`,
        idPrograma,
        x.id_asignatura,
        periodicidad,
        totalPeriodos,
        x.numero_periodo,
        semanas,
        x.nombre_asignatura,
        x.numero_semanas,
        x.numero_fila || 1,
        x.semana_inicio,
        x.semana_fin,
        x.orden_fila || 1,
        x.color,
        x.id_practica || "",
        x.nombre_practica || "",
        x.id_escenario || "",
        x.nombre_escenario || "",
      ]);
      if (!rowsToInsert.length) {
        clearCache();
        onSaved?.();
        if (!embedded) onClose?.();
        return;
      }
      const response = await fetchPostGeneral({
        dataSend: { insertData: rowsToInsert },
        sheetName: "ESQUEMAS",
        urlEndPoint: `${URL}/sendDocServ`,
      });
      if (!response?.status) throw Error();
      clearCache();
      onSaved?.();
      if (!embedded) onClose?.();
    } catch {
      setError("No se pudo guardar el esquema.");
    } finally {
      setSaving(false);
    }
  };
  const Wrapper = embedded ? Box : Dialog;
  const wrapperProps = embedded
    ? { sx: { width: "100%", boxSizing: "border-box", border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden" } }
    : { open, onClose, fullWidth: true, maxWidth: "xl" };

  return (
    <Wrapper {...wrapperProps}>
      <DialogTitle>Esquema de prácticas</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
          <Typography>
            Periodicidad: <b>{periodicidad || "-"}</b>
          </Typography>
          <Typography>
            Duración: <b>{duracion || "-"}</b>
          </Typography>
          <Typography>
            Periodos: <b>{totalPeriodos || "-"}</b>
          </Typography>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <>
            <Tabs
              value={periodoActivo}
              onChange={(_, value) => setPeriodoActivo(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              {periodosTabs.map((pNum) => (
                <Tab key={pNum} label={`${labelPrefix} ${toRoman(pNum)}`} />
              ))}
            </Tabs>
            {(() => {
              const p = periodosTabs[periodoActivo] || periodosTabs[0] || 1;
              const assigned = blocksFor(p);
              const currentSubjects = subjectsFor(p);

              // Generar fichas disponibles para ubicar
              const availableItems = [];
              currentSubjects.forEach((s) => {
                const sPractices = s.practicas || [];
                if (sPractices.length > 0) {
                  sPractices.forEach((pr, prIdx) => {
                    const prId = String(pr.id_practica || pr.idPractica || pr.id || `PRAC-${prIdx + 1}`).trim();
                    const prNombre = pr.nombre_practica || pr.nombrePractica || "Práctica";
                    const itemKey = `${s.id}-${prId}`;
                    const isAlreadyAssigned = assigned.some((b) => {
                      if (!isSubjectMatch(b, s)) return false;
                      const bPrId = String(b.id_practica || "").trim();
                      if (prId && bPrId) {
                        return bPrId.toLowerCase() === prId.toLowerCase();
                      }
                      if (b.id_item && String(b.id_item) === String(itemKey)) {
                        return true;
                      }
                      return (
                        !prId &&
                        !bPrId &&
                        b.nombre_practica &&
                        prNombre &&
                        String(b.nombre_practica).trim().toLowerCase() ===
                          String(prNombre).trim().toLowerCase()
                      );
                    });
                    if (!isAlreadyAssigned) {
                      const escName = resolveScenarioName(pr.nombre_escenario, pr.id_escenario);
                      const escPart = escName ? `: ${escName}` : "";
                      const prWeeks = Number(pr.numero_semanas) || Number(s.numero_semanas) || 1;
                      const semPart = `${prWeeks} sem.`;
                      const label = `${prNombre}${escPart} - ${semPart}`;
                      availableItems.push({
                        ...s,
                        id: "",
                        localId: "",
                        isPlacedBlock: false,
                        targetSubject: s,
                        id_item: itemKey,
                        id_asignatura: s.id,
                        id_practica: prId,
                        nombre_practica: prNombre,
                        id_escenario: pr.id_escenario || "",
                        nombre_escenario: escName,
                        numero_semanas: prWeeks,
                        color: color(s.id),
                        labelDisplay: label,
                      });
                    }
                  });
                } else {
                  const isAlreadyAssigned = assigned.some((b) => isSubjectMatch(b, s));
                  if (!isAlreadyAssigned) {
                    availableItems.push({
                      ...s,
                      id: "",
                      localId: "",
                      isPlacedBlock: false,
                      targetSubject: s,
                      id_item: s.id,
                      id_asignatura: s.id,
                      id_practica: "",
                      nombre_practica: "",
                      numero_semanas: Number(s.numero_semanas) || 1,
                      color: color(s.id),
                      labelDisplay: `${s.nombre_asignatura} (${s.numero_semanas || 1} sem.)`,
                    });
                  }
                }
              });

              return (
                <Box
                  sx={{
                    backgroundColor: assigned.length ? "#e8f5e9" : "#f2f2f2",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {labelPrefix} {toRoman(p)}: {semanas} semanas de actividades
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Haz clic en una práctica para ubicarla automáticamente o arrástrala a la semana deseada
                    </Typography>
                  </Box>

                  <Box sx={{ overflowX: "auto", mb: 2 }}>
                    <Box
                      sx={{
                        minWidth: 980,
                        display: "grid",
                        gridTemplateColumns: `230px repeat(${semanas}, minmax(26px, 1fr))`,
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      {/* Cabecera */}
                      <Box
                        sx={{
                          p: 1,
                          fontWeight: 700,
                          fontSize: 12,
                          backgroundColor: "#eceff1",
                          borderRight: "2px solid #bbb",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Asignatura
                      </Box>
                      {Array.from({ length: semanas }, (_, w) => (
                        <Box
                          key={w}
                          sx={{
                            textAlign: "center",
                            fontSize: 11,
                            fontWeight: 600,
                            py: 0.75,
                            backgroundColor: "#eceff1",
                            borderLeft: "1px solid #ddd",
                            borderBottom: "1px solid #bbb",
                          }}
                        >
                          {w + 1}
                        </Box>
                      ))}

                      {/* Filas por Asignatura */}
                      {currentSubjects.length === 0 ? (
                        <Box
                          sx={{
                            gridColumn: `1 / span ${semanas + 1}`,
                            p: 3,
                            textAlign: "center",
                            color: "text.secondary",
                          }}
                        >
                          No hay asignaturas registradas para este período.
                        </Box>
                      ) : (
                        currentSubjects.map((s) => {
                          const lines = getSubjectLines(s, p);
                          return lines.map((lineIdx) => (
                            <React.Fragment key={`${s.id}-${lineIdx}`}>
                              {/* Tarjeta lateral de la asignatura */}
                              <Box
                                sx={{
                                  p: 1,
                                  borderTop: "1px solid #ddd",
                                  borderRight: "2px solid #bbb",
                                  backgroundColor: "#fafafa",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1,
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor: color(s.id),
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box sx={{ overflow: "hidden" }}>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: 12,
                                        lineHeight: 1.2,
                                        color: "#111",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={s.nombre_asignatura}
                                    >
                                      {s.nombre_asignatura}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: 10, color: "text.secondary" }}>
                                      {s.numero_semanas || semanas} sem. {lines.length > 1 ? `(Línea ${lineIdx})` : ""}
                                    </Typography>
                                  </Box>
                                </Box>
                                {lineIdx === 1 && (
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => addLineToSubject(s.id)}
                                    title="Agregar línea simultánea para esta asignatura"
                                    sx={{
                                      minWidth: "auto",
                                      p: "2px 4px",
                                      fontSize: 10,
                                      textTransform: "none",
                                      color: "text.secondary",
                                      "&:hover": { color: "primary.main", backgroundColor: "rgba(0,0,0,0.05)" },
                                    }}
                                  >
                                    + Línea
                                  </Button>
                                )}
                              </Box>

                              {/* Celdas de semanas para esta asignatura */}
                              {Array.from({ length: semanas }, (_, w) => {
                                const weekNum = w + 1;
                                const b = assigned.find(
                                  (x) =>
                                    isSubjectMatch(x, s) &&
                                    Number(x.numero_fila || 1) === lineIdx &&
                                    weekNum >= Number(x.semana_inicio) &&
                                    weekNum <= Number(x.semana_fin),
                                );
                                const middle =
                                  b &&
                                  weekNum ===
                                    Math.ceil(
                                      (Number(b.semana_inicio) +
                                        Number(b.semana_fin)) /
                                        2,
                                    );
                                const blockLabel = b
                                  ? `${b.nombre_practica || b.nombre_asignatura}${
                                      b.id_practica && (s.practicas || []).length > 1 ? ` (${b.id_practica})` : ""
                                    }`
                                  : "";
                                const fullTitle = b
                                  ? `${b.nombre_practica || b.nombre_asignatura}${b.nombre_escenario ? ` (${b.nombre_escenario})` : ""} [Sem. ${b.semana_inicio}-${b.semana_fin}]`
                                  : "";

                                return (
                                  <Box
                                    key={w}
                                    title={fullTitle}
                                    draggable={Boolean(b)}
                                    onDragStart={() => b && setDrag({ ...b, targetSubject: s })}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => {
                                      if (drag) {
                                        if (drag.targetSubject && !isSubjectMatch(drag.targetSubject, s)) {
                                          return;
                                        }
                                        if (canPlaceOnSubject(drag, p, s, lineIdx, weekNum)) {
                                          placeOnSubject(drag, p, s, lineIdx, weekNum);
                                        }
                                      }
                                    }}
                                    sx={{
                                      minHeight: 44,
                                      borderTop: "1px solid #ddd",
                                      borderLeft: "1px solid #eee",
                                      backgroundColor: b ? (b.color || color(s.id)) : "transparent",
                                      fontSize: 10,
                                      overflow: middle ? "visible" : "hidden",
                                      whiteSpace: "nowrap",
                                      textAlign: "center",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "relative",
                                      zIndex: middle ? 2 : 1,
                                      cursor: b ? "grab" : "pointer",
                                      px: 0.25,
                                      transition: "background-color 0.15s",
                                      "&:hover": {
                                        backgroundColor: b ? undefined : "rgba(0,0,0,0.04)",
                                      },
                                    }}
                                  >
                                    {middle && (
                                      <Box
                                        sx={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          px: 0.5,
                                          maxWidth: "100%",
                                          backgroundColor: "rgba(255,255,255,0.92)",
                                          borderRadius: 1,
                                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                          border: "1px solid rgba(0,0,0,0.12)",
                                        }}
                                      >
                                        <Typography
                                          component="span"
                                          sx={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "#111",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {blockLabel}
                                        </Typography>
                                        <Box
                                          component="span"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeBlock(b);
                                          }}
                                          title="Quitar de la línea"
                                          sx={{
                                            ml: 0.5,
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            fontSize: 13,
                                            color: "rgba(0,0,0,0.6)",
                                            borderRadius: "50%",
                                            width: 16,
                                            height: 16,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            "&:hover": {
                                              backgroundColor: "rgba(0,0,0,0.15)",
                                              color: "error.main",
                                            },
                                          }}
                                        >
                                          ×
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                );
                              })}
                            </React.Fragment>
                          ));
                        })
                      )}
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 600 }}>
                    Prácticas disponibles para ubicar en su asignatura
                  </Typography>
                  {availableItems.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      Todas las prácticas de este período ya han sido ubicadas en el esquema.
                    </Typography>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                      {availableItems.map((item, idx) => (
                        <Box
                          key={`${item.id_item || item.id}-${idx}`}
                          draggable
                          onDragStart={() => setDrag(item)}
                          onClick={() => autoPlace(item, p, item.targetSubject)}
                          title="Haz clic para ubicar automáticamente o arrastra a la semana deseada"
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            cursor: "pointer",
                            backgroundColor: item.color || color(item.id_asignatura || item.id),
                            fontSize: 12,
                            fontWeight: 500,
                            boxShadow: 1,
                            userSelect: "none",
                            "&:hover": {
                              opacity: 0.9,
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          {item.labelDisplay}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onBack} disabled={saving}>Atrás</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={save}
          disabled={saving || loading}
        >
          {saving ? "Guardando..." : "Guardar y continuar a Horarios"}
        </Button>
      </DialogActions>
    </Wrapper>
  );
}
