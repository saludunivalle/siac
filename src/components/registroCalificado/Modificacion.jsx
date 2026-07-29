import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableSortLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import { Tooltip } from "@mui/material";
import RiskValue from "../common/RiskValue";

const normalize = (value) => String(value ?? "").trim();
const stripAccents = (value) =>
  normalize(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getFieldValue = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "")
      return value;
  }
  return "";
};

const parseDate = (value) => {
  const raw = normalize(value);
  if (!raw) return new Date(0);
  const parts = raw.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if ([day, month, year].every(Number.isFinite))
      return new Date(year, month - 1, day);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const getSeguimientoProcess = (seguimiento) => {
  const values = [
    getFieldValue(seguimiento, "proceso"),
    getFieldValue(seguimiento, "topic"),
    getFieldValue(seguimiento, "mensaje"),
    getFieldValue(seguimiento, "kind"),
    getFieldValue(seguimiento, "subject"),
  ]
    .map(stripAccents)
    .join(" ");

  if (values.includes("modificacion")) return "MOD";
  if (values.includes(" mod")) return "MOD";
  if (values.startsWith("mod")) return "MOD";
  return "";
};

const getLatestSeguimientoForProcess = (seguimientos, idPrograma, process) => {
  const valid = (seguimientos || [])
    .filter(
      (seg) =>
        normalize(seg.id_programa) === normalize(idPrograma) &&
        getSeguimientoProcess(seg) === process,
    )
    .sort((a, b) => parseDate(b?.timestamp) - parseDate(a?.timestamp));
  return valid[0] || null;
};

const getPhaseLabel = (seguimiento, fasesById) => {
  if (!seguimiento) return "Sin seguimientos";
  const faseId = normalize(seguimiento.fase);
  const fase = fasesById.get(faseId) || fasesById.get(Number(faseId));
  return fase?.fase_sup || fase?.fase || "Sin seguimientos";
};

const Modificacion = ({
  programDetails,
  escuelaUsuario,
  selectedRisk,
  filteredByRisk,
  setSelectedRisk,
  setFilteredByRisk,
  handleNavigateToProgram,
  riskConfig,
}) => {
  const procesoProgramas = programDetails?.MOD || [];
  const seguimientos = programDetails?.seguimientos || [];
  const fases = programDetails?.fases || [];

  const fasesById = useMemo(() => {
    const map = new Map();
    fases.forEach((fase) => {
      map.set(normalize(fase.id), fase);
      map.set(Number(fase.id), fase);
    });
    return map;
  }, [fases]);

  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [selectedSubprocess, setSelectedSubprocess] = useState("all");
  const [filters, setFilters] = useState({
    escuela: "",
    programa: "",
    nivelAcademico: "",
    nivelFormacion: "",
  });

  useEffect(() => {
    if (escuelaUsuario) {
      setFilters((prev) =>
        prev.escuela === escuelaUsuario
          ? prev
          : { ...prev, escuela: escuelaUsuario },
      );
    }
  }, [escuelaUsuario]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const getComparator = (orderValue, orderByValue) =>
    orderValue === "desc"
      ? (a, b) => descendingComparator(a, b, orderByValue)
      : (a, b) => -descendingComparator(a, b, orderByValue);

  const descendingComparator = (a, b, orderByValue) => {
    const aVal = normalize(a[orderByValue]).toLowerCase();
    const bVal = normalize(b[orderByValue]).toLowerCase();
    if (bVal < aVal) return -1;
    if (bVal > aVal) return 1;
    return 0;
  };

  const getUniqueOptions = (field, source = procesoProgramas) =>
    [...new Set(source.map((p) => normalize(p[field])).filter(Boolean))].sort();

  const visibleBase = useMemo(() => {
    if (selectedSubprocess === "sustanciales") {
      return procesoProgramas.filter(
        (program) => normalize(program.mod_sus).toUpperCase() === "SI",
      );
    }
    if (selectedSubprocess === "noSustanciales") {
      return procesoProgramas.filter(
        (program) => normalize(program.mod_sus).toUpperCase() === "NO",
      );
    }
    return procesoProgramas;
  }, [procesoProgramas, selectedSubprocess]);

  const filteredPrograms = useMemo(() => {
    return visibleBase.filter((program) => {
      const programaAcademico = normalize(
        getFieldValue(program, "programa académico", "programa academico"),
      );
      const nivelAcademico = normalize(
        getFieldValue(program, "pregrado/posgrado", "nivel academico"),
      );
      const nivelFormacion = normalize(
        getFieldValue(program, "nivel de formación", "nivel de formacion"),
      );

      if (
        filters.escuela &&
        normalize(program.escuela) !== normalize(filters.escuela)
      )
        return false;
      if (filters.programa && programaAcademico !== normalize(filters.programa))
        return false;
      if (
        filters.nivelAcademico &&
        nivelAcademico !== normalize(filters.nivelAcademico)
      )
        return false;
      if (
        filters.nivelFormacion &&
        nivelFormacion !== normalize(filters.nivelFormacion)
      )
        return false;
      return true;
    });
  }, [visibleBase, filters]);

  const rows = useMemo(() => {
    return filteredPrograms.map((program) => {
      const latestMod = getLatestSeguimientoForProcess(
        seguimientos,
        program.id_programa,
        "MOD",
      );
      return {
        ...program,
        programaAcademico: normalize(
          getFieldValue(program, "programa académico", "programa academico"),
        ),
        nivelAcademico: normalize(
          getFieldValue(program, "pregrado/posgrado", "nivel academico"),
        ),
        nivelFormacion: normalize(
          getFieldValue(program, "nivel de formación", "nivel de formacion"),
        ),
        faseMod: getPhaseLabel(latestMod, fasesById),
        riesgo: program.riesgo || "SinRegistro",
      };
    });
  }, [filteredPrograms, seguimientos, fasesById]);

  const clearFilters = () => {
    setFilters({
      escuela: "",
      programa: "",
      nivelAcademico: "",
      nivelFormacion: "",
    });
  };

  const sortedRows = useMemo(() => {
    if (!orderBy) return rows;
    return [...rows].sort(getComparator(order, orderBy));
  }, [rows, order, orderBy]);

  return (
    <Card
      sx={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.02)",
        width: "100%",
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          background: "linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #B22222 0%, #DC143C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssignmentIcon sx={{ color: "white", fontSize: "20px" }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#212529", fontSize: "1.25rem" }}
            >
              Listado de Programas (Modificación)
              {selectedRisk && (
                <span
                  style={{
                    color: riskConfig[selectedRisk]?.color,
                    marginLeft: "10px",
                  }}
                >
                  • Filtrado por:{" "}
                  {selectedRisk === "SinRegistro"
                    ? "Sin Registro"
                    : `${selectedRisk} Riesgo`}
                </span>
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6C757D", mt: 0.5 }}>
              {`${sortedRows.length} programa${sortedRows.length !== 1 ? "s" : ""} encontrado${sortedRows.length !== 1 ? "s" : ""}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 1,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Button
          variant={selectedSubprocess === "all" ? "contained" : "outlined"}
          onClick={() => setSelectedSubprocess("all")}
          sx={{
            borderColor: "#B22222",
            color: selectedSubprocess === "all" ? "white" : "#B22222",
            backgroundColor:
              selectedSubprocess === "all" ? "#B22222" : "transparent",
          }}
        >
          Todas
        </Button>
        <Button
          variant={
            selectedSubprocess === "sustanciales" ? "contained" : "outlined"
          }
          onClick={() => setSelectedSubprocess("sustanciales")}
          sx={{
            borderColor: "#B22222",
            color: selectedSubprocess === "sustanciales" ? "white" : "#B22222",
            backgroundColor:
              selectedSubprocess === "sustanciales" ? "#B22222" : "transparent",
          }}
        >
          Sustanciales
        </Button>
        <Button
          variant={
            selectedSubprocess === "noSustanciales" ? "contained" : "outlined"
          }
          onClick={() => setSelectedSubprocess("noSustanciales")}
          sx={{
            borderColor: "#B22222",
            color:
              selectedSubprocess === "noSustanciales" ? "white" : "#B22222",
            backgroundColor:
              selectedSubprocess === "noSustanciales"
                ? "#B22222"
                : "transparent",
          }}
        >
          No sustanciales
        </Button>
      </Box>

      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "#495057" }}
        >
          Filtrar por Riesgo:
        </Typography>
        <RadioGroup
          row
          value={selectedRisk || "Todos"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "Todos") {
              setSelectedRisk(null);
              setFilteredByRisk(false);
            } else {
              setSelectedRisk(val);
              setFilteredByRisk(true);
            }
          }}
        >
          <FormControlLabel
            value="Todos"
            control={
              <Radio
                size="small"
                sx={{ color: "#6C757D", "&.Mui-checked": { color: "#6C757D" } }}
              />
            }
            label="Todos"
          />
          <FormControlLabel
            value="Alto"
            control={
              <Radio
                size="small"
                sx={{ color: "#DC3545", "&.Mui-checked": { color: "#DC3545" } }}
              />
            }
            label="Alto"
          />
          <FormControlLabel
            value="Medio"
            control={
              <Radio
                size="small"
                sx={{ color: "#FF8C00", "&.Mui-checked": { color: "#FF8C00" } }}
              />
            }
            label="Medio"
          />
          <FormControlLabel
            value="Bajo"
            control={
              <Radio
                size="small"
                sx={{ color: "#28A745", "&.Mui-checked": { color: "#28A745" } }}
              />
            }
            label="Bajo"
          />
          <FormControlLabel
            value="SinRegistro"
            control={
              <Radio
                size="small"
                sx={{ color: "#6C757D", "&.Mui-checked": { color: "#6C757D" } }}
              />
            }
            label="Sin Registro"
          />
        </RadioGroup>
      </Box>

      <Card
        sx={{ mb: 3, borderRadius: 4, border: "1px solid rgba(0,0,0,0.04)" }}
      >
        <CardContent
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel>Escuela</InputLabel>
            <Select
              value={filters.escuela}
              label="Escuela"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  escuela: e.target.value,
                  programa: "",
                }))
              }
            >
              <MenuItem value="">Todas</MenuItem>
              {getUniqueOptions("escuela").map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Programa academico</InputLabel>
            <Select
              value={filters.programa}
              label="Programa academico"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, programa: e.target.value }))
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {getUniqueOptions(
                "programa académico",
                filters.escuela
                  ? visibleBase.filter(
                      (p) =>
                        normalize(p.escuela) === normalize(filters.escuela),
                    )
                  : visibleBase,
              ).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Nivel academico</InputLabel>
            <Select
              value={filters.nivelAcademico}
              label="Nivel academico"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  nivelAcademico: e.target.value,
                }))
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {getUniqueOptions("pregrado/posgrado", visibleBase).map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Nivel de formacion</InputLabel>
            <Select
              value={filters.nivelFormacion}
              label="Nivel de formacion"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  nivelFormacion: e.target.value,
                }))
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {getUniqueOptions("nivel de formación", visibleBase).map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        </CardContent>
        <Box
          sx={{
            px: 2,
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#070707", fontWeight: 600 }}
          >
            {sortedRows.length} programa{sortedRows.length === 1 ? "" : "s"}{" "}
            encontrado{sortedRows.length === 1 ? "" : "s"}
          </Typography>
          <Button
            onClick={clearFilters}
            variant="text"
            sx={{ color: "#B22222" }}
          >
            Limpiar filtros
          </Button>
        </Box>
      </Card>

      {sortedRows.length === 0 ? (
        <Box sx={{ p: 8, textAlign: "center" }}>
          <SchoolIcon sx={{ fontSize: 64, color: "#E9ECEF", mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ color: "#6C757D", fontWeight: 500, mb: 1 }}
          >
            No hay programas disponibles
          </Typography>
          <Typography variant="body2" sx={{ color: "#ADB5BD" }}>
            No se encontraron programas para este proceso
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ width: "100%", overflowX: "auto" }}
        >
          <Table
            aria-label="lista de programas"
            sx={{ tableLayout: { xs: "auto", md: "fixed" }, width: "100%" }}
          >
            <TableHead>
              <TableRow>
                {[
                  { key: "programa académico", label: "Programa Académico" },
                  { key: "escuela", label: "Escuela" },
                  { key: "nivel académico", label: "Nivel Académico" },
                  { key: "nivel de formación", label: "Nivel de formación" },
                  { key: "fase mod", label: "Fase Mod" },
                  { key: "riesgo", label: "Riesgo" },
                  { key: "mensaje", label: "Observaciones" },
                ].map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#495057",
                      backgroundColor: "#F8F9FA",
                      borderBottom: "2px solid rgba(0,0,0,0.06)",
                      py: 2.5,
                      px: { xs: 1, sm: 2 },
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                    sortDirection={orderBy === column.key ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : "asc"}
                      onClick={() => handleSort(column.key)}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          color: orderBy === column.key ? "#B22222" : "inherit",
                        },
                        "&.Mui-active": {
                          color: "#B22222",
                          "& .MuiTableSortLabel-icon": { color: "#B22222" },
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((program) => (
                <TableRow
                  key={program.id_programa}
                  hover
                  onClick={() => handleNavigateToProgram(program)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell
                    sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: "none" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: "#212529",
                        fontSize: "0.9375rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {program.programaAcademico}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: "none" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#6C757D", fontSize: "0.875rem" }}
                    >
                      {program.escuela}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: "none" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#6C757D", fontSize: "0.875rem" }}
                    >
                      {program.nivelAcademico || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: "none" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#6C757D", fontSize: "0.875rem" }}
                    >
                      {program.nivelFormacion || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: "none" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#495057",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {program.faseMod || "Sin seguimientos"}
                    </Typography>
                  </TableCell>
                  {["Alto", "Medio", "Bajo", "SinRegistro"].map(
                    (risk) =>
                      program.riesgo === risk && (
                        <TableCell
                          key={risk}
                          sx={{
                            py: 3,
                            px: { xs: 1, sm: 2 },
                            borderBottom: "none",
                          }}
                        >
                          <RiskValue
                            risk={risk}
                            value={program.riesgo}
                            riskConfig={riskConfig}
                          />
                        </TableCell>
                      ),
                  )}
                  <TableCell
                    sx={{ py: 3, px: { xs: 1, sm: 2 }, borderBottom: "none" }}
                  >
                    <Tooltip title={program.mensaje} arrow placement="top">
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#6C757D",
                          fontSize: "0.875rem",
                          cursor: "help",
                        }}
                      >
                        {program.mensaje}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
};

export default Modificacion;
