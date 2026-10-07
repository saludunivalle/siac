import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { fetchPostGeneral } from "../../service/fetch";

const ENDPOINT = "https://siac-server.vercel.app/docServ";

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
  const durationIsSemesters = /sem/i.test(String(duracion));
  const isAnnual = /anual/i.test(String(periodicidad));

  if (durationIsSemesters && isAnnual) return Math.ceil(amount / 2);
  if (!durationIsSemesters && !isAnnual) return amount * 2;
  return amount;
};

const getPeriodWeeks = (periodicidad) =>
  /sem/i.test(String(periodicidad)) ? 18 : 48;

const emptySubject = (period) => ({
  localId: `${Date.now()}-${Math.random()}`,
  id: "",
  numero_periodo: period,
  nombre_asignatura: "",
  numero_semanas: "",
});

export default function ModalAsignaturas({ open, onClose, programa, onSaved }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const periodicidad = getProgramField(programa, "periodicidad");
  const duracion = getProgramField(programa, "duracion", "duracion_programa");
  const totalPeriodos = useMemo(
    () => getPeriodCount(periodicidad, duracion),
    [periodicidad, duracion],
  );
  const semanasPeriodo = getPeriodWeeks(periodicidad);
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
    fetchPostGeneral({
      dataSend: {},
      sheetName: "ASIGNATURAS",
      urlEndPoint: ENDPOINT,
    })
      .then((response) => {
        const data = Array.isArray(response?.data) ? response.data : [];
        if (!activo) return;
        setRows(
          data
            .filter((item) => String(item.id_programa) === String(idPrograma))
            .map((item) => ({
              ...item,
              localId: item.id || `${Date.now()}-${Math.random()}`,
            })),
        );
      })
      .catch(() => activo && setError("No se pudieron cargar las asignaturas."))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [open, idPrograma, totalPeriodos]);

  const rowsForPeriod = (period) =>
    rows.filter((row) => Number(row.numero_periodo) === period);

  const addRow = (period) =>
    setRows((current) => [...current, emptySubject(period)]);

  const updateRow = (localId, field, value) =>
    setRows((current) =>
      current.map((row) =>
        row.localId === localId ? { ...row, [field]: value } : row,
      ),
    );

  const removeRow = (localId) =>
    setRows((current) => current.filter((row) => row.localId !== localId));

  const handleSave = async () => {
    setError("");
    // En esta primera versión solo se insertan filas nuevas. Así, guardar la
    // modal nuevamente no duplica las asignaturas ya existentes.
    const validRows = rows.filter(
      (row) => !row.id && row.nombre_asignatura?.trim(),
    );
    if (!idPrograma || !totalPeriodos) {
      setError(
        "El programa no tiene una duración válida o no tiene id_programa.",
      );
      return;
    }
    if (
      validRows.some(
        (row) =>
          !Number.isInteger(Number(row.numero_semanas)) ||
          Number(row.numero_semanas) <= 0 ||
          Number(row.numero_semanas) > semanasPeriodo,
      )
    ) {
      setError(
        `Cada asignatura debe tener entre 1 y ${semanasPeriodo} semanas.`,
      );
      return;
    }
    setSaving(true);
    try {
      const insertData = validRows.map((row) => [
        row.id ||
          `${idPrograma}-${row.numero_periodo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        idPrograma,
        periodicidad,
        duracion,
        totalPeriodos,
        row.numero_periodo,
        `Periodo ${row.numero_periodo}`,
        semanasPeriodo,
        row.nombre_asignatura.trim(),
        Number(row.numero_semanas),
      ]);
      const response = await fetchPostGeneral({
        dataSend: { insertData },
        sheetName: "ASIGNATURAS",
        urlEndPoint: "https://siac-server.vercel.app/sendDocServ",
      });
      if (!response?.status) throw new Error("save");
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
      <DialogTitle>
        Asignaturas de {programa?.["programa académico"] || "programa"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Typography>
            Periodicidad: <strong>{periodicidad || "-"}</strong>
          </Typography>
          <Typography>
            Duración: <strong>{duracion || "-"}</strong>
          </Typography>
          <Typography>
            Periodos: <strong>{totalPeriodos || "-"}</strong>
          </Typography>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Typography>Cargando asignaturas...</Typography>
        ) : (
          Array.from({ length: totalPeriodos }, (_, index) => {
            const period = index + 1;
            const periodRows = rowsForPeriod(period);
            const tieneAsignaturas = periodRows.length > 0;
            return (
              <Accordion
                key={period}
                defaultExpanded={tieneAsignaturas}
                sx={{
                  backgroundColor: tieneAsignaturas ? "#e8f5e9" : "#f2f2f2",
                  border: "1px solid",
                  borderColor: tieneAsignaturas ? "#a5d6a7" : "#d6d6d6",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    Periodo {period} · {semanasPeriodo} semanas
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Prácticas Formativas o Roaciones a Desarrollar
                  </Typography>
                  {periodRows.map((row) => (
                    <Stack
                      key={row.localId}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <TextField
                        fullWidth
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
                        type="number"
                        value={row.numero_semanas || ""}
                        onChange={(e) =>
                          updateRow(
                            row.localId,
                            "numero_semanas",
                            e.target.value,
                          )
                        }
                        inputProps={{ min: 1, max: semanasPeriodo }}
                      />
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
                    onClick={() => addRow(period)}
                  >
                    Agregar asignatura
                  </Button>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
