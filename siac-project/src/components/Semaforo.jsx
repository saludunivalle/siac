import React, { useState } from 'react';
import { Filtro2 } from '../service/data'; 
import '/src/styles/header.css';
import '/src/styles/table.css';

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
      const response = await Filtro2({ searchTerm });
      setFilteredData(response);
    } catch (error) {
      console.error('Error al filtrar datos:', error);
      // Puedes manejar el error según tus necesidades
    }
  };

  return (
    <>
      <div className='semaforo-container'>
        <button
          style={setButtonStyles('white', clickedButton === 'white')}
          onClick={() => handleButtonClick('white')}
        >
          NO APLICA / SIN INFORMACIÓN
        </button>
        <button
          style={setButtonStyles('green', clickedButton === 'green')}
          onClick={() => handleButtonClick('green')}
        >
          AÑO Y 6 MESES
        </button>
        <button
          style={setButtonStyles('yellow', clickedButton === 'yellow')}
          onClick={() => handleButtonClick('yellow')}
        >
          6 MESES ANTES DE LA MITAD
        </button>
        <button
          style={setButtonStyles('orange', clickedButton === 'orange')}
          onClick={() => handleButtonClick('orange')}
        >
          3 AÑOS ANTES DEL VENCIMIENTO
        </button>
        <button
          style={setButtonStyles('orange2', clickedButton === 'orange2')}
          onClick={() => handleButtonClick('orange2')}
        >
          18 MESES ANTES DEL VENCIMIENTO
        </button>
        <button
          style={setButtonStyles('red', clickedButton === 'red')}
          onClick={() => handleButtonClick('red')}
        >
          AÑO DE VENCIMIENTO
        </button>
      </div>
      <div className='result-container'>
        {filteredData && filteredData.length > 0 ? (
          <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th className="bold" style={{ backgroundColor: headerBackgroundColor }}>Programa Académico</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Sede</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Escuela</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>Departamento</th>  
                <th style={{ backgroundColor: headerBackgroundColor }}>Pregrado/Posgrado</th>                    
                <th style={{ backgroundColor: headerBackgroundColor }}>FechaExpedRRC</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>DuracionRRC</th>
                <th className="bold"style={{ backgroundColor: headerBackgroundColor }}>FechaVencRRC</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>AC Vigente</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>FechaExpedAC</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>DuracionAC</th>
                <th style={{ backgroundColor: headerBackgroundColor }}>FechaVencAC</th>
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
                  <td>{item['fechaexpedrc']}</td> 
                  <td>{item['duracionrc']}</td> 
                  <td className="bold">{item['fechavencrc']}</td> 
                  <td>{item['ac vigente']}</td> 
                  <td>{item['fechaexpedac']}</td> 
                  <td>{item['duracionac']}</td> 
                  <td>{item['fechavencac']}</td> 
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p>No hay datos para mostrar.</p>
        )}
      </div>
    </>
  );
}

export default Semaforo;