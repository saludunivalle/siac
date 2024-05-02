import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Radio, RadioGroup, FormControl, FormControlLabel, TextField, InputLabel, Input, Box, Checkbox, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper  } from '@mui/material';
import { Button, Typography } from '@mui/material';
import CollapsibleButton from './CollapsibleButton';
import { Filtro10, Filtro12, Filtro7, Filtro8, Filtro9, obtenerFasesProceso, sendDataToServer, sendDataToServerCrea} from '../service/data';
import { Modal, CircularProgress  } from '@mui/material';
import { Select, MenuItem} from '@mui/material';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import esLocale from 'dayjs/locale/es'; 

const Seguimiento = ({handleButtonClick}) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedOption, setSelectedOption] = useState(0);
    const location = useLocation();
    const rowData = location.state; 
    const programaAcademico = rowData['programa académico'];
    const idPrograma = rowData['id_programa'];
    const [value, setValue] = useState('');
    const [showCollapsible, setShowCollapsible] = useState({}); 
    const [filteredData, setFilteredData] = useState([]);
    const [comment, setComment] = useState(''); 
    const [user, setUser] = useState('');
    const [collapsible, setCollapsible] = useState('');
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

    const [horasPorDia, setHorasPorDia] = useState({
        lunes: 0,
        martes: 0,
        miercoles: 0,
        jueves: 0,
        viernes: 0
    });
    
      const [totalHorasSemanal, setTotalHorasSemanal] = useState(0);
    
      const handleCheck = (dia, hora, isChecked) => {
        const horasPorDiaCopy = { ...horasPorDia };
        horasPorDiaCopy[dia] += isChecked ? 1 : -1;
        setHorasPorDia(horasPorDiaCopy);
    
        const totalHorasSemanal = Object.values(horasPorDiaCopy).reduce((acc, curr) => acc + curr, 0);
        setTotalHorasSemanal(totalHorasSemanal);
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
    
        const fechaUnAñoSeisMesesDespues = new Date(añoExpedicion, mesExpedicion + 6, diaExpedicion);
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
    
        return {
            unAñoSeisMesesDespues: fechaUnAñoSeisMesesDespues.toLocaleDateString(),
            seisMesesAntesMitad: fechaMitad.toLocaleDateString(),
            tresAñosAntes: fechaTresAñosAntes.toLocaleDateString(),
            dieciochoMesesAntes: fechaDieciochoMesesAntes.toLocaleDateString()
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
                if (rowData['mod_sus'] === 'SI'){
                    documentoproceso = 'Modificación Reforma Curricular - sustancial';
                } else if (rowData['mod_sus'] === 'NO'){
                    documentoproceso = 'Modiciación No Sustancial';
                }
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

            //Para documentos
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
            setFilteredData(response2);
            } catch (error) {
            console.error('Error al filtrar datos:', error);
            }
        };
        fetchData();
        }, [updateTrigger]);

    const renderFilteredTable = (data, filter) => {
        const filteredData = Filtro8(data, filter);
        if (filteredData.length === 0) {
          return <p>Ningún progama por mostrar</p>;
        }
        filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid grey', textAlign: 'center', marginTop: '10px' }}>
                <thead>
                    <tr>
                    <th style={{ width: '15%', border: '1px solid grey' }}>Fecha</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>Comentario</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>Riesgo</th>  
                    <th style={{ width: '15%', border: '1px solid grey' }}>Usuario</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>Adjunto</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: getBackgroundColor(item['riesgo']) }}>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['timestamp']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['mensaje']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['riesgo']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['usuario']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>
                                {item['url_adjunto'] ? (
                                    <a href={item['url_adjunto']} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                                        Enlace
                                    </a>
                                ) : (
                                    <strong>-</strong>
                                )}
                            </td> 
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }; 


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

    const handleNewTrackingClick = (collapsibleType) => {
        setShowCollapsible(prevState => ({
            ...prevState,
            [collapsibleType]: !prevState[collapsibleType]
        }));
        setCollapsible(collapsibleType)
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
                                        const backgroundColor = isBlackOutline ? '#f0f0f0' : ((itemActual && fase.fase === itemActual.fase) ? '#c8e6c9' : '#ffffff');
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
                                    {docs.map((docs, index) => {
                                        return (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>{docs.nombre_doc}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>
                    </div>
                    </>
                    )}
                </div>
            </>
        );
    };
    
    const contenido_seguimiento = () => {
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
              ];
          
              const dataSendCrea = [
                idPrograma,
                selectedOption.id,
                formattedDate, 
              ];
          
              //console.log('que esta pasando aqui:', dataSendCrea);
          
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
              setErrorMessage(null);
            } catch (error) {
              setLoading(false);
              console.error('Error al enviar datos:', error);
            }
          };

        return(
            <>
            <div className='container-NS' style={{ fontWeight: 'bold', width: '100%', display:'flex', flexDirection:'row', margin:'5px',  justifyContent: 'center', marginTop: '10px', alignItems:'center'}}>
                <div className='date-picker' style={{paddingRight:'10px'}}>
                        Fecha <br/>
                        <LocalizationProvider dateAdapter={AdapterDayjs} locale={esLocale}>
                            <DatePicker
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            format="DD/MM/YYYY"
                            />
                        </LocalizationProvider>   
                </div>
                <div className='comments' style={{ display:'flex', flexDirection:'column', justifyContent: 'left', textAlign: 'left', marginTop: '5px', width:'35%', paddingRight:'20px'}}>
                    Comentario * <br/>
                    <TextField multiline rows={3} required value={comment} onChange={handleInputChange1} placeholder="Comentario" type="text" style={{border: (formSubmitted && comment.trim() === '') ? '1px solid red' : 'none', textAlign: 'start', backgroundColor: '#f0f0f0', color: 'black', blockSize:'100%'}}  />
                </div>
                    <div className='adj-risk' style={{ display:'flex', flexDirection:'column', justifyContent: 'left',  textAlign: 'left', marginTop: '5px', margin:'5px', }}>
                        <div className='risk'  style={{textAlign: 'left'}}>
                            Riesgo *<br/>
                            <FormControl component="fieldset" required error={formSubmitted && value.trim() === ''} style={{border: (formSubmitted && value.trim() === '') ? '1px solid red' : 'none'}}>
                                    <RadioGroup value={value} onChange={e => {setValue(e.target.value)}} style={{ display:'flex', flexDirection:'row'}} required>
                                        <FormControlLabel value="Alto" control={<Radio />} label="Alto" />
                                        <FormControlLabel value="Medio" control={<Radio />} label="Medio" />
                                        <FormControlLabel value="Bajo" control={<Radio />} label="Bajo" />
                                    </RadioGroup>
                            </FormControl>
                        </div>
                        <div className='adj' style={{ textAlign: 'left' }}>
                            Archivo Adjunto <br />
                            <FormControl component="fieldset">
                            <RadioGroup value={fileType} onChange={(e) => setFileType(e.target.value)} style={{ display: 'flex', flexDirection: 'row' }}>
                                <FormControlLabel value="upload" control={<Radio />} label="Subir" />
                                <FormControlLabel value="link" control={<Radio />} label="Enlace" />
                            </RadioGroup>
                            </FormControl>
                        </div>
                        <div style={{ marginTop: '0px', height: '30px' }}>
                        {fileType === 'upload' ? (
                            <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            placeholder="Seleccionar archivo..."
                            style={{ height: '30px'}}
                            />
                        ) : fileType === 'link' ? (
                            <input
                            value={fileLink}
                            onChange={(e) => setFileLink(e.target.value)}
                            placeholder="Link del archivo"
                            type="text"
                            style={{
                                width: '200px',
                                height: '25px',
                                backgroundColor: 'white',
                                color: 'grey',
                                border: '1px solid grey',
                                borderRadius: '5px'
                            }}
                            />
                        ): null}
                        </div>
                    </div>
                    <div style={{ marginTop: '-45px', marginLeft: '10px', width: 'auto' }}>
                    <FormControl style={{ width: '250px' }}>
                        <InputLabel id="select-label">Pasar a...</InputLabel>
                        <Select 
                            labelId="select-label"
                            id="select-label"
                            value={selectedOption}
                            label="Pasar a..."
                            onChange={e => {setSelectedOption(e.target.value)}}
                            displayEmpty
                            style={{ width: '250px' }}
                        >
                            <MenuItem value={0}>Ninguna</MenuItem>
                            {menuItems.map((item, index) => (
                                <MenuItem key={index} value={item}>{item.fase}</MenuItem>
                            ))}
                            
                        </Select>
                    </FormControl>    
                    </div>
            
            </div>
            <Button variant="contained" style={{textAlign: 'center', margin: '8px', paddingBottom:'10px'}} onClick={handleGuardarClick}>Guardar</Button>
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
                    <Typography variant="h6" component="h2" style={{ fontFamily: 'Roboto'}} gutterBottom>
                        Sus datos han sido guardados exitosamente
                    </Typography>
                    <Button style={{backgroundColor: '#1A80D9', color: '#F2F2F2'}} onClick={() => setOpenModal(false)}>Cerrar</Button>
                    </div>
                
            </Modal>
            {errorMessage && (
                <div style={{ color: 'red', fontSize:'17px', paddingBottom:'10px'}}>
                    {errorMessage}
                </div>
            )}
            </>
        );
    };

    return (
        <>
            <div style={{marginRight:'20px', width:'auto'}}>
                {/* <Header />
                <h2>{programaAcademico}</h2> */}
                <div>
                {(handleButtonClick=='rrc') &&(
                <>
                    <h3>Seguimiento del Proceso de Renovación Registro Calificado</h3>
                    <div style={{display: 'flex', gap:'2px', marginBottom:'20px', color:'black'}}>
                        <div style={{backgroundColor: '#FFFFF', padding: '10px', borderRadius: '5px', border:'1px solid #7e7e7e', width:'200px', textAlign:'center'}}><strong>FECHA INICIAL RRC</strong> <br/>{rowData['fechaexpedrc']}</div>
                        <div style={{backgroundColor: '#4caf4f36', padding: '10px', borderRadius: '5px', border:'1px solid #4caf50',width:'200px', textAlign:'center'}}><strong>AÑO Y 6 MESES </strong><br/>{fechasCalculadas.unAñoSeisMesesDespues}</div>
                        <div style={{backgroundColor: 'rgba(255, 235, 59, 0.288)', padding: '10px', border:'1px solid yellow', borderRadius: '5px', width:'200px', textAlign:'center'}}><strong>6 MESES ANTES DE LA MITAD</strong><br/>{fechasCalculadas.seisMesesAntesMitad}</div>
                        <div style={{backgroundColor: '#ff990079', padding: '10px', borderRadius: '5px', border:'1px solid orange', width:'200px', textAlign:'center'}}><strong>3 AÑOS ANTES DEL VENCIMIENTO </strong><br/>{fechasCalculadas.tresAñosAntes}</div>
                        <div style={{backgroundColor: '#ff562275', padding: '10px', borderRadius: '5px', border:'1px solid #ff5722', width:'200px', textAlign:'center'}}><strong> 18 MESES ANTES DEL VENCIMIENTO</strong><br/>{fechasCalculadas.dieciochoMesesAntes}</div>
                        <div style={{backgroundColor: '#f443368e', padding: '10px', borderRadius: '5px', border:'1px solid #ee1809', width:'200px', textAlign:'center'}}><strong> AÑO DE VENCIMIENTO RRC</strong><br/>{rowData['fechavencrc']}</div>
                    </div>
                    <CollapsibleButton buttonText="Renovación Registro Calificado" content={
                        <>
                            <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                {renderFilteredTable(filteredData, 'Renovación Registro Calificado')}
                                {avaibleRange(isReg) && 
                                (
                                <Button onClick={() => handleNewTrackingClick('Renovación Registro Calificado')} variant="contained" color="primary" style={{ textAlign: 'center',  marginBottom:'25px'}} >Nuevo Seguimiento</Button>
                                )
                                }
                                {showCollapsible['Renovación Registro Calificado'] && (
                                    <>  
                                        {contenido_seguimiento()}
                                    </>
                                )}
                            </div>
                        </>
                    } />
                </>
                )}
                {(handleButtonClick=='aac') &&(
                <><h3>Seguimiento del Proceso de Acreditación</h3>
                <CollapsibleButton buttonText="Acreditación" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                            {renderFilteredTable(filteredData, 'Acreditación')}
                            {avaibleRange(isAcred) && 
                            (
                            <Button onClick={() => handleNewTrackingClick('Acreditación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                            )
                            }
                            {showCollapsible['Acreditación'] && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                        </div>
                    </>
                } />
                {contenido_tablaFases()}
                </>
                )}
                {(handleButtonClick=='raac') &&(
                <>
                <h3>Seguimiento del Proceso de Renovación Acreditación</h3>
                <div style={{display: 'flex', gap:'2px', marginBottom:'20px', color:'black'}}>
                    <div style={{backgroundColor: '#FFFFF', padding: '10px', borderRadius: '5px', border:'1px solid #7e7e7e', width:'200px', textAlign:'center'}}><strong>FECHA INICIAL RAAC </strong><br/>{rowData['fechaexpedac']}</div>
                    <div style={{backgroundColor: '#4caf4f36', padding: '10px', borderRadius: '5px', border:'1px solid #4caf50',width:'200px', textAlign:'center'}}><strong>AÑO Y 6 MESES </strong><br/>{fechasCalculadasAC.unAñoSeisMesesDespues}</div>
                    <div style={{backgroundColor: 'rgba(255, 235, 59, 0.288)', padding: '10px', border:'1px solid yellow', borderRadius: '5px', width:'200px', textAlign:'center'}}><strong>6 MESES ANTES DE LA MITAD</strong><br/>{fechasCalculadasAC.seisMesesAntesMitad}</div>
                    <div style={{backgroundColor: '#ff990079', padding: '10px', borderRadius: '5px', border:'1px solid orange', width:'200px', textAlign:'center'}}><strong>3 AÑOS ANTES DEL VENCIMIENTO </strong><br/>{fechasCalculadasAC.tresAñosAntes}</div>
                    <div style={{backgroundColor: '#ff562275', padding: '10px', borderRadius: '5px', border:'1px solid #ff5722', width:'200px', textAlign:'center'}}><strong> 18 MESES ANTES DEL VENCIMIENTO</strong><br/>{fechasCalculadasAC.dieciochoMesesAntes}</div>
                    <div style={{backgroundColor: '#f443368e', padding: '10px', borderRadius: '5px', border:'1px solid #ee1809', width:'200px', textAlign:'center'}}><strong> AÑO DE VENCIMIENTO RAAC</strong><br/> {rowData['fechavencac']}</div>
                </div>
                <CollapsibleButton buttonText="Renovación Acreditación" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                            {renderFilteredTable(filteredData, 'Renovación Acreditación')}
                            {avaibleRange(isRenAcred) && 
                            (
                            <Button onClick={() => handleNewTrackingClick('Renovación Acreditación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                            )
                            }
                            {showCollapsible['Renovación Acreditación'] && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                        </div>
                    </>
                } />
                </>
                )}
                {(handleButtonClick=='rrc' ) &&(
                    <>
                    <CollapsibleButton buttonText="Seguimiento al cumplimiento del Plan de Mejoramiento" content={
                        <>
                            <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                {renderFilteredTable(filteredData, 'Plan de Mejoramiento RRC')}
                                {avaibleRange(isPlan) &&
                                (
                                    <Button onClick={() => handleNewTrackingClick('Plan de Mejoramiento RRC')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                )
                                }
                                {showCollapsible['Plan de Mejoramiento RRC'] && (
                                    <>  
                                        {contenido_seguimiento()}
                                    </>
                                )}
                            </div>
                        </>
                    } />
                    {contenido_tablaFases()}
                    </>
                )}
                {(handleButtonClick=='raac' ) &&(
                    <>
                        <CollapsibleButton buttonText="Seguimiento al cumplimiento del Plan de Mejoramiento" content={
                            <>
                                <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                                    {renderFilteredTable(filteredData, 'Plan de Mejoramiento RAAC')}
                                    {avaibleRange(isPlan) &&
                                    (
                                        <Button onClick={() => handleNewTrackingClick('Plan de Mejoramiento RAAC')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                    )
                                    }
                                    {showCollapsible['Plan de Mejoramiento RAAC'] && (
                                        <>  
                                            {contenido_seguimiento()}
                                        </>
                                    )}
                                </div>
                            </>
                        } />
                        {contenido_tablaFases()}
                        </>                        
                )}
                {handleButtonClick=='conv' &&(
                <><h3>Seguimiento del Proceso de Convenio Docencia Servicio</h3>
                <CollapsibleButton buttonText="Datos Generales para Anexos Técnicos" content={
                    <>
                        <div >
                        <Box display="flex" justifyContent="center" marginTop='25px' marginBottom='25px'>
                        <form style={{ width: '80%' }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel htmlFor="campo1">Campo 1</InputLabel>
                            <Input id="campo1" type="text" />
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel htmlFor="campo2">Campo 2</InputLabel>
                            <Input id="campo2" type="text" />
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="opciones-label">Seleccione una opción</InputLabel>
                            <Select
                                labelId="opciones-label"
                                id="opciones"
                                defaultValue=""
                            >
                                <MenuItem value="opcion1">Opción 1</MenuItem>
                                <MenuItem value="opcion2">Opción 2</MenuItem>
                            </Select>
                            </FormControl>

                            <FormControl component="fieldset" sx={{ mb: 2 }}>
                            <RadioGroup aria-label="gender" name="gender1">
                                <FormControlLabel value="opcion1" control={<Radio />} label="Opción 1" />
                                <FormControlLabel value="opcion2" control={<Radio />} label="Opción 2" />
                            </RadioGroup>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel htmlFor="firma">Firma</InputLabel>
                            <Input id="firma" type="text" />
                            </FormControl>

                            <Button variant="contained" color="primary" type="button" >
                            Generar Anexo
                            </Button>
                        </form>
                        </Box>
                        </div>
                    </>
                } />
                <CollapsibleButton buttonText="Escenario de Practica 1 - Sede 1     Cantidad de estudiantes: XX " content={
                    <>
                        <div style={{marginBottom:'30px', marginTop:'15px', marginLeft:'200px', marginRight:'200px'}}>
                        <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                            <TableRow>
                                <TableCell>Hora</TableCell>
                                <TableCell>Lunes <br/> (Total: {horasPorDia.lunes} horas)</TableCell>
                                <TableCell>Martes <br/> (Total: {horasPorDia.martes} horas)</TableCell>
                                <TableCell>Miércoles <br/> (Total: {horasPorDia.miercoles} horas)</TableCell>
                                <TableCell>Jueves <br/> (Total: {horasPorDia.jueves} horas)</TableCell>
                                <TableCell>Viernes <br/> (Total: {horasPorDia.viernes} horas)</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {[...Array(8).keys()].map((hour) => (
                                <TableRow key={hour}>
                                <TableCell>{`${8 + hour}:00`}</TableCell>
                                <TableCell>
                                    <Checkbox
                                    onChange={(e) => handleCheck('lunes', `${8 + hour}:00`, e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                    onChange={(e) => handleCheck('martes', `${8 + hour}:00`, e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                    onChange={(e) => handleCheck('miercoles', `${8 + hour}:00`, e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                    onChange={(e) => handleCheck('jueves', `${8 + hour}:00`, e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                    onChange={(e) => handleCheck('viernes', `${8 + hour}:00`, e.target.checked)}
                                    />
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        <div>
                            <strong>Total Horas Semanal:</strong> {totalHorasSemanal} horas
                        </div>
                        </TableContainer>
                        </div>
                    </>
                } />
                <CollapsibleButton buttonText="Convenio Docencia Servicio" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                            {renderFilteredTable(filteredData, 'Convenio Docencia Servicio')}
                            {avaibleRange(isConv) &&
                            (
                            <Button onClick={() => handleNewTrackingClick('Convenio Docencia Servicio')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                            )
                            }
                            {showCollapsible['Convenio Docencia Servicio'] && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                        </div>
                    </>
                } />
                </>
                )}
                {(handleButtonClick=='crea') &&(
                <>
                <h3>Seguimiento del Proceso de Creación</h3>
                <CollapsibleButton buttonText="Creación" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                            {renderFilteredTable(filteredData, 'Creación')}
                            {avaibleRange(isCrea) &&
                            (
                                <>
                                {/* <div>{filteredTableCrea()}</div>              */}
                                <Button onClick={() => handleNewTrackingClick('Creación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                                </>
                            )
                            }
                            {showCollapsible['Creación'] && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                        </div>
                    </>
                } />
                {contenido_tablaFases()}
                </>
                )}
                {(handleButtonClick=='mod') &&(
                <><h3>Seguimiento del Proceso de Modificación</h3>
                <CollapsibleButton buttonText="Modificación" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                            {renderFilteredTable(filteredData, 'Modificación')}
                            {avaibleRange(isMod) &&
                            (
                            <Button onClick={() => handleNewTrackingClick('Modificación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                            )
                            }
                            {showCollapsible['Modificación'] && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                        </div>
                    </>
                } />
                {contenido_tablaFases()}
                </>
                )}
            </div>
            </div>
        </>

    );
};

export default Seguimiento;
