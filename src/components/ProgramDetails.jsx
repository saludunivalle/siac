import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '/src/styles/programDetails.css'; 
import Header from './Header';
import Seguimiento from './Seguimiento';


const ProgramDetails = () => {
    const location = useLocation();
    const rowData = location.state; 
    const { state: { globalVariable } } = location;
    const programaAcademico = rowData['programa académico'];
    const departamento = rowData['departamento'];
    const escuela = rowData['escuela'];
    const facultad = rowData['facultad'];
    const sede = rowData['sede'];
    const seccion = rowData['sección']
    const faseRRC = rowData['fase rrc'];
    const faseRAC = rowData['fase rac'];
    const fechavencrac = rowData['fechavencac'];
    const fechavencrrc = rowData['fechavencrc'];
    const navigate = useNavigate();
    const [clickedButton, setClickedButton] = useState(null);

    const [reloadSeguimiento, setReloadSeguimiento] = useState(false);
    
    useEffect(() => {
        switch (globalVariable) {
            case 'RRC':
                setClickedButton('rrc');
                break;
            case 'RAAC':
                setClickedButton('raac');
                break;
            case 'CREA':
                setClickedButton('crea');
                break;
            case 'AAC':
                setClickedButton('aac');
                break;
            case 'MOD':
                setClickedButton('mod');
                break;
            default:
                setClickedButton(null);
                break;
        }
        setReloadSeguimiento(prevState => !prevState); 
    }, [globalVariable]);
    
    useEffect(() => {

        const timeout = setTimeout(() => {
            setReloadSeguimiento(prevState => !prevState); 
        }, 0); 

        return () => clearTimeout(timeout); 
    }, [rowData]); 

    const handleButtonClick = async (buttonType) => {
        setClickedButton(buttonType);
        console.log(clickedButton);
      };

    const getProcesosRRCBackground = () => {
        if (faseRRC === 'Fase 1') {
            return '#4caf4f36';
        } else if (faseRRC === 'Fase 2') {
            return 'rgba(255, 235, 59, 0.288)';
        } else if (faseRRC === 'Fase 3') {
            return '#ff990079';
        } else if (faseRRC === 'Fase 4') {
            return '#ff562275';
        } else if (faseRRC === 'Fase 5') {
            return '#f443368e';
        } else {
            return 'rgb(241, 241, 241)'; 
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const getProcesosRACBackground = () => {
        if (faseRAC === 'Fase 1') {
            return '#4caf4f36';
        } else if (faseRAC === 'Fase 2') {
            return 'rgba(255, 235, 59, 0.288)';
        } else if (faseRAC === 'Fase 3') {
            return '#ff990079';
        } else if (faseRAC === 'Fase 4') {
            return '#ff562275';
        } else if (faseRAC === 'Fase 5') {
            return '#f443368e';
        } else {
            return 'rgb(241, 241, 241)'; 
        }
    };

    const setButtonStyles = (buttonType, isClicked) => {
        switch (buttonType) {
            case 'raac':
              return {
                backgroundColor: isClicked ? 'rgba(163, 163, 163, 0.562)' : getProcesosRACBackground(),                color: '#000',
              };
            case 'rrc':
              return {
                backgroundColor: isClicked ? 'rgba(163, 163, 163, 0.562)' : getProcesosRRCBackground(),   
              };
            case 'crea':
              return {
                backgroundColor: isClicked ? 'rgba(163, 163, 163, 0.562)' : 'rgb(241, 241, 241)',
              };
            case 'mod':
              return {
                backgroundColor: isClicked ? 'rgba(163, 163, 163, 0.562)' : 'rgb(241, 241, 241)',
              };
            case 'aac':
              return {
                backgroundColor: isClicked ? 'rgba(163, 163, 163, 0.562)' : 'rgb(241, 241, 241)',
              };
            case 'conv':
              return {
                backgroundColor: isClicked ? 'rgba(163, 163, 163, 0.562)' : 'rgb(241, 241, 241)',
              };
          
            default:
              return {}; 
          }
    };
    return (
        <>
        <Header/>
        <div className='containerTotal'>
        <div className='title-program'><h2>{programaAcademico}</h2></div>
        <div className='about-program-general'>
            <div className='about-program'><strong>Facultad: </strong>&nbsp; {facultad}</div>
            <div className='about-program'><strong>Escuela: </strong>&nbsp; {escuela}</div>
            <div className='about-program'><strong>Sede: </strong>&nbsp; {sede}</div>
            {departamento && (
                <div className='about-program'><strong>Departamento: </strong>&nbsp; {departamento}</div>
            )}
            {seccion && (
                <div className='about-program'><strong>Sección: </strong>&nbsp; {seccion}</div>
            )}
        </div>
        <div className='procesos'>
            <div className='procesosCREA' style={setButtonStyles('crea', clickedButton === 'crea')} onClick={() => handleButtonClick('crea')}> 
                <strong>CREA</strong>
            </div>
            <div className='procesosMOD' style={setButtonStyles('mod', clickedButton === 'mod')} onClick={() => handleButtonClick('mod')}> 
                <strong>MOD</strong>
            </div>
            <div className='procesosRRC' style={setButtonStyles('rrc', clickedButton === 'rrc')} onClick={() => handleButtonClick('rrc')}>
                 <strong>RRC</strong> {fechavencrrc}   
            </div>
            <div className='procesosAC' style={setButtonStyles('aac', clickedButton === 'aac')} onClick={() => handleButtonClick('aac')}>
                <strong>AAC</strong>
            </div>
            <div className='procesosRAC' style={setButtonStyles('raac', clickedButton === 'raac')} onClick={() => handleButtonClick('raac')}> 
                <strong>RAAC</strong> {fechavencrac}
            </div>
            <div className='procesosCONV' style={setButtonStyles('conv', clickedButton === 'conv')} onClick={() => handleButtonClick('conv')}>
                <strong>Docencia Servicio</strong>
            </div>
        </div>
        <Seguimiento handleButtonClick={clickedButton} key={reloadSeguimiento}  />
        {/* <pre>{JSON.stringify(rowData, null, 2)}</pre> */}
        <button onClick={handleBackClick} style={{ fontSize: '16px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '5px', border: '1px solid #666', padding: '10px 20px', cursor: 'pointer', margin: '10px 0px -15px'}}>Atras</button>
        </div>
        </>
    );
};

export default ProgramDetails;
