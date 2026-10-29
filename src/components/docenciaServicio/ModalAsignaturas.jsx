import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  if (amount > 0) return amount;
  return 10;
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
});

export default function ModalAsignaturas({
  open,
  onClose,
  onBack,
  programa,
  practicasData,
  onSaved,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [periodoActivo, setPeriodoActivo] = useState(0);
  const [mostrarTodos, setMostrarTodos] = useState(false);

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

        // 1. Asignaturas ya existentes en la BD para este programa
        const existingRows = data
          .filter((item) => String(item.id_programa).trim().toLowerCase() === idProgStr)
          .map((item) => ({
            ...item,
            localId: item.id || `${Date.now()}-${Math.random()}`,
            numero_semanas: item.numero_semanas || semanasPeriodo,
          }));

        // 2. Extraer asignaturas de la hoja PRACTICAS para este programa
        const practicasDelProg = (practicasList || []).filter((p) => {
          const pId = String(
            p.id_programa || p.ID_PROGRAMA || p["id_programa"] || p["id programa"] || "",
          ).trim().toLowerCase();
          return pId === idProgStr;
        });

        const seenKeys = new Set();
        const practicasRowsToAdd = [];

        practicasDelProg.forEach((p) => {
          const nombreAsig = getSubjectName(p);
          const periodoNum = parsePeriodoToNumber(getPeriodoRaw(p));
          if (!nombreAsig || !periodoNum) return;

          const dedupeKey = `${periodoNum}___${nombreAsig.toLowerCase()}`;
          if (seenKeys.has(dedupeKey)) return;
          seenKeys.add(dedupeKey);

          // Verificar si ya existe en existingRows
          const yaExiste = existingRows.some(
            (r) =>
              Number(r.numero_periodo) === Number(periodoNum) &&
              String(r.nombre_asignatura || "").trim().toLowerCase() === nombreAsig.toLowerCase(),
          );

          if (!yaExiste) {
            practicasRowsToAdd.push({
              localId: `${Date.now()}-${Math.random()}`,
              id: "", // lista para ser guardada
              id_programa: idPrograma,
              numero_periodo: periodoNum,
              nombre_asignatura: nombreAsig,
              numero_semanas: semanasPeriodo,
              fromPracticas: true,
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
    const set = new Set(rows.map((r) => Number(r.numero_periodo)).filter(Boolean));
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  // Lista de períodos a mostrar en las pestañas
  const periodosTabs = useMemo(() => {
    if (mostrarTodos || periodosConAsignaturas.length === 0) {
      const maxPeriod = Math.max(
        totalPeriodos || 10,
        ...periodosConAsignaturas,
        10,
      );
      return Array.from({ length: maxPeriod }, (_, i) => i + 1);
    }
    return periodosConAsignaturas;
  }, [mostrarTodos, periodosConAsignaturas, totalPeriodos]);

  // Período numérico seleccionado actualmente
  const periodoActualNum = periodosTabs[periodoActivo] || periodosTabs[0] || 1;

  const rowsForPeriod = (period) =>
    rows.filter((row) => Number(row.numero_periodo) === Number(period));

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
      const maxP = Math.max(totalPeriodos || 10, ...periodosConAsignaturas);
      const insertData = validRows.map((row) => [
        row.id ||
          `${idPrograma}-${row.numero_periodo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        idPrograma,
        periodicidad,
        duracion,
        maxP,
        Number(row.numero_periodo),
        `Periodo ${toRoman(row.numero_periodo)}`,
        semanasPeriodo,
        row.nombre_asignatura.trim(),
        Number(row.numero_semanas),
        row.horas_independientes_opcion || "1:1",
      ]);
      const response = await fetchPostGeneral({
        dataSend: { insertData },
        sheetName: "ASIGNATURAS",
        urlEndPoint: "https://siac-server.vercel.app/sendDocServ",
      });
      if (!response?.status) throw new Error("save");
      clearCache();
      onSaved?.();
      onClose();
    } catch {
      setError("No se pudieron guardar las asignaturas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
            Períodos con prácticas:{" "}
            <strong>
              {periodosConAsignaturas.length > 0
                ? periodosConAsignaturas.map((p) => toRoman(p)).join(", ")
                : "Sin prácticas"}
            </strong>
          </Typography>
          <Typography variant="body2">
            Semanas por período: <strong>{semanasPeriodo}</strong>
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
                    <strong>Periodo {toRoman(r.numero_periodo)}:</strong> {r.nombre_asignatura} ({r.numero_semanas} semanas)
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
                  ? `Mostrando todos los períodos (1 a ${periodosTabs.length})`
                  : `Mostrando períodos con prácticas (${periodosTabs.map((p) => toRoman(p)).join(", ")})`}
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
                    : `Ver todos los períodos`}
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
                return (
                  <Tab
                    key={period}
                    label={`Periodo ${toRoman(period)}${count > 0 ? ` (${count})` : ""}`}
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
                      Periodo {toRoman(period)} (Semestre {period}): {semanasPeriodo} semanas
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
                      Prácticas Formativas o Rotaciones del Período {toRoman(period)}
                    </Typography>
                    {periodRows.map((row) => (
                      <Stack
                        key={row.localId}
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems={{ sm: "center" }}
                        sx={{
                          mb: 1.5,
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
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => addRow(period)}
                      sx={{ mt: 1 }}
                    >
                      Agregar asignatura al Período {toRoman(period)}
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
    </Dialog>
  );
}
