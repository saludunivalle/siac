import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CollapsibleButton from './CollapsibleButton';
import { Filtro14 } from '../service/data'; 
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Chip,
    Button,
    TextField,
    FormGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel
} from '@mui/material';
import axios from 'axios';

const DocenciaServicio = () => {
    const [data, setData] = useState([]);
    const [isCargo, setCargo] = useState([' ']);
    const [loading, setLoading] = useState(true);
    const [anexos, setAnexos] = useState([]);
    const [anexosPorEscenario, setAnexosPorEscenario] = useState({});
    
    // Estados para el formulario de anexos técnicos
    const [showAnexoForm, setShowAnexoForm] = useState(false);
    const [anexoFormData, setAnexoFormData] = useState({
        idEscenario: '',
        nombreEscenario: '',
        urlAnexo: '',
        estadoAnexo: 'Pendiente',
        tipo: '',
        vigenciaDesde: '',
        vigenciaHasta: '',
        version: '',
        procesoCalidad: '',
        cierre: '',
        observaciones: ''
    });
    const [reloadAnexos, setReloadAnexos] = useState(false);

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

    // Funciones para el formulario de anexos técnicos
    const toggleAnexoForm = () => {
        setShowAnexoForm(!showAnexoForm);
    };

    const handleAnexoInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'idEscenario') {
            // Obtener el nombre del escenario seleccionado
            const selectedScenario = data.find(item => item.id === value);
            
            setAnexoFormData({
                ...anexoFormData,
                idEscenario: value,
                nombreEscenario: selectedScenario ? selectedScenario.nombre : ''
            });
        } else {
            setAnexoFormData({
                ...anexoFormData,
                [name]: value
            });
        }
    };

    // Función para formatear fechas a DD/MM/AAAA
    const formatearFechaParaHoja = (fecha) => {
        if (!fecha) return '';
        try {
            const date = new Date(fecha);
            const dia = date.getDate().toString().padStart(2, '0');
            const mes = (date.getMonth() + 1).toString().padStart(2, '0');
            const año = date.getFullYear();
            return `${dia}/${mes}/${año}`;
        } catch {
            return fecha;
        }
    };

    // Función para enviar un anexo al servidor    
    const sendAnexoToSheet = async (anexo) => {
        try {
            // Preparar los datos para enviar en el formato que requiere la API del servidor
            const insertData = [
                [
                    anexo.id, // id del anexo
                    anexo.id_programa || '', // id del programa (puede estar vacío para anexos generales)
                    anexo.idEscenario, // id del escenario
                    anexo.nombre, // nombre del escenario
                    anexo.url, // URL del anexo
                    anexo.estado, // estado del anexo (Pendiente, En proceso, Listo)
                    anexo.tipo, // tipo
                    formatearFechaParaHoja(anexo.vigencia_desde), // vigencia desde en formato DD/MM/AAAA
                    formatearFechaParaHoja(anexo.vigencia_hasta), // vigencia hasta en formato DD/MM/AAAA
                    anexo.version, // versión
                    anexo.proceso_calidad, // proceso de calidad
                    anexo.cierre, // cierre
                    anexo.observaciones // observaciones
                ]
            ];

            console.log("=== ENVIANDO ANEXO A SHEETS ===");
            console.log("Hoja destino: ANEXOS_TEC");
            console.log("Datos del anexo a enviar:", anexo);
            console.log("Datos formateados para envío:", insertData);
            console.log("================================");

            // Especificar el nombre de la hoja de cálculo
            const sheetName = 'ANEXOS_TEC';

            // Hacer la solicitud POST al servidor con los datos y el nombre de la hoja
            const response = await axios.post('https://siac-server.vercel.app/sendDocServ', {
                insertData,
                sheetName
            });

            if (response.status === 200) {
                console.log('✅ Anexo guardado correctamente en la hoja ANEXOS_TEC:', response.data);
                return true;
            } else {
                console.error('❌ Error al guardar el anexo en la hoja:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Error al enviar el anexo al servidor:', error);
            return false;
        }
    };

    // Manejar el envío del formulario de anexos
    const handleAnexoFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!anexoFormData.idEscenario || !anexoFormData.nombreEscenario) {
                alert('Por favor selecciona un escenario de práctica válido.');
                return;
            }

            const newAnexo = {
                id: Date.now(), // usar timestamp para un ID único
                id_programa: '', // En DocenciaServicio no hay id_programa específico
                idEscenario: anexoFormData.idEscenario, // id del escenario
                nombre: anexoFormData.nombreEscenario, // nombre del escenario
                url: anexoFormData.urlAnexo, // URL del anexo o archivo
                estado: anexoFormData.estadoAnexo, // estado del anexo (Pendiente, En proceso, Listo)
                tipo: anexoFormData.tipo,
                vigencia_desde: anexoFormData.vigenciaDesde,
                vigencia_hasta: anexoFormData.vigenciaHasta,
                version: anexoFormData.version,
                proceso_calidad: anexoFormData.procesoCalidad,
                cierre: anexoFormData.cierre,
                observaciones: anexoFormData.observaciones
            };

            // Verificar los datos a enviar
            console.log("Datos del nuevo anexo:", newAnexo);

            // Enviar los datos a la hoja de cálculo
            const success = await sendAnexoToSheet(newAnexo);

            if (success) {
                // Reiniciar el formulario
                setAnexoFormData({
                    idEscenario: '',
                    nombreEscenario: '',
                    urlAnexo: '',
                    estadoAnexo: 'Pendiente',
                    tipo: '',
                    vigenciaDesde: '',
                    vigenciaHasta: '',
                    version: '',
                    procesoCalidad: '',
                    cierre: '',
                    observaciones: ''
                });
                
                setShowAnexoForm(false);
                
                // Recargar los anexos
                setTimeout(async () => {
                    setLoading(true);
                    try {
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
                        console.error('Error al recargar los datos:', error);
                    } finally {
                        setLoading(false);
                    }
                }, 500);
                
                // Mostrar mensaje de éxito
                alert('Anexo guardado correctamente');
            } else {
                alert('Error al guardar el anexo. Por favor intenta de nuevo.');
            }
            
        } catch (error) {
            console.error('Error al guardar el anexo:', error);
            alert('Error al guardar el anexo. Por favor intenta de nuevo.');
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
                            <TableCell><strong>Fecha Formalización</strong></TableCell>
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
                                                                 <TableCell>{formatearFecha(anexo.fecha_formalización)}</TableCell>
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
                    
                    {/* Botón y formulario para añadir anexos técnicos */}
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Button 
                            variant="contained" 
                            onClick={toggleAnexoForm}
                            sx={{ mb: 2 }}
                        >
                            Añadir Anexo Técnico
                        </Button>

                        {showAnexoForm && (
                            <Box component="form" onSubmit={handleAnexoFormSubmit} sx={{ 
                                marginTop: 2, 
                                maxWidth: '800px', 
                                mx: 'auto',
                                p: 3,
                                border: '1px solid #ddd',
                                borderRadius: 2,
                                backgroundColor: '#f9f9f9'
                            }}>
                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    Nuevo Anexo Técnico
                                </Typography>
                                
                                <FormGroup>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="escenarios-label">Escenarios de Práctica</InputLabel>
                                        <Select
                                            labelId="escenarios-label"
                                            id="escenarios-select"
                                            name="idEscenario"
                                            value={anexoFormData.idEscenario}
                                            onChange={handleAnexoInputChange}
                                            required
                                            label="Escenarios de Práctica"
                                        >
                                            {data.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <TextField
                                        label="URL/Archivo"
                                        name="urlAnexo"
                                        value={anexoFormData.urlAnexo}
                                        onChange={handleAnexoInputChange}
                                        margin="normal"
                                        required
                                        fullWidth
                                    />
                                    
                                    <FormControl fullWidth margin="normal" required>
                                        <InputLabel id="tipo-label">Tipo</InputLabel>
                                        <Select
                                            labelId="tipo-label"
                                            name="tipo"
                                            value={anexoFormData.tipo}
                                            onChange={handleAnexoInputChange}
                                            label="Tipo"
                                            required
                                        >
                                            <MenuItem value="C.D.S. Clinicos">C.D.S. Clinicos</MenuItem>
                                            <MenuItem value="C.D.S. No clinicos">C.D.S. No clinicos</MenuItem>
                                            <MenuItem value="C. Integración de propiedad">C. Integración de propiedad</MenuItem>
                                            <MenuItem value="C. Interinstitucionales">C. Interinstitucionales</MenuItem>
                                            <MenuItem value="C. Cooperación Académica">C. Cooperación Académica</MenuItem>
                                            <MenuItem value="OtroSi">Otro Si</MenuItem>
                                            <MenuItem value="Otros Anexos Técnicos">Otros Anexos Técnicos</MenuItem>
                                        </Select>
                                    </FormControl>
                                    
                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                        <TextField
                                            label="Vigencia Desde"
                                            name="vigenciaDesde"
                                            type="date"
                                            value={anexoFormData.vigenciaDesde}
                                            onChange={handleAnexoInputChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Vigencia Hasta"
                                            name="vigenciaHasta"
                                            type="date"
                                            value={anexoFormData.vigenciaHasta}
                                            onChange={handleAnexoInputChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            fullWidth
                                            required
                                        />
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                        <TextField
                                            label="Versión"
                                            name="version"
                                            type="number"
                                            value={anexoFormData.version}
                                            onChange={handleAnexoInputChange}
                                            required
                                            sx={{ width: '50%' }}
                                            inputProps={{ min: 1, step: 1 }}
                                        />
                                        <FormControl sx={{ width: '50%' }} required>
                                            <InputLabel id="proceso-calidad-label">Proceso de Calidad</InputLabel>
                                            <Select
                                                labelId="proceso-calidad-label"
                                                name="procesoCalidad"
                                                value={anexoFormData.procesoCalidad}
                                                onChange={handleAnexoInputChange}
                                                label="Proceso de Calidad"
                                                required
                                            >
                                                <MenuItem value="RC">RC</MenuItem>
                                                <MenuItem value="RRC">RRC</MenuItem>
                                                <MenuItem value="AAC">AAC</MenuItem>
                                                <MenuItem value="RAAC">RAAC</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    
                                    <TextField
                                        label="Cierre (Opcional)"
                                        placeholder="Este campo es opcional"
                                        name="cierre"
                                        value={anexoFormData.cierre}
                                        onChange={handleAnexoInputChange}
                                        margin="normal"
                                        fullWidth
                                    />
                                    
                                    <FormGroup sx={{ marginTop: 2 }}>
                                        <FormLabel component="legend">Estado</FormLabel>
                                        <RadioGroup
                                            name="estadoAnexo"
                                            value={anexoFormData.estadoAnexo}
                                            onChange={handleAnexoInputChange}
                                            sx={{ display: 'flex', flexDirection: 'row' }}
                                        >
                                            <FormControlLabel value="Pendiente" control={<Radio />} label="Pendiente" />
                                            <FormControlLabel value="En proceso" control={<Radio />} label="En proceso" />
                                            <FormControlLabel value="Listo" control={<Radio />} label="Listo" />
                                            <FormControlLabel value="Inactivo" control={<Radio />} label="Inactivo" />
                                        </RadioGroup>
                                    </FormGroup>
                                    
                                    {anexoFormData.estadoAnexo === 'Inactivo' && (
                                        <TextField
                                            label="Observaciones"
                                            name="observaciones"
                                            value={anexoFormData.observaciones}
                                            onChange={handleAnexoInputChange}
                                            margin="normal"
                                            multiline
                                            rows={3}
                                            fullWidth
                                        />
                                    )}

                                </FormGroup>
                                
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3 }}>
                                    <Button type="submit" variant="contained" color="primary">
                                        Guardar Anexo
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outlined" 
                                        onClick={toggleAnexoForm}
                                    >
                                        Cancelar
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                    
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
