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

        // Enriquecer SOLO los datos históricos con información de programas
        // Solo procesar registros que tienen datos históricos válidos
        const enrichedHistoricoData = historicoData
          .filter((item) => item.id_programa !== null)
          .map((item) => {
            const programa = programas.find(
              (prog) => prog.id_programa === item.id_programa,
            );
            return {
              ...item,
              programa: programa
                ? normalizeValue(programa["programa académico"])
                : `Programa ${item.id_programa}`,
              sede: programa ? normalizeValue(programa.sede) : "",
              nivel_academico: programa
                ? normalizeValue(programa["pregrado/posgrado"])
                : "",
              nivel_formacion: programa
                ? normalizeValue(programa["nivel de formación"])
                : "",
              estado: programa ? normalizeValue(programa.estado) : "",
              estadoaac: programa ? normalizeValue(programa["estadoaac"]) : "",
              acreditable: programa
                ? normalizeValue(programa["acreditable"])
                : "",
            };
          });

        console.log("Datos históricos enriquecidos:", enrichedHistoricoData);
        console.log("Programas únicos en datos enriquecidos:", [
          ...new Set(enrichedHistoricoData.map((item) => item.programa)),
        ]);
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
