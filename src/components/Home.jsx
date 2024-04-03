import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {ButtonGroup, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Semaforo from './Semaforo';
import SemaforoAc from './SemaforoAc';
import { Filtro5 } from '../service/data';
import Header from './Header';
import '/src/styles/home.css'; 
import Crea from './Crea';

const Home = () => {
  const [selectedValue, setSelectedValue] = useState();
  const [semaforoVisible, setSemaforoVisible] = useState(false);
  const [semaforoAcVisible, setSemaforoAcVisible] = useState(false);
  const [totalProgramsCount, setTotalProgramsCount] = useState(0);
  const [activosCount, setActivosCount]= useState(0);
  const [creacionCount, setCreacionCount]= useState(0);
  const [sedesCount, setSedesCount]= useState(0);
  const navigate = useNavigate();
  const [programasVisible, setProgramasVisible] = useState(true); 
  const [rowData, setRowData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Filtro5(); 
        setTotalProgramsCount(response.length); 
        setActivosCount(response.filter(item => item['estado'] === 'Activo').length);   
        setCreacionCount(response.filter(item => item['estado'] === 'En Creación').length);     
        setSedesCount(response.filter(item => item['sede'] !== 'Cali').length);  
        setRowData(response);         
      } catch (error) {
        console.error('Error al filtrar datos:', error);
      }
    };
    const buttonGoogle = document.getElementById("buttonDiv")
    if (buttonGoogle){
      buttonGoogle.classList.add('_display_none');
    }
    fetchData();
  }, []);

  const handleBackClick = () => {
    setProgramasVisible(true);
    setSemaforoVisible(false);
    setSemaforoAcVisible(false);
    setSelectedValue();
  };

  const setButtonStyles = (buttonValue) => {
    return {
      color: selectedValue === buttonValue ? 'white' : 'grey',
      backgroundColor: selectedValue === buttonValue ? 'grey' : 'transparent',
      border: `2px solid ${selectedValue === buttonValue ? 'grey' : 'grey'}`,
      borderRadius: '6px',
    };
  };

  const handleButtonClick = (buttonValue) => {
    setSelectedValue(buttonValue);
    setSemaforoVisible(false);
    setSemaforoAcVisible(false);

    if (buttonValue === 'option1') {
      setSemaforoVisible(true);
    } else if ( (buttonValue === 'option2')){
      setSemaforoAcVisible(true);
    }
    setProgramasVisible(false);
    // else if (buttonValue === 'option6') {
    //   setIsNivelVisible(true);
    // } else if (buttonValue === 'option7') {
    //   setIsEscuelasVisible(true);
    // }
  };
  
  const handleClick = () => {
    if (rowData) {
      navigate('/programas', { state: rowData }); 
    }
  };

  return (
    <>
      <Header/>
      <div className='container-general'>
      <div className='alltogether'>
       <div className='alltogether1'>
        <div className="banner">
            <div className="linea1"></div>
            <div className="text">Registro Calificado</div>
          <div className="linea1"></div>
        </div>
          <div className='buttons-container'>
          <ButtonGroup
              aria-label="gender"
              name="controlled-radio-buttons-group"
              className='radio-group'
            >
            <Button value="option4" className="custom-radio"
                style={setButtonStyles('option4')}
                onClick={() => handleButtonClick('option4')} 
                > CREA </Button>
            <Button value="option5" className="custom-radio"
              style={{color: 'grey', border: '2px solid grey', borderRadius: '6px' }}> MOD </Button>
            <Button value="option1" className="custom-radio" 
              style={setButtonStyles('option1')}
              onClick={() => handleButtonClick('option1')} 
            > RRC </Button>
            </ButtonGroup>
            </div>
        </div>
        <div className='alltogether1'>
        <div className="banner">
          <div className="linea2"></div>
          <div className="text">Acreditación</div>
          <div className="linea2"></div>
        </div>
        <div className='buttons-container'>
            <ButtonGroup
              aria-label="gender"
              name="controlled-radio-buttons-group"
              className='radio-group'
            >
              <Button value="option3" className="custom-radio"
                style={{color: 'grey', border: '2px solid grey', borderRadius: '6px' }}> AAC </Button>
              <Button value="option2" className="custom-radio" 
                style={setButtonStyles('option2')}
                onClick={() => handleButtonClick('option2')} 
              > RAAC </Button>
              <Button value="option3" className="custom-radio"
                style={{color: 'grey', border: '2px solid grey', borderRadius: '6px' }}> INT </Button>
            </ButtonGroup>
            {/* <ButtonGroup
              aria-label="gender"
              name="controlled-radio-buttons-group"
              value={selectedValue}
              className='radio-group'
            >
              <Button value="option6" className="custom-radio" 
                style={setButtonStyles('option6')}
                onClick={() => handleButtonClick('option6')}> 
                Nivel Educativo 
              </Button>
              <Button value="option7" className="custom-radio" 
                style={setButtonStyles('option7')}
                onClick={() => handleButtonClick('option7')}> 
                Escuela 
              </Button>
            </ButtonGroup> */}
          </div>
        </div>
      </div>
      {programasVisible && (
      <div className='programas' onClick={handleClick}>
        <div className='title'><strong>Programas</strong></div>
        <div className='activos'><strong>Activos </strong>..... {activosCount !== 0 ? activosCount : <CircularProgress size={20} /> }</div>
        <div className='creacion'><strong>En Creación</strong>..... {creacionCount !== 0 ? creacionCount : <CircularProgress size={20} /> }</div>
        <div className='sedes'><strong>En sedes</strong>..... {sedesCount !== 0 ? sedesCount : <CircularProgress size={20} /> }</div>
        <div className='total-programas'>Total Programas de la Facultad: {totalProgramsCount !== 0 ? totalProgramsCount : <CircularProgress size={20} /> }</div>
      </div>
      )}
      </div>
      {selectedValue === 'option1' && (
        <>
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', border: 'none', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        <Semaforo />
        </>
      )}
      {selectedValue === 'option2' && (
        <>
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', border: 'none', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        <SemaforoAc />
        </>
      )}
      {selectedValue === 'option4' && (
        <>
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', border: 'none', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        <Crea />
        </>
      )}
      {/* {selectedValue === 'option6' && (
        <Nivel/>
      )} */}
      {/* {selectedValue === 'option7' && (
        <Escuelas/>
      )} */}
    </>
  );
}

export default Home;
