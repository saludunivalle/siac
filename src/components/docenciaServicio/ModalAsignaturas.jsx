import React, { useEffect, useMemo, useState } from "react";
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
  IconButton,
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

const getPeriodCount = (periodicidad, duracion) => {
  const amount = getNumber(duracion);
  const context = `${periodicidad || ""} ${duracion || ""}`;
  const durationIsSemesters = /sem/i.test(context);
  const isAnnual = /anual/i.test(context);

  if (durationIsSemesters && isAnnual) return Math.ceil(amount / 2);
  if (!durationIsSemesters && !isAnnual) return amount * 2;
  return amount || 1;
};

const getPeriodWeeks = (periodicidad, duracion) => {
  const pStr = String(periodicidad || "");
  const dStr = String(duracion || "");
  if (/anual/i.test(pStr) || /anual/i.test(dStr)) return 48;
  if (/sem/i.test(pStr) || /sem/i.test(dStr)) return 18;
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
  return parsed || (Number(value) || 0);
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
    row["NOMBRE DE LA ASIGNATURA A LA QUE PERTENECE LA PRÁCTICA FORMATIVA O ROTACIÓN"] ||
      row["nombre de la asignatura a la que pertenece la práctica formativa o rotación"] ||
      row["nombre de la asignatura a la que pertenece la practica formativa o rotacion"] ||
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

const normalizePractice = (row) => {
  const ra = String(readColumn(row, "Resultados de Aprendizaje (RA)", "resultados_aprendizaje") || "");
  return {
    localId: `practice-${readColumn(row, "id") || Date.now()}-${Math.random()}`,
    id: readColumn(row, "id"),
    idPractica: readColumn(row, "ID Práctica", "id_practica"),
    nombrePractica: readColumn(row, "NOMBRE DE LA PRÁCTICA FORMATIVA O ROTACIÓN", "nombre_practica"),
    competencias: readColumn(row, "Competencias", "competencias"),
    resultadosAprendizaje: ra
      .split(/\r?\n/)
      .map((item) => item.replace(/^\s*\d+\s*[-.)]\s*/, "").trim())
      .filter(Boolean),
    numeroActividades: readColumn(row, "Número actividades para RA", "numero_actividades"),
    evaluacion: readColumn(row, "Evaluacion", "evaluacion"),
  };
};

export default function ModalAsignaturas({
  open,
  onClose,
  onBack,
  programa,
  practicasData,
  onSaved,
  embedded = false,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [periodoActivo, setPeriodoActivo] = useState(0);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [practicasList, setPracticasList] = useState([]);
  const [allPracticasList, setAllPracticasList] = useState([]);

  const periodicidad = getProgramField(programa, "periodicidad");
  const duracion = getProgramField(programa, "duracion", "duracion_programa", "duración");
  const totalPeriodos = useMemo(
    () => getPeriodCount(periodicidad, duracion),
    [periodicidad, duracion],
  );
  const semanasPeriodo = getPeriodWeeks(periodicidad, duracion);
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
      if (Array.isArray(practicasData) && practicasData.length > 0) {
        return practicasData;
      }
      try {
        const response = await axios.post(
          "https://siac-server.vercel.app/docServ",
          { sheetName: "PRACTICAS" },
        );
        if (response.data && response.data.status && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      } catch (err) {
        console.warn("No se pudieron cargar prácticas formativas:", err);
      }
      return [];
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
          ).trim().toLowerCase();
          return pId === idProgStr;
        });
        setPracticasList(practicasDelPrograma);
        const practicesForSubject = (name) => practicasDelPrograma
          .filter((practice) => getSubjectName(practice).trim().toLowerCase() === String(name || "").trim().toLowerCase())
          .map(normalizePractice);

        // 1. Asignaturas ya existentes en la BD para este programa
        const existingRows = data
          .filter((item) => String(readColumn(item, "id_programa", "ID_PROGRAMA") || "").trim().toLowerCase() === idProgStr)
          .map((item) => ({
            ...item,
            id: readColumn(item, "id") || item.id,
            id_programa: readColumn(item, "id_programa", "ID_PROGRAMA") || item.id_programa,
            numero_periodo: periodNumber(readColumn(item, "numero_periodo", "PERÍODO ACADÉMICO", "periodo")),
            nombre_asignatura: readColumn(item, "nombre_asignatura", "NOMBRE DE LA ASIGNATURA") || item.nombre_asignatura,
            localId: readColumn(item, "id") || item.id || `${Date.now()}-${Math.random()}`,
            numero_semanas: readColumn(item, "numero_semanas") || item.numero_semanas || semanasPeriodo,
            practicas: practicesForSubject(readColumn(item, "nombre_asignatura", "NOMBRE DE LA ASIGNATURA") || item.nombre_asignatura),
          }));

        // 2. Extraer asignaturas de la hoja PRACTICAS para este programa
        const practicasDelProg = practicasDelPrograma;

        const seenKeys = new Set();
        const practicasRowsToAdd = [];

        practicasDelProg.forEach((p) => {
          const nombreAsig = getSubjectName(p);
          const rawPeriodo = getPeriodoRaw(p);
          const periodoNum = parsePeriodoToNumber(rawPeriodo);
          if (!nombreAsig || !periodoNum) return;

          const dedupeKey = `${periodoNum}___${nombreAsig.toLowerCase()}`;
          if (seenKeys.has(dedupeKey)) return;
          seenKeys.add(dedupeKey);

          // Verificar si ya existe en existingRows
          const yaExiste = existingRows.some(
            (r) =>
              periodNumber(r.numero_periodo) === Number(periodoNum) &&
              String(r.nombre_asignatura || "").trim().toLowerCase() === nombreAsig.toLowerCase(),
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
              practicas: practicesForSubject(nombreAsig),
            });
          }
        });

        const mergedRows = [...existingRows, ...practicasRowsToAdd];
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

  // Períodos que tienen asignaturas (desde prácticas o existentes)
  const periodosConAsignaturas = useMemo(() => {
    const set = new Set(rows.map((r) => periodNumber(r.numero_periodo)).filter(Boolean));
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

  // Lista de años a mostrar en las pestañas:
  // Si no tenemos datos de asignaturas en PRACTICAS, se dejan la cantidad de períodos (pestañas) que se calculaban de la anterior manera: totalPeriodos
  const periodosTabs = useMemo(() => {
    if (periodosConAsignaturas.length === 0) {
      return Array.from({ length: totalPeriodos || 1 }, (_, i) => i + 1);
    }
    if (mostrarTodos) {
      const maxPeriod = Math.max(totalPeriodos || 1, ...periodosConAsignaturas);
      return Array.from({ length: maxPeriod }, (_, i) => i + 1);
    }
    return periodosConAsignaturas;
  }, [mostrarTodos, periodosConAsignaturas, totalPeriodos]);

  // Período numérico seleccionado actualmente
  const periodoActualNum = periodosTabs[periodoActivo] || periodosTabs[0] || 1;

  const rowsForPeriod = (period) =>
    rows.filter((row) => periodNumber(row.numero_periodo) === periodNumber(period));

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
    setRows((current) => current.map((row) => row.localId !== rowLocalId
      ? row
      : { ...row, practicas: (row.practicas || []).map((practice) => practice.localId === practiceLocalId
        ? { ...practice, [field]: value }
        : practice) }));

  const addPractice = (row) => {
    const periodLabel = getPeriodoRoman(row.numero_periodo);
    const used = (row.practicas || []).length + 1;
    const practice = {
      localId: `practice-new-${Date.now()}-${Math.random()}`,
      id: "",
      idPractica: `PRAC-${periodLabel}-${String(used).padStart(2, "0")}`,
      nombrePractica: row.nombre_asignatura || "",
      competencias: "",
      resultadosAprendizaje: [""],
      numeroActividades: "",
      evaluacion: "",
    };
    setRows((current) => current.map((item) => item.localId === row.localId
      ? { ...item, practicas: [...(item.practicas || []), practice] }
      : item));
  };

  const removePractice = (rowLocalId, practiceLocalId) =>
    setRows((current) => current.map((row) => row.localId !== rowLocalId
      ? row
      : { ...row, practicas: (row.practicas || []).filter((practice) => practice.localId !== practiceLocalId) }));

  const updatePracticeResult = (rowLocalId, practiceLocalId, index, value) =>
    setRows((current) => current.map((row) => row.localId !== rowLocalId
      ? row
      : { ...row, practicas: (row.practicas || []).map((practice) => {
        if (practice.localId !== practiceLocalId) return practice;
        const resultados = [...(practice.resultadosAprendizaje || [])];
        resultados[index] = value;
        return { ...practice, resultadosAprendizaje: resultados };
      }) }));

  const autocompletadasCount = useMemo(
    () => rows.filter((r) => r.fromPracticas).length,
    [rows],
  );

  const handleSave = async () => {
    setError("");
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
      const insertData = validRows.map((row) => assignmentValues(row,
        row.id ||
          `${idPrograma}-${row.numero_periodo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ));
      const existingRows = rows.filter((row) => row.id && row.nombre_asignatura?.trim());
      const [response, ...updateResponses] = await Promise.all([
        insertData.length
          ? fetchPostGeneral({
              dataSend: { insertData },
              sheetName: "ASIGNATURAS",
              urlEndPoint: "https://siac-server.vercel.app/sendDocServ",
            })
          : Promise.resolve({ status: true }),
        ...existingRows.map((row) => fetchPostGeneral({
          dataSend: { updateData: assignmentValues(row, row.id), id: row.id },
          sheetName: "ASIGNATURAS",
          urlEndPoint: "https://siac-server.vercel.app/updatePractice",
        })),
      ]);
      if (!response?.status || updateResponses.some((item) => !item?.status)) throw new Error("save");

      let nextPracticeId = Math.max(0, ...allPracticasList.map((item) => Number(readColumn(item, "id")) || 0)) + 1;
      const usedPracticeCodes = new Set(allPracticasList.map((item) => String(readColumn(item, "ID Práctica", "id_practica") || "")));
      const practicesToSave = rows.flatMap((row) => (row.practicas || []).map((practice) => {
        const periodLabel = getPeriodoRoman(row.numero_periodo);
        let sequence = 1;
        let code = practice.idPractica || `PRAC-${periodLabel}-${String(sequence).padStart(2, "0")}`;
        while (!practice.id && usedPracticeCodes.has(code)) {
          sequence += 1;
          code = `PRAC-${periodLabel}-${String(sequence).padStart(2, "0")}`;
        }
        usedPracticeCodes.add(code);
        const id = practice.id || nextPracticeId++;
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
            practice.numeroActividades || "",
            practice.evaluacion || "",
          ],
        };
      }));
      const newPractices = practicesToSave.filter((item) => !item.practice.id);
      const existingPractices = practicesToSave.filter((item) => item.practice.id);
      if (newPractices.length) {
        const practiceResponse = await fetchPostGeneral({
          dataSend: { insertData: newPractices.map((item) => item.values) },
          sheetName: "PRACTICAS",
          urlEndPoint: "https://siac-server.vercel.app/sendDocServ",
        });
        if (!practiceResponse?.status) throw new Error("practice-save");
      }
      if (existingPractices.length) {
        const practiceResponses = await Promise.all(existingPractices.map((item) => fetchPostGeneral({
          dataSend: { updateData: item.values, id: item.practice.id },
          sheetName: "PRACTICAS",
          urlEndPoint: "https://siac-server.vercel.app/updatePractice",
        })));
        if (practiceResponses.some((item) => !item?.status)) throw new Error("practice-update");
      }
      clearCache();
      onSaved?.();
      if (!embedded) onClose?.();
    } catch {
      setError("No se pudieron guardar las asignaturas.");
    } finally {
      setSaving(false);
    }
  };

  const Wrapper = embedded ? Box : Dialog;
  const wrapperProps = embedded
    ? { sx: { width: "100%", boxSizing: "border-box", border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden" } }
    : { open, onClose, fullWidth: true, maxWidth: "md" };

  return (
    <Wrapper {...wrapperProps}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Asignaturas de {programa?.["programa académico"] || "programa"}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
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
                ? periodosConAsignaturas.map((p) => getPeriodoDisplay(p)).join(", ")
                : "Sin prácticas registradas"}
            </strong>
          </Typography>
          <Typography variant="body2">
            Semanas por año: <strong>{semanasPeriodo}</strong>
          </Typography>
        </Stack>

        {autocompletadasCount > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Se autocompletaron {autocompletadasCount} asignatura(s) con {semanasPeriodo} semanas
              (según la periodicidad {periodicidad || "del programa"}) desde la hoja de prácticas:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 0.5 }}>
              {rows
                .filter((r) => r.fromPracticas)
                .map((r) => (
                  <li key={r.localId}>
                    <strong>Año {getPeriodoDisplay(r.numero_periodo)}:</strong> {r.nombre_asignatura} ({r.numero_semanas} semanas)
                  </li>
                ))}
            </Box>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography sx={{ py: 3, textAlign: "center" }}>Cargando asignaturas...</Typography>
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {mostrarTodos
                  ? `Mostrando todos los años (1 a ${periodosTabs.length})`
                  : `Mostrando años con prácticas (${periodosTabs.map((p) => getPeriodoDisplay(p)).join(", ")})`}
              </Typography>
              {periodosConAsignaturas.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setMostrarTodos((prev) => !prev);
                    setPeriodoActivo(0);
                  }}
                  sx={{ textTransform: "none", fontSize: "0.8rem" }}
                >
                  {mostrarTodos
                    ? `Ver solo con prácticas (${periodosConAsignaturas.length})`
                    : `Ver todos los años (${totalPeriodos || periodosTabs.length})`}
                </Button>
              )}
            </Box>

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
                    label={`Año ${labelPeriodo}${count > 0 ? ` (${count})` : ""}`}
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
                      Año {labelActual}: {semanasPeriodo} semanas
                    </Typography>
                    {tieneAsignaturas ? (
                      <Chip
                        label={`${periodRows.length} asignatura(s)`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
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
                      <Box key={row.localId} sx={{ mb: 1.5 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems={{ sm: "center" }}
                        sx={{
                          p: 1.5,
                          backgroundColor: "#ffffff",
                          borderRadius: 1,
                          border: "1px solid #cfd8dc",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
                        {row.fromPracticas && (
                          <Chip
                            label="De prácticas"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                          />
                        )}
                        <IconButton
                          color="error"
                          onClick={() => removeRow(row.localId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                      <Accordion sx={{ mt: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ fontWeight: 600 }}>
                            Prácticas formativas ({(row.practicas || []).length})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {(row.practicas || []).map((practice) => (
                            <Box key={practice.localId} sx={{ mb: 2, p: 1.5, border: "1px solid #cfd8dc", borderRadius: 1 }}>
                              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 1.5 }}>
                                <TextField size="small" label="ID práctica" value={practice.idPractica || ""} InputProps={{ readOnly: true }} sx={{ minWidth: 150 }} />
                                <TextField
                                  fullWidth size="small" label="Nombre de la práctica formativa o rotación"
                                  value={practice.nombrePractica || ""}
                                  onChange={(event) => updatePractice(row.localId, practice.localId, "nombrePractica", event.target.value)}
                                />
                                <TextField
                                  size="small" type="number" label="Número actividades para RA"
                                  value={practice.numeroActividades || ""}
                                  onChange={(event) => updatePractice(row.localId, practice.localId, "numeroActividades", event.target.value)}
                                  inputProps={{ min: 0 }} sx={{ minWidth: 190 }}
                                />
                                <IconButton color="error" onClick={() => removePractice(row.localId, practice.localId)}><DeleteIcon /></IconButton>
                              </Stack>
                              <TextField
                                fullWidth multiline minRows={2} size="small" label="Competencias"
                                value={practice.competencias || ""}
                                onChange={(event) => updatePractice(row.localId, practice.localId, "competencias", event.target.value)}
                                sx={{ mb: 1.5 }}
                              />
                              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Resultados de aprendizaje (RA)</Typography>
                              {(practice.resultadosAprendizaje || []).map((result, resultIndex) => (
                                <Stack key={`${practice.localId}-ra-${resultIndex}`} direction="row" spacing={1} sx={{ mb: 1 }}>
                                  <TextField
                                    fullWidth size="small" label={`RA ${resultIndex + 1}`} value={result}
                                    onChange={(event) => updatePracticeResult(row.localId, practice.localId, resultIndex, event.target.value)}
                                  />
                                  <IconButton
                                    color="error"
                                    onClick={() => updatePractice(row.localId, practice.localId, "resultadosAprendizaje", (practice.resultadosAprendizaje || []).filter((_, index) => index !== resultIndex))}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Stack>
                              ))}
                              <Button size="small" startIcon={<AddIcon />} onClick={() => updatePractice(row.localId, practice.localId, "resultadosAprendizaje", [...(practice.resultadosAprendizaje || []), ""])}>
                                Agregar RA
                              </Button>
                              <TextField
                                fullWidth multiline minRows={2} size="small" label="Evaluación"
                                value={practice.evaluacion || ""}
                                onChange={(event) => updatePractice(row.localId, practice.localId, "evaluacion", event.target.value)}
                                sx={{ mt: 1.5 }}
                              />
                            </Box>
                          ))}
                          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addPractice(row)}>
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
                      Agregar asignatura al Año {labelActual}
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
