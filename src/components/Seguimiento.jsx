import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Radio, RadioGroup, FormControl, FormControlLabel, TextField, InputLabel } from '@mui/material';
import { Button, Typography } from '@mui/material';
import CollapsibleButton from './CollapsibleButton';
import { Filtro10, Filtro7, Filtro8, Filtro9, obtenerFasesProceso, sendDataToServer, sendDataToServerCrea} from '../service/data';
import { Modal, CircularProgress  } from '@mui/material';
import { Select, MenuItem} from '@mui/material';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
    //elchat
    const [fases, setFases] = useState([]);

    useEffect(() => {
        cargarFases();
    }, [handleButtonClick]); 
    
    const cargarFases = async () => {
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
            const response = await obtenerFasesProceso(idPrograma, procesoActual);
            //console.log('funciona', response);
            
            const fasesFiltradas = response.fases.filter(item => item.id_programa === idPrograma);
            
            const filtro10 = await Filtro10();
            const result2 = fasesFiltradas.map(fase => {
                const filtro10Item = filtro10.find(item => item.id === fase.id_fase);
                //console.log('proceso:', filtro10Item);
                return filtro10Item ? filtro10Item : null;
            });
            const result3 = result2.filter(item => item['proceso'] === procesoActual); 
            setFases(result3);
            //console.log('resultado', result2);
            //console.log('resultado2', result3);
        } catch (error) {
            console.error('Error al cargar las fases:', error);
        }
    };


    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
        const response = await Filtro10();
        const result = response.filter(item => item['proceso'] === 'Creación'); 
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
            const response = await Filtro7({idPrograma}); 
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
                formattedDate = dayjs(selectedDate).format('MM/DD/YYYY');
              } else {
                formattedDate = dayjs().format('MM/DD/YYYY'); 
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
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

                        {fileType === 'upload' ? (
                            <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            placeholder="Seleccionar archivo..."
                            style={{ marginTop: '5px' }}
                            />
                        ) : (
                            <input
                            value={fileLink}
                            onChange={(e) => setFileLink(e.target.value)}
                            placeholder="Link del archivo"
                            type="text"
                            style={{
                                width: '200px',
                                height: '30px',
                                backgroundColor: 'white',
                                color: 'grey',
                                marginLeft: '10px',
                                marginTop: '5px',
                                border: '1px solid grey',
                                borderRadius: '5px'
                            }}
                            />
                        )}
                    </div>
                    {handleButtonClick === 'crea' && (
                        <>
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
                        </>
                    )}                  
            </div>
            {fases.length > 0 && (
                <div>
                    <h2>Fases del Programa</h2>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <tbody>
                            {fases.map((fase, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: index === 0 ? 'bold' : 'normal', textDecoration: index === 0 ? 'underline' : 'none' }}>{fase.fase}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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
                <><h3>Seguimiento del Proceso de Renovación Registro Calificado</h3>
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
                </>
                )}
                {(handleButtonClick=='raac') &&(
                <><h3>Seguimiento del Proceso de Renovación Acreditación</h3>
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
                )}
                {(handleButtonClick=='raac' ) &&(
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
                )}
                {handleButtonClick=='conv' &&(
                <><h3>Seguimiento del Proceso de Convenio Docencia Servicio</h3>
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
                <><h3>Seguimiento del Proceso de Creación</h3>
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
                </>
                )}
            </div>
            </div>
        </>

    );
};

export default Seguimiento;
