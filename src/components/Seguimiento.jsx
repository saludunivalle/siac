import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Radio, RadioGroup, FormControl, FormControlLabel, TextField, InputLabel, Input, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Button, Typography, Modal, CircularProgress, FormLabel } from '@mui/material';
import { Container, Grid, IconButton, Box, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CollapsibleButton from './CollapsibleButton';
import { Filtro10, Filtro12, Filtro7, Filtro8, Filtro9, obtenerFasesProceso, sendDataToServer, sendDataToServerCrea, sendDataToServerDoc, Filtro21, sendDataFirma, FiltroFirmas } from '../service/data';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import esLocale from 'dayjs/locale/es'; 
import PracticeScenario from './PracticeScenario';
import FormComponent from './FormComponent';
import SeguimientoPM from './SeguimientoPM';
import SimpleTimeline from './SimpleTimeline';

const Seguimiento = ({ handleButtonClick }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedOption, setSelectedOption] = useState(0);
    const [selectedPhase, setSelectedPhase] = useState('');
    const location = useLocation();
    const rowData = location.state; 
    const programaAcademico = rowData['programa académico'];
    const idPrograma = rowData['id_programa'];
    const escuela = rowData['escuela'];
    const formacion = rowData['pregrado/posgrado'];
    const [value, setValue] = useState('');
    const [showCollapsible, setShowCollapsible] = useState({}); 
    const [filteredData, setFilteredData] = useState([]);
    const [comment, setComment] = useState(''); 
    const [collapsible, setCollapsible] = useState('');
    const [user, setUser] = useState('');
    const [isPlan, setPlan] = useState(['Plan de Mejoramiento', 'Sistemas']);
    const [isReg, setReg] = useState(['Renovación Registro Calificado', 'Sistemas']);
    const [isAcred, setAcred] = useState(['Acreditación', 'Sistemas']);
    const [isConv, setConv] = useState(['Convenio Docencia Servicio', 'Sistemas']);
    const [isCrea, setCrea] = useState(['Creación', 'Sistemas']);
    const [isMod, setMod] = useState(['Modificación', 'Sistemas']);
    const [isRenAcred, setRenAcred] = useState(['Renovación Acreditación', 'Sistemas']);
    const [isCargo, setCargo] = useState([' ']);
    const [openModal, setOpenModal] = useState(false);
    const [fileData, setfileData] = useState(null);
    const fileInputRef = useRef(null);
    const [fileLink, setFileLink] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [fileType, setFileType] = useState('');
    const [fases, setFases] = useState([]);
    const [fasesName, setFasesName] = useState([]);
    const [itemActual, setItemActual] = useState([]);
    const [docs, setDocs] = useState([]);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [Filtro21Data, setFiltro21Data] = useState({ id_doc: '', url: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const [dataUpdated, setDataUpdated] = useState(false);
    const [sentDocId, setSentDocId] = useState(null);
    const [fasesTabla, setFasesTabla] = useState([]);

    useEffect(() => {
        const obtenerDatosFiltro = async () => {
            try {
                const filtroData = await Filtro21();
                setFiltro21Data(filtroData);
            } catch (error) {
                console.error('Error al obtener los datos del filtro:', error);
            }
        };

        obtenerDatosFiltro();
    }, [docs]); 

    const handleOpen = (doc) => {
        setSelectedDoc(doc);
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedDoc(null);
        setOpen(false);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const date = new Date();
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        const dataSendDoc = [
            idPrograma,
            selectedDoc.id,
            inputValue,
            formattedDate,
        ];

        try {
            await sendDataToServerDoc(dataSendDoc);
            console.log("Documento:", selectedDoc.id, "idPrograma", idPrograma, "Input:", inputValue, "Fecha:", formattedDate);
            setSuccessMessage('Datos enviados correctamente');
            setSentDocId(selectedDoc.id);
            Filtro21Data.push({ id_doc: selectedDoc.id, id_programa: idPrograma, url: inputValue });
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    useEffect(() => {
        if (dataUpdated) {
            setDataUpdated(false);
        }
    }, [dataUpdated]);

    const handleToggleCalendar = () => {
        setCalendarOpen((prev) => !prev);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setCalendarOpen(false);
    };

    function calcularFechas(fechaexpedrc, fechavencrc) {
        const partesFechaExpedicion = fechaexpedrc.split('/');
        const partesFechaVencimiento = fechavencrc.split('/');
    
        const diaExpedicion = parseInt(partesFechaExpedicion[0], 10);
        const mesExpedicion = parseInt(partesFechaExpedicion[1], 10) - 1;
        const añoExpedicion = parseInt(partesFechaExpedicion[2], 10);
    
        const diaVencimiento = parseInt(partesFechaVencimiento[0], 10);
        const mesVencimiento = parseInt(partesFechaVencimiento[1], 10) - 1;
        const añoVencimiento = parseInt(partesFechaVencimiento[2], 10);
    
        const fechaUnAñoSeisMesesDespues = new Date(añoExpedicion, mesExpedicion, diaExpedicion);
        fechaUnAñoSeisMesesDespues.setMonth(fechaUnAñoSeisMesesDespues.getMonth() + 6);
        fechaUnAñoSeisMesesDespues.setFullYear(fechaUnAñoSeisMesesDespues.getFullYear() + 1);
    
        const fechaExpedicion = new Date(añoExpedicion, mesExpedicion, diaExpedicion);
        const fechaVencimiento = new Date(añoVencimiento, mesVencimiento, diaVencimiento);
        const diferenciaMilisegundos = fechaVencimiento - fechaExpedicion;
        const diferenciaAños = diferenciaMilisegundos / (1000 * 60 * 60 * 24 * 365);
        const mitadAños = diferenciaAños / 2;
        const fechaMitad = new Date(fechaExpedicion);
        fechaMitad.setFullYear(fechaMitad.getFullYear() + Math.floor(mitadAños));
        fechaMitad.setMonth(fechaMitad.getMonth() - 6);
    
        const fechaTresAñosAntes = new Date(añoVencimiento, mesVencimiento, diaVencimiento);
        fechaTresAñosAntes.setFullYear(fechaTresAñosAntes.getFullYear() - 3);
    
        const fechaDieciochoMesesAntes = new Date(añoVencimiento, mesVencimiento, diaVencimiento);
        fechaDieciochoMesesAntes.setMonth(fechaDieciochoMesesAntes.getMonth() - 18);
    
        const formatDate = (date) => {
            const day = (`0${date.getDate()}`).slice(-2);
            const month = (`0${date.getMonth() + 1}`).slice(-2);
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };
    
        return {
            unAñoSeisMesesDespues: formatDate(fechaUnAñoSeisMesesDespues),
            seisMesesAntesMitad: formatDate(fechaMitad),
            tresAñosAntes: formatDate(fechaTresAñosAntes),
            dieciochoMesesAntes: formatDate(fechaDieciochoMesesAntes)
        };
    }
    
    const fechasCalculadas = calcularFechas(rowData['fechaexpedrc'], rowData['fechavencrc']);
    const fechasCalculadasAC = calcularFechas(rowData['fechaexpedac'], rowData['fechavencac']);

    useEffect(() => {
        if (handleButtonClick != null) {
            cargarFases();
        }
    }, [handleButtonClick]);
    
    const clearFileLink = () => {
        setFileLink('');
    };

    const cargarFases = async () => {
        try {
            setLoading(true);
            let documentoproceso = '';
            let procesoActual = '';
            if (handleButtonClick === 'crea') {
                procesoActual = 'Creación';
                documentoproceso = 'Creación';
            } else if (handleButtonClick === 'rrc') {
                procesoActual = 'Renovación Registro Calificado';
                documentoproceso = 'Renovación Registro Calificado';
            } else if (handleButtonClick === 'aac') {
                procesoActual = 'Acreditación';
                documentoproceso = 'Acreditación';
            }  else if (handleButtonClick === 'raac') {
                procesoActual = 'Renovación Acreditación';
                documentoproceso = 'Renovación Acreditación';
            }  else if (handleButtonClick === 'mod') {
                procesoActual = 'Modificación';
                documentoproceso = 'Modificación';
                // if (rowData['mod_sus'] === 'SI'){
                //     documentoproceso = 'Modificación Reforma Curricular - sustancial';
                // } else if (rowData['mod_sus'] === 'NO'){
                //     documentoproceso = 'Modificación No Sustancial';
                // } 
            } 
            const general = await Filtro10();
            const general2 = general.filter(item => item['proceso'] === procesoActual); 
            const response = await obtenerFasesProceso();
            const fasesFiltradas = response.filter(item => item.id_programa === idPrograma);
            const result2 = fasesFiltradas.map(fase => {
                const filtro10Item = general.find(item => item.id === fase.id_fase);
                return filtro10Item ? filtro10Item : null;
            });
            const result3 = result2.filter(item => item && item['proceso'] === procesoActual); 
            setFases(general2);
            setFasesName(result3);
            const fase_actual = result3[0];
            setItemActual(fase_actual);
            const proceso = await Filtro12();
            const procesoFiltrado = proceso.filter(item => item['proceso'] === documentoproceso); 
            setDocs(procesoFiltrado);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar las fases:', error);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, [handleButtonClick]);

    const fetchMenuItems = async () => {
        try {
            let procesoActual = '';
            if (handleButtonClick === 'crea') {
                procesoActual = 'Creación';
            } else if (handleButtonClick === 'rrc') {
                procesoActual = 'Renovación Registro Calificado';
            } else if (handleButtonClick === 'aac') {
                procesoActual = 'Acreditación';
            }  else if (handleButtonClick === 'raac') {
                procesoActual = 'Renovación Acreditación';
            }  else if (handleButtonClick === 'mod') {
                procesoActual = 'Modificación';
            } 
            const response = await Filtro10();
            const result = response.filter(item => item['proceso'] === procesoActual); 
            setMenuItems(result);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    useEffect(() => {
        if (sessionStorage.getItem('logged')){
            let res = JSON.parse(sessionStorage.getItem('logged'));
            setCargo(res.map(item => item.permiso).flat());
            setUser(res[0].user);
        }
    }, []);

    const avaibleRange = (buscar) => {
        return isCargo.some(cargo => buscar.includes(cargo));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Filtro7(); 
                const response2 = await Filtro9(response.filter(item => item['id_programa'] === idPrograma), idPrograma);
                console.log('Datos cargados:', response2);
                setFilteredData(response2);
            } catch (error) {
                console.error('Error al filtrar datos:', error);
            }
        };
        fetchData();
    }, [updateTrigger]);
    

    const getBackgroundColor = (riesgo) => {
        switch (riesgo) {
            case 'Alto':
                return '#FED5D1';
            case 'Medio':
                return '#FEFBD1';
            case 'Bajo':
                return '#E6FFE6';
            default:
                return 'white';
        }
    };

    const getFaseName = (faseId) => {
        const fase = fasesName.find(f => f.id === faseId);
        return fase ? fase.fase : ' - ';
    };

    const contenido_tablaFases = () => {
        return (
            <>  <div>
                {loading ? ( 
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </div>
                ) : (
                    <>
                    <div style={{display:'flex', justifyContent:'center', gap:'10px', flexDirection:'row'}}>
                    <div>
                    {fases.length > 0 && (
                        <div>
                            <h2>Fases del Programa</h2>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <tbody>
                                    {fases.map((fase, index) => {
                                        const isFaseName = fasesName.find(fn => fn.proceso === fase.proceso && fn.fase === fase.fase);
                                        const isBlackOutline = isFaseName && !(itemActual && fase.fase === itemActual.fase);
                                        const backgroundColor = isBlackOutline ? '#aae3ae' : ((itemActual && fase.fase === itemActual.fase) ? '#64b06a' : '#ffffff');
                                        return (
                                            <tr key={index} style={{ backgroundColor }}>
                                                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>{fase.fase}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>
                    <div> 
                    {docs.length > 0 && (
                        <div>
                            <h2>Documentos requeridos</h2>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <tbody>
                                    {docs.map((doc, index) => {
                                        const filtroVerde = Filtro21Data.some(filtro => filtro.id_doc === doc.id && filtro.id_programa === idPrograma);
                                        const fondoVerde = filtroVerde ? { backgroundColor: '#E6FFE6', cursor: 'pointer' } : { cursor: 'pointer' };
                                        const filtro = Filtro21Data.find(filtro => filtro.id_doc === doc.id && filtro.id_programa === idPrograma);
                                        const filtroUrl = filtro ? filtro.url : null;
                                        const handleClick = filtroUrl ? () => window.open(filtroUrl, '_blank') : () => handleOpen(doc);
                                        const handleLinkClick = (event) => {
                                            event.stopPropagation();
                                        };

                                        return (
                                            <tr key={index} style={fondoVerde} onClick={handleClick}>
                                                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                                                    {filtroUrl ? <a href={filtroUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }} onClick={handleLinkClick}>{doc.nombre_doc}</a> : doc.nombre_doc}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Modal open={open} onClose={handleClose}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                            <h2>Agregar {selectedDoc && selectedDoc.nombre_doc}</h2>
                            <TextField
                                label="Link del documento"
                                value={inputValue}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar'}
                            </Button>
                            <Button variant="contained" onClick={handleClose} style={{ marginLeft: '10px' }}>
                                Cancelar
                            </Button>
                            {successMessage && <p>{successMessage}</p>}
                        </div>
                    </Modal>
                    </div>
                    </div>
                    </>
                    )}
                </div>
            </>
        );
    };

    const renderFilteredTable = (data, filters, fasesTabla, useTopicAsFase = false) => {
        if (!Array.isArray(filters)) {
            filters = [filters]; 
        }
        console.log('Renderizando tabla con filtros:', filters);
        const filteredData = Filtro8(data, filters);
        if (filteredData.length === 0) {
            return <p>Ningún programa por mostrar</p>;
        }
    
        
        filteredData.sort((a, b) => {
            const dateA = new Date(a.timestamp.split('/').reverse().join('-'));
            const dateB = new Date(b.timestamp.split('/').reverse().join('-'));
            return dateB - dateA;
        });
    
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid grey', textAlign: 'center', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th style={{ width: '3%', border: '1px solid grey' }}>Fecha</th>
                        <th style={{ width: '15%', border: '1px solid grey' }}>Comentario</th>
                        <th style={{ width: '2%', border: '1px solid grey' }}>Riesgo</th>
                        <th style={{ width: '4%', border: '1px solid grey' }}>Usuario</th>
                        <th style={{ width: '2%', border: '1px solid grey' }}>Adjunto</th>
                        <th style={{ width: '2%', border: '1px solid grey' }}>Fase</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: getBackgroundColor(item['riesgo']) }}>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['timestamp']}</td>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle', textAlign: 'left', paddingLeft: '6px', paddingRight: '6px' }}>{item['mensaje']}</td>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['riesgo']}</td>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['usuario'].split('@')[0]}</td>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>
                                {item['url_adjunto'] ? (
                                    <a href={item['url_adjunto']} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                                        Enlace
                                    </a>
                                ) : (
                                    <strong>-</strong>
                                )}
                            </td>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>
                                {useTopicAsFase ? item['topic'] : getFaseName(item['fase'])}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    
    const handleNewTrackingClick = (collapsibleType) => {
        setShowCollapsible(prevState => ({
            ...prevState,
            [collapsibleType]: !prevState[collapsibleType]
        }));
        setCollapsible(collapsibleType)
    };

    const contenido_seguimiento = () => {
        const handleInputChange1 = (event) => {
            setComment(event.target.value);
        };

        const handleGuardarClick = async () => {
            try {
                if (comment.trim() === '' || value.trim() === '' || selectedPhase.trim() === '') {
                    setLoading(false);
                    const errorMessage = 'Por favor, complete todos los campos obligatorios.';
                    setErrorMessage(errorMessage);
                    setFormSubmitted(true);
                    return;
                }

                let formattedDate;
                if (selectedDate) {
                    formattedDate = dayjs(selectedDate).format('DD/MM/YYYY');
                } else {
                    formattedDate = dayjs().format('DD/MM/YYYY');
                }

                const collapsibleType = selectedPhase === 'RRC' ? 'Plan de Mejoramiento RRC' : 'Plan de Mejoramiento RAAC';

                const dataSend = [
                    idPrograma,
                    formattedDate,
                    comment,
                    value,
                    user,
                    collapsibleType,
                    selectedOption.id,
                ];

                const dataSendCrea = [
                    idPrograma,
                    selectedOption.id,
                    formattedDate, 
                ];

                await sendDataToServer(dataSend);
                if (selectedOption.id === undefined) {
                    console.log("Opción seleccionada -> Ninguna");
                } else {
                    await sendDataToServerCrea(dataSendCrea);
                }

                clearFileLink();
                setLoading(false);
                setOpenModal(true);
                setUpdateTrigger(true);
                setComment('');
                setValue('');
                setSelectedPhase('');
                setErrorMessage(null);
            } catch (error) {
                setLoading(false);
                console.error('Error al enviar datos:', error);
            }
        };

        return (
            <>
                <div className='container-NS' style={{ fontWeight: 'bold', width: '100%', display: 'flex', flexDirection: 'row', margin: '20px', alignItems: 'center', gap: 'px' }}>
                    <div className='date-picker' style={{ flex: 1 }}>
                        <Typography variant="h6">Fecha *</Typography>
                        <div style={{ display: 'inline-block' }}>
                            <button onClick={handleToggleCalendar} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} locale={esLocale}>
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        open={calendarOpen}
                                        onClose={() => setCalendarOpen(false)}
                                        format="DD/MM/YYYY"
                                        renderInput={() => <input readOnly />}
                                    />
                                </LocalizationProvider>
                            </button>
                        </div>  
                    </div>
                    <div className='comments' style={{ flex: 1 }}>
                        <Typography variant="h6">Comentario *</Typography>
                        <TextField
                            multiline
                            rows={3}
                            required
                            value={comment}
                            onChange={handleInputChange1}
                            placeholder="Comentario"
                            type="text"
                            variant="outlined"
                            fullWidth
                            error={formSubmitted && comment.trim() === ''}
                            helperText={formSubmitted && comment.trim() === '' ? 'Este campo es obligatorio' : ''}
                        />
                    </div>
                    <div className='adj-risk-phase' style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className='risk'>
                            <Typography variant="h6">Riesgo *</Typography>
                            <FormControl component="fieldset" required error={formSubmitted && value.trim() === ''}>
                                <RadioGroup value={value} onChange={e => { setValue(e.target.value) }} style={{ display: 'flex', flexDirection: 'row' }}>
                                    <FormControlLabel value="Alto" control={<Radio />} label="Alto" />
                                    <FormControlLabel value="Medio" control={<Radio />} label="Medio" />
                                    <FormControlLabel value="Bajo" control={<Radio />} label="Bajo" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        <div className='phase'>
                            <Typography variant="h6">Seleccionar fase *</Typography>
                            <FormControl component="fieldset" required error={formSubmitted && selectedPhase.trim() === ''}>
                                <RadioGroup value={selectedPhase} onChange={e => setSelectedPhase(e.target.value)} style={{ display: 'flex', flexDirection: 'row' }}>
                                    <FormControlLabel value="RRC" control={<Radio />} label="RRC" />
                                    <FormControlLabel value="RAAC" control={<Radio />} label="RAAC" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                    </div>
                </div>
                <Button variant="contained" color="primary" onClick={handleGuardarClick} style={{ marginTop: '20px', alignSelf: 'center' }}>Guardar</Button>
                {loading && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 9998,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <CircularProgress style={{ zIndex: 9999 }} />
                        </div>
                    </div>
                )}
                <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        color: '#423b3b',
                        border: '2px solid grey',
                        borderRadius: '10px',
                        boxShadow: 24,
                        p: 4,
                        padding: '25px',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                    }}>
                        <Typography variant="h6" component="h2" style={{ fontFamily: 'Roboto' }} gutterBottom>
                            Sus datos han sido guardados exitosamente
                        </Typography>
                        <Button style={{ backgroundColor: '#1A80D9', color: '#F2F2F2' }} onClick={() => setOpenModal(false)}>Cerrar</Button>
                    </div>
                </Modal>
                {errorMessage && (
                    <div style={{ color: 'red', fontSize: '17px', paddingBottom: '10px' }}>
                        {errorMessage}
                    </div>
                )}
            </>
        );
    };

    const contenido_seguimiento_default = () => {
        const handleInputChange1 = (event) => {
            setComment(event.target.value);
        };

        const handleGuardarClick = async () => {
            try {
                setLoading(true);
                let enlace;
                if (fileType === 'upload' && fileInputRef.current) {
                    const files = fileInputRef.current.files;
                    const formData = new FormData();
                    for (let i = 0; i < files.length; i++) {
                        formData.append("file", files[i]); 
                    }
                    const response = await fetch("https://siac-server.vercel.app/upload/", {
                        method: 'POST',
                        body: formData, 
                        headers: {
                            enctype: 'multipart/form-data',
                        }
                    });
                    const data = await response.json();
                    enlace = data.enlace;
                } else {
                    enlace = fileLink; 
                }

                if (comment.trim() === '' || value.trim() === '') {
                    setLoading(false);
                    const errorMessage = 'Por favor, complete todos los campos obligatorios.';
                    setErrorMessage(errorMessage);
                    setFormSubmitted(true);
                    return;
                }

                let formattedDate;
                if (selectedDate) {
                    formattedDate = dayjs(selectedDate).format('DD/MM/YYYY');
                } else {
                    formattedDate = dayjs().format('DD/MM/YYYY');
                }

                const dataSend = [
                    idPrograma,
                    formattedDate,
                    comment,
                    value,
                    user,
                    collapsible,
                    enlace,
                    selectedOption.id,
                ];

                const dataSendCrea = [
                    idPrograma,
                    selectedOption.id,
                    formattedDate, 
                ];

                await sendDataToServer(dataSend);
                if (selectedOption.id === undefined) {
                    console.log("Opción seleccionada -> Ninguna");
                } else {
                    await sendDataToServerCrea(dataSendCrea);
                }

                clearFileLink();
                setLoading(false);
                setOpenModal(true);
                setUpdateTrigger(true);
                setComment('');
                setValue('');
                setSelectedPhase('');
                setErrorMessage(null);
            } catch (error) {
                setLoading(false);
                console.error('Error al enviar datos:', error);
            }
        };

        return (
            <>
                <div
                className="container-NS"
                style={{
                    fontWeight: "bold",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    margin: "5px",
                    justifyContent: "center",
                    marginTop: "10px",
                    alignItems: "center",
                }}
                >
                <div
                    className="date-picker"
                    style={{
                    paddingRight: "10px",
                    marginBottom: "10px",
                    width: "100%",
                    }}
                >
                    <div className="main-container">
                    <div className="date-picker">
                        Fecha * <br />
                        <button
                        onClick={handleToggleCalendar}
                        style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                        }}
                        >
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            locale={esLocale}
                        >
                            <DatePicker
                            value={selectedDate}
                            onChange={handleDateChange}
                            open={calendarOpen}
                            onClose={() => setCalendarOpen(false)}
                            format="DD/MM/YYYY"
                            renderInput={() => <input readOnly />}
                            />
                        </LocalizationProvider>
                        </button>
                    </div>
                    <div className="comments">
                        Comentario * <br />
                        <TextField
                        multiline
                        rows={3}
                        required
                        value={comment}
                        onChange={handleInputChange1}
                        placeholder="Escribe tu comentario aquí"
                        type="text"
                        style={{
                            border:
                            formSubmitted && comment.trim() === ""
                                ? "1px solid red"
                                : "none",
                            textAlign: "start",
                            backgroundColor: "#f0f0f0",
                            color: "black",
                            width: "100%",
                        }}
                        />
                    </div>
                    <div className="risk">
                        Riesgo *<br />
                        <FormControl
                        component="fieldset"
                        required
                        error={formSubmitted && value.trim() === ""}
                        style={{
                            border:
                            formSubmitted && value.trim() === ""
                                ? "1px solid red"
                                : "none",
                        }}
                        >
                        <RadioGroup
                            value={value}
                            onChange={(e) => {
                            setValue(e.target.value);
                            }}
                            style={{
                            display: "flex",
                            flexDirection: "row",
                            }}
                            required
                        >
                            <FormControlLabel
                            value="Alto"
                            control={<Radio />}
                            label="Alto"
                            />
                            <FormControlLabel
                            value="Medio"
                            control={<Radio />}
                            label="Medio"
                            />
                            <FormControlLabel
                            value="Bajo"
                            control={<Radio />}
                            label="Bajo"
                            />
                        </RadioGroup>
                        </FormControl>
                    </div>
                    <div className="attachment">
                        Archivo Adjunto <br />
                        <FormControl component="fieldset">
                        <RadioGroup
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            style={{
                            display: "flex",
                            flexDirection: "row",
                            }}
                        >
                            <FormControlLabel
                            value="upload"
                            control={<Radio />}
                            label="Subir"
                            />
                            <FormControlLabel
                            value="link"
                            control={<Radio />}
                            label="Enlace"
                            />
                        </RadioGroup>
                        </FormControl>
                        <div style={{ marginTop: "0px", height: "30px" }}>
                        {fileType === "upload" ? (
                            <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            placeholder="Seleccionar archivo..."
                            style={{ height: "30px" }}
                            />
                        ) : fileType === "link" ? (
                            <input
                            value={fileLink}
                            onChange={(e) => setFileLink(e.target.value)}
                            placeholder="Link del archivo"
                            type="text"
                            style={{
                                width: "200px",
                                height: "25px",
                                backgroundColor: "white",
                                color: "grey",
                                border: "1px solid grey",
                                borderRadius: "5px",
                            }}
                            />
                        ) : null}
                        </div>
                    </div>
                    <div className="select-container">
                        <FormControl style={{ width: "100%", maxWidth: "100%" }}>
                        <InputLabel
                            id="select-label"
                            style={{
                            fontSize: "1.5rem",
                            textAlign: "left",
                            width: "100%",
                            }}
                        >
                            Pasar a...
                        </InputLabel>
                        <Select
                            labelId="select-label"
                            id="select-label"
                            value={selectedOption}
                            label="Pasar a..."
                            onChange={(e) => {
                            setSelectedOption(e.target.value);
                            }}
                            displayEmpty
                            style={{ width: "100%" }}
                            MenuProps={{
                            disableScrollLock: "true", // Disable scroll lock
                            PaperProps: {
                                style: {
                                maxHeight: "150px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                maxWidth: "50%", // Ensure the menu matches the width of the Select
                                },
                            },
                            }}
                            disablePortal // Render the menu inline, avoiding the portal behavior
                        >
                            <MenuItem
                            value={0}
                            sx={{
                                display: "flex",
                                width: "100%",
                                "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.08)",
                                },
                                whiteSpace: "normal", // Allow text to wrap
                                overflow: "visible",
                            }}
                            >
                            Ninguna
                            </MenuItem>
                            {menuItems.map((item, index) => (
                            <MenuItem
                                key={index}
                                value={item}
                                sx={{
                                display: "flex",
                                width: "100%",
                                "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                                },
                                whiteSpace: "normal", // Allow text to wrap
                                overflow: "visible",
                                }}
                            >
                                {item.fase}
                            </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                    </div>
                    <style jsx>{`
                        .main-container {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        width: 100%;
                        }
                        .date-picker,
                        .comments,
                        .risk,
                        .attachment,
                        .select-container {
                        flex: 1;
                        min-width: 100px; /* Adjust as necessary */
                        }
                        @media (min-width: 768px) {
                        .main-container {
                            flex-direction: row;
                            flex-wrap: wrap;
                        }
                        .select-container {
                            flex-grow: 1;
                        }
                        }
                    `}</style>
                    </div>
                </div>
                </div>
                <Button variant="contained" style={{ textAlign: 'center', margin: '8px', paddingBottom: '10px' }} onClick={handleGuardarClick}>Guardar</Button>
                {loading && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 9998,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <CircularProgress style={{ zIndex: 9999 }} />
                        </div>
                    </div>
                )}
                <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        color: '#423b3b',
                        border: '2px solid grey',
                        borderRadius: '10px',
                        boxShadow: 24,
                        p: 4,
                        padding: '25px',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                    }}>
                        <Typography variant="h6" component="h2" style={{ fontFamily: 'Roboto' }} gutterBottom>
                            Sus datos han sido guardados exitosamente
                        </Typography>
                        <Button style={{ backgroundColor: '#1A80D9', color: '#F2F2F2' }} onClick={() => setOpenModal(false)}>Cerrar</Button>
                    </div>
                </Modal>
                {errorMessage && (
                    <div style={{ color: 'red', fontSize: '17px', paddingBottom: '10px' }}>
                        {errorMessage}
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            <div style={{ marginRight: '20px', width: 'auto' }}>
                <div>
                    {(handleButtonClick === 'Seg') && (
                        <>
                            <h3>Seguimiento al Plan de Mejoramiento.</h3>
                            <SeguimientoPM
                                idPrograma={idPrograma}
                                escuela={escuela}
                                formacion={formacion}
                                isPlan={avaibleRange(isPlan)}
                            />
                            <CollapsibleButton buttonText="Seguimiento al cumplimiento del Plan de Mejoramiento" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['plan de mejoramiento rrc', 'plan de mejoramiento raac'], fasesTabla, true)}
                                        {avaibleRange(isPlan) &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Plan de Mejoramiento')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Plan de Mejoramiento'] && (
                                            <>
                                                {contenido_seguimiento()}
                                            </>
                                        )}
                                    </div>
                                </>
                            } />
                        </>
                    )}
                    {(handleButtonClick === 'rrc') && (
                        <>
                            <h3>Seguimiento del Proceso de Renovación Registro Calificado</h3>
                            <SimpleTimeline
                                fechaExpedicion={rowData['fechaexpedrc']}
                                fechaVencimiento={rowData['fechavencrc']}
                                fechasCalculadas={fechasCalculadas}
                            />
                            <CollapsibleButton buttonText="Renovación Registro Calificado" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['renovación registro calificado'])}
                                        {avaibleRange(isReg) &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Renovación Registro Calificado')} variant="contained" color="primary" style={{ textAlign: 'center', marginBottom: '25px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Renovación Registro Calificado'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                    </div>
                                </>
                            } />
                            {contenido_tablaFases()}
                        </>
                    )}
                    {(handleButtonClick === 'aac') && (
                        <>
                            <h3>Seguimiento del Proceso de Acreditación</h3>
                            <CollapsibleButton buttonText="Acreditación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['acreditación'])}
                                        {avaibleRange(isAcred) &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Acreditación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Acreditación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                    </div>
                                </>
                            } />
                            {contenido_tablaFases()}
                        </>
                    )}
                    {(handleButtonClick === 'raac') && (
                        <>
                            <h3>Seguimiento del Proceso de Renovación Acreditación</h3>
                            <SimpleTimeline
                                fechaExpedicion={rowData['fechaexpedac']}
                                fechaVencimiento={rowData['fechavencac']}
                                fechasCalculadas={fechasCalculadasAC}
                            />
                            <CollapsibleButton buttonText="Renovación Acreditación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['renovación acreditación'])}
                                        {avaibleRange(isRenAcred) &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Renovación Acreditación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Renovación Acreditación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                    </div>
                                </>
                            } />
                            {contenido_tablaFases()}
                        </>
                    )}
                    {(handleButtonClick === 'crea') && (
                        <>
                            <h3>Seguimiento del Proceso de Creación</h3>
                            <CollapsibleButton buttonText="Creación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['creación'])}
                                        {avaibleRange(isCrea) &&
                                            (
                                                <>
                                                    <Button onClick={() => handleNewTrackingClick('Creación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                                </>
                                            )
                                        }
                                        {showCollapsible['Creación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                    </div>
                                </>
                            } />
                            {contenido_tablaFases()}
                        </>
                    )}
                    {(handleButtonClick === 'mod') && (
                        <>
                            <h3>Seguimiento del Proceso de Modificación</h3>
                            <CollapsibleButton buttonText="Modificación" content={
                                <>
                                    <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        {renderFilteredTable(filteredData, ['modificación'])}
                                        {avaibleRange(isMod) &&
                                            (
                                                <Button onClick={() => handleNewTrackingClick('Modificación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                            )
                                        }
                                        {showCollapsible['Modificación'] && (
                                            <>
                                                {contenido_seguimiento_default()}
                                            </>
                                        )}
                                    </div>
                                </>
                            } />
                            {contenido_tablaFases()}
                        </>
                    )}
                    {handleButtonClick === 'conv' && (
                        <>
                            <h3>Seguimiento del Proceso de Convenio Docencia Servicio</h3>
                            {/* <CollapsibleButton buttonText="Datos Generales para Anexos Técnicos" content={
                                <>
                                    <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
                                        <div style={{ fontSize: "18px", paddingBottom: "20px" }}> <strong>Firmas para el documento</strong></div>
                                        <FormComponent idPrograma={idPrograma} />
                                    </div>
                                </>
                            } /> */}
                            <PracticeScenario data={rowData} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Seguimiento;

