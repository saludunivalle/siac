import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filtro4, Filtro5, Filtro7 } from '../service/data';
import '/src/styles/home.css'; 
import CollapsibleButton from './CollapsibleButton';
import * as XLSX from 'xlsx';

const Crea = ({ globalVariable }) => {
  const location = useLocation();
  const rowData = location.state; 
  const [filteredData, setFilteredData] = useState(rowData);
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2');  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [filteredDataSeg, setFilteredDataSeg] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState([' ']);

  // Carga inicial de datos del usuario desde el almacenamiento de sesión
  useEffect(() => {
    const loggedData = sessionStorage.getItem('logged');
    if (loggedData) {
      const res = JSON.parse(loggedData);
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
      setUser(res[0].user);
    }
  }, []);

  // Filtra los datos según los permisos del usuario ("Posgrados")
  useEffect(() => {
    if (isCargo.includes('Posgrados')) {
      const filtered = rowData?.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      setFilteredData(filtered);
    } else {
      setFilteredData(rowData);
    }
  }, [rowData, isCargo]);

  // Carga y filtrado de datos secundarios desde un servicio remoto
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

  // Filtra los datos principales para mostrar únicamente los programas en estado "En Creación"
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
        setFilteredData(response.filter(item => item['estado'] === 'En Creación'));
      } catch (error) {
        console.error('Error al filtrar datos:', error);
      }
    };
    fetchData();
  }, [isCargo]);

  // Determina el color de fondo de una fila basado en los datos de seguimiento
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

  // Navega a la página de detalles del programa al hacer clic en una fila
  const handleRowClick = (rowData) => {
    navigate('/program_details', { state: { ...rowData, globalVariable } });
  };

  // Descarga los datos filtrados en un archivo Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Filtrados');
    XLSX.writeFile(workbook, 'datos_CREA.xlsx');
  };

  // Renderiza la tabla con los datos filtrados y colores aplicados
  const renderFilteredTable = (data, filter) => {
    if (!data || data.length === 0) return <p>Ningún programa por mostrar</p>;

    let filteredData;
    if (filter === 'No Aplica') {
      filteredData = data.filter(item => [' ', '???', 'SALE PARA TULIÁ'].includes(item['escuela'])).filter(item => item['sede'] === 'Cali');
    } else {
      filteredData = Filtro4(data, filter).filter(item => item['sede'] === 'Cali' || !['Inactivo', 'Desistido', 'Rechazado'].includes(item['estado']));
    }
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
                  {/* <td>{item['estado']}</td> */}
                  <td>{item['pregrado/posgrado']}</td>
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
      <button style={{marginTop:'20px', marginLeft:'20px'}} onClick={handleDownloadExcel} className="download-button">Generar Excel</button>
      {filteredData && filteredData.length > 0 ? (
        <div className='row-container'>
          <table style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
            <thead>
              <tr>
                <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Sección</th>
                {/* <th style={{ backgroundColor: headerBackgroundColor }}>Estado</th> */}
                <th style={{ backgroundColor: headerBackgroundColor }}>Nivel Académico</th>
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

export default Crea;
