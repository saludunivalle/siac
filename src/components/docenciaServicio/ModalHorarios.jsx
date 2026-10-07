import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { fetchPostGeneral } from "../../service/fetch";

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
  const key = Object.keys(obj || {}).find((k) =>
    names.some((n) => k.toLowerCase() === n.toLowerCase()),
  );
  return key ? obj[key] : "";
};
const number = (value) => Number(String(value || "").match(/\d+/)?.[0]) || 0;
const periodCount = (periodicity, duration) => {
  const n = number(duration);
  const sem = /sem/i.test(duration);
  const annual = /anual/i.test(periodicity);
  return sem && annual ? Math.ceil(n / 2) : !sem && !annual ? n * 2 : n;
};

export default function ModalHorarios({ open, onClose, programa, onSaved }) {
  const idPrograma = valueOf(programa, "id_programa", "idPrograma", "id");
  const periodicidad = valueOf(programa, "periodicidad");
  const duracion = valueOf(
    programa,
    "duracion",
    "duracion_programa",
    "duración",
  );
  const totalPeriodos = periodCount(periodicidad, duracion);
  const [blocks, setBlocks] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState({});
  const [locked, setLocked] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const colors = useMemo(() => {
    const result = {};
    blocks.forEach((b, i) => {
      result[b.id_asignatura] = `hsl(${(i * 137) % 360} 70% 78%)`;
    });
    return result;
  }, [blocks]);

  useEffect(() => {
    if (!open || !idPrograma) return;
    let active = true;
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
    ])
      .then(([e, h]) => {
        if (!active) return;
        const esquemas = (e.data || []).filter(
          (x) => String(x.id_programa) === String(idPrograma),
        );
        const horarios = (h.data || []).filter(
          (x) => String(x.id_programa) === String(idPrograma),
        );
        setBlocks(esquemas);
        const loaded = {};
        horarios.forEach((row) => {
          try {
            loaded[`${row.id_esquema}-${row.id_asignatura}`] = {
              ...row,
              horario: {
                ...emptySchedule(),
                ...JSON.parse(row.horario_json || "{}"),
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

  const periods = Array.from({ length: totalPeriodos }, (_, i) => i + 1);
  const blocksFor = (period) => {
    const source = blocks.filter((b) => Number(b.numero_periodo) === period);
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
        return {
          ...active[0],
          id: `segment-${period}-${start}-${end}`,
          semana_inicio: start,
          semana_fin: end,
          subjects: active,
        };
      })
      .filter((b) => b.subjects.length);
  };
  const keyFor = (block, subject) => `${subject.id}-${subject.id_asignatura}`;
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
        Number(other.numero_periodo) === Number(block.numero_periodo) &&
        String(other.id_asignatura) !== String(subject.id_asignatura) &&
        Number(other.semana_inicio) <= Number(block.semana_fin) &&
        Number(other.semana_fin) >= Number(block.semana_inicio) &&
        schedules[keyFor(other, other)]?.horario?.[day]?.includes(hour),
    );
  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const rows = Object.values(schedules)
        .filter((x) =>
          Object.values(x.horario || {}).some((items) => items.length),
        )
        .map((x) => [
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
        ]);
      const response = await fetchPostGeneral({
        dataSend: { insertData: rows },
        sheetName: "HORARIOS",
        urlEndPoint: `${URL}/sendDocServ`,
      });
      if (!response?.status) throw Error();
      onSaved?.();
      onClose();
    } catch {
      setError("No se pudieron guardar los horarios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Horarios de prácticas</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
          <Typography>
            Periodicidad: <b>{periodicidad || "-"}</b>
          </Typography>
          <Typography>
            Periodos: <b>{totalPeriodos || "-"}</b>
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
                <Tab key={p} label={`Periodo ${p}`} />
              ))}
            </Tabs>
            {blocksFor(periods[tab] || 1).map((block) => {
              const subject =
                block.subjects.find(
                  (s) =>
                    String(s.id_asignatura) ===
                    String(
                      selected[
                        block.id ||
                          `${block.numero_periodo}-${block.semana_inicio}`
                      ],
                    ),
                ) || block.subjects[0];
              const selectorKey =
                block.id || `${block.numero_periodo}-${block.semana_inicio}`;
              const current =
                (subject && schedules[keyFor(block, subject)]?.horario) ||
                emptySchedule();
              return (
                <Box
                  key={`${block.semana_inicio}-${block.semana_fin}`}
                  sx={{
                    mt: 2,
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6">
                    {Number(block.semana_fin) - Number(block.semana_inicio) + 1}{" "}
                    semanas · Horario
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ my: 2 }}>
                    {block.subjects.map((s) => {
                      const isSelected =
                        subject &&
                        String(subject.id_asignatura) ===
                          String(s.id_asignatura);
                      const isLocked = locked[selectorKey] && !isSelected;
                      return (
                        <Button
                          key={s.id_asignatura}
                          disabled={isLocked}
                          variant="contained"
                          onClick={() => {
                            setSelected((old) => ({
                              ...old,
                              [selectorKey]: s.id_asignatura,
                            }));
                            setLocked((old) => ({
                              ...old,
                              [selectorKey]: true,
                            }));
                          }}
                          sx={{
                            color: isLocked ? "#777" : "#fff",
                            backgroundColor: isLocked
                              ? "#e0e0e0"
                              : isSelected
                                ? "#b71c1c"
                                : "#d32f2f",
                            "&:hover": {
                              backgroundColor: isLocked ? "#e0e0e0" : "#b71c1c",
                            },
                          }}
                        >
                          {s.nombre_asignatura}
                        </Button>
                      );
                    })}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setLocked((old) => ({ ...old, [selectorKey]: false }))
                      }
                      disabled={!locked[selectorKey]}
                    >
                      Cambiar asignatura
                    </Button>
                  </Stack>
                  {subject && (
                    <Box sx={{ overflowX: "auto" }}>
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
                                p: 1,
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
                                p: 1,
                                borderTop: "1px solid #ddd",
                                fontSize: 12,
                              }}
                            >
                              {hour}
                            </Typography>
                            {DAYS.map((day) => (
                              <FormControlLabel
                                key={`${day}-${hour}`}
                                label=""
                                control={
                                  <Checkbox
                                    checked={(current[day] || []).includes(
                                      hour,
                                    )}
                                    disabled={hasConflict(
                                      block,
                                      subject,
                                      day,
                                      hour,
                                    )}
                                    onChange={() =>
                                      toggle(block, subject, day, hour)
                                    }
                                  />
                                }
                                sx={{
                                  m: 0,
                                  justifyContent: "center",
                                  borderTop: "1px solid #ddd",
                                  backgroundColor: (
                                    current[day] || []
                                  ).includes(hour)
                                    ? colors[subject.id_asignatura]
                                    : "transparent",
                                }}
                              />
                            ))}
                          </React.Fragment>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={saving || loading}>
          {saving ? "Guardando..." : "Guardar horarios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
