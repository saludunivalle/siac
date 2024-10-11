import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Filtro6, Filtro4, Filtro7 } from '../service/data'; 
import CollapsibleButton from './CollapsibleButton';
import '/src/styles/home.css';
import '/src/styles/table.css';
import Si_icon from '../assets/si_icon.png';
import No_icon from '../assets/no_icon.png';
import { useNavigate } from 'react-router-dom';

const setButtonStyles = (buttonType, isClicked) => {
  const styles = {
    white: {
      backgroundColor: isClicked ? '#7e7e7e' : '#fff',
      color: '#000',
      borderColor: '#7e7e7e',
    },
    green: {
      paddingLeft: '1rem',
      backgroundColor: isClicked ? '#4caf50' : '#4caf4f36',
      color: isClicked ? '#fff' : '#000000',
      borderColor: isClicked ? '#4caf50' : '#4caf50',
    },
    yellow: {
      paddingLeft: '1rem',
      backgroundColor: isClicked ? '#ffe600' : 'rgba(255, 235, 59, 0.288)',
      color: isClicked ? '#fff' : '#000000',
      borderColor: isClicked ? '#ffe600' : '#ffe600',
    },
    orange: {
      backgroundColor: isClicked ? '#ff9800' : '#ff990079',
      color: isClicked ? '#fff' : '#000000',
      borderColor: isClicked ? '#ff9800' : '#ff9800',
    },
    orange2: {
      paddingLeft: '1rem',
      backgroundColor: isClicked ? '#ff5722' : '#ff562275',
      color: isClicked ? '#fff' : '#000000',
      borderColor: isClicked ? '#ff5722' : '#ff5722',
    },
    red: {
      paddingLeft: '1rem',
      backgroundColor: isClicked ? '#ee1809' : '#f443368e',
      color: isClicked ? '#fff' : '#000000',
      borderColor: isClicked ? '#ee1809' : '#ee1809',
    },
  };
  return styles[buttonType] || {};
};

const SemaforoAC = ({ globalVariable }) => {
  const [clickedButton, setClickedButton] = useState(null);
  const [filteredData, setFilteredData] = useState(null); 
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#f2f2f2'); 
  const [loading, setLoading] = useState(false);
  const [programsCount, setProgramsCount] = useState({
    green: 0,
    white: 0,
    yellow: 0,
    orange: 0,
    orange2: 0,
    red: 0,
  });
  const navigate = useNavigate();
  const [filteredDataSeg, setFilteredDataSeg] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [user, setUser] = useState('');
  const [isCargo, setCargo] = useState([' ']);

  useEffect(() => {
    const loggedUser = sessionStorage.getItem('logged');
    if (loggedUser) {
      const res = JSON.parse(loggedUser);
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
    if (!data || !data.id_programa) return 'white';
    try {
      const seguimientos = filteredDataSeg;
      const response = seguimientos.filter(item => item['id_programa'] === data.id_programa);
      if (response.length === 0) return 'white';

      const seguimientoMasReciente = response.reduce((prev, current) =>
        new Date(current.timestamp.split('/').reverse().join('-')) > new Date(prev.timestamp.split('/').reverse().join('-')) ? current : prev
      );

      const colors = {
        'Alto': '#FED5D1',
        'Medio': '#FEFBD1',
        'Bajo': '#E6FFE6',
      };
      return colors[seguimientoMasReciente.riesgo] || 'white';
    } catch (error) {
      console.error('Error al obtener el color de fondo:', error);
      return 'white';
    }
  };

  const handleRowClick = (rowData) => {
    navigate('/program_details', { state: { ...rowData, globalVariable } });
  };

  useEffect(() => {
    setLoading(false);
  }, [filteredData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        if (isCargo.includes('Posgrados')) {
          const filtered = await Filtro6({ searchTerm: '' });
          response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
        } else {
          response = await Filtro6({ searchTerm: '' });
        }
        setFilteredData(response);
        setProgramsCount({
          white: response.filter(item => item['fase rac'] === 'Vencido' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
          green: response.filter(item => item['fase rac'] === 'Fase 1' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
          yellow: response.filter(item => item['fase rac'] === 'Fase 2' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
          orange: response.filter(item => item['fase rac'] === 'Fase 3' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
          orange2: response.filter(item => item['fase rac'] === 'Fase 4' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
          red: response.filter(item => item['fase rac'] === 'Fase 5' && item['ac vigente'] === 'SI' && item['sede'] === 'Cali').length,
        });
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
    const searchTerms = {
      white: 'Vencido',
      green: 'Fase 1',
      yellow: 'Fase 2',
      orange: 'Fase 3',
      orange2: 'Fase 4',
      red: 'Fase 5',
    };
    setHeaderBackgroundColor(setButtonStyles(buttonType).backgroundColor);
    try {
      setLoading(true);
      let response;
      if (isCargo.includes('Posgrados')) {
        const filtered = await Filtro6({ searchTerm: searchTerms[buttonType] });
        response = filtered.filter(item => item['pregrado/posgrado'] === 'Posgrado');
      } else {
        response = await Filtro6({ searchTerm: searchTerms[buttonType] });
      }
      setFilteredData(response.filter(item => item['ac vigente'] === 'SI'));
    } catch (error) {
      console.error('Error al filtrar datos:', error);
    }
  };

  const renderFilteredTable = (data, filter) => {
    if (!data || data.length === 0) return <p>Ningún programa por mostrar</p>;
    const colors = {};
    data.forEach(item => {
      colors[item.id_programa] = getBackgroundColor(item);
    });
    let filteredData = filter === 'No Aplica'
      ? data.filter(item => ['', '???', 'SALE PARA TULIÁ'].includes(item['escuela']) && item['sede'] === 'Cali')
      : Filtro4(data, filter).filter(item => item['sede'] === 'Cali' && !['Inactivo', 'Desistido', 'Rechazado'].includes(item['estado']));
    
    if (isCargo.includes('Posgrados')) {
      filteredData = filteredData.filter(item => item['pregrado/posgrado'] === 'Posgrado');
    }
    if (filteredData.length === 0) return <p>Ningún programa por mostrar</p>;
    return (
      <div className='table-container'>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <table>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} style={{ backgroundColor: colors[item.id_programa] }} onClick={() => handleRowClick(item)}>
                  <td className="bold" style={{ fontSize: '14px', textAlign: 'left', paddingLeft: '5px' }}>{item['programa académico']}</td>
                  <td>{item['departamento']}</td>
                  <td>{item['sede']}</td>
                  {/* <td>{item['escuela']}</td> */}
                  <td>{item['pregrado/posgrado']}</td>
                  <td>{item['nivel de formación']}</td>
                  <td>{item['ac vigente'] === 'SI' ? <img src={Si_icon} alt="" style={{ width: '25px', height: '25px' }} /> : <img src={No_icon} alt="" style={{ width: '25px', height: '25px' }} />}</td>
                  <td className="bold">{item['fechavencac']}</td>
                  <td>{item['rc vigente'] === 'SI' ? <img src={Si_icon} alt="" style={{ width: '25px', height: '25px' }} /> : <img src={No_icon} alt="" style={{ width: '25px', height: '25px' }} />}</td>
                  <td>{item['fechavencrc']}</td>                           
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderContent = () => (
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
                <th style={{ backgroundColor: headerBackgroundColor }}>AAC Vigente</th>
                <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vencimiento AAc</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>RRC Vigente</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Fecha de Vencimiento RC</th>
              </tr>
            </thead>
          </table>
          {['Bacteriología y Lab. Clínico', 'Ciencias Básicas', 'Enfermería', 'Medicina', 'Odontología', 'Rehabilitación Humana', 'Salud Pública', 'Dirección de Posgrados'].map(escuela => (
            filteredData.some(data => data['escuela'] === escuela) && 
            <CollapsibleButton key={escuela} buttonText={`${escuela} (${Filtro4(filteredData, escuela).length})`} content={renderFilteredTable(filteredData, escuela)} />
          ))}
          {filteredData.some(data => ['', '???', 'SALE PARA TULIÁ'].includes(data['escuela'])) &&
            <CollapsibleButton buttonText="No Aplica" content={renderFilteredTable(filteredData, 'No Aplica')} />
          }
        </div>
      ) : (
        <p>Ningún programa por mostrar</p>
      )}
    </div>
  );

  return (
    <>
      <div className='semaforo-container'>
        {['white', 'green', 'yellow', 'orange', 'orange2', 'red'].map(color => (
          <button key={color} className='custom-button' style={setButtonStyles(color, clickedButton === color)} onClick={() => handleButtonClick(color)}>
            {color === 'white' && 'PROGRAMAS VENCIDOS'}
            {color === 'green' && 'AÑO Y 6 MESES'}
            {color === 'yellow' && '6 MESES ANTES DE LA MITAD'}
            {color === 'orange' && '3 AÑOS ANTES DEL VENCIMIENTO'}
            {color === 'orange2' && '18 MESES ANTES DEL VENCIMIENTO'}
            {color === 'red' && 'AÑO DE VENCIMIENTO'}
            <br />
            {(() => {
              switch (color) {
                case 'white': return programsCount.white !== 0 ? programsCount.white : loading ? <CircularProgress size={20} /> : '';
                case 'green': return programsCount.green !== 0 ? programsCount.green : loading ? <CircularProgress size={20} /> : '';
                case 'yellow': return programsCount.yellow !== 0 ? programsCount.yellow : loading ? <CircularProgress size={20} /> : '';
                case 'orange': return programsCount.orange !== 0 ? programsCount.orange : loading ? <CircularProgress size={20} /> : '';
                case 'orange2': return programsCount.orange2 !== 0 ? programsCount.orange2 : loading ? <CircularProgress size={20} /> : '';
                case 'red': return programsCount.red !== 0 ? programsCount.red : loading ? <CircularProgress size={20} /> : '';
                default: return null;
              }
            })()}
          </button>
        ))}
      </div>
      {renderContent()}
    </>
  );
};

export default SemaforoAC;
