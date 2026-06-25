import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import WarningIcon from "@mui/icons-material/Warning";
import { Filtro5 } from "../service/data";
import { useTheme } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.grey[400]}`,
  borderRight: `1px solid ${theme.palette.grey[400]}`,
  textAlign: "center",
  whiteSpace: "normal",
  wordWrap: "break-word",
  width: "25%",
  padding: "8px",
  "&:first-of-type": {
    borderLeft: "none",
  },
  "&:last-of-type": {
    borderRight: "none",
  },
}));

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.common.black,
  fontWeight: "bold",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.grey[50],
  },
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ProgramasVenc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expiryPrograms, setExpiryPrograms] = useState({
    RRC: {
      oneYear: [],
      twoYears: [],
      threeYears: [],
      enTramite: [],
      expired: [],
    },
    AAC: {
      oneYear: [],
      twoYears: [],
      threeYears: [],
      enTramite: [],
      expired: [],
    },
  });
  const [expiryCounts, setExpiryCounts] = useState({
    RRC: { oneYear: 0, twoYears: 0, threeYears: 0, enTramite: 0 },
    AAC: { oneYear: 0, twoYears: 0, threeYears: 0, enTramite: 0 },
  });
  const [expiredRRCCount, setExpiredRRCCount] = useState(0);
  const [expiredRACCount, setExpiredRACCount] = useState(0);
  const [isCargo, setCargo] = useState([" "]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Obtener los permisos del usuario
  useEffect(() => {
    if (sessionStorage.getItem("logged")) {
      const res = JSON.parse(sessionStorage.getItem("logged"));
      const permisos = res.map((item) => item.permiso).flat();
      setCargo(permisos);
    }
  }, []);

  const handleExpiryClick = useCallback(() => {
    navigate("/programas-venc", { state: { expiryPrograms } });
  }, [navigate, expiryPrograms]);
  //Función para obtener los programas vencidos en RRC

  // Funciones para obtener programas vencidos - MEMOIZADAS
  const getExpiredRRCPrograms = useCallback((programas) => {
    return programas.filter((program) => {
      const isActive =
        program["estado"] === "Activo" || program["estado"] === "Activo - Sede";
      if (!isActive) return false;
      const estadoRrc = String(program["estadorc"] ?? "").trim();
      return estadoRrc !== "Vigente" && estadoRrc !== "Vigente (En trámite)";
    });
  }, []);

  const getExpiredRACPrograms = useCallback((programas) => {
    return programas.filter((program) => {
      const isActive =
        program["estado"] === "Activo" || program["estado"] === "Activo - Sede";
      if (!isActive) return false;
      const estadoAac = String(program["estadoaac"] ?? "").trim();
      return (
        estadoAac !== "Vigente" &&
        estadoAac !== "Vigente (En trámite)" &&
        estadoAac !== "En trámite" &&
        estadoAac !== "En tramite"
      );
    });
  }, []);
  // Función para contar programas próximos a vencer - MEMOIZADA Y OPTIMIZADA
  const countExpiringPrograms = useCallback(
    (programas) => {
      const currentYear = new Date().getFullYear();
      const counts = {
        RRC: { oneYear: 0, twoYears: 0, threeYears: 0, enTramite: 0 },
        AAC: { oneYear: 0, twoYears: 0, threeYears: 0, enTramite: 0 },
      };

      const expiringPrograms = {
        RRC: {
          oneYear: [],
          twoYears: [],
          threeYears: [],
          enTramite: [],
          expired: [],
        },
        AAC: {
          oneYear: [],
          twoYears: [],
          threeYears: [],
          enTramite: [],
          expired: [],
        },
      };

      const activePrograms = programas.filter(
        (program) =>
          program["estado"] === "Activo" ||
          program["estado"] === "Activo - Sede",
      );

      activePrograms.forEach((program) => {
        const rrcYear = program["fechavencrc"]
          ? parseInt(program["fechavencrc"].split("/")[2])
          : null;
        const aacYear = program["fechavencac"]
          ? parseInt(program["fechavencac"].split("/")[2])
          : null;
        const estadoRrc = String(program["estadorc"] ?? "").trim();
        const estadoAac = String(program["estadoaac"] ?? "").trim();

        // Para programas RRC
        if (estadoRrc === "En trámite" || estadoRrc === "En tramite") {
          counts.RRC.enTramite++;
          expiringPrograms.RRC.enTramite.push(program);
        }
        if (rrcYear) {
          if (rrcYear === currentYear + 1) {
            counts.RRC.oneYear++;
            expiringPrograms.RRC.oneYear.push(program);
          } else if (rrcYear === currentYear + 2) {
            counts.RRC.twoYears++;
            expiringPrograms.RRC.twoYears.push(program);
          } else if (rrcYear === currentYear + 3) {
            counts.RRC.threeYears++;
            expiringPrograms.RRC.threeYears.push(program);
          }
        }

        // Para programas AAC
        if (estadoAac === "En trámite" || estadoAac === "En tramite") {
          counts.AAC.enTramite++;
          expiringPrograms.AAC.enTramite.push(program);
        }
        if (aacYear) {
          if (aacYear === currentYear + 1) {
            counts.AAC.oneYear++;
            expiringPrograms.AAC.oneYear.push(program);
          } else if (aacYear === currentYear + 2) {
            counts.AAC.twoYears++;
            expiringPrograms.AAC.twoYears.push(program);
          } else if (aacYear === currentYear + 3) {
            counts.AAC.threeYears++;
            expiringPrograms.AAC.threeYears.push(program);
          }
        }
      });

      expiringPrograms.RRC.expired = getExpiredRRCPrograms(activePrograms);
      expiringPrograms.AAC.expired = getExpiredRACPrograms(activePrograms);

      setExpiryCounts(counts);
      setExpiryPrograms(expiringPrograms);
    },
    [getExpiredRRCPrograms, getExpiredRACPrograms],
  );
  //Función para obtener los programas vencidos en RAC

  // Efecto para obtener los datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        response = await Filtro5();
        console.log("Datos obtenidos:", response);
        if (!response) {
          throw new Error("response is undefined");
        }

        const expiredRRCPrograms = getExpiredRRCPrograms(response);
        const expiredRACPrograms = getExpiredRACPrograms(response);

        setExpiredRRCCount(expiredRRCPrograms);
        setExpiredRACCount(expiredRACPrograms);
        countExpiringPrograms(response);
      } catch (error) {
        console.error("Error al filtrar datos:", error);
      }
    };

    const buttonGoogle = document.getElementById("buttonDiv");
    if (buttonGoogle) {
      buttonGoogle.classList.add("_display_none");
    }
    fetchData();
  }, []);

  //Función para redirigir a la página de detalles del programa
  const handleRowClick = (program) => {
    navigate("/program_details", { state: program });
  };

  const renderPrograms = (programs) =>
    programs?.length > 0 ? (
      programs.map((program, index) => (
        <StyledTableRow key={index} onClick={() => handleRowClick(program)}>
          <StyledTableCell>{program["programa académico"]}</StyledTableCell>
        </StyledTableRow>
      ))
    ) : (
      <StyledTableRow>
        <StyledTableCell colSpan={4}>
          No hay programas disponibles
        </StyledTableCell>
      </StyledTableRow>
    );

  const ExpiryTable = () => (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        mt: { xs: 3, sm: 4, md: 5 },
      }}
    >
      {/* TABLA DE PRÓXIMOS A VENCERSE - FUNCIONALIDAD COMPLETA Y RESPONSIVE */}
      <Card
        sx={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.02)",
          width: "95%",
          maxWidth: "540px",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: "1px solid rgba(0,0,0,0.03)",
              background: "linear-gradient(135deg, #FFF8E7 0%, #FFFFFF 100%)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#FF8C00",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                letterSpacing: "-0.02em",
                fontFamily:
                  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Próximos a Vencerse
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6C757D",
                mt: 0.5,
                fontWeight: 400,
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              }}
            >
              Programas con registro calificado y acreditación próximos a vencer
            </Typography>
          </Box>

          <div onClick={handleExpiryClick} style={{ cursor: "pointer" }}>
            <TableContainer
              sx={{
                backgroundColor: "transparent",
                overflow: "auto",
                maxWidth: "100%",
                "& .MuiTable-root": {
                  borderCollapse: "separate",
                  borderSpacing: "0",
                  minWidth: isMobile ? "auto" : "100%",
                  width: "100%",
                },
              }}
            >
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(255, 140, 0, 0.05)" }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#495057",
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 2 },
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      Proceso
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "#495057",
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 0.5, sm: 1 },
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      1 año
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "#495057",
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 0.5, sm: 1 },
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      2 años
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "#495057",
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 0.5, sm: 1 },
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      3 años
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "#495057",
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 0.5, sm: 1 },
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      En trámite
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Sección RRC */}
                  <TableRow
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 140, 0, 0.02)",
                        transform: "translateX(2px)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        color: "#FF8C00",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 },
                        fontFamily:
                          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <WarningIcon
                          sx={{
                            fontSize: { xs: 14, sm: 16 },
                            color: "#FF8C00",
                          }}
                        />
                        RRC
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#FFA500",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.RRC.oneYear}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#FFD700",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.RRC.twoYears}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#32CD32",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.RRC.threeYears}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#6C757D",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.RRC.enTramite}
                    </TableCell>
                  </TableRow>

                  {/* Sección AAC */}
                  <TableRow
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 140, 0, 0.02)",
                        transform: "translateX(2px)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        color: "#FF8C00",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 1.5, sm: 3 },
                        fontFamily:
                          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <WarningIcon
                          sx={{
                            fontSize: { xs: 14, sm: 16 },
                            color: "#FF8C00",
                          }}
                        />
                        AAC
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#FFA500",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.AAC.oneYear}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#FFD700",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.AAC.twoYears}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#32CD32",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.AAC.threeYears}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.9rem" },
                        color: "#6C757D",
                        borderBottom: "none",
                        py: { xs: 1.5, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {expiryCounts.AAC.enTramite}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <div>
      <Header />
      <Sidebar isCargo={isCargo} />
      <Box
        className="content content-with-sidebar"
        sx={{
          p: 3,
          ml: { xs: 0, sm: 0, md: "20px", lg: "40px" },
          width: "calc(100% - 10px)",
          maxWidth: "100%",
          position: "relative",
          zIndex: 1,
          mt: "80px",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Programas por Vencer
        </Typography>
        <ExpiryTable />
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Años Vencimiento RC
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>1 año</StyledTableHeadCell>
                  <StyledTableHeadCell>2 años</StyledTableHeadCell>
                  <StyledTableHeadCell>3 años</StyledTableHeadCell>
                  <StyledTableHeadCell>Vencidos</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>
                    {renderPrograms(expiryPrograms?.RRC?.oneYear)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {renderPrograms(expiryPrograms?.RRC?.twoYears)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {renderPrograms(expiryPrograms?.RRC?.threeYears)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {renderPrograms(expiredRRCCount)}
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" gutterBottom>
            Años Vencimiento AAC
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>1 año</StyledTableHeadCell>
                  <StyledTableHeadCell>2 años</StyledTableHeadCell>
                  <StyledTableHeadCell>3 años</StyledTableHeadCell>
                  <StyledTableHeadCell>Vencidos</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>
                    {renderPrograms(expiryPrograms?.AAC?.oneYear)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {renderPrograms(expiryPrograms?.AAC?.twoYears)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {renderPrograms(expiryPrograms?.AAC?.threeYears)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {renderPrograms(expiredRACCount)}
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </div>
  );
};

export default ProgramasVenc;
