import React, { useState, useEffect} from 'react';
import {ButtonGroup, Button } from '@mui/material';
import logo from '/src/assets/logovalle.png';
import '/src/styles/home.css'; 
// import Nivel from './NivelEd';
// import Escuelas from './Escuelas'
import Semaforo from './Semaforo';
import SemaforoAc from './SemaforoAc';
import { Filtro5 } from '../service/data';

const Home = () => {
  const [selectedValue, setSelectedValue] = useState();
  const [semaforoVisible, setSemaforoVisible] = useState(false);
  const [semaforoAcVisible, setSemaforoAcVisible] = useState(false);
  const [isNivelVisible, setIsNivelVisible] = useState(false);
  const [isEscuelasVisible, setIsEscuelasVisible] = useState(false);
  const [totalProgramsCount, setTotalProgramsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Filtro5(); 
        setTotalProgramsCount(response.length); 
      } catch (error) {
        console.error('Error al filtrar datos:', error);
      }
    };

    fetchData();
  }, []);

  const setButtonStyles = (buttonValue) => {
    return {
      color: selectedValue === buttonValue ? 'white' : 'grey',
      backgroundColor: selectedValue === buttonValue ? 'grey' : 'transparent',
      border: `2px solid ${selectedValue === buttonValue ? 'grey' : 'grey'}`,
      borderRadius: '6px',
      width: buttonValue === 'option6' ? 'fit-content' : 'fit-content',
    };
  };

  const handleButtonClick = (buttonValue) => {
    setSelectedValue(buttonValue);
    setSemaforoVisible(false);
    setSemaforoAcVisible(false);
    setIsNivelVisible(false);
    setIsEscuelasVisible(false);

    if (buttonValue === 'option1') {
      setSemaforoVisible(true);
    } else if ( (buttonValue === 'option2')){
      setSemaforoAcVisible(true);
    }
    // else if (buttonValue === 'option6') {
    //   setIsNivelVisible(true);
    // } else if (buttonValue === 'option7') {
    //   setIsEscuelasVisible(true);
    // }
  };
  
  return (
    <>
      <div className='home'>
        <div className='logo'><img src={logo} alt="Logo" /></div>
        <div className='title'>Sistema SIAC Facultad de Salud</div>
      </div>
      <div className='total'> 
        Total Programas de la Facultad: {totalProgramsCount}
      </div>
      <div className='buttons-container'>
          <ButtonGroup
            aria-label="gender"
            name="controlled-radio-buttons-group"
            className='radio-group'
          >
            <Button value="option1" className="custom-radio" 
              style={setButtonStyles('option1')}
              onClick={() => handleButtonClick('option1')} 
            >
              <span style={{ marginRight: '8px' }}>&nbsp;</span> RRC <span style={{ marginRight: '8px' }}>&nbsp;</span> </Button>
              <Button value="option2" className="custom-radio" 
              style={setButtonStyles('option2')}
              onClick={() => handleButtonClick('option2')} 
            >
              <span style={{ marginRight: '8px' }}>&nbsp;</span> RAC <span style={{ marginRight: '8px' }}>&nbsp;</span> </Button>
            <Button value="option3" className="custom-radio"
              style={{color: 'grey', border: '2px solid grey', borderRadius: '6px' }}> AC </Button>
            <Button value="option4" className="custom-radio"
              style={{color: 'grey', border: '2px solid grey', borderRadius: '6px' }}> CREA </Button>
            <Button value="option5" className="custom-radio"
              style={{color: 'grey', border: '2px solid grey', borderRadius: '6px' }}> MOD </Button>
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
      {selectedValue === 'option1' && (
        <Semaforo />
      )}
      {selectedValue === 'option2' && (
        <SemaforoAc />
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
