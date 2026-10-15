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
const val = (o, ...names) => {
  const key = Object.keys(o || {}).find((k) =>
    names.some((n) => k.toLowerCase() === n.toLowerCase()),
  );
  return key ? o[key] : "";
};
const num = (v) => Number(String(v || "").match(/\d+/)?.[0]) || 0;
const periodCount = (periodicity, duration) => {
  const n = num(duration);
  const sem = /sem/i.test(duration);
  const annual = /anual/i.test(periodicity);
  return sem && annual ? Math.ceil(n / 2) : !sem && !annual ? n * 2 : n;
};

export default function ModalEsquema({ open, onClose, onBack, programa, onSaved }) {
  const idPrograma = val(programa, "id_programa", "idPrograma", "id");
  const periodicidad = val(programa, "periodicidad");
  const duracion = val(programa, "duracion", "duracion_programa", "duración");
  const totalPeriodos = periodCount(periodicidad, duracion);
  const semanas = /sem/i.test(periodicidad) ? 18 : 48;
  const [subjects, setSubjects] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [drag, setDrag] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [periodoActivo, setPeriodoActivo] = useState(0);
  const color = (id) => {
    const index = subjects.findIndex((item) => String(item.id) === String(id));
    return index >= 0 ? `hsl(${(index * 137) % 360} 70% 78%)` : COLORS[0];
  };
  useEffect(() => {
    if (!open || !idPrograma) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetchPostGeneral({
        dataSend: {},
        sheetName: "ASIGNATURAS",
        urlEndPoint: `${URL}/docServ`,
      }),
      fetchPostGeneral({
        dataSend: {},
        sheetName: "ESQUEMAS",
        urlEndPoint: `${URL}/docServ`,
      }),
    ])
      .then(([a, e]) => {
        if (!active) return;
        setSubjects(
          (a.data || []).filter(
            (x) => String(x.id_programa) === String(idPrograma),
          ),
        );
        setBlocks(
          (e.data || [])
            .filter((x) => String(x.id_programa) === String(idPrograma))
            .map((x) => ({ ...x, localId: x.id })),
        );
      })
      .catch(() => active && setError("No se pudieron cargar los datos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, idPrograma]);
  const subjectsFor = (p) =>
    subjects.filter((x) => Number(x.numero_periodo) === p);
  const blocksFor = (p) => blocks.filter((x) => Number(x.numero_periodo) === p);
  const canPlace = (subject, period, row, start) => {
    const duration = Number(subject.numero_semanas) || 1;
    const first = Math.max(1, Math.min(start, semanas - duration + 1));
    const last = first + duration - 1;
    return !blocksFor(period).some(
      (block) =>
        Number(block.numero_fila) === row &&
        String(block.id_asignatura) !==
          String(subject.id_asignatura || subject.id) &&
        Number(block.semana_inicio) <= last &&
        Number(block.semana_fin) >= first,
    );
  };
  const place = (subject, period, row, start) => {
    const duration = Number(subject.numero_semanas) || 1;
    const first = Math.max(1, Math.min(start, semanas - duration + 1));
    const block = {
      ...subject,
      id: subject.id || "",
      localId: `${subject.id_asignatura || subject.id}-${period}-${Date.now()}`,
      id_programa: idPrograma,
      id_asignatura: subject.id_asignatura || subject.id,
      periodicidad,
      total_periodos: totalPeriodos,
      numero_periodo: period,
      semanas_periodo: semanas,
      nombre_asignatura: subject.nombre_asignatura,
      numero_semanas: duration,
      numero_fila: row,
      semana_inicio: first,
      semana_fin: first + duration - 1,
      orden_fila:
        blocksFor(period).filter(
          (x) =>
            Number(x.numero_fila) === row &&
            String(x.id_asignatura) !==
              String(subject.id_asignatura || subject.id),
        ).length + 1,
      color: subject.color || color(subject.id_asignatura || subject.id),
    };
    setBlocks((old) => [
      ...old.filter(
        (x) =>
          String(x.id_asignatura) !==
          String(subject.id_asignatura || subject.id),
      ),
      block,
    ]);
    setDrag(null);
  };
  const save = async () => {
    setError("");
    setSaving(true);
    try {
      // Los bloques que ya vienen de la hoja tienen id y no deben volver a
      // insertarse. Solo se envían los nuevos y se eliminan duplicados del
      // estado local antes de construir insertData.
      const newBlocks = Array.from(
        new Map(
          blocks
            .map((x) => [
              [
                x.id_asignatura,
                x.numero_periodo,
                x.numero_fila,
                x.semana_inicio,
                x.semana_fin,
              ].join("|"),
              x,
            ]),
        ).values(),
      );
      const rows = newBlocks.map((x) => [
        x.id ||
          `${idPrograma}-${x.id_asignatura}-${x.numero_periodo}-${Date.now()}`,
        idPrograma,
        x.id_asignatura,
        periodicidad,
        totalPeriodos,
        x.numero_periodo,
        semanas,
        x.nombre_asignatura,
        x.numero_semanas,
        x.numero_fila,
        x.semana_inicio,
        x.semana_fin,
        x.orden_fila,
        x.color,
      ]);
      const existing = newBlocks.filter((x) => x.id);
      const inserted = newBlocks.filter((x) => !x.id);
      await Promise.all(existing.map((x) => fetchPostGeneral({
        dataSend: { updateData: [
          x.id, idPrograma, x.id_asignatura, periodicidad, totalPeriodos,
          x.numero_periodo, semanas, x.nombre_asignatura, x.numero_semanas,
          x.numero_fila, x.semana_inicio, x.semana_fin, x.orden_fila, x.color,
        ], id: x.id },
        sheetName: "ESQUEMAS",
        urlEndPoint: `${URL}/updateData`,
      })));
      const rowsToInsert = inserted.map((x) => [
        `${idPrograma}-${x.id_asignatura}-${x.numero_periodo}-${Date.now()}`,
        idPrograma, x.id_asignatura, periodicidad, totalPeriodos,
        x.numero_periodo, semanas, x.nombre_asignatura, x.numero_semanas,
        x.numero_fila, x.semana_inicio, x.semana_fin, x.orden_fila, x.color,
      ]);
      if (!rowsToInsert.length) {
        onSaved?.();
        onClose();
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
      onClose();
    } catch {
      setError("No se pudo guardar el esquema.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
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
            <Tabs value={periodoActivo} onChange={(_, value) => setPeriodoActivo(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
              {Array.from({ length: totalPeriodos }, (_, i) => (
                <Tab key={i + 1} label={`Periodo ${i + 1}`} />
              ))}
            </Tabs>
            {(() => {
            const p = periodoActivo + 1;
            const assigned = blocksFor(p);
            const available = subjectsFor(p).filter(
              (s) =>
                !assigned.some((b) => String(b.id_asignatura) === String(s.id)),
            );
            return (
              <Box
                defaultExpanded={assigned.length > 0}
                sx={{
                  backgroundColor: assigned.length ? "#e8f5e9" : "#f2f2f2",
                }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Periodo {p}: {semanas} semanas
                  </Typography>
                </Box>
                <Box sx={{ p: 1 }}>
                  <Box sx={{ overflowX: "auto" }}>
                    <Box
                      sx={{
                        minWidth: 900,
                        display: "grid",
                        gridTemplateColumns: `70px repeat(${semanas}, minmax(24px, 1fr))`,
                      }}
                    >
                      <Box />
                      {Array.from({ length: semanas }, (_, w) => (
                        <Box
                          key={w}
                          sx={{
                            textAlign: "center",
                            fontSize: 11,
                            borderBottom: "1px solid #bbb",
                          }}
                        >
                          {w + 1}
                        </Box>
                      ))}
                      {Array.from(
                        {
                          length: subjectsFor(p).length,
                        },
                        (_, r) => (
                          <React.Fragment key={r}>
                            <Box sx={{ borderTop: "1px solid #ddd" }} />
                            {Array.from({ length: semanas }, (_, w) => {
                              const b = assigned.find(
                                (x) =>
                                  Number(x.numero_fila) === r + 1 &&
                                  w + 1 >= Number(x.semana_inicio) &&
                                  w + 1 <= Number(x.semana_fin),
                              );
                              const middle =
                                b &&
                                w + 1 ===
                                  Math.ceil(
                                    (Number(b.semana_inicio) +
                                      Number(b.semana_fin)) /
                                      2,
                                  );
                              return (
                                <Box
                                  key={w}
                                  title={b?.nombre_asignatura || ""}
                                  draggable={Boolean(b)}
                                  onDragStart={() => b && setDrag(b)}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() =>
                                    drag &&
                                    canPlace(drag, p, r + 1, w + 1) &&
                                    place(drag, p, r + 1, w + 1)
                                  }
                                  sx={{
                                    minHeight: 42,
                                    borderTop: "1px solid #ddd",
                                    backgroundColor: b?.color || "transparent",
                                    fontSize: 10,
                                    overflow: middle ? "visible" : "hidden",
                                    whiteSpace: "nowrap",
                                    textAlign: "center",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    zIndex: middle ? 2 : 1,
                                    cursor: b ? "grab" : "default",
                                  }}
                                >
                                  {middle ? b.nombre_asignatura : ""}
                                </Box>
                              );
                            })}
                          </React.Fragment>
                        ),
                      )}
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Asignaturas disponibles
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {available.map((s) => (
                      <Box
                        key={s.id}
                        draggable
                        onDragStart={() => setDrag(s)}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          cursor: "grab",
                          backgroundColor: color(s.id),
                          fontSize: 13,
                        }}
                      >
                        {s.nombre_asignatura} ({s.numero_semanas} sem.)
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            );
            })()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onBack} disabled={saving}>Atrás</Button>
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
    </Dialog>
  );
}
