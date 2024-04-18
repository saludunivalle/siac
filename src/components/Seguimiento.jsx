import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Radio, RadioGroup, FormControl, FormControlLabel, TextField, InputLabel } from '@mui/material';
import { Button, Typography } from '@mui/material';
import CollapsibleButton from './CollapsibleButton';
import { Filtro10, Filtro7, Filtro8, Filtro9, sendDataToServer, sendDataToServerCrea} from '../service/data';
import { Modal, CircularProgress  } from '@mui/material';
import { Select, MenuItem} from '@mui/material';



const Seguimiento = ({handleButtonClick}) => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedOption, setSelectedOption] = useState(menuItems.length > 0 ? menuItems[0].id : '');
    console.log("en seguimiento",handleButtonClick)
    const location = useLocation();
    const rowData = location.state; 
    const programaAcademico = rowData['programa académico'];
    const idPrograma = rowData['id_programa'];
    //const process = "RRC";
    const [value, setValue] = useState('');
    const [showCollapsible, setShowCollapsible] = useState({}); 
    const [filteredData, setFilteredData] = useState([]);
    const [timestamp, setTimestamp] = useState(null);
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
    const [loading, setLoading] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
        const response = await Filtro10();
        //const items = response.filter(item => item['fase'] !== ' '); 
        setMenuItems(response);
        } catch (error) {
        console.error('Error fetching menu items:', error);
        }
    };

    useEffect(() => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();
        setTimestamp(formattedDate);
        if (sessionStorage.getItem('logged')){
            let res = JSON.parse(sessionStorage.getItem('logged'));
            console.log('permisos', res.map(item => item.permiso));
            setCargo(res.map(item => item.permiso).flat());
            setUser(res[0].user);
        }
    }, []);


    const avaibleRange = (buscar) => {
        return isCargo.some(cargo => buscar.includes(cargo));
    };
  
    useEffect(() => {
        console.log(filteredData); 
    }, [filteredData]); 

    useEffect(() => {
        const fetchData = async () => {
            try {
            const response = await Filtro7({idPrograma}); 
            const response2 = await Filtro9(response.filter(item => item['id_programa'] === idPrograma), idPrograma);
            console.log('response',response);
            console.log('response2',response2);
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
        console.log('opcion:', selectedOption.id);

        const handleGuardarClick = async () => {
            try {
                setLoading(true);
                const files = fileInputRef.current.files;
                const formData = new FormData();

                for (let i = 0; i < files.length; i++) {
                    formData.append("file", files[i]); 
                }

                if (comment.trim() === '' || value.trim() === '') {
                    setLoading(false);
                    const errorMessage = 'Por favor, complete todos los campos obligatorios.';
                    setErrorMessage(errorMessage);
                    setFormSubmitted(true); 
                    return;
                }
            
                const response = await fetch("https://siac-server.vercel.app/upload/",{
                    method: 'POST',
                    body: formData, 
                    headers: {
                        enctype: 'multipart/form-data',
                    }
                });
                const data = await response.json();
                console.log("uploaded files: ", data);
                console.log("enlace:", data.enlace);
                setfileData(data.enlace);

                const dataSend=[
                    idPrograma,
                    timestamp,
                    comment,
                    value,
                    user,
                    collapsible,
                    data.enlace,       
                ];

                const dataSendCrea=[
                    idPrograma,
                    selectedOption.id,
                    timestamp,
                ];

                //await handleFileUpload();
                await sendDataToServer(dataSend);
                await sendDataToServerCrea(dataSendCrea);
                setLoading(false);
                setOpenModal(true);
                console.log('Datos enviados correctamente');
                console.log(dataSend);
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
                        <div className='adj'>
                            Adjunto <br/>
                            <input type="file" multiple ref={fileInputRef} placeholder="Seleccionar archivo..." />
                        </div>
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
                                    {menuItems.map((item, index) => (
                                        <MenuItem key={index} value={item}>{item.fase}</MenuItem>
                                    ))}
                                </Select>

                            </FormControl>                            
                            </div>
                        </>
                    )}                  
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
                <h3>Seguimiento</h3>
                <div>
                {handleButtonClick=='rrc' &&(
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
                )}
                {(handleButtonClick=='aac') &&(
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
                )}
                {(handleButtonClick=='raac') &&(
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
                )}
                {handleButtonClick=='rrc' &&(
                    <CollapsibleButton buttonText="Plan de Mejoramiento RRC" content={
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
                {handleButtonClick=='raac' &&(
                        <CollapsibleButton buttonText="Plan de Mejoramiento RAAC" content={
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
                )}
                {handleButtonClick=='crea' &&(
                <CollapsibleButton buttonText="Creación" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center', marginBottom: '30px' }}>
                            {renderFilteredTable(filteredData, 'Creación')}
                            {avaibleRange(isCrea) &&
                            (
                            <Button onClick={() => handleNewTrackingClick('Creación')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
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
                )}
                {handleButtonClick=='mod' &&(
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
                )}
            </div>
            </div>
        </>

    );
};

export default Seguimiento;
