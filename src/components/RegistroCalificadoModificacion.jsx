import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Fade, Typography } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Filtro5, Filtro7, Filtro10 } from "../service/data";
import Modificacion from "./registroCalificado/Modificacion";

const normalize = (value) => String(value ?? "").trim();

const getLatestSeguimiento = (seguimientos, idPrograma, process = "MOD") => {
  const items = (seguimientos || [])
    .filter((seg) => normalize(seg.id_programa) === normalize(idPrograma))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return (
    items.find((item) => normalize(item.proceso).toUpperCase() === process) ||
    items[0] ||
    null
  );
};

const getPhaseLabel = (seguimiento, fases) => {
  if (!seguimiento) return "Sin seguimientos";
  const faseId = normalize(seguimiento.fase);
  const fase = (fases || []).find(
    (item) =>
      normalize(item.id) === faseId ||
      normalize(item.id) === normalize(Number(faseId)),
  );
  return fase?.fase_sup || fase?.fase || "Sin seguimientos";
};

const getUserEscuela = () => {
  try {
    const logged = sessionStorage.getItem("logged");
    if (!logged) return "";

    const res = JSON.parse(logged);
    if (!Array.isArray(res) || res.length === 0) return "";

    const directorEscuela = res.find((item) => {
      const permiso = item?.permiso;
      return Array.isArray(permiso)
        ? permiso.includes("Director Escuela")
        : permiso === "Director Escuela";
    });

    return normalize(directorEscuela?.escuela || res[0]?.escuela);
  } catch {
    return "";
  }
};

const RegistroCalificadoModificacion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCargo, setCargo] = useState([" "]);
  const [loading, setLoading] = useState(true);
  const [programDetails, setProgramDetails] = useState({ MOD: [] });
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [filteredByRisk, setFilteredByRisk] = useState(false);
  const escuelaUsuario = useMemo(getUserEscuela, []);

  useEffect(() => {
    if (sessionStorage.getItem("logged")) {
      const res = JSON.parse(sessionStorage.getItem("logged"));
      const permisos = res.map((item) => item.permiso).flat();
      setCargo(permisos);
    }
  }, []);

  useEffect(() => {
    if (location.state?.fromSidebar) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response = await Filtro5();
        const fases = await Filtro10();
        if (isCargo.includes("Posgrados")) {
          response = response.filter(
            (item) => item["pregrado/posgrado"] === "Posgrado",
          );
        }

        const modPrograms = response.filter((item) => item.mod === "SI");
        const seguimientos = await Filtro7();

        const programsWithRisk = modPrograms.map((program) => {
          const latestSeguimiento = getLatestSeguimiento(
            seguimientos,
            program.id_programa,
            "MOD",
          );
          const fase = normalize(program["fase rrc"]);
          let riesgo = "SinRegistro";
          if (fase === "Vencido" || fase === "Fase 5") riesgo = "Alto";
          else if (fase === "Fase 4" || fase === "Fase 3") riesgo = "Medio";
          else if (fase === "Fase 2") riesgo = "Bajo";

          return {
            ...program,
            riesgo,
            mensaje: latestSeguimiento?.mensaje || "Sin información",
            faseMod: getPhaseLabel(latestSeguimiento, fases),
          };
        });

        setProgramDetails({ MOD: programsWithRisk, seguimientos, fases });
      } catch (error) {
        console.error("Error al cargar datos de modificación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCargo]);

  const riskConfig = useMemo(
    () => ({
      Alto: { color: "#DC3545" },
      Medio: { color: "#FF8C00" },
      Bajo: { color: "#28A745" },
      SinRegistro: { color: "#6C757D" },
    }),
    [],
  );

  const handleNavigateToProgram = (program) => {
    navigate("/program_details", { state: program, replace: true });
  };

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box
        className="content content-with-sidebar"
        sx={{
          ml: 0,
          minHeight: "100vh",
          pt: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{ width: "100%", maxWidth: { xs: "100%", md: "1450px" }, px: 2 }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
              }}
            >
              <CircularProgress sx={{ color: "#B22222" }} />
              <Typography sx={{ mt: 2, color: "#6C757D" }}>
                Cargando información...
              </Typography>
            </Box>
          ) : (
            <Fade in timeout={350}>
              <Box>
                <Modificacion
                  programDetails={programDetails}
                  escuelaUsuario={escuelaUsuario}
                  selectedRisk={selectedRisk}
                  filteredByRisk={filteredByRisk}
                  setSelectedRisk={setSelectedRisk}
                  setFilteredByRisk={setFilteredByRisk}
                  handleNavigateToProgram={handleNavigateToProgram}
                  riskConfig={riskConfig}
                />
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </>
  );
};

export default RegistroCalificadoModificacion;
