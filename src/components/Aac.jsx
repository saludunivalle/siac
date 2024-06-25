import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filtro4, Filtro5, Filtro7 } from '../service/data';
import '/src/styles/home.css'; 
import CollapsibleButton from './CollapsibleButton';


const Aac = ({ globalVariable }) => {
    const location = useLocation();
    const rowData = location.state; 
    const [filteredData, setFilteredData] = useState(rowData);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');  
    const [loading, setLoading] = useState(false);
    const [filteredDataSeg, setFilteredDataSeg] = useState(rowData);
    const [updateTrigger, setUpdateTrigger] = useState(false); 
    const navigate = useNavigate();
    // Permisos
    const [user, setUser] = useState('');
    const [isCargo, setCargo] = useState([' ']);

    useEffect(() => {
        if (sessionStorage.getItem('logged')) {
        let res = JSON.parse(sessionStorage.getItem('logged'));
        const permisos = res.map(item => item.permiso).flat();
        setCargo(permisos);
        setUser(res[0].user);
        console.log("Permisos del usuario:", permisos);
        }
    }, []);

    useEffect(() => {
        if (isCargo.includes('Posgrados')) {
        const filtered = rowData?.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        setFilteredData(filtered);
        } else {
        setFilteredData(rowData);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const seguimientos = await Filtro7();
                const response2 = seguimientos.filter(item => item['id_programa']);
                setFilteredDataSeg(response2);
            } catch (error) {
                console.error('Error al filtrar datos:', error);
            }
        };
    
        fetchData();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            let response;
            if (isCargo.includes('Posgrados')) {
            const filtered = await Filtro5();
            response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
            
            } else {
            response = await Filtro5();
            }
            setFilteredData(response.filter(item => item['aac_1a'] === 'SI'));
          } catch (error) {
            console.error('Error al filtrar datos:', error);
          }
        };
      
        fetchData();
    }, []);

    const getBackgroundColor = (data) => {
        if (!data || !data.id_programa) {
            return 'white'; 
        }
    
        try {
            
            const seguimientos = filteredDataSeg;   
            const response =  seguimientos.filter(item => item['id_programa'] === data.id_programa);
            
            if (response.length === 0) {
                return 'white';
            }
            
            const seguimientoMasReciente = response.reduce((prev, current) =>
                new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
            );
                        
            let color;
            switch (seguimientoMasReciente.riesgo) {
                case 'Alto':
                    color = '#FED5D1';
                    break;
                case 'Medio':
                    color = '#FEFBD1';
                    break;
                case 'Bajo':
                    color = '#E6FFE6';
                    break;
                default:
                    color = 'white';
            }
            return color;
        } catch (error) {
            console.error('Error al obtener el color de fondo:', error);
            return 'white';     
        }
    };

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
        if (isCargo.includes('Posgrados')) {
            filteredData = filteredData.filter(item => item['pregrado/posgrado'] === 'Posgrado');
            
        } else {
            filteredData;
        }

        const colors = {};
        for (const item of data) {
            const color = getBackgroundColor(item);
            colors[item.id_programa] = color;
        }
        
        return (
            <div className='table-container'>
            {loading ? (
                <p>Cargando datos...</p>
            ) : (
                <table>
                <tbody>
                    {data.map((item, index) => {
                        const color = colors[item.id_programa] || 'white';

                        return (
                            <tr key={index} style={{backgroundColor: color}} onClick={() => handleRowClick(item)}>
                                <td className="bold" style={{fontSize:'14px', textAlign: 'left', paddingLeft:'5px'}}>{item['programa académico']}</td> 
                                <td>{item['departamento']}</td> 
                                <td>{item['sección']}</td> 
                                <td>{item['estado']}</td> 
                                <td>{item['nivel de formación']}</td> 
                            </tr>
                        );
                    })}
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
