import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filtro4, Filtro5 } from '../service/data';
import '/src/styles/home.css'; 
import CollapsibleButton from './CollapsibleButton';
import { Button, ButtonGroup } from "@mui/material";

const Mod = ({ globalVariable }) => {
    const location = useLocation();
    const rowData = location.state; 
    const [filteredData, setFilteredData] = useState(rowData);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');  
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [selectedValues, setSelectedValues] = useState(['option1', 'option2']);
    console.log('datosssss:', rowData)

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await Filtro5(); 
            setFilteredData(response.filter(item => item['mod'] === 'SI'));
          } catch (error) {
            console.error('Error al filtrar datos:', error);
          }
        };
      
        fetchData();
    }, []);

    const handleRowClick = (rowData) => {
        console.log('Datos de la fila:', rowData);
        navigate('/program_details', { state: { ...rowData, globalVariable } });
    };

    const handleButtonClick = async (buttonValue) => {
        const response = await Filtro5(); 
        const result = response.filter(item => item['mod'] === 'SI');
        setSelectedValues(prevSelectedValues => {
            let newSelectedValues;
    
            if (prevSelectedValues.includes(buttonValue)) {
                newSelectedValues = prevSelectedValues.filter(val => val !== buttonValue);
            } else {
                    newSelectedValues = [...prevSelectedValues, buttonValue];
            }

            let filteredResult = result.filter(item => {
                const filterByOption = option => {
                    switch (option) {
                        default:
                            return true;
                    }
                };
    
                const filterResults = newSelectedValues.map(filterByOption);
                return filterResults.every(result => result === true);
            });
            
            if (newSelectedValues.includes('option1') || newSelectedValues.includes('option2')) {
                filteredResult = filteredResult.filter(item => {
                    return newSelectedValues.includes('option1') && (item['mod_sus'] === 'SI') ||
                           newSelectedValues.includes('option2') && (item['mod_sus'] === 'NO');
                });
            }
    
            setFilteredData(filteredResult);
    
            return newSelectedValues;
        });
    };
    
    
    
    
    const isButtonSelected = (buttonValue) => {
        return selectedValues.includes(buttonValue);
    };

    const setButtonStyles = (buttonValue) => {
        return {
          color: isButtonSelected(buttonValue) ? 'white' : 'grey',
          backgroundColor: isButtonSelected(buttonValue) ? 'grey' : 'transparent',
          border: `2px solid ${isButtonSelected(buttonValue) ? 'grey' : 'grey'}`,
          borderRadius: '6px',
          width:'300px',
          height: '50px',
          marginTop: '10px',
        };
    };

    const renderFilteredTable = (data, filter) => {
        let filteredData;
        if (filter === 'No Aplica'){
            filteredData = (data.filter(item => item['escuela'] === '' || item['escuela'] === '???' || item['escuela'] === 'SALE PARA TULIÁ')).filter(item => item['sede'] === 'Cali');
        } else {
            filteredData = (Filtro4(data, filter)).filter(item => item['sede'] === 'Cali' || item['estado'] !== 'Inactivo' || item['estado'] !== 'Desistido' || item['estado'] !== 'Rechazado');
        }
        if (filteredData.length === 0) {
            return <p>Ningún progama por mostrar</p>;
        }
        return (
            <div className='table-container'>
            {loading ? (
                <p>Cargando datos...</p>
            ) : (
                <table>
                <tbody>
                    {filteredData.map((item, index) => (
                    <tr key={index} onClick={() => handleRowClick(item)}>
                        <td className="bold" style={{fontSize:'14px', textAlign: 'left', paddingLeft:'5px'}}>{item['programa académico']}</td> 
                        <td>{item['departamento']}</td> 
                        <td>{item['sección']}</td> 
                        <td>{item['estado']}</td> 
                        <td>{item['nivel de formación']}</td> 
                    </tr>
                    ))}
                </tbody>
                </table>
                )}
                </div>
        );
        
        };

    return (
        <>
        <ButtonGroup style={{gap:'10px', marginLeft:'20px', marginTop:'10px', width: '100%', justifyContent:'center'}} >
                    <Button value="option1" className="custom-radio2"
                        style={setButtonStyles('option1')}
                        onClick={() => handleButtonClick('option1')} > Sustanciales </Button>
                    <Button value="option2" className="custom-radio2" 
                        style={setButtonStyles('option2')}
                        onClick={() => handleButtonClick('option2')} > No Sustanciales </Button>
        </ButtonGroup>
        <div>
            {filteredData && filteredData.length > 0 ? (
              <div className='row-container'>
                <table style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>  
                      <th style={{ backgroundColor: headerBackgroundColor }}>Sección</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Estado</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Nivel de Formación</th>
                    </tr>
                  </thead>
                </table>  
                {filteredData.some(data => data['escuela'] === 'Bacteriología y Lab. Clínico') && 
                    <CollapsibleButton buttonText={`Bacteriología y Lab. Clínico (${Filtro4(filteredData, 'Bacteriología y Lab. Clínico').length})`} content={renderFilteredTable(filteredData, 'Bacteriología y Lab. Clínico')} />
                }
                {filteredData.some(data => data['escuela'] === 'Ciencias Básicas') && 
                    <CollapsibleButton buttonText={`Ciencias Básicas (${Filtro4(filteredData, 'Ciencias Básicas').length})`} content={renderFilteredTable(filteredData, 'Ciencias Básicas')} />
                }
                {filteredData.some(data => data['escuela'] === 'Enfermería') && 
                    <CollapsibleButton buttonText={`Enfermería (${Filtro4(filteredData, 'Enfermería').length})`} content={renderFilteredTable(filteredData, 'Enfermería')} />
                }
                {filteredData.some(data => data['escuela'] === 'Medicina') && 
                    <CollapsibleButton buttonText={`Medicina (${Filtro4(filteredData, 'Medicina').length})`} content={renderFilteredTable(filteredData, 'Medicina')} />
                }
                {filteredData.some(data => data['escuela'] === 'Odontología') && 
                    <CollapsibleButton buttonText={`Odontología (${Filtro4(filteredData, 'Odontología').length})`} content={renderFilteredTable(filteredData, 'Odontología')} />
                }
                {filteredData.some(data => data['escuela'] === 'Rehabilitación Humana') && 
                    <CollapsibleButton buttonText={`Rehabilitación Humana (${Filtro4(filteredData, 'Rehabilitación Humana').length})`} content={renderFilteredTable(filteredData, 'Rehabilitación Humana')} />
                }
                {filteredData.some(data => data['escuela'] === 'Salud Pública') && 
                    <CollapsibleButton buttonText={`Salud Pública (${Filtro4(filteredData, 'Salud Pública').length})`} content={renderFilteredTable(filteredData, 'Salud Pública')} />
                }
                {filteredData.some(data => data['escuela'] === 'Dirección de Posgrados') && 
                    <CollapsibleButton buttonText={`Dirección de Posgrados (${Filtro4(filteredData, 'Dirección de Posgrados').length})`} content={renderFilteredTable(filteredData, 'Dirección de Posgrados')} />
                }
                {filteredData.some(data => data['escuela'] === ' ' && data['escuela'] === '???' && data['escuela'] === 'SALE PARA TULIÁ') &&
                  <CollapsibleButton buttonText={`No Aplica`} content={renderFilteredTable(filteredData, 'No Aplica')} />
                }
              </div>
            ) : (
              <p>Ningún progama por mostrar</p>
            )}        
        </div>
        </>
    );
};

export default Mod;
