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
import { sendDataEscula, dataEscuelas, updateDataEscuela, dataSegui } from '../service/data';

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
    const [scores, setScores] = useState({});
    const [descriptions, setDescriptions] = useState({});
    const [data, setData] = useState([]);
    const [selectedProgramType, setSelectedProgramType] = useState('ambos');
    const [loading, setLoading] = useState(false); 
    const [showModal, setShowModal] = useState(false); 

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
            ]
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
        const fetchData = async () => {
            try {
                const responseData = await dataEscuelas();
                setData(responseData);
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
                                <div>
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
                            <Table style={{ width: "90%" }}>
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
                                                <TextField
                                                    variant="outlined"
                                                    value={
                                                        selectedProgramType === 'ambos'
                                                            ? (index === 0) 
                                                            ? (() => {
                                                                // Para el primer criterio (Porcentaje de programas Acreditados)
                                                                const escuelaData = data.find(d => d.escuela === selectedEscuela) || {};
                                                                const acreditablePre = Number(escuelaData.acreditable_pre || 0);
                                                                const acreditablePos = Number(escuelaData.acreditable_pos || 0);
                                                                const acreditadosPre = Number(escuelaData.cant_acvigente_pre || 0);
                                                                const acreditadosPos = Number(escuelaData.cant_acvigente_pos || 0);
                                                                
                                                                // Calcular el total
                                                                const totalAcreditable = acreditablePre + acreditablePos;
                                                                const totalAcreditados = acreditadosPre + acreditadosPos;
                                                                
                                                                // Manejar el caso especial cuando ambos son 0
                                                                if (totalAcreditable === 0 && totalAcreditados === 0) return "-";
                                                                
                                                                // Calcular el porcentaje correcto basado en los totales con formato adecuado
                                                                return totalAcreditable > 0
                                                                    ? ((totalAcreditados / totalAcreditable) * 100).toFixed(2).replace('.', ',') + '%'
                                                                    : "0%";
                                                            })()
                                                                : (Number(scores.pre[index] || 0) + Number(scores.pos[index] || 0)) / 2
                                                            : scores[selectedProgramType][index] || ''
                                                    }
                                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                                    style={{ width: '90px' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                        style: { color: 'black' },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    variant="outlined"
                                                    multiline
                                                    rows={2}
                                                    value={
                                                        selectedProgramType === 'ambos'
                                                            ? (descriptions[`descripcion_${index + 1}_pre`] || '') + 
                                                              (descriptions[`descripcion_${index + 1}_pos`] ? '\n\nPosgrado:\n' + descriptions[`descripcion_${index + 1}_pos`] : '')
                                                            : selectedProgramType === 'pre'
                                                                ? descriptions[`descripcion_${index + 1}_pre`] || ''
                                                                : descriptions[`descripcion_${index + 1}_pos`] || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleDescriptionChange(
                                                            selectedProgramType === 'pre'
                                                                ? `descripcion_${index + 1}_pre`
                                                                : `descripcion_${index + 1}_pos`,
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{ width: '100%' }}
                                                />
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
