import React, { useEffect, useState } from 'react';
import { Filtro2, Filtro4, Filtro7 } from '../service/data'; 
import CircularProgress from '@mui/material/CircularProgress';
import CollapsibleButton from './CollapsibleButton';
import '/src/styles/home.css';
import '/src/styles/table.css';
import Si_icon from '../assets/si_icon.png';
import No_icon from '../assets/no_icon.png';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';

const setButtonStyles = (buttonType, isClicked) => {
  const styles = {
    white: { backgroundColor: isClicked ? '#7e7e7e' : '#fff', color: '#000', borderColor: '#7e7e7e' },
    green: { paddingLeft: '1rem', backgroundColor: isClicked ? '#4caf50' : '#4caf4f36', color: isClicked ? '#fff' : '#000', borderColor: '#4caf50' },
    yellow: { paddingLeft: '1rem', backgroundColor: isClicked ? '#ffe600' : 'rgba(255, 235, 59, 0.288)', color: isClicked ? '#fff' : '#000', borderColor: 'yellow' },
    orange: { backgroundColor: isClicked ? '#ff9800' : '#ff990079', color: isClicked ? '#fff' : '#000', borderColor: 'orange' },
    orange2: { paddingLeft: '1rem', backgroundColor: isClicked ? '#ff5722' : '#ff562275', color: isClicked ? '#fff' : '#000', borderColor: '#ff5722' },
    red: { paddingLeft: '1rem', backgroundColor: isClicked ? '#ee1809' : '#f443368e', color: isClicked ? '#fff' : '#000', borderColor: '#ee1809' }
  };
  return styles[buttonType] || {};
};

const Semaforo = ({ globalVariable }) => {
  const [clickedButton, setClickedButton] = useState(null);
  const [filteredData, setFilteredData] = useState(null); 
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2'); 
  const [loading, setLoading] = useState(false);
  const [greenProgramsCount, setGreenProgramsCount] = useState(0);
  const [whiteProgramsCount, setWhiteProgramsCount] = useState(0);
  const [yellowProgramsCount, setYellowProgramsCount] = useState(0);
  const [orangeProgramsCount, setOrangeProgramsCount] = useState(0);
  const [orange2ProgramsCount, setOrange2ProgramsCount] = useState(0);
  const [redProgramsCount, setRedProgramsCount] = useState(0);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [filteredDataSeg, setFilteredDataSeg] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(false); 
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState([' ']);

  useEffect(() => {
    if (sessionStorage.getItem('logged')) {
      const res = JSON.parse(sessionStorage.getItem('logged'));
      const permisos = res.map(item => item.permiso).flat();
      setCargo(permisos);
      setUser(res[0].user);
      //console.log("Permisos del usuario:", permisos);
    }
  }, []);

  useEffect(() => {
    if (isCargo.includes('Posgrados')) {
      const filtered = filteredData?.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      setFilteredData(filtered);
    } else {
      setFilteredData(filteredData);
    }
  }, [filteredData, isCargo]);

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

  const getBackgroundColor = (data) => {
    if (!data || !data.id_programa) {
      return 'white'; 
    }

    try {
      const seguimientos = filteredDataSeg;   
      const response = seguimientos.filter(item => item['id_programa'] === data.id_programa);
      
      if (response.length === 0) {
        return 'white';
      }
      
      const seguimientoMasReciente = response.reduce((prev, current) =>
        new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
      );
      
      const colorMap = {
        'Alto': '#FED5D1',
        'Medio': '#FEFBD1',
        'Bajo': '#E6FFE6'
      };
      
      return colorMap[seguimientoMasReciente.riesgo] || 'white';
    } catch (error) {
      console.error('Error al obtener el color de fondo:', error);
      return 'white';     
    }
  };

  const handleRowClick = (rowData) => {
    console.log('Datos de la fila:', rowData);
    navigate('/program_details', { state: { ...rowData, globalVariable } });
  };

  useEffect(() => {
    console.log(filteredData); 
    setLoading(false);
  }, [filteredData]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        if (isCargo.includes('Posgrados')) {
          const filtered = await Filtro2({ searchTerm: '' }); 
          response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        } else {
          response = await Filtro2({ searchTerm: '' });
        }
        setFilteredData(response);
        setWhiteProgramsCount(response.filter(item => item['fase rrc'] === 'Vencido' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length);
        setGreenProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 1' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length);
        setYellowProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 2' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length);
        setOrangeProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 3' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length);
        setOrange2ProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 4' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length);
        setRedProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 5' && item['rc vigente'] === 'SI' && item['sede'] === 'Cali').length);
        setLoading(false);
      } catch (error) {
        console.error('Error al filtrar datos:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [isCargo]);

  const handleButtonClick = async (buttonType) => {
    setClickedButton(buttonType === clickedButton ? null : buttonType);
    const searchTermMap = {
      white: 'Vencido',
      green: 'Fase 1',
      yellow: 'Fase 2',
      orange: 'Fase 3',
      orange2: 'Fase 4',
      red: 'Fase 5',
      default: 'N/A'
    };
    const headerColorMap = {
      white: '#f2f2f2',
      green: '#4caf4f36',
      yellow: 'rgba(255, 235, 59, 0.288)',
      orange: '#ff990079',
      orange2: '#ff562275',
      red: '#f443368e'
    };

    const searchTerm = searchTermMap[buttonType] || searchTermMap.default;
    setHeaderBackgroundColor(headerColorMap[buttonType] || headerColorMap.default);

    try {
      setLoading(true);
      let response;
      if (isCargo.includes('Posgrados')) {
        const filtered = await Filtro2({ searchTerm });
        response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      } else {
        response = await Filtro2({ searchTerm });
      }
      setFilteredData(response.filter(item => item['rc vigente'] === 'SI'));
    } catch (error) {
      console.error('Error al filtrar datos:', error);
    }
  };

  const getSemaforoColor = (vencimientoYear) => {
    const currentYear = new Date().getFullYear();

    if (vencimientoYear < currentYear) {
    return '#D3D3D3'; // Gris para vencido
    } else if (vencimientoYear <= currentYear + 1) {
    return '#FED5D1'; // Rojo para vencimiento en el próximo año
    } else if (vencimientoYear > currentYear + 1 && vencimientoYear <= currentYear + 3) {
    return '#FEFBD1'; // Amarillo para vencimiento entre un año y tres años
    } else {
    return '#E6FFE6'; // Verde para más de tres años de vencimiento
    }
};

  const renderFilteredTable = (data, filter) => {
    if (!data || data.length === 0) {
      return <p>Ningún programa por mostrar</p>;
    }

    const colors = {};
    for (const item of data) {
      const color = getBackgroundColor(item);
      colors[item.id_programa] = color;
    }

    let filteredData = filter === 'No Aplica'
      ? data.filter(item => item['escuela'] === ' ' || item['escuela'] === '???' || item['escuela'] === 'SALE PARA TULIÁ').filter(item => item['sede'] === 'Cali')
      : Filtro4(data, filter).filter(item => item['sede'] === 'Cali' || item['estado'] !== 'Inactivo' || item['estado'] !== 'Desistido' || item['estado'] !== 'Rechazado');

    if (filteredData.length === 0) {
      return <p>Ningún programa por mostrar</p>;
    }

    if (isCargo.includes('Posgrados')) {
      filteredData = filteredData.filter(item => item['pregrado/posgrado'] === 'Posgrado');
    }

    return (
      <div className='table-container'>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <table>
            <tbody>
              {filteredData.map((item, index) => {
                const rrcYear = item['fechavencrc'] ? parseInt(item['fechavencrc'].split('/')[2]) : null;
                const aacYear = item['fechavencac'] ? parseInt(item['fechavencac'].split('/')[2]) : null;

                const rrcColor = rrcYear ? getSemaforoColor(rrcYear) : 'transparent';
                const aacColor = aacYear ? getSemaforoColor(aacYear) : 'transparent';

                const color = colors[item.id_programa] || 'white';
                return (
                  <tr key={index} onClick={() => handleRowClick(item)}>
                    <td className="bold" style={{ backgroundColor: color, fontSize: '14px', textAlign: 'left', paddingLeft: '5px' }}>{item['programa académico']}</td> 
                    <td>{item['departamento']}</td> 
                    <td>{item['sede']}</td> 
                    {/* <td>{item['escuela']}</td>  */}
                    <td>{item['pregrado/posgrado']}</td> 
                    <td>{item['nivel de formación']}</td>
                    <td>{item['rc vigente'] === 'SI' ? <img src={Si_icon} alt="" style={{ width: '25px', height: '25px' }} /> : <img src={No_icon} alt="" style={{ width: '25px', height: '25px' }} />}</td>
                    <td className="bold" style={{ backgroundColor: rrcColor }}>{item['fechavencrc']}</td>                           
                    <td>{item['ac vigente'] === 'SI' ? <img src={Si_icon} alt="" style={{ width: '25px', height: '25px' }} /> : <img src={No_icon} alt="" style={{ width: '25px', height: '25px' }} />}</td>
                    <td style={{ backgroundColor: aacColor }}>{item['fechavencac']}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const contenido_semaforo = () => (
    <div className='result-container'>
      {filteredData && filteredData.length > 0 && clickedButton !== null ? (
        <div className='row-container'>
          <table>
            <thead>
              <tr>
                <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>  
                <th style={{ backgroundColor: headerBackgroundColor }}>Sede</th>
                {/* <th style={{ backgroundColor: headerBackgroundColor }}>Escuela</th> */}
                <th style={{ backgroundColor: headerBackgroundColor }}>Nivel Académico</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Nivel de Formación</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>RRC Vigente</th>                    
                <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vencimiento RC</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>AAC Vigente</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vecimiento AAC</th>
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
        <p>Ningún programa por mostrar</p>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <div className='semaforo-container'>
          {['white', 'green', 'yellow', 'orange', 'orange2', 'red'].map((color, index) => (
            <React.Fragment key={color}>
              <button
                className='custom-button'
                style={setButtonStyles(color, clickedButton === color)}
                onClick={() => handleButtonClick(color)}
              >
                {color === 'white' && 'PROGRAMAS VENCIDOS'}
                {color === 'green' && 'AÑO Y 6 MESES'}
                {color === 'yellow' && '6 MESES ANTES DE LA MITAD'}
                {color === 'orange' && '3 AÑOS ANTES DEL VENCIMIENTO'}
                {color === 'orange2' && '18 MESES ANTES DEL VENCIMIENTO'}
                {color === 'red' && 'AÑO DE VENCIMIENTO'}
                <br />
                {(() => {
                  switch (color) {
                    case 'white': return whiteProgramsCount !== 0 ? whiteProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'green': return greenProgramsCount !== 0 ? greenProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'yellow': return yellowProgramsCount !== 0 ? yellowProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'orange': return orangeProgramsCount !== 0 ? orangeProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'orange2': return orange2ProgramsCount !== 0 ? orange2ProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'red': return redProgramsCount !== 0 ? redProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    default: return null;
                  }
                })()}
              </button>
              {clickedButton === color && contenido_semaforo()}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <>
          <div className='semaforo-container'>
            {['white', 'green', 'yellow', 'orange', 'orange2', 'red'].map((color, index) => (
              <button
                key={color}
                className='custom-button'
                style={setButtonStyles(color, clickedButton === color)}
                onClick={() => handleButtonClick(color)}
              >
                {color === 'white' && 'PROGRAMAS VENCIDOS'}
                {color === 'green' && 'AÑO Y 6 MESES'}
                {color === 'yellow' && '6 MESES ANTES DE LA MITAD'}
                {color === 'orange' && '3 AÑOS ANTES DEL VENCIMIENTO'}
                {color === 'orange2' && '18 MESES ANTES DEL VENCIMIENTO'}
                {color === 'red' && 'AÑO DE VENCIMIENTO'}
                <br />
                {(() => {
                  switch (color) {
                    case 'white': return whiteProgramsCount !== 0 ? whiteProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'green': return greenProgramsCount !== 0 ? greenProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'yellow': return yellowProgramsCount !== 0 ? yellowProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'orange': return orangeProgramsCount !== 0 ? orangeProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'orange2': return orange2ProgramsCount !== 0 ? orange2ProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    case 'red': return redProgramsCount !== 0 ? redProgramsCount : loading ? <CircularProgress size={20} /> : '';
                    default: return null;
                  }
                })()}
              </button>
            ))}
          </div>
          {contenido_semaforo()}
        </>
      )}
    </>
  );
};

export default Semaforo;
