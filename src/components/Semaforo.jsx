import React, { useEffect, useState } from 'react';
import { Filtro2, Filtro4 } from '../service/data'; 
import CollapsibleButton from './CollapsibleButton';
import '/src/styles/header.css';
import '/src/styles/table.css';
import Si_icon from '../assets/si_icon.png';
import No_icon from '../assets/no_icon.png';

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
        borderColor: isClicked ? '#ffe600' : 'ffe600'
      };
    case 'orange':
      return {
        backgroundColor: isClicked ? '#ff9800' : '#ff990079',
        color: isClicked ? '#fff' : '#000000',
        borderColor: isClicked ? '#ff9800' : 'ffe600'
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

const Semaforo = () => {
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

  useEffect(() => {
    console.log(filteredData); 
    setLoading(false);
  }, [filteredData]); 
  
  const handleButtonClick = async (buttonType) => {
    setClickedButton(buttonType === clickedButton ? null : buttonType);
    let searchTerm = '';
    switch (buttonType) {
      case 'white':
        searchTerm = 'N/A';
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
      const response = await Filtro2({ searchTerm });
      setFilteredData(response);
      switch (buttonType) {
        case 'white':
          setWhiteProgramsCount(response.length);
          break;
        case 'green':
          setGreenProgramsCount(response.length);
          break;
        case 'yellow':
          setYellowProgramsCount(response.length);
          break;
        case 'orange':
          setOrangeProgramsCount(response.length);
          break;
        case 'orange2':
          setOrange2ProgramsCount(response.length);
          break;
        case 'red':
          setRedProgramsCount(response.length);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error al filtrar datos:', error);
    }
  };

  const renderFilteredTable = (data, filter) => {
    const filteredData = Filtro4(data, filter);
    return (
      <div className='table-container'>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
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
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="bold">{item['programa académico']}</td> 
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
              ))}
            </tbody>
          </table>
            )}
            </div>
    );
  };

  return (
    <>
      <div className='semaforo-container'>
        <button
          style={setButtonStyles('white', clickedButton === 'white')}
          onClick={() => handleButtonClick('white')}
        >
          NO APLICA / SIN INFORMACIÓN <br/>
          {whiteProgramsCount}
        </button>
        <button
          style={setButtonStyles('green', clickedButton === 'green')}
          onClick={() => handleButtonClick('green')}
        >
          AÑO Y 6 MESES <br/>
          {greenProgramsCount}
        </button>
        <button
          style={setButtonStyles('yellow', clickedButton === 'yellow')}
          onClick={() => handleButtonClick('yellow')}
        >
          6 MESES ANTES DE LA MITAD<br/>
          {yellowProgramsCount}
        </button>
        <button
          style={setButtonStyles('orange', clickedButton === 'orange')}
          onClick={() => handleButtonClick('orange')}
        >
          3 AÑOS ANTES DEL VENCIMIENTO<br/>
          {orangeProgramsCount}
        </button>
        <button
          style={setButtonStyles('orange2', clickedButton === 'orange2')}
          onClick={() => handleButtonClick('orange2')}
        >
          18 MESES ANTES DEL VENCIMIENTO<br/>
          {orange2ProgramsCount}
        </button>
        <button
          style={setButtonStyles('red', clickedButton === 'red')}
          onClick={() => handleButtonClick('red')}
        >
          AÑO DE VENCIMIENTO<br/>
          {redProgramsCount}
        </button>
      </div>
      <div className='result-container'>
        {filteredData && filteredData.length > 0 ? (
          <div className='containerCollapsible'>
            {/* <div className='cantidad-container'> Cantidad de programas: {filteredData ? filteredData.length : 0} </div>          */}
            <CollapsibleButton buttonText="Bacteriología y Lab. Clínico" content={renderFilteredTable(filteredData, 'Bacteriología y Lab. Clínico')} />
            <CollapsibleButton buttonText="Ciencias Básicas" content={renderFilteredTable(filteredData, 'Ciencias Básicas')} />
            <CollapsibleButton buttonText="Enfermería" content={renderFilteredTable(filteredData, 'Enfermería')} />
            <CollapsibleButton buttonText="Medicina" content={renderFilteredTable(filteredData, 'Medicina')} />
            <CollapsibleButton buttonText="Odontología" content={renderFilteredTable(filteredData, 'Odontología')} />
            <CollapsibleButton buttonText="Rehabilitación Humana" content={renderFilteredTable(filteredData, 'Rehabilitación Humana')} />
            <CollapsibleButton buttonText="Salud Pública" content={renderFilteredTable(filteredData, 'Salud Pública')} />
        </div>
        ) : (
          <p> </p>
        )}
      </div>
    </>
  );


}



export default Semaforo;