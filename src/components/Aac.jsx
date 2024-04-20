import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filtro4, Filtro5 } from '../service/data';
import '/src/styles/home.css'; 
import CollapsibleButton from './CollapsibleButton';


const Aac = ({ globalVariable }) => {
    const location = useLocation();
    const rowData = location.state; 
    const [filteredData, setFilteredData] = useState(rowData);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');  
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await Filtro5(); 
            setFilteredData(response.filter(item => item['aac_1a'] === 'SI'));
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

    const renderFilteredTable = (data, filter) => {
        let filteredData;
        if (filter === 'No Aplica'){
            filteredData = (data.filter(item => item['escuela'] === '' || item['escuela'] === '???' || item['escuela'] === 'SALE PARA TULIÁ'));
        } else {
            filteredData = Filtro4(data, filter);
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

export default Aac;
