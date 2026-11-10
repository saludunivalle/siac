import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  FormControlLabel,
  Stack,
  Select,
  TextField,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { clearCache, fetchPostGeneral } from "../../service/fetch";

const URL = "https://siac-server.vercel.app";
const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const HOURS = Array.from({ length: 13 }, (_, i) => `${i + 6}:00-${i + 7}:00`);
const emptySchedule = () => Object.fromEntries(DAYS.map((day) => [day, []]));
const valueOf = (obj, ...names) => {
  if (!obj) return "";
  const clean = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  for (const n of names) {
    const target = clean(n);
    const key = Object.keys(obj).find((k) => clean(k) === target);
    if (key && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== "") {
      return obj[key];
    }
  }
  for (const n of names) {
    const target = clean(n);
    if (target.length < 4) continue;
    const key = Object.keys(obj).find((k) => clean(k).includes(target));
    if (key && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== "") {
      return obj[key];
    }
  }
  return "";
};
const number = (value) => Number(String(value || "").match(/\d+/)?.[0]) || 0;
const periodNumber = (value) => {
  const raw = String(value || "").trim().toUpperCase();
  if (/^\d+$/.test(raw)) return Number(raw);
  const roman = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15 };
  const token = raw.split(/[\s\-_/.]+/).find((item) => roman[item] || /^\d+$/.test(item));
  return token ? (roman[token] || Number(token)) : 0;
};
const toRoman = (value) => ({ 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII", 13: "XIII", 14: "XIV", 15: "XV" }[Number(value)] || String(value));
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

export default function ModalHorarios({
  open,
  onClose,
  onBack,
  programa,
  escenariosData = [],
  periodosSeleccionados = [],
  onSaved,
  embedded = false,
  readOnly = false,
}) {
  const idPrograma = valueOf(programa, "id_programa", "idPrograma", "id");
  const periodicidad = valueOf(programa, "periodicidad", "periodicidad_admision");
  const duracion = valueOf(
    programa,
    "duracion_semestres",
    "duracion_programa",
    "duracion",
    "duración",
  );
  const totalPeriodos = periodCount(periodicidad, duracion);
  const esAnual = isAnualProgram(periodicidad, duracion);
  const labelPrefix = esAnual ? "Año" : "Semestre";
  const [blocks, setBlocks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedSchedule, setExpandedSchedule] = useState(null);
  const [ratios, setRatios] = useState({});
  const [benefitData, setBenefitData] = useState({});
  const ratioOptions = ["1:1", "1:4", "1:2", "1:8", "4:1"];
  const colors = useMemo(() => {
    const result = {};
    blocks.forEach((b, i) => {
      result[String(b.id_asignatura)] = `hsl(${(i * 137) % 360} 70% 78%)`;
    });
    return result;
  }, [blocks]);
  const colorFor = (subject) => {
    // Las respuestas de Google Sheets pueden traer espacios o variar el uso
    // de mayúsculas en el nombre de la columna.
    const colorKey = Object.keys(subject || {}).find(
      (key) => key.trim().toLowerCase() === "color",
    );
    const storedColor = colorKey ? String(subject[colorKey]).trim() : "";
    const id = String(subject?.id_asignatura ?? "");
    if (storedColor) return storedColor;
    if (colors[id]) return colors[id];
    // Nunca usar el mismo rojo para todas las asignaturas si una fila no trae
    // color: producir un color estable a partir del id de la asignatura.
    const hash = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
    return `hsl(${hash % 360} 70% 78%)`;
  };

  useEffect(() => {
    if (!open || !idPrograma) return;
    let active = true;
    setSelected({});
    setExpandedSchedule(null);
    setRatios({});
    setLoading(true);
    Promise.all([
      fetchPostGeneral({
        dataSend: {},
        sheetName: "ESQUEMAS",
        urlEndPoint: `${URL}/docServ`,
      }),
      fetchPostGeneral({
        dataSend: {},
        sheetName: "HORARIOS",
        urlEndPoint: `${URL}/docServ`,
      }),
      fetchPostGeneral({
        dataSend: {},
        sheetName: "ASIGNATURAS",
        urlEndPoint: `${URL}/docServ`,
      }),
      fetchPostGeneral({
        dataSend: {},
        sheetName: "RESUMEN_ASIGNATURAS",
        urlEndPoint: `${URL}/docServ`,
      }),
    ])
      .then(([e, h, a, summary]) => {
        if (!active) return;
        const esquemas = (e.data || [])
          .filter(
            (x) => String(valueOf(x, "id_programa", "idPrograma", "id")).trim() === String(idPrograma).trim(),
          )
          .map((row) => {
            let numPer = periodNumber(valueOf(row, "numero_periodo", "periodo"));
            if (esAnual && totalPeriodos > 0 && numPer > totalPeriodos) {
              numPer = Math.ceil(numPer / 2);
            }
            return {
              ...row,
              id: valueOf(row, "id") || row.id,
              id_programa: valueOf(row, "id_programa", "idPrograma", "id") || row.id_programa,
              id_asignatura: valueOf(row, "id_asignatura") || row.id_asignatura,
              nombre_asignatura: valueOf(row, "nombre_asignatura", "nombre de la asignatura") || row.nombre_asignatura,
              id_practica: valueOf(row, "id_practica", "id practica") || row.id_practica || "",
              nombre_practica: valueOf(row, "nombre_practica", "nombre de la practica") || row.nombre_practica || "",
              id_escenario: valueOf(row, "id_escenario", "idescenario") || row.id_escenario || "",
              nombre_escenario: valueOf(row, "nombre_escenario", "escenario") || row.nombre_escenario || "",
              numero_periodo: numPer,
            };
          });
        const horarios = (h.data || []).filter(
          (x) => String(valueOf(x, "id_programa")).trim() === String(idPrograma).trim(),
        );
        setBlocks(esquemas);
        const asignaturas = (a.data || []).filter(
          (x) => String(valueOf(x, "id_programa")).trim() === String(idPrograma).trim(),
        );
        setAssignments(asignaturas);
        const summaries = (summary.data || []).filter(
          (x) => String(valueOf(x, "id_programa")).trim() === String(idPrograma).trim(),
        );
        setSavedSummaries(summaries);
        const loadedRatios = {};
        asignaturas.forEach((item) => {
          const option = item.horas_independientes_opcion;
          const rawAssignmentId = [item.id, item.id_asignatura].find(
            (value) => String(value ?? "").trim() !== "",
          );
          const assignmentId = /^\d+$/.test(String(rawAssignmentId))
            ? Number(rawAssignmentId)
            : rawAssignmentId;
          if (option) loadedRatios[String(assignmentId)] = option;
        });
        summaries.forEach((item) => {
          const assignmentId = item.id_asignatura;
          const option = valueOf(item, "horas_independientes_opcion");
          if (option) loadedRatios[String(assignmentId)] = option;
        });
        setRatios(loadedRatios);
        const loaded = {};
        horarios.forEach((row) => {
          try {
            let numPerH = periodNumber(valueOf(row, "numero_periodo", "periodo"));
            if (esAnual && totalPeriodos > 0 && numPerH > totalPeriodos) {
              numPerH = Math.ceil(numPerH / 2);
            }
            const normalizedRow = {
              ...row,
              id: valueOf(row, "id", "id_horario") || row.id,
              id_esquema: valueOf(row, "id_esquema") || row.id_esquema,
              id_asignatura: valueOf(row, "id_asignatura") || row.id_asignatura,
              numero_periodo: numPerH,
              horario_json: valueOf(row, "horario_json", "horario") || row.horario_json,
            };
            loaded[`${normalizedRow.id_esquema}-${normalizedRow.id_asignatura}`] = {
              ...normalizedRow,
              horario: {
                ...emptySchedule(),
                ...JSON.parse(normalizedRow.horario_json || "{}"),
              },
            };
          } catch {
            /* fila inválida: se ignora */
          }
        });
        setSchedules(loaded);
      })
      .catch(
        () =>
          active && setError("No se pudieron cargar los esquemas u horarios."),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, idPrograma]);

  const periods = useMemo(() => {
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

  const blocksFor = (period) => {
    // Un mismo esquema puede aparecer repetido en la hoja (por ejemplo,
    // después de guardar nuevamente la modal). Para horarios solo necesitamos
    // una representación de cada bloque real.
    const source = Array.from(
      new Map(
        blocks
          .filter((b) => periodNumber(valueOf(b, "numero_periodo", "periodo")) === period)
          .map((b) => [
            [
              b.id_asignatura,
              b.id_practica || "",
              b.numero_fila,
              b.semana_inicio,
              b.semana_fin,
            ].join("|"),
            b,
          ]),
      ).values(),
    );
    const boundaries = [
      ...new Set(
        source
          .flatMap((b) => [Number(b.semana_inicio), Number(b.semana_fin) + 1])
          .filter(Number.isFinite),
      ),
    ].sort((a, b) => a - b);
    return boundaries
      .slice(0, -1)
      .map((start, index) => {
        const end = boundaries[index + 1] - 1;
        const active = source.filter(
          (b) =>
            Number(b.semana_inicio) <= start && Number(b.semana_fin) >= end,
        );
        const subjects = Array.from(
          new Map(
            active.map((subject) => [
              String(
                subject.id_practica
                  ? `${subject.id_asignatura}-${subject.id_practica}`
                  : subject.id_asignatura,
              ),
              subject,
            ]),
          ).values(),
        );
        return {
          ...subjects[0],
          id: `segment-${period}-${start}-${end}`,
          semana_inicio: start,
          semana_fin: end,
          subjects,
        };
      })
      .filter((b) => b.subjects.length);
  };
  const keyFor = (block, subject) =>
    `${block.id}-${subject.id_asignatura}-${subject.id_practica || subject.id || "general"}`;
  const toggle = (block, subject, day, hour) => {
    const key = keyFor(block, subject);
    const current = schedules[key]?.horario || emptySchedule();
    const values = current[day] || [];
    const next = values.includes(hour)
      ? values.filter((x) => x !== hour)
      : [...values, hour];
    setSchedules((old) => ({
      ...old,
      [key]: {
        ...(old[key] || {
          ...block,
          id_esquema: subject.id,
          id_asignatura: subject.id_asignatura,
          horario: emptySchedule(),
        }),
        ...block,
        id_esquema: subject.id,
        id_asignatura: subject.id_asignatura,
        nombre_asignatura: subject.nombre_asignatura,
        horario: { ...current, [day]: next },
      },
    }));
  };
  const hasConflict = (block, subject, day, hour) =>
    blocks.some(
      (other) =>
        String(other.id_programa) === String(idPrograma) &&
        periodNumber(valueOf(other, "numero_periodo", "periodo")) === periodNumber(block.numero_periodo) &&
        String(other.id_asignatura) !== String(subject.id_asignatura) &&
        Number(other.semana_inicio) <= Number(block.semana_fin) &&
        Number(other.semana_fin) >= Number(block.semana_inicio) &&
        schedules[keyFor(other, other)]?.horario?.[day]?.includes(hour),
    );
  const scheduleFor = (block, subject) => {
    const direct = schedules[keyFor(block, subject)];
    if (direct) return direct;
    return Object.values(schedules).find((item) =>
      String(item.id_esquema) === String(subject.id) &&
      String(item.id_asignatura) === String(subject.id_asignatura) &&
      periodNumber(item.numero_periodo) === periodNumber(block.numero_periodo) &&
      Number(item.semana_inicio) <= Number(block.semana_inicio) &&
      Number(item.semana_fin) >= Number(block.semana_fin),
    );
  };
  const statsFor = (block, subject) => {
    const horario =
      scheduleFor(block, subject)?.horario || emptySchedule();
    const horasSemana = Object.values(horario).reduce(
      (total, hours) => total + hours.length,
      0,
    );
    const semanas = Number(block.semana_fin) - Number(block.semana_inicio) + 1;
    const assignment = assignments.find(
      (item) =>
        String(
          [item.id, item.id_asignatura].find(
            (value) => String(value ?? "").trim() !== "",
          ),
        ) === String(subject.id_asignatura),
    );
    const ratio =
      ratios[String(subject.id_asignatura)] ||
      assignment?.horas_independientes_opcion ||
      "1:1";
    const [base, independent] = ratio.split(":").map(Number);
    const horasIndependientes = horasSemana * (independent / base);
    const totalHorasHorario = horasSemana * semanas;
    const totalHorasGlobales = totalHorasHorario + horasIndependientes;
    return {
      horasSemana,
      totalHorasHorario,
      horasIndependientes,
      totalHorasGlobales,
      creditos: totalHorasGlobales / 48,
      ratio,
    };
  };
  const totalHorasPeriodoFor = (period, subject) =>
    blocksFor(period).reduce((total, block) => {
      if (!block.subjects?.some(
        (item) => String(item.id_asignatura) === String(subject.id_asignatura),
      )) return total;
      return total + statsFor(block, subject).totalHorasGlobales;
    }, 0);
  const save = async () => {
    if (readOnly) {
      setSaving(true);
      try {
        const getAssignmentId = (item) => [item.id, item.id_asignatura].find(
          (value) => String(value ?? "").trim() !== "",
        );
        const editedAssignments = assignments.filter((item) => {
          const assignmentId = String(getAssignmentId(item));
          return ["beneficiados", "relacion", "grupo", "estudiantes"]
            .some((field) => Object.prototype.hasOwnProperty.call(benefitData, `${assignmentId}-${field}`));
        });
        const results = await Promise.all(editedAssignments.map((item) => {
          const assignmentId = getAssignmentId(item);
          const value = (field) => benefitData[`${assignmentId}-${field}`] ?? item[
            { beneficiados: "estudiantes_beneficiados", estudiantes: "numero_estudiantes" }[field] || field
          ] ?? "";
          return fetchPostGeneral({
            dataSend: {
              updateData: [
                assignmentId,
                item.id_programa,
                item.periodicidad,
                item.duracion,
                item.total_periodos,
                item.numero_periodo,
                item.nombre_periodo,
                item.semanas_periodo,
                item.nombre_asignatura,
                item.numero_semanas,
                item.horas_independientes_opcion || "1:1",
                value("beneficiados"),
                value("relacion"),
                value("grupo"),
                value("estudiantes"),
              ],
              id: assignmentId,
            },
            sheetName: "ASIGNATURAS",
            urlEndPoint: `${URL}/updatePractice`,
          });
        }));
        if (results.some((result) => !result?.status)) throw new Error("benefit-save");
        clearCache();
        onSaved?.(benefitData);
        if (!embedded) onClose?.();
      } catch {
        setError("No se pudieron guardar los datos de estudiantes.");
      } finally {
        setSaving(false);
      }
      return;
    }
    setError("");
    setSaving(true);
    try {
      const scheduleRows = Object.values(schedules)
        .filter((x) =>
          Object.values(x.horario || {}).some((items) => items.length),
        )
        .map((x) => ({
          ...x,
          row: [
            x.id ||
              `${idPrograma}-${x.id_asignatura}-${x.numero_periodo}-${x.semana_inicio}-${Date.now()}`,
            idPrograma,
            x.id_esquema,
            x.id_asignatura,
            periodicidad,
            totalPeriodos,
            x.numero_periodo,
            x.semana_inicio,
            x.semana_fin,
            Number(x.semana_fin) - Number(x.semana_inicio) + 1,
            JSON.stringify(x.horario),
            x.id_practica || "",
            x.nombre_practica || "",
            x.id_escenario || "",
            x.nombre_escenario || "",
          ],
        }));
      const existingScheduleRows = scheduleRows.filter((x) => String(x.id ?? "").trim());
      const newScheduleRows = scheduleRows.filter((x) => !String(x.id ?? "").trim());
      const failedUpdates = [];
      await Promise.all(
        existingScheduleRows.map(async (item) => {
          try {
            const response = await fetchPostGeneral({
              dataSend: { updateData: item.row, id: String(item.id).trim() },
              sheetName: "HORARIOS",
              urlEndPoint: `${URL}/updatePractice`,
            });
            if (!response?.status) throw Error();
          } catch {
            // Algunas filas históricas no tienen un ID válido en la primera
            // columna. En ese caso se conservan como una nueva fila.
            failedUpdates.push({
              ...item,
              row: [
                `${idPrograma}-${item.id_asignatura}-${item.numero_periodo}-${item.semana_inicio}-${Date.now()}`,
                ...item.row.slice(1),
              ],
            });
          }
        }),
      );
      const rowsToInsert = [...newScheduleRows, ...failedUpdates];
      if (rowsToInsert.length) {
        const response = await fetchPostGeneral({
          dataSend: { insertData: rowsToInsert.map((x) => x.row) },
          sheetName: "HORARIOS",
          urlEndPoint: `${URL}/sendDocServ`,
        });
        if (!response?.status) throw Error();
      }
      const summaryMap = new Map();
      periods.forEach((period) => {
        blocksFor(period).forEach((block) => {
          block.subjects?.forEach((subject) => {
            const stats = statsFor(block, subject);
            if (!stats.horasSemana) return;
            const key = `${subject.id_asignatura}-${block.numero_periodo}`;
            const current = summaryMap.get(key) || {
              horasSemana: 0,
              totalHorasHorario: 0,
              totalHorasGlobales: 0,
              subject,
              periodo: block.numero_periodo,
              ratio: stats.ratio,
            };
            current.horasSemana += stats.horasSemana;
            current.totalHorasHorario += stats.totalHorasHorario;
            current.totalHorasGlobales += stats.totalHorasGlobales;
            summaryMap.set(key, current);
          });
        });
      });
      const summaryRows = [...summaryMap.entries()].map(([, item]) => {
        const existing = savedSummaries.find(
          (row) =>
            [row.id_asignatura, row.numero_periodo].join("|") ===
            [item.subject.id_asignatura, item.periodo].join("|"),
        );
        const values = [
          idPrograma,
          item.subject.id_asignatura,
          item.periodo,
          item.horasSemana,
          item.totalHorasHorario,
          item.totalHorasGlobales,
          item.totalHorasGlobales - item.totalHorasHorario,
          item.totalHorasGlobales / 48,
          item.ratio,
          item.totalHorasGlobales,
        ];
        return { id: existing?.id, values };
      });
      await Promise.all(
        summaryRows
          .filter((item) => item.id)
          .map(async (item) => {
            const response = await fetchPostGeneral({
              dataSend: {
                updateData: [String(item.id).trim(), ...item.values],
                id: String(item.id).trim(),
              },
              sheetName: "RESUMEN_ASIGNATURAS",
              urlEndPoint: `${URL}/updatePractice`,
            });
            if (!response?.status) throw Error();
          }),
      );
      const newSummaryRows = summaryRows
        .filter((item) => !item.id)
        .map((item) => item.values);
      if (newSummaryRows.length) {
        const response = await fetchPostGeneral({
          dataSend: { insertData: newSummaryRows },
          sheetName: "RESUMEN_ASIGNATURAS",
          urlEndPoint: `${URL}/sendDocServ`,
        });
        if (!response?.status) throw Error();
      }
      // Persistir la proporción elegida en ASIGNATURAS. Algunas filas usan
      // id y otras id_asignatura como primera columna, por eso se soportan
      // ambos identificadores.
      if (false)
        try {
          await Promise.all(
            assignments
              .filter((item) => ratios[String(item.id ?? item.id_asignatura)])
              .map(async (item) => {
                const rawAssignmentId = [item.id, item.id_asignatura].find(
                  (value) => String(value ?? "").trim() !== "",
                );
                const assignmentId = /^\d+$/.test(String(rawAssignmentId))
                  ? Number(rawAssignmentId)
                  : rawAssignmentId;
                const option = ratios[String(assignmentId)];
                console.log("Actualizando ASIGNATURAS", {
                  id: assignmentId,
                  opcion: option,
                  fila: item,
                });
                const result = await fetchPostGeneral({
                  dataSend: {
                    updateData: [
                      assignmentId,
                      item.id_programa,
                      item.periodicidad,
                      item.duracion,
                      item.total_periodos,
                      item.numero_periodo,
                      item.nombre_periodo,
                      item.semanas_periodo,
                      item.nombre_asignatura,
                      item.numero_semanas,
                      option,
                    ],
                    id: assignmentId,
                  },
                  sheetName: "ASIGNATURAS",
                  urlEndPoint: `${URL}/updatePractice`,
                });
                if (!result?.status) throw Error();
              }),
          );
        } catch (optionError) {
          console.warn(
            "No se pudo actualizar horas_independientes_opcion",
            optionError,
          );
        }
      clearCache();
      onSaved?.();
      if (!embedded) onClose?.();
    } catch {
      setError("No se pudieron guardar los horarios.");
    } finally {
      setSaving(false);
    }
  };

  const Wrapper = embedded ? Box : Dialog;
  const wrapperProps = embedded
    ? { sx: { width: "100%", boxSizing: "border-box", border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden" } }
    : { open, onClose, fullWidth: true, maxWidth: "lg" };

  return (
    <Wrapper {...wrapperProps}>
      <DialogTitle>Horarios de prácticas</DialogTitle>
      <DialogContent dividers onClick={() => setSelected({})}>
        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
          <Typography>
            Periodicidad: <b>{periodicidad || "-"}</b>
          </Typography>
          <Typography>
            Años: <b>{totalPeriodos ? toRoman(totalPeriodos) : "-"}</b>
          </Typography>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {periods.map((p) => (
                <Tab key={p} label={`${labelPrefix} ${toRoman(p)}`} />
              ))}
            </Tabs>
            {blocksFor(periods[tab] || 1).map((block, blockIndex) => {
              const selectorKey =
                block.id || `${block.numero_periodo}-${block.semana_inicio}`;
              const subject = block.subjects.find(
                (s) => {
                  const sKey = s.id_practica ? `${s.id_asignatura}-${s.id_practica}` : String(s.id_asignatura);
                  return sKey === String(selected[selectorKey]);
                },
              );
              const current =
                (subject && schedules[keyFor(block, subject)]?.horario) ||
                emptySchedule();
              return (
                <Accordion
                  key={`${block.semana_inicio}-${block.semana_fin}`}
                  expanded={
                    expandedSchedule === null
                      ? blockIndex === 0
                      : expandedSchedule === selectorKey
                  }
                  onChange={() =>
                    setExpandedSchedule((current) => {
                      if (current === selectorKey) return null;
                      if (current === null && blockIndex === 0)
                        return "__closed__";
                      return selectorKey;
                    })
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Ciclo {blockIndex + 1}:{" "}
                      {Number(block.semana_fin) -
                        Number(block.semana_inicio) +
                        1}{" "}
                      semanas
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      sx={{ my: 2 }}
                    >
                      {block.subjects.map((s) => {
                        const sKey = s.id_practica ? `${s.id_asignatura}-${s.id_practica}` : String(s.id_asignatura);
                        const isSelected =
                          subject &&
                          (s.id_practica
                            ? String(subject.id_practica) === String(s.id_practica) && String(subject.id_asignatura) === String(s.id_asignatura)
                            : String(subject.id_asignatura) === String(s.id_asignatura));
                        const buttonLabel = s.nombre_practica
                          ? `${s.nombre_asignatura}: ${s.nombre_practica} ${s.nombre_escenario ? `(${s.nombre_escenario})` : ""}`
                          : s.nombre_asignatura;
                        return (
                          <Button
                            key={sKey}
                            className="subject-color-button"
                            variant="contained"
                            onClick={(event) => {
                              event?.stopPropagation();
                              setSelected((old) => ({
                                ...old,
                                [selectorKey]: sKey,
                              }));
                            }}
                            sx={{
                              color: "#fff",
                              opacity: subject && !isSelected ? 0.45 : 1,
                              backgroundColor: colorFor(s),
                              "&.MuiButton-contained": {
                                backgroundColor: colorFor(s),
                              },
                              boxShadow: isSelected
                                ? "0 0 0 3px rgba(0, 0, 0, 0.28)"
                                : "none",
                              "&:hover": {
                                backgroundColor: colorFor(s),
                              },
                            }}
                            style={{ backgroundColor: colorFor(s) }}
                          >
                            {buttonLabel}
                          </Button>
                        );
                      })}
                    </Stack>
                    {!subject && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Selecciona una asignatura para habilitar su horario.
                      </Typography>
                    )}
                    <Box sx={{ overflowX: "auto" }} onClick={(event) => event.stopPropagation()}>
                      <Box
                        sx={{
                          minWidth: 700,
                          display: "grid",
                          gridTemplateColumns: "120px repeat(7, 1fr)",
                        }}
                      >
                        <Box />
                        <>
                          {DAYS.map((day) => (
                            <Typography
                              key={day}
                              sx={{
                                textAlign: "center",
                                fontWeight: 700,
                                p: 0.5,
                              }}
                            >
                              {day}
                            </Typography>
                          ))}
                        </>
                        {HOURS.map((hour) => (
                          <React.Fragment key={hour}>
                            <Typography
                              sx={{
                                p: 0.5,
                                borderTop: "1px solid #ddd",
                                fontSize: 12,
                              }}
                            >
                              {hour}
                            </Typography>
                            {DAYS.map((day) => {
                              const occupiedBy = block.subjects.find((s) =>
                                (
                                  schedules[keyFor(block, s)]?.horario?.[day] ||
                                  []
                                ).includes(hour),
                              );
                              const checked = Boolean(occupiedBy);
                              const editable = Boolean(subject);
                              return (
                                <FormControlLabel
                                  key={`${day}-${hour}`}
                                  label=""
                                  control={
                                    <Checkbox
                                      checked={checked}
                                      disabled={
                                        readOnly ||
                                        !editable ||
                                        hasConflict(block, subject, day, hour)
                                      }
                                      onChange={() =>
                                        toggle(block, subject, day, hour)
                                      }
                                    />
                                  }
                                  sx={{
                                    m: 0,
                                    minHeight: 28,
                                    justifyContent: "center",
                                    borderTop: "1px solid #ddd",
                                    backgroundColor: occupiedBy
                                      ? colorFor(occupiedBy)
                                      : "transparent",
                                    "& .MuiCheckbox-root": { p: 0.25 },
                                  }}
                                />
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </Box>
                    </Box>
                    {subject &&
                      (() => {
                        const stats = statsFor(block, subject);
                        const ratioKey = String(subject.id_asignatura);
                        return (
                          <Box
                            sx={{
                              mt: 2,
                              p: 2,
                              backgroundColor: "#fafafa",
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, pt: 0.75 }}>
                                Resumen de {subject.nombre_asignatura}
                              </Typography>
                              {readOnly && (
                                <Box onClick={(event) => event.stopPropagation()} sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 78px)", sm: "repeat(4, 78px)" }, gap: 0.75, justifyContent: "flex-end" }}>
                                  {["beneficiados", "relacion", "grupo", "estudiantes"].map((field) => (
                                    <Box key={field} sx={{ width: 78 }}>
                                      <Typography
                                        variant="caption"
                                        title={{ beneficiados: "Estudiantes beneficiados", relacion: "Relación", grupo: "Grupo", estudiantes: "Número de estudiantes" }[field]}
                                        sx={{ display: "block", fontSize: "0.62rem", lineHeight: 1.1, mb: 0.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                      >
                                        {{ beneficiados: "Est. beneficiados", relacion: "Relación", grupo: "Grupo", estudiantes: "N. estudiantes" }[field]}
                                      </Typography>
                                      <TextField
                                        size="small"
                                        type="number"
                                        aria-label={{ beneficiados: "Estudiantes beneficiados", relacion: "Relación", grupo: "Grupo", estudiantes: "Número de estudiantes" }[field]}
                                        value={benefitData[`${ratioKey}-${field}`] || ""}
                                        onChange={(event) => setBenefitData((old) => ({ ...old, [`${ratioKey}-${field}`]: event.target.value }))}
                                        inputProps={{ min: 0 }}
                                        sx={{ width: 78, "& .MuiInputBase-input": { px: 1 } }}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Box>
                            <FormControl
                              size="small"
                              sx={{ minWidth: 180, mt: 1 }}
                            >
                              <Typography variant="caption">
                                Horas independientes
                              </Typography>
                              <Select
                                value={stats.ratio}
                                disabled={readOnly}
                                onChange={(event) =>
                                  setRatios((old) => ({
                                    ...old,
                                    [ratioKey]: event.target.value,
                                  }))
                                }
                              >
                                {ratioOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={2}
                              sx={{ mt: 1 }}
                            >
                              <Typography>
                                Horas/semana: <b>{stats.horasSemana}</b>
                              </Typography>
                              <Typography>
                                Total Horas del ciclo:{" "}
                                <b>{stats.totalHorasHorario}</b>
                              </Typography>
                              <Typography>
                                Horas independientes:{" "}
                                <b>{stats.horasIndependientes}</b>
                              </Typography>
                              <Typography>
                                Total global de horas:{" "}
                                <b>{stats.totalHorasGlobales}</b>
                              </Typography>
                              <Typography>
                                Total horas del periodo:{" "}
                                <b>
                                  {totalHorasPeriodoFor(
                                    block.numero_periodo,
                                    subject,
                                  )}
                                </b>
                              </Typography>
                              <Typography>
                                Créditos: <b>{stats.creditos.toFixed(2)}</b>
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      })()}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onBack} disabled={saving}>
          Atrás
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={saving || loading}>
          {saving ? "Guardando..." : "Finalizar convenio"}
        </Button>
      </DialogActions>
    </Wrapper>
  );
}
