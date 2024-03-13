import React, { useEffect, useState } from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import { Radio, RadioGroup, FormControl, FormControlLabel } from '@mui/material';
import { Button, Typography } from '@mui/material';
import CollapsibleButton from './CollapsibleButton';
import { Filtro7, Filtro8, sendDataToServer} from '../service/data';


const Seguimiento = () => {
    const location = useLocation();
    const rowData = location.state; 
    const programaAcademico = rowData['programa académico'];
    const idPrograma = rowData['id_programa'];
    const [value, setValue] = useState('');
    const [showContent, setShowContent] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [timestamp, setTimestamp] = useState(null);
    const [selectedButtonText, setSelectedButtonText] = useState("");
    const [inputValue1, setInputValue1] = useState(''); 
    const [inputValue2, setInputValue2] = useState('');
    const handleChange = (event) => {
        setValue(event.target.value);
    };

    useEffect(() => {
        const currentTimestamp = new Date().toLocaleString();
        setTimestamp(currentTimestamp);
    }, []);

    useEffect(() => {
        console.log(filteredData); 
    }, [filteredData]); 

    useEffect(() => {
        const fetchData = async () => {
            try {
            const response = await Filtro7({ searchTerm: idPrograma }); 
            setFilteredData(response);
            } catch (error) {
            console.error('Error al filtrar datos:', error);
            }
        };
        fetchData();
        }, []);

    const handleCollapsibleButtonClick = (text) => {
        setSelectedButtonText(text); 
        fetchData(text); 
    };

    const renderFilteredTable = (data, filter) => {
        const filteredData = Filtro8(data, filter);
        if (filteredData.length === 0) {
          return <p>Ningún progama por mostrar</p>;
        }
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid grey', textAlign: 'center', marginTop: '10px' }}>
                <thead>
                    <tr>
                    <th style={{ width: '15%', border: '1px solid grey' }}>id_programa</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>timeStamp</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>mensaje</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>riesgo</th>  
                    <th style={{ width: '15%', border: '1px solid grey' }}>usuario</th>
                    <th style={{ width: '15%', border: '1px solid grey' }}>topic</th>                    
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['id_programa']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['timestamp']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['mensaje']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['riesgo']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['usuario']}</td> 
                            <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>{item['topic']}</td> 
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const handleNewTrackingClick = () => {
        setShowContent(!showContent); // Toggle the showContent state
    };

    const contenido_seguimiento = () => {
        const handleInputChange1 = (event) => {
            setInputValue1(event.target.value);
        };
    
        const handleInputChange2 = (event) => {
            setInputValue2(event.target.value);
        };

        const handleGuardarClick = async () => {
            try {
                await sendDataToServer(
                    idPrograma,
                    timestamp,
                    inputValue1,
                    value,
                    inputValue2,
                    selectedButtonText
                );
                console.log('Datos enviados correctamente');
            } catch (error) {
                console.error('Error al enviar datos:', error);
            }
        };

        return(
            <>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid grey', textAlign: 'center', marginTop: '10px' }}>
                <tbody>
                    <tr>
                        <th style={{ width: '25%', border: '1px solid grey' }}>id_programa</th>     
                        <th style={{ width: '25%', border: '1px solid grey' }}>Timestamp</th>                                               
                        <th style={{ width: '25%', border: '1px solid grey' }}>Comentario</th>
                        <th style={{ width: '25%', border: '1px solid grey' }}>Riesgo</th>
                        <th style={{ width: '25%', border: '1px solid grey' }}>Usuario</th>
                        <th style={{ width: '25%', border: '1px solid grey' }}>Adjunto</th>
                        
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid grey' }}> {idPrograma} </td>
                        <td style={{ border: '1px solid grey' }}>
                            {timestamp && (
                                <Typography variant="body1">
                                    {timestamp}
                                </Typography>
                            )}
                        </td>
                        <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>
                            <input value={inputValue1} onChange={handleInputChange1} placeholder="comentario" type="text" style={{ width: '95%', border: 'none', textAlign: 'start', padding: '8px', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',  backgroundColor: '#f0f0f0', color: 'black' }} />
                        </td>
                        <td style={{ border: '1px solid grey' }}>
                            <FormControl component="fieldset">
                                <RadioGroup value={value} onChange={handleChange}>
                                    <FormControlLabel value="Alto" control={<Radio />} label="Alto" />
                                    <FormControlLabel value="Medio" control={<Radio />} label="Medio" />
                                    <FormControlLabel value="Bajo" control={<Radio />} label="Bajo" />
                                </RadioGroup>
                            </FormControl>
                        </td>
                        <td style={{ border: '1px solid grey', verticalAlign: 'middle' }}>
                            <input value={inputValue2} onChange={handleInputChange2} placeholder="usuario" type="text" style={{ width: '95%', border: 'none', textAlign: 'start', padding: '8px', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',  backgroundColor: '#f0f0f0', color: 'black' }} />
                        </td>
                        <td style={{ border: '1px solid grey' }}>Adjunto</td>
                        
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
            <Header/>
            <h2>{programaAcademico}</h2>
            <h3>Seguimiento</h3>
            <CollapsibleButton buttonText="Plan de Mejoramiento" content={
                <>
                    <div className='contenido' style={{textAlign:'center'}}>
                        {renderFilteredTable(filteredData, 'Plan de Mejoramiento')}
                        <Button onClick={handleNewTrackingClick} variant="contained" color="primary" style={{textAlign: 'center', margin: '8px'}} >Nuevo Seguimiento</Button>
                            {showContent && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                    </div>
                </>
            } onClick={() => handleCollapsibleButtonClick("Plan de mejoramiento")} />
            <CollapsibleButton buttonText="Registro Calificado" content={
                <>
                    <div className='contenido' style={{textAlign:'center'}}>
                        {renderFilteredTable(filteredData, 'Registro Calificado')}
                        <Button onClick={handleNewTrackingClick} variant="contained" color="primary" style={{textAlign: 'center', margin: '8px'}} >Nuevo Seguimiento</Button>
                            {showContent && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                    </div>
                </>
            } onClick={() => handleCollapsibleButtonClick("Registro Calificado")} />
            <CollapsibleButton buttonText="Acreditación" content={
                <>
                    <div className='contenido' style={{textAlign:'center'}}>
                        {renderFilteredTable(filteredData, 'Acreditación')}
                        <Button onClick={handleNewTrackingClick} variant="contained" color="primary" style={{textAlign: 'center', margin: '8px'}} >Nuevo Seguimiento</Button>
                            {showContent && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                    </div>
                </>
            } onClick={() => handleCollapsibleButtonClick("Acreditación")} />
            <CollapsibleButton buttonText="Convenio Docencia Servicio" content={
                <>
                    <div className='contenido' style={{textAlign:'center'}}>
                        {renderFilteredTable(filteredData, 'Convenio Docencia Servicio')}
                        <Button onClick={handleNewTrackingClick} variant="contained" color="primary" style={{textAlign: 'center', margin: '8px'}} >Nuevo Seguimiento</Button>
                            {showContent && (
                                <>
                                    {contenido_seguimiento()}
                                </>
                            )}
                    </div>
                </>
            } onClick={() => handleCollapsibleButtonClick("Convenio Docencia Servicio")} />
        </div>
        </>
    );
};

export default Seguimiento;
