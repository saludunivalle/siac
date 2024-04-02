import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Filtro4, Filtro5 } from '../service/data';
import '/src/styles/home.css'; 
import CollapsibleButton from './CollapsibleButton';


const Crea = () => {
    const location = useLocation();
    const rowData = location.state; 
    const [filteredData, setFilteredData] = useState(rowData);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');  
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await Filtro5(); 
            setFilteredData(response.filter(item => item['estado'] === 'En Creación'));
          } catch (error) {
            console.error('Error al filtrar datos:', error);
          }
        };
      
        fetchData();
    }, []);

    const handleRowClick = (rowData) => {
        console.log('Datos de la fila:', rowData);
        navigate('/program_details', { state: rowData });
    };

    const renderFilteredTable = (data, filter) => {
        const filteredData = Filtro4(data, filter);
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
                        <td className="bold">{item['programa académico']}</td> 
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
                <CollapsibleButton buttonText="Bacteriología y Lab. Clínico" content={renderFilteredTable(filteredData, 'Bacteriología y Lab. Clínico')} />
                <CollapsibleButton buttonText="Ciencias Básicas" content={renderFilteredTable(filteredData, 'Ciencias Básicas')} />
                <CollapsibleButton buttonText="Enfermería" content={renderFilteredTable(filteredData, 'Enfermería')} />
                <CollapsibleButton buttonText="Medicina" content={renderFilteredTable(filteredData, 'Medicina')} />
                <CollapsibleButton buttonText="Odontología" content={renderFilteredTable(filteredData, 'Odontología')} />
                <CollapsibleButton buttonText="Rehabilitación Humana" content={renderFilteredTable(filteredData, 'Rehabilitación Humana')} />
                <CollapsibleButton buttonText="Salud Pública" content={renderFilteredTable(filteredData, 'Salud Pública')} />
                <CollapsibleButton buttonText="No Aplica" content={renderFilteredTable(filteredData, 'No Aplica')} />
              </div>
            ) : (
              <p>Ningún progama por mostrar</p>
            )}        
        </div>
        </>
    );
};

export default Crea;
