import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CollapsibleButton from './CollapsibleButton';
import { Filtro14 } from '../service/data'; 
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import axios from 'axios';

const DocenciaServicio = () => {
    const [data, setData] = useState([]);
    const [isCargo, setCargo] = useState([' ']);
    const [loading, setLoading] = useState(true);
    const [anexos, setAnexos] = useState([]);
    const [anexosPorEscenario, setAnexosPorEscenario] = useState({});

    // Obtener los permisos del usuario desde sessionStorage
    useEffect(() => {
        if (sessionStorage.getItem('logged')) {
            const res = JSON.parse(sessionStorage.getItem('logged'));
            const permisos = res.map(item => item.permiso).flat();
            setCargo(permisos);
        }
    }, []);

    // Función para obtener los anexos técnicos
    const fetchAnexos = async () => {
        try {
            const response = await axios.post('https://siac-server.vercel.app/getAnexos', { sheetName: 'ANEXOS_TEC' });
            if (response.data && response.data.status) {
                console.log("Anexos obtenidos:", response.data.data);
                return response.data.data || [];
            } else {
                console.warn('No se pudieron obtener los anexos:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Error al obtener los anexos:', error);
            return [];
        }
    };

    // Función para agrupar anexos por escenario
    const agruparAnexosPorEscenario = (anexos, escenarios) => {
        const agrupados = {};
        
        // Inicializar cada escenario con un array vacío
        escenarios.forEach(escenario => {
            agrupados[escenario.nombre] = [];
        });

        // Agrupar anexos por nombre de escenario
        anexos.forEach(anexo => {
            if (anexo.nombre && agrupados[anexo.nombre] !== undefined) {
                agrupados[anexo.nombre].push(anexo);
            }
        });

        return agrupados;
    };

    // Efecto para obtener los datos al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Obtener escenarios y anexos en paralelo
                const [escenariosResult, anexosResult] = await Promise.all([
                    Filtro14(),
                    fetchAnexos()
                ]);
                
                setData(escenariosResult);
                setAnexos(anexosResult);
                
                // Agrupar anexos por escenario
                const agrupados = agruparAnexosPorEscenario(anexosResult, escenariosResult);
                setAnexosPorEscenario(agrupados);
                
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Función para obtener el color del chip según el estado
    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'listo':
                return 'success';
            case 'en proceso':
                return 'warning';
            case 'pendiente':
                return 'default';
            case 'inactivo':
                return 'error';
            default:
                return 'default';
        }
    };

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No definida';
        try {
            return new Date(fecha).toLocaleDateString('es-ES');
        } catch {
            return fecha;
        }
    };

    // Componente para mostrar la tabla de anexos de un escenario
    const AnexosEscenarioTable = ({ anexos }) => {
        if (!anexos || anexos.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="text.secondary">
                        No hay anexos técnicos registrados para este escenario.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Estado</strong></TableCell>
                            <TableCell><strong>Tipo</strong></TableCell>
                            <TableCell><strong>Vigencia</strong></TableCell>
                            <TableCell><strong>Versión</strong></TableCell>
                            <TableCell><strong>Proceso Calidad</strong></TableCell>
                            <TableCell><strong>Cierre</strong></TableCell>
                            <TableCell><strong>Observaciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {anexos.map((anexo, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Chip 
                                        label={anexo.estado || 'Sin estado'} 
                                        color={getEstadoColor(anexo.estado)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{anexo.tipo || 'No especificado'}</TableCell>
                                <TableCell>{anexo.vigencia || 'No especificada'}</TableCell>
                                <TableCell>{anexo.version || 'N/A'}</TableCell>
                                <TableCell>{anexo.proceso_calidad || 'N/A'}</TableCell>
                                <TableCell>{anexo.cierre || 'N/A'}</TableCell>
                                <TableCell>
                                    {anexo.estado === 'Inactivo' ? 
                                        (anexo.observaciones || 'Sin observaciones') : 
                                        'N/A'
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <>
            <Header />
            <Sidebar isCargo={isCargo} />
            <div className="content-with-sidebar">
                <Box sx={{ 
                    width: '100%', 
                    maxWidth: '1100px', 
                    mx: 'auto',
                    px: { xs: 2, sm: 3, md: 4 },
                    mt: 2,
                    ml: { xs: 'auto', md: 0 },
                    position: 'relative',
                    left: { xs: 0, md: '-30px' }
                }}>
                    <Typography variant="h4" sx={{ 
                        mb: 4,
                        fontWeight: 600,
                        color: '#333',
                        textAlign: 'center'
                    }}>
                        Escenarios de Práctica
                    </Typography>
                    
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : data.length > 0 ? (
                        data.map((item, index) => {
                            const anexosDelEscenario = anexosPorEscenario[item.nombre] || [];
                            const cantidadAnexos = anexosDelEscenario.length;
                            
                            return (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <CollapsibleButton
                                        buttonText={`${item.nombre} ${cantidadAnexos > 0 ? `(${cantidadAnexos} anexo${cantidadAnexos !== 1 ? 's' : ''})` : '(Sin anexos)'}`}
                                        content={
                                            <Box>
                                                <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                                                    Anexos Técnicos - {item.nombre}
                                                </Typography>
                                                <AnexosEscenarioTable anexos={anexosDelEscenario} />
                                            </Box>
                                        }
                                        defaultClosed={true}
                                    />
                                </Box>
                            );
                        })
                    ) : (
                        <Typography sx={{ textAlign: 'center' }}>
                            No hay escenarios de práctica disponibles.
                        </Typography>
                    )}
                </Box>
            </div>
        </>
    );
};

export default DocenciaServicio;
