import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./common/LoadingSpinner";
import ConsolidadoHistorico from "./ConsolidadoHistorico";
import { Filtro5, FiltroHistoricoTimeline } from "../service/data";

const ConsolidadoHistoricoPage = () => {
  const [isCargo, setCargo] = useState([" "]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicoData, setHistoricoData] = useState([]);

  const normalizeValue = (value) => {
    if (
      !value ||
      value === "N/A" ||
      value === "" ||
      value === "NULL" ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return "";
    }
    return typeof value === "string" ? value.trim() : value;
  };

  const isProgramaActivo = (value) => {
    const normalized = normalizeValue(value);
    if (!normalized) return false;
    const lower = normalized.toLowerCase();
    return lower === "activo" || lower === "activo - sede";
  };

  const buildProgramaBase = (programa) => ({
    id_programa: programa.id_programa,
    programa:
      normalizeValue(programa["programa académico"]) ||
      `Programa ${programa.id_programa}`,
    sede: normalizeValue(programa.sede),
    nivel_academico: normalizeValue(programa["pregrado/posgrado"]),
    nivel_formacion: normalizeValue(
      programa["nivel de formación"] ||
        programa["nivel de formacion"] ||
        programa["nivel_formacion"],
    ),
    estado: normalizeValue(programa.estado || programa["estado"]),
    estadoaac: normalizeValue(programa["estadoaac"]),
    acreditable: normalizeValue(programa["acreditable"]),
  });

  useEffect(() => {
    const cargo = sessionStorage.getItem("cargo");
    if (cargo) {
      setCargo(JSON.parse(cargo));
    }
  }, []);

  useEffect(() => {
    const fetchHistoricoData = async () => {
      try {
        setLoading(true);

        // Obtener datos históricos reales como en ProgramDetails.jsx
        const historicoData = await FiltroHistoricoTimeline();
        console.log("Datos históricos para consolidado:", historicoData);

        // Obtener datos de programas para enriquecer la información
        const programas = await Filtro5();
        console.log("Datos de programas:", programas);

        const programasActivos = programas.filter((programa) =>
          isProgramaActivo(programa.estado || programa["estado"]),
        );
        const programasById = new Map(
          programasActivos.map((programa) => [programa.id_programa, programa]),
        );

        const programasBase = programasActivos.map((programa) =>
          buildProgramaBase(programa),
        );

        const historicoEnriquecido = historicoData
          .filter((item) => programasById.has(item.id_programa))
          .map((item) => {
            const programa = programasById.get(item.id_programa);
            return {
              ...item,
              ...buildProgramaBase(programa),
            };
          });

        const enrichedHistoricoData = [
          ...programasBase,
          ...historicoEnriquecido,
        ];

        console.log("Programas activos:", programasActivos.length);
        console.log("Historico enriquecido:", historicoEnriquecido.length);
        console.log(
          "Total registros a enviar al componente:",
          enrichedHistoricoData.length,
        );
        setHistoricoData(enrichedHistoricoData);
        setError(null);
      } catch (err) {
        console.error("Error al cargar datos históricos:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricoData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box className="loading-container">
        <Typography variant="h6" color="error">
          Error al cargar los datos históricos: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Sidebar isCargo={isCargo} />
      <ConsolidadoHistorico data={historicoData} showTitle={true} />
    </>
  );
};

export default ConsolidadoHistoricoPage;
