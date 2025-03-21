import React, { useState, useEffect } from 'react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@mui/material';
import { styled } from '@mui/system';
import Header from './Header';
import { format } from 'date-fns';
import { sendDataEscula, dataEscuelas, updateDataEscuela, dataSegui, dataProgramas } from '../service/data';

const escuelas = [
    'Bacteriología y Lab. Clínico',
    'Ciencias Básicas',
    'Enfermería',
    'Medicina',
    'Odontología',
    'Rehabilitación Humana',
    'Salud Pública',
    'Dirección de Posgrados'
];

const programasBase = [
    'Porcentaje de programas Acreditados de la Escuela de {tipo}',
    'Porcentaje de programas con Registro Calificado vigente de la Escuela de {tipo}',
    'Porcentaje de programas en plan de mejoramiento Acreditación por la Escuela de {tipo}',
    'Porcentaje de programas en plan de mejoramiento Registro calificado por la Escuela de {tipo}',
];

const ponderacionesProgramas = [
    '30%', // Porcentaje de programas Acreditados
    '30%', // Porcentaje de programas con Registro Calificado vigente
    '20%', // Porcentaje de programas en plan de mejoramiento Acreditación
    '20%'  // Porcentaje de programas en plan de mejoramiento Registro calificado
];

const StyledButton = styled(Button)(({ theme }) => ({
    marginBottom: '10px',
    padding: '10px',
    width: '100%',
    backgroundColor: '#d3d3d3',
    color: '#000',
    '&:hover': {
        backgroundColor: '#a9a9a9',
    },
    '&.active': {
        backgroundColor: '#a9a9a9',
    }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: '#d3d3d3',
    fontWeight: 'bold'
}));

const SeguimientoInicio = () => {
    const [resumenData, setResumenData] = useState(null);
    const [showResumen, setShowResumen] = useState(true);
    const [selectedEscuela, setSelectedEscuela] = useState('');
    const [scores, setScores] = useState({
        pre: Array(9).fill(''),  // Array vacío con 9 elementos (ajusta según necesites)
        pos: Array(9).fill(''),
        ambos: Array(9).fill('')
    });
    const [descriptions, setDescriptions] = useState({});
    const [data, setData] = useState([]);
    const [programasData, setProgramasData] = useState([]);
    const [selectedProgramType, setSelectedProgramType] = useState('ambos');
    const [loading, setLoading] = useState(false); 
    const [showModal, setShowModal] = useState(false); 
    const [porcentajePM, setPorcentajePM] = useState({
        ambos: "-",
        pre: "-",
        pos: "-"
      });
      const [programasEnPM, setProgramasEnPM] = useState({
        pre: "Cargando...",
        pos: "Cargando..."
      });
      const [porcentajePMRC, setPorcentajePMRC] = useState({
        ambos: "-",
        pre: "-",
        pos: "-"
      });
      const [programasEnPMRC, setProgramasEnPMRC] = useState({
        pre: "Cargando...",
        pos: "Cargando..."
      });

    const handleClickOpen = (escuela) => {
        setShowResumen(false); 
        setSelectedEscuela(escuela);
        const escuelaData = data.find(d => d.escuela === escuela) || {};

        console.log('Valores directos de la escuela ' + escuela + ':', {
            cant_acVigente_pre: escuelaData.cant_acVigente_pre,
            cant_acVigente_pre_tipo: typeof escuelaData.cant_acVigente_pre,
            cant_aac_pre: escuelaData.cant_aac_pre,
            cant_aac_pre_tipo: typeof escuelaData.cant_aac_pre,
            // Mostrar todos los campos relevantes para diagnóstico
            todosLosCampos: escuelaData
        });
        // Asegurar que los valores sean números y no undefined
        const acreditablePre = Number(escuelaData.acreditable_pre || 0);
        const acreditablePos = Number(escuelaData.acreditable_pos || 0);
        const acreditadosPre = Number(escuelaData.cant_acvigente_pre || 0);
        const acreditadosPos = Number(escuelaData.cant_acvigente_pos || 0);

        
        // Calcular el total de acreditables (pregrado + posgrado)
        const totalAcreditable = acreditablePre + acreditablePos;
        const totalAcreditados = acreditadosPre + acreditadosPos;
        
        // Calcular el porcentaje según la fórmula correcta
        const porcAcreditadosPre = acreditablePre === 0 && acreditadosPre === 0 
        ? "-" 
        : acreditablePre > 0
            ? ((acreditadosPre / acreditablePre) * 100).toFixed(2).replace('.', ',') + '%'
            : "0%";

    // Si necesitas calcular el porcentaje de posgrado de manera similar
    const porcAcreditadosPos = acreditablePos === 0 && acreditadosPos === 0
        ? "-"
        : acreditablePos > 0
            ? ((acreditadosPos / acreditablePos) * 100).toFixed(2).replace('.', ',') + '%'
            : "0%";
            console.log('Porcentaje de acreditados Pregrado:', porcAcreditadosPre);
            
    // Porcentaje total
    const porcAcreditados = totalAcreditable === 0 && totalAcreditados === 0
        ? "-"
        : totalAcreditable > 0
            ? ((totalAcreditados / totalAcreditable) * 100).toFixed(2).replace('.', ',') + '%'
            : "0%";
            console.log('Porcentaje de acreditados Total:', porcAcreditados);

        
        console.log('Valores para cálculo:', {
            acreditablePre,
            acreditablePos,
            totalAcreditable,
            acreditadosPre,
            acreditadosPos,
            porcAcreditadosPre,
            porcAcreditadosPos
        });
        
        
        setScores({
            pre: [
                porcAcreditadosPre || '',
                escuelaData.porc_anexos_pre || '',
                escuelaData.por_evi_pre || '', 
                escuelaData.cant_rc_pre || '', 
                escuelaData.cant_aac_pre || '', 
                escuelaData.porc_pm_pre || '',
                escuelaData.acreditable_pre || '',
                escuelaData.cant_rcVigente_pre || '',
                escuelaData.cant_acVigente_pre || ''
            ],
            pos: [
                porcAcreditadosPos || '',
                escuelaData.porc_anexos_pos || '',
                escuelaData.por_evi_pos || '',
                escuelaData.cant_rc_pos || '', 
                escuelaData.cant_aac_pos || '', 
                escuelaData.porc_pm_pos || '',
                escuelaData.acreditable_pos || '',
                escuelaData.cant_rcVigente_pos || '',
                escuelaData.cant_acVigente_pos || ''
            ],
            ambos: Array(9).fill('')
        });        
        setDescriptions({
            descripcion_1_pre: escuelaData.descripcion_1_pre || '',
            descripcion_2_pre: escuelaData.descripcion_2_pre || '',
            descripcion_3_pre: escuelaData.descripcion_3_pre || '',
            descripcion_4_pre: escuelaData.descripcion_4_pre || '',
            descripcion_5_pre: escuelaData.descripcion_5_pre || '',
            descripcion_1_pos: escuelaData.descripcion_1_pos || '',
            descripcion_2_pos: escuelaData.descripcion_2_pos || '',
            descripcion_3_pos: escuelaData.descripcion_3_pos || '',
            descripcion_4_pos: escuelaData.descripcion_4_pos || '',
            descripcion_5_pos: escuelaData.descripcion_5_pos || ''
        });        
    };

    const handleScoreChange = (index, value) => {
        setScores(prevScores => ({
            ...prevScores,
            [selectedProgramType]: prevScores[selectedProgramType].map((score, i) => i === index ? value : score)
        }));
    };

    const handleDescriptionChange = (field, value) => {
        setDescriptions(prevDescriptions => ({
            ...prevDescriptions,
            [field]: value
        }));
    };    

    useEffect(() => {
        const calcularPorcentajePM = async () => {
          if (!selectedEscuela) return;
          
          // Calcular para pregrado
          const porcentajePre = await getPorcentajePMParaAcreditacion(selectedEscuela, "pre");
          
          // Calcular para posgrado
          const porcentajePos = await getPorcentajePMParaAcreditacion(selectedEscuela, "pos");
          
          // Calcular para ambos
          const porcentajeAmbos = await getPorcentajePMParaAcreditacion(selectedEscuela, "ambos");
          
          setPorcentajePM({
            pre: porcentajePre,
            pos: porcentajePos,
            ambos: porcentajeAmbos
          });
        };
        
        calcularPorcentajePM();
      }, [selectedEscuela, selectedProgramType]);
      
      useEffect(() => {
        const cargarDatos = async () => {
          if (!selectedEscuela) return;
          
          try {
            // Calcular porcentajes de PM para acreditación
            const porcentajePre = await getPorcentajePMParaAcreditacion(selectedEscuela, "pre");
            const porcentajePos = await getPorcentajePMParaAcreditacion(selectedEscuela, "pos");
            const porcentajeAmbos = await getPorcentajePMParaAcreditacion(selectedEscuela, "ambos");
            
            setPorcentajePM({
              pre: porcentajePre,
              pos: porcentajePos,
              ambos: porcentajeAmbos
            });
            
            // Cargar listas de programas en PM para descripción
            const listaPrePM = await getProgramasEnPlanMejoramiento(selectedEscuela, "Pregrado");
            const listaPosPM = await getProgramasEnPlanMejoramiento(selectedEscuela, "Posgrado");
            
            console.log("Programas en PM cargados:", { pregrado: listaPrePM, posgrado: listaPosPM });
            
            setProgramasEnPM({
              pre: listaPrePM,
              pos: listaPosPM
            });
          } catch (error) {
            console.error("Error cargando datos:", error);
            setProgramasEnPM({
              pre: "Error al cargar datos",
              pos: "Error al cargar datos"
            });
          }
        };
        
        cargarDatos();
      }, [selectedEscuela, programasData]);

      const getPorcentajePMParaRC = async (escuela, tipo) => {
        console.log(`Calculando porcentaje PM para Registro Calificado usando hscpm_rrc: ${escuela} - ${tipo}`);
        
        try {
          // 1. Obtener datos de la hoja PROGRAMAS_PM
          const dataPM = await dataSegui();
          if (!dataPM || dataPM.length === 0) {
            console.error("No hay datos de programas_pm disponibles");
            return "-";
          }
          
          // 2. Crear mapa de programas por ID
          const programasMap = {};
          programasData.forEach(programa => {
            const idPrograma = programa.id_programa || programa.ID_PROGRAMA;
            if (idPrograma) {
              programasMap[idPrograma] = programa;
            }
          });
          
          // 3. Filtrar programas por escuela y tipo
          let programasFiltrados = [];
          if (escuela === "todos") {
            programasFiltrados = dataPM;
          } else {
            programasFiltrados = dataPM.filter(item => {
              const idPrograma = item.id_programa;
              const programaCompleto = programasMap[idPrograma];
              
              if (!programaCompleto) return false;
              
              const escuelaPrograma = (programaCompleto.escuela || programaCompleto.Escuela || '').toLowerCase();
              
              let tipoMatch = true;
              if (tipo !== "ambos") {
                const tipoPrograma = (programaCompleto["pregrado/posgrado"] || programaCompleto["Pregrado/Posgrado"] || '').toLowerCase();
                tipoMatch = tipo === "pre" ? tipoPrograma === "pregrado" : tipoPrograma === "posgrado";
              }
              
              return escuelaPrograma === escuela.toLowerCase() && tipoMatch;
            });
          }
          
          // 4. Contar programas que tienen "SI" en hscpm_rrc (denominador)
          const programasConHSCPMRC = programasFiltrados.filter(item => {
            // Verificar si tiene "SI" en hscpm_rrc
            const valor = item.hscpm_rrc && item.hscpm_rrc.toString().trim().toUpperCase();
            return valor === "SI" || valor === "SÍ";
          });
          
          console.log(`Total programas filtrados para ${escuela}-${tipo}: ${programasFiltrados.length}`);
      
          // Mostrar los valores de hscpm_rrc para diagnóstico
          console.log("Valores de hscpm_rrc encontrados:");
          programasFiltrados.forEach((item, index) => {
            const idPrograma = item.id_programa;
            const programaCompleto = programasMap[idPrograma];
            const nombrePrograma = programaCompleto ? 
              (programaCompleto["Programa Académico"] || programaCompleto["programa académico"] || idPrograma) : 
              idPrograma;
            
            console.log(`${index + 1}. ${nombrePrograma}: ${item.hscpm_rrc || 'No tiene valor'}`);
          });
      
          // Clasificar los valores para verificar la lógica de filtrado
          const hscpmRCSI = programasFiltrados.filter(item => {
            const valor = item.hscpm_rrc && item.hscpm_rrc.toString().trim().toUpperCase();
            return valor === "SI" || valor === "SÍ";
          }).length;
      
          const hscpmRCNO = programasFiltrados.filter(item => {
            const valor = item.hscpm_rrc && item.hscpm_rrc.toString().trim().toUpperCase();
            return valor === "NO";
          }).length;
      
          const hscpmRCOtros = programasFiltrados.filter(item => {
            if (!item.hscpm_rrc) return true;
            const valor = item.hscpm_rrc.toString().trim().toUpperCase();
            return valor !== "SI" && valor !== "SÍ" && valor !== "NO";
          }).length;
      
          console.log(`Resumen de hscpm_rrc: Total=${programasFiltrados.length}, SI=${hscpmRCSI}, NO=${hscpmRCNO}, Otros=${hscpmRCOtros}`);
      
          console.log(`Programas con SI en hscpm_rrc: ${programasConHSCPMRC.length}`);
          
          // 5. De estos, contar cuántos están en estado Diseño, Rediseño o Seguimiento (numerador)
          const programasConHSCPMRCEnEstados = programasConHSCPMRC.filter(item => {
            const estado = (item.estado_pm || '').toString().toLowerCase();
            return estado === "diseño" || estado === "diseno" || 
                   estado === "rediseño" || estado === "rediseno" || 
                   estado === "seguimiento";
          });
          
          const totalProgramasConHSCPMRC = programasConHSCPMRC.length;
          const totalProgramasConHSCPMRCEnEstados = programasConHSCPMRCEnEstados.length;
          
          console.log(`RESUMEN FINAL RC: Programas con SI en hscpm_rrc: ${totalProgramasConHSCPMRC}, En estados D/R/S: ${totalProgramasConHSCPMRCEnEstados}`);
          
          if (totalProgramasConHSCPMRC === 0) {
            return "-"; // No hay programas con hscpm_rrc=SI para calcular
          }
          
          const porcentaje = (totalProgramasConHSCPMRCEnEstados / totalProgramasConHSCPMRC) * 100;
          return porcentaje.toFixed(2).replace('.', ',') + '%';
        } catch (error) {
          console.error("Error calculando porcentaje PM para RC:", error);
          return "-";
        }
      };
     
      const getProgramasEnPlanMejoramientoRC = async (escuela, tipo) => {
        try {
          // 1. Obtener datos de la hoja PROGRAMAS_PM
          const dataPM = await dataSegui();
          if (!dataPM || dataPM.length === 0) {
            return "Ninguno";
          }
          
          // 2. Crear mapa de programas por ID
          const programasMap = {};
          programasData.forEach(programa => {
            const idPrograma = programa.id_programa || programa.ID_PROGRAMA;
            if (idPrograma) {
              programasMap[idPrograma] = programa;
            }
          });
          
          // 3. Filtrar programas por escuela y tipo
          const programasFiltrados = dataPM.filter(item => {
            const idPrograma = item.id_programa;
            const programaCompleto = programasMap[idPrograma];
            
            if (!programaCompleto) return false;
            
            const escuelaPrograma = (programaCompleto.escuela || programaCompleto.Escuela || '').toLowerCase();
            let tipoMatch = true;
            
            if (tipo !== "ambos") {
              const tipoPrograma = (programaCompleto["pregrado/posgrado"] || programaCompleto["Pregrado/Posgrado"] || '').toLowerCase();
              tipoMatch = tipo.toLowerCase() === tipoPrograma;
            }
            
            return escuelaPrograma === escuela.toLowerCase() && tipoMatch;
          });
          
          // 4. Filtrar los que tienen "SI" en hscpm_rrc y están en estados D/R/S
          const programasEnPMRC = programasFiltrados.filter(item => {
            // Verificar si tiene "SI" en hscpm_rrc
            const tieneHSCPMRC = (item.hscpm_rrc && 
                                item.hscpm_rrc.toString().trim().toUpperCase() === "SI") ||
                               (item.hscpm_rrc && 
                                item.hscpm_rrc.toString().trim().toUpperCase() === "SÍ");
            
            // Verificar estado
            const estado = (item.estado_pm || '').toString().toLowerCase();
            const estadoValido = estado === "diseño" || estado === "diseno" || 
                                estado === "rediseño" || estado === "rediseno" || 
                                estado === "seguimiento";
            
            return tieneHSCPMRC && estadoValido;
          });
          
          const listaProgramas = programasEnPMRC.map(item => {
            const programaCompleto = programasMap[item.id_programa];
            if (!programaCompleto) return '';
            
            const nombrePrograma = programaCompleto["Programa Académico"] || 
                                  programaCompleto["programa académico"] || 
                                  programaCompleto["programa academico"];
            
            return `${nombrePrograma} (${item.estado_pm})`;
          }).filter(nombre => nombre !== '');
          
          return listaProgramas.length > 0 ? listaProgramas.join(", ") : "Ninguno";
        } catch (error) {
          console.error("Error al obtener programas en plan de mejoramiento para RC:", error);
          return "Error al cargar datos";
        }
      };

      useEffect(() => {
        const cargarDatos = async () => {
          if (!selectedEscuela) return;
          
          try {
            // Cargar datos del tercer indicador (AC Vigente)
            const porcentajePre = await getPorcentajePMParaAcreditacion(selectedEscuela, "pre");
            const porcentajePos = await getPorcentajePMParaAcreditacion(selectedEscuela, "pos");
            const porcentajeAmbos = await getPorcentajePMParaAcreditacion(selectedEscuela, "ambos");
            
            setPorcentajePM({
              pre: porcentajePre,
              pos: porcentajePos,
              ambos: porcentajeAmbos
            });
            
            const listaPrePM = await getProgramasEnPlanMejoramiento(selectedEscuela, "Pregrado");
            const listaPosPM = await getProgramasEnPlanMejoramiento(selectedEscuela, "Posgrado");
            
            setProgramasEnPM({
              pre: listaPrePM,
              pos: listaPosPM
            });
            
            // Cargar datos del cuarto indicador (RC Vigente)
            const porcentajePreRC = await getPorcentajePMParaRC(selectedEscuela, "pre");
            const porcentajePosRC = await getPorcentajePMParaRC(selectedEscuela, "pos");
            const porcentajeAmbosRC = await getPorcentajePMParaRC(selectedEscuela, "ambos");
            
            setPorcentajePMRC({
              pre: porcentajePreRC,
              pos: porcentajePosRC,
              ambos: porcentajeAmbosRC
            });
            
            const listaPrePMRC = await getProgramasEnPlanMejoramientoRC(selectedEscuela, "Pregrado");
            const lisaPosPMRC = await getProgramasEnPlanMejoramientoRC(selectedEscuela, "Posgrado");
            
            setProgramasEnPMRC({
              pre: listaPrePMRC,
              pos: lisaPosPMRC
            });
            
          } catch (error) {
            console.error("Error cargando datos:", error);
          }
        };
        
        cargarDatos();
      }, [selectedEscuela, programasData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseData = await dataEscuelas();
                setData(responseData);

                const programasData = await dataProgramas();
                setProgramasData(programasData); 

            } catch (error) {
                console.error('Error al cargar los datos:', error);
            }
        };

        fetchData();
    }, []);

    const handleCorteClick = async () => {
        const today = format(new Date(), 'dd/MM/yyyy');
        const filteredData = data.filter(item => item.escuela === selectedEscuela);

        const cleanData = value => (value === "#DIV/0!" || value === undefined ? 0 : value);
        const dataToSend = filteredData.map(item => {
            return {
                id: item.id,
                escuela: item.escuela,
                porc_anexos_pre: cleanData(scores.pre[0]),
                porc_evidencias_pre: cleanData(scores.pre[1]),
                cant_acred_renov_pre: cleanData(scores.pre[2]),
                porc_pm_pre: cleanData(scores.pre[3]),
                porc_anexos_pos: cleanData(scores.pos[0]),
                porc_evidencias_pos: cleanData(scores.pos[1]),
                cant_acred_renov_pos: cleanData(scores.pos[2]),
                porc_pm_pos: cleanData(scores.pos[3]),
                descripcion_1: descriptions.descripcion_1,
                descripcion_2: descriptions.descripcion_2,
                descripcion_3: descriptions.descripcion_3,
                descripcion_4: descriptions.descripcion_4,
                fecha_corte: today
            };
        });

        const dataSend = [
            dataToSend[0].id,
            dataToSend[0].escuela,
            dataToSend[0].porc_anexos_pre,
            dataToSend[0].porc_evidencias_pre,
            dataToSend[0].cant_acred_renov_pre,
            dataToSend[0].porc_pm_pre,
            dataToSend[0].porc_anexos_pos,
            dataToSend[0].porc_evidencias_pos,
            dataToSend[0].cant_acred_renov_pos,
            dataToSend[0].porc_pm_pos,
            dataToSend[0].fecha_corte,
            dataToSend[0].descripcion_1,
            dataToSend[0].descripcion_2,
            dataToSend[0].descripcion_3,
            dataToSend[0].descripcion_4
        ];

        console.log('Data to send:', dataSend);

        try {
            const response = await sendDataEscula(dataSend);
            console.log('Response from server:', response);
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }
    };

    // Función para guardar los datos de la escuela seleccionada
    const handleGuardarClick = async () => {
        setLoading(true); 
        const filteredData = data.find(item => item.escuela === selectedEscuela);
        if (!filteredData) {
            console.error('No se encontraron datos para la escuela seleccionada');
            setLoading(false);
            return;
        }
    
        const updatedData = {
            id: filteredData.id,
            escuela: filteredData.escuela,
            por_evi_pre: scores.pre[1] || '',
            por_evi_pos: scores.pos[1] || '',
            descripcion_1_pre: descriptions.descripcion_1_pre || '',
            descripcion_2_pre: descriptions.descripcion_2_pre || '',
            descripcion_3_pre: descriptions.descripcion_3_pre || '',
            descripcion_4_pre: descriptions.descripcion_4_pre || '',
            descripcion_5_pre: descriptions.descripcion_5_pre || '',
            descripcion_1_pos: descriptions.descripcion_1_pos || '',
            descripcion_2_pos: descriptions.descripcion_2_pos || '',
            descripcion_3_pos: descriptions.descripcion_3_pos || '',
            descripcion_4_pos: descriptions.descripcion_4_pos || '',
            descripcion_5_pos: descriptions.descripcion_5_pos || ''
        };
    
        const dataupdateescuela = [
            updatedData.id,
            updatedData.escuela,
            filteredData.porc_anexos_pre,
            filteredData.cant_rc_pre,
            filteredData.cant_aac_pre,
            filteredData.porc_pm_pre,
            updatedData.por_evi_pre,
            filteredData.acreditable_pre,
            filteredData.cant_rcVigente_pre,
            filteredData.cant_acVigente_pre,
            filteredData.porc_anexos_pos,
            filteredData.cant_rc_pos,
            filteredData.cant_aac_pos,
            filteredData.porc_pm_pos,
            updatedData.por_evi_pos,
            filteredData.acreditable_pos,
            filteredData.cant_rcVigente_pos,
            filteredData.cant_acVigente_pos,
            updatedData.descripcion_1_pre,
            updatedData.descripcion_2_pre,
            updatedData.descripcion_3_pre,
            updatedData.descripcion_4_pre,
            updatedData.descripcion_5_pre,
            updatedData.descripcion_1_pos,
            updatedData.descripcion_2_pos,
            updatedData.descripcion_3_pos,
            updatedData.descripcion_4_pos,
            updatedData.descripcion_5_pos,
            null,            
        ];
    
        try {
            await updateDataEscuela(dataupdateescuela, filteredData.id);
            console.log('Datos actualizados correctamente en el servidor.');
            setShowModal(true); 
        } catch (error) {
            console.error('Error al actualizar datos en el servidor:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const getProgramas = () => {
        let tipo;
        switch (selectedProgramType) {
            case 'pre':
                tipo = 'pregrado';
                break;
            case 'pos':
                tipo = 'posgrado';
                break;
            case 'ambos':
            default:
                tipo = 'pregrado y posgrado';
                break;
        }
        return programasBase.map(program => program.replace('{tipo}', tipo));
    };

    const getProgramasAcreditados = (escuela, tipo) => {
        console.log(`Buscando programas para: ${escuela} - ${tipo}`);
        
        if (!programasData || programasData.length === 0) {
          console.log("No hay datos de programas cargados");
          return "Ninguno";
        }
        
        // Filtrar los programas con una comparación insensible a mayúsculas/minúsculas
        const programasFiltrados = programasData.filter(programa => {
          // Normalizamos los nombres de las propiedades
          const programaNormalizado = Object.fromEntries(
            Object.entries(programa).map(([key, value]) => [key.toLowerCase(), value])
          );
          
          // Verificar escuela (insensible a mayúsculas/minúsculas)
          const escuelaMatch = 
            (programaNormalizado.escuela?.toLowerCase() === escuela.toLowerCase()) ||
            (programaNormalizado.e?.toLowerCase() === escuela.toLowerCase());
          
          // Verificar tipo pregrado/posgrado (insensible a mayúsculas/minúsculas)
          const tipoMatch = 
            (programaNormalizado["pregrado/posgrado"]?.toLowerCase() === tipo.toLowerCase());
          
          // Verificar si tiene AC vigente
          const acreditadoMatch = 
            (programaNormalizado["ac vigente"] === "SI") ||
            (programaNormalizado["ac vigente"] === "Si");
          
          if (escuelaMatch && tipoMatch) {
            console.log("Programa que cumple escuela y tipo:", programa);
            console.log(`AC vigente: ${programaNormalizado["ac vigente"]}`);
          }
          
          return escuelaMatch && tipoMatch && acreditadoMatch;
        });
        
        console.log(`Programas filtrados finales: ${programasFiltrados.length}`);
        
        if (programasFiltrados.length === 0) return "Ninguno";
        
        // Usar el nombre correcto del campo según los datos
        return programasFiltrados
          .map(p => p["programa académico"] || p["Programa Académico"] || p["programa academico"])
          .join(", ");
    };

    const getProgramasConRCVigente = (escuela, tipo) => {
        console.log(`Buscando programas con RC vigente para: ${escuela} - ${tipo}`);
        
        if (!programasData || programasData.length === 0) {
          console.log("No hay datos de programas cargados");
          return "Ninguno";
        }
        
        // Fecha actual para comparar
        const fechaActual = new Date();
        
        // Filtrar los programas con una comparación insensible a mayúsculas/minúsculas
        const programasFiltrados = programasData.filter(programa => {
          // Normalizamos los nombres de las propiedades
          const programaNormalizado = Object.fromEntries(
            Object.entries(programa).map(([key, value]) => [key.toLowerCase(), value])
          );
          
          // Verificar escuela (insensible a mayúsculas/minúsculas)
          const escuelaMatch = 
            (programaNormalizado.escuela?.toLowerCase() === escuela.toLowerCase()) ||
            (programaNormalizado.e?.toLowerCase() === escuela.toLowerCase());
          
          // Verificar tipo pregrado/posgrado (insensible a mayúsculas/minúsculas)
          const tipoMatch = 
            (programaNormalizado["pregrado/posgrado"]?.toLowerCase() === tipo.toLowerCase());
          
          // Verificar si tiene RC vigente
          const rcVigenteMatch = 
            (programaNormalizado["rc vigente"] === "SI") ||
            (programaNormalizado["rc vigente"] === "Si");
          
          // También verificar fecha de vencimiento si está disponible
          let fechaVigente = false;
          if (programaNormalizado["fechavencrc"]) {
            try {
              const partes = programaNormalizado["fechavencrc"].split('/');
              if (partes.length === 3) {
                const fechaVencimiento = new Date(
                  parseInt(partes[2]), // año
                  parseInt(partes[1]) - 1, // mes (0-11)
                  parseInt(partes[0]) // día
                );
                fechaVigente = fechaVencimiento > fechaActual;
              }
            } catch (e) {
              console.error("Error al procesar fecha:", e);
            }
          }
          
          // Añadir fechaVigente a la condición de filtro
          return escuelaMatch && tipoMatch && rcVigenteMatch && fechaVigente;
        });
        
        console.log(`Programas con RC vigente encontrados: ${programasFiltrados.length}`);
        
        if (programasFiltrados.length === 0) return "Ninguno";
        
        // Usar el nombre correcto del campo según los datos
        return programasFiltrados
          .map(p => p["programa académico"] || p["Programa Académico"] || p["programa academico"])
          .join(", ");
    };

    const getPorcentajeRCVigente = (escuela, tipo) => {
        console.log(`Calculando porcentaje RC vigente para: ${escuela} - ${tipo}`);
        
        if (!programasData || programasData.length === 0) {
          return "-";
        }
        
        // Filtrar programas por escuela y tipo
        const programasEscuelaTipo = programasData.filter(programa => {
          const programaNormalizado = Object.fromEntries(
            Object.entries(programa).map(([key, value]) => [key.toLowerCase(), value])
          );
          
          const escuelaMatch = programaNormalizado.escuela?.toLowerCase() === escuela.toLowerCase();
          const tipoMatch = programaNormalizado["pregrado/posgrado"]?.toLowerCase() === tipo.toLowerCase();
          
          return escuelaMatch && tipoMatch;
        });
        
        // Programas que tienen una fecha válida en FechaExpedRC (denominador)
        const programasConFechaExpedicion = programasEscuelaTipo.filter(programa => {
          const programaNormalizado = Object.fromEntries(
            Object.entries(programa).map(([key, value]) => [key.toLowerCase(), value])
          );
          
          // Excluir valores vacíos, N/A y #N/A
          const fechaExpedRC = programaNormalizado["fechaexpedrc"];
          return fechaExpedRC && 
                 fechaExpedRC.trim() !== "" && 
                 fechaExpedRC.trim().toUpperCase() !== "N/A" &&
                 fechaExpedRC.trim() !== "#N/A";
        });
        
        // Programas que tienen RC Vigente = "SI" (numerador)
        const programasRCVigente = programasEscuelaTipo.filter(programa => {
          const programaNormalizado = Object.fromEntries(
            Object.entries(programa).map(([key, value]) => [key.toLowerCase(), value])
          );
          
          return programaNormalizado["rc vigente"] === "SI" || programaNormalizado["rc vigente"] === "Si";
        });
        
        // Calcular porcentaje según la fórmula corregida
        const cantidadConFechaExpedicion = programasConFechaExpedicion.length;
        const cantidadRCVigente = programasRCVigente.length;
        
        console.log(`Total programas ${escuela} ${tipo}: 
          - Total: ${programasEscuelaTipo.length}
          - Con fecha expedición RC: ${cantidadConFechaExpedicion}
          - Con RC vigente="SI": ${cantidadRCVigente}`);
        
        if (cantidadConFechaExpedicion === 0) return "-";
        
        const porcentaje = (cantidadRCVigente / cantidadConFechaExpedicion) * 100;
        return porcentaje.toFixed(2).replace('.', ',') + '%';
    };

    const getPorcentajePMParaAcreditacion = async (escuela, tipo) => {
      console.log(`Calculando porcentaje PM para Acreditación usando hscpm_aac: ${escuela} - ${tipo}`);
      
      try {
        // 1. Obtener datos de la hoja PROGRAMAS_PM
        const dataPM = await dataSegui();
        if (!dataPM || dataPM.length === 0) {
          console.error("No hay datos de programas_pm disponibles");
          return "-";
        }
        
        // 2. Crear mapa de programas por ID
        const programasMap = {};
        programasData.forEach(programa => {
          const idPrograma = programa.id_programa || programa.ID_PROGRAMA;
          if (idPrograma) {
            programasMap[idPrograma] = programa;
          }
        });
        
        // 3. Filtrar programas por escuela y tipo
        let programasFiltrados = [];
        if (escuela === "todos") {
          programasFiltrados = dataPM;
        } else {
          programasFiltrados = dataPM.filter(item => {
            const idPrograma = item.id_programa;
            const programaCompleto = programasMap[idPrograma];
            
            if (!programaCompleto) return false;
            
            const escuelaPrograma = (programaCompleto.escuela || programaCompleto.Escuela || '').toLowerCase();
            
            let tipoMatch = true;
            if (tipo !== "ambos") {
              const tipoPrograma = (programaCompleto["pregrado/posgrado"] || programaCompleto["Pregrado/Posgrado"] || '').toLowerCase();
              tipoMatch = tipo === "pre" ? tipoPrograma === "pregrado" : tipoPrograma === "posgrado";
            }
            
            return escuelaPrograma === escuela.toLowerCase() && tipoMatch;
          });
        }
        
        // 4. Contar programas que tienen "SI" en hscpm_aac (denominador)
        const programasConHSCPM = programasFiltrados.filter(item => {
          // Verificar si tiene "SI" en hscpm_aac
          const valor = item.hscpm_aac && item.hscpm_aac.toString().trim().toUpperCase();
          return valor === "SI" || valor === "SÍ";
        });
        
        console.log(`Total programas filtrados para ${escuela}-${tipo}: ${programasFiltrados.length}`);
    
        // Mostrar los valores de hscpm_aac para diagnóstico
        console.log("Valores de hscpm_aac encontrados:");
        programasFiltrados.forEach((item, index) => {
          const idPrograma = item.id_programa;
          const programaCompleto = programasMap[idPrograma];
          const nombrePrograma = programaCompleto ? 
            (programaCompleto["Programa Académico"] || programaCompleto["programa académico"] || idPrograma) : 
            idPrograma;
          
          console.log(`${index + 1}. ${nombrePrograma}: ${item.hscpm_aac || 'No tiene valor'}`);
        });
    
        // Clasificar los valores para verificar la lógica de filtrado
        const hscpmSI = programasFiltrados.filter(item => {
          const valor = item.hscpm_aac && item.hscpm_aac.toString().trim().toUpperCase();
          return valor === "SI" || valor === "SÍ";
        }).length;
    
        const hscpmNO = programasFiltrados.filter(item => {
          const valor = item.hscpm_aac && item.hscpm_aac.toString().trim().toUpperCase();
          return valor === "NO";
        }).length;
    
        const hscpmOtros = programasFiltrados.filter(item => {
          if (!item.hscpm_aac) return true;
          const valor = item.hscpm_aac.toString().trim().toUpperCase();
          return valor !== "SI" && valor !== "SÍ" && valor !== "NO";
        }).length;
    
        console.log(`Resumen de hscpm_aac: Total=${programasFiltrados.length}, SI=${hscpmSI}, NO=${hscpmNO}, Otros=${hscpmOtros}`);
    
        console.log(`Programas con SI en hscpm_aac: ${programasConHSCPM.length}`);
        
        // 5. De estos, contar cuántos están en estado Diseño, Rediseño o Seguimiento (numerador)
        const programasConHSCPMEnEstados = programasConHSCPM.filter(item => {
          const estado = (item.estado_pm || '').toString().toLowerCase();
          return estado === "diseño" || estado === "diseno" || 
                 estado === "rediseño" || estado === "rediseno" || 
                 estado === "seguimiento";
        });
        
        const totalProgramasConHSCPM = programasConHSCPM.length;
        const totalProgramasConHSCPMEnEstados = programasConHSCPMEnEstados.length;
        
        console.log(`RESUMEN FINAL: Programas con SI en hscpm_aac: ${totalProgramasConHSCPM}, En estados D/R/S: ${totalProgramasConHSCPMEnEstados}`);
        
        if (totalProgramasConHSCPM === 0) {
          return "-"; // No hay programas con hscpm_aac=SI para calcular
        }
        
        const porcentaje = (totalProgramasConHSCPMEnEstados / totalProgramasConHSCPM) * 100;
        return porcentaje.toFixed(2).replace('.', ',') + '%';
      } catch (error) {
        console.error("Error calculando porcentaje PM:", error);
        return "-";
      }
    };
      
    const getProgramasEnPlanMejoramiento = async (escuela, tipo) => {
      try {
        // 1. Obtener datos de la hoja PROGRAMAS_PM
        const dataPM = await dataSegui();
        if (!dataPM || dataPM.length === 0) {
          return "Ninguno";
        }
        
        // 2. Crear mapa de programas por ID
        const programasMap = {};
        programasData.forEach(programa => {
          const idPrograma = programa.id_programa || programa.ID_PROGRAMA;
          if (idPrograma) {
            programasMap[idPrograma] = programa;
          }
        });
        
        // 3. Filtrar programas por escuela y tipo
        const programasFiltrados = dataPM.filter(item => {
          const idPrograma = item.id_programa;
          const programaCompleto = programasMap[idPrograma];
          
          if (!programaCompleto) return false;
          
          const escuelaPrograma = (programaCompleto.escuela || programaCompleto.Escuela || '').toLowerCase();
          let tipoMatch = true;
          
          if (tipo !== "ambos") {
            const tipoPrograma = (programaCompleto["pregrado/posgrado"] || programaCompleto["Pregrado/Posgrado"] || '').toLowerCase();
            tipoMatch = tipo.toLowerCase() === tipoPrograma;
          }
          
          return escuelaPrograma === escuela.toLowerCase() && tipoMatch;
        });
        
        // 4. Filtrar los que tienen "SI" en hscpm_aac y están en estados D/R/S
        const programasEnPM = programasFiltrados.filter(item => {
          // Verificar si tiene "SI" en hscpm_aac
          const tieneHSCPM = (item.hscpm_aac && 
                             item.hscpm_aac.toString().trim().toUpperCase() === "SI") ||
                             (item.hscpm_aac && 
                             item.hscpm_aac.toString().trim().toUpperCase() === "SÍ");
          
          // Verificar estado
          const estado = (item.estado_pm || '').toString().toLowerCase();
          const estadoValido = estado === "diseño" || estado === "diseno" || 
                              estado === "rediseño" || estado === "rediseno" || 
                              estado === "seguimiento";
          
          return tieneHSCPM && estadoValido;
        });
        
        const listaProgramas = programasEnPM.map(item => {
          const programaCompleto = programasMap[item.id_programa];
          if (!programaCompleto) return '';
          
          const nombrePrograma = programaCompleto["Programa Académico"] || 
                                programaCompleto["programa académico"] || 
                                programaCompleto["programa academico"];
          
          return `${nombrePrograma} (${item.estado_pm})`;
        }).filter(nombre => nombre !== '');
        
        return listaProgramas.length > 0 ? listaProgramas.join(", ") : "Ninguno";
      } catch (error) {
        console.error("Error al obtener programas en plan de mejoramiento:", error);
        return "Error al cargar datos";
      }
    };

    // Función para generar el resumen agrupado por estado (Diseño, Rediseño, Seguimiento)
    const generateResumen = (data) => {
        const resumen = {};

        data.forEach((item) => {
            const { escuela, estado_pm } = item;

            if (!resumen[escuela]) {
                resumen[escuela] = { diseño: 0, rediseño: 0, seguimiento: 0 };
            }

            // Contar el estado de cada programa
            if (estado_pm === 'Diseño') {
                resumen[escuela].diseño += 1;
            } else if (estado_pm === 'Rediseño') {
                resumen[escuela].rediseño += 1;
            } else if (estado_pm === 'Seguimiento') {
                resumen[escuela].seguimiento += 1;
            }
        });

        return resumen;
    };

    const handleResumenClick = async () => {
        setSelectedEscuela(''); 
        setShowResumen(true); 
        try {
            const data = await dataSegui(); 
            const resumen = generateResumen(data); 
            setResumenData(resumen);
        } catch (error) {
            console.error('Error al obtener datos para el resumen:', error);
        }
    };

    useEffect(() => {
        // Mostrar el resumen por defecto cuando se carga el componente
        handleResumenClick();
    }, []);

    const calculateTotals = () => {
        let totalDiseño = 0;
        let totalRediseño = 0;
        let totalSeguimiento = 0;

        if (resumenData) {
            Object.values(resumenData).forEach((counts) => {
                totalDiseño += counts.diseño;
                totalRediseño += counts.rediseño;
                totalSeguimiento += counts.seguimiento;
            });
        }

        return { totalDiseño, totalRediseño, totalSeguimiento };
    };

    const { totalDiseño, totalRediseño, totalSeguimiento } = calculateTotals();

    return (
        <>
            <Header />
            <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "-40px", marginBottom: "10px" }}>
                <h1>Seguimiento al Plan de Mejoramiento por Escuelas</h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
                    {escuelas.map(escuela => (
                        <StyledButton
                            key={escuela}
                            className={selectedEscuela === escuela ? 'active' : ''}
                            onClick={() => handleClickOpen(escuela)}
                        >
                            {escuela}
                        </StyledButton>
                    ))}
                    <StyledButton
                        onClick={handleResumenClick}
                        className={showResumen ? 'active' : ''}
                    >
                        Resumen
                    </StyledButton>
                </div>

                <div style={{ flex: 1, marginLeft: '50px' }}>
                    {showResumen && resumenData && (
                        <Table style={{ width: "90%", marginTop: '20px' }}>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Escuela</StyledTableCell>
                                    <StyledTableCell>Diseño</StyledTableCell>
                                    <StyledTableCell>Rediseño</StyledTableCell>
                                    <StyledTableCell>Seguimiento</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(resumenData).map((escuela) => (
                                    <TableRow key={escuela}>
                                        <TableCell>{escuela}</TableCell>
                                        <TableCell>{resumenData[escuela].diseño}</TableCell>
                                        <TableCell>{resumenData[escuela].rediseño}</TableCell>
                                        <TableCell>{resumenData[escuela].seguimiento}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <StyledTableCell><strong>Total</strong></StyledTableCell>
                                    <StyledTableCell><strong>{totalDiseño}</strong></StyledTableCell>
                                    <StyledTableCell><strong>{totalRediseño}</strong></StyledTableCell>
                                    <StyledTableCell><strong>{totalSeguimiento}</strong></StyledTableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    )}

                    {selectedEscuela && !showResumen && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', marginBottom: '20px' }}>
                                <Typography variant="h4" gutterBottom>{selectedEscuela}</Typography>
                                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', left: '50px' }}>
                                    <Button
                                        variant={selectedProgramType === 'ambos' ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedProgramType('ambos')}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Pregrado y Posgrado
                                    </Button>
                                    <Button
                                        variant={selectedProgramType === 'pre' ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedProgramType('pre')}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Pregrado
                                    </Button>
                                    <Button
                                        variant={selectedProgramType === 'pos' ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedProgramType('pos')}
                                    >
                                        Posgrado
                                    </Button>
                                </div>
                            </div>
                            <Table style={{ width: "98%" }}>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>#</StyledTableCell>
                                        <StyledTableCell style={{ width: '40%' }}>Criterio para la Escuela de {selectedEscuela}</StyledTableCell>
                                        <StyledTableCell>Ponderación</StyledTableCell>
                                        <StyledTableCell>Resultado Logrado</StyledTableCell>
                                        <StyledTableCell style={{ width: '40%' }}>Descripción de lo logrado</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getProgramas().map((program, index) => (
                                        <TableRow key={program}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{program}</TableCell>
                                            <TableCell>{ponderacionesProgramas[index]}</TableCell>
                                            <TableCell>
                                            <Typography 
                                                    variant="body1"
                                                    style={{ 
                                                        width: '90px',
                                                        fontWeight: 'bold' 
                                                    }}
                                                >
                                                    {(index === 0)  
                                                        ? (() => {
                                                            // Para el primer criterio (% programas Acreditados)
                                                            if (selectedProgramType === 'ambos') {
                                                                // Código existente para vista combinada
                                                                const escuelaData = data.find(d => d.escuela === selectedEscuela) || {};
                                                                const acreditablePre = Number(escuelaData.acreditable_pre || 0);
                                                                const acreditablePos = Number(escuelaData.acreditable_pos || 0);
                                                                const acreditadosPre = Number(escuelaData.cant_acvigente_pre || 0);
                                                                const acreditadosPos = Number(escuelaData.cant_acvigente_pos || 0);
                                                                
                                                                const totalAcreditable = acreditablePre + acreditablePos;
                                                                const totalAcreditados = acreditadosPre + acreditadosPos;
                                                                
                                                                if (totalAcreditable === 0 && totalAcreditados === 0) return "-";
                                                                
                                                                return totalAcreditable > 0
                                                                    ? ((totalAcreditados / totalAcreditable) * 100).toFixed(2).replace('.', ',') + '%'
                                                                    : "0%";
                                                            } else {
                                                                // Para vistas individuales, usar el valor existente
                                                                return scores[selectedProgramType][index] || '';
                                                            }
                                                        })()
                                                        : (index === 1) 
                                                        ? (() => {
                                                            // Para el segundo criterio (% programas con RC vigente)
                                                            if (selectedProgramType === 'ambos') {
                                                                // Programas de pregrado con fecha expedición
                                                                const programasPreConFechaExpedicion = programasData.filter(p => 
                                                                    p.escuela === selectedEscuela && 
                                                                    p["pregrado/posgrado"]?.toLowerCase() === "pregrado" &&
                                                                    p["fechaexpedrc"] && 
                                                                    p["fechaexpedrc"].trim() !== "" &&
                                                                    p["fechaexpedrc"].trim().toUpperCase() !== "N/A" &&
                                                                    p["fechaexpedrc"].trim() !== "#N/A"
                                                                );
                                                                
                                                                // Programas de posgrado con fecha expedición
                                                                const programasPosConFechaExpedicion = programasData.filter(p => 
                                                                    p.escuela === selectedEscuela && 
                                                                    p["pregrado/posgrado"]?.toLowerCase() === "posgrado" &&
                                                                    p["fechaexpedrc"] && 
                                                                    p["fechaexpedrc"].trim() !== "" &&
                                                                    p["fechaexpedrc"].trim().toUpperCase() !== "N/A" &&
                                                                    p["fechaexpedrc"].trim() !== "#N/A"
                                                                );
                                                                
                                                                // Programas con RC vigente = SI
                                                                const programasRCVigentePre = programasData.filter(p => 
                                                                    p.escuela === selectedEscuela && 
                                                                    p["pregrado/posgrado"]?.toLowerCase() === "pregrado" &&
                                                                    (p["rc vigente"] === "SI" || p["rc vigente"] === "Si")
                                                                );
                                                                
                                                                const programasRCVigentePos = programasData.filter(p => 
                                                                    p.escuela === selectedEscuela && 
                                                                    p["pregrado/posgrado"]?.toLowerCase() === "posgrado" &&
                                                                    (p["rc vigente"] === "SI" || p["rc vigente"] === "Si")
                                                                );
                                                                
                                                                // Total denominadores y numeradores
                                                                const totalConFechaExpedicion = programasPreConFechaExpedicion.length + programasPosConFechaExpedicion.length;
                                                                const totalRCVigente = programasRCVigentePre.length + programasRCVigentePos.length;
                                                                
                                                                console.log(`Cálculo RC vigente combinado: ${totalRCVigente}/${totalConFechaExpedicion}`);
                                                                
                                                                if (totalConFechaExpedicion === 0) return "-";
                                                                
                                                                return ((totalRCVigente / totalConFechaExpedicion) * 100).toFixed(2).replace('.', ',') + '%';
                                                            } else if (selectedProgramType === 'pre') {
                                                                // Calcular directamente RC vigente de pregrado
                                                                return getPorcentajeRCVigente(selectedEscuela, "Pregrado");
                                                            } else if (selectedProgramType === 'pos') {
                                                                // Calcular directamente RC vigente de posgrado
                                                                return getPorcentajeRCVigente(selectedEscuela, "Posgrado");
                                                            } else {
                                                                return "-"; // Caso por defecto
                                                            }
                                                        })()
                                                        : (index === 2) 
                                                    ? (() => {
                                                        // Para el tercer criterio (% programas en plan de mejoramiento para Acreditación)
                                                        return porcentajePM[selectedProgramType] || "-";
                                                    })()
                                                        : (index === 3) 
                                                    ? (() => {
                                                        // Para el cuarto criterio (% programas en plan de mejoramiento para RC)
                                                        return porcentajePMRC[selectedProgramType] || "-";
                                                    })()
                                                        : scores[selectedProgramType][index] || '' // Para los demás criterios
                                                }
                                            </Typography>
                                            </TableCell>
                                            <TableCell>
                                            <Typography 
                                                variant="body1"
                                                style={{ 
                                                    width: '100%',
                                                    whiteSpace: 'pre-wrap'
                                                }}
                                            >
                                                        {index === 0 ? (
                                                            selectedProgramType === 'ambos'
                                                                ? `Los programas académicos acreditados de pregrado son: ${getProgramasAcreditados(selectedEscuela, "Pregrado")}.\n\nLos programas académicos acreditados de posgrado son: ${getProgramasAcreditados(selectedEscuela, "Posgrado")}.`
                                                                : selectedProgramType === 'pre'
                                                                    ? `Los programas académicos acreditados son: ${getProgramasAcreditados(selectedEscuela, "Pregrado")}.`
                                                                    : `Los programas académicos acreditados son: ${getProgramasAcreditados(selectedEscuela, "Posgrado")}.`
                                                        ) : index === 1 ? (
                                                            selectedProgramType === 'ambos'
                                                                ? `Los programas académicos con Registro Calificado vigente de pregrado son: ${getProgramasConRCVigente(selectedEscuela, "Pregrado")}.\n\nLos programas académicos con Registro Calificado vigente de posgrado son: ${getProgramasConRCVigente(selectedEscuela, "Posgrado")}.`
                                                                : selectedProgramType === 'pre'
                                                                    ? `Los programas académicos con Registro Calificado vigente son: ${getProgramasConRCVigente(selectedEscuela, "Pregrado")}.`
                                                                    : `Los programas académicos con Registro Calificado vigente son: ${getProgramasConRCVigente(selectedEscuela, "Posgrado")}.`
                                                        ) : index === 2 ? (
                                                            selectedProgramType === 'ambos'
                                                                ? `Los programas con plan de mejoramiento acreditado de pregrado son: ${programasEnPM.pre}.\n\nLos programas con plan de mejoramiento acreditado de posgrado son: ${programasEnPM.pos}.`
                                                                : selectedProgramType === 'pre'
                                                                    ? `Los programas con plan de mejoramiento acreditado son: ${programasEnPM.pre}.`
                                                                    : `Los programas con plan de mejoramiento acreditado son: ${programasEnPM.pos}.`
                                                        
                                                        ): index === 3 ? (
                                                            selectedProgramType === 'ambos'
                                                                ? `Los programas con plan de mejoramiento para Registro Calificado de pregrado son: ${programasEnPMRC.pre}.\n\nLos programas con plan de mejoramiento para Registro Calificado de posgrado son: ${programasEnPMRC.pos}.`
                                                                : selectedProgramType === 'pre'
                                                                    ? `Los programas con plan de mejoramiento para Registro Calificado son: ${programasEnPMRC.pre}.`
                                                                    : `Los programas con plan de mejoramiento para Registro Calificado son: ${programasEnPMRC.pos}.`
                                                        ) :(
                                                            selectedProgramType === 'ambos'
                                                                ? (descriptions[`descripcion_${index + 1}_pre`] || '') + 
                                                                  (descriptions[`descripcion_${index + 1}_pos`] ? '\n\nPosgrado:\n' + descriptions[`descripcion_${index + 1}_pos`] : '')
                                                                : selectedProgramType === 'pre'
                                                                    ? descriptions[`descripcion_${index + 1}_pre`] || ''
                                                                    : descriptions[`descripcion_${index + 1}_pos`] || ''
         
                                                    )}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', width: '90%' }}>
                                {/* <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCorteClick}
                                >
                                    Hacer corte
                                </Button> */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleGuardarClick}
                                    disabled={loading} 
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Guardar'} 
                                </Button>
                            </div>
                            </>
                    )}
                </div>
            </div>
            <Dialog open={showModal} onClose={handleCloseModal}>
                <DialogTitle>Datos guardados</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sus datos han sido guardados correctamente.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SeguimientoInicio;
