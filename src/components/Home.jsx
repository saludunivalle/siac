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
import Aac from './Aac';
import Mod from './Mod';

const Home = () => {
  const [selectedValue, setSelectedValue] = useState();
  const [semaforoVisible, setSemaforoVisible] = useState(false);
  const [semaforoAcVisible, setSemaforoAcVisible] = useState(false);
  const [activosCount, setActivosCount]= useState(0);
  const [creacionCount, setCreacionCount]= useState(0);
  const [creacionSedesCount, setCreacionSedesCount]= useState(0);
  const [activoSedesCount, setActivoSedesCount]= useState(0);
  const [inactivosCount, setInactivosCount]= useState(0);
  const [otrosCount, setOtrosCount]= useState(0);
  const [aacCount, setAacCount]= useState(0);
  const [rrcCount, setRrcCount]= useState(0);
  const [raacCount, setRaacCount]= useState(0);
  const [modCount, setModCount]= useState(0);
  const navigate = useNavigate();
  const [programasVisible, setProgramasVisible] = useState(true); 
  const [rowData, setRowData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Filtro5(); 
        setActivosCount(response.filter(item => item['estado'] === 'Activo').length);   
        setActivoSedesCount(response.filter(item => item['estado'] === 'Activo - Sede').length);   
        setCreacionCount(response.filter(item => item['estado'] === 'En Creación').length);  
        setCreacionSedesCount(response.filter(item => item['estado'] === 'En Creación - Sede' || item['estado'] === 'En Creación*').length);     
        setOtrosCount(response.filter(item => item['estado'] === 'En conjunto con otra facultad' || item['estado'] === 'Pte. Acred. ARCOSUR').length);  
        setInactivosCount(response.filter(item => item['estado'] === 'Inactivo' || item['estado'] === 'Desistido' || item['estado'] === 'Rechazado').length);  
        setAacCount(response.filter(item => item['aac_1a'] === 'SI').length);  
        setRrcCount(response.filter(item => item['rc vigente'] === 'SI').length); 
        setRaacCount(response.filter(item => item['ac vigente'] === 'SI').length); 
        setModCount(response.filter(item => item['mod'] === 'SI').length);  
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
      <div className='alltogetherGeneral'>
        <div style={{fontSize: '25px', paddingBottom:'60px'}}>Procesos de Calidad</div>
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
                > CREA <br/>
                {creacionCount !== 0 ? creacionCount : <CircularProgress size={20} />}
            </Button>
            <Button value="option5" className="custom-radio"
                style={setButtonStyles('option5')}
                onClick={() => handleButtonClick('option5')} 
                > MOD <br/>
                {modCount !== 0 ? modCount : <CircularProgress size={20} />}
            </Button>
            <Button value="option1" className="custom-radio" 
              style={setButtonStyles('option1')}
              onClick={() => handleButtonClick('option1')} 
            > RRC <br/>
              {rrcCount !== 0 ? rrcCount : <CircularProgress size={20} />}
            </Button>
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
                style={setButtonStyles('option3')}
                onClick={() => handleButtonClick('option3')} 
                > AAC <br/>
                  {aacCount !== 0 ? aacCount : <CircularProgress size={20} />}
                </Button>
              <Button value="option2" className="custom-radio" 
                style={setButtonStyles('option2')}
                onClick={() => handleButtonClick('option2')} 
              > RAAC  <br/>
                {raacCount !== 0 ? raacCount : <CircularProgress size={20} />}
              </Button>
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
      </div>
      {programasVisible && (
      <div className='programas' onClick={handleClick}>
        <div className='title'><strong>Programas</strong></div>
        <table>
          <thead>
            <tr>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{paddingRight:'4px'}}>Activos Cali</td>
              <td>{activosCount !== 0 ? activosCount : <CircularProgress size={20} /> }</td>
            </tr>
            <tr>
              <td style={{paddingRight:'4px'}}>Activos Sedes</td>
              <td>{activoSedesCount !== 0 ? activoSedesCount : <CircularProgress size={20} /> }</td>
            </tr>
            <tr>
              <td style={{paddingRight:'4px'}}>En Creación</td>
              <td>{creacionCount !== 0 ? creacionCount : <CircularProgress size={20} /> }</td>
            </tr>
            <tr>
              <td style={{paddingRight:'4px'}}>En Creación (Sedes y otros)</td>
              <td>{creacionSedesCount !== 0 ? creacionSedesCount : <CircularProgress size={20} /> }</td>
            </tr>
            <tr>
              <td style={{paddingRight:'4px'}}>Otros</td>
              <td>{otrosCount !== 0 ? otrosCount : <CircularProgress size={20} /> }</td>
            </tr>
            <tr>
              <td style={{paddingRight:'4px'}}><strong>SUB-TOTAL:</strong></td>
              <td>{activosCount + creacionCount + creacionSedesCount + activoSedesCount + otrosCount }</td>
            </tr>
            <tr>
              <td style={{paddingRight:'4px'}}>Inactivos - Desistidos - Rechazados</td>
              <td>{inactivosCount !== 0 ? inactivosCount : <CircularProgress size={20} /> }</td>
            </tr>
            <tr>
              <td style={{paddingRight:'4px'}}><strong>TOTAL:</strong></td>
              <td>{activosCount + creacionCount + creacionSedesCount + activoSedesCount + otrosCount + inactivosCount}</td>
            </tr>
          </tbody>
        </table>

      </div>
      )}
      </div>
      {selectedValue === 'option1' && (
        <>
        <Semaforo />
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        </>
      )}
      {selectedValue === 'option2' && (
        <>
        <SemaforoAc />
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        </>
      )}
      {selectedValue === 'option4' && (
        <>
        <Crea />
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        </>
      )}
      {selectedValue === 'option3' && (
        <>
        <Aac />
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        </>
      )}
      {selectedValue === 'option5' && (
        <>
        <Mod />
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
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
