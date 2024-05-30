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
  switch (buttonType) {
    case 'white':
      return {
        backgroundColor: isClicked ? '#7e7e7e' : '#fff',
        color: '#000',
        borderColor: '#7e7e7e'
      };
    case 'green':
      return {
        paddingLeft: '1rem',
        backgroundColor: isClicked ? '#4caf50' : '#4caf4f36',
        color: isClicked ? '#fff' : '#000000',
        borderColor: isClicked ? '#4caf50' : '#4caf50'
      };
    case 'yellow':
      return {
        paddingLeft: '1rem',
        backgroundColor: isClicked ? '#ffe600' : 'rgba(255, 235, 59, 0.288)',
        color: isClicked ? '#fff' : '#000000',
        borderColor: isClicked ? '#yellow' : 'yellow'
      };
    case 'orange':
      return {
        backgroundColor: isClicked ? '#ff9800' : '#ff990079',
        color: isClicked ? '#fff' : '#000000',
        borderColor: isClicked ? '#orange' : 'orange'
      };
    case 'orange2':
      return {
        paddingLeft: '1rem',
        backgroundColor: isClicked ? '#ff5722' : '#ff562275',
        color: isClicked ? '#fff' : '#000000',
        borderColor: isClicked ? '#ff5722' : '#ff5722'
      };
    case 'red':
      return {
        paddingLeft: '1rem',
        backgroundColor: isClicked ? '#ee1809' : '#f443368e',
        color: isClicked ? '#fff' : '#000000',
        borderColor: isClicked ? '#ee1809' : '#ee1809'
      };
  
    default:
      return {}; 
  }
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
      const filtered = filteredData?.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      setFilteredData(filtered);
      console.log("datos", filteredData)
    } else {
      setFilteredData(filteredData);
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

  const getBackgroundColor = (data) => {
    if (!data || !data.id_programa) {
        return 'white'; 
    }

    try {
        
        const seguimientos = filteredDataSeg;   
        const response =  seguimientos.filter(item => item['id_programa'] === data.id_programa && (item['topic'] === 'Renovación Registro Calificado' || item['topic'] === 'Plan de Mejoramiento RRC'));
        
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
          setWhiteProgramsCount(response.filter(item => item['fase rrc'] === 'Vencido' && item['rc vigente'] == 'SI' && item['sede'] === 'Cali').length);
          setGreenProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 1' && item['rc vigente'] == 'SI' && item['sede'] === 'Cali').length);
          setYellowProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 2' && item['rc vigente'] == 'SI' && item['sede'] === 'Cali').length);
          setOrangeProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 3' && item['rc vigente'] == 'SI' && item['sede'] === 'Cali').length);
          setOrange2ProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 4' && item['rc vigente'] == 'SI' && item['sede'] === 'Cali').length);
          setRedProgramsCount(response.filter(item => item['fase rrc'] === 'Fase 5' && item['rc vigente'] == 'SI' && item['sede'] === 'Cali').length);
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
    let searchTerm = '';
    switch (buttonType) {
      case 'white':
        searchTerm = 'Vencido';
        setHeaderBackgroundColor('#f2f2f2');
        break;
      case 'green':
        searchTerm = 'Fase 1' ;
        setHeaderBackgroundColor('#4caf4f36');
        break;
      case 'yellow':
        searchTerm = 'Fase 2' ;
        setHeaderBackgroundColor('rgba(255, 235, 59, 0.288)');
        break;
      case 'orange':
        searchTerm = 'Fase 3' ;
        setHeaderBackgroundColor('#ff990079');
        break;
      case 'orange2':
        searchTerm = 'Fase 4' ;
        setHeaderBackgroundColor('#ff562275');
        break;
      case 'red':
        searchTerm = 'Fase 5' ;
        setHeaderBackgroundColor('#f443368e');
        break;
      default:
        searchTerm =  'N/A';
    }
    try {
      setLoading(true);
      let response;
        if (isCargo.includes('Posgrados')) {
          const filtered = await Filtro2({ searchTerm });
          response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
          
        } else {
          response = await Filtro2({ searchTerm });
        }

      setFilteredData(response.filter(item => item['rc vigente'] == 'SI'));
    } catch (error) {
      console.error('Error al filtrar datos:', error);
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
    let filteredData
    if (filter === 'No Aplica'){
        filteredData = (data.filter(item => item['escuela'] === ' ' || item['escuela'] === '???' || item['escuela'] === 'SALE PARA TULIÁ')).filter(item => item['sede'] === 'Cali');
    } else {
        filteredData = (Filtro4(data, filter)).filter(item => item['sede'] === 'Cali' || item['estado'] !== 'Inactivo' || item['estado'] !== 'Desistido' || item['estado'] !== 'Rechazado');
    }
    if (filteredData.length === 0) {
      return <p>Ningún progama por mostrar</p>;
    }
    if (isCargo.includes('Posgrados')) {
      filteredData = filteredData.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      
    } else {
      filteredData;
    }
    return (
      <div className='table-container'>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <table>
            <tbody>
              {filteredData.map((item, index) => {
                const color = colors[item.id_programa] || 'white';
                return (
                      <tr key={index} style={{backgroundColor: color}} onClick={() => handleRowClick(item)}>
                        <td className="bold" style={{fontSize:'14px', textAlign: 'left', paddingLeft:'5px'}}>{item['programa académico']}</td> 
                        <td>{item['sede']}</td> 
                        <td>{item['escuela']}</td> 
                        <td>{item['departamento']}</td> 
                        <td>{item['pregrado/posgrado']}</td> 
                        <td>{item['rc vigente'] === 'SI' ? <img src={Si_icon} alt="" style={{ width: '25px', height: '25px'}} /> : <img src={No_icon} alt="" style={{ width: '25px', height: '25px'}} />}</td>
                        <td>{item['fechaexpedrc']}</td> 
                        <td>{item['duracionrc']}</td> 
                        <td className="bold">{item['fechavencrc']}</td>                           
                        <td>{item['ac vigente'] === 'SI' ? <img src={Si_icon} alt="" style={{ width: '25px', height: '25px'}} /> : <img src={No_icon} alt="" style={{ width: '25px', height: '25px'}} />}</td>
                      </tr>
                  );
               })}
            </tbody>
          </table>
            )}
            </div>
    );
  };

  const contenido_semaforo = () =>{
    return (
        <>
          <div className='result-container'>
            {filteredData && filteredData.length > 0 && clickedButton !== null ? (
              <div className='row-container'>
                <table>
                  <thead>
                    <tr>
                      <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Sede</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Escuela</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>  
                      <th style={{ backgroundColor: headerBackgroundColor }}>Pregrado/Posgrado</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>RRC Vigente</th>                    
                      <th style={{ backgroundColor: headerBackgroundColor }}>FechaExpedRRC</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>DuracionRRC</th>
                      <th className="bold"style={{ backgroundColor: headerBackgroundColor }}>FechaVencRRC</th>
                      <th style={{ backgroundColor: headerBackgroundColor }}>AC Vigente</th>
                    </tr>
                  </thead>
                </table>  
                {/* <div className='cantidad-container'> Cantidad de programas: {filteredData ? filteredData.length : 0} </div>          */}
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

  return (
    <>
      {isMobile ? (
        <>
            <div className='semaforo-container'>
            <button className='custom-button'
              style={setButtonStyles('white', clickedButton === 'white')}
              onClick={() => handleButtonClick('white')}
            >
              PROGRAMAS VENCIDOS <br/>
              {whiteProgramsCount !== 0 ? whiteProgramsCount : loading ? <CircularProgress size={20} /> : ''}
            </button>
            {clickedButton === 'white' && (
                <>
                    {contenido_semaforo()}
                </>
            )}
            <button className='custom-button'
              style={setButtonStyles('green', clickedButton === 'green')}
              onClick={() => {handleButtonClick('green'); contenido_semaforo()}}
            >
              AÑO Y 6 MESES <br/>
              {greenProgramsCount !== 0 ? greenProgramsCount : loading ? <CircularProgress size={20} /> : ''}
            </button>
            {clickedButton === 'green' && (
                <>
                    {contenido_semaforo()}
                </>
            )}
            <button className='custom-button'
              style={setButtonStyles('yellow', clickedButton === 'yellow')}
              onClick={() => {handleButtonClick('yellow'); contenido_semaforo()}}
            >
              6 MESES ANTES DE LA MITAD<br/>
              {yellowProgramsCount !== 0 ? yellowProgramsCount : loading ? <CircularProgress size={20} /> : ''}
            </button>
            {clickedButton === 'yellow' && (
                <>
                    {contenido_semaforo()}
                </>
            )}
            <button className='custom-button'
              style={setButtonStyles('orange', clickedButton === 'orange')}
              onClick={() => {handleButtonClick('orange'); contenido_semaforo()}}
            >
              3 AÑOS ANTES DEL VENCIMIENTO<br/>
              {orangeProgramsCount !== 0 ? orangeProgramsCount : loading ? <CircularProgress size={20} /> : ''}
            </button>
            {clickedButton === 'orange' && (
                <>
                    {contenido_semaforo()}
                </>
            )}
            <button className='custom-button'
              style={setButtonStyles('orange2', clickedButton === 'orange2')}
              onClick={() => {handleButtonClick('orange2'); contenido_semaforo()}}
            >
              18 MESES ANTES DEL VENCIMIENTO<br/>
              {orange2ProgramsCount !== 0 ? orange2ProgramsCount : loading ? <CircularProgress size={20} /> : ''}
            </button>
            {clickedButton === 'orange2' && (
                <>
                    {contenido_semaforo()}
                </>
            )}
            <button className='custom-button'
              style={setButtonStyles('red', clickedButton === 'red')}
              onClick={() => {handleButtonClick('red'); contenido_semaforo()}}
            >
              AÑO DE VENCIMIENTO<br/>
              {redProgramsCount !== 0 ? redProgramsCount : loading ? <CircularProgress size={20} /> : ''}
            </button>
            {clickedButton === 'red' && (
                <>
                    {contenido_semaforo()}
                </>
            )}
          </div>
        </>
      ):(
        <>
          <div className='semaforo-container'>
          <button className='custom-button'
            style={setButtonStyles('white', clickedButton === 'white')}
            onClick={() => handleButtonClick('white')}
          >
            PROGRAMAS VENCIDOS<br/>
            {whiteProgramsCount !== 0 ? whiteProgramsCount : loading ? <CircularProgress size={20} /> : ''}
          </button>
          <button className='custom-button'
            style={setButtonStyles('green', clickedButton === 'green')}
            onClick={() => handleButtonClick('green')}
          >
            AÑO Y 6 MESES <br/>
            {greenProgramsCount !== 0 ? greenProgramsCount : loading ? <CircularProgress size={20} /> : ''}
          </button>
          <button className='custom-button'
            style={setButtonStyles('yellow', clickedButton === 'yellow')}
            onClick={() => handleButtonClick('yellow')}
          >
            6 MESES ANTES DE LA MITAD<br/>
            {yellowProgramsCount !== 0 ? yellowProgramsCount : loading ? <CircularProgress size={20} /> : ''}
          </button>
          <button className='custom-button'
            style={setButtonStyles('orange', clickedButton === 'orange')}
            onClick={() => handleButtonClick('orange')}
          >
            3 AÑOS ANTES DEL VENCIMIENTO<br/>
            {orangeProgramsCount !== 0 ? orangeProgramsCount : loading ? <CircularProgress size={20} /> : ''}
          </button>
          <button className='custom-button'
            style={setButtonStyles('orange2', clickedButton === 'orange2')}
            onClick={() => handleButtonClick('orange2')}
          >
            18 MESES ANTES DEL VENCIMIENTO<br/>
            {orange2ProgramsCount !== 0 ? orange2ProgramsCount : loading ? <CircularProgress size={20} /> : ''}
          </button>
          <button className='custom-button'
            style={setButtonStyles('red', clickedButton === 'red')}
            onClick={() => handleButtonClick('red')}
          >
            AÑO DE VENCIMIENTO<br/>
            {redProgramsCount !== 0 ? redProgramsCount : loading ? <CircularProgress size={20} /> : ''}
          </button>
        </div>
        {contenido_semaforo()}
        </>
      )};
    </>
  );


}



export default Semaforo;