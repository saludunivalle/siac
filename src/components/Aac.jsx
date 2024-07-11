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
  const [filteredDataSeg, setFilteredDataSeg] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState([' ']);

  useEffect(() => {
    const loggedData = sessionStorage.getItem('logged');
    if (loggedData) {
      const res = JSON.parse(loggedData);
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
      setUser(res[0].user);
    }
  }, []);

  useEffect(() => {
    if (isCargo.includes('Posgrados')) {
      const filtered = rowData?.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      setFilteredData(filtered);
    } else {
      setFilteredData(rowData);
    }
  }, [rowData, isCargo]);

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
  }, [isCargo]);

  const getBackgroundColor = (data) => {
    if (!data || !data.id_programa) return 'white';

    try {
      const seguimientos = filteredDataSeg;
      const response = seguimientos.filter(item => item['id_programa'] === data.id_programa);

      if (response.length === 0) return 'white';

      const seguimientoMasReciente = response.reduce((prev, current) =>
        new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
      );

      switch (seguimientoMasReciente.riesgo) {
        case 'Alto':
          return '#FED5D1';
        case 'Medio':
          return '#FEFBD1';
        case 'Bajo':
          return '#E6FFE6';
        default:
          return 'white';
      }
    } catch (error) {
      console.error('Error al obtener el color de fondo:', error);
      return 'white';
    }
  };

  const handleRowClick = (rowData) => {
    navigate('/program_details', { state: { ...rowData, globalVariable } });
  };

  const renderFilteredTable = (data, filter) => {
    let filteredData = filter === 'No Aplica'
      ? data.filter(item => [' ', '???', 'SALE PARA TULIÁ'].includes(item['escuela']))
      : Filtro4(data, filter);

    if (filteredData.length === 0) return <p>Ningún programa por mostrar</p>;

    if (isCargo.includes('Posgrados')) {
      filteredData = filteredData.filter(item => item['pregrado/posgrado'] === 'Posgrado');
    }

    const colors = filteredData.reduce((acc, item) => {
      acc[item.id_programa] = getBackgroundColor(item);
      return acc;
    }, {});

    return (
      <div className='table-container'>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <table>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} style={{ backgroundColor: colors[item.id_programa] || 'white' }} onClick={() => handleRowClick(item)}>
                  <td className="bold" style={{ fontSize: '14px', textAlign: 'left', paddingLeft: '5px' }}>{item['programa académico']}</td>
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
          {['Bacteriología y Lab. Clínico', 'Ciencias Básicas', 'Enfermería', 'Medicina', 'Odontología', 'Rehabilitación Humana', 'Salud Pública', 'Dirección de Posgrados'].map(escuela => (
            filteredData.some(data => data['escuela'] === escuela) &&
            <CollapsibleButton key={escuela} buttonText={`${escuela} (${Filtro4(filteredData, escuela).length})`} content={renderFilteredTable(filteredData, escuela)} />
          ))}
          {filteredData.some(data => [' ', '???', 'SALE PARA TULIÁ'].includes(data['escuela'])) &&
            <CollapsibleButton buttonText="No Aplica" content={renderFilteredTable(filteredData, 'No Aplica')} />
          }
        </div>
      ) : (
        <p>Ningún programa por mostrar</p>
      )}
    </div>
  );
};

export default Aac;
