import React, { useEffect, useState } from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import { Radio, RadioGroup, FormControl, FormControlLabel, TextField } from '@mui/material';
import { Button, Typography } from '@mui/material';
import CollapsibleButton from './CollapsibleButton';
import { Filtro7, Filtro8, Filtro9, sendDataToServer} from '../service/data';
import { Modal } from '@mui/material';



const Seguimientorac = () => {
    const location = useLocation();
    const rowData = location.state; 
    const programaAcademico = rowData['programa académico'];
    const idPrograma = rowData['id_programa'];
    const process = "RAAC";
    const [value, setValue] = useState('');
    const [showCollapsible, setShowCollapsible] = useState({}); 
    const [filteredData, setFilteredData] = useState([]);
    const [timestamp, setTimestamp] = useState(null);
    const [comment, setComment] = useState(''); 
    const [user, setUser] = useState('');
    const [collapsible, setCollapsible] = useState('');
    const [isPlan, setPlan] = useState(['Plan de Mejoramiento', 'Sistemas']);
    const [isReg, setReg] = useState(['Registro Calificado', 'Sistemas']);
    const [isAcred, setAcred] = useState(['Acreditación', 'Sistemas']);
    const [isConv, setConv] = useState(['Convenio Docencia Servicio', 'Sistemas']);
    const [isCargo, setCargo] = useState('');
    const [openModal, setOpenModal] = useState(false);

    
    const handleChange = (event) => {
        setValue(event.target.value);
    };

    useEffect(() => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();
        setTimestamp(formattedDate);
        if (sessionStorage.getItem('logged')){
            let res = JSON.parse(sessionStorage.getItem('logged'));
            console.log('permiso', res[0].permiso);
            setCargo(res[0].permiso);
            setUser(res[0].user);
        }
    }, []);

    const avaibleRange = (buscar) =>{
        return buscar.includes(isCargo);
    };

    useEffect(() => {
        console.log(filteredData); 
    }, [filteredData]); 

    useEffect(() => {
        const fetchData = async () => {
            try {
            const response = await Filtro7({idPrograma}); 
            const response2 = await Filtro9(response.filter(item => item['id_programa'] === idPrograma), process);
            setFilteredData(response2);
            } catch (error) {
            console.error('Error al filtrar datos:', error);
            }
        };
        fetchData();
        }, []);

    // Función para renderizar la tabla filtrada
    const renderFilteredTable = (data, filter) => {
        const filteredData = Filtro8(data, filter);
        if (filteredData.length === 0) {
          return <p>Ningún progama por mostrar</p>;
        }
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid grey', textAlign: 'center', marginTop: '10px' }}>
                <thead>
                    <tr>
                    <th style={{ width: '15%', border: '1px solid grey' }}>timeStamp</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>mensaje</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>riesgo</th>  
                    <th style={{ width: '15%', border: '1px solid grey' }}>usuario</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['timestamp']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['mensaje']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['riesgo']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['usuario']}</td> 
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
                const dataSend=[
                    idPrograma,
                    timestamp,
                    comment,
                    value,
                    user,
                    collapsible,
                    process
                ];
                await sendDataToServer(dataSend);
                console.log('Datos enviados correctamente');
                console.log(dataSend);
                setComment('');
                setValue('');
                setOpenModal(true);
            } catch (error) {
                console.error('Error al enviar datos:', error);
            }
        };

        return(
            <>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', marginTop: '10px' }}>
                <tbody>
                    <tr>                                           
                        <th style={{ width: '15%'}}>Comentario</th>
                        <th style={{ width: '15%'}}>Riesgo</th>
                        <th style={{ width: '15%'}}>Adjunto</th>
                    </tr>
                    <tr>
                        <td style={{ verticalAlign: 'middle' }}>
                            <TextField value={comment} onChange={handleInputChange1} placeholder="comentario" type="text" style={{ width: '90%', border: 'none', textAlign: 'start', padding: '8px', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',  backgroundColor: '#f0f0f0', color: 'black' }} />
                        </td>
                        <td>
                            <FormControl component="fieldset">
                                <RadioGroup value={value} onChange={handleChange}>
                                    <FormControlLabel value="Alto" control={<Radio />} label="Alto" />
                                    <FormControlLabel value="Medio" control={<Radio />} label="Medio" />
                                    <FormControlLabel value="Bajo" control={<Radio />} label="Bajo" />
                                </RadioGroup>
                            </FormControl>
                        </td>
                        <td>Adjunto</td>
                    </tr>
                </tbody>
            </table>
            <Button variant="contained" style={{textAlign: 'center', margin: '8px'}} onClick={handleGuardarClick}>Guardar</Button>
            </>
        );
    };

    return (
        <>
            <div>
                <Header />
                <h2>{programaAcademico}</h2>
                <h3>Seguimiento</h3>
                        <CollapsibleButton buttonText="Plan de Mejoramiento" content={
                            <>
                                <div className='contenido' style={{ textAlign: 'center' }}>
                                    {renderFilteredTable(filteredData, 'Plan de Mejoramiento')}
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
                
                <CollapsibleButton buttonText="Registro Calificado" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center' }}>
                            {renderFilteredTable(filteredData, 'Registro Calificado')}
                            {avaibleRange(isReg) &&
                            (
                            <Button onClick={() => handleNewTrackingClick('Registro Calificado')} variant="contained" color="primary" style={{ textAlign: 'center', margin: '8px' }} >Nuevo Seguimiento</Button>
                            )
                            }
                            {showCollapsible['Registro Calificado'] && (
                                <>  
                                    {contenido_seguimiento()}
                                </>
                            )}
                        </div>
                    </>
                } />
                <CollapsibleButton buttonText="Acreditación" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center' }}>
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
                <CollapsibleButton buttonText="Convenio Docencia Servicio" content={
                    <>
                        <div className='contenido' style={{ textAlign: 'center' }}>
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
            </div>

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

        </>

    );
};

export default Seguimientorac;
